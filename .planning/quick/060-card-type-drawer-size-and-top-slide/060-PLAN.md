---
phase: quick
plan: 060
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/editor/mobile-card-type-drawer.tsx
  - src/components/editor/editor-layout.tsx
autonomous: true

must_haves:
  truths:
    - "Drawer slides down from top of screen instead of up from bottom"
    - "User can see the preview area below the drawer while switching types"
    - "Big/Small size toggle buttons appear below card type grid for sizable card types"
    - "Size toggle is hidden for card types that do not support sizing (horizontal, audio, music, etc.)"
    - "Tapping a size button updates the card size immediately"
  artifacts:
    - path: "src/components/editor/mobile-card-type-drawer.tsx"
      provides: "Top-sliding drawer with card type grid and size toggle"
  key_links:
    - from: "src/components/editor/mobile-card-type-drawer.tsx"
      to: "src/types/card.ts"
      via: "CARD_TYPE_SIZING import"
      pattern: "CARD_TYPE_SIZING"
    - from: "src/components/editor/mobile-card-type-drawer.tsx"
      to: "page-store"
      via: "updateCard for size changes"
      pattern: "updateCard.*size"
---

<objective>
Update the MobileCardTypeDrawer to slide from the top (instead of bottom) and add big/small size toggle buttons for card types that support sizing.

Purpose: When the drawer slides from the top, the user can see the full preview below while switching types and sizes -- much better UX for visual feedback. The size toggle provides quick access to sizing without opening the full editor.

Output: Modified mobile-card-type-drawer.tsx with direction="top" and size toggle row.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/editor/mobile-card-type-drawer.tsx
@src/components/editor/editor-layout.tsx
@src/components/ui/drawer.tsx
@src/types/card.ts (CARD_TYPE_SIZING definition)
@src/components/editor/card-type-picker.tsx (CONVERTIBLE_CARD_TYPES)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add direction="top" and size toggle to MobileCardTypeDrawer</name>
  <files>src/components/editor/mobile-card-type-drawer.tsx</files>
  <action>
Make two changes to the MobileCardTypeDrawer component:

**1. Slide from top:**
- Add `direction="top"` prop to the `<Drawer>` component.
- The shadcn drawer.tsx already handles `data-[vaul-drawer-direction=top]` styling (top-0, rounded-b-lg, border-b) so no changes needed to drawer.tsx.
- Remove the drag handle bar that only shows for bottom direction (it is hidden automatically via the `group-data-[vaul-drawer-direction=bottom]` class in drawer.tsx).
- Update DrawerContent className: keep `h-auto` and `flex flex-col` but change `max-h-[40dvh]` to `max-h-[45dvh]` to accommodate the new size row.

**2. Add Big/Small size toggle:**
- Import `CARD_TYPE_SIZING` and `CardSize` from `@/types/card`.
- After the card type grid div and before the Full Editor button, conditionally render a size toggle row.
- Check if the current card type supports sizing: `const supportsSizing = card ? CARD_TYPE_SIZING[card.card_type] : null`
- Only render the size toggle when `supportsSizing` is not null.
- Render two buttons side by side (flex row, gap-3) labeled "Big" and "Small":
  - Each button: `h-11` for touch target, `flex-1` for equal width, `rounded-xl border-2 transition-all` matching the card type button style.
  - Selected state: `border-primary bg-primary/10 text-primary font-semibold` (same as card type selected).
  - Unselected state: `border-muted bg-muted/50 text-muted-foreground`.
  - "Big" shows text "Full Width" as subtitle (text-xs text-muted-foreground below the label).
  - "Small" shows text "Half Width" as subtitle.
- On click, call `updateCard(card.id, { size: 'big' })` or `updateCard(card.id, { size: 'small' })`.
- Current size comes from `card.size`.

**3. Add a handleSizeChange handler:**
```typescript
const handleSizeChange = (newSize: CardSize) => {
  if (!card) return
  updateCard(card.id, { size: newSize })
}
```

The size toggle section should look like:
```tsx
{supportsSizing && (
  <div className="flex gap-3">
    <button
      onClick={() => handleSizeChange('big')}
      className={cn(
        "flex-1 flex flex-col items-center gap-0.5 py-3 rounded-xl border-2 transition-all",
        card?.size === 'big'
          ? "border-primary bg-primary/10 text-primary"
          : "border-muted bg-muted/50 text-muted-foreground"
      )}
    >
      <span className="text-sm font-medium">Big</span>
      <span className="text-xs opacity-60">Full Width</span>
    </button>
    <button
      onClick={() => handleSizeChange('small')}
      className={cn(
        "flex-1 flex flex-col items-center gap-0.5 py-3 rounded-xl border-2 transition-all",
        card?.size === 'small'
          ? "border-primary bg-primary/10 text-primary"
          : "border-muted bg-muted/50 text-muted-foreground"
      )}
    >
      <span className="text-sm font-medium">Small</span>
      <span className="text-xs opacity-60">Half Width</span>
    </button>
  </div>
)}
```
  </action>
  <verify>
Run `npx tsc --noEmit` to confirm no type errors. Visually confirm on mobile that the drawer slides from the top and shows size buttons for hero/square/text cards but not for horizontal/audio cards.
  </verify>
  <done>
Drawer slides from top with direction="top". Size toggle row appears for card types where CARD_TYPE_SIZING is non-null. Tapping Big/Small updates card.size via updateCard. Size toggle hidden for types like horizontal, audio, music, link, mini where CARD_TYPE_SIZING is null.
  </done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with no type errors
- On mobile: tap a hero card -> drawer slides from top, shows type grid + Big/Small buttons
- On mobile: tap a horizontal card -> drawer slides from top, shows type grid only (no size buttons)
- Tapping Big/Small updates the card size and preview updates immediately
- The preview area below the drawer is visible while the drawer is open
</verification>

<success_criteria>
- Drawer uses direction="top" and slides from the top of the viewport
- Size toggle (Big/Small) appears only for card types with non-null CARD_TYPE_SIZING
- Size change calls updateCard with correct size value
- No TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/quick/060-card-type-drawer-size-and-top-slide/060-SUMMARY.md`
</output>
