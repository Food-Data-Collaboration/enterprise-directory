import maplibregl from "maplibre-gl";
import type { Enterprise } from "$lib/models/enterprise";
import { mappableEnterprises, type MapConfig } from "./config";

export interface RenderedElement {
    element: HTMLElement;
    destroy(): void;
}

export interface MarkerRenderer {
    marker(enterprise: Enterprise): RenderedElement;
    popup(enterprise: Enterprise): RenderedElement;
}

export interface EnterpriseMapOptions {
    onIdle?: () => void;
}

export class EnterpriseMap {
    readonly #map: maplibregl.Map;
    readonly #config: MapConfig;
    readonly #renderer: MarkerRenderer;
    #markers: maplibregl.Marker[] = [];
    #rendered: RenderedElement[] = [];

    constructor(
        container: HTMLElement,
        config: MapConfig,
        renderer: MarkerRenderer,
        options: EnterpriseMapOptions = {},
    ) {
        this.#config = config;
        this.#renderer = renderer;

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

        this.#map.setMaxBounds(this.#map.getBounds());
        this.recentre();
    }

    setEnterprises(enterprises: Enterprise[]): void {
        this.#clearMarkers();

        for (const { enterprise, lnglat } of mappableEnterprises(enterprises)) {
            const marker = this.#renderer.marker(enterprise);
            const popup = this.#renderer.popup(enterprise);
            this.#rendered.push(marker, popup);

            this.#markers.push(
                new maplibregl.Marker({ element: marker.element })
                    .setLngLat(lnglat)
                    .setPopup(new maplibregl.Popup().setDOMContent(popup.element))
                    .addTo(this.#map),
            );
        }

        this.recentre();
    }

    recentre(): void {
        const { lng, lat } = this.#config.centre;
        this.#map.setCenter(new maplibregl.LngLat(lng, lat));
    }

    resize(): void {
        this.#map.resize();
    }

    destroy(): void {
        this.#clearMarkers();
        this.#map.remove();
    }

    #clearMarkers(): void {
        this.#markers.forEach((marker) => marker.remove());
        this.#rendered.forEach((rendered) => rendered.destroy());
        this.#markers = [];
        this.#rendered = [];
    }
}
