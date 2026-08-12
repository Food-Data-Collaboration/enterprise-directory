<script lang="ts">
    import "@fontsource-variable/inter";
    import "$lib/styles/reset.scss";
    import { Enterprise } from "$lib/models/enterprise";
    import Filters from "$lib/components/filters.svelte";
    import Map from "$lib/components/map.svelte";
    import Directory from "$lib/components/directory.svelte";
    import Header from "$lib/components/header.svelte";
    import { userState } from "$lib/models/state.svelte";
    import Profile from "$lib/components/profile.svelte";

    let i = 20;
    while (i > 0) {
        userState.enterprises.push(new Enterprise());
        i--;
    }

    // DEBUG OPTIONS
    let showMap = $state(true);
    let showDirectory = $state(true);
    // END DEBUG OPTIONS

    $effect(() => {
        console.log(userState.selectedEnterprise);
        if (userState.isTabbed) {
            if (userState.activeTab == "Map") {
                showMap = true;
                showDirectory = false;
            } else {
                showMap = false;
                showDirectory = true;
            }
        }
    });
</script>

<div id="layout">
    <Header />

    <main>
        {#if userState.showFilters}
            <aside id="sidebar-left" class:hide={!userState.showFilters}>
                <Filters />
            </aside>
        {/if}
        <section>
            <Map hidden={!showMap} />
            <Directory hidden={!showDirectory} />
        </section>
    </main>

    {#if userState.selectedEnterprise != undefined}
        <section id="sidebar-right">
            <Profile enterprise={userState.selectedEnterprise} />
        </section>
    {/if}
</div>

<style lang="scss">
    #layout {
        display: flex;
        flex-direction: column;
        margin: 0 $gap;
        gap: $gap;
        min-height: 100vh;
    }

    main {
        position: relative;
        flex-grow: 1;
        display: flex;
        flex-direction: row;
        gap: $gap;

        aside {
            position: fixed;
            display: flex;
            inset: 0;
            z-index: 3;
            border-radius: 30px;
            background-color: $white;
            flex-shrink: 0;
        }

        @media screen and (min-width: $breakpoint-medium) {
            grid-template-areas: "header" "content";
            gap: 0;
            margin: 0 calc(-1 * $gap);

            aside {
                position: sticky;
                top: 0;
                // width: calc($sidebar-width-large + $gap);
                border-radius: 0;
                max-height: 100vh;
            }
        }
    }
</style>
