<script lang="ts">
    import { getDirectoryState } from "$lib/models/state.svelte";
    import CardEnterprise from "./ui/card_enterprise.svelte";
    import { fade } from "svelte/transition";

    let { hidden }: { hidden: boolean } = $props();

    const userState = getDirectoryState();
</script>

<article
    id="directory-view"
    class:hidden
    class:sidebar={userState.showFilters}
    transition:fade
>
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
        width: 100%;
        z-index: 0;
        opacity: 1;
        transition: opacity 400ms cubic-bezier(0.34, 1.56, 0.64, 1);

        &.hidden {
            max-height: 0;
            overflow: hidden;
            z-index: -1;
            opacity: 0;
        }

        @media screen and (min-width: $breakpoint-small) {
            grid-template-columns: 1fr 1fr;
        }

        @media screen and (min-width: $breakpoint-medium) {
            grid-template-columns: 1fr 1fr;
            margin: 0 $gap;

            &.sidebar {
                grid-template-columns: 1fr;
            }
        }

        @media screen and (min-width: $breakpoint-large) {
            grid-template-columns: 1fr 1fr 1fr;
            &.sidebar {
                grid-template-columns: 1fr 1fr;
            }
        }
        @media screen and (min-width: $breakpoint-xlarge) {
            grid-template-columns: 1fr 1fr 1fr 1fr;
            &.sidebar {
                grid-template-columns: 1fr 1fr 1fr;
            }
        }
        @media screen and (min-width: $breakpoint-xxlarge) {
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
            &.sidebar {
                grid-template-columns: 1fr 1fr 1fr 1fr;
            }
        }
    }
</style>
