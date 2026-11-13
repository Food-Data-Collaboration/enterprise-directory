<script lang="ts">
    import { mount, onMount, unmount, type Component } from "svelte";
    import MapMarker from "./ui/map_pin.svelte";
    import { getDirectoryState } from "$lib/models/state.svelte";
    import { MapPin } from "@lucide/svelte";
    import CardEnterprise from "./ui/card_enterprise.svelte";
    import * as env from "$app/env/public";
    import { parseMapConfig } from "$lib/map/config";
    import {
        EnterpriseMap,
        type MarkerRenderer,
        type RenderedElement,
    } from "$lib/map/enterprise_map";
    import type { Responsive } from "$lib/models/display_mode";

    let {
        hidden,
        stacked,
    }: { hidden: Responsive<boolean>; stacked: Responsive<boolean> } = $props();
    let isLoading: boolean = $state(true);
    let map: EnterpriseMap | null = $state.raw(null);
    let container: HTMLDivElement;

    const userState = getDirectoryState();

    function render<Props extends Record<string, unknown>>(
        tag: string,
        component: Component<Props>,
        props: Props,
    ): RenderedElement {
        const element = document.createElement(tag);
        const instance = mount(component, { target: element, props });
        return { element, destroy: () => unmount(instance) };
    }

    const renderer: MarkerRenderer = {
        marker: (enterprise) =>
            render("span", MapMarker, { image: enterprise.logoUrl }),
        popup: (enterprise) => render("div", CardEnterprise, { enterprise }),
        cluster: (count) => render("span", MapMarker, { count }),
    };

    onMount(() => {
        let destroyed = false;

        import("maplibre-gl/dist/maplibre-gl.css").then(() => {
            if (destroyed) return;

            map = new EnterpriseMap(container, parseMapConfig(env), renderer, {
                onIdle: () => (isLoading = false),
                initialView: userState.mapView ?? undefined,
                onViewChange: (view) => (userState.mapView = view),
            });
        });

        return () => {
            destroyed = true;
            if (map) userState.mapView = map.getView();
            map?.destroy();
            map = null;
        };
    });

    $effect(() => {
        map?.setEnterprises(userState.enterprises);
    });

    $effect(() => {
        map?.setCooperativeGestures(userState.mode === "stacked");
    });
</script>

<article
    id="map-view"
    class:hidden-desktop={hidden.desktop}
    class:hidden-mobile={hidden.mobile}
    class:stack-desktop={stacked.desktop}
    class:stack-mobile={stacked.mobile}
>
    <div
        id="map"
        bind:this={container}
        class:invisible={isLoading}
    ></div>
    {#if isLoading}
        <div class="loading">
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
        z-index: 0;
        opacity: 1;

        @include web-app {
            min-height: 60vh;
        }

        @include web-component {
            min-height: 0;
        }

        @include responsive-class(hidden) {
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

        .loading {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        @include responsive-class(stack) {
            // The layout's grid row sets the height in stacked mode.
            min-height: 0;

            .loading {
                position: absolute;
            }

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
