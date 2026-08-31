<script lang="ts">
    import { Funnel } from "@lucide/svelte";
    import { getDirectoryState } from "$lib/models/state.svelte";
    import ButtonTabs from "./ui/button_tabs.svelte";
    import Notification from "./ui/notification.svelte";
    import { analytics } from "$lib/analytics";

    const userState = getDirectoryState();

    function toggleFilters() {
        userState.showFilters = !userState.showFilters;
        analytics.track("filters_toggled", {
            is_open: userState.showFilters,
        });
    }
</script>

<header>
    <div id="header-main">
        <dir></dir>

        <button
            id="filter-menu"
            aria-label="Filters"
            title="Filters"
            placeholder="Find food"
            class:active={userState.showFilters}
            onclick={toggleFilters}
        >
            <Funnel size="16" />
            Filter
        </button>
        <ButtonTabs />
    </div>

    {#if !userState.isLoadingEnterprises && userState.enterprises.length < 1}
        <Notification
            message="Something went wrong while loading the enterprise directory"
            criticalityLevel="danger"
        />
    {/if}
</header>

<style lang="scss">
    header {
        position: sticky;
        top: 16px;
        z-index: 5;
        display: flex;
        flex-direction: column;

        #header-main {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: $gap-xsmall;

            #head-logo {
                display: none;
                user-select: none;
                position: relative;
                top: 3px;
                left: -3px;
                width: 91px;
                padding: $gap-xsmall;

                @include from($breakpoint-small) {
                    display: block;
                }
            }

            button {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: $gap-xxsmall;
                right: $gap;
                padding: $gap-small;
                background-color: $white;
                border-radius: $radius-full;
                border: none;
                outline-offset: -4px;
                color: $black;
                width: fit-content;
                box-shadow: $drop-shadow;

                &.active {
                    background-color: $black;
                    color: $white;
                }

                &:focus-visible {
                    outline: 2px solid $secondary;
                }
            }
        }
    }
</style>
