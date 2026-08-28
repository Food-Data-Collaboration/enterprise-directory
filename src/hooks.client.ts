import type { HandleClientError } from '@sveltejs/kit';
import { analytics } from '$lib/analytics';
import { initPostHog } from '$lib/analytics/posthog';

export async function init() {
	initPostHog();
}

export const handleError: HandleClientError = ({ error, status, message }) => {
	analytics.catch(error);

	return { message, status };
};
