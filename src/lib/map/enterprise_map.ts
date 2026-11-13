import * as L from "leaflet";
// Loads with this module. The web component aliases it to an empty module and puts
// Leaflet's CSS in its shadow root instead (styles.web-component.ts).
import "leaflet/dist/leaflet.css";
import type { Enterprise } from "$lib/models/enterprise";
import type { LngLat, MapConfig } from "./config";
import { EnterpriseClusters, type MapItem } from "./clusters";

export interface RenderedElement {
    element: HTMLElement;
    destroy(): void;
}

export interface MarkerRenderer {
    marker(enterprise: Enterprise): RenderedElement;
    popup(enterprise: Enterprise): RenderedElement;
    cluster(count: number): RenderedElement;
}

export interface MapView {
    center: LngLat;
    zoom: number;
}

export interface EnterpriseMapOptions {
    /** Called once the first tiles have loaded (or failed to), to reveal the map. */
    onIdle?: () => void;
    initialView?: MapView;
    onViewChange?: (view: MapView) => void;
}

interface PlacedMarker {
    marker: L.Marker;
    cleanup: () => void;
}

const toLatLng = ({ lng, lat }: LngLat): L.LatLngTuple => [lat, lng];

const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);
/** A ctrl/⌘ + wheel delta of this many pixels zooms one level (a mouse notch is ~100). */
const WHEEL_PIXELS_PER_ZOOM = 100;

export class EnterpriseMap {
    readonly #map: L.Map;
    readonly #container: HTMLElement;
    readonly #config: MapConfig;
    readonly #renderer: MarkerRenderer;
    readonly #clusters: EnterpriseClusters;
    readonly #markers = new Map<string, PlacedMarker>();
    readonly #hint = document.createElement("div");
    #zoomLevel = Number.NaN;
    #cooperative = false;
    #wheelDelta = 0;
    #hintTimer: ReturnType<typeof setTimeout> | undefined;
    // Leaflet only tracks window resizes; layout changes resize the container alone.
    readonly #resizeObserver = new ResizeObserver(() => this.#map.invalidateSize());

