import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
    DATA_URL: {
        public: true,
        static: true
    }
});