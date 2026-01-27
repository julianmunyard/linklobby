---
phase: quick-014
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/cards/image-upload.tsx
  - src/lib/supabase/storage.ts
autonomous: true

must_haves:
  truths:
    - "Clicking existing card image thumbnail opens crop dialog"
    - "New image uploads open crop dialog before uploading"
    - "Crop dialog shows correct aspect ratio for card type (16:9 hero, 1:1 square, 4:3 horizontal)"
    - "Cropped image is uploaded, not the original file"
  artifacts:
    - path: "src/components/cards/image-upload.tsx"
      provides: "Image upload with crop integration"
      contains: "ImageCropDialog"
    - path: "src/lib/supabase/storage.ts"
      provides: "Blob upload support for card images"
      contains: "uploadCardImageBlob"
  key_links:
    - from: "src/components/cards/image-upload.tsx"
      to: "src/components/shared/image-crop-dialog.tsx"
      via: "ImageCropDialog import and state management"
      pattern: "ImageCropDialog"
---

<objective>
Add click-to-crop functionality for card images in the property editor.

Purpose: Users should be able to crop and position images for their cards, seeing how the image will look at the correct aspect ratio for that card type (hero=16:9, square=1:1, horizontal=4:3).

Output: Modified ImageUpload component that opens crop dialog on thumbnail click or after file selection, then uploads the cropped blob.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/components/cards/image-upload.tsx
@src/components/shared/image-crop-dialog.tsx
@src/lib/supabase/storage.ts
@src/types/card.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add blob upload support for card images</name>
  <files>src/lib/supabase/storage.ts</files>
  <action>
Add a new function `uploadCardImageBlob` that accepts a Blob instead of a File.
This mirrors the pattern used in `uploadProfileImage` which already accepts Blob.

```typescript
export async function uploadCardImageBlob(
  blob: Blob,
  cardId: string
): Promise<UploadResult> {
  // Validate blob size (same 5MB limit)
  if (blob.size > MAX_FILE_SIZE) {
    throw new Error("Image must be less than 5MB")
  }

  const supabase = createClient()

  // Generate unique filename: cardId/uuid.jpg
  // Always .jpg since getCroppedImg outputs JPEG
  const fileName = `${cardId}/${crypto.randomUUID()}.jpg`

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, blob, {
      contentType: "image/jpeg",
      upsert: false,
    })

  if (error) {
    console.error("Upload error:", error)
    throw new Error(error.message || "Failed to upload image")
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  return {
    url: urlData.publicUrl,
    path: data.path,
  }
}
```

Keep the existing `uploadCardImage(file, cardId)` function for backward compatibility (it's not currently used but may be useful later).
  </action>
  <verify>TypeScript compiles without errors: `npx tsc --noEmit`</verify>
  <done>uploadCardImageBlob function exists and accepts Blob + cardId</done>
</task>

<task type="auto">
  <name>Task 2: Integrate crop dialog into ImageUpload component</name>
  <files>src/components/cards/image-upload.tsx</files>
  <action>
Modify ImageUpload to:
1. Accept a new `cardType` prop to determine aspect ratio
2. Track state for crop dialog (open, imageSrc for cropping)
3. On file select: read file as data URL, open crop dialog
4. On thumbnail click: open crop dialog with current image URL
5. On crop complete: upload cropped blob via uploadCardImageBlob

**Props changes:**
```typescript
interface ImageUploadProps {
  value?: string
  onChange: (url: string | undefined) => void
  cardId: string
  cardType: CardType  // NEW - for aspect ratio
  disabled?: boolean
  className?: string
  // Remove aspectRatio - derive from cardType
}
```

**Aspect ratio mapping:**
```typescript
function getAspectForCardType(cardType: CardType): number {
  switch (cardType) {
    case 'hero': return 16 / 9
    case 'square': return 1
    case 'horizontal': return 4 / 3  // Small thumbnail, more compact
    default: return 16 / 9  // Default to rectangle
  }
}
```

**State additions:**
```typescript
const [cropDialogOpen, setCropDialogOpen] = useState(false)
const [imageToCrop, setImageToCrop] = useState<string | null>(null)
```

**File selection flow:**
1. Read selected file as data URL using FileReader
2. Set imageToCrop to data URL
3. Open crop dialog
4. On crop complete: call uploadCardImageBlob with blob, then onChange with URL

**Thumbnail click flow:**
1. If value exists, set imageToCrop to value
2. Open crop dialog
3. On crop complete: upload new cropped version

**Key implementation notes:**
- Use FileReader.readAsDataURL() to convert File to data URL for cropper
- Import ImageCropDialog from '@/components/shared/image-crop-dialog'
- Import uploadCardImageBlob from '@/lib/supabase/storage'
- Import CardType from '@/types/card'
- Make thumbnail clickable with cursor-pointer
- Show loading state during crop upload
  </action>
  <verify>
1. `npm run build` succeeds
2. Open editor, select a card with image support (hero/square/horizontal)
3. Click "Upload image" - should open crop dialog after selecting file
4. Click existing thumbnail - should open crop dialog with current image
5. Crop and save - should upload cropped version
  </verify>
  <done>
- Clicking thumbnail opens crop dialog with existing image
- Selecting new file opens crop dialog before upload
- Crop dialog shows correct aspect ratio for card type
- Cropped blob is uploaded, URL is passed to onChange
  </done>
</task>

<task type="auto">
  <name>Task 3: Update CardPropertyEditor to pass cardType</name>
  <files>src/components/editor/card-property-editor.tsx</files>
  <action>
Update the ImageUpload usage in CardPropertyEditor to pass the card type:

Change from:
```tsx
<ImageUpload
  value={imageUrl}
  onChange={handleImageChange}
  cardId={card.id}
  aspectRatio={card.card_type === "square" ? "square" : "video"}
/>
```

To:
```tsx
<ImageUpload
  value={imageUrl}
  onChange={handleImageChange}
  cardId={card.id}
  cardType={card.card_type}
/>
```

Remove the aspectRatio prop - it's no longer needed since ImageUpload derives it from cardType.
  </action>
  <verify>`npm run build` succeeds without TypeScript errors about missing props</verify>
  <done>CardPropertyEditor passes cardType to ImageUpload instead of aspectRatio</done>
</task>

</tasks>

<verification>
1. Hero card: Click thumbnail or upload new -> crop dialog opens with 16:9 aspect
2. Square card: Click thumbnail or upload new -> crop dialog opens with 1:1 aspect
3. Horizontal card: Click thumbnail or upload new -> crop dialog opens with 4:3 aspect
4. Crop an image, save -> cropped image appears in card preview
5. Click existing image thumbnail -> can re-crop/reposition the same image
</verification>

<success_criteria>
- Clicking card image thumbnail opens crop dialog
- Uploading new image opens crop dialog before upload
- Aspect ratio matches card type (hero=16:9, square=1:1, horizontal=4:3)
- Cropped image uploads correctly and displays in preview
- No TypeScript errors, build succeeds
</success_criteria>

<output>
After completion, create `.planning/quick/014-click-card-image-to-crop/014-SUMMARY.md`
</output>
