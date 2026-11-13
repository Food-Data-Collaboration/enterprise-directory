import { browser, dev } from '$app/env';
import { POSTHOG_HOST, POSTHOG_PROJECT_TOKEN } from '$app/env/public';
import type { PostHog } from 'posthog-js';
import type { Analytics } from '.';
import { whenIdle } from '$lib/idle';

type Call = (client: PostHog) => void;

/**
 * PostHog, loaded lazily in the browser. posthog-js is browser-only (it has no
 * `init` on the server) and is ~250 KB, so it is imported after first render;
 * calls made before then are queued. On the server every method is a no-op.
 */
export class PosthogAnalytics implements Analytics {
	#client: PostHog | null = null;
	/** Calls made before the client loaded; null once loaded, or when disabled. */
	#queue: Call[] | null = [];

	constructor() {
		const token = POSTHOG_PROJECT_TOKEN;
		const host = POSTHOG_HOST;

		if (!browser || !token || !host) {
			this.#queue = null;

			if (browser && dev) {
				const variable = !token ? 'POSTHOG_PROJECT_TOKEN' : 'POSTHOG_HOST';
				throw new Error(
					`${variable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${variable} is configured`
				);
			}

			return;
		}

		whenIdle(() => {
			import('posthog-js')
				.then(({ default: posthog }) => {
					posthog.init(token, {
						api_host: host,
						defaults: '2026-05-30',
						capture_exceptions: {
							capture_unhandled_errors: true,
							capture_unhandled_rejections: true,
							capture_console_errors: false
						}
					});
					this.#client = posthog;
					this.#queue?.forEach((call) => call(posthog));
					this.#queue = null;
				})
				.catch(() => {
					// Blocked or failed to load: drop analytics rather than break the app.
					this.#queue = null;
				});
		});
	}

	#run(call: Call): void {
		if (this.#client) call(this.#client);
		else this.#queue?.push(call);
	}

	track(event: string, properties?: Record<string, unknown>) {
		this.#run((client) => client.capture(event, properties));
	}

	identify(userId: string, properties?: Record<string, unknown>) {
		this.#run((client) => client.identify(userId, properties));
	}

	catch(error: unknown, properties?: Record<string, unknown>) {
		this.#run((client) => client.captureException(error, properties));
	}
}
