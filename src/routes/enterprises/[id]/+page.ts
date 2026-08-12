import type { PageLoad } from './$types';
import { userState } from '$lib/models/state.svelte';

export const load: PageLoad = async ({ url, parent }) => {
    await parent();
    return {
        enterprise: userState.enterprises.filter(e => e.profileUrl == url.pathname)[0]
    };
};