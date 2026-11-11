<script lang="ts">
    import { getDirectoryState } from "$lib/models/state.svelte";
    import { Grip, MapPin } from "@lucide/svelte";
    import { analytics } from "$lib/analytics";
    import type { Tabs } from "$lib/models/tabs";
    import { ENABLE_PRODUCTS } from "$app/env/public";

    const userState = getDirectoryState();

    function changeView(view: Tabs) {
        userState.activeTab = view;
        analytics.track("directory_view_changed", { view });
    }
</script>

{#if userState.isTabbed}
    <div class="button-group" role="radiogroup">
        <input
            type="radio"
            id="map_tab"
            name="tabs"
            value="Map"
            aria-checked={userState.activeTab == "Map"}
            checked={userState.activeTab === "Map"}
            onchange={() => changeView("Map")}
        />
        <label for="map_tab" title="Show map">
            <MapPin size="18" />
            <span class="label">Map view</span>
        </label>

        <input
            type="radio"
            id="directory_tab"
            name="tabs"
            aria-checked={userState.activeTab == "Directory"}
            value="Directory"
            checked={userState.activeTab === "Directory"}
            onchange={() => changeView("Directory")}
        />
        <label for="directory_tab" title="Show orgranisations">
            <Grip size="18" />
            <span class="label">Organisations</span>
        </label>

        {#if ENABLE_PRODUCTS === "true"}
            <input
                type="radio"
                id="product_tab"
                name="tabs"
                aria-checked={userState.activeTab == "Product"}
                value="Product"
                checked={userState.activeTab === "Product"}
                onchange={() => changeView("Product")}
            />
            <label for="product_tab" title="Show products">
                <Grip size="18" />
                <span class="label">Products</span>
            </label>
        {/if}
        <div class="selection-pill"></div>
    </div>
{/if}

<style lang="scss">
    $tab-width-small: 40px;
    $tab-width-large: 120px;

    .button-group {
        position: relative;
        display: inline-flex;
        background-color: $white;
        padding: 4px;
        border-radius: $radius-full;
        user-select: none;
        width: fit-content;
        box-shadow: $drop-shadow;

        &:has(:focus-visible) {
            outline: 2px solid $black;
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
                flex-direction: row;
                gap: $gap-xxsmall;
                align-items: center;
                justify-content: center;
                width: $tab-width-large;
                height: $tab-width-small;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                z-index: 2;
                transition: color 200ms ease-in-out;

                &::after {
                    width: 48px;
                    height: 48px;
                }

                @include from($breakpoint-medium) {
                    width: $tab-width-large;
                }
            }

            &:is(input:checked) {
                & + label {
                    text-decoration: underline;
                }
            }
        }
    }
</style>
