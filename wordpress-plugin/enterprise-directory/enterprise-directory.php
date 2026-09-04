<?php
/**
 * Plugin Name:       Enterprise Directory
 * Plugin URI:        https://wc.platypusdigital.com.au
 * Description:       Embeds the Enterprise Directory web component in a container you size. Use the [enterprise_directory] shortcode or the Enterprise Directory block.
 * Version:           1.0.0
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Author:            Platypus Digital
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       enterprise-directory
 *
 * The web component is a single self-contained ES module: all CSS is inlined into the
 * JS and injected into an open shadow root, so there is no stylesheet to enqueue and
 * nothing to configure. The element exposes no attributes -- it fills whatever box it
 * is given -- so this plugin's only job is to emit a correctly sized container and
 * load the module once per page.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'ENTERPRISE_DIRECTORY_VERSION', '1.0.0' );
define( 'ENTERPRISE_DIRECTORY_HANDLE', 'enterprise-directory' );
define( 'ENTERPRISE_DIRECTORY_EDITOR_HANDLE', 'enterprise-directory-editor' );
define( 'ENTERPRISE_DIRECTORY_DIAGNOSTIC_HANDLE', 'enterprise-directory-diagnostic' );
define( 'ENTERPRISE_DIRECTORY_SCRIPT_SRC', 'https://wc.platypusdigital.com.au/enterprise-directory.js' );
define( 'ENTERPRISE_DIRECTORY_DEFAULT_HEIGHT', '700px' );
define( 'ENTERPRISE_DIRECTORY_DEFAULT_WIDTH', '100%' );
define( 'ENTERPRISE_DIRECTORY_FILE', __FILE__ );

/**
 * URL of the web component module.
 *
 * Filter `enterprise_directory_script_src` to repoint this at a staging or local build,
 * e.g. from a theme's functions.php:
 *
 *     add_filter( 'enterprise_directory_script_src', function () {
 *         return 'http://localhost:4173/dist/web-component/enterprise-directory.js';
 *     } );
 *
 * @return string
 */
function enterprise_directory_script_src() {
	return (string) apply_filters( 'enterprise_directory_script_src', ENTERPRISE_DIRECTORY_SCRIPT_SRC );
}

/**
 * Cache-busting version appended to the module URL.
 *
 * The hosted bundle has a stable, unhashed filename, so the query string is the only
 * lever this plugin has over browser caching. Bump the plugin version -- or filter
 * `enterprise_directory_script_version` -- after redeploying the component to force
 * clients to pick it up.
 *
 * @return string|null
 */
function enterprise_directory_script_version() {
	$version = apply_filters( 'enterprise_directory_script_version', ENTERPRISE_DIRECTORY_VERSION );

	return ( null === $version || false === $version ) ? null : (string) $version;
}

/**
 * Register the module and the block editor script.
 *
 * Registered on `init` rather than enqueued, so the component only loads on pages that
 * actually render a shortcode or block (see enterprise_directory_markup()).
 *
 * @return void
 */
function enterprise_directory_register_scripts() {
	wp_register_script(
		ENTERPRISE_DIRECTORY_HANDLE,
		enterprise_directory_script_src(),
		array(),
		enterprise_directory_script_version(),
		true
	);

	wp_register_script(
		ENTERPRISE_DIRECTORY_EDITOR_HANDLE,
		plugins_url( 'blocks/enterprise-directory/index.js', ENTERPRISE_DIRECTORY_FILE ),
		array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n' ),
		ENTERPRISE_DIRECTORY_VERSION,
		true
	);

	// The editor script injects the module into the (possibly iframed) canvas itself,
	// so it needs the same URL the front end uses.
	wp_localize_script(
		ENTERPRISE_DIRECTORY_EDITOR_HANDLE,
		'enterpriseDirectorySettings',
		array(
			'scriptSrc'     => enterprise_directory_script_src(),
			'defaultHeight' => ENTERPRISE_DIRECTORY_DEFAULT_HEIGHT,
			'defaultWidth'  => ENTERPRISE_DIRECTORY_DEFAULT_WIDTH,
		)
	);
}
add_action( 'init', 'enterprise_directory_register_scripts' );

