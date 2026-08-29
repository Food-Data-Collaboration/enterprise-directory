import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// import { loadEnv } from 'vite';
// const env = loadEnv(process.env.NODE_ENV, process.cwd(), '');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true

		// customElement lives in vite.web-component.config.ts, not here. Enabling it for
		// the app makes Svelte hand every component's <style> to the runtime as a string
		// instead of letting SvelteKit extract it to a stylesheet, so the CSS only lands
		// once hydration runs — an unstyled flash on first paint.
	},
	kit: {
		adapter: adapter(),
		paths: {
			relative: false
		},
		experimental: {
			explicitEnvironmentVariables: true
		}
	}

};

export default config;
