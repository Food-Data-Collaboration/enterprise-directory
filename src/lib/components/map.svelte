<script lang="ts">
    import maplibregl from "maplibre-gl";
    import { mount, onMount, unmount } from "svelte";
    import MapMarker from "./ui/map_pin.svelte";
    import { getDirectoryState } from "$lib/models/state.svelte";
    import { MapPin } from "@lucide/svelte";
    import { Enterprise } from "$lib/models/enterprise";
    import CardEnterprise from "./ui/card_enterprise.svelte";
    import {
        DEFAULT_MAP_CENTRE_LNG,
        DEFAULT_MAP_CENTRE_LAT,
    } from "$app/env/public";

    let { hidden }: { hidden: boolean } = $props();
    let isLoading: boolean = $state(true);
    let map: maplibregl.Map | null = $state(null);
    let container: HTMLDivElement;

    const userState = getDirectoryState();

    onMount(async () => {
        await import("maplibre-gl/dist/maplibre-gl.css");
        map = new maplibregl.Map({
            container,
            style: "https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/openStreetMap.json",
            zoom: 5,
            minZoom: 5,
        });
        const geolocate = new maplibregl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true,
            },
            trackUserLocation: true,
        });

        map.addControl(geolocate, "bottom-right");
        let nav = new maplibregl.NavigationControl({ showCompass: false });
        map.addControl(nav, "bottom-right");

        map.on("idle", () => {
            isLoading = false;
        });

        const centre = new maplibregl.LngLat(
            Number.parseFloat(DEFAULT_MAP_CENTRE_LNG),
            Number.parseFloat(DEFAULT_MAP_CENTRE_LAT),
        );
        map.setCenter(centre);
    });

    $effect(() => {
        if (map == null) return;

        const markers: maplibregl.Marker[] = [];
        const components: ReturnType<typeof mount>[] = [];

        userState.enterprises
            .filter(
                (enterprise: Enterprise) =>
                    enterprise.addresses.length > 0 &&
                    enterprise.addresses[0].lnglat != null,
            )
            .forEach((enterprise: Enterprise) => {
                let customMarker = document.createElement("span");
                components.push(
                    mount(MapMarker, {
                        target: customMarker,
                        props: { image: enterprise.logoUrl },
                    }),
                );

                let popupElement = document.createElement("div");
                components.push(
                    mount(CardEnterprise, {
                        target: popupElement,
                        props: {
                            enterprise: enterprise,
                        },
                    }),
                );

                let popup = new maplibregl.Popup().setDOMContent(popupElement);
                let Marker: maplibregl.Marker = new maplibregl.Marker({
                    element: customMarker,
                })
                    .setLngLat(enterprise.addresses[0].lnglat!)
                    .setPopup(popup)
                    .addTo(map!);

                markers.push(Marker);
            });

        const centre = new maplibregl.LngLat(
            Number.parseFloat(DEFAULT_MAP_CENTRE_LNG),
            Number.parseFloat(DEFAULT_MAP_CENTRE_LAT),
        );
        map.setCenter(centre);

        return () => {
            markers.forEach((marker) => marker.remove());
            components.forEach((component) => unmount(component));
        };
    });

    $effect(() => {
        if (!hidden) map?.resize();
    });
</script>

<article id="map-view" class:hidden class:stack={!userState.isTabbed}>
    <div
        id="map"
        bind:this={container}
        class={isLoading ? "invisible" : ""}
    ></div>
    {#if isLoading}
        <div
            style="position:fixed; inset: 0; display:flex; align-items: center; justify-content: center;"
        >
            <MapPin />
            Loading map...
        </div>
    {/if}
</article>

<style lang="scss">
    article {
        position: relative;
        display: flex;
        flex: 1;
        width: 100%;
        grid-area: 1 / 1;
        z-index: 0;
        opacity: 1;

        @include web-app {
            min-height: 60vh;
        }

        @include web-component {
            min-height: 0;
        }

        &.hidden {
            z-index: -1;
            opacity: 0;
            visibility: hidden;
        }

        #map {
            position: fixed;
            inset: 0;
            z-index: 0;
            opacity: 1;
            transition: opacity 800ms ease-in-out;

            &.invisible {
                opacity: 0;
            }

            @include from($breakpoint-medium) {
                inset: 0 0 0 (-$gap);
            }
        }

        &.stack {
            #map {
                position: relative;
                width: 100%;
                @include from($breakpoint-medium) {
                    inset: 0;
                }
            }
        }
    }
</style>
