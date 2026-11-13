<script lang="ts">
    import Card from "$lib/components/ui/card.svelte";
    import type { Product } from "$lib/models/product";
    import { analytics } from "$lib/analytics";
    import type { ResolvedPathname } from "$app/types";

    let {
        product,
        link,
        landscape,
    }: { product: Product; link?: ResolvedPathname; landscape?: boolean } =
        $props();
</script>

<Card
    title={product.name}
    image={product.image}
    {link}
    {landscape}
    analyticsCallback={() =>
        analytics.track("product_card_clicked", {
            productId: product.id,
            action: "Open enterprise profile",
        })}
>
    <p class="card-description">{product.description}</p>
</Card>

<style lang="scss">
    p {
        &.card-location {
            gap: $gap-xxsmall;
            margin-left: -2px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            line-clamp: 1;
            -webkit-line-clamp: 1;
            overflow: hidden;
        }

        &.card-description {
            height: 40px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            font-size: $text-body-small;
            line-clamp: 2;
            -webkit-line-clamp: 2;
            overflow: hidden;
        }
    }

    #tags {
        display: inline-flex;
        gap: $gap-xsmall;
        margin-top: $gap-xsmall;
        flex-wrap: nowrap;
        overflow: auto;
        z-index: 2;
        contain: inline-size;
    }
</style>
