---
phase: quick
plan: 059
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/editor/mobile-card-type-drawer.tsx
  - src/components/editor/editor-layout.tsx
autonomous: true

must_haves:
  truths:
    - "On mobile, tapping a convertible card (hero, horizontal, square, link, mini, text) opens a compact bottom drawer showing card type options instead of the full editor"
    - "User can switch card type by tapping a type button in the compact drawer"
    - "Compact drawer includes a 'Full Editor' button that closes the drawer and opens the full 85dvh bottom sheet editor for the selected card"
    - "Non-convertible cards (video, gallery, game, audio, music, social-icons, email-collection, release) skip the type drawer and open the full editor directly"
    - "The drawer style matches the quick settings drawers from task 058 (Vaul, compact height, same visual language)"
    - "Desktop card selection behavior is completely unchanged"
  artifacts:
    - path: "src/components/editor/mobile-card-type-drawer.tsx"
      provides: "MobileCardTypeDrawer component with compact card type switching UI"
    - path: "src/components/editor/editor-layout.tsx"
      provides: "Updated mobile flow intercepting card tap for convertible types"
  key_links:
    - from: "src/components/editor/mobile-card-type-drawer.tsx"
      to: "src/stores/page-store.ts"
      via: "usePageStore for updateCard and selectedCardId"
      pattern: "usePageStore"
    - from: "src/components/editor/mobile-card-type-drawer.tsx"
      to: "src/components/editor/card-type-picker.tsx"
      via: "imports CONVERTIBLE_CARD_TYPES array and isConvertibleType"
      pattern: "CONVERTIBLE_TYPES|isConvertibleType"
    - from: "src/components/editor/editor-layout.tsx"
      to: "src/components/editor/mobile-card-type-drawer.tsx"
      via: "renders MobileCardTypeDrawer in mobile layout"
      pattern: "MobileCardTypeDrawer"
---

<objective>
Add a compact mobile bottom drawer for quick card type switching. When a user taps a convertible card on mobile, instead of immediately opening the full 85dvh editor bottom sheet, show a slim bottom drawer (~35dvh) with the 6 convertible card type options (Hero, Horizontal, Square, Link, Mini, Text) for one-tap type switching. The drawer includes a "Full Editor" button to access the complete editor when needed.

Purpose: On mobile, opening the full editor just to change a card type is heavy. Most card taps in the layout phase are about trying different card types. This compact drawer provides a fast path for the most common mobile editing action while keeping the full editor accessible.

Output: New MobileCardTypeDrawer component, updated editor-layout.tsx mobile card selection flow.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/editor/editor-layout.tsx
@src/components/editor/card-type-picker.tsx
@src/components/editor/mobile-quick-settings.tsx
@src/components/editor/mobile-bottom-sheet.tsx
@src/components/editor/card-property-editor.tsx
@src/stores/page-store.ts
@src/types/card.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create MobileCardTypeDrawer component</name>
  <files>
    src/components/editor/mobile-card-type-drawer.tsx
  </files>
  <action>
Create `src/components/editor/mobile-card-type-drawer.tsx` with a `MobileCardTypeDrawer` component.

**Props interface:**
```tsx
interface MobileCardTypeDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: Card | null
  onOpenFullEditor: () => void
}
```

**Visual design - match task 058 compact drawer pattern:**
- Use Vaul `Drawer` from `@/components/ui/drawer` with `modal={false}`
- Height: `h-auto` (not fixed 50dvh like quick settings - this drawer should be slim, just enough to fit the type grid and a button). Use a max-height of `max-h-[40dvh]` as a safety rail.
- Include DrawerHeader with DrawerTitle "Card Type"
- Content area with `touch-pan-y` for scroll safety

**Drawer content:**
1. A 3x2 grid of card type buttons matching the existing `CardTypePicker` layout (grid-cols-3, gap-3). Each button shows the Lucide icon + label text. Reuse the same CONVERTIBLE_CARD_TYPES array from `card-type-picker.tsx` -- export it from there if not already exported (it is `as const` but the array itself is not exported; create a named export for it, OR just duplicate the array in this file since it is small and stable).

   Actually, to keep it DRY, export `CONVERTIBLE_CARD_TYPES` from `card-type-picker.tsx` (it is currently a module-level const but not exported). Then import it here.

   Style each button as:
   - `flex flex-col items-center gap-1.5 h-auto py-4 px-2 rounded-xl border-2 transition-all`
   - Default: `border-muted bg-muted/50 text-muted-foreground`
   - Selected (matches current card type): `border-primary bg-primary/10 text-primary`
   - On tap: call `handleTypeChange(type)` which does `updateCard(card.id, { card_type: newType })` (same as card-property-editor.tsx handleTypeChange)
   - Icon size: `h-7 w-7` (slightly larger than the 6-col picker for better mobile touch targets)
   - Label: `text-xs font-medium`

2. Below the grid, a full-width outlined Button: "Full Editor" with a Pencil icon, calling `onOpenFullEditor()`. This closes the type drawer and opens the full bottom sheet.

3. At the very bottom, a subtle "Swipe down to dismiss" hint or just rely on the Vaul drag handle.

**Behavior:**
- When a type button is tapped, immediately update the card type via `usePageStore.getState().updateCard(card.id, { card_type: newType })`. Do NOT close the drawer after type change -- the user might want to try several types. The selected state updates live as the preview behind shows the change.
- "Full Editor" button calls `onOpenFullEditor()` which the parent handles.
- Drawer dismissal (swipe or overlay tap) just closes without side effects.

**Important:** Use `usePageStore` for `updateCard`. Import `Card` type from `@/types/card`. Import icons from lucide-react matching the existing card-type-picker (RectangleHorizontal, Minus, Square, Type, Tag, AlignLeft).
  </action>
  <verify>
