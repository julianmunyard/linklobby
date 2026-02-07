---
phase: quick
plan: 043
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/editor/cards-tab.tsx
  - src/components/cards/macintosh-card.tsx
  - src/components/public/static-macintosh-layout.tsx
  - src/components/editor/card-property-editor.tsx
autonomous: true

must_haves:
  truths:
    - "User can add a Photos card from the Mac card type menu"
    - "Gallery card renders inside a Mac large-window frame with Lines title bar showing editable title (default 'Photos')"
    - "Gallery card has circular and carousel layout options exactly like other themes"
    - "Gallery card fields (style toggle, image upload, circular settings) appear in property editor for Mac gallery cards"
    - "Public page renders Mac gallery card identically inside the large-window frame"
  artifacts:
    - path: "src/components/cards/macintosh-card.tsx"
      provides: "MacintoshGallery component"
      contains: "MacintoshGallery"
    - path: "src/components/editor/cards-tab.tsx"
      provides: "Photos option in MAC_CARD_TYPES"
      contains: "gallery"
    - path: "src/components/public/static-macintosh-layout.tsx"
      provides: "StaticMacGallery component for public pages"
      contains: "StaticMacGallery"
  key_links:
    - from: "src/components/cards/macintosh-card.tsx"
      to: "src/components/cards/gallery-card.tsx"
      via: "imports GalleryCard and renders inside WindowWrapper"
      pattern: "GalleryCard"
    - from: "src/components/editor/cards-tab.tsx"
      to: "handleAddCard"
      via: "gallery macWindowStyle creates card_type gallery"
      pattern: "gallery.*card_type.*gallery|gallery.*macWindowStyle"
---

<objective>
Make the gallery card render inside the large window on the Macintosh theme. Add "Photos" to the Mac card type menu, render the actual GalleryCard (with circular/carousel modes) inside a Mac window frame with Lines title bar, and ensure gallery editor fields work.

Purpose: Gallery cards are currently exempt from Macintosh theming and render raw. Users on the Macintosh theme need a native-looking Photos window.
Output: Working Mac-style gallery card with full circular/carousel support.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/components/cards/macintosh-card.tsx
@src/components/cards/gallery-card.tsx
@src/components/editor/cards-tab.tsx
@src/components/editor/card-property-editor.tsx
@src/components/editor/gallery-card-fields.tsx
@src/components/public/static-macintosh-layout.tsx
@src/components/cards/macintosh-layout.tsx
@src/components/cards/themed-card-wrapper.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add Photos to Mac card menu and wire gallery card creation + editor fields</name>
  <files>
    src/components/editor/cards-tab.tsx
    src/components/editor/card-property-editor.tsx
  </files>
  <action>
**cards-tab.tsx:**

1. Add `'gallery'` to the `MacWindowStyle` type union (line 40):
   ```
   type MacWindowStyle = 'notepad' | 'small-window' | 'large-window' | 'title-link' | 'map' | 'calculator' | 'presave' | 'gallery'
   ```

2. Add Photos entry to `MAC_CARD_TYPES` array (after presave, before map):
   ```
   { label: "Photos", macWindowStyle: "gallery" },
   ```

3. In `handleAddCard`, update the `defaultContent` switch for `macWindowStyle`:
   Add a case for `'gallery'`:
   ```
   case 'gallery':
     return { macWindowStyle: 'gallery', galleryStyle: 'circular', images: [] }
   ```

4. **Critical:** In `handleAddCard`, change the `card_type` assignment (line 152) from:
   ```
   card_type: macWindowStyle ? "hero" : type,
   ```
   to:
   ```
   card_type: macWindowStyle === 'gallery' ? "gallery" : (macWindowStyle ? "hero" : type),
   ```
   This ensures gallery cards get `card_type: "gallery"` so the GalleryCardFields show in the editor and GalleryCardContent type is used.

5. Also update the `MacWindowStyle` type at the top of the file to include `'gallery'`.

**card-property-editor.tsx:**

1. Gallery fields already render when `card.card_type === "gallery"` (line 307), so no change needed for gallery fields display.

