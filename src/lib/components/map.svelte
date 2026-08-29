<script lang="ts">
    import maplibregl from "maplibre-gl";
    import { mount, onMount } from "svelte";
    import MapMarker from "./ui/map_pin.svelte";
    import { getDirectoryState } from "$lib/models/state.svelte";
    import { MapPin } from "@lucide/svelte";
    import { Enterprise } from "$lib/models/enterprise";
    import CardEnterprise from "./ui/card_enterprise.svelte";
    import { fade } from "svelte/transition";
    import { analytics } from "$lib/analytics";

    let { hidden }: { hidden: boolean } = $props();
    let isLoading: boolean = $state(true);
    let map: maplibregl.Map;
    let container: HTMLDivElement;
    let markers: maplibregl.Marker[] = [];

    const userState = getDirectoryState();

    onMount(async () => {
        await import("maplibre-gl/dist/maplibre-gl.css");
        map = new maplibregl.Map({
            // The element, not its id: maplibre resolves a string container with
            // document.getElementById, which cannot see inside the web component's
            // shadow root.
            container,
            style: "https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/openStreetMap.json",
            zoom: 5,
        });

        map.on("idle", () => {
            isLoading = false;
        });
        const centre = markers[0]?._lngLat ?? { lng: -3, lat: 55 };
        map.setCenter(centre);
    });

    $effect(() => {
        userState.enterprises
            .filter(
                (enterprise: Enterprise) =>
                    enterprise.addresses.length > 0 &&
                    enterprise.addresses[0].lnglat != null,
            )
            .forEach((enterprise: Enterprise) => {
                let customMarker = document.createElement("span");
                mount(MapMarker, {
                    target: customMarker,
                    props: { image: enterprise.images[0] },
                });

                let popupElement = document.createElement("div");
                mount(CardEnterprise, {
                    target: popupElement,
                    props: {
                        enterprise: enterprise,
                    },
                });

                let popup = new maplibregl.Popup().setDOMContent(popupElement);

                customMarker.addEventListener("focus", () => {
                    map.flyTo({
                        center: enterprise.addresses[0].lnglat!,
                        zoom: 5,
                        speed: 5,
                        freezeElevation: false,
                        essential: false,
                    });
                    analytics.track("enterprise_map_marker_selected");
                });
                customMarker.addEventListener("click", () => {
                    map.flyTo({
                        center: enterprise.addresses[0].lnglat!,
                        zoom: 13,
                        speed: 1,
                        freezeElevation: false,
                        essential: false,
                    });
                    analytics.track("enterprise_map_marker_selected");
                });

                let Marker: maplibregl.Marker = new maplibregl.Marker({
                    element: customMarker,
                })
                    .setLngLat(enterprise.addresses[0].lnglat!)
                    .setPopup(popup)
                    .addTo(map);

                markers.push(Marker);
            });

        if (map) {
            const centre = markers[0]?._lngLat ?? { lng: -3, lat: 55 };
            map.setCenter(centre);
        }
    });
</script>

<article
    id="map-view"
    class:hidden
    class:stack={!userState.isTabbed}
    transition:fade
>
    <div id="map" bind:this={container} class={isLoading ? "invisible" : ""}></div>
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

        // A floor worth having on a page we own, but embedded it would push us past the
        // bottom of whatever box the host gave us.
        @include standalone {
            min-height: 60vh;
        }
        @include embedded {
            min-height: 0;
        }
        grid-area: 1 / 1;
        z-index: 0;
        opacity: 1;
        transition: opacity 400ms cubic-bezier(0.34, 1.56, 0.64, 1);

        &.hidden {
            z-index: -1;
            opacity: 0;
        }

        #map {
            position: fixed;
            inset: 0 (-$gap);
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
