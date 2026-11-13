<script lang="ts">
    import ProfileProduct from "$lib/components/profile_product.svelte";
    import { getDirectoryState } from "$lib/models/state.svelte";
    import { page } from "$app/state";
    import ProfilePlaceholder from "$lib/components/profile_placeholder.svelte";

    const userState = getDirectoryState();
    const product = $derived(
        userState.products.find((e) => e.profileId === page.params.id),
    );
</script>

<svelte:head>
    <title>{product ? `${product.name} · Enterprise Directory` : "Enterprise Directory"}</title>
    <meta
        name="description"
        content={product?.description.slice(0, 160) ||
            "A product profile in the Enterprise Directory."}
    />
</svelte:head>

{#if product}
    <ProfileProduct {product} />
{:else}
    <ProfilePlaceholder notFound={userState.hasFetchedEnterprises} />
{/if}
