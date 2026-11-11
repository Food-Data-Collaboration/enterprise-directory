import type { LayoutLoad } from './$types';
import { browser } from '$app/env';
import { enterpriseSource } from '$lib/data';

export const load: LayoutLoad = async ({ fetch }) => {
	// Only query in the browser. The promise is never awaited during SSR, so a
	// server-side query would be thrown away (and cost a full round of requests).
	if (!browser) return { enterprisePromise: null, cachedEnterprises: null };

	return {
		enterprisePromise: enterpriseSource.fetchEnterprises(fetch),
		cachedEnterprises: enterpriseSource.cached?.() ?? null
	};
};
