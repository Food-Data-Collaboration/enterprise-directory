<script lang="ts">
    import { onMount, type Snippet } from "svelte";

    let {
        title,
        image,
        link,
        children,
    }: { title: string; image: string; link: string; children: Snippet } =
        $props();

    let targetElement: HTMLDivElement;
    onMount(() => {
        targetElement.focus({ preventScroll: true });
        targetElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
</script>

<div bind:this={targetElement} class="card">
    <div class="card-image">
        <img src={image} alt={title + "marketing image"} />
    </div>
    <section>
        <a href={link}>
            <h2>{title}</h2>
        </a>

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
