import type { LayoutLoad } from './$types';
import { enterpriseSource } from '$lib/data';

export const load: LayoutLoad = async ({ fetch }) => {
	return {
		enterprisePromise: enterpriseSource.fetchEnterprises(fetch)
	};
}
