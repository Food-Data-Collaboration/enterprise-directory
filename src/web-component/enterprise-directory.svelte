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
        props: {
            displayMode: { attribute: "display-mode", type: "String" },
            displayModeMobile: { attribute: "display-mode-mobile", type: "String" },
        },
    }}
/>

<script lang="ts">
    import Header from "$lib/components/header.svelte";
    import {
        DirectoryState,
        setDirectoryState,
    } from "$lib/models/state.svelte";
    import { onMount } from "svelte";
    import DirectoryLayout from "$lib/components/directory_layout.svelte";
    import Profile from "$lib/components/profile_enterprise.svelte";
    import { installFont, shadowStyles } from "./styles.web-component";
    import { enterpriseSource } from "$lib/data";

    // Attributes override DISPLAY_MODE / DISPLAY_MODE_MOBILE from the build env.
    let {
        displayMode,
        displayModeMobile,
    }: { displayMode?: string | null; displayModeMobile?: string | null } =
        $props();

    const userState = setDirectoryState(new DirectoryState());

    $effect(() => {
        userState.configureDisplay(displayMode, displayModeMobile);
    });

    const ENTERPRISE_PATH = /^\/organizations\/(.+)$/;

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

        userState.init(
            enterpriseSource.fetchEnterprises(),
            enterpriseSource.cached?.() ?? null,
        );

        const host = (layout.getRootNode() as ShadowRoot).host;
        const stopObserving = userState.observeContainer(host);

        layout.addEventListener("click", openProfile);
        return () => {
            stopObserving();
            layout.removeEventListener("click", openProfile);
        };
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
    <DirectoryLayout />
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

        @include web-component {
            min-height: 0;
            overflow-y: auto;
        }
    }
</style>
