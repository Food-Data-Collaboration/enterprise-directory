import type { HandleClientError } from '@sveltejs/kit';
import { analytics } from "$lib/analytics";


export const handleError: HandleClientError = ({ error, status, message }) => {
	analytics.catch(error)

	return { message, status };
};
