---
phase: quick
plan: 021
subsystem: editor-ui
tags: [gallery, upload, ui-polish, plus-button, file-input]
requires: [quick-020]
provides:
  - Styled plus button upload UI for gallery card
  - Hidden file input pattern
  - Empty state and add-more states
affects: []
tech-stack:
  added: []
  patterns:
    - hidden-file-input-with-ref
    - typescript-definitions-for-jsx
key-files:
  created:
    - src/components/CircularGallery.d.ts
  modified:
    - src/components/editor/gallery-card-fields.tsx
    - src/components/CircularGallery.jsx
decisions:
  - decision: Hidden file input with ref pattern
    rationale: Browser default "Choose File" input looks dated and breaks editor aesthetic
    impact: Cleaner, more polished UI that matches editor design system
  - decision: Empty state shows large centered plus button
    rationale: More intuitive initial state with clear visual hierarchy
    impact: Better first-time user experience
  - decision: Add-more state shows smaller inline plus button
    rationale: Compact button below image list maintains clean layout
    impact: Efficient use of space when images are present
  - decision: TypeScript definitions for CircularGallery
    rationale: JSX file lacked proper types, causing build errors
    impact: Type safety and build reliability
metrics:
  duration: 2 minutes
  tasks: 1
  commits: 1
  lines_changed: 97
completed: 2026-01-27
---

# Quick Task 021: Gallery Upload UI Polish

**One-liner:** Replace ugly browser default file input with styled plus icon button for gallery image uploads

## What Was Built

### UI Enhancement
**Replaced browser file input with styled plus button pattern:**
- Hidden file input triggered via ref (`fileInputRef.current?.click()`)
- Empty state: Large centered plus button with "Add Images" text in dashed border
- Add-more state: Smaller plus button below image list with count display "(N/10)"
- Maintains all existing functionality: multi-file, compression, error handling

### TypeScript Type Safety
**Fixed CircularGallery build error (Rule 1 - Bug):**
- Created `CircularGallery.d.ts` with proper TypeScript definitions
- Added PropTypes to `CircularGallery.jsx` for runtime validation
- Fixed `onTap` prop typing: now correctly typed as optional function accepting string|null

## Implementation Details

### Gallery Upload States

1. **Empty State** (no images):
```tsx
<Button variant="outline" size="lg" onClick={() => fileInputRef.current?.click()}>
  <Plus /> Add Images
</Button>
```
- Large centered button
- Clear call-to-action in dashed border container
- Helper text: "Add up to 10 images"

2. **Add-More State** (1-9 images):
```tsx
<Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
  <Plus /> Add More ({images.length}/10)
</Button>
```
- Smaller button below image list
- Shows current count
- Full-width for easy tapping

3. **Full State** (10 images):
- Button hidden completely
- No way to add more images

### Hidden File Input Pattern
```tsx
const fileInputRef = useRef<HTMLInputElement>(null)

<input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  multiple
  onChange={handleFileSelect}
  className="sr-only"
/>
```
- `sr-only` class: screen-reader accessible but visually hidden
- Preserves accessibility
- Maintains native file picker behavior

### CircularGallery Types
```typescript
export interface CircularGalleryProps {
  items: CircularGalleryItem[];
  onTap?: ((link: string | null) => void) | null;
  // ... other props
}
```
- Properly typed `onTap` callback
- Prevents TypeScript compilation errors
- Maintains backward compatibility

## Technical Decisions

### Why Hidden Input + Button?
- Native file input styling is browser-specific and dated
- Custom button integrates with shadcn/ui design system
- Better control over styling and placement
- More intuitive user experience

### Why Two Different Button Sizes?
- **Large (empty state):** Prominent CTA for first action
- **Small (add-more state):** Compact to not overpower image list
- Visual hierarchy guides user attention appropriately

### Why .d.ts File for JSX Component?
- TypeScript doesn't infer complex prop types from JSX
- PropTypes alone insufficient for compile-time type checking
- `.d.ts` provides explicit contract for TypeScript consumers
- Maintains JSX file for runtime (OGL/WebGL compatibility)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] CircularGallery TypeScript build error**
- **Found during:** Task 1 verification (build check)
- **Issue:** CircularGallery.jsx lacked TypeScript definitions, causing onTap prop type error
- **Fix:** Created CircularGallery.d.ts with proper type definitions and added PropTypes
- **Files modified:**
  - Created: `src/components/CircularGallery.d.ts`
  - Modified: `src/components/CircularGallery.jsx` (added PropTypes import and definitions)
- **Commit:** 8257065
- **Rationale:** Build must pass for task completion (blocking issue - Rule 3)

## Files Changed

### Created
- `src/components/CircularGallery.d.ts` - TypeScript definitions for CircularGallery component

### Modified
- `src/components/editor/gallery-card-fields.tsx`
  - Added useRef import and fileInputRef
  - Added Plus icon import and Button component
  - Replaced Input type="file" with hidden input + styled buttons
  - Restructured empty/add-more states with button-based UI

- `src/components/CircularGallery.jsx`
  - Added PropTypes import
  - Added PropTypes definitions for all component props
  - No functional changes to component logic

## Testing Notes

### Verification Completed
✅ Build passes with TypeScript checks
✅ Empty state shows centered plus button
✅ Click button opens file picker
✅ Add-more state shows smaller plus button with count
✅ Upload flow unchanged (compression, multi-file, error handling)

### Browser Testing (Manual)
- Select gallery card with no images → see large plus button
- Click plus → file picker opens
- Add image → see image list with smaller "Add More (1/10)" button
- Click "Add More" → file picker opens again
- Upload functionality verified unchanged

## Next Phase Readiness

### Unblocks
- Gallery card upload UX now matches editor aesthetic
- No more jarring browser default inputs

### Future Enhancements
- Could add drag-and-drop zone over plus button
- Could animate button on hover
- Could add loading state to button (currently shows spinner below)

## Commit Summary

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 8257065 | Replace file input with plus icon button + fix CircularGallery types |

**Total commits:** 1
**Duration:** 2 minutes
**Lines changed:** +97 insertions, -21 deletions

---

**Status:** ✅ Complete
**Quick task completed:** 2026-01-27
