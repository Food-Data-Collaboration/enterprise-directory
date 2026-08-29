import reset from '$lib/styles/reset.scss?inline';
import framework from '$lib/styles/framework.scss?inline';
import maplibre from 'maplibre-gl/dist/maplibre-gl.css?inline';
import font from './font.web-component.css?inline';

const FONT_STYLE_ID = 'enterprise-directory-font';

/**
 * The global stylesheets, as text, for injection into the shadow root.
 *
 * ?inline keeps Vite from extracting these to a sidecar .css file that nothing on the
 * host page would load — and that could not style the shadow root even if it did.
 *
 * Everything goes in a cascade layer so it cannot outrank the component styles Svelte
 * injects alongside it: layered rules always lose to unlayered ones, whatever order the
 * stylesheets end up in. That keeps the reset from clobbering component styles and lets
 * card.svelte's `:global(.maplibregl-popup-content)` override still beat maplibre's own.
 */
export const shadowStyles = [
	'@layer reset, vendor, framework;',
	`@layer reset { ${reset} }`,
	`@layer vendor { ${maplibre} }`,
	`@layer framework { ${framework} }`
].join('\n');

/**
 * Adds the font to the host document.
 *
 * Browsers ignore @font-face inside a shadow root, so this is the one thing the component
 * cannot keep to itself. Guarded by id so several instances on a page share one copy.
 */
export function installFont(): void {
	if (document.getElementById(FONT_STYLE_ID)) return;

	const style = document.createElement('style');
	style.id = FONT_STYLE_ID;
	style.textContent = font;
	document.head.append(style);
}
