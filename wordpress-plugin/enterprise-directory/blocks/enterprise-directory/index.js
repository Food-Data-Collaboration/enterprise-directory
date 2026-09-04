/**
 * Editor script for the Enterprise Directory block.
 *
 * Written against the `wp.*` globals with no JSX, so the plugin ships without a build
 * step and can be dropped straight into wp-content/plugins.
 */
( function ( wp, settings ) {
	'use strict';

	var el = wp.element.createElement;
	var useRef = wp.element.useRef;
	var useEffect = wp.element.useEffect;
	var Fragment = wp.element.Fragment;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var PanelBody = wp.components.PanelBody;
	var TextControl = wp.components.TextControl;
	var ToggleControl = wp.components.ToggleControl;
	var __ = wp.i18n.__;

	var TAG = 'enterprise-directory';
	var DEFAULT_HEIGHT = settings.defaultHeight || '700px';
	var DEFAULT_WIDTH = settings.defaultWidth || '100%';

	/**
	 * Load the web component module into the document that actually contains the block.
	 *
	 * The block editor canvas is its own iframe and custom element registries are
	 * per-window, so a module enqueued into the outer admin page would never upgrade
	 * <enterprise-directory> inside the canvas. Injecting into node.ownerDocument works
	 * whether or not the canvas is iframed.
	 *
	 * @param {Element|null} node Any element inside the target document.
	 */
	function loadComponent( node ) {
		var doc = node && node.ownerDocument;

		if ( ! doc || ! doc.head || ! settings.scriptSrc ) {
			return;
		}

		var view = doc.defaultView;

		if ( view && view.customElements && view.customElements.get( TAG ) ) {
			return;
		}

		if ( doc.querySelector( 'script[data-enterprise-directory]' ) ) {
			return;
		}

		var script = doc.createElement( 'script' );

		script.type = 'module';
		script.src = settings.scriptSrc;
		script.setAttribute( 'data-enterprise-directory', 'true' );
		doc.head.appendChild( script );
	}

	function Placeholder() {
		return el(
			'div',
			{ className: 'wp-enterprise-directory__placeholder' },
			el( 'span', { className: 'dashicons dashicons-location-alt' } ),
			el( 'strong', null, __( 'Enterprise Directory', 'enterprise-directory' ) ),
			el(
				'span',
				null,
				__( 'The directory renders on the published page.', 'enterprise-directory' )
			)
		);
	}

	function Edit( props ) {
		var attributes = props.attributes;
		var setAttributes = props.setAttributes;
		var livePreview = attributes.livePreview;
		var ref = useRef( null );

		useEffect( function () {
			if ( livePreview ) {
				loadComponent( ref.current );
			}
		}, [ livePreview ] );

		var blockProps = useBlockProps( {
			ref: ref,
			className: 'wp-enterprise-directory',
			style: {
				height: attributes.height || DEFAULT_HEIGHT,
				width: attributes.width || DEFAULT_WIDTH,
			},
		} );

		var controls = el(
			InspectorControls,
			null,
			el(
				PanelBody,
				{ title: __( 'Container size', 'enterprise-directory' ) },
				el( TextControl, {
					label: __( 'Height', 'enterprise-directory' ),
					value: attributes.height,
					placeholder: DEFAULT_HEIGHT,
					help: __(
						'Any CSS length: 700px, 80vh, calc(100vh - 120px). The directory scrolls inside this height.',
						'enterprise-directory'
					),
					onChange: function ( value ) {
						setAttributes( { height: value } );
					},
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
				} ),
				el( TextControl, {
					label: __( 'Width', 'enterprise-directory' ),
					value: attributes.width,
					placeholder: DEFAULT_WIDTH,
					help: __( 'Defaults to the full width of the column.', 'enterprise-directory' ),
					onChange: function ( value ) {
						setAttributes( { width: value } );
					},
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
				} ),
				el( ToggleControl, {
					label: __( 'Live preview', 'enterprise-directory' ),
					checked: livePreview,
					help: livePreview
						? __( 'Loads the directory in the editor. Turn off for a faster editor.', 'enterprise-directory' )
						: __( 'Showing a placeholder instead of the directory.', 'enterprise-directory' ),
					onChange: function ( value ) {
						setAttributes( { livePreview: value } );
					},
					__nextHasNoMarginBottom: true,
				} )
			)
		);

		// Interaction is suppressed so the map and directory cannot swallow editor
		// clicks (and so browsing the preview does not emit analytics events).
		var preview = livePreview
			? el(
					'div',
					{ className: 'wp-enterprise-directory__preview' },
					el( TAG, null )
			  )
			: el( Placeholder );

		return el( Fragment, null, controls, el( 'div', blockProps, preview ) );
	}

	wp.blocks.registerBlockType( 'platypus/enterprise-directory', {
		edit: Edit,
		save: function () {
			return null;
		},
	} );
} )( window.wp, window.enterpriseDirectorySettings || {} );
