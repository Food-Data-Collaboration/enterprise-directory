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
    POSTHOG_ASSETS_HOST: {
        public: true,
        static: false,
        schema: optionalString
    },
});

/**
 * Stops this schema and `src/env.config.ts` drifting apart. Without it, a
 * variable added here would be missing from the web-component build, where it
 * would come through as `null` at runtime rather than as a build failure.
 */
type AssertTrue<T extends true> = T;
export type _EnvKeysInSync = AssertTrue<
    [PublicEnvKey] extends [keyof typeof variables]
        ? [keyof typeof variables] extends [PublicEnvKey]
            ? true
            : false
        : false
>;