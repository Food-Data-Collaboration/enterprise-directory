/**
 * `$app/paths` stand-in for the web-app web-component build.
 *
 * The custom element has no SvelteKit router behind it, so there is no base
 * path to prepend and nothing to look routes up in. `resolve` just fills the
 * parameters into the route id, leaving links relative to whichever page the
 * element is web-component in.
 */

export const base = '';
export const assets = '';

type RouteParams = Record<string, string | string[] | undefined>;

/** Matches `[id]`, `[[optional]]`, `[...rest]` and `[id=matcher]` segments. */
const PARAMETER = /^\[+(\.\.\.)?([^\]=]+)(?:=[^\]]+)?\]+$/;

export function resolve(route: string, params: RouteParams = {}): string {
	const path = route
		.split('/')
		.map((segment) => {
			const parameter = PARAMETER.exec(segment);
			if (!parameter) return segment;

			const value = params[parameter[2]];
			return Array.isArray(value) ? value.join('/') : (value ?? '');
		})
		// Drop segments left empty by an absent optional or rest parameter, but
		// keep the leading '' that gives an absolute route its opening slash.
		.filter((segment, index) => index === 0 || segment !== '')
		.join('/');

	return path === '' ? '/' : path;
}

export function asset(file: string): string {
	return file;
}
