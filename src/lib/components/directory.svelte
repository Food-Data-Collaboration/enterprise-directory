<script lang="ts">
    import { getDirectoryState } from "$lib/models/state.svelte";
    import CardEnterprise from "./ui/card_enterprise.svelte";
    import CardProduct from "./ui/card_product.svelte";

    import { resolve } from "$app/paths";
    import type { Responsive } from "$lib/models/display_mode";

    let { hidden }: { hidden: Responsive<boolean> } = $props();

    const userState = getDirectoryState();
    const views = $derived(userState.views);

    let productsVisited = $state(false);
    $effect(() => {
        if (userState.visibleTab == "Product") productsVisited = true;
    });
</script>

<article
    id="directory-view"
    class:hidden-desktop={hidden.desktop}
    class:hidden-mobile={hidden.mobile}
    class:sidebar={userState.showFilters}
>
    <div
        class="list"
        class:inactive-desktop={views.desktop.visibleTab != "Directory"}
        class:inactive-mobile={views.mobile.visibleTab != "Directory"}
    >
        {#each userState.enterprises as enterprise (enterprise.id)}
            <CardEnterprise {enterprise} />
        {/each}
    </div>
    {#if productsVisited}
        <div
            class="list"
            class:inactive-desktop={views.desktop.visibleTab != "Product"}
            class:inactive-mobile={views.mobile.visibleTab != "Product"}
        >
            {#each userState.products as product (`${product.enterpriseId}:${product.id}`)}
                <CardProduct
                    {product}
                    link={resolve("/products/[id]", {
                        id: product.profileId,
                    })}
                />
            {/each}
        </div>
    {/if}
</article>

<style lang="scss">
    article {
        display: grid;
        gap: $gap-large;
        grid-template-columns: 1fr;
        grid-auto-rows: max-content;
        max-height: auto;
        z-index: 0;
        opacity: 1;

        @include responsive-class(hidden) {
            max-height: 0;
            overflow: hidden;
            z-index: -1;
            opacity: 0;
        }

        .list {
            display: contents;

            @include responsive-class(inactive) {
                display: none;
            }
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
