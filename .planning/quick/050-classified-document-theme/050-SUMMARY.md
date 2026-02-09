# Quick Task 050: Classified Document Theme

## Summary

Added a "Classified" theme to LinkLobby -- a WWII military classified document aesthetic with pink/salmon paper, red title/stamps, purple-blue typewriter text, "CLASSIFIED" rubber stamps, and centered links on A4-style paper.

## Changes

### Task 1: Theme Config, Type Registration, Font Setup
**Commit:** `3ca9a15`

- Added `'classified'` to ThemeId union in `src/types/theme.ts`
- Created `src/lib/themes/classified.ts` with ThemeConfig:
  - Pink/salmon paper (#E8A0A0), red stamps (#CC0000), purple-blue text (#3B2F7E)
  - 4 palettes: War Department, Top Secret, Intelligence Bureau, Field Report
- Registered theme in `src/lib/themes/index.ts` (THEMES array + THEME_IDS)
- Added Special Elite Google Font in `src/app/fonts.ts` (real 1940s Smith Corona typewriter font)

### Task 2: Editor Layout Component + CSS
**Commit:** `c8dcdf0`

- Created `src/components/cards/classified-layout.tsx` (editor preview):
  - Punch holes at top (3 circles)
  - "CLASSIFIED" red rubber stamps (top and bottom, slightly rotated)
  - "WAR DEPARTMENT / CLASSIFIED MESSAGE CENTER / INCOMING MESSAGE" header in red
  - Document metadata (DATE, TIME, REF NO, CLASSIFICATION: SECRET)
  - Links displayed as centered uppercase typewriter text
  - Text cards as section headers, audio cards with receipt variant
  - Release cards with "INCOMING INTELLIGENCE" / "DECLASSIFIES IN" countdown
  - Social icons row, "END OF MESSAGE" footer
  - Keyboard navigation (ArrowUp/Down/Enter)
- Added CSS styles in `src/app/globals.css`:
  - `.classified-paper` (420px A4 container with paper texture overlay)
  - `.classified-stamp` (red rubber stamp with letter-spacing and text-shadow)
  - `.classified-punch-hole` (14px circles)
  - `.classified-item` / `.classified-item-selected` (link hover/selection)
  - `.classified-divider` (dash dividers)
  - Responsive: full width on mobile
- Added preview routing in `src/app/preview/page.tsx`

### Task 3: Static Public Layout + Routing
**Commit:** `c8dcdf0` (same commit)

- Created `src/components/public/static-classified-layout.tsx`:
  - Same visual as editor but with `<a>` tags for links
  - `isMounted` guard for countdown hydration safety
  - Legal footer (Privacy Policy, Terms, Powered by LinkLobby)
- Added public page routing in `src/components/public/public-page-renderer.tsx`

## Architecture

Follows exact same pattern as Receipt/VCR/iPod/Lanyard themes:
- `isListLayout: true` in ThemeConfig
- Custom layout component for editor preview
- Separate static layout component for public pages
- Theme routing via `themeId === 'classified'` conditionals

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Special Elite Google Font | Real 1940s Smith Corona typewriter font - perfect match for military docs |
| 420px paper width | Wider than receipt (320px) to suggest A4 proportions |
| Reuse paper-texture.jpeg | Same paper grain overlay as receipt theme |
| No dithered photo/stickers | Classified docs don't have photos - cleaner military aesthetic |
| "receipt" audio themeVariant | Reuse receipt's audio styling - similar paper aesthetic |
| Red accent for stamps + headers | Distinct from purple-blue body text, matches real classified docs |
