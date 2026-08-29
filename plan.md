# Web component: shadow-root CSS + in-place profile

## Context

The env plumbing is done and `bun run build:web-component` is green, but the artefact is
not yet usable when embedded:

1. **CSS never reaches the component.** The build emits a 364 KB
   `dist/web-component/enterprise-directory.css` sidecar that nothing loads — and because
   the element is `shadow: "open"`, a document-level stylesheet could not style its
   internals anyway. Only the Svelte `<style>` blocks (which the compiler puts in the
   shadow root) currently apply. `reset.scss`, `framework.scss` and maplibre's CSS are all
   lost.
2. **Links point nowhere useful.** `resolve("/enterprises/[id]", …)` yields
   `/enterprises/<id>`, which on a third-party host page resolves against *their* origin.

The outcome we want: one self-contained `.js` file, no sidecar, correct styling inside the
shadow root, and clicking a card opens the profile in place rather than navigating away.
The SvelteKit app's behaviour must not change.

## Decisions taken

- Card click renders `profile.svelte` **in place**; no navigation, no second origin.
- Ship **latin-subset Inter only** (~64 KB base64, down from ~364 KB for all 7 subsets).

## Part 1 — CSS into the shadow root

### 1a. Make the global stylesheets shadow-aware

`src/lib/styles/reset.scss` and `src/lib/styles/framework.scss` both style `:root` and
`body`. Neither selector matches inside a shadow root, so those rules would silently do
nothing. Add `:host` to each selector list — `:host` parses fine outside a shadow tree and
`:root` parses fine inside one, so a single shared file works for both builds:

- `reset.scss`: `:root` → `:root, :host`; `body` → `body, :host`
- `framework.scss`: `:root` → `:root, :host` (this is what stops the host page's font
  inheriting into the component)

While in `framework.scss:46`, fix `:global(.lucide-icon)` → `.lucide-icon`. `:global()`
is not valid CSS and this is a plain stylesheet, not a Svelte `<style>` block, so browsers
drop the whole rule today — the icon styling is broken in **both** builds, and it is what
produces the `lightningcss` warning on every build.

### 1b. Collect the global CSS as strings

New `src/lib/components/web-components/styles.web-component.ts`, importing with `?inline`
so Vite hands back the compiled CSS text instead of extracting it to a file:

- `$lib/styles/reset.scss?inline`
- `$lib/styles/framework.scss?inline`
- `maplibre-gl/dist/maplibre-gl.css?inline`

Export them concatenated inside `@layer` blocks. Cascade layers matter here: Svelte injects
the component `<style>` blocks into the shadow root itself, and layered rules always lose to
unlayered ones regardless of insertion order — so the reset cannot end up overriding
component styles, and `card.svelte`'s `:global(.maplibregl-popup-content)` override still
wins over maplibre's own CSS.

Also export the font CSS (below) plus an `installFont()` that appends it to `document.head`
once, keyed off an id so multiple instances on one page don't duplicate it.

### 1c. Font

New `src/lib/components/web-components/font.web-component.css`: a single hand-written
`@font-face` for `@fontsource-variable/inter/files/inter-latin-wght-normal.woff2`. Vite's
library mode inlines assets unconditionally, so it base64s without any
`assetsInlineLimit` change.

This one **cannot** go in the shadow root — `@font-face` inside a shadow tree is ignored by
browsers, so it has to be injected into `document.head`. That is the one place the component
writes to the host page; `installFont()` keeps it to a single idempotent `<style>` element.

The SvelteKit app keeps importing `@fontsource-variable/inter` as-is — all 7 subsets, fetched
on demand via `unicode-range`, which is the right trade-off when you're not bundling.

### 1d. Stop maplibre's CSS being extracted

`map.svelte:20` does `await import("maplibre-gl/dist/maplibre-gl.css")` inside `onMount`.
That id differs from the `?inline` one, so it would still produce a sidecar. In
`vite.web-component.config.ts`, alias it to a no-op module
(`src/lib/components/web-components/empty.web-component.ts`):

```ts
{ find: /^maplibre-gl\/dist\/maplibre-gl\.css$/, replacement: resolve(shims, 'empty.web-component.ts') }
```

Anchored regex, so the `?inline` import is unaffected. Leaves `map.svelte` untouched.

### 1e. Inject into the shadow root

In `enterprise-directory.svelte`: drop the two side-effect `.scss` imports and the
`@fontsource-variable/inter` import, render the collected CSS as the first node of the
template via `{@html `<style>${shadowStyles}</style>`}`, and call `installFont()` in `onMount`.

