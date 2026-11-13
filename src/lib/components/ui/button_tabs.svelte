<script lang="ts">
    import { getDirectoryState } from "$lib/models/state.svelte";
    import { Grip, MapPin } from "@lucide/svelte";
    import { analytics } from "$lib/analytics";
    import type { Tabs } from "$lib/models/tabs";

    interface TabOption {
        id: string;
        label: string;
        title: string;
        icon: typeof MapPin;
    }

    const userState = getDirectoryState();

    const options: Record<Tabs, TabOption> = {
        Map: {
            id: "map_tab",
            label: "Map view",
            title: "Show map",
            icon: MapPin,
        },
        Directory: {
            id: "directory_tab",
            label: "Organisations",
            title: "Show organisations",
            icon: Grip,
        },
        Product: {
            id: "product_tab",
            label: "Products",
            title: "Show products",
            icon: Grip,
        },
    };

    const { desktop, mobile } = $derived(userState.views);
    const allTabs = $derived(
        (Object.keys(options) as Tabs[]).filter(
            (tab) => desktop.tabs.includes(tab) || mobile.tabs.includes(tab),
        ),
    );

    function changeView(view: Tabs) {
        userState.activeTab = view;
        analytics.track("directory_view_changed", { view });
    }
</script>

{#if allTabs.length > 0}
    <div
        class="button-group"
        class:hidden-desktop={desktop.tabs.length === 0}
        class:hidden-mobile={mobile.tabs.length === 0}
        role="radiogroup"
        style:--count-desktop={desktop.tabs.length}
        style:--count-mobile={mobile.tabs.length}
        style:--index-desktop={Math.max(
            desktop.tabs.indexOf(desktop.visibleTab),
            0,
        )}
        style:--index-mobile={Math.max(
            mobile.tabs.indexOf(mobile.visibleTab),
            0,
        )}
    >
        <div class="selection-pill" aria-hidden="true"></div>

        {#each allTabs as tab (tab)}
            {@const option = options[tab]}
            {@const hiddenDesktop = !desktop.tabs.includes(tab)}
            {@const hiddenMobile = !mobile.tabs.includes(tab)}
            <input
                type="radio"
                id={option.id}
                name="tabs"
                value={tab}
                class:hidden-desktop={hiddenDesktop}
                class:hidden-mobile={hiddenMobile}
                checked={userState.visibleTab === tab}
                onchange={() => changeView(tab)}
            />
            <label
                for={option.id}
                title={option.title}
                class:hidden-desktop={hiddenDesktop}
                class:hidden-mobile={hiddenMobile}
            >
                <option.icon size="18" />
                <span class="label">{option.label}</span>
            </label>
        {/each}
    </div>
{/if}

<style lang="scss">
    $tab-height: 40px;
    $group-padding: 4px;

    .button-group {
        position: relative;
        display: inline-grid;
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
        isolation: isolate;
        background-color: $white;
        padding: $group-padding;
        border-radius: $radius-full;
        user-select: none;
        width: fit-content;
        box-shadow: $drop-shadow;

        --count: var(--count-desktop);
        --index: var(--index-desktop);

        @include until($breakpoint-medium) {
            --count: var(--count-mobile);
            --index: var(--index-mobile);
        }

        &:has(:focus-visible) {
            outline: 2px solid $black;
        }
    }

    .button-group,
    input[type="radio"],
    input[type="radio"] + label {
        @include responsive-class(hidden) {
            display: none;
        }
    }

    .selection-pill {
        position: absolute;
        top: $group-padding;
        bottom: $group-padding;
        left: $group-padding;
        width: calc((100% - #{$group-padding * 2}) / var(--count));
        transform: translateX(calc(var(--index) * 100%));
        background-color: $black;
        border-radius: $radius-full;
        z-index: 1;
        transition: transform 300ms cubic-bezier(0.65, 0, 0.35, 1);

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
    }

    input[type="radio"] {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;

        & + label {
            position: relative;
            display: inline-flex;
            gap: $gap-xxsmall;
            align-items: center;
            justify-content: center;
            height: $tab-height;
            padding: 0 16px;
            white-space: nowrap;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            z-index: 2;
            // Light text with `difference` renders dark over the white group
            // and light over the black marker, so the colour swap tracks the
            // marker exactly while it slides (no white-on-white mid-animation).
            color: $white;
            mix-blend-mode: difference;
        }
    }
</style>
