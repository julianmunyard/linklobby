---
phase: quick
plan: 061
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/editor/preview-panel.tsx
  - src/components/editor/mobile-card-type-drawer.tsx
autonomous: true

must_haves:
  truths:
    - "On mobile, the preview iframe is wrapped in a phone-shaped frame (rounded corners, 4px border) scaled to fit available space"
    - "User can pinch-to-zoom and pan the phone frame on mobile to inspect details or zoom out"
    - "Double-tap on the phone frame resets to the initial fit-to-container scale"
    - "The card type drawer expands to reveal font size slider and text color picker when toggled"
    - "Font size slider updates cardTypeFontSizes in theme store for the selected card's type"
    - "Text color picker updates textColor in card.content for the selected card"
  artifacts:
    - path: "src/components/editor/preview-panel.tsx"
      provides: "Mobile phone frame with pinch-to-zoom via @use-gesture/react"
    - path: "src/components/editor/mobile-card-type-drawer.tsx"
      provides: "Expandable drawer with font size and text color controls"
  key_links:
    - from: "src/components/editor/preview-panel.tsx"
      to: "@use-gesture/react"
      via: "useGesture hook for pinch and drag"
      pattern: "useGesture"
    - from: "src/components/editor/mobile-card-type-drawer.tsx"
      to: "src/stores/theme-store.ts"
      via: "setCardTypeFontSize action"
      pattern: "setCardTypeFontSize"
    - from: "src/components/editor/mobile-card-type-drawer.tsx"
      to: "src/stores/page-store.ts"
      via: "updateCard for textColor"
      pattern: "updateCard.*textColor"
---

<objective>
Two mobile UX improvements: (1) wrap the mobile preview iframe in a phone-shaped frame with pinch-to-zoom/pan gestures, and (2) expand the card type drawer to include font size and text color controls.

Purpose: Give mobile users the same phone-frame preview experience as desktop, with gesture-based zoom for inspection. Reduce trips to the full editor by surfacing font size and text color directly in the quick drawer.
Output: Updated preview-panel.tsx with gesture-enabled phone frame on mobile, updated mobile-card-type-drawer.tsx with expandable "More" section.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/editor/preview-panel.tsx
@src/components/editor/mobile-card-type-drawer.tsx
@src/components/editor/editor-layout.tsx
@src/stores/theme-store.ts
@src/types/card.ts
@src/components/ui/color-picker.tsx
@src/components/editor/hero-card-fields.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Mobile phone frame with pinch-to-zoom gestures</name>
  <files>src/components/editor/preview-panel.tsx</files>
  <action>
Install @use-gesture/react:
```
npm install @use-gesture/react
```

Modify the mobile layout branch (the `if (isMobileLayout)` block, lines 144-161) in preview-panel.tsx:

1. Add state for gesture transforms:
   - `const [scale, setScale] = useState(1)` (will be set to initial fit scale)
   - `const [translate, setTranslate] = useState({ x: 0, y: 0 })`
   - Reuse the existing `mobileScale` state and `updateMobileScale` logic (currently only used for desktop) to compute the initial fit scale for mobile too. The containerRef and scale calculation already exist.

2. Compute initial fit scale on mobile:
   - Use the same `updateMobileScale` callback and ResizeObserver effect that already exists (lines 31-52). These currently run regardless of layout, so `mobileScale` is already computed. Use it as the "base" scale for the phone frame.
   - Store a `baseScale` ref that captures the fit scale: `const baseScaleRef = useRef(1)`. Update it whenever mobileScale changes.

3. Add the phone frame wrapper inside the mobile layout:
   - Replace the bare iframe with a phone-frame container matching desktop styling:
     ```
     width: MOBILE_WIDTH (375px)
     height: MOBILE_HEIGHT (667px)
     borderRadius: '2rem'
     borderWidth: '4px'
     borderColor: 'hsl(var(--foreground) / 0.1)'
     borderStyle: 'solid'
     ```
   - The phone frame should be centered in the container.

4. Apply CSS transform for zoom/pan:
   - On the phone frame div, apply: `transform: scale(${scale}) translate(${translate.x}px, ${translate.y}px)`
   - `transformOrigin: 'center center'`
   - Initial scale = mobileScale (fit to container)

