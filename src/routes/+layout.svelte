<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import "@fontsource-variable/inter";
	import "$lib/styles/reset.scss";
	import "$lib/styles/framework.scss";
	import {
		DirectoryState,
		setDirectoryState,
	} from "$lib/models/state.svelte";

	let { data, children } = $props();

	const userState = setDirectoryState(new DirectoryState());

	$effect(() => {
		if (data.enterprisePromise)
			userState.init(data.enterprisePromise, data.cachedEnterprises);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
