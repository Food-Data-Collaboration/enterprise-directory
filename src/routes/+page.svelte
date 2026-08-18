<script lang="ts">
    import Filters from "$lib/components/filters.svelte";
    import Map from "$lib/components/map.svelte";
    import Directory from "$lib/components/directory.svelte";
    import { getDirectoryState } from "$lib/models/state.svelte";

    const userState = getDirectoryState();
</script>

<main>
    <aside class:hide={!userState.showFilters}>
        <Filters />
    </aside>
    <section>
        <Map hidden={userState.activeTab != "Map"} />
        <Directory hidden={userState.activeTab != "Directory"} />
    </section>
</main>

<style lang="scss">
    main {
        position: relative;
        display: flex;
        flex-grow: 1;
        flex-direction: row;
        gap: $gap;

        @media screen and (min-width: $breakpoint-medium) {
            gap: 0;
            margin: 0 calc(-1 * $gap);
        }

        section {
            display: grid;
        }

        aside {
            position: fixed;
            display: flex;
            flex-shrink: 0;
            inset: 0;
            z-index: 3;
            background-color: $white;
            width: 100%;
            transition: all 200ms ease-in-out;
            content-visibility: visible;

            @media screen and (min-width: $breakpoint-medium) {
                position: sticky;
                top: 16px;
                width: calc($sidebar-width-large + $gap);
                max-height: calc(100vh - (2 * $gap));
                margin: 0 0 0 $gap;
            }

            &.hide {
                transform: translateX(-100vw);
                width: 0;
                margin: 0;
                content-visibility: hidden;

                @media screen and (min-width: $breakpoint-medium) {
                    transform: translateX(-calc(($sidebar-width-large + $gap)));
                }
            }
        }
    }
</style>
