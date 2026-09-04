=== Enterprise Directory ===
Contributors: platypusdigital
Tags: directory, map, enterprise, block, shortcode
Requires at least: 6.1
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Embed the Enterprise Directory on any page or post, in a container you size.

== Description ==

Adds two ways to place the Enterprise Directory on a page:

* The `[enterprise_directory]` shortcode, for the classic editor and page builders.
* The **Enterprise Directory** block, with height and width controls in the sidebar.

The directory itself is a web component loaded from wc.platypusdigital.com.au. It renders
inside a shadow root, so it neither inherits your theme's CSS nor leaks its own, and it
expands to fill whatever container it is given. Sizing that container is the only thing
this plugin configures.

The script is requested only on pages that actually contain the shortcode or the block,
and only once per page no matter how many instances are present.

== Requirements for the component host ==

The component is delivered as an ES module. Unlike a classic script, a cross-origin ES
module is **always** fetched in CORS mode, so the server hosting it must send an
`Access-Control-Allow-Origin` header or every browser will refuse to run it and the
embed will be an empty box. The same applies to the API the component fetches its data
from.

For nginx:

    location ~* \.js$ {
        add_header Access-Control-Allow-Origin "*" always;
        add_header Cache-Control "public, max-age=300" always;
    }

Editors and administrators see an on-page notice if the script fails to load. Visitors
never see it.

== Installation ==

1. Copy the `enterprise-directory` folder into `wp-content/plugins/`.
2. Activate **Enterprise Directory** in Plugins.
3. Add the block, or the `[enterprise_directory]` shortcode, to a page.

== Usage ==

Shortcode, with defaults (height 700px, full width):

    [enterprise_directory]

Both attributes accept any CSS length -- `px`, `%`, `vh`, `rem`, `calc()`, `clamp()`,
`min()`, `max()`. A bare number is read as pixels. An unrecognised value falls back to
the default rather than being passed through to the page.

    [enterprise_directory height="80vh"]
    [enterprise_directory height="calc(100vh - 120px)" width="100%"]
    [enterprise_directory height="600" class="my-embed"]

Give the container a definite height. The directory scrolls internally, so a height of
`auto` collapses it.

== Frequently Asked Questions ==

= How do I point this at a staging build of the component? =

Filter the script URL from your theme's `functions.php`:

    add_filter( 'enterprise_directory_script_src', function () {
        return 'https://staging.example.com/enterprise-directory.js';
    } );

= I redeployed the component but visitors still see the old one. =

The hosted filename is not content-hashed, so caching is keyed on the `?ver=` query
string. Bump the plugin version, or filter it:

    add_filter( 'enterprise_directory_script_version', function () {
        return '2026-09-02';
    } );

= The block shows an empty box in the editor. =

Turn off **Live preview** in the block sidebar to show a placeholder instead. The front
end is unaffected.

= Does this send data to third parties? =

Yes. The component fetches directory data from its API host, loads map tiles, and its
build may include analytics. All of that is fixed when the component is built, not
configurable from WordPress. Account for it in your site's privacy policy and cookie
notice.

== Changelog ==

= 1.0.0 =
* Initial release: `[enterprise_directory]` shortcode and Enterprise Directory block
  with height and width controls.
