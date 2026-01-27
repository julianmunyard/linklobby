---
phase: quick
plan: 020
subsystem: gallery-cards
tags: [ui, ux, webgl, editor, gallery]

requires:
  - quick-019  # Gallery image captions and links

provides:
  - "Circular gallery tap-to-open-link interaction"
  - "Show captions toggle for circular mode"
  - "Vertical list editor with visible caption/link inputs"

affects:
  - gallery-card rendering
  - gallery editor UX

tech-stack:
  added: []
  patterns:
    - "WebGL click/tap interaction pattern"
    - "Centered image detection via position tracking"
    - "Vertical list editor layout"

key-files:
  created: []
  modified:
    - src/types/card.ts
    - src/components/CircularGallery.jsx
    - src/components/cards/gallery-card.tsx
    - src/components/editor/gallery-card-fields.tsx
    - src/components/ui/embla-carousel.tsx

decisions:
  - decision: "Circular gallery tap-to-open-link pattern"
    phase: "quick-020"
    rationale: "WebGL canvas rendering prevents per-image click handling - tap anywhere opens centered image's link instead"

  - decision: "Vertical list editor for gallery images"
    phase: "quick-020"
    rationale: "Hidden popover approach poor discoverability - visible inputs make caption/link editing obvious"

  - decision: "Carousel mode images-only"
    phase: "quick-020"
    rationale: "Simplify carousel to focus on images - circular mode handles captions/links"

metrics:
  duration: "3 minutes"
  completed: "2026-01-27"
---

# Quick Task 020: Gallery Circular Links Editor Redesign

**One-liner:** Circular gallery tap-opens centered image links, carousel simplified to images-only, editor redesigned with visible caption/link inputs

## Objective

Redesign gallery card with mode-specific features: circular mode gets clickable centered image links + toggleable captions; carousel mode simplified to images only; editor UI redesigned to show caption/link inputs clearly per image.

**Purpose:** Make gallery card more intuitive - circular mode (WebGL) can't have clickable per-image links due to canvas rendering, so we use a tap-anywhere-opens-centered-image-link pattern. Carousel mode simplifies to images only. Editor removes hidden popover in favor of visible inputs.

## Changes Made

### Task 1: Add showCaptions to types and update CircularGallery
**Commit:** `3e67982`

- Added `showCaptions?: boolean` to `GalleryCardContent` type (default true for backward compatibility)
- Updated `CircularGallery.jsx` to accept `onTap` callback and `showCaptions` props
- Added centered image tracking - computes which media has position.x closest to 0
- Modified `Title` class to skip rendering when `showCaptions` is false or text is empty
- Added `link` storage in `Media` class
- Track drag state via `hasDragged` flag - only fire `onTap` when no drag occurred
- Implemented `getCenteredMedia()` method to find image closest to center
- Pass `link` and `showCaptions` through Media/Title construction chain

**Files modified:**
- `src/types/card.ts`
- `src/components/CircularGallery.jsx`

### Task 2: Update gallery-card.tsx and simplify embla-carousel.tsx
**Commit:** `10bcf42`

- Transform items for `CircularGallery` to include `link: img.link || null`
- Added `handleTap` handler that opens link in new tab via `window.open(link, '_blank', 'noopener,noreferrer')`
- Pass `showCaptions={content.showCaptions !== false}` to CircularGallery (default true)
- Pass `onTap` callback to CircularGallery
- Simplified `EmblaCarouselGallery` to images-only display:
  - Removed caption rendering (`{image.caption && ...}` block)
  - Removed link wrapping (deleted anchor tag conditional)
  - Kept navigation buttons and dot indicators
  - Clean, minimal image display

**Files modified:**
- `src/components/cards/gallery-card.tsx`
- `src/components/ui/embla-carousel.tsx`

### Task 3: Redesign editor to vertical list with visible inputs
**Commit:** `3ecff1b`

- Removed Popover-based pencil icon approach (deleted Popover imports and UI)
- Replaced grid layout (`grid grid-cols-4 gap-2`) with vertical list layout (`space-y-2`)
- Redesigned `SortableImage` component:
  - Layout: `flex items-start gap-3` for each image row
  - Drag handle: `GripVertical` icon with `cursor-move`
  - Thumbnail: `w-12 h-12` with crop overlay on hover
  - Inputs column: `flex-1 space-y-2` with visible caption/link inputs
  - Remove button: top right of row
  - Crop button: overlay on thumbnail (shows on hover)
- Added "Show Captions" toggle in circular settings:
  - `Switch` component between Spacing slider and end of section
  - Controls `content.showCaptions` (default true)
- Switched from `rectSortingStrategy` to `verticalListSortingStrategy`
- Removed unused imports: `Popover`, `PopoverContent`, `PopoverTrigger`, `Pencil`, `LinkIcon`
- Added imports: `Switch`, `GripVertical`

**Files modified:**
- `src/components/editor/gallery-card-fields.tsx`

## Technical Details

### Circular Gallery Interaction Pattern

**Challenge:** WebGL canvas rendering prevents standard DOM click handlers on individual images.

**Solution:** Tap-to-open-centered-image pattern:
1. Track which image is currently centered (position.x closest to 0)
2. Distinguish between tap and drag via `hasDragged` flag
3. On tap (no drag), fire `onTap` callback with centered image's link
4. `gallery-card.tsx` receives callback and opens link in new tab

**Benefits:**
- Works with WebGL canvas limitations
- Simple, intuitive interaction - tap to open what you see
- No complex hit detection needed

### Editor UX Improvements

**Before:** Hidden popover with pencil icon
- Caption/link editing required discovering pencil icon
- Poor discoverability - users didn't notice feature
- Extra click to access inputs

**After:** Vertical list with visible inputs
- Caption/link inputs always visible for each image
- Immediate discoverability
- Faster editing workflow
- Drag handle with GripVertical icon makes reordering obvious

## Verification

Tested:
1. ✅ Create gallery card with 3+ images in circular mode
2. ✅ Add captions and links via editor (visible inputs, no popover)
3. ✅ Toggle "Show Captions" off - captions disappear from circular gallery
4. ✅ Tap/click on gallery - opens link of centered image in new tab
5. ✅ Switch to carousel mode - shows images only, no captions, no link functionality
6. ✅ Verify drag-to-reorder still works in editor (vertical list)

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready:** Gallery card now has mode-specific features that respect the limitations and strengths of each display mode.

**No blockers.**

## Commits

1. `3e67982` - feat(quick-020): add showCaptions and onTap to CircularGallery
2. `10bcf42` - feat(quick-020): add tap-to-open links and simplify carousel
3. `3ecff1b` - feat(quick-020): redesign editor to vertical list with visible inputs

---

**Completed:** 2026-01-27 (3 minutes)
**Status:** ✅ Complete
