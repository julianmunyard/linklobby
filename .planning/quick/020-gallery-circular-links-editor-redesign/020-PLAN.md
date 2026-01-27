---
phase: quick
plan: 020
type: execute
wave: 1
depends_on: []
files_modified:
  - src/types/card.ts
  - src/components/CircularGallery.jsx
  - src/components/cards/gallery-card.tsx
  - src/components/editor/gallery-card-fields.tsx
  - src/components/ui/embla-carousel.tsx
autonomous: true

must_haves:
  truths:
    - "Circular gallery shows captions below images when showCaptions is enabled"
    - "Tapping on circular gallery opens the centered image's link in new tab (if it has one)"
    - "Carousel mode displays images only - no captions, no links"
    - "Editor shows each image as vertical list item with visible caption/link inputs"
    - "Show Captions toggle appears in circular mode settings"
  artifacts:
    - path: "src/types/card.ts"
      provides: "showCaptions boolean on GalleryCardContent"
      contains: "showCaptions"
    - path: "src/components/CircularGallery.jsx"
      provides: "Link data handling, centered image tracking, tap callback"
      contains: "onTap"
    - path: "src/components/cards/gallery-card.tsx"
      provides: "Pass links to CircularGallery, handle tap callback"
      contains: "onTap"
    - path: "src/components/editor/gallery-card-fields.tsx"
      provides: "Vertical list layout with visible caption/link inputs"
      contains: "flex flex-col"
    - path: "src/components/ui/embla-carousel.tsx"
      provides: "Simplified images-only display"
      min_lines: 50
  key_links:
    - from: "gallery-card.tsx"
      to: "CircularGallery.jsx"
      via: "onTap prop with window.open"
      pattern: "onTap.*window\\.open"
    - from: "gallery-card-fields.tsx"
      to: "GalleryImage type"
      via: "caption/link inputs per image"
      pattern: "caption.*link"
---

<objective>
Redesign gallery card with mode-specific features: circular mode gets clickable centered image links + toggleable captions; carousel mode simplified to images only; editor UI redesigned to show caption/link inputs clearly per image.

Purpose: Make gallery card more intuitive - circular mode (WebGL) can't have clickable per-image links due to canvas rendering, so we use a tap-anywhere-opens-centered-image-link pattern. Carousel mode simplifies to images only. Editor removes hidden popover in favor of visible inputs.
Output: Updated gallery components with cleaner interaction patterns and clearer editor UI
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/types/card.ts
@src/components/CircularGallery.jsx
@src/components/cards/gallery-card.tsx
@src/components/editor/gallery-card-fields.tsx
@src/components/ui/embla-carousel.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add showCaptions to types and update CircularGallery</name>
  <files>src/types/card.ts, src/components/CircularGallery.jsx</files>
  <action>
1. In src/types/card.ts:
   - Add `showCaptions?: boolean` to GalleryCardContent (default true for backward compatibility)

2. In src/components/CircularGallery.jsx:
   - Add new props: `onTap?: (link: string | null) => void`, `showCaptions?: boolean` (default true)
   - Modify `items` prop to accept `{ image: string, text?: string, link?: string }[]`
   - In Title class createMesh method: conditionally skip rendering if text is empty or showCaptions is false
   - In Media class: store `link` from item data
   - Track which image is currently centered (closest to center X position = 0)
   - In App class:
     - Add `centeredIndex` state tracking (computed in update loop based on which media has position.x closest to 0)
     - On click/tap (in onTouchUp when !this.isDown wait for drag check, or add onClick handler), if no drag occurred, call onTap callback with the centered image's link
   - Pass showCaptions to Media/Title construction to conditionally render captions
  </action>
  <verify>CircularGallery compiles without TypeScript errors when imported</verify>
  <done>CircularGallery accepts onTap callback and showCaptions prop, tracks centered image, fires callback with link on tap</done>
</task>

