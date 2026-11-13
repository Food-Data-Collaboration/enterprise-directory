import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `
					@use '$lib/styles/variables' as *;
				`
			}
		}
	},
	test: {
		// Logic-only suite: no DOM, no component mounting. Add a second project in
		// browser mode when the UI is stable enough to assert against.
		environment: 'node',
		include: ['src/**/*.test.ts']
	}
});