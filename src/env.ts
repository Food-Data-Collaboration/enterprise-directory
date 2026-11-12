import { defineEnvVars } from '@sveltejs/kit/env';
import type { PublicEnvKey } from './env.config';

const optionalString = {
    '~standard': {
        version: 1 as const,
        vendor: 'enterprise-directory',
        types: {} as { input: string | undefined; output: string | undefined },
        validate: (value: unknown) => ({ value: typeof value === 'string' ? value : undefined })
    }
};

export const variables = defineEnvVars({
    DATA_HOST: {
        public: true,
        static: true
    },
    MAP_CENTRE_LNG: {
        public: true,
        static: true
    },
    MAP_CENTRE_LAT: {
        public: true,
        static: true
    },
    MAP_ZOOM: {
        public: true,
        static: true
    },
    MAP_ZOOM_MIN: {
        public: true,
        static: true
    },
    MAP_ZOOM_MAX: {
        public: true,
        static: true
    },
    MAP_BOUND_SW_LNG: {
        public: true,
        static: true
    },
    MAP_BOUND_SW_LAT: {
        public: true,
        static: true
    },
    MAP_BOUND_NE_LNG: {
        public: true,
        static: true
    },
    MAP_BOUND_NE_LAT: {
        public: true,
        static: true
    },
    ENABLE_PRODUCTS: {
        public: true,
        static: true
    },
    POSTHOG_PROJECT_TOKEN: {
        public: true,
        static: false,
        schema: optionalString
    },
    POSTHOG_HOST: {
        public: true,
        static: false,
        schema: optionalString
    },
    POSTHOG_ASSETS_HOST: {
        public: true,
        static: false,
        schema: optionalString
    },
    USE_DUMMY_DATA: {
        public: true,
        static: true,
        schema: optionalString
    },
});

type AssertTrue<T extends true> = T;
export type _EnvKeysInSync = AssertTrue<
    [PublicEnvKey] extends [keyof typeof variables]
    ? [keyof typeof variables] extends [PublicEnvKey]
    ? true
    : false
    : false
>;