import { defineConfig, loadEnv } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { publicEnv } from './src/env.config';
import svelteConfig from './svelte.config.js';

const shims = resolve('./src/lib/components/web-components');

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	const missing = Object.entries(publicEnv)
		.filter(([key, { required }]) => required && !env[key])
		.map(([key]) => key);

	if (missing.length > 0) {
		throw new Error(
			`Cannot build the web component: ${missing.join(', ')} ` +
			`${missing.length === 1 ? 'is' : 'are'} missing. ` +
			`Set ${missing.length === 1 ? 'it' : 'them'} in .env or in the build environment.`
		);
	}

	return {
		plugins: [
			svelte({
				preprocess: svelteConfig.preprocess,
				// Only this build wants it: it is what makes <svelte:options customElement>
				// register the tag, and it puts each component's styles in the bundle so
				// they can be injected into the shadow root. The app deliberately does not
				// set it — there it would cost a flash of unstyled content on first paint.
				compilerOptions: { ...svelteConfig.compilerOptions, customElement: true }
			})
		],
		define: Object.fromEntries(
			Object.keys(publicEnv).map((key) => [
				`import.meta.env.${key}`,
				JSON.stringify(env[key] ?? null)
			])
		),
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `
						@use '$lib/styles/variables' as * with ($web-component: true);
					`
				}
			}
		},
		resolve: {
			alias: {
				'$lib': resolve('./src/lib'),
				'$app/env/public': resolve(shims, 'env.web-component.ts'),
				'$app/env': resolve(shims, 'env.web-component.ts'),
				'$app/paths': resolve(shims, 'paths.web-component.ts'),
				'maplibre-gl/dist/maplibre-gl.css': resolve(shims, 'empty.web-component.ts')
			}
		},
		build: {
			lib: {
				entry: resolve(__dirname, 'src/lib/components/web-components/enterprise-directory.ts'),
				name: 'enterprise-directory',
				fileName: 'enterprise-directory',
				formats: ['es' as const]
			},
			outDir: 'dist/web-component',
			emptyOutDir: true,
			rolldownOptions: {
				output: {
					codeSplitting: false
				}
			}
		}
	};
});
