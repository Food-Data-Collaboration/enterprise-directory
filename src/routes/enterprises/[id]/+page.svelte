<script lang="ts">
    import ProfileEnterprise from "$lib/components/profile_enterprise.svelte";
    import { getDirectoryState } from "$lib/models/state.svelte";
    import { page } from "$app/state";
    import ProfilePlaceholder from "$lib/components/profile_placeholder.svelte";

    const userState = getDirectoryState();
    const enterprise = $derived(
        userState.enterprises.find((e) => e.profileId === page.params.id),
    );
</script>

<svelte:head>
    <title>{enterprise ? `${enterprise.name} · Enterprise Directory` : "Enterprise Directory"}</title>
    <meta
        name="description"
        content={enterprise?.description.slice(0, 160) ||
            "An enterprise profile in the Enterprise Directory."}
    />
</svelte:head>

{#if enterprise}
    <ProfileEnterprise {enterprise} />
{:else}
    <ProfilePlaceholder notFound={userState.hasFetchedEnterprises} />
{/if}
