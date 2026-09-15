import type { Analytics } from "."

export class LocalAnalytics implements Analytics {
	constructor() {
		console.log("construct")
	}

	track(event: string, properties?: Record<string, unknown>) {
		console.debug(`Analytics - Track Event: ${event}, ${JSON.stringify(properties)}`)
	};

	identify(userId: string, properties?: Record<string, unknown>) {
		console.debug(`Analytics - Identify User: ${userId}, ${JSON.stringify(properties)}`)
	};

	catch(error: unknown, properties?: Record<string, unknown>) {
		console.debug(`Analytics - Log error: ${error}, ${JSON.stringify(properties)}`)
	};
};

