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
    import {
        installFont,
        shadowStyles,
    } from "./styles.web-component";

    const userState = setDirectoryState(new DirectoryState());

    const ENTERPRISE_PATH = /^\/enterprises\/(.+)$/;

    let layout: HTMLDivElement;

    /**
     * Opens the profile in place rather than following the link.
     *
     * The cards are shared with the SvelteKit app, where they are real links to
     * /enterprises/[id] — a path that means nothing on whatever page the element is
     * embedded in. Intercepting the click here, the way a client-side router does,
     * keeps the cards untouched. It also reaches the card map.svelte mounts
     * imperatively into a maplibre popup, which sits outside the context tree and so
     * could not be given a callback prop.
     */
    function openProfile(event: MouseEvent) {
        const target = event.target as Element | null;
        const href = target?.closest("a[href]")?.getAttribute("href");
        const profileId = href?.match(ENTERPRISE_PATH)?.[1];
        if (!profileId) return;

        const enterprise = userState.enterprises.find(
            (candidate) => candidate.profileId === profileId,
        );
        if (!enterprise) return;

        // Intercept modifier-clicks too: there is no page at the other end to open.
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
    // Custom elements are display: inline until told otherwise, which leaves #layout
    // unable to size itself.
    :host {
        display: block;

        // Confines the component's `position: fixed` layers — the map, its loading
        // overlay, the profile takeover and the mobile filters panel — to the element
        // instead of the host page's viewport. Paint containment makes :host their
        // containing block, so `inset: 0` resolves against the element's box, and clips
        // painting to that box, so the map's `inset: 0 (-$gap)` bleed and the hidden
        // aside's `translateX(-100vw)` cannot spill onto the host page.
        //
        // This lives here rather than in the components themselves because they are
        // shared with the SvelteKit app, where fixed-to-the-viewport is the intended
        // behaviour. Nothing in src/routes imports this file, so the app is unaffected.
        contain: paint;
    }

    #layout {
        position: relative;
        display: flex;
        flex-direction: column;
        margin: $gap;
        gap: $gap;
        min-height: calc(100vh - (2 * $gap));
    }

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
