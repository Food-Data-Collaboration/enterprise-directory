<script lang="ts">
	import Header from "$lib/components/header.svelte";

	let { children } = $props();
</script>

<div id="layout">
	<Header />
	{@render children()}
</div>

<style lang="scss">
	#layout {
		position: relative;
		display: flex;
		flex-direction: column;
		margin: $gap;
		gap: $gap;
		min-height: calc(100vh - (2 * $gap));
	}
</style>
