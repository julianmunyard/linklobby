---
phase: quick
plan: 028
subsystem: editor
tags: [cards, theming, transparency, ui]
completed: 2026-02-03
duration: 17m
---

# Quick Task 028: Transparent Card Background Toggle with Apply to All Summary

**One-liner:** Added transparency toggle for cards with bulk apply, allowing page backgrounds to show through bordered cards

## What Was Built

Implemented a transparency feature that allows users to toggle card backgrounds transparent while keeping borders visible, with an "Apply to All" button for bulk operations.

### Task 1: Add Transparency Toggle with Apply to All (Commit: 21766a1)

**Store Action:**
- Added `setAllCardsTransparency(transparent: boolean)` action to page-store.ts
- Updates `transparentBackground` field in content of ALL cards at once

**Editor UI:**
- Added Switch toggle for "Transparent Background" in card-property-editor.tsx
- Placed after Vertical Alignment section
- Added "Apply to All" ghost button next to toggle
- Toast notification confirms bulk apply action
- Toggle bound to `content.transparentBackground` boolean field

### Task 2: Apply Transparency in Themed Wrappers (Commit: c0ea8b6)

**ThemedCardWrapper Updates:**
- Added `content?: Record<string, unknown>` prop to ThemedCardWrapperProps
- Extracts `isTransparent = content?.transparentBackground === true`
- Conditionally removes `bg-theme-card-bg` class when transparent for:
  - Instagram Reels theme (default case)
  - Mac OS theme (non-chrome cards)
  - Border (`border border-theme-border`) always remains visible

**MacOSCard Updates:**
- Added `transparentBackground?: boolean` prop
- Conditionally removes `bg-theme-card-bg` when transparent
- Border and traffic lights remain visible

**SystemSettingsCard Updates:**
- Added `transparentBackground?: boolean` prop
- Applies to both thin frame cards (link/horizontal/mini) and full chrome cards
- Removes outer `bg-theme-card-bg` when transparent
- Border and window chrome remain visible

### Task 3: Pass Content to Wrapper (Commit: 9416989)

**CardRenderer:**
- Updated ThemedCardWrapper call to include `content={card.content}`
- Enables transparency setting to flow through rendering pipeline
- Preview updates immediately when toggling transparency in editor

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Store transparentBackground in card.content | Consistent with other card-level display settings (textAlign, verticalAlign, textColor) |
| Bulk apply as separate action | setAllCardsTransparency is cleaner than manually iterating in component |
| Keep border visible | Border provides card structure even without background fill |
| Pass content to wrapper | Wrapper needs access to transparentBackground for conditional styling |
| Support all theme types | MacOSCard and SystemSettingsCard also respect transparency for consistency |
| Toast on bulk apply | User feedback confirms action completed successfully |

## User Experience

**Individual Card:**
1. Select any card in editor
2. Find "Transparent Background" toggle in property panel (after Vertical Align)
3. Toggle ON → card background disappears, border remains, page background shows through
4. Toggle OFF → card background returns

**Bulk Apply:**
1. Set desired transparency state on one card
2. Click "Apply to All" button next to toggle
3. Toast notification confirms action
4. All cards match the transparency state

**Visual Result:**
- Transparent cards show page background (solid color, image, or video)
- Border remains visible to define card boundaries
- Text and content remain readable
- Works across all theme types (Instagram Reels, Mac OS, System Settings)

## Files Changed

**Modified:**
- `src/stores/page-store.ts` - Added setAllCardsTransparency action
- `src/components/editor/card-property-editor.tsx` - Added transparency toggle UI
- `src/components/cards/themed-card-wrapper.tsx` - Added content prop and transparency logic
- `src/components/cards/mac-os-card.tsx` - Added transparentBackground prop
- `src/components/cards/system-settings-card.tsx` - Added transparentBackground prop
- `src/components/cards/card-renderer.tsx` - Pass content to wrapper

**Key Files:**
- `src/stores/page-store.ts` - Transparency bulk action
- `src/components/editor/card-property-editor.tsx` - Toggle UI
- `src/components/cards/themed-card-wrapper.tsx` - Transparency application

## Commits

1. `21766a1` - feat(quick-028): add transparency toggle with Apply to All
2. `c0ea8b6` - feat(quick-028): apply transparency in themed card wrappers
3. `9416989` - feat(quick-028): pass card content to themed wrapper

## Testing Notes

**Manual Verification:**
- Toggle transparency on individual cards → background disappears
- Click "Apply to All" → all cards match transparency state
- Refresh page → transparency persists (via auto-save)
- Test on Instagram Reels theme → works
- Test on Mac OS theme → traffic lights remain, background transparent
- Test on System Settings theme → window chrome remains, background transparent
- Border always visible in all themes

**Build:**
- `npm run build` passes with no errors
- No TypeScript errors
- All themed card components accept transparentBackground prop

## Next Phase Readiness

**Blockers:** None

**Concerns:** None

**Notes:**
- Transparency feature complete and working across all themes
- Game and gallery cards exempt from transparency (EXEMPT_CARD_TYPES)
- Text and social-icons cards don't use ThemedCardWrapper, so transparency doesn't apply
- Feature works with per-card color overrides (textColor field)

## Session Notes

**Execution:** Fully autonomous, no checkpoints
**Duration:** 17 minutes (13:04 - 13:21 UTC)
**Deviations:** None - plan executed exactly as written
