import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
	plugins: [
		// Browser polyfills for Comunica (used by ldkit). Vitest runs in Node,
		// where they would shadow the real built-ins and break dep pre-bundling.
		!process.env.VITEST &&
			nodePolyfills({
				// Rolldown's runtime imports createRequire from node:module in SSR output.
				exclude: ['module'],
				globals: {
					Buffer: true,
					global: true,
					process: true
				}
			}),
		sveltekit()
	],
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