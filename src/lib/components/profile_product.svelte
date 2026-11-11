<script lang="ts">
    import { ArrowLeft, MapPin } from "@lucide/svelte";
    import { resolve } from "$app/paths";
    import Carousel from "./ui/carousel.svelte";
    import type { Product } from "$lib/models/product";
    import { getDirectoryState } from "$lib/models/state.svelte";

    let { product, onback }: { product: Product; onback?: () => void } =
        $props();
    const userState = getDirectoryState();
    const enterprise = $derived(
        userState.enterprises.find((e) => e.profileId === product.enterpriseId),
    );
</script>

<article>
    <header>
        {#if onback}
            <button
                type="button"
                aria-label="Back to directory"
                onclick={onback}
            >
                <ArrowLeft size="28" />
            </button>
        {:else}
            <a href={resolve(`/`)}>
                <ArrowLeft size="28" />
            </a>
        {/if}
        <h2>{product.name}</h2>
        <div></div>
    </header>
    <div id="gallery">
        <Carousel images={[product.image]} />
    </div>
    <p class="location">
        <MapPin />
        {enterprise!.addresses[0]?.formatted}
    </p>
    <p class="description">{product.description}</p>
    <!--
    <div id="tags">
        {#each enterprise.categories as tag (tag)}
            <Tag text={tag} />
        {/each}
    </div>
    -->

    <!-- {#if ENABLE_PRODUCTS === "true" && enterprise.products.length > 0}
        <section>
            {#each enterprise.products as product, index (index)}
                <CardProduct {product} landscape={true} />
            {/each}
        </section>
    {/if}  -->
</article>

<style lang="scss">
    article {
        position: fixed;
        display: flex;
        flex-direction: column;
        inset: 0;
        z-index: 10;
        background-color: $white;
        padding: $gap;
        gap: $gap;
        max-width: 1440px;
        margin: 0 auto;
        overflow: auto;

        header {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;

            a,
            button {
                padding: $gap-xsmall;
                color: $black;
            }

            button {
                background: none;
                border: none;
                display: flex;
            }

            img {
                min-width: 48px;
                height: 48px;
                object-fit: cover;
                object-position: center;
            }
        }

        p {
            display: flex;
            gap: $gap-xxsmall;

            &.location {
                text-decoration: underline;
            }

            &.description {
                font-size: $text-body-small;
            }
        }

        #tags {
            display: inline-flex;
            gap: $gap-xsmall;
            margin-top: $gap-xsmall;
        }
    }

    section {
        display: grid;
        gap: $gap-large;
        grid-template-columns: 1fr;
        grid-auto-rows: max-content;
        grid-area: 1 / 1;
        max-height: auto;
        z-index: 0;
        opacity: 1;

        @include from($breakpoint-small) {
            grid-template-columns: 1fr;
        }

        @include from($breakpoint-medium) {
            grid-template-columns: 1fr;
        }

        @include from($breakpoint-large) {
            grid-template-columns: 1fr 1fr;
        }
        @include from($breakpoint-xlarge) {
            grid-template-columns: 1fr 1fr 1fr;
        }
        @include from($breakpoint-xxlarge) {
            grid-template-columns: 1fr 1fr 1fr;
        }
    }
</style>