5. Use @use-gesture/react for pinch and drag:
   ```tsx
   import { useGesture } from '@use-gesture/react'
   ```
   - Bind to the container div (not the phone frame itself):
   ```tsx
   const gestureRef = useRef<HTMLDivElement>(null)
   const bind = useGesture(
     {
       onPinch: ({ offset: [s], memo }) => {
         const newScale = baseScaleRef.current * s
         setScale(Math.max(0.1, Math.min(newScale, 3)))
         return memo
       },
       onDrag: ({ delta: [dx, dy], pinching }) => {
         if (pinching) return  // Don't drag while pinching
         setTranslate(prev => ({ x: prev.x + dx, y: prev.y + dy }))
       },
     },
     {
       target: gestureRef,
       pinch: { scaleBounds: { min: 0.1, max: 3 }, rubberband: true },
       drag: { filterTaps: true },
       eventOptions: { passive: false },
     }
   )
   ```
   - IMPORTANT: Set `touch-action: none` on the gesture container to prevent browser default pinch-zoom.

6. Double-tap to reset:
   - Track last tap time with a ref. On touch/click on the container:
   ```tsx
   const lastTapRef = useRef(0)
   const handleDoubleTap = () => {
     const now = Date.now()
     if (now - lastTapRef.current < 300) {
       // Double tap - reset to fit
       setScale(baseScaleRef.current)
       setTranslate({ x: 0, y: 0 })
     }
     lastTapRef.current = now
   }
   ```
   - Attach this to the container's onClick handler. Keep the existing handleDeselect logic - call both.

7. The container div wrapping the phone frame needs:
   - `ref` combining containerRef and gestureRef (use a callback ref or assign both)
   - `overflow-hidden` to clip zoomed content
   - `touch-action: none` style to prevent browser gesture interference
   - `className="flex-1 min-h-0 bg-muted/30 flex items-center justify-center overflow-hidden"` with `style={{ touchAction: 'none' }}`

8. Keep the iframe inside the phone frame div with `className="w-full h-full border-0"`.

DO NOT modify the desktop layout branch at all. Only change the mobile branch.
DO NOT use gesture libraries' `useEffect`-based binding (the `target` option handles it). However, if `target` approach causes issues with the ref, fall back to spread binding: `<div {...bind()} ref={...}>`.
  </action>
  <verify>
Run `npm run build` to confirm no TypeScript errors. Visually verify on mobile (or Chrome DevTools mobile emulation):
- Phone frame appears with rounded corners and 4px border
- Frame is initially scaled to fit the container
- Pinch gesture zooms in/out
- Drag gesture pans when zoomed
- Double-tap resets to fit view
  </verify>
  <done>
Mobile preview shows a phone-shaped frame (375x667, 2rem radius, 4px border) that is pinch-to-zoomable, pannable, and double-tap-resettable. Desktop layout unchanged.
  </done>
</task>

<task type="auto">
  <name>Task 2: Expandable card type drawer with font size and text color</name>
  <files>src/components/editor/mobile-card-type-drawer.tsx</files>
  <action>
Modify mobile-card-type-drawer.tsx to add an expandable "More" section below the existing content:

1. Add imports:
   ```tsx
   import { ChevronDown, Pencil } from "lucide-react"
   import { Slider } from "@/components/ui/slider"
   import { ColorPicker } from "@/components/ui/color-picker"
   import { useThemeStore } from "@/stores/theme-store"
   import type { CardTypeFontSizes } from "@/types/theme"
   ```

2. Add state for expand/collapse:
   ```tsx
   const [expanded, setExpanded] = useState(false)
   ```

3. Add theme store hooks inside the component:
   ```tsx
   const cardTypeFontSizes = useThemeStore((state) => state.cardTypeFontSizes)
   const setCardTypeFontSize = useThemeStore((state) => state.setCardTypeFontSize)
   ```

4. Derive the font size key from the selected card's type. Only card types that exist in CardTypeFontSizes have font size control (hero, square, horizontal, link, mini, text, gallery, video). Map the card type:
   ```tsx
   const fontSizeKey = card?.card_type as keyof CardTypeFontSizes | undefined
   const hasFontSize = fontSizeKey && fontSizeKey in cardTypeFontSizes
   const currentFontSize = hasFontSize ? cardTypeFontSizes[fontSizeKey] : 1
   ```

5. Determine if the card type supports textColor. Check if the card's content type interface includes textColor. Most types do (hero, horizontal, link, square, video, music, release). Use a simple set:
   ```tsx
   const TEXT_COLOR_TYPES = new Set(['hero', 'horizontal', 'link', 'square', 'video', 'music', 'release'])
   const hasTextColor = card ? TEXT_COLOR_TYPES.has(card.card_type) : false
   const currentTextColor = (card?.content as Record<string, unknown>)?.textColor as string || '#ffffff'
   ```