2. Update the title visibility condition (line 558) to also show title for `macWindowStyle === 'gallery'`:
   The current condition shows title for `small-window`, `large-window`, `title-link`, `presave`. Add `'gallery'` to this list so the title bar text is editable. The condition is:
   ```
   (!isMacCard || macWindowStyle === 'small-window' || macWindowStyle === 'large-window' || macWindowStyle === 'title-link' || macWindowStyle === 'presave')
   ```
   Change to:
   ```
   (!isMacCard || macWindowStyle === 'small-window' || macWindowStyle === 'large-window' || macWindowStyle === 'title-link' || macWindowStyle === 'presave' || macWindowStyle === 'gallery')
   ```

3. The gallery card type is NOT in the `macWindowStyle === 'small-window' || macWindowStyle === 'large-window'` condition that shows MacWindowFields (mode/body text/video upload) -- this is correct, we do NOT want those fields for gallery.
  </action>
  <verify>
- Check that `MAC_CARD_TYPES` includes `{ label: "Photos", macWindowStyle: "gallery" }`
- Check that adding a Photos card creates a card with `card_type: "gallery"` and `content.macWindowStyle: "gallery"`
- Check the title field is visible in the property editor for gallery mac cards
- `npm run build` compiles without type errors
  </verify>
  <done>Photos appears in the Mac card type dropdown. Created cards have card_type "gallery" with macWindowStyle "gallery". Gallery fields and title are editable in the property editor.</done>
</task>

<task type="auto">
  <name>Task 2: Create MacintoshGallery component and wire into routing</name>
  <files>
    src/components/cards/macintosh-card.tsx
    src/components/cards/macintosh-layout.tsx
  </files>
  <action>
**macintosh-card.tsx:**

1. Import the GalleryCard component at the top:
   ```
   import { GalleryCard } from './gallery-card'
   ```

2. Add `'gallery'` to the `MacWindowStyle` type (line 12):
   ```
   type MacWindowStyle = 'notepad' | 'small-window' | 'large-window' | 'title-link' | 'map' | 'calculator' | 'presave' | 'gallery'
   ```

3. In the `MacintoshCard` router (the main switch), add a check BEFORE the macWindowStyle switch, similar to how `social-icons` is handled. Add after the social-icons check (after line 36):
   ```
   if (card.card_type === 'gallery') {
     return <MacintoshGallery card={card} isPreview={isPreview} onClick={onClick} isSelected={isSelected} />
   }
   ```
   Also add `'gallery'` case to the switch statement for macWindowStyle:
   ```
   case 'gallery':
     return <MacintoshGallery card={card} isPreview={isPreview} onClick={onClick} isSelected={isSelected} />
   ```

4. Create the `MacintoshGallery` component. It renders a Mac large-window frame (LinesTitleBar + white content area) with the actual GalleryCard inside. The gallery needs overflow visible for the circular mode. Use the existing `WindowWrapper` but without `overflow-hidden` since circular gallery needs to bleed. The component:

   ```tsx
   export function MacintoshGallery({ card, isPreview, onClick, isSelected }: MacCardProps) {
     const title = card.title || 'Photos'

     return (
       <div
         className="cursor-pointer"
         onClick={onClick}
         style={{
           border: MAC_BORDER,
           outline: isSelected ? '2px solid #0066ff' : 'none',
           outlineOffset: '2px',
         }}
       >
         <LinesTitleBar title={title} />
         {/* White content area with gallery inside */}
         <div style={{ background: '#fff', overflow: 'hidden' }}>
           <GalleryCard card={card} isPreview={isPreview} />
         </div>
       </div>
     )
   }
   ```

   Note: Use `overflow: 'hidden'` on the content area to contain the gallery within the window frame. The circular gallery's WebGL canvas will render within these bounds. This differs from the non-Mac gallery which uses overflow-visible for full-bleed.

**macintosh-layout.tsx:**

1. No changes needed. The MacintoshLayout already renders ALL visible cards through `MacintoshCard`, and our new routing in MacintoshCard handles gallery cards.
  </action>
  <verify>
- In the editor preview with Macintosh theme, adding a Photos card shows a Mac window with Lines title bar saying "Photos"
- The gallery content (circular WebGL or carousel) renders inside the white area below the title bar
- Title bar text updates when editing the card title
- `npm run build` compiles without errors
  </verify>
  <done>MacintoshGallery component renders GalleryCard inside a Mac large-window frame. Circular and carousel modes both work within the Mac window. Title defaults to "Photos" and is editable.</done>
</task>

<task type="auto">
  <name>Task 3: Add StaticMacGallery for public page rendering</name>
  <files>
    src/components/public/static-macintosh-layout.tsx
  </files>
  <action>
