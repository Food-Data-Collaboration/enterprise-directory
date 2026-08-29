/*
 * Stands in for maplibre's stylesheet in the web-component build.
 *
 * map.svelte pulls `maplibre-gl/dist/maplibre-gl.css` in at runtime, which would be
 * extracted to a sidecar file the shadow root can't reach. styles.web-component.ts
 * imports the same stylesheet with ?inline instead, so this makes the runtime import
 * a no-op rather than a second copy.
 */
export {};
