---
phase: quick
plan: 069
subsystem: ui
tags: [music-card, platform-embed, react, typescript, fallback]

requires:
  - phase: 09-platform-integrations
    provides: music card component and platform detection foundation

provides:
  - detectPlatformLoose() for domain-based fallback detection
  - MusicLinkFallback component for non-embeddable URLs
  - embeddable field on MusicCardContent
  - generic-music platform type

affects: [music-card, platform-embed, music-card-fields]

tech-stack:
  added: []
  patterns:
    - "Loose domain detection as fallback when strict regex fails"
    - "embeddable flag controls iframe vs link-card render path"
    - "MusicLinkFallback: platform-colored link card for non-embeddable URLs"

key-files:
  created: []
  modified:
    - src/lib/platform-embed.ts
    - src/types/card.ts
    - src/components/editor/music-card-fields.tsx
    - src/components/cards/music-card.tsx

key-decisions:
  - "detectPlatformLoose uses URL.hostname simple includes() checks — no regex needed for fallback"
  - "generic-music added to MusicPlatform type (not EmbedPlatform) since it has no iframe embed URL"
  - "embeddable: false signals link-fallback path; embeddable: undefined preserves backward compat for existing iframe cards"
  - "isMusicPlatform now accepts EmbedPlatform | string to handle generic-music gracefully"
  - "MusicLinkFallback shows platform icon, title, and ExternalLink button styled with platform color"
  - "Iframe load errors degrade to MusicLinkFallback (same component) instead of bare error div"

patterns-established:
  - "Loose fallback pattern: strict regex first, domain match second, error only for non-URL"
  - "embeddable flag on content determines render path (iframe vs link card)"

duration: 15min
completed: 2026-02-18
---

# Quick Task 069: Fix Music Card Link Paste Summary

**Loose platform detection with domain fallback and platform-colored MusicLinkFallback component — any valid music URL now saves and displays beautifully**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-02-18T07:23:00Z
- **Completed:** 2026-02-18T07:38:29Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Any valid URL pasted into the music card field is accepted — no more dead-end errors for non-standard links
- Spotify/Apple Music/SoundCloud/Bandcamp/Audiomack URLs with extra query params now save with correct platform via loose domain detection
- Unknown music domains (e.g., `https://example.com/my-song`) save as `generic-music` and display a violet link card
- Non-embeddable cards render a beautiful platform-branded `MusicLinkFallback` with icon, title, and external link button
- Iframe load failures also degrade gracefully to `MusicLinkFallback` instead of the old bare error div
- All existing embeddable cards (where `embeddable` is undefined) continue to render iframes unchanged

## Task Commits

1. **Task 1: Add loose domain detection and update types** - `c58b996` (feat)
2. **Task 2: Make editor accept all music URLs with fallback** - `442123c` (feat)
3. **Task 3: Add beautiful link-card fallback in music card renderer** - `78c1e48` (feat)

## Files Created/Modified
- `src/lib/platform-embed.ts` - Added `detectPlatformLoose()`, added `'generic-music'` to `MusicPlatform`, updated `isMusicPlatform()` to accept `string`
- `src/types/card.ts` - Added `'generic-music'` to `MusicPlatform`, added `embeddable?: boolean` to `MusicCardContent`
- `src/components/editor/music-card-fields.tsx` - Added loose fallback path in `handleUrlBlur()`, added `generic-music` to `PLATFORM_INFO`, updated help text
- `src/components/cards/music-card.tsx` - Added `MusicLinkFallback` component, added `generic-music` to all platform record maps, wired fallback render paths

## Decisions Made
- `detectPlatformLoose` uses `new URL(hostname).includes()` checks — simple and reliable, no regex needed for domain matching
- `'generic-music'` is added to `MusicPlatform` but NOT to `EmbedPlatform` — it's a fallback display type, not an actual embeddable platform with an iframe URL
- `embeddable: undefined` on existing saved cards is treated as `true` (backward compatible, iframes still load)
- `isMusicPlatform` signature changed to `EmbedPlatform | string` to accept `generic-music` without TypeScript errors
- `MusicLinkFallback` is also used for iframe load errors (replaces old bare error div) — single fallback component for all non-iframe states

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Music card now handles any URL gracefully
- Future improvement: for non-embeddable known platforms, could attempt oEmbed to get title metadata (currently skipped)
- Bandcamp embed code path continues to work unchanged

---
*Phase: quick*
*Completed: 2026-02-18*
