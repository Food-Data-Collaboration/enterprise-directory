import { defineConfig, loadEnv } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { publicEnv } from './src/env.config';

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
		plugins: [svelte()],
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
						@use '$lib/styles/variables' as *;
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
				// styles.web-component.ts imports this with ?inline, which does not match
				// here, so map.svelte's runtime import becomes a no-op instead of a sidecar.
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

			// Fold dynamic imports into the one file rather than emitting side chunks
			// that whoever embeds the element would have to host alongside it.
			rolldownOptions: {
				output: {
					codeSplitting: false
				}
			}
		}
	};
});