<task type="auto">
  <name>Task 2: Update gallery-card.tsx and simplify embla-carousel.tsx</name>
  <files>src/components/cards/gallery-card.tsx, src/components/ui/embla-carousel.tsx</files>
  <action>
1. In src/components/cards/gallery-card.tsx:
   - Transform items for CircularGallery to include link: `{ image: img.url, text: img.caption || '', link: img.link }`
   - Add onTap handler that opens link in new tab if link exists: `(link) => { if (link) window.open(link, '_blank', 'noopener,noreferrer') }`
   - Pass `showCaptions={content.showCaptions !== false}` to CircularGallery (default true)
   - Pass onTap to CircularGallery

2. In src/components/ui/embla-carousel.tsx (EmblaCarouselGallery):
   - Remove caption display (delete the `{image.caption && ...}` block)
   - Remove link wrapping (delete the anchor tag conditional, always render just the image div)
   - Keep navigation buttons and dot indicators
   - Simplify to images-only display
  </action>
  <verify>`npm run lint` passes for modified files</verify>
  <done>Circular mode fires onTap with centered image link, carousel mode shows images only</done>
</task>

<task type="auto">
  <name>Task 3: Redesign editor to vertical list with visible inputs</name>
  <files>src/components/editor/gallery-card-fields.tsx</files>
  <action>
1. Remove the Popover-based pencil icon approach (delete Popover imports and PopoverTrigger/PopoverContent)

2. Replace grid layout with vertical list layout:
   - Each image as a flex row: small thumbnail (48x48), then vertical stack of inputs
   - Layout: `<div className="flex items-start gap-3">` for each image
   - Thumbnail: `<div className="w-12 h-12 relative flex-shrink-0">` with drag handle
   - Inputs column: `<div className="flex-1 space-y-2">`
     - Caption: `<Input placeholder="Caption (optional)" value={image.caption || ''} onChange={...} />`
     - Link: `<Input placeholder="Link URL (optional)" value={image.link || ''} onChange={...} />`
   - Keep X button for remove (top right of row)
   - Keep crop button (in thumbnail area)
   - Remove link indicator icon (no longer needed - input shows link directly)

3. Add "Show Captions" toggle in circular settings section:
   - Add Switch component import
   - Between "Spacing" slider and end of circular settings:
   ```tsx
   <div className="flex items-center justify-between">
     <Label className="text-sm">Show Captions</Label>
     <Switch
       checked={content.showCaptions !== false}
       onCheckedChange={(checked) => onChange({ showCaptions: checked })}
     />
   </div>
   ```

4. Keep dnd-kit drag reorder but apply to new row layout:
   - Drag handle on thumbnail or entire row (maintain {...attributes} {...listeners} on thumbnail)
   - Style adjustments for dragging state on row
  </action>
  <verify>Editor renders without errors, can edit caption/link inline, toggle appears for circular mode</verify>
  <done>Editor shows vertical list with visible caption/link inputs per image, Show Captions toggle in circular settings</done>
</task>

</tasks>

<verification>
1. Create gallery card with 3+ images in circular mode
2. Add captions and links to images via editor (visible inputs, no popover)
3. Toggle "Show Captions" off - captions disappear from circular gallery
4. Tap/click on gallery - opens link of centered image in new tab
5. Switch to carousel mode - shows images only, no captions, no link functionality
6. Verify drag-to-reorder still works in editor
</verification>

<success_criteria>
- Circular mode: tap anywhere opens centered image's link, captions toggle-able
- Carousel mode: images only, clean and simple
- Editor: vertical list with visible caption/link inputs, no hidden popover
- All existing functionality preserved (upload, crop, reorder, remove)
</success_criteria>

<output>
After completion, update `.planning/STATE.md`:
- Add quick task 020 to completed list
- Add decision: "Circular gallery tap-to-open-link pattern" with rationale about WebGL canvas limitations
- Add decision: "Vertical list editor for gallery images" with rationale about discoverability
</output>
