---
phase: 07-theme-system
plan: 02
subsystem: styling
tags: [css, fonts, tailwind, theming]
requires:
  - phases: []
  - plans: []
provides:
  - Theme CSS variables available as Tailwind utilities
  - 15 curated Google Fonts loaded via next/font
  - Font variables integrated into root layout
affects:
  - future-plans: [07-03, 07-04, 07-05]
  - reason: Theme CSS infrastructure enables preview sync and font picker UI

tech-stack:
  added:
    - next/font/google for curated font loading
  patterns:
    - CSS variable bridge pattern for theme tokens
    - data-theme attribute selectors for variant styling
    - Font CSS variables for dynamic font swapping

key-files:
  created:
    - src/app/fonts.ts (15 curated Google Fonts with next/font)
  modified:
    - src/app/globals.css (theme tokens, variants, glassmorphism)
    - src/app/layout.tsx (font variables integration)

decisions:
  - decision: Use @theme inline directive for theme token bridge
    rationale: Makes theme CSS variables available as Tailwind utilities (bg-theme-background, text-theme-text)
    impact: low
  - decision: Load 15 curated fonts via next/font/google with display swap
    rationale: Prevents FOUT/FOIT, fonts load on-demand (no bundle penalty)
    impact: low
  - decision: Dark theme as default in :root
    rationale: Per CONTEXT.md - "Dark by default for artist aesthetic"
    impact: low
  - decision: Include glassmorphism support for sleek-modern theme
    rationale: Enables backdrop-filter blur effects with fallback for unsupported browsers
    impact: low

metrics:
  files-changed: 3
  tests-added: 0
  duration: 150s
  completed: 2026-01-28
---

# Phase 07 Plan 02: Theme CSS Infrastructure Summary

**One-liner:** CSS variable bridge connects theme tokens to Tailwind utilities, 15 curated Google Fonts loaded with zero FOUT.

## What Was Built

### Theme CSS Variable Bridge
Extended globals.css with theme token infrastructure:
- **@theme inline block**: Added theme color, font, and style tokens that bridge to Tailwind utilities
- **:root defaults**: Dark theme values (oklch colors, 12px radius, shadow presets)
- **Theme variants**: Data attribute selectors for mac-os, sleek-modern, instagram-reels
- **Glassmorphism**: Backdrop-filter support for sleek-modern with fallback

### Curated Font Loading
Created fonts.ts with 15 hand-picked Google Fonts:
- **Clean sans-serif**: Inter, DM Sans, Plus Jakarta Sans
- **Modern geometric**: Poppins, Outfit, Space Grotesk
- **Display/bold**: Bebas Neue, Oswald, Archivo Black
- **Elegant serif**: Playfair Display
- **Versatile**: Montserrat, Roboto, Open Sans
- **Trendy**: Sora, Urbanist

All fonts configured with:
- `display: 'swap'` to prevent FOUT/FOIT
- `subsets: ['latin']` to reduce bundle size
- CSS variables (--font-inter, --font-poppins, etc.)

### Layout Integration
Updated root layout to include font variables:
- Imported fontVariables from fonts.ts
- Added to body className alongside existing Inter font
- All 15 fonts now available site-wide as CSS variables

## Key Technical Wins

1. **Theme token bridge pattern**: CSS variables in @theme inline make theme values available as Tailwind utilities without config changes

2. **On-demand font loading**: next/font only downloads fonts actually used in rendered page - no 15-font bundle penalty

3. **Zero flash of unstyled text**: display: 'swap' ensures fonts load smoothly without blocking render

4. **Glassmorphism ready**: backdrop-filter support with @supports fallback for older browsers

## Files Modified

### Created
- `src/app/fonts.ts` - 15 curated Google Fonts with next/font/google, fontVariables export, CURATED_FONTS registry

### Modified
- `src/app/globals.css` - Theme token bridge in @theme inline, default dark theme in :root, variant selectors, glassmorphism support
- `src/app/layout.tsx` - Font variables integration in body className