6. Add the expandable section BELOW the existing size toggle and ABOVE the drag handle. The section should:
   - Show a "More" toggle button (chevron + text) that flips expanded state
   - When expanded, reveal font size slider and text color picker with smooth animation

   ```tsx
   {/* Expandable "More" section */}
   {card && (hasFontSize || hasTextColor) && (
     <div className="border-t border-border/50">
       <button
         onClick={() => setExpanded(!expanded)}
         className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
       >
         <span>{expanded ? 'Less' : 'More'}</span>
         <ChevronDown className={cn(
           "h-3 w-3 transition-transform duration-200",
           expanded && "rotate-180"
         )} />
       </button>

       {expanded && (
         <div className="px-3 pb-2 space-y-3 animate-in slide-in-from-top-2 duration-200">
           {/* Font Size Slider */}
           {hasFontSize && (
             <div className="space-y-1.5">
               <div className="flex justify-between text-xs">
                 <span className="text-muted-foreground">Font Size</span>
                 <span className="text-muted-foreground">{Math.round(currentFontSize * 100)}%</span>
               </div>
               <Slider
                 value={[currentFontSize]}
                 onValueChange={(v) => setCardTypeFontSize(fontSizeKey!, v[0])}
                 min={0.5}
                 max={2}
                 step={0.1}
                 className="h-6"
               />
             </div>
           )}

           {/* Text Color Picker */}
           {hasTextColor && (
             <ColorPicker
               label="Text Color"
               color={currentTextColor}
               onChange={(color) => {
                 if (!card) return
                 updateCard(card.id, {
                   content: { ...card.content, textColor: color }
                 })
               }}
               className="text-xs"
             />
           )}
         </div>
       )}
     </div>
   )}
   ```

7. Place this new section inside the DrawerPrimitive.Content, after the size toggle `</div>` (after the closing of `<div className="px-3 pt-3 pb-2 space-y-2">`) and before the drag handle `<div className="flex justify-center pb-2 pt-0.5">`.

8. Reset expanded state when the drawer closes or card changes:
   ```tsx
   // Reset expanded when card changes
   useEffect(() => {
     setExpanded(false)
   }, [card?.id])
   ```
   Add this useEffect import if not present, and add the effect inside the component.

DO NOT use Vaul snap points - use the simpler expand/collapse approach with local state.
DO NOT modify the existing card type grid or size toggle behavior.
The font size slider applies to ALL cards of that type (same as hero-card-fields.tsx pattern using setCardTypeFontSize from theme store).
The text color picker applies to the SPECIFIC selected card (via updateCard on card.content.textColor).
  </action>
  <verify>
Run `npm run build` to confirm no TypeScript errors. On mobile (or Chrome DevTools emulation):
- Select a card to open the drawer
- "More" toggle appears below the size buttons
- Tapping "More" reveals font size slider and text color picker
- Font size slider changes the card type's font size in real-time
- Text color picker changes the selected card's text color
- "More" section collapses when toggled again
- Section resets to collapsed when selecting a different card
  </verify>
  <done>
Card type drawer has an expandable "More" section with font size slider (per card type via theme store) and text color picker (per card via card.content.textColor). Section toggles smoothly and resets on card change.
  </done>
</task>

</tasks>

<verification>
- `npm run build` passes with no errors
- Mobile preview shows phone frame (375x667, rounded, bordered) scaled to fit
- Pinch-to-zoom works on the phone frame
- Drag-to-pan works when zoomed in
- Double-tap resets zoom to fit view
- Card type drawer "More" section expands to show font size + text color
- Font size slider updates preview in real-time
- Text color picker updates the selected card's text color
- Desktop layout completely unaffected
</verification>

<success_criteria>
- Phone frame visible on mobile with same styling as desktop (375x667, 2rem radius, 4px border)
- Gestures (pinch-zoom, pan, double-tap reset) work smoothly on mobile
- Drawer expands/collapses with font size and text color controls
- All controls wire to existing stores (theme store for font size, page store for text color)
- No regressions on desktop layout
</success_criteria>

<output>
After completion, create `.planning/quick/061-mobile-phone-zoom-and-drawer-expand/061-SUMMARY.md`
</output>
