<script lang="ts">
    import Profile from "$lib/components/profile.svelte";
    import { getDirectoryState } from "$lib/models/state.svelte";
    import { page } from "$app/state";

    const userState = getDirectoryState();
    const enterprise = $derived(
        userState.enterprises.find((e) => e.profileId === page.params.id),
    );
</script>

{#if enterprise}
    <Profile {enterprise} />
{/if}
