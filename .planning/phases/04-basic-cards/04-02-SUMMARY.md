---
phase: 04-basic-cards
plan: 02
subsystem: ui
tags: [typescript, react, next.js, card-components, image-handling]

# Dependency graph
requires:
  - phase: 04-01
    provides: Card content type schemas and ImageUpload component
  - phase: 03-canvas
    provides: Card data model
provides:
  - HeroCard component (large CTA with image background)
  - HorizontalLink component (Linktree-style bar)
  - SquareCard component (tile with image and title overlay)
  - CardRenderer switch component
affects: [04-03, 04-04, 09-public-page]

# Tech tracking
tech-stack:
  added: []
  patterns: [card render components, polymorphic wrapper pattern, stretched link pattern]

key-files:
  created:
    - src/components/cards/hero-card.tsx
    - src/components/cards/horizontal-link.tsx
    - src/components/cards/square-card.tsx
    - src/components/cards/card-renderer.tsx
    - src/components/editor/hero-card-fields.tsx
    - src/components/editor/horizontal-link-fields.tsx
    - src/components/editor/square-card-fields.tsx
  modified: []

key-decisions:
  - "Polymorphic wrapper pattern (a vs div) based on URL presence"
  - "Stretched link pattern for hero cards without button text"
  - "Gradient overlays for text readability on images"
  - "Three button styles: primary (white), secondary (glass), outline"
  - "Graceful fallbacks: placeholder icons when no image, no click when no URL"

patterns-established:
  - "Card components accept isPreview prop for optimization hints"
  - "Wrapper component switches between <a> and <div> based on hasLink"
  - "Images use Next.js Image with fill + object-cover pattern"
  - "Placeholder icons (ImageIcon, Link2) when no image provided"
  - "Type casting content to specific schemas (as HeroCardContent)"

# Metrics
duration: 3min
completed: 2026-01-24
---

# Phase 04 Plan 02: Basic Card Components Summary

**Three card render components (Hero, Horizontal, Square) plus CardRenderer switch component**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-24T12:41:01Z
- **Completed:** 2026-01-24T12:43:55Z
- **Tasks:** 3
- **Files created:** 7

## Accomplishments
- Created HeroCard with large image background, gradient overlay, and styled button
- Created HorizontalLink with thumbnail, title, description, and chevron
- Created SquareCard with image and optional title overlay
- Created CardRenderer that switches between card types with fallback for future types
- Fixed missing card field editor components (blocking TypeScript compilation)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create HeroCard Component** - `3fe5260` (feat)
2. **Task 2: Create HorizontalLink Component** - `b2dba98` (feat)
3. **Task 3: Create SquareCard and CardRenderer Components** - `90d1ea3` (feat)

**Additional commit:**
- **Fix missing card field editor components** - `bbf7e1e` (fix) - Unblocked TypeScript compilation

## Files Created/Modified
- `src/components/cards/hero-card.tsx` - Large CTA with image background, gradient, three button styles
- `src/components/cards/horizontal-link.tsx` - Linktree-style bar with thumbnail and chevron
- `src/components/cards/square-card.tsx` - Tile with image and optional title overlay
- `src/components/cards/card-renderer.tsx` - Switch component that renders correct card type
- `src/components/editor/hero-card-fields.tsx` - Button text and style inputs for hero cards
- `src/components/editor/horizontal-link-fields.tsx` - No additional fields (returns null)
- `src/components/editor/square-card-fields.tsx` - Show title toggle for square cards

## Decisions Made

**Polymorphic wrapper pattern:** Components render `<a>` or `<div>` based on URL presence
- Rationale: Semantic HTML - links are clickable, non-links are not; avoids unnecessary click handlers

**Stretched link pattern:** Hero card with URL but no button text uses invisible overlay link
- Rationale: Makes entire card clickable while maintaining flexibility for button display

**Three button styles:** Primary (white bg), secondary (glass effect), outline (border only)
- Rationale: Visual variety for different hero card aesthetics, all readable over images

**Gradient overlays:** All image-based cards use gradients for text readability
- Rationale: Ensures text is legible regardless of image colors/contrast

**Graceful fallbacks:** Placeholder icons when no image, no click when no URL
- Rationale: Cards work in any state, no broken experiences during editing

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing card field editor components**
- **Found during:** Task 2 TypeScript compilation
- **Issue:** card-property-editor.tsx imported hero-card-fields, horizontal-link-fields, square-card-fields but they didn't exist
- **Fix:** Created minimal functional field editor components for each card type
- **Files created:** hero-card-fields.tsx, horizontal-link-fields.tsx, square-card-fields.tsx
- **Commit:** bbf7e1e

These components were referenced in card-property-editor.tsx (from plan 04-03) but were never created. Created functional implementations to unblock TypeScript compilation.

## Issues Encountered

None - TypeScript compilation blocking issue was resolved by creating the missing field editor components.

## Next Phase Readiness

**Ready for Phase 4 continuation:**
- All three basic card types (hero, horizontal, square) render correctly
- CardRenderer provides unified interface for rendering any card type
- Field editors exist for property editing (though property editor integration is plan 04-03)
- Components handle edge cases (no image, no URL, no title)

**No blockers.**

**Next steps:**
- Integrate CardRenderer into canvas preview (Plan 04-03 or later)
- Test cards with actual data in preview pane
- Implement property editor integration for editing card content

---
*Phase: 04-basic-cards*
*Completed: 2026-01-24*
