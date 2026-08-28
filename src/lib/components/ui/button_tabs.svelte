<script lang="ts">
    import { getDirectoryState } from "$lib/models/state.svelte";
    import { Grip, MapPin } from "@lucide/svelte";
    import { analytics } from "$lib/analytics";

    const userState = getDirectoryState();

    function changeView(view: "Map" | "Directory") {
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
            <span class="label">Map</span>
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
        <label for="directory_tab" title="Show grid">
            <Grip size="18" />
            <span class="label">Grid</span>
        </label>
        <div class="selection-pill"></div>
    </div>
{/if}

<style lang="scss">
    $tab-width-small: 40px;
    $tab-width-large: 70px;

    .button-group {
        position: relative;
        display: inline-flex;
        background-color: $primary-mid;
        padding: 4px;
        border-radius: $radius-full;
        user-select: none;

        &:has(:focus-visible) {
            outline: 2px solid $secondary;
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
                width: $tab-width-small;
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

                @media screen and (min-width: $breakpoint-medium) {
                    width: $tab-width-large;
                }

                .label {
                    display: none;

                    @media screen and (min-width: $breakpoint-medium) {
                        display: block;
                    }
                }
            }

            &:is(input:checked) {
                & + label {
                    color: $white;
                }
            }

            &:nth-of-type(1):checked ~ .selection-pill {
                transform: translateX(0);
            }

            &:nth-of-type(2):checked ~ .selection-pill {
                transform: translateX($tab-width-small);

                @media screen and (min-width: $breakpoint-medium) {
                    transform: translateX($tab-width-large);
                }
            }
        }

        .selection-pill {
            position: absolute;
            width: $tab-width-small;
            height: $tab-width-small;
            background-color: $primary;
            border-radius: $radius-full;
            z-index: 1;
            transition: transform 200ms ease-in-out;

            @media screen and (min-width: $breakpoint-medium) {
                width: $tab-width-large;
            }
        }
    }
</style>
