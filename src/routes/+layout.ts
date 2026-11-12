import type { LayoutLoad } from './$types';
import { browser } from '$app/env';
import { enterpriseSource } from '$lib/data';

export const load: LayoutLoad = async ({ fetch }) => {
	if (!browser) return { enterprisePromise: null, cachedEnterprises: null };

	return {
		enterprisePromise: enterpriseSource.fetchEnterprises(fetch),
		cachedEnterprises: enterpriseSource.cached?.() ?? null
	};
};
