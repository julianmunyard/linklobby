---
phase: quick
plan: 069
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/platform-embed.ts
  - src/types/card.ts
  - src/components/editor/music-card-fields.tsx
  - src/components/cards/music-card.tsx
autonomous: true

must_haves:
  truths:
    - "Pasting any Spotify/Apple Music/SoundCloud/Bandcamp/Audiomack URL (even with extra params or unusual format) saves the card with correct platform detected"
    - "Pasting a completely unknown music URL still saves a card with a generic music fallback display"
    - "When an iframe fails to load or URL is non-embeddable, a beautiful platform-colored link card appears instead of an error"
  artifacts:
    - path: "src/lib/platform-embed.ts"
      provides: "detectPlatformLoose() fallback domain detection"
      contains: "detectPlatformLoose"
    - path: "src/components/cards/music-card.tsx"
      provides: "MusicLinkFallback component with platform colors"
      contains: "MusicLinkFallback"
  key_links:
    - from: "src/components/editor/music-card-fields.tsx"
      to: "src/lib/platform-embed.ts"
      via: "detectPlatformLoose fallback when detectPlatform returns null"
      pattern: "detectPlatformLoose"
    - from: "src/components/cards/music-card.tsx"
      to: "MusicCardContent.embeddable"
      via: "renders iframe when embeddable, link fallback when not"
      pattern: "embeddable.*false|MusicLinkFallback"
---

<objective>
Fix music card to accept ANY music URL and show a beautiful fallback instead of rejecting unrecognized links.

Purpose: Users paste music links that fail strict regex (Apple Music share links with extra params, Spotify links with query strings, etc.) and get a dead-end error. Instead, every music URL should produce a card -- embeddable ones get iframes, non-embeddable ones get a styled link card with platform branding.

Output: Updated platform detection with loose fallback, forgiving editor field, and beautiful link-card fallback renderer.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/platform-embed.ts
@src/types/card.ts
@src/components/editor/music-card-fields.tsx
@src/components/cards/music-card.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add loose domain detection and update types</name>
  <files>src/lib/platform-embed.ts, src/types/card.ts</files>
  <action>
  **In `src/lib/platform-embed.ts`:**

  1. Add a new exported function `detectPlatformLoose(url: string): MusicPlatform | 'generic-music' | null` that does simple domain-based matching when `detectPlatform()` returns null. Check these domains:
     - `spotify.com` -> `'spotify'`
     - `music.apple.com` -> `'apple-music'`
     - `soundcloud.com` -> `'soundcloud'`
     - `bandcamp.com` (or `*.bandcamp.com`) -> `'bandcamp'`
     - `audiomack.com` -> `'audiomack'`
     - For any URL that starts with `https://` or `http://` but doesn't match a known music domain, return `'generic-music'`
     - For non-URL strings, return `null`

  Use simple `url.includes()` or `new URL(hostname)` checks -- no complex regex needed. This is the fallback when strict regex fails.

  2. Update `isMusicPlatform()` to also accept `'generic-music'` as a valid music platform string (it won't be in the EmbedPlatform union -- that's fine, this is for the loose path).

  **In `src/types/card.ts`:**

  3. Update `MusicPlatform` type to include `'generic-music'`:
     ```typescript
     export type MusicPlatform = 'spotify' | 'apple-music' | 'soundcloud' | 'bandcamp' | 'audiomack' | 'generic-music'
     ```

  4. Add an `embeddable` boolean field to `MusicCardContent`:
     ```typescript
     embeddable?: boolean  // false when URL was domain-matched but not regex-matched (may not iframe)
     ```
     This defaults to `true` for strict-detected URLs (existing behavior) and `false` for loose-detected URLs.
  </action>
  <verify>Run `npx tsc --noEmit` -- no type errors. Grep for `detectPlatformLoose` to confirm export exists.</verify>
  <done>`detectPlatformLoose` exported from platform-embed.ts. `MusicPlatform` includes `'generic-music'`. `MusicCardContent` has `embeddable?: boolean` field. No type errors.</done>
</task>

