<script lang="ts">
    let { text }: { text: string } = $props();
</script>

<span>{text}</span>

<style lang="scss">
    span {
        background-color: $light-grey;
        border-radius: 8px;
        padding: $gap-xsmall;
        color: white;
        line-height: $text-body;
        height: 32px;
        user-select: none;
    }
</style>
