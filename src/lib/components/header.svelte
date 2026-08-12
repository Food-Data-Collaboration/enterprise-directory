<script lang="ts">
    import { SlidersHorizontal } from "@lucide/svelte";
    import logo from "$lib/assets/lwa_icon.png";
    import { userState } from "$lib/models/state.svelte";
    import ButtonTabs from "./ui/button_tabs.svelte";

    function toggleFilters() {
        userState.showFilters = !userState.showFilters;
    }
</script>

<header>
    <div id="head-logo">
        <img src={logo} alt="Landworkers Alliance logo" />
    </div>
    <div id="head-search">
        <input type="text" />
        <button
            id="filter-menu"
            aria-label="Filters"
            title="Filters"
            placeholder="Find food"
            class:active={userState.showFilters}
            onclick={toggleFilters}
        >
            <SlidersHorizontal size="16" />
        </button>
        <ButtonTabs />
    </div>
</header>

<style lang="scss">
    header {
        position: sticky;
        top: 16px;
        display: flex;
        flex-direction: column;
        align-items: normal;
        justify-content: center;
        z-index: 5;

        @media screen and (min-width: $breakpoint-small) {
            flex-direction: row;
            align-items: center;
        }

        #head-logo {
            display: none;
            img {
                user-select: none;
                position: relative;
                top: 3px;
                left: -3px;
                width: 91px;
                padding: $gap-xsmall;
            }

            @media screen and (min-width: $breakpoint-small) {
                display: block;
            }
        }

        #head-search {
            position: relative;
            grid-area: search;
            display: inline-flex;
            flex-direction: row;
            flex: 1;
            align-items: center;
            max-width: 768px;
            padding: 0 0 0 $gap-large;
            gap: $gap-xxsmall;
            background-color: $white;
            border-radius: $radius-full;
            box-shadow: $drop-shadow;
            transition: box-shadow 200ms ease-in;

            &:has(input[type="text"]:focus-visible) {
                outline: 2px solid $secondary;
                box-shadow: $cast-shadow;
            }

            &:hover {
                box-shadow: $cast-shadow;
            }

            input[type="text"] {
                flex: 1;
                min-width: 50px;
                line-height: $text-body;
                border: none;
                background-color: $white;

                &::placeholder {
                    color: $light-black;
                }

                &:focus-visible {
                    outline: none;
                }
            }

            button {
                display: flex;
                justify-content: center;
                align-items: center;
                right: $gap;
                padding: $gap-small;
                background-color: $transparent;
                border-radius: $radius-full;
                border: none;
                outline-offset: -4px;
                color: $black;

                &.active {
                    background-color: $primary;
                    color: $white;
                }

                &:focus-visible {
                    outline: 2px solid $secondary;
                }
            }
        }
    }
</style>