    constructor(
        container: HTMLElement,
        config: MapConfig,
        renderer: MarkerRenderer,
        options: EnterpriseMapOptions = {},
    ) {
        this.#container = container;
        this.#config = config;
        this.#renderer = renderer;
        this.#clusters = new EnterpriseClusters({
            radius: config.clusterRadius,
            maxZoom: config.clusterMaxZoom,
        });

        this.#map = L.map(container, {
            // Raster tiles render crisply, and without seams between them, only at whole
            // zoom levels, so a fractional minimum (e.g. MAP_ZOOM_MIN=4.5) rounds up.
            minZoom: config.minZoom === undefined ? undefined : Math.ceil(config.minZoom),
            maxZoom: config.maxZoom ?? config.tiles.maxZoom,
            zoomSnap: 1,
            zoomControl: false,
            attributionControl: false,
        });

        L.control
            .attribution({ prefix: '<a href="https://leafletjs.com">Leaflet</a>', position: "bottomright" })
            .addTo(this.#map);
        L.control.zoom({ position: "bottomright" }).addTo(this.#map);
        this.#locateControl().addTo(this.#map);

        const tiles = L.tileLayer(config.tiles.url, {
            attribution: config.tiles.attribution,
            maxZoom: config.tiles.maxZoom,
        });
        if (options.onIdle) {
            const onIdle = options.onIdle;
            let called = false;
            const reveal = () => {
                if (called) return;
                called = true;
                onIdle();
            };
            tiles.once("load", reveal);
            // Tiles can fail (offline, blocked); show the map and markers regardless.
            setTimeout(reveal, 5000);
        }
        tiles.addTo(this.#map);

        // Frame the configured bounds and limit panning to them. Whole zoom levels can't
        // fit the box exactly, so use the nearest one to the exact fit: at most a sliver
        // of the box starts off-screen (and can be panned to), rather than always
        // rounding down and showing far more than it.
        if (config.bounds) {
            const bounds = L.latLngBounds(config.bounds.map(toLatLng));
            this.#map.setView(bounds.getCenter(), Math.round(this.#exactBoundsZoom(bounds)), {
                animate: false,
            });
            this.#map.setMaxBounds(bounds);
        } else {
            this.#map.setView(toLatLng(config.centre), config.zoom ?? 5, { animate: false });
            this.#map.setMaxBounds(this.#map.getBounds());
        }

        if (options.initialView)
            this.#map.setView(toLatLng(options.initialView.center), options.initialView.zoom, {
                animate: false,
            });
        else this.recentre();

        this.#map.on("zoomend", () => {
            if (Math.floor(this.#map.getZoom()) !== this.#zoomLevel) this.#syncMarkers();
        });

        if (options.onViewChange) {
            const onViewChange = options.onViewChange;
            this.#map.on("moveend", () => onViewChange(this.getView()));
        }

        this.#hint.className = "enterprise-map-gesture-hint";
        container.append(this.#hint);
        this.#resizeObserver.observe(container);
    }

    getView(): MapView {
        const { lng, lat } = this.#map.getCenter();
        return { center: { lng, lat }, zoom: this.#map.getZoom() };
    }

    setEnterprises(enterprises: Enterprise[]): void {
        this.#clusters.load(enterprises);
        this.#clearMarkers();
        this.#syncMarkers();
    }

    recentre(): void {
        this.#map.setView(toLatLng(this.#config.centre), this.#map.getZoom(), { animate: false });
    }

    /**
     * For maps embedded in a scrolling page: one finger (touch) and a plain wheel scroll
     * the page; two fingers pan and pinch, ctrl/⌘ + wheel zooms. Mouse dragging stays.
     */
    setCooperativeGestures(enabled: boolean): void {
        if (enabled === this.#cooperative) return;
        this.#cooperative = enabled;

        const touchFirst = matchMedia("(hover: none) and (pointer: coarse)").matches;

        if (enabled) {
            this.#map.scrollWheelZoom.disable();
            if (touchFirst) this.#map.dragging.disable();
            this.#container.addEventListener("wheel", this.#onWheel, { passive: false });
            this.#container.addEventListener("touchmove", this.#onTouchMove, { passive: true });
        } else {
            this.#map.scrollWheelZoom.enable();
            this.#map.dragging.enable();
            this.#container.removeEventListener("wheel", this.#onWheel);
            this.#container.removeEventListener("touchmove", this.#onTouchMove);
        }
    }

    destroy(): void {
        clearTimeout(this.#hintTimer);
        this.setCooperativeGestures(false);
        this.#resizeObserver.disconnect();
        this.#clearMarkers();
        this.#map.remove();
        this.#hint.remove();
    }

    /** The fractional zoom that exactly fits `bounds`; getBoundsZoom snaps unless zoomSnap is 0. */
    #exactBoundsZoom(bounds: L.LatLngBounds): number {
        const { zoomSnap } = this.#map.options;
        this.#map.options.zoomSnap = 0;
        try {
            return this.#map.getBoundsZoom(bounds);
        } finally {
            this.#map.options.zoomSnap = zoomSnap;
        }
    }

    #onWheel = (event: WheelEvent): void => {
        if (!event.ctrlKey && !event.metaKey) {
            this.#showHint(`Use ${IS_MAC ? "⌘" : "Ctrl"} + scroll to zoom the map`);
            return;
        }

        event.preventDefault();
        // Trackpad pinches arrive as many small ctrl+wheel events; accumulate them
        // until they add up to a whole zoom step.
        this.#wheelDelta += event.deltaY;
        const levels = -this.#wheelDelta / WHEEL_PIXELS_PER_ZOOM;
        const snap = this.#map.options.zoomSnap ?? 1;
        if (Math.abs(levels) < snap) return;

        this.#wheelDelta = 0;
        this.#map.setZoomAround(
            this.#map.mouseEventToContainerPoint(event),
            this.#map.getZoom() + levels,
        );
    };

    #onTouchMove = (event: TouchEvent): void => {
        if (event.touches.length === 1 && !this.#map.dragging.enabled())
            this.#showHint("Use two fingers to move the map");
    };

    #showHint(text: string): void {
        this.#hint.textContent = text;
        this.#hint.classList.add("visible");
        clearTimeout(this.#hintTimer);
        this.#hintTimer = setTimeout(() => this.#hint.classList.remove("visible"), 1500);
    }

    #locateControl(): L.Control {
        const map = this.#map;
        let position: L.LayerGroup | null = null;

        const control = new L.Control({ position: "bottomright" });
        control.onAdd = () => {
            const bar = L.DomUtil.create("div", "leaflet-bar");
            const button = L.DomUtil.create("a", "enterprise-map-locate", bar);
            button.href = "#";
            button.role = "button";
            button.title = "Show my location";
            button.setAttribute("aria-label", "Show my location");
            button.innerHTML =
                '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>';

            L.DomEvent.disableClickPropagation(bar);
            L.DomEvent.on(button, "click", (event) => {
                L.DomEvent.preventDefault(event);
                map.locate({ setView: true, maxZoom: 14, enableHighAccuracy: true });
            });
            return bar;
        };

        map.on("locationfound", ({ latlng, accuracy }: L.LocationEvent) => {
            position?.remove();
            position = L.layerGroup([
                L.circle(latlng, { radius: accuracy, weight: 1, fillOpacity: 0.1 }),
                L.circleMarker(latlng, { radius: 6, weight: 2, color: "#fff", fillColor: "#007AFF", fillOpacity: 1 }),
            ]).addTo(map);
        });

        return control;
    }

    #syncMarkers(): void {
        this.#zoomLevel = Math.floor(this.#map.getZoom());
        const items = this.#clusters.itemsAt(this.#zoomLevel);
        const keys = new Set(items.map((item) => item.key));

        for (const [key, entry] of this.#markers) {
            if (keys.has(key)) continue;
            entry.marker.remove();
            entry.cleanup();
            this.#markers.delete(key);
        }

        for (const item of items) {
            if (!this.#markers.has(item.key)) this.#markers.set(item.key, this.#addMarker(item));
        }
    }

    /** A zero-size icon at the point, with the element centred on it (as maplibre did). */
    #icon(element: HTMLElement): L.DivIcon {
        Object.assign(element.style, {
            position: "absolute",
            left: "0",
            top: "0",
            // The icon box is 0×0; without this the element would shrink to nothing.
            width: "max-content",
            transform: "translate(-50%, -50%)",
        });
        return L.divIcon({ html: element, className: "enterprise-map-marker", iconSize: [0, 0] });
    }

    #addMarker(item: MapItem): PlacedMarker {
        if (item.kind === "enterprise") {
            const pin = this.#renderer.marker(item.enterprise);
            const popup = this.#renderer.popup(item.enterprise);
            const marker = L.marker(toLatLng(item.lnglat), {
                icon: this.#icon(pin.element),
                // Leaflet makes markers focusable buttons; this is their accessible name.
                title: item.enterprise.name,
            })
                // Open above the pin's head rather than over it (the pin is ~64px tall).
                .bindPopup(popup.element, { maxWidth: 320, offset: [0, -58] })
                .addTo(this.#map);

            return {
                marker,
                cleanup: () => {
                    pin.destroy();
                    popup.destroy();
                },
            };
        }

        const pin = this.#renderer.cluster(item.count);
        const marker = L.marker(toLatLng(item.lnglat), {
            icon: this.#icon(pin.element),
            title: `${item.count} enterprises: zoom in`,
        })
            .on("click", () =>
                this.#map.setView(
                    toLatLng(item.lnglat),
                    Math.min(this.#clusters.expansionZoom(item.clusterId), this.#map.getMaxZoom()),
                ),
            )
            .addTo(this.#map);

        return { marker, cleanup: () => pin.destroy() };
    }

    #clearMarkers(): void {
        for (const { marker, cleanup } of this.#markers.values()) {
            marker.remove();
            cleanup();
        }
        this.#markers.clear();
    }
}
