# Quick Task 050: Classified Document Theme

## Summary

Added a "Classified" theme to LinkLobby - a WWII military classified document aesthetic with pink/salmon paper, red title/stamps, purple-blue typewriter text, "CLASSIFIED" rubber stamps, and centered links on A4-style paper.

## Changes

### Task 1: Theme config, type registration, font setup
- Added `'classified'` to ThemeId union type in `src/types/theme.ts`
- Created `src/lib/themes/classified.ts` with ThemeConfig:
  - Pink/salmon paper (#E8A0A0), red stamps (#CC0000), purple-blue text (#3B2F7E)
  - 4 palettes: War Department, Top Secret, Intelligence Bureau, Field Report
  - `isListLayout: true` for custom layout routing
- Registered theme in `src/lib/themes/index.ts` (THEMES array + THEME_IDS)
- Added Special Elite Google Font in `src/app/fonts.ts` (real 1940s Smith Corona typewriter font)

### Task 2: Editor preview layout and CSS
- Created `src/components/cards/classified-layout.tsx`:
  - A4-style paper with pink/salmon background
  - Three punch holes at top
  - Red "CLASSIFIED" rubber stamps (top and bottom, slightly rotated)
  - Red "WAR DEPARTMENT / CLASSIFIED MESSAGE CENTER / INCOMING MESSAGE" header
  - Document metadata (DATE, TIME, REF NO, CLASSIFICATION: SECRET)
  - User's display name as "Subject:" in red
  - Links displayed as centered uppercase typewriter text in purple-blue
  - Text cards as section markers (--- TEXT ---)
  - Audio player integration (receipt variant)
  - Release card countdown support
  - Social icons row
  - "END OF MESSAGE" footer
  - Keyboard navigation (Arrow Up/Down, Enter)
- Added CSS in `src/app/globals.css`:
  - `.classified-paper` (420px width, paper shadow, texture overlay)
  - `.classified-stamp` (red border, letter-spacing, ink bleed text-shadow)
  - `.classified-punch-hole` (14px circles)
  - `.classified-item` (hover underline, keyboard selection highlight)
  - `.classified-divider` (dashed separator)
  - Responsive: 100% width on mobile
- Added preview routing in `src/app/preview/page.tsx`

### Task 3: Static public layout and routing
- Created `src/components/public/static-classified-layout.tsx`:
  - Same visual as editor but with `<a>` tags for links
  - Hydration-safe countdown (isMounted guard)
  - Legal footer (Privacy Policy, Terms, Powered by LinkLobby)
- Added routing in `src/components/public/public-page-renderer.tsx`

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Special Elite from Google Fonts | Real 1940s Smith Corona typewriter font - perfect match |
| 420px paper width | Wider than receipt (320px) to suggest A4 proportions |
| Reuse paper-texture.jpeg | Same paper grain overlay as receipt theme |
| No dithered photo | Classified documents don't have photos |
| No stickers or barcode | Clean military document aesthetic |
| No torn edges | Clean-cut A4 paper edges |
| Audio uses receipt variant | Reuses existing themed audio player |

## Commits

- `3ca9a15` - feat(quick-050): add classified theme config and Special Elite font
- `c8dcdf0` - feat(quick-050): add classified document layout and CSS styles

## Files Modified

- `src/types/theme.ts` - Added 'classified' to ThemeId
- `src/lib/themes/classified.ts` - NEW: Theme configuration
- `src/lib/themes/index.ts` - Registered theme
- `src/app/fonts.ts` - Added Special Elite font
- `src/components/cards/classified-layout.tsx` - NEW: Editor layout
- `src/components/public/static-classified-layout.tsx` - NEW: Public layout
- `src/app/globals.css` - Added classified CSS
- `src/app/preview/page.tsx` - Added preview routing
- `src/components/public/public-page-renderer.tsx` - Added public routing
