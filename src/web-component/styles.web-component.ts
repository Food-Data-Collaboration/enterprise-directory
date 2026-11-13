import reset from '$lib/styles/reset.scss?inline';
import framework from '$lib/styles/framework.scss?inline';
import leaflet from 'leaflet/dist/leaflet.css?inline';
import fontUrl from 'virtual:enterprise-directory/font-url';

const FONT_STYLE_ID = 'enterprise-directory-font';

/**
 * Latin subset of Inter Variable, as in @fontsource-variable/inter's index.css. The
 * app imports all seven subsets and lets unicode-range pick; the component ships one.
 * Installed in the document, not the shadow root: @font-face doesn't apply from there.
 */
function fontFace(url: string): string {
	return `@font-face {
	font-family: 'Inter Variable';
	font-style: normal;
	font-display: swap;
	font-weight: 100 900;
	src: url(${JSON.stringify(url)}) format('woff2-variations');
	unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC,
		U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
		U+FEFF, U+FFFD;
}`;
}

const componentStyles = '__ENTERPRISE_DIRECTORY_COMPONENT_STYLES__';

export const shadowStyles = [
	'@layer reset, vendor, framework;',
	`@layer reset { ${reset} }`,
	`@layer vendor { ${leaflet} }`,
	`@layer framework { ${framework} }`,
	componentStyles
].join('\n');

export function installFont(): void {
	if (document.getElementById(FONT_STYLE_ID)) return;

	const style = document.createElement('style');
	style.id = FONT_STYLE_ID;
	style.textContent = fontFace(fontUrl);
	document.head.append(style);
}
