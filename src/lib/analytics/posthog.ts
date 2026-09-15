import { dev } from '$app/env';
import { POSTHOG_HOST, POSTHOG_PROJECT_TOKEN } from '$app/env/public';
import posthog from 'posthog-js';
import type { Analytics } from '.';


export class PosthogAnalytics implements Analytics {

	constructor() {
		const token = POSTHOG_PROJECT_TOKEN;
		const host = POSTHOG_HOST;

		if (!token || !host) {
			if (dev) {
				const variable = !token ? 'POSTHOG_PROJECT_TOKEN' : 'POSTHOG_HOST';
				throw new Error(
					`${variable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${variable} is configured`
				);
			}

			return;
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
	}

	track(event: string, properties?: Record<string, unknown>) {
		posthog.capture(event, properties);
	};

	identify(userId: string, properties?: Record<string, unknown>) {
		posthog.identify(userId, properties);
	};

	catch(error: unknown, properties?: Record<string, unknown>) {
		posthog.captureException(error, properties);
	};
}