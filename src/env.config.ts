export const publicEnv = {
	DATA_HOST: { required: true },
	DEFAULT_MAP_CENTRE: { required: true },
	POSTHOG_PROJECT_TOKEN: { required: false },
	POSTHOG_HOST: { required: false },
	POSTHOG_ASSETS_HOST: { required: false }
} as const;

export type PublicEnvKey = keyof typeof publicEnv;