/**
 * Serve the bundle as an ES module.
 *
 * The build emits `format: ['es']`, so a classic <script src> would throw on its first
 * `import`. `wp_enqueue_script_module()` would do this natively but is WP 6.5+ only;
 * rewriting the tag keeps the plugin working on older sites. Modules are deferred by
 * default, so no additional loading strategy is needed.
 *
 * @param string $tag    The full script tag.
 * @param string $handle Script handle.
 * @return string
 */
function enterprise_directory_module_script_tag( $tag, $handle ) {
	if ( ENTERPRISE_DIRECTORY_HANDLE !== $handle ) {
		return $tag;
	}

	$tag = preg_replace( '/\stype=(["\'])[^"\']*\1/', '', $tag );

	return preg_replace( '/<script(?=[\s>])/', '<script type="module"', $tag, 1 );
}
add_filter( 'script_loader_tag', 'enterprise_directory_module_script_tag', 10, 2 );

/**
 * Validate a user-supplied CSS length.
 *
 * Shortcode and block attributes are author-supplied and land in a style attribute, so
 * anything that is not recognisably a single length is discarded in favour of the
 * default rather than passed through.
 *
 * @param mixed  $value    Raw attribute value.
 * @param string $fallback Value to use when $value is not a usable length.
 * @return string
 */
function enterprise_directory_sanitize_length( $value, $fallback ) {
	$value = trim( (string) $value );

	if ( '' === $value ) {
		return $fallback;
	}

	// A bare number is the mistake authors actually make: height="700".
	if ( preg_match( '/^\d+(?:\.\d+)?$/', $value ) ) {
		return $value . 'px';
	}

	$units = 'px|%|em|rem|ex|ch|vh|vw|vmin|vmax|svh|lvh|dvh|svw|lvw|dvw|cqw|cqh|cqi|cqb|pt|pc|cm|mm|in|Q';

	if ( preg_match( '/^\d*\.?\d+(?:' . $units . ')$/i', $value ) ) {
		return $value;
	}

	$keywords = array( 'auto', 'fit-content', 'max-content', 'min-content', 'inherit', 'initial', 'unset', 'revert' );

	if ( in_array( strtolower( $value ), $keywords, true ) ) {
		return strtolower( $value );
	}

	// calc(), clamp(), min() and max() are the useful responsive escape hatches. Allow
	// them, but only over a character set that cannot terminate the declaration or
	// smuggle in another property, a url() or a custom property.
	if ( preg_match( '/^(?:calc|clamp|min|max)\([0-9a-z%.,+\-*\/() ]{1,200}\)$/i', $value )
		&& ! preg_match( '/url|var|expression|attr|image|element/i', $value ) ) {
		return $value;
	}

	return $fallback;
}

/**
 * Explain a silently failed embed to users who can fix it.
 *
 * If the module never loads, the container is simply an empty box -- there is no error
 * for a site owner to act on. The likeliest cause by far is that the host serving the
 * component does not send an `Access-Control-Allow-Origin` header: unlike a classic
 * script, a cross-origin ES module is always fetched in CORS mode, so without that
 * header the browser blocks it.
 *
 * Only rendered for users who can edit posts, so visitors never see diagnostics.
 *
 * @return void
 */
function enterprise_directory_enqueue_editor_diagnostic() {
	static $done = false;

	if ( $done || ! function_exists( 'current_user_can' ) || ! current_user_can( 'edit_posts' ) ) {
		return;
	}

	$done = true;

	wp_register_script( ENTERPRISE_DIRECTORY_DIAGNOSTIC_HANDLE, false, array(), ENTERPRISE_DIRECTORY_VERSION, true );
	wp_enqueue_script( ENTERPRISE_DIRECTORY_DIAGNOSTIC_HANDLE );

	$message = __( 'Enterprise Directory: the component script did not load. Check the browser console — a cross-origin module needs an Access-Control-Allow-Origin header on %s. Only editors see this message.', 'enterprise-directory' );

	wp_add_inline_script(
		ENTERPRISE_DIRECTORY_DIAGNOSTIC_HANDLE,
		sprintf(
			'window.addEventListener("load",function(){setTimeout(function(){' .
			'if(window.customElements&&window.customElements.get("enterprise-directory"))return;' .
			'var m=%s;' .
			'document.querySelectorAll(".wp-enterprise-directory").forEach(function(n){' .
			'if(n.querySelector(".wp-enterprise-directory__notice"))return;' .
			'var p=document.createElement("p");' .
			'p.className="wp-enterprise-directory__notice";' .
			'p.style.cssText="margin:0;padding:12px 16px;border:1px solid #d63638;background:#fcf0f1;color:#1e1e1e;font:14px/1.5 system-ui,sans-serif";' .
			'p.textContent=m;n.prepend(p);});},%d);});',
			wp_json_encode( sprintf( $message, enterprise_directory_script_src() ) ),
			(int) apply_filters( 'enterprise_directory_diagnostic_delay', 6000 )
		)
	);
}

