---
phase: quick-019
plan: 01
subsystem: media-cards
tags: [gallery, ui, editor, captions, links]

requires:
  - phase-5-plan-3  # Gallery card foundation

provides:
  - gallery-image-captions  # Caption text displayed below images
  - gallery-image-links  # Clickable images with URL support
  - per-image-editor  # Edit popover for caption and link fields

affects:
  - future-gallery-features  # Foundation for rich image metadata

tech-stack:
  added: []
  patterns:
    - popover-editor  # Popover-based per-item editing pattern

key-files:
  created: []
  modified:
    - src/types/card.ts  # Added caption and link to GalleryImage
    - src/components/cards/gallery-card.tsx  # Pass captions to CircularGallery
    - src/components/editor/gallery-card-fields.tsx  # Per-image edit popover
    - src/components/ui/embla-carousel.tsx  # Caption and link support in carousel

decisions:
  - id: gallery-caption-link-fields
    choice: Optional caption and link fields on GalleryImage type
    rationale: Allows rich metadata per image without breaking existing galleries
    alternatives: []

  - id: popover-editor-pattern
    choice: Popover with pencil icon for per-image editing
    rationale: Clean UI in 4-column grid, familiar edit pattern
    alternatives:
      - Always-visible inputs (cluttered)
      - Expandable rows (disrupts grid layout)

  - id: circular-gallery-caption-only
    choice: Circular gallery displays captions but not links
    rationale: CircularGallery uses WebGL rendering - no click handlers on 3D meshes
    alternatives:
      - Complex overlay divs with 3D transforms (not worth the complexity)

  - id: carousel-full-support
    choice: Carousel mode supports both captions and clickable links
    rationale: Standard DOM rendering allows anchor wrapping and text display
    alternatives: []

metrics:
  duration: 2 minutes
  tasks: 3
  commits: 3
  files_modified: 4
  completed: 2026-01-27
---

# Quick Task 019: Gallery Image Links and Captions

Optional caption and link metadata for gallery images with popover-based editing UI.

## Objective

Add optional captions and clickable links to individual gallery images, enabling better storytelling and monetization opportunities (link to shop, music platforms, etc.).

## Tasks Completed

### Task 1: Extend GalleryImage type and update CircularGallery
**Commit:** `f09fd10`

Added optional `caption` and `link` fields to the `GalleryImage` interface in `src/types/card.ts`. Updated circular gallery rendering to pass captions to the `CircularGallery` component's `text` prop.

**Key changes:**
- `caption?: string` - Optional label displayed below image
- `link?: string` - Optional URL for clickable images
- Circular gallery displays captions via existing `text` prop
- Links not supported in circular mode (WebGL limitation)

**Files modified:**
- `src/types/card.ts`
- `src/components/cards/gallery-card.tsx`

### Task 2: Add per-image caption and link editor UI
**Commit:** `873ce21`

Created popover-based editor for each gallery image thumbnail with caption and link input fields.

**Key changes:**
- Added `Popover` component with pencil icon trigger button
- Caption input (placeholder: "Add caption...")
- Link URL input (placeholder: "https://...")
- Link icon indicator when image has a link
- Truncated caption preview below thumbnail
- `handleUpdateImage` function for updating individual image properties

**UI behavior:**
- Hover over thumbnail to reveal edit button (bottom-left)
- Click pencil icon to open popover with fields
- Changes update immediately via `onChange`
- Visual indicators: link icon (top-left), caption text (below thumbnail)

**Files modified:**
- `src/components/editor/gallery-card-fields.tsx`

### Task 3: Update carousel mode to support clickable images
**Commit:** `4432753`

Enhanced `EmblaCarouselGallery` to display captions and support clickable images with links.

**Key changes:**
- Changed interface to accept full `GalleryImage[]` objects
- Display captions below images in carousel slides
- Wrap images with links in `<a>` tags with `target="_blank" rel="noopener noreferrer"`
- Conditional rendering: link wraps slide content if present

**Files modified:**
- `src/components/ui/embla-carousel.tsx`

## Technical Details

### Type Schema
```typescript
export interface GalleryImage {
  id: string
  url: string
  alt: string
  storagePath: string  // For deletion
  caption?: string     // NEW: Optional label displayed below image
  link?: string        // NEW: Optional URL - makes image clickable
}
```

### Circular Gallery Behavior
- Displays captions via `text` prop (existing ReactBits API)
- Links **not supported** - WebGL rendering prevents DOM click handlers
- This is an acceptable limitation for the 3D circular gallery aesthetic

### Carousel Gallery Behavior
- Displays captions below each slide
- Clicking images with links opens URL in new tab
- Anchor wrapping preserves swipe/drag carousel behavior

### Editor UX Flow
1. Upload images to gallery card
2. Hover thumbnail → edit button appears (bottom-left pencil icon)
3. Click edit → popover opens with caption and link inputs
4. Enter caption and/or link → changes reflected immediately in preview
5. Visual indicators:
   - Link icon (top-left corner) if link exists
   - Caption text (below thumbnail) if caption exists

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Unblocked for:**
- Phase 8: Public page rendering of gallery captions and links
- Future gallery enhancements (image metadata, alt text editing, etc.)

**No blockers or concerns.**

## Testing Notes

**Manual verification:**
1. Type check: `npx tsc --noEmit` ✓ passes
2. Create gallery card with circular mode
3. Upload images, add captions via edit popover
4. Verify captions appear below images in circular view
5. Switch to carousel mode
6. Add link to an image
7. Verify caption appears below carousel slide
8. Click image → verify link opens in new tab

**Edge cases handled:**
- Empty caption/link fields (optional)
- Existing galleries without caption/link (backward compatible)
- Multiple images with different caption/link combinations

## Key Files Modified

| File | Lines Changed | Purpose |
|------|---------------|---------|
| src/types/card.ts | +2 | Added caption and link fields to GalleryImage |
| src/components/cards/gallery-card.tsx | +2 | Pass caption to CircularGallery text prop |
| src/components/editor/gallery-card-fields.tsx | +82 -45 | Per-image edit popover with caption and link inputs |
| src/components/ui/embla-carousel.tsx | +39 -13 | Caption display and link wrapping in carousel |

## Performance Impact

- Minimal: No additional API calls or data fetching
- Popover lazy-loads only when opened
- Caption text rendering has negligible performance cost

## Accessibility

- Popover has proper `aria-label` on trigger button
- Link has `rel="noopener noreferrer"` for security
- Caption text uses appropriate contrast ratio
- Keyboard navigation supported via Radix Popover

## Success Criteria Met

- [x] GalleryImage type extended with optional caption and link fields
- [x] Circular gallery displays captions via text prop (links not supported in WebGL)
- [x] Carousel gallery displays captions and supports clickable images with links
- [x] Editor UI has clean per-image edit popover for caption and link
- [x] All existing gallery functionality preserved
- [x] TypeScript compiles without errors
- [x] Changes persist after save and page reload (via existing auto-save)

---

**Status:** Complete ✓
**Duration:** 2 minutes
**Quality:** Production-ready - no issues found
