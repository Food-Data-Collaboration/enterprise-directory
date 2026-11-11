<script lang="ts">
    import { getDirectoryState } from "$lib/models/state.svelte";
    import CardEnterprise from "./ui/card_enterprise.svelte";
    import CardProduct from "./ui/card_product.svelte";

    import { resolve } from "$app/paths";
    let { hidden }: { hidden: boolean } = $props();

    const userState = getDirectoryState();
</script>

<article id="directory-view" class:hidden class:sidebar={userState.showFilters}>
    {#if userState.activeTab == "Directory"}
        {#each userState.enterprises as enterprise, index (index)}
            <CardEnterprise {enterprise} />
        {/each}
    {/if}
    {#if userState.activeTab == "Product"}
        {#each userState.products as product, index (index)}
            <CardProduct
                {product}
                link={resolve("/products/[id]", {
                    id: product.profileId,
                })}
            />
        {/each}
    {/if}
</article>

<style lang="scss">
    article {
        display: grid;
        gap: $gap-large;
        grid-template-columns: 1fr;
        grid-auto-rows: max-content;
        grid-area: 1 / 1;
        max-height: auto;
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