/**
 * Build the sized container and the custom element inside it.
 *
 * Shared by the shortcode and the block so there is one definition of the markup.
 * Enqueues the module here rather than on `wp_enqueue_scripts` so it is only requested
 * on pages that embed the directory; WP de-duplicates across multiple instances.
 *
 * @param string $wrapper_attributes Pre-escaped attribute string for the container.
 * @return string
 */
function enterprise_directory_markup( $wrapper_attributes ) {
	wp_enqueue_script( ENTERPRISE_DIRECTORY_HANDLE );
	enterprise_directory_enqueue_editor_diagnostic();

	return sprintf(
		'<div %s><enterprise-directory></enterprise-directory></div>',
		$wrapper_attributes
	);
}

/**
 * Inline style declaration for the container.
 *
 * @param string $height Validated CSS height.
 * @param string $width  Validated CSS width.
 * @return string
 */
function enterprise_directory_container_style( $height, $width ) {
	return sprintf( 'height:%s;width:%s;', $height, $width );
}

/**
 * [enterprise_directory] shortcode.
 *
 * @param array $atts Shortcode attributes.
 * @return string
 */
function enterprise_directory_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'height' => ENTERPRISE_DIRECTORY_DEFAULT_HEIGHT,
			'width'  => ENTERPRISE_DIRECTORY_DEFAULT_WIDTH,
			'class'  => '',
		),
		$atts,
		'enterprise_directory'
	);

	$height = enterprise_directory_sanitize_length( $atts['height'], ENTERPRISE_DIRECTORY_DEFAULT_HEIGHT );
	$width  = enterprise_directory_sanitize_length( $atts['width'], ENTERPRISE_DIRECTORY_DEFAULT_WIDTH );

	$classes = array( 'wp-enterprise-directory' );

	foreach ( preg_split( '/\s+/', (string) $atts['class'], -1, PREG_SPLIT_NO_EMPTY ) as $class ) {
		$classes[] = sanitize_html_class( $class );
	}

	$wrapper_attributes = sprintf(
		'class="%s" style="%s"',
		esc_attr( implode( ' ', array_filter( $classes ) ) ),
		esc_attr( enterprise_directory_container_style( $height, $width ) )
	);

	return enterprise_directory_markup( $wrapper_attributes );
}
add_shortcode( 'enterprise_directory', 'enterprise_directory_shortcode' );

/**
 * Render callback for the block.
 *
 * @param array $attributes Block attributes.
 * @return string
 */
function enterprise_directory_render_block( $attributes ) {
	$height = enterprise_directory_sanitize_length(
		isset( $attributes['height'] ) ? $attributes['height'] : '',
		ENTERPRISE_DIRECTORY_DEFAULT_HEIGHT
	);
	$width  = enterprise_directory_sanitize_length(
		isset( $attributes['width'] ) ? $attributes['width'] : '',
		ENTERPRISE_DIRECTORY_DEFAULT_WIDTH
	);

	// Merges in the block supports the user configured (alignment, margin, anchor).
	$wrapper_attributes = get_block_wrapper_attributes(
		array(
			'class' => 'wp-enterprise-directory',
			'style' => enterprise_directory_container_style( $height, $width ),
		)
	);

	return enterprise_directory_markup( $wrapper_attributes );
}

/**
 * Register the block from its block.json.
 *
 * @return void
 */
function enterprise_directory_register_block() {
	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}

	register_block_type(
		__DIR__ . '/blocks/enterprise-directory',
		array( 'render_callback' => 'enterprise_directory_render_block' )
	);
}
add_action( 'init', 'enterprise_directory_register_block' );
