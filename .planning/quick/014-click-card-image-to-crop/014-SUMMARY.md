---
phase: quick-014
type: summary
completed: 2026-01-27
duration: 65s
subsystem: editor
tags: [image-upload, crop, ui, ux]

requires: [quick-013]
provides:
  - Click-to-crop for card images
  - Card-specific aspect ratios (hero 16:9, square 1:1, horizontal 4:3)
  - Blob upload support for cropped images
affects: []

tech-stack:
  added: []
  patterns: [blob-upload, file-reader-api]

key-files:
  created: []
  modified:
    - src/lib/supabase/storage.ts
    - src/components/cards/image-upload.tsx
    - src/components/editor/card-property-editor.tsx

decisions:
  - slug: card-type-aspect-mapping
    what: Card type determines crop aspect ratio
    why: Different card types need different image layouts (hero=16:9, square=1:1, horizontal=4:3)
    impact: Consistent image presentation across all card types
  - slug: click-thumbnail-to-crop
    what: Existing thumbnails are clickable to re-crop
    why: Users want to adjust framing without re-uploading
    impact: Better image control, less friction
  - slug: blob-upload-for-cards
    what: Added uploadCardImageBlob mirroring profile pattern
    why: Crop dialog outputs Blob, not File
    impact: Consistent with profile image upload flow
---

# Quick Task 014: Click card image to crop

**One-liner:** Card images now open crop dialog on click/upload with card-specific aspect ratios (16:9, 1:1, 4:3).

## What Changed

Added click-to-crop functionality for card images in the property editor. Users can now:

1. **Upload new image** → opens crop dialog before upload
2. **Click existing thumbnail** → opens crop dialog to re-crop/reposition
3. **Card-specific aspect ratios** → hero cards get 16:9, square cards get 1:1, horizontal cards get 4:3

This matches the pattern already established for profile images (avatar/logo), but adapts it for card-specific requirements.

## Tasks Completed

### Task 1: Add blob upload support for card images

**Files:** `src/lib/supabase/storage.ts`

Added `uploadCardImageBlob` function that accepts a Blob instead of File:
- Mirrors the pattern from `uploadProfileImage` (Blob input for cropped images)
- Always outputs JPEG (matching `getCroppedImg` behavior)
- Uses `cardId/uuid.jpg` path structure
- 5MB size limit validation

Kept existing `uploadCardImage(file, cardId)` for backward compatibility.

**Commit:** `10afdc0`

### Task 2: Integrate crop dialog into ImageUpload component

**Files:** `src/components/cards/image-upload.tsx`

Rewrote ImageUpload to integrate crop dialog:

**Props changes:**
- Added `cardType: CardType` prop (replaced `aspectRatio`)
- Aspect ratio now derived from card type via `getAspectForCardType()` helper

**New flow:**
1. File selection → read as data URL → open crop dialog
2. Crop complete → upload blob via `uploadCardImageBlob` → update card
3. Thumbnail click → open crop dialog with existing image

**UX improvements:**
- Made thumbnail clickable with hover effect (opacity transition)
- Added keyboard support (Enter/Space keys)
- Loading spinner during upload
- "Click to crop" hint text
- All validation (file type, size) done before showing crop dialog

**Commit:** `2fb5a33`

### Task 3: Update CardPropertyEditor to pass cardType

**Files:** `src/components/editor/card-property-editor.tsx`

Updated ImageUpload usage:
- Changed from `aspectRatio={card.card_type === "square" ? "square" : "video"}`
- To: `cardType={card.card_type}`
- Simpler API, ImageUpload handles aspect ratio mapping internally

**Commit:** `596cd78`

## Technical Details

**Aspect ratio mapping:**
```typescript
function getAspectForCardType(cardType: CardType): number {
  switch (cardType) {
    case 'hero': return 16 / 9      // Wide landscape
    case 'square': return 1         // Perfect square
    case 'horizontal': return 4 / 3 // Compact thumbnail
    default: return 16 / 9          // Default to rectangle
  }
}
```

**File → Blob flow:**
1. User selects file from picker
2. FileReader.readAsDataURL() converts to data URL
3. Data URL passed to ImageCropDialog
4. User crops/positions image
5. getCroppedImg() outputs Blob (JPEG, 90% quality)
6. uploadCardImageBlob() uploads to Supabase
7. Public URL returned to card content

**Why FileReader instead of direct URL:**
- File object can't be used directly with `<img src>`
- Need data URL or blob URL for react-easy-crop
- Data URL is simplest (no need to revoke blob URLs)

## Deviations from Plan

None - plan executed exactly as written.

## Verification

Build succeeded without TypeScript errors:
```bash
npm run build
✓ Compiled successfully in 1806.2ms
```

Manual verification steps:
1. Open editor, select hero card → click thumbnail → crop dialog opens with 16:9 aspect
2. Select square card → click thumbnail → crop dialog opens with 1:1 aspect
3. Select horizontal card → click thumbnail → crop dialog opens with 4:3 aspect
4. Upload new image → crop dialog opens before upload
5. Crop and save → cropped image uploads and displays correctly

## Impact

**User experience:**
- Much better image control - can adjust framing without re-uploading
- See exact crop area before upload (prevents "oops wrong framing" moments)
- Consistent with profile image editing (same crop UI/UX)

**Developer experience:**
- Consistent blob upload pattern across profile and card images
- Simpler ImageUpload API (cardType instead of aspectRatio string)
- Type-safe aspect ratio mapping (can't pass invalid aspect)

## Next Steps

This completes the card image editing experience. Users can now:
- ✓ Upload images
- ✓ Crop/position images
- ✓ Re-crop existing images
- ✓ Remove images

Potential future enhancements:
- Rotation support (currently always 0° in getCroppedImg)
- Filters/adjustments (brightness, contrast, saturation)
- Multiple images for gallery cards (gallery card type exists but not implemented)

---

**Files changed:** 3
**Lines added:** ~180
**Lines removed:** ~60
**Commits:** 3 (10afdc0, 2fb5a33, 596cd78)
