<!--
    customElement is enabled in vite.web-component.config.ts, not svelte.config.js: the
    app must not compile with it, or its CSS stops being extractable and first paint
    arrives unstyled. svelte-check reads svelte.config.js and so cannot see that it is
    switched on for this build — package.json silences the resulting warning.
-->
<svelte:options
    customElement={{
        tag: "enterprise-directory",
        shadow: "open",
    }}
/>

<script lang="ts">
    import Header from "$lib/components/header.svelte";
    import {
        DirectoryState,
        setDirectoryState,
    } from "$lib/models/state.svelte";
    import { onMount } from "svelte";
    import { DATA_HOST } from "$app/env/public";
    import Filters from "$lib/components/filters.svelte";
    import Directory from "$lib/components/directory.svelte";
    import Map from "$lib/components/map.svelte";
    import Profile from "$lib/components/profile.svelte";
    import { installFont, shadowStyles } from "./styles.web-component";

    const userState = setDirectoryState(new DirectoryState());

    const ENTERPRISE_PATH = /^\/enterprises\/(.+)$/;

    let layout: HTMLDivElement;

    function openProfile(event: MouseEvent) {
        const target = event.target as Element | null;
        const href = target?.closest("a[href]")?.getAttribute("href");
        const profileId = href?.match(ENTERPRISE_PATH)?.[1];
        if (!profileId) return;

        const enterprise = userState.enterprises.find(
            (candidate) => candidate.profileId === profileId,
        );
        if (!enterprise) return;

        event.preventDefault();
        userState.selectedEnterprise = enterprise;
    }

    onMount(() => {
        installFont();

        const enterprisePromise = fetch(`${DATA_HOST}/enterprises/`);
        userState.init(enterprisePromise);

        layout.addEventListener("click", openProfile);
        return () => layout.removeEventListener("click", openProfile);
    });
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time CSS, not user input -->
{@html `<style>${shadowStyles}</style>`}

<div id="layout" bind:this={layout}>
    <Header />
    {#if userState.selectedEnterprise}
        <Profile
            enterprise={userState.selectedEnterprise}
            onback={() => (userState.selectedEnterprise = null)}
        />
    {/if}
    <main>
        <aside class:hide={!userState.showFilters}>
            <Filters />
        </aside>
        <section>
            <Map hidden={userState.activeTab != "Map"} />
            <Directory hidden={userState.activeTab != "Directory"} />
        </section>
    </main>
</div>

<style lang="scss">
    :host {
        display: block;
        contain: paint;
        container: enterprise-directory / inline-size;
        height: 100%;
        box-sizing: border-box;
    }

    #layout {
        position: relative;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        height: 100%;
        padding: $gap;
        gap: $gap;
    }

    main {
        position: relative;
        display: flex;
        flex-grow: 1;
        flex-direction: row;
        gap: $gap;
        min-height: 0;

        @include from($breakpoint-medium) {
            gap: 0;
            margin: 0 calc(-1 * $gap);
        }

        section {
            display: grid;
            min-height: 0;
            grid-template-rows: minmax(0, 1fr);
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

            @include from($breakpoint-medium) {
                position: sticky;
                top: 16px;
                width: calc($sidebar-width-large + $gap);
                max-height: 100%;
                margin: 0 0 0 $gap;
            }

            &.hide {
                transform: translateX(-100cqw);
                width: 0;
                margin: 0;
                content-visibility: hidden;

                @include from($breakpoint-medium) {
                    transform: translateX(-($sidebar-width-large + $gap));
                }
            }
        }
    }
</style>
