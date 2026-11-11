<script lang="ts">
    import { getDirectoryState } from "$lib/models/state.svelte";
    import { Grip, MapPin } from "@lucide/svelte";
    import { analytics } from "$lib/analytics";
    import type { Tabs } from "$lib/models/tabs";
    import { ENABLE_PRODUCTS } from "$app/env/public";

    interface TabOption {
        value: Tabs;
        id: string;
        label: string;
        title: string;
        icon: typeof MapPin;
    }

    const userState = getDirectoryState();

    const tabs: TabOption[] = [
        { value: "Map", id: "map_tab", label: "Map view", title: "Show map", icon: MapPin },
        { value: "Directory", id: "directory_tab", label: "Organisations", title: "Show organisations", icon: Grip },
        ...(ENABLE_PRODUCTS === "true"
            ? [{ value: "Product", id: "product_tab", label: "Products", title: "Show products", icon: Grip } satisfies TabOption]
            : []),
    ];

    const activeIndex = $derived(tabs.findIndex((tab) => tab.value === userState.activeTab));

    function changeView(view: Tabs) {
        userState.activeTab = view;
        analytics.track("directory_view_changed", { view });
    }
</script>

{#if userState.isTabbed}
    <div
        class="button-group"
        role="radiogroup"
        style:--count={tabs.length}
        style:--index={Math.max(activeIndex, 0)}
    >
        <!-- Sliding marker behind the selected tab; positioned from --index/--count. -->
        <div class="selection-pill" class:hidden={activeIndex === -1} aria-hidden="true"></div>

        {#each tabs as tab (tab.value)}
            <input
                type="radio"
                id={tab.id}
                name="tabs"
                value={tab.value}
                checked={userState.activeTab === tab.value}
                onchange={() => changeView(tab.value)}
            />
            <label for={tab.id} title={tab.title}>
                <tab.icon size="18" />
                <span class="label">{tab.label}</span>
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
        // One column per tab. With no fixed width, 1fr columns all grow to the
        // widest label, so tabs are equal and the marker can be positioned
        // purely from the tab count and selected index.
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
        // Keep the labels' blend mode confined to this group.
        isolation: isolate;
        background-color: $white;
        padding: $group-padding;
        border-radius: $radius-full;
        user-select: none;
        width: fit-content;
        box-shadow: $drop-shadow;

        &:has(:focus-visible) {
            outline: 2px solid $black;
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

        &.hidden {
            opacity: 0;
        }

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