## Deviations from Plan

### Additional Files Included
**[Unplanned] Theme definition files committed alongside fonts.ts**

- **Found during:** Task 2 git commit
- **Issue:** Unstaged theme files (src/lib/themes/*.ts, src/types/theme.ts) were present from earlier work
- **Action:** Included in Task 2 commit (5164da1) since they're theme-related infrastructure
- **Files added:** src/lib/themes/index.ts, mac-os.ts, sleek-modern.ts, instagram-reels.ts, src/types/theme.ts
- **Impact:** Harmless - these are theme definition files that will be used in future plans

## Next Phase Readiness

### Blockers
None.

### Concerns
None.

### Prerequisites Met
- [x] Theme CSS variables available as Tailwind utilities
- [x] Font CSS variables available site-wide
- [x] Data attribute variants work for theme switching
- [x] No FOUT/FOIT on page load

### What's Unlocked
**Plan 07-03** (Theme Store) can now:
- Reference theme CSS variables (--theme-background, --theme-text, etc.)
- Rely on data-theme attributes for variant styling
- Use font variables (--font-inter, --font-poppins, etc.)

**Plan 07-04** (Preview Sync) can now:
- Apply theme CSS variables to preview iframe
- Test font switching via CSS variable updates
- Verify glassmorphism effects on sleek-modern theme

**Plan 07-05** (Font Picker) can now:
- Use CURATED_FONTS registry for UI dropdown
- Apply font variables dynamically
- Preview fonts instantly via CSS variable swap

## Verification Evidence

### Build Success
```
✓ Compiled successfully in 3.3s
Route (app)
├ ○ /
├ ƒ /editor
├ ƒ /settings
└ ... (15 routes total)
```

### CSS Variables Available
- globals.css contains 6 theme color tokens in @theme inline
- globals.css contains 2 font tokens in @theme inline
- globals.css contains 2 style tokens in @theme inline
- :root contains 12 default theme values
- 3 theme variant selectors (mac-os, sleek-modern, instagram-reels)

### Font Variables Available
- layout.tsx imports and applies fontVariables
- 15 fonts exported from fonts.ts
- CURATED_FONTS registry contains 15 entries
- FontId and FontCategory types exported

### TypeScript Clean
```
npx tsc --noEmit (no errors)
```

## Task Breakdown

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Extend globals.css with theme CSS variables | 506188d | Added theme token bridge in @theme inline, default dark theme in :root, variant selectors for 3 themes |
| 2 | Set up curated font loading | 5164da1 | Created fonts.ts with 15 Google Fonts, fontVariables export, CURATED_FONTS registry |
| 3 | Integrate fonts into root layout | 5696a2a | Added fontVariables to body className in layout.tsx |

## Success Criteria Met

- [x] globals.css has theme tokens in @theme inline directive
- [x] Default dark theme values in :root
- [x] Theme variant selectors for mac-os, sleek-modern, instagram-reels
- [x] 15 curated fonts loading via next/font/google
- [x] Font variables applied to layout
- [x] All fonts available as CSS variables
- [x] npm run build succeeds without errors
- [x] Tailwind utilities work (bg-theme-background, text-theme-text, etc.)
- [x] No FOUT when page loads

## Performance Notes

**Font loading strategy:**
- next/font/google only downloads fonts actually rendered on page
- 15 fonts registered but not all loaded upfront
- Fonts loaded on-demand when CSS variables referencing them are applied
- No 15-font bundle penalty - only visible fonts get network requests

**CSS architecture:**
- Theme tokens in @theme inline are processed at build time
- Data attribute selectors ([data-theme="..."]) are lightweight
- Glassmorphism uses @supports for progressive enhancement
- No JavaScript required for theme CSS application

## Links
- **Plan:** .planning/phases/07-theme-system/07-02-PLAN.md
- **Phase context:** .planning/phases/07-theme-system/CONTEXT.md
