import { nodePolyfills } from 'vite-plugin-node-polyfills';

/** Browser polyfills for Comunica (used by ldkit), shared by both builds' worker bundles. */
export function workerPolyfills() {
	return nodePolyfills({
		// Rolldown's runtime imports createRequire from node:module.
		exclude: ['module'],
		globals: {
			Buffer: true,
			global: true,
			process: true
		}
	});
}
