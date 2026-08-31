<script lang="ts">
    let { image }: { image: string } = $props();
</script>

<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d_142_10290)">
        <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M30.5 4C44.5833 4 56 15.4167 56 29.5C56 40.2983 49.2881 49.5289 39.8087 53.2475L31.9521 63.9865C31.7883 64.2113 31.5709 64.3948 31.3181 64.5215C31.0653 64.6481 30.7846 64.7143 30.4997 64.7143C30.2149 64.7143 29.9342 64.6481 29.6814 64.5215C29.4286 64.3948 29.2111 64.2113 29.0473 63.9865L21.1905 53.2472C11.7115 49.5284 5 40.298 5 29.5C5 15.4167 16.4167 4 30.5 4Z"
        />
    </g>
</svg>
<span style=" background-image: url({image})"></span>

<style lang="scss">
    svg {
        transform: translate(0, -33px);
        fill: $black;
    }

    span {
        position: absolute;
        top: -23px;
        left: 11px;
        border-radius: 50%;
        width: 39px;
        height: 38px;
        background-position: center center;
        background-size: cover;
    }
</style>
