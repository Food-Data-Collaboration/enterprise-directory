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

    let { hidden }: { hidden: boolean } = $props();
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
    };

    onMount(() => {
        let destroyed = false;

        import("maplibre-gl/dist/maplibre-gl.css").then(() => {
            if (destroyed) return;

            map = new EnterpriseMap(container, parseMapConfig(env), renderer, {
                onIdle: () => (isLoading = false),
            });
        });

        return () => {
            destroyed = true;
            map?.destroy();
            map = null;
        };
    });

    $effect(() => {
        map?.setEnterprises(userState.enterprises);
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
