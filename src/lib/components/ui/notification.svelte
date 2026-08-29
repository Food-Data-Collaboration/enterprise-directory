<script lang="ts">
    import type { CriticalityLevel } from "$lib/models/criticality_level";
    import { TriangleAlert } from "@lucide/svelte";
    import { fade } from "svelte/transition";

    let {
        title = "Whoops!",
        message,
        criticalityLevel = "info",
    }: {
        title?: string;
        message: string;
        criticalityLevel: CriticalityLevel;
    } = $props();
</script>

<div class="notification {criticalityLevel}" transition:fade>
    <TriangleAlert size="32" />
    <div class="content">
        <h2>{title}</h2>
        <p>{message}</p>
    </div>
</div>

<style lang="scss">
    .notification {
        display: flex;
        flex-direction: row;
        position: relative;
        max-width: $breakpoint-small;
        padding: $gap;
        gap: $gap;
        align-self: center;
        align-items: center;
        border-radius: $radius-small;
        box-shadow: $drop-shadow;
        user-select: none;
        transform: scale(1);
        z-index: 40;
        overflow: hidden;
        margin-top: $gap;

        @include from($breakpoint-small) {
            margin-top: 0;
        }

        .content {
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
    }
</style>
