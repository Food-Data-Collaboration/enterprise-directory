import type { LayoutLoad } from './$types';
import { DATA_HOST } from "$app/env/public"

export const load: LayoutLoad = async ({ fetch }) => {
	return {
		enterprisePromise: fetch(`${DATA_HOST}/enterprises/`)
	};
}