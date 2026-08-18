<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import "@fontsource-variable/inter";
	import "$lib/styles/reset.scss";
	import "$lib/styles/framework.scss";
	import Header from "$lib/components/header.svelte";
	import {
		DirectoryState,
		setDirectoryState,
	} from "$lib/models/state.svelte";

	let { data, children } = $props();

	const userState = setDirectoryState(new DirectoryState());

	$effect(() => {
		userState.init(data.enterprisePromise);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

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
