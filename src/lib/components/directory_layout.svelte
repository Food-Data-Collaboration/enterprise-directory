<!--
    Filters sidebar plus the map and directory, arranged by the display mode
    (see $lib/models/display_mode.ts). A view the mode cannot show is not mounted.
    Embedders can set --ed-map-height to size the map in stacked mode.
-->
<script lang="ts">
    import { onMount } from "svelte";
    import Filters from "./filters.svelte";
    import Map from "./map.svelte";
    import Directory from "./directory.svelte";
    import { getDirectoryState } from "$lib/models/state.svelte";
    import type { Responsive } from "$lib/models/display_mode";

    const userState = getDirectoryState();
    const { desktop, mobile } = $derived(userState.views);

    let mounted = $state(false);
    onMount(() => (mounted = true));

    const either = (pick: (view: typeof desktop) => boolean) =>
        mounted ? pick(userState.current) : pick(desktop) || pick(mobile);

    const both = <T,>(pick: (view: typeof desktop) => T): Responsive<T> => ({
        desktop: pick(desktop),
        mobile: pick(mobile),
    });
</script>

<main>
    <aside class:hide={!userState.showFilters}>
        <Filters />
    </aside>
    <section
        class:stacked-desktop={desktop.mode === "stacked"}
        class:stacked-mobile={mobile.mode === "stacked"}
    >
        {#if either((view) => view.showMap)}
            <Map
                hidden={both((view) => !view.mapVisible)}
                stacked={both((view) => view.mode === "stacked")}
            />
        {/if}
        {#if either((view) => view.showDirectory)}
            <Directory hidden={both((view) => !view.directoryVisible)} />
        {/if}
    </section>
</main>

<style lang="scss">
    main {
        position: relative;
        display: flex;
        flex-grow: 1;
        flex-direction: row;
        gap: $gap;

        @include web-component {
            min-height: 0;
        }

        @include from($breakpoint-medium) {
            gap: 0;
            margin: 0 calc(-1 * $gap);
        }

        section {
            display: grid;
            flex: 1;
            min-width: 0;

            @include web-component {
                min-height: 0;
                grid-template-rows: minmax(0, 1fr);
            }

            // Tabbed and single views share one cell; `hidden` decides what shows.
            > :global(*) {
                grid-area: 1 / 1;
            }

            @include responsive-class(stacked) {
                grid-template-rows: var(--ed-map-height, 45vh) auto;
                row-gap: $gap;

                > :global(*) {
                    grid-area: auto;
                }
            }
        }

        aside {
            position: fixed;
            display: flex;
            flex-shrink: 0;
            inset: 0;
            z-index: 5;
            background-color: $white;
            width: 100%;
            transition: all 200ms ease-in-out;
            content-visibility: visible;

            @include web-component {
                z-index: 3;
            }

            @include from($breakpoint-medium) {
                position: sticky;
                top: 16px;
                width: calc($sidebar-width-large + $gap);
                max-height: calc(100vh - (2 * $gap));
                margin: 0 0 0 $gap;

                @include web-component {
                    max-height: 100%;
                }
            }

            &.hide {
                transform: translateX(-100vw);
                width: 0;
                margin: 0;
                content-visibility: hidden;

                @include web-component {
                    transform: translateX(-100cqw);
                }

                @include from($breakpoint-medium) {
                    transform: translateX(-($sidebar-width-large + $gap));
                }
            }
        }
    }
</style>
