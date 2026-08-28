import { dev } from '$app/environment';
import { POSTHOG_HOST, POSTHOG_PROJECT_TOKEN } from '$app/env/public';
import posthog from 'posthog-js';

let initialised = false;

export function initPostHog(): boolean {
	if (initialised) return true;

	const token = POSTHOG_PROJECT_TOKEN;
	const host = POSTHOG_HOST;

	if (!token || !host) {
		if (dev) {
			const variable = !token ? 'PUBLIC_POSTHOG_PROJECT_TOKEN' : 'PUBLIC_POSTHOG_HOST';
			throw new Error(
				`${variable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${variable} is configured`
			);
		}

		return false;
	}

	posthog.init(token, {
		api_host: host,
		defaults: '2026-05-30',
		capture_exceptions: {
			capture_unhandled_errors: true,
			capture_unhandled_rejections: true,
			capture_console_errors: false
		}
	});

	initialised = true;
	return true;
}

export const posthogAnalytics = {
	track(event: string, properties?: Record<string, unknown>) {
		if (!initPostHog()) return;

		posthog.capture(event, properties);
	},

	identify(userId: string, properties?: Record<string, unknown>) {
		if (!initPostHog()) return;

		posthog.identify(userId, properties);
	},

	catch(error: unknown, properties?: Record<string, unknown>) {
		if (!initPostHog()) return;

		posthog.captureException(error, properties);
	}
};

