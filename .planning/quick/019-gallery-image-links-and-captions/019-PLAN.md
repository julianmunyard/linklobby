---
phase: quick-019
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/types/card.ts
  - src/components/cards/gallery-card.tsx
  - src/components/editor/gallery-card-fields.tsx
autonomous: true

must_haves:
  truths:
    - "Each gallery image can have an optional caption displayed below it"
    - "Each gallery image can have an optional link URL"
    - "Clicking an image with a link navigates to that URL"
    - "Caption appears below image in circular gallery view"
    - "Editor provides intuitive per-image caption and link fields"
  artifacts:
    - path: "src/types/card.ts"
      provides: "GalleryImage type with caption and link fields"
      contains: "caption?: string"
    - path: "src/components/cards/gallery-card.tsx"
      provides: "Gallery rendering with captions and clickable images"
      contains: "caption"
    - path: "src/components/editor/gallery-card-fields.tsx"
      provides: "Per-image caption and link editor UI"
      contains: "caption"
  key_links:
    - from: "gallery-card-fields.tsx"
      to: "GalleryImage type"
      via: "onChange updates caption/link"
      pattern: "onChange.*caption|link"
    - from: "gallery-card.tsx"
      to: "CircularGallery"
      via: "text prop from caption"
      pattern: "text:.*caption"
---

<objective>
Add optional links and captions to each image in the circular gallery card.

Purpose: Allow artists to label and link individual gallery images for better storytelling and monetization (link to shop, music, etc).
Output: Gallery images support optional caption (displayed below) and optional URL (makes image+caption clickable).
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/types/card.ts
@src/components/cards/gallery-card.tsx
@src/components/editor/gallery-card-fields.tsx
@src/components/CircularGallery.jsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extend GalleryImage type and update CircularGallery</name>
  <files>src/types/card.ts, src/components/cards/gallery-card.tsx</files>
  <action>
1. In `src/types/card.ts`, add optional fields to GalleryImage interface:
   ```typescript
   export interface GalleryImage {
     id: string
     url: string
     alt: string
     storagePath: string
     caption?: string    // Optional label displayed below image
     link?: string       // Optional URL - makes image clickable
   }
   ```

2. In `src/components/cards/gallery-card.tsx`, update the circular gallery rendering:
   - Change the items mapping to use caption instead of empty string:
     ```typescript
     const items = content.images.map(img => ({
       image: img.url,
       text: img.caption || ''  // Use caption if provided
     }))
     ```
   - For clickable images with links, the CircularGallery component uses WebGL and doesn't support click handlers directly. Instead, we'll handle this by:
     - Creating clickable overlay divs positioned over each image (complex with 3D transforms)
     - OR accepting this limitation for circular gallery (links only work in carousel mode)

   For circular gallery: Caption displays via text prop, but links won't work due to WebGL rendering.

   For carousel mode (EmblaCarouselGallery): Pass link to carousel component - update that component to wrap images in anchor tags when link is provided.
  </action>
  <verify>TypeScript compiles without errors: `npx tsc --noEmit`</verify>
  <done>GalleryImage type includes caption and link fields; gallery-card passes caption to CircularGallery text prop</done>
</task>

<task type="auto">
  <name>Task 2: Add per-image caption and link editor UI</name>
  <files>src/components/editor/gallery-card-fields.tsx</files>
  <action>
1. Update SortableImage component to include expandable/inline editing for caption and link:
   - Add props for caption, link, and onChange callback
   - Show small input fields below each thumbnail (or on hover/focus)
   - Design options:
     a) Always visible: Small caption input below each thumbnail, link icon button to open link field
     b) Expandable: Click thumbnail to expand and show caption/link fields
     c) Popover: Click edit button to open popover with caption and link fields

   RECOMMENDED: Use option (c) popover approach for cleaner UI in the 4-column grid. Add an "Edit" button that opens a popover with:
   - Caption text input (placeholder: "Add caption...")
   - Link URL input (placeholder: "https://...")

