<script lang="ts">
    import Profile from "$lib/components/profile.svelte";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
</script>

<Profile enterprise={data.enterprise} />
