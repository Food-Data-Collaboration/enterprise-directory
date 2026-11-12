export const publicEnv = {
	DATA_HOST: { required: true },
	MAP_CENTRE_LNG: { required: true },
	MAP_CENTRE_LAT: { required: true },
	MAP_ZOOM: { required: false },
	MAP_ZOOM_MIN: { required: false },
	MAP_ZOOM_MAX: { required: false },
	MAP_BOUND_SW_LNG: { required: false },
	MAP_BOUND_SW_LAT: { required: false },
	MAP_BOUND_NE_LNG: { required: false },
	MAP_BOUND_NE_LAT: { required: false },
	ENABLE_PRODUCTS: { required: true },
	POSTHOG_PROJECT_TOKEN: { required: false },
	POSTHOG_HOST: { required: false },
	POSTHOG_ASSETS_HOST: { required: false },
	USE_DUMMY_DATA: { required: false }
} as const;

export type PublicEnvKey = keyof typeof publicEnv;