<task type="auto">
  <name>Task 2: Make editor accept all music URLs with fallback</name>
  <files>src/components/editor/music-card-fields.tsx</files>
  <action>
  Update `handleUrlBlur()` in music-card-fields.tsx:

  1. Import `detectPlatformLoose` from `@/lib/platform-embed`.

  2. When `detectPlatform(input)` returns null (line 100-103), instead of showing error and returning, try `detectPlatformLoose(input)`:
     - If loose detection returns a `MusicPlatform` (known domain but failed strict regex): save with `embeddable: false`, skip `fetchPlatformEmbed` (it won't work for non-standard URLs). Set `embedUrl: input`, `platform: loosePlatform`, `embedIframeUrl: undefined`.
     - If loose detection returns `'generic-music'` (unknown domain but valid URL): save with `embeddable: false`, `platform: 'generic-music'`, `embedUrl: input`, no iframe URL.
     - If loose detection returns `null` (not even a URL): THEN show the error.

  3. When strict detection succeeds (existing path), explicitly set `embeddable: true` in the onChange call.

  4. Update the `PLATFORM_INFO` record to include `'generic-music'` entry:
     - Use `Music` icon from lucide-react (already imported in music-card.tsx, import here too)
     - Name: `'Music'`

  5. Update the error message to be less likely to appear: it should only show for completely non-URL input now.

  6. Keep the `isMusicPlatform` check for strict-detected platforms (line 108) -- if strict detection returns a VIDEO platform, still show the "use Video card" error. Loose detection only runs when strict detection returns null entirely.
  </action>
  <verify>Run `npx tsc --noEmit` -- no type errors. Open editor, paste a Spotify link with extra query params (e.g. `https://open.spotify.com/track/abc123?si=xyz&utm_source=copy-link`) -- it should save with platform spotify. Paste a random `https://example.com/music` -- it should save as generic-music.</verify>
  <done>Any valid URL pastes successfully into the music card field. Known music domains get platform branding. Unknown domains get generic-music. Only non-URL strings show errors.</done>
</task>

<task type="auto">
  <name>Task 3: Add beautiful link-card fallback in music card renderer</name>
  <files>src/components/cards/music-card.tsx</files>
  <action>
  1. Add `'generic-music'` to `PLATFORM_ICONS` using the `Music` icon from lucide-react (already imported). Add to `PLATFORM_COLORS` with a neutral music color like `'#8B5CF6'` (violet). Add to `EMBED_HEIGHTS` with `152`.

  2. Create a `MusicLinkFallback` component that renders when `content.embeddable === false` OR when `loadError` is true. This replaces the current bare-bones error state. Design:

     ```
     +------------------------------------------+
     |  [Platform Icon]                         |
     |                                          |
     |  {title || "Listen on {Platform}"}       |
     |                                          |
     |  [ Open on {Platform} -> ]  (button)     |
     +------------------------------------------+
     ```

     Styling:
     - Full width, `min-h-[120px]`, rounded corners
     - Background: `bg-black/40` with a subtle left border in `platformColor` (4px)
     - Platform icon: large (h-8 w-8), colored with `platformColor`
     - Title text: `text-sm font-medium text-white`
     - Button: styled link with platform color, `text-xs`, arrow icon, opens `embedUrl` in new tab
     - For `generic-music`: show Music icon, "Open Link" button text
     - Entire card is also clickable (wrapping `<a>` tag) opening `embedUrl` in new tab

  3. Update the main `MusicCard` render logic:
     - After getting content, check `content.embeddable === false` -- if so, render `MusicLinkFallback` immediately (don't attempt iframe).
     - Keep the existing `loadError` path but have it also use `MusicLinkFallback` instead of the current basic error div.
     - The iframe path remains unchanged for `embeddable: true` (or undefined, for backwards compat with existing cards).

  4. Handle the `PlatformIcon` lookup gracefully: if `platform` is not in `PLATFORM_ICONS`, fall back to the `Music` lucide icon. Same for colors (fall back to `'#8B5CF6'`).
  </action>
  <verify>Run `npx tsc --noEmit` -- no type errors. Run `npm run build` to confirm no build errors. Visually: a music card with `embeddable: false` shows the styled link fallback. A music card with `embeddable: true` shows the iframe as before. An iframe load error also shows the styled fallback.</verify>
  <done>Non-embeddable music URLs display a beautiful platform-branded link card. Iframe errors gracefully degrade to the same fallback. All existing embeddable cards continue to work unchanged.</done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with no errors
2. `npm run build` succeeds
3. Paste a standard Spotify track URL -> iframe embed loads (existing behavior preserved)
4. Paste a Spotify URL with extra params like `?si=abc&utm_source=copy` -> card saved with spotify platform, attempts embed
5. Paste an Apple Music share link with unusual format -> card saved with apple-music platform, shows link fallback if embed fails
6. Paste `https://example.com/my-song` -> card saved as generic-music with violet link fallback
7. Paste garbage text `not a url` -> shows error message
8. Existing music cards (already saved with embeddable undefined) continue to render iframes normally
</verification>

<success_criteria>
- ANY valid URL pasted into music card field is accepted and saved
- Known music platform URLs get platform-specific branding (icon + colors)
- Unknown URLs get generic music branding
- Non-embeddable URLs show a beautiful clickable link card instead of an error
- Iframe load failures gracefully degrade to the same link card
- Existing working embeds are completely unaffected
- Zero type errors, build succeeds
</success_criteria>

<output>
After completion, create `.planning/quick/069-fix-music-card-link-paste/069-SUMMARY.md`
</output>