2. Implementation in SortableImage:
   ```typescript
   function SortableImage({
     image,
     onRemove,
     onCrop,
     onUpdate  // New: (updates: Partial<GalleryImage>) => void
   }: {
     image: GalleryImage
     onRemove: () => void
     onCrop: () => void
     onUpdate: (updates: Partial<GalleryImage>) => void
   })
   ```

3. Add Popover from shadcn/ui with:
   - Edit icon button trigger (Pencil icon)
   - PopoverContent with caption and link inputs
   - Inputs call onUpdate on change (debounced or on blur)

4. Update the parent mapping to pass onUpdate:
   ```typescript
   {images.map(image => (
     <SortableImage
       key={image.id}
       image={image}
       onRemove={() => handleRemoveImage(image.id)}
       onCrop={() => handleOpenCrop(image)}
       onUpdate={(updates) => handleUpdateImage(image.id, updates)}
     />
   ))}
   ```

5. Add handleUpdateImage function:
   ```typescript
   const handleUpdateImage = useCallback((id: string, updates: Partial<GalleryImage>) => {
     const updatedImages = images.map(img =>
       img.id === id ? { ...img, ...updates } : img
     )
     onChange({ images: updatedImages })
   }, [images, onChange])
   ```

6. Visual indicators:
   - Show small link icon overlay if image has a link set
   - Show caption text (truncated) below thumbnail if caption exists
  </action>
  <verify>
1. TypeScript compiles: `npx tsc --noEmit`
2. Manual test: Add gallery card, upload image, click edit button, verify popover appears with caption and link fields
3. Verify changes persist in preview
  </verify>
  <done>Each gallery image has edit popover with caption and link fields; changes update preview in real-time</done>
</task>

<task type="auto">
  <name>Task 3: Update carousel mode to support clickable images</name>
  <files>src/components/ui/embla-carousel.tsx</files>
  <action>
1. Find and update EmblaCarouselGallery component to accept full GalleryImage objects (not just url/alt):
   ```typescript
   interface EmblaCarouselGalleryProps {
     images: GalleryImage[]  // Full image objects with optional link/caption
   }
   ```

2. Update carousel slide rendering:
   - If image has link, wrap in anchor tag with target="_blank" rel="noopener noreferrer"
   - If image has caption, display below the image

   ```tsx
   {images.map((image, index) => {
     const slide = (
       <div className="relative">
         <Image src={image.url} alt={image.alt} ... />
         {image.caption && (
           <p className="text-sm text-center mt-2 text-foreground/80">{image.caption}</p>
         )}
       </div>
     )

     return image.link ? (
       <a key={image.id} href={image.link} target="_blank" rel="noopener noreferrer">
         {slide}
       </a>
     ) : (
       <div key={image.id}>{slide}</div>
     )
   })}
   ```

3. Ensure carousel still works in preview mode (clicks may need to be intercepted in editor context).
  </action>
  <verify>
1. TypeScript compiles: `npx tsc --noEmit`
2. Manual test: Create gallery with carousel mode, add image with link and caption
3. Verify caption appears below image in carousel
4. Verify clicking image with link opens URL in new tab
  </verify>
  <done>Carousel mode displays captions below images and supports clickable links</done>
</task>

</tasks>

<verification>
1. Type check passes: `npx tsc --noEmit`
2. Gallery card with circular mode shows captions below images
3. Gallery card with carousel mode shows captions and supports links
4. Editor provides intuitive per-image caption and link editing via popover
5. Changes persist after save and page reload
</verification>

<success_criteria>
- GalleryImage type extended with optional caption and link fields
- Circular gallery displays captions via text prop (links not supported in WebGL)
- Carousel gallery displays captions and supports clickable images with links
- Editor UI has clean per-image edit popover for caption and link
- All existing gallery functionality preserved
</success_criteria>

<output>
After completion, create `.planning/quick/019-gallery-image-links-and-captions/019-SUMMARY.md`
</output>
