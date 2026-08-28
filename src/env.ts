import { defineEnvVars } from '@sveltejs/kit/env';

const optionalString = {
    '~standard': {
        version: 1 as const,
        vendor: 'enterprise-directory',
        types: {} as { input: string | undefined; output: string | undefined },
        validate: (value: unknown) => ({ value: typeof value === 'string' ? value : undefined })
    }
};

export const variables = defineEnvVars({
    DATA_URL: {
        public: true,
        static: true
    },
    DEFAULT_MAP_CENTRE: {
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
});