<script lang="ts">
    import { ArrowLeft } from "@lucide/svelte";
    import { resolve } from "$app/paths";

    let { notFound = false }: { notFound?: boolean } = $props();
</script>

<article aria-busy={!notFound}>
    <a
        href={resolve(`/`)}
        style="grid-area: back;"
        aria-label="Back to directory"
    >
        <ArrowLeft size="28" />
    </a>

    {#if notFound}
        <div class="message" style="grid-area: title;">
            <h2>Profile not found</h2>
            <p>This profile could not be found. It may have been removed.</p>
            <a href={resolve(`/`)}>Back to the directory</a>
        </div>
    {:else}
        <div class="block title" style="grid-area: title;"></div>
        <div class="block logo" style="grid-area: logo;"></div>
        <div class="block photo" style="grid-area: photo;"></div>
        <div style="grid-area: details;">
            <div class="block line"></div>
            <div class="block line short"></div>
            <div class="block line"></div>
        </div>
    {/if}
</article>

<style lang="scss">
    article {
        position: fixed;
        inset: 0;
        z-index: 10;
        background-color: $white;
        padding: $gap;
        gap: $gap;
        max-width: 1440px;
        margin: 0 auto;
        overflow: auto;
        display: grid;
        grid-template-columns: 50px 1fr 50px;
        grid-auto-rows: max-content;
        grid-template-areas:
            "back title logo"
            "photo photo photo"
            "details details details";

        @include from($breakpoint-medium) {
            grid-template-columns: 50px 1fr 1fr 50px;
            grid-template-areas:
                "back . . ."
                "logo title title title"
                "photo photo details details";
        }

        > a {
            color: $black;
        }
    }

    .block {
        background-color: lightgray;
        border-radius: $radius-small;
        animation: pulse 1.5s ease-in-out infinite;

        @media (prefers-reduced-motion: reduce) {
            animation: none;
        }

        &.title {
            height: 32px;
            max-width: 320px;
        }

        &.logo {
            width: 48px;
            height: 48px;
        }

        &.photo {
            height: 400px;
        }

        &.line {
            height: 16px;
            margin-bottom: $gap-small;

            &.short {
                width: 60%;
            }
        }
    }

    .message {
        display: flex;
        flex-direction: column;
        gap: $gap-small;

        a {
            color: $secondary;
        }
    }

    @keyframes pulse {
        50% {
            opacity: 0.5;
        }
    }
</style>
