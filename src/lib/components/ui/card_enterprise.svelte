<script lang="ts">
    import type { Enterprise } from "$lib/models/enterprise";
    import { MapPin } from "@lucide/svelte";
    import Card from "$lib/components/ui/card.svelte";
    import Tag from "$lib/components/ui/tag.svelte";

    let { enterprise }: { enterprise: Enterprise } = $props();
</script>

<Card
    title={enterprise.name}
    image={enterprise.images[0]}
    link={enterprise.profileUrl}
>
    <p class="card-location">
        <MapPin />
        {enterprise.addresses[0]?.formatted}
    </p>
    <div id="tags">
        {#each enterprise.categories as tag (tag)}
            <Tag text={tag} />
        {/each}
    </div>
    <p class="card-description">{enterprise.description}</p>
</Card>

<style lang="scss">
    p {
        display: flex;

        &.card-location {
            gap: $gap-xxsmall;
            margin-left: -2px;
        }

        &.card-description {
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

    :global(.maplibregl-popup-content) {
        padding: 0 !important;
    }

    :global(.maplibregl-marker) {
        cursor: pointer;
    }
</style>
