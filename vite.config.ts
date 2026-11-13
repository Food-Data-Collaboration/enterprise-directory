import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { workerPolyfills } from './vite.worker-polyfills';

export default defineConfig({
	plugins: [sveltekit()],
	// Only the organisations worker (ldkit, Comunica, N3) needs Node built-ins, so the
	// polyfills are scoped to worker bundles instead of shipping in the main app.
	worker: {
		format: 'es',
		plugins: () => [workerPolyfills()]
	},
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