import reset from '$lib/styles/reset.scss?inline';
import framework from '$lib/styles/framework.scss?inline';
import maplibre from 'maplibre-gl/dist/maplibre-gl.css?inline';
import font from './font.web-component.css?inline';

const FONT_STYLE_ID = 'enterprise-directory-font';

const componentStyles = '__ENTERPRISE_DIRECTORY_COMPONENT_STYLES__';

export const shadowStyles = [
	'@layer reset, vendor, framework;',
	`@layer reset { ${reset} }`,
	`@layer vendor { ${maplibre} }`,
	`@layer framework { ${framework} }`,
	componentStyles
].join('\n');

export function installFont(): void {
	if (document.getElementById(FONT_STYLE_ID)) return;

	const style = document.createElement('style');
	style.id = FONT_STYLE_ID;
	style.textContent = font;
	document.head.append(style);
}
