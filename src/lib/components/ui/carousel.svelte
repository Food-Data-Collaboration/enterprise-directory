<script lang="ts">
    import { ChevronLeft, ChevronRight } from "@lucide/svelte";
    import { fade } from "svelte/transition";
    import { analytics } from "$lib/analytics";

    let { images }: { images: string[] } = $props();

    let startX = 0;
    const SWIPE_THRESHOLD = 50;
    let currentIndex: number = $state(0);

    function nextSlide() {
        currentIndex = (currentIndex + 1) % images.length;
        analytics.track("enterprise_gallery_navigated", { direction: "next" });
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        analytics.track("enterprise_gallery_navigated", {
            direction: "previous",
        });
    }

    function goToSlide(index: number) {
        currentIndex = index;
        analytics.track("enterprise_gallery_navigated", {
            direction: "selected",
        });
    }

    function handlePointerDown(event: PointerEvent) {
        startX = event.clientX;
    }

    function handlePointerUp(event: PointerEvent) {
        const diffX = startX - event.clientX;

        if (Math.abs(diffX) > SWIPE_THRESHOLD) {
            if (diffX > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }
</script>

<div
    class="carousel-container"
    onpointerdown={handlePointerDown}
    onpointerup={handlePointerUp}
    role="listbox"
    tabindex="0"
>
    <div class="carousel-inner">
        {#each images as image, i (i)}
            {#if i === currentIndex}
                <div class="slide" transition:fade={{ duration: 300 }}>
                    <img src={image} alt={i.toString()} />
                </div>
            {/if}
        {/each}
    </div>

    <button
        class="nav-btn prev"
        onclick={prevSlide}
        aria-label="Previous slide"
    >
        <ChevronLeft />
    </button>
    <button class="nav-btn next" onclick={nextSlide} aria-label="Next slide">
        <ChevronRight />
    </button>

    <div class="indicators">
        {#each images as _, i (i)}
            <button
                class="dot"
                class:active={i === currentIndex}
                onclick={() => goToSlide(i)}
                aria-label="Go to slide {i + 1}"
            ></button>
        {/each}
    </div>
</div>

<style lang="scss">
    .carousel-container {
        position: relative;
        width: 100%;
        max-width: 600px;
        height: 400px;
        margin: auto;
        overflow: hidden;
        border-radius: 8px;
        box-shadow: $drop-shadow;
    }

    .carousel-inner {
        position: relative;
        width: 100%;
        height: 100%;
        background-color: $black;
    }

    .slide {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .slide img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .nav-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0, 0, 0, 0.5);
        color: $white;
        border: none;
        padding: 12px 16px;
        cursor: pointer;
        font-size: 18px;
        user-select: none;
        transition: background 0.2s;
        z-index: 10;
    }

    .nav-btn:hover {
        background: rgba(0, 0, 0, 0.8);
    }

    .prev {
        left: 0;
        border-radius: 0 4px 4px 0;
    }

    .next {
        right: 0;
        border-radius: 4px 0 0 4px;
    }

    .indicators {
        position: absolute;
        bottom: 15px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
        z-index: 10;
    }

    .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        border: none;
        cursor: pointer;
        padding: 0;
        transition: background 0.2s;
    }

    .dot.active,
    .dot:hover {
        background-color: $white;
    }
</style>
