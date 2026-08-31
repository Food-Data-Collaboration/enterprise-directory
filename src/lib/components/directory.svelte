<script lang="ts">
    import { getDirectoryState } from "$lib/models/state.svelte";
    import CardEnterprise from "./ui/card_enterprise.svelte";

    let { hidden }: { hidden: boolean } = $props();

    const userState = getDirectoryState();
</script>

<article id="directory-view" class:hidden class:sidebar={userState.showFilters}>
    {#each userState.enterprises as enterprise, index (index)}
        <CardEnterprise {enterprise} />
    {/each}
</article>

<style lang="scss">
    article {
        display: grid;
        gap: $gap-large;
        grid-template-columns: 1fr;
        grid-auto-rows: max-content;
        grid-area: 1 / 1;
        max-height: auto;

        // In the app the page scrolls. web-component there is no page to scroll: the element
        // is clipped to its box, so the list has to carry its own scrollport or the
        // cards past the fold become unreachable.
        @include web-component {
            min-height: 0;
            overflow-y: auto;
        }
        z-index: 0;
        opacity: 1;

        &.hidden {
            max-height: 0;
            overflow: hidden;
            z-index: -1;
            opacity: 0;
        }

        @include from($breakpoint-small) {
            grid-template-columns: 1fr 1fr;
        }

        @include from($breakpoint-medium) {
            grid-template-columns: 1fr 1fr;
            margin: 0 $gap;

            &.sidebar {
                grid-template-columns: 1fr;
            }
        }

        @include from($breakpoint-large) {
            grid-template-columns: 1fr 1fr 1fr;
            &.sidebar {
                grid-template-columns: 1fr 1fr;
            }
        }
        @include from($breakpoint-xlarge) {
            grid-template-columns: 1fr 1fr 1fr 1fr;
            &.sidebar {
                grid-template-columns: 1fr 1fr 1fr;
            }
        }
        @include from($breakpoint-xxlarge) {
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
            &.sidebar {
                grid-template-columns: 1fr 1fr 1fr 1fr;
            }
        }
    }
</style>