**static-macintosh-layout.tsx:**

1. Import GalleryCard at the top (dynamic import since it uses WebGL):
   ```tsx
   import dynamic from 'next/dynamic'
   import { EmblaCarouselGallery } from '@/components/ui/embla-carousel'
   import type { GalleryCardContent, GalleryImage } from '@/types/card'
   ```

2. In `StaticMacCard` router function (around line 343), add a check for gallery cards BEFORE the macWindowStyle switch, similar to social-icons:
   ```tsx
   if (card.card_type === 'gallery') {
     return <StaticMacGallery card={card} />
   }
   ```

3. Create the `StaticMacGallery` component. For the public/static page, use the carousel (Embla) layout since the circular WebGL gallery requires client-side interactivity that may not work well as a static component. Actually, since the static-macintosh-layout is already `'use client'`, we CAN render the full gallery. Import the CircularGallery dynamically:

   ```tsx
   const CircularGallery = dynamic(
     () => import('@/components/CircularGallery'),
     { ssr: false, loading: () => <div style={{ width: '100%', height: '300px', background: '#f0f0f0' }} /> }
   )
   ```

4. Create the StaticMacGallery component:
   ```tsx
   function StaticMacGallery({ card }: { card: Card }) {
     const content = card.content as Partial<GalleryCardContent>
     const title = card.title || 'Photos'
     const images = content.images || []

     if (images.length === 0) return null

     return (
       <div data-card-id={card.id} style={{ border: MAC_BORDER, overflow: 'hidden' }}>
         <LinesTitleBar title={title} />
         <div style={{ background: '#fff' }}>
           {content.galleryStyle === 'carousel' ? (
             <EmblaCarouselGallery images={images} />
           ) : (
             <div style={{ height: '350px', position: 'relative' }}>
               <CircularGallery
                 items={images.map(img => ({
                   image: img.url,
                   text: img.caption || '',
                   link: img.link || null,
                 }))}
                 bend={content.bend ?? 1.5}
                 borderRadius={content.borderRadius ?? 0.05}
                 scrollSpeed={content.scrollSpeed ?? 1.5}
                 scrollEase={content.scrollEase ?? 0.03}
                 spacing={content.spacing ?? 2.5}
                 textColor={content.captionColor || "#ffffff"}
                 font="16px sans-serif"
                 showCaptions={content.showCaptions !== false}
               />
             </div>
           )}
         </div>
       </div>
     )
   }
   ```

5. Also add `'gallery'` to the macWindowStyle switch case as fallthrough:
   ```tsx
   case 'gallery':
     return <StaticMacGallery card={card} />
   ```

6. In the `handleCardClick` callback, add gallery to the non-clickable types (gallery cards handle their own interaction via WebGL/carousel):
   ```tsx
   if (card.card_type === 'gallery') {
     return
   }
   ```
  </action>
  <verify>
- Public page renders gallery cards in a Mac window frame with the Lines title bar
- Both circular and carousel gallery styles render correctly on the public page
- Empty gallery cards (no images) are hidden on the public page
- `npm run build` compiles without errors
  </verify>
  <done>StaticMacGallery component renders gallery inside Mac window on public pages. Both circular (WebGL) and carousel (Embla) modes work. Empty galleries hidden.</done>
</task>

</tasks>

<verification>
1. `npm run build` compiles without errors
2. In the editor with Macintosh theme selected:
   - "Photos" appears in the Add Card dropdown
   - Clicking "Photos" creates a gallery card with Mac window frame
   - Title bar says "Photos" by default and updates when edited
   - Gallery Style toggle (Circular/Carousel) appears in property editor
   - Image upload works and images display inside the Mac window
   - Circular gallery WebGL renders inside the window bounds
   - Carousel mode works with left/right navigation
3. On the public page with Macintosh theme:
   - Gallery cards render in Mac window frames
   - Both circular and carousel modes work
</verification>

<success_criteria>
- Photos card type available in Macintosh theme card menu
- Gallery renders inside Mac large-window frame with LinesTitleBar
- Default title "Photos" shown, editable via property editor
- Circular and carousel gallery styles both functional inside the Mac frame
- Gallery editor fields (style toggle, image upload, circular settings, caption controls) all work
- Public page renders identically
</success_criteria>

<output>
After completion, create `.planning/quick/043-macintosh-gallery-card-in-large-window/043-SUMMARY.md`
</output>
