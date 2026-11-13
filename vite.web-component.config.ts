import { defineConfig, loadEnv, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { publicEnv } from './src/env.config';
import svelteConfig from './svelte.config.js';

const shims = resolve('./src/web-component');

const COMPONENT_STYLES_TOKEN = '__ENTERPRISE_DIRECTORY_COMPONENT_STYLES__';

function inlineComponentStyles(): Plugin {
	return {
		name: 'inline-component-styles',
		enforce: 'post',
		generateBundle(_options, bundle) {
			const stylesheets = Object.keys(bundle).filter((file) => file.endsWith('.css'));

			const css = stylesheets
				.map((file) => {
					const { source } = bundle[file] as { source: string | Uint8Array };
					delete bundle[file];
					return typeof source === 'string' ? source : Buffer.from(source).toString('utf8');
				})
				.join('\n');

			if (css.length === 0) {
				throw new Error(
					'Cannot build the web component: rolldown extracted no component CSS. ' +
					'Check that customElement is still scoped to the root component, or the ' +
					'components compile in injected mode and their styles never reach the shadow root.'
				);
			}

			const chunks = Object.values(bundle).filter(
				(output) => output.type === 'chunk' && output.code.includes(COMPONENT_STYLES_TOKEN)
			);

			if (chunks.length === 0) {
				throw new Error(
					`Cannot build the web component: ${COMPONENT_STYLES_TOKEN} is not in the bundle. ` +
					'styles.web-component.ts must ship it in place of the component CSS.'
				);
			}

			for (const chunk of chunks) {
				if (chunk.type !== 'chunk') continue;
				chunk.code = chunk.code.replaceAll(COMPONENT_STYLES_TOKEN, escapeStringLiteral(css));
			}
		}
	};
}

const ENV_MODULE_ID = '\0enterprise-directory:env';

/**
 * Stands in for `$app/env` and `$app/env/public`, which only exist under SvelteKit.
 * Generated from `publicEnv` so every declared variable reaches the component
 * without a hand-kept export list.
 */
function envModule(env: Record<string, string>): Plugin {
	return {
		name: 'enterprise-directory-env',
		enforce: 'pre',
		resolveId(source) {
			if (source === '$app/env' || source === '$app/env/public') return ENV_MODULE_ID;
		},
		load(id) {
			if (id !== ENV_MODULE_ID) return;

			const values = Object.keys(publicEnv).map(
				(key) => `export const ${key} = ${JSON.stringify(env[key]) ?? 'undefined'};`
			);
			return [...values, 'export const dev = import.meta.env.DEV;', 'export const browser = true;'].join('\n');
		}
	};
}

function escapeStringLiteral(css: string): string {
	return css
		.replace(/\\/g, '\\\\')
		.replace(/["'`$]/g, (character) => `\\${character}`)
		.replace(/\n/g, '\\n')
		.replace(/\r/g, '\\r')
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');
}

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
				compilerOptions: {
					...svelteConfig.compilerOptions,
					customElement: ({ filename }) =>
						filename.endsWith('enterprise-directory.svelte')
				}
			}),
			inlineComponentStyles(),
			envModule(env)
		],
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
				'$app/paths': resolve(shims, 'paths.web-component.ts'),
				'maplibre-gl/dist/maplibre-gl.css': resolve(shims, 'empty.web-component.ts')
			}
		},
		build: {
			lib: {
				entry: resolve(__dirname, 'src/web-component/enterprise-directory.ts'),
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
