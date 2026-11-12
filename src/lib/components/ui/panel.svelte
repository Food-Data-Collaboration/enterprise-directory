<script lang="ts">
    import { type Snippet } from "svelte";
    import type { LucideIcon } from "@lucide/svelte";

    let {
        title,
        customIcon: CustomIcon,
        children,
    }: {
        title: string;
        customIcon?: LucideIcon;
        children: Snippet;
    } = $props();
</script>

<div class="panel">
    <div class="header">
        {#if CustomIcon}
            <CustomIcon size={20} color="currentColor" />
        {/if}
        <h3>{title}</h3>
    </div>
    <section>
        {@render children()}
    </section>
</div>

<style lang="scss">
    .panel {
        border: 1px solid $light-grey;
        padding: $gap;
        border-radius: $radius-small;

        .header {
            display: flex;
            gap: $gap-xsmall;
            align-items: center;
        }

        section {
            font-size: $text-body-small;
        }
    }
</style>