File exists at `src/components/editor/mobile-card-type-drawer.tsx`. Exports `MobileCardTypeDrawer`. TypeScript compiles: `npx tsc --noEmit --pretty 2>&1 | head -30`.
  </verify>
  <done>
MobileCardTypeDrawer component created with 3x2 card type grid, live type switching, and "Full Editor" escape hatch button.
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire MobileCardTypeDrawer into editor-layout mobile flow</name>
  <files>
    src/components/editor/editor-layout.tsx
    src/components/editor/card-type-picker.tsx
  </files>
  <action>
**card-type-picker.tsx change:**
Export the `CONVERTIBLE_CARD_TYPES` array so MobileCardTypeDrawer can import it:
```tsx
export const CONVERTIBLE_CARD_TYPES = [
  { type: "hero" as CardType, icon: RectangleHorizontal, label: "Hero" },
  // ... rest unchanged
] as const
```
This is a single keyword change (`export` added to the existing `const`).

**editor-layout.tsx changes:**

1. Import `MobileCardTypeDrawer` from `./mobile-card-type-drawer`
2. Import `isConvertibleType` from `./card-type-picker`
3. Import `Card` type from `@/types/card`
4. Add state: `const [typeDrawerOpen, setTypeDrawerOpen] = useState(false)`
5. Add a derived value to get the selected card object:
   ```tsx
   const cards = usePageStore((state) => state.cards)
   const selectedCard = cards.find(c => c.id === selectedCardId) || null
   ```

6. **Change the mobile card selection behavior.** Currently:
   ```tsx
   useEffect(() => {
     if (isMobileLayout && selectedCardId) {
       setMobileSheetOpen(true)
     }
   }, [isMobileLayout, selectedCardId])
   ```

   Change to:
   ```tsx
   useEffect(() => {
     if (isMobileLayout && selectedCardId) {
       const card = usePageStore.getState().cards.find(c => c.id === selectedCardId)
       if (card && isConvertibleType(card.card_type)) {
         // Convertible cards: show compact type drawer first
         setTypeDrawerOpen(true)
       } else {
         // Non-convertible cards: go straight to full editor
         setMobileSheetOpen(true)
       }
     }
   }, [isMobileLayout, selectedCardId])
   ```

7. Add the `MobileCardTypeDrawer` to the mobile layout JSX, between MobileSelectionBar and the preview div:
   ```tsx
   <MobileCardTypeDrawer
     open={typeDrawerOpen}
     onOpenChange={(open) => {
       setTypeDrawerOpen(open)
       if (!open) {
         // Deselect card when drawer is dismissed (clean state)
         // Only deselect if the full editor isn't about to open
         // Actually, don't deselect - user might want to tap again
       }
     }}
     card={selectedCard}
     onOpenFullEditor={() => {
       setTypeDrawerOpen(false)
       setMobileSheetOpen(true)
     }}
   />
   ```

8. When the full editor bottom sheet closes, also ensure typeDrawerOpen is false. In the existing MobileBottomSheet onOpenChange:
   ```tsx
   onOpenChange={(open) => {
     setMobileSheetOpen(open)
     if (!open) {
       setInitialDesignTab(null)
       setTypeDrawerOpen(false)
     }
   }}
   ```

**Key behavior details:**
- Tapping a convertible card on mobile opens the type drawer (not the full editor)
- Tapping a non-convertible card (video, gallery, game, audio, music, social-icons, email-collection, release) opens the full editor directly
- "Full Editor" button in the type drawer closes it and opens the full bottom sheet
- If user taps a different card while the type drawer is open, the drawer updates to show that card's current type (reactive via `selectedCard` prop)
- Desktop behavior is completely unchanged (the useEffect only runs when `isMobileLayout` is true)
  </action>
  <verify>
`npm run build 2>&1 | tail -20` completes without errors. On mobile viewport (Chrome DevTools):
1. Tap a hero/horizontal/square/link/mini/text card -> compact type drawer appears (not the full editor)
2. Tap a type button in the drawer -> card type changes live in preview
3. Tap "Full Editor" -> type drawer closes, full bottom sheet opens with card selected
4. Tap a video/gallery/game/audio card -> full editor opens directly (no type drawer)
5. Swipe down on type drawer -> drawer dismisses
6. Desktop: clicking cards opens full editor as before (no type drawer)
  </verify>
  <done>
Mobile card tap flow updated: convertible cards show compact type drawer first, non-convertible cards go straight to full editor. Type drawer matches task 058 compact drawer style with "Full Editor" escape hatch.
  </done>
</task>

</tasks>

<verification>
1. Mobile viewport: Tapping a convertible card shows the compact type drawer (not the full editor)
2. Type drawer shows 3x2 grid of card types with current type highlighted
3. Tapping a type button changes the card type immediately (preview updates)
4. "Full Editor" button closes the type drawer and opens the full 85dvh bottom sheet
5. Non-convertible cards (video, gallery, game, audio, etc.) skip the type drawer entirely
6. Type drawer style matches task 058 compact drawers (Vaul, slim height, same visual language)
7. Desktop card selection is completely unaffected
8. TypeScript compiles, build succeeds
</verification>

<success_criteria>
- MobileCardTypeDrawer component renders a compact bottom drawer with 6 card type options
- Convertible card taps on mobile show the type drawer instead of the full editor
- Card type changes are immediate and reflected in the preview
- "Full Editor" button provides escape to the full bottom sheet editor
- Non-convertible cards bypass the type drawer entirely
- Desktop behavior unchanged
- Build completes without errors
</success_criteria>

<output>
After completion, create `.planning/quick/059-mobile-compact-card-type-drawer/059-SUMMARY.md`
</output>
