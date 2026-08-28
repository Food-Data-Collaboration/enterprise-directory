<script lang="ts">
    import { type Snippet } from "svelte";
    import { analytics } from "$lib/analytics";
    import type { ResolvedPathname } from "$app/types";

    let {
        title,
        image,
        link,
        children,
    }: {
        title: string;
        image?: string;
        link?: ResolvedPathname;
        children: Snippet;
    } = $props();
</script>

<div class="card">
    {#if image}
        <div class="card-image">
            <img src={image} alt={title + " marketing image"} />
        </div>
    {/if}
    <section>
        {#if link}
            <a
                href={link}
                onclick={() => analytics.track("enterprise_profile_opened")}
            >
                <h2>{title}</h2>
            </a>
        {:else}
            <h2>{title}</h2>
        {/if}

        {@render children()}
    </section>
</div>

<style lang="scss">
    .card {
        display: flex;
        flex-direction: column;
        position: relative;
        align-self: start;
        border-radius: $radius-small;
        background-color: $white;
        box-shadow: $drop-shadow;
        user-select: none;
        transform: scale(1);
        z-index: 40;
        overflow: hidden;
        transition:
            box-shadow 200ms ease-in,
            transform 200ms ease-in;

        &:hover,
        &:focus-within {
            box-shadow: $cast-shadow;
            transform: scale(1.01);
        }

        &:focus-within {
            outline: 2px solid $secondary;
        }

        .card-image {
            width: 100%;
            aspect-ratio: 16 / 9;
            overflow: hidden;
            border-top-left-radius: $radius-small;
            border-top-right-radius: $radius-small;
            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: center;
                transition: transform 0.3s ease;
            }
        }

        section {
            display: flex;
            flex-direction: column;
            padding: $gap;
            gap: $gap-xsmall;

            a {
                text-decoration: none;
                color: $black;

                &:focus-visible {
                    outline: none;
                }

                &::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    z-index: 1;
                    cursor: pointer;
                }

                h2 {
                    background: $transparent;
                    text-align: left;
                    border: none;
                    padding: 0;
                    margin: 0;
                }
            }
        }
    }

    :global(.maplibregl-popup-content) {
        padding: 0 !important;
    }

    :global(.maplibregl-marker) {
        cursor: pointer;
    }
</style>
