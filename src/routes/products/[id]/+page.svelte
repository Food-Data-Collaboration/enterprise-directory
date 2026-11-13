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

{#if product}
    <ProfileProduct {product} />
{:else}
    <ProfilePlaceholder notFound={userState.hasFetchedEnterprises} />
{/if}