## Part 2 — Profile in place

### 2a. Selecting an enterprise

`DirectoryState.selectedEnterprise` (`src/lib/models/state.svelte.ts:9`) already exists and
is referenced nowhere — it becomes the switch. Initialise it to `null` (currently
`$state<Enterprise | null>()` leaves it `undefined`).

`card.svelte` renders `<a href={link}>`, and `card_enterprise.svelte` builds that link. The
obvious change — thread an `onselect` prop down — breaks on `map.svelte:49`, which mounts
`CardEnterprise` imperatively into a maplibre popup with `mount(CardEnterprise, { target, props })`
and **no `context` option**, so the popup card cannot reach `getDirectoryState()`.

Instead, delegate at the web-component root: a single `onclick` on `#layout` in
`enterprise-directory.svelte` that finds `event.target.closest("a[href]")`, matches the href
against `^/enterprises/(.+)$`, looks the enterprise up by `profileId`, sets
`selectedEnterprise`, and calls `preventDefault()`. This is what SvelteKit's own router does
with anchor clicks, and popup content lives inside the shadow root so its clicks bubble to
the handler. Nothing in `card.svelte`, `card_enterprise.svelte`, `directory.svelte` or
`map.svelte` changes, and `card.svelte`'s existing `enterprise_profile_opened` analytics call
still fires.

### 2b. Rendering and closing it

`profile.svelte` is already a `position: fixed; inset: 0` overlay driven by an `enterprise`
prop, so the root renders it directly as a child of `#layout`:

```svelte
{#if userState.selectedEnterprise}
    <Profile enterprise={userState.selectedEnterprise} onback={() => (userState.selectedEnterprise = null)} />
{/if}
```

Its back arrow is `<a href={resolve("/")}>` (`profile.svelte:14`). Add an optional
`onback?: () => void` prop: when supplied render a `<button>` instead of the anchor, keeping
the existing styles. Passed directly parent-to-child here, so no context problem — hence a
plain prop rather than the delegation used in 2a. When absent the app's route
(`src/routes/enterprises/[id]/+page.svelte`) is unaffected.

## Files

| File | Change |
|---|---|
| `src/lib/styles/reset.scss` | `:root, :host` / `body, :host` |
| `src/lib/styles/framework.scss` | `:root, :host`; `:global(.lucide-icon)` → `.lucide-icon` |
| `src/lib/components/web-components/styles.web-component.ts` | new — `?inline` CSS, `@layer` wrapping, `installFont()` |
| `src/lib/components/web-components/font.web-component.css` | new — latin-only `@font-face` |
| `src/lib/components/web-components/empty.web-component.ts` | new — no-op for the maplibre CSS alias |
| `src/lib/components/web-components/enterprise-directory.svelte` | style injection, click delegation, `<Profile>` |
| `src/lib/components/profile.svelte` | optional `onback` prop |
| `src/lib/models/state.svelte.ts` | initialise `selectedEnterprise` to `null` |
| `vite.web-component.config.ts` | maplibre CSS alias |

## Verification

1. `bun run build:web-component` — `dist/web-component/` should contain **only**
   `enterprise-directory.js`. A remaining `.css` file means something is still being
   extracted.
2. Confirm the reset and maplibre CSS are inside the JS and the font is base64:
   `grep -c 'maplibregl-popup' dist/web-component/enterprise-directory.js` and
   `grep -c 'data:font/woff2' dist/web-component/enterprise-directory.js`.
3. Load the artefact in a bare host page (a scratch `.html` with a `<script type="module">`
   and `<enterprise-directory></enterprise-directory>`, served over http so the data fetch
   works) and check: fonts render as Inter; map controls and popups are styled; the reset
   applies; clicking a card opens the profile over the component with no navigation; the
   back arrow closes it.
4. Verify the host page is untouched apart from the one font `<style>` — inspect
   `document.head`, and confirm the host's own styles are unaffected by the reset.
5. `bun run dev` — the SvelteKit app is unchanged: same fonts, same styling, cards still
   navigate to `/enterprises/<id>`, back arrow still links home.
6. `bun run check` and `bun run lint` clean; `bun run build` still succeeds.

## Not in scope

- The 1.9 MB JS bundle (maplibre and posthog dominate). Worth a separate look at whether
  maplibre can be externalised or lazily fetched, but that trades away standalone-ness.
- `DEFAULT_MAP_CENTRE` remains unread; you mentioned wiring it into `map.svelte` later.
