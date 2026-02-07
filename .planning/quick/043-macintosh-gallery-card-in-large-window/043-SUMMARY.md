---
phase: quick
plan: 043
subsystem: ui
tags: [macintosh, gallery, webgl, embla-carousel, circular-gallery]

# Dependency graph
requires:
  - phase: quick-039
    provides: Macintosh theme with window chrome and LinesTitleBar component
  - phase: 05
    provides: GalleryCard component with circular and carousel modes
provides:
  - Mac-style Photos window for gallery cards in Macintosh theme
  - Full gallery editor functionality for Mac theme users
  - Public page gallery rendering in Mac window frames
affects: [macintosh-theme, gallery-cards, public-pages]

# Tech tracking
tech-stack:
  added: []
  patterns: [mac-window-gallery-wrapper, gallery-card-type-routing]

key-files:
  created: []
  modified:
    - src/components/editor/cards-tab.tsx
    - src/components/editor/card-property-editor.tsx
    - src/components/cards/macintosh-card.tsx
    - src/components/public/static-macintosh-layout.tsx

key-decisions:
  - "Gallery cards use card_type 'gallery' not 'hero' for Mac windows"
  - "Gallery routing checks card_type before macWindowStyle switch"
  - "Gallery cards non-clickable on public pages (handles own interaction)"

patterns-established:
  - "Mac card routing: check card_type first, then macWindowStyle switch"
  - "Mac window wrapping: LinesTitleBar + white content area + card component inside"

# Metrics
duration: ~20min
completed: 2026-02-07
---

# Quick Task 043: Macintosh Gallery Card in Large Window Summary

**Gallery cards render inside Mac large-window frames with LinesTitleBar showing editable title (default "Photos"), supporting both circular WebGL and carousel modes with full editor functionality**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-02-07T23:20:00+11:00
- **Completed:** 2026-02-07T23:40:00+11:00
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Photos card type available in Macintosh theme card menu
- Gallery renders inside Mac large-window frame with LinesTitleBar
- Gallery editor fields (style toggle, image upload, circular settings, caption controls) all functional
- Public page gallery rendering in Mac window frames with both circular and carousel modes

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Photos to Mac card menu and wire gallery creation** - `fd68b8c` (feat)
2. **Task 2: Create MacintoshGallery component** - (incorporated in user commit `85c4675`)
3. **Task 3: Add StaticMacGallery for public page rendering** - `f2ae195` (feat)

## Files Created/Modified
- `src/components/editor/cards-tab.tsx` - Added 'gallery' to MacWindowStyle, Photos to MAC_CARD_TYPES, gallery defaultContent case, card_type assignment logic
- `src/components/editor/card-property-editor.tsx` - Added 'gallery' to title visibility condition
- `src/components/cards/macintosh-card.tsx` - Added GalleryCard import, MacintoshGallery component, gallery routing in MacintoshCard switch
- `src/components/public/static-macintosh-layout.tsx` - Added CircularGallery dynamic import, StaticMacGallery component, gallery routing and click handling

## Decisions Made

**1. Gallery cards use card_type 'gallery' not 'hero'**
- Rationale: Ensures GalleryCardFields appear in property editor and gallery-specific content types are used
- Implementation: Updated card_type assignment in handleAddCard to check `macWindowStyle === 'gallery'`

**2. Gallery routing checks card_type before macWindowStyle**
- Rationale: Similar pattern to social-icons, ensures consistent routing regardless of macWindowStyle value
- Implementation: Added `if (card.card_type === 'gallery')` check before switch statement in both MacintoshCard and StaticMacCard

**3. Gallery cards non-clickable on public pages**
- Rationale: Gallery cards handle their own interaction via WebGL/carousel clicks
- Implementation: Added gallery to handleCardClick non-clickable types

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**Task 2 already implemented:**
- Issue: MacintoshGallery component was already implemented in user commit 85c4675 (social icons window color, AWGE frame & noise for macintosh theme)
- Resolution: Verified implementation matches plan requirements, proceeded to Task 3
- Impact: No rework needed, implementation was correct

## Next Phase Readiness
- Gallery cards fully integrated into Macintosh theme
- All Mac window styles (notepad, small-window, large-window, title-link, gallery, map, calculator, presave, socials) now complete
- Ready for any future Macintosh theme enhancements

---
*Phase: quick*
*Completed: 2026-02-07*
