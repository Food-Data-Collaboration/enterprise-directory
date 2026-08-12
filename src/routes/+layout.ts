import type { LayoutLoad } from './$types';
import { fetchEnterprises } from '$lib/models/state.svelte';

export const load: LayoutLoad = async ({ fetch }) => {
	await fetchEnterprises();
};