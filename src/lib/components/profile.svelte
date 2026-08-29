<script lang="ts">
    import { ArrowLeft, MapPin } from "@lucide/svelte";
    import { resolve } from "$app/paths";
    import Tag from "./ui/tag.svelte";
    import Carousel from "./ui/carousel.svelte";
    import type { Enterprise } from "$lib/models/enterprise";
    import { fade } from "svelte/transition";

    // The web component has nowhere to navigate back to, so it passes onback and gets a
    // button instead of a link. Without it this stays the app's link home.
    let {
        enterprise,
        onback,
    }: { enterprise: Enterprise; onback?: () => void } = $props();
</script>

<article transition:fade>
    <header>
        {#if onback}
            <button type="button" aria-label="Back to directory" onclick={onback}>
                <ArrowLeft size="28" />
            </button>
        {:else}
            <a href={resolve(`/`)}>
                <ArrowLeft size="28" />
            </a>
        {/if}
        <h2>{enterprise.name}</h2>
        <img src={enterprise.logoUrl} alt="logo" />
    </header>
    <div id="gallery">
        <Carousel images={enterprise.images} />
    </div>
    <p class="location">
        <MapPin />
        {enterprise.addresses[0]?.formatted}
    </p>
    <div id="tags">
        {#each enterprise.categories as tag (tag)}
            <Tag text={tag} />
        {/each}
    </div>
    <p class="description">{enterprise.description}</p>
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
</style>
