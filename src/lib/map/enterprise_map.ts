import maplibregl from "maplibre-gl";
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
    bearing: number;
    pitch: number;
}

export interface EnterpriseMapOptions {
    onIdle?: () => void;
    initialView?: MapView;
    onViewChange?: (view: MapView) => void;
}

export class EnterpriseMap {
    readonly #map: maplibregl.Map;
    readonly #config: MapConfig;
    readonly #renderer: MarkerRenderer;
    readonly #clusters: EnterpriseClusters;
    readonly #markers = new Map<string, { marker: maplibregl.Marker; cleanup: () => void }>();
    #zoomLevel = Number.NaN;
    readonly #resizeObserver = new ResizeObserver(() => this.#map.resize());

    constructor(
        container: HTMLElement,
        config: MapConfig,
        renderer: MarkerRenderer,
        options: EnterpriseMapOptions = {},
    ) {
        this.#config = config;
        this.#renderer = renderer;
        this.#clusters = new EnterpriseClusters({
            radius: config.clusterRadius,
            maxZoom: config.clusterMaxZoom,
        });

        this.#map = new maplibregl.Map({
            container,
            style: config.style,
            zoom: config.zoom,
            minZoom: config.minZoom,
            maxZoom: config.maxZoom,
            bounds: config.bounds?.map(
                ({ lng, lat }) => new maplibregl.LngLat(lng, lat),
            ) as [maplibregl.LngLat, maplibregl.LngLat] | undefined,
        });

        this.#map.addControl(
            new maplibregl.GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: true,
            }),
            "bottom-right",
        );
        this.#map.addControl(
            new maplibregl.NavigationControl({ showCompass: false }),
            "bottom-right",
        );

        if (options.onIdle) this.#map.on("idle", options.onIdle);

        this.#map.on("zoom", () => {
            if (Math.floor(this.#map.getZoom()) !== this.#zoomLevel) this.#syncMarkers();
        });

        this.#map.setMaxBounds(this.#map.getBounds());
        this.#resizeObserver.observe(container);

        if (options.initialView) this.#map.jumpTo(options.initialView);
        else this.recentre();

        if (options.onViewChange) {
            const onViewChange = options.onViewChange;
            this.#map.on("moveend", () => onViewChange(this.getView()));
        }
    }

    getView(): MapView {
        const { lng, lat } = this.#map.getCenter();
        return {
            center: { lng, lat },
            zoom: this.#map.getZoom(),
            bearing: this.#map.getBearing(),
            pitch: this.#map.getPitch(),
        };
    }

    setEnterprises(enterprises: Enterprise[]): void {
        this.#clusters.load(enterprises);
        this.#clearMarkers();
        this.#syncMarkers();
    }

    recentre(): void {
        const { lng, lat } = this.#config.centre;
        this.#map.setCenter(new maplibregl.LngLat(lng, lat));
    }

    setCooperativeGestures(enabled: boolean): void {
        if (enabled) this.#map.cooperativeGestures.enable();
        else this.#map.cooperativeGestures.disable();
    }

    destroy(): void {
        this.#resizeObserver.disconnect();
        this.#clearMarkers();
        this.#map.remove();
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

    #addMarker(item: MapItem): { marker: maplibregl.Marker; cleanup: () => void } {
        if (item.kind === "enterprise") {
            const pin = this.#renderer.marker(item.enterprise);
            const popup = this.#renderer.popup(item.enterprise);
            const marker = new maplibregl.Marker({ element: pin.element })
                .setLngLat(item.lnglat)
                .setPopup(new maplibregl.Popup().setDOMContent(popup.element))
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
        const expand = () =>
            this.#map.easeTo({
                center: item.lnglat,
                zoom: Math.min(this.#clusters.expansionZoom(item.clusterId), this.#map.getMaxZoom()),
            });
        pin.element.addEventListener("click", expand);

        const marker = new maplibregl.Marker({ element: pin.element })
            .setLngLat(item.lnglat)
            .addTo(this.#map);

        return {
            marker,
            cleanup: () => {
                pin.element.removeEventListener("click", expand);
                pin.destroy();
            },
        };
    }

    #clearMarkers(): void {
        for (const { marker, cleanup } of this.#markers.values()) {
            marker.remove();
            cleanup();
        }
        this.#markers.clear();
    }
}
