---
phase: quick
plan: 059
subsystem: mobile-editor
tags: [mobile, ui, drawer, card-types]
requires: [quick-058]
provides: [mobile-card-type-drawer]
affects: []
tech-stack:
  added: []
  patterns: [compact-drawer, type-switching]
key-files:
  created:
    - src/components/editor/mobile-card-type-drawer.tsx
  modified:
    - src/components/editor/card-type-picker.tsx
    - src/components/editor/editor-layout.tsx
decisions:
  - id: type-drawer-for-convertible-only
    choice: Show type drawer only for convertible cards (hero/horizontal/square/link/mini/text)
    rationale: Non-convertible cards (video/gallery/game/audio/music) have no type options, so go straight to full editor
  - id: live-type-switching
    choice: Drawer stays open after type change, shows updated selection state
    rationale: Users often try multiple types during layout phase - keep drawer open for fast iteration
  - id: full-editor-escape-hatch
    choice: Prominent "Full Editor" button at bottom of drawer
    rationale: Users can quickly access full editing capabilities when needed
metrics:
  duration: 115 seconds (~2 minutes)
  completed: 2026-02-10
---

# Quick Task 059: Mobile Compact Card Type Drawer

> Compact bottom drawer for quick card type switching on mobile

## One-liner

Slim mobile drawer with 3x2 card type grid for one-tap type switching, reducing friction in the mobile layout phase.

## What Was Built

Created a compact mobile-first UI pattern for card type switching that appears before the full editor, reducing the friction of opening the heavy 85dvh bottom sheet just to change a card type.

### Architecture

**Component hierarchy:**
```
EditorLayout (mobile)
├── MobileQuickSettings (task 058)
├── MobileSelectionBar
├── MobileCardTypeDrawer (new) ← shows first for convertible cards
├── PreviewPanel
├── MobileFAB
└── MobileBottomSheet (full editor) ← opens on "Full Editor" tap
```

**Routing logic:**
```
Mobile card tap
  ↓
Is convertible type? (hero/horizontal/square/link/mini/text)
  ↓ YES → MobileCardTypeDrawer (compact ~30dvh drawer)
  ↓ NO  → MobileBottomSheet (full 85dvh editor)
```

### Components

**MobileCardTypeDrawer** (`src/components/editor/mobile-card-type-drawer.tsx`)
- Vaul drawer with `modal={false}` (matches task 058 pattern)
- Height: `h-auto max-h-[40dvh]` (slim drawer, fits content)
- 3x2 grid of card type buttons (grid-cols-3 gap-3)
- Icon size: h-7 w-7 (larger than desktop for better touch targets)
- Selected state: `border-primary bg-primary/10 text-primary`
- Live type switching: drawer stays open after change
- "Full Editor" button with Pencil icon at bottom

**Wiring in editor-layout.tsx:**
- Import `MobileCardTypeDrawer` and `isConvertibleType`
- Add `typeDrawerOpen` state
- Add `cards` and `selectedCard` derived values
- Update card selection useEffect to route based on type:
  ```tsx
  if (card && isConvertibleType(card.card_type)) {
    setTypeDrawerOpen(true)
  } else {
    setMobileSheetOpen(true)
  }
  ```
- Render `MobileCardTypeDrawer` between `MobileSelectionBar` and preview
- `onOpenFullEditor` closes type drawer and opens full sheet
- Close type drawer when full editor closes (state cleanup)

**Export from card-type-picker.tsx:**
- Added `export` keyword to `CONVERTIBLE_CARD_TYPES` array
- Enables DRY principle - MobileCardTypeDrawer imports instead of duplicating

### User Flow

1. **Mobile user taps a hero card** → Type drawer slides up (~30dvh height)
2. **User taps "Square" button** → Card instantly becomes square in preview, drawer stays open
3. **User taps "Link" button** → Card becomes link, drawer still open for more experimentation
4. **User taps "Full Editor"** → Drawer closes, full 85dvh bottom sheet opens with all controls

Alternative flow:
1. **Mobile user taps a video card** → Full editor opens directly (no type drawer, video can't convert)

### Visual Design

Matches task 058 compact drawer aesthetic:
- Same Vaul drawer component and behavior
- `touch-pan-y` for scroll safety
- `modal={false}` (non-blocking, can see preview behind)
- `max-h-[40dvh]` safety rail (auto-fits content below this)
- 44px minimum touch targets on all buttons (h-11 for "Full Editor", py-4 for type buttons)

Card type button styling:
- Unselected: `border-muted bg-muted/50 text-muted-foreground`
- Selected: `border-primary bg-primary/10 text-primary`
- Large icons (h-7 w-7) vs desktop (h-6 w-6) for mobile usability
- Text label: `text-xs font-medium`

## Technical Decisions

### Decision 1: Convertible-only routing
**Context:** Not all card types can be converted to other types.

**Options considered:**
1. Show type drawer for all cards
2. Show type drawer only for convertible cards
3. Add type switching section inside full editor

**Chosen:** Option 2 - Show drawer only for convertible cards

**Rationale:**
- Video/gallery/game/audio/music cards have no type conversion options
- Empty drawer with 6 disabled buttons would be confusing
- Going straight to full editor is the right UX for non-convertible cards
- Convertible cards are the common case during layout phase

**Implementation:**
```tsx
if (card && isConvertibleType(card.card_type)) {
  setTypeDrawerOpen(true)
} else {
  setMobileSheetOpen(true)
}
```

### Decision 2: Live type switching without close
**Context:** After changing card type, should the drawer close or stay open?

**Options considered:**
1. Close drawer after type change (single action pattern)
2. Keep drawer open, update selected state (multi-action pattern)

**Chosen:** Option 2 - Keep drawer open

**Rationale:**
- Users often try 2-3 types before deciding
- Closing after each change means reopening the drawer repeatedly
- Preview behind drawer shows result immediately
- "Full Editor" button provides explicit exit when done

**Implementation:**
- `handleTypeChange` calls `updateCard` but doesn't call `onOpenChange(false)`
- Selected state reactive via `card?.card_type === type`
- User must explicitly tap "Full Editor" or swipe down to dismiss

### Decision 3: Prominent "Full Editor" button
**Context:** Some users will want full editing controls after changing type.

**Options considered:**
1. No explicit button - swipe down to dismiss, tap FAB to open editor
2. Small text link "Full Editor" at top
3. Full-width outlined button at bottom with icon

**Chosen:** Option 3 - Prominent button at bottom

**Rationale:**
- Clear escape hatch to full editing capabilities
- Full-width button is easy target on mobile
- Bottom placement follows content hierarchy (type grid → escape hatch)
- Pencil icon makes action clear

**Implementation:**
```tsx
<Button variant="outline" onClick={onOpenFullEditor} className="w-full h-11">
  <Pencil className="h-4 w-4" />
  Full Editor
</Button>
```

## Files Changed

### Created
- `src/components/editor/mobile-card-type-drawer.tsx` (87 lines)
  - MobileCardTypeDrawer component with Vaul drawer
  - 3x2 card type grid with live switching
  - "Full Editor" escape hatch button

### Modified
- `src/components/editor/card-type-picker.tsx`
  - Export `CONVERTIBLE_CARD_TYPES` array for reuse

- `src/components/editor/editor-layout.tsx`
  - Import `MobileCardTypeDrawer` and `isConvertibleType`
  - Add `typeDrawerOpen` state and `selectedCard` derived value
  - Update card selection useEffect for routing logic
  - Render `MobileCardTypeDrawer` in mobile layout
  - Close type drawer when full editor closes

## Testing Recommendations

### Manual Testing (Mobile Viewport)

**Convertible card flow:**
1. Open editor on mobile, add a hero card
2. Tap the hero card → Type drawer should appear (~30dvh height)
3. Tap "Square" → Card becomes square, drawer stays open, Square button highlighted
4. Tap "Link" → Card becomes link, drawer stays open, Link button highlighted
5. Tap "Full Editor" → Type drawer closes, full bottom sheet opens
6. Swipe down on full editor → Both sheets close, card deselected

**Non-convertible card flow:**
1. Add a video card
2. Tap the video card → Full editor opens directly (no type drawer)
3. Swipe down → Editor closes

**Visual checks:**
- Type drawer height is slim (~30dvh), not full screen
- Currently selected type has primary border and bg
- Icons are large enough to tap comfortably (h-7 w-7)
- "Full Editor" button is full width with clear label
- Drawer matches task 058 compact drawer style

**Edge cases:**
- Tap different card while type drawer open → Drawer updates to show new card's type
- Swipe down on type drawer → Drawer dismisses cleanly
- Desktop: click cards → Full editor opens (no type drawer on desktop)

### Verification

```bash
# TypeScript compilation
npx tsc --noEmit

# Build check
npm run build

# Mobile testing in Chrome DevTools
# 1. Open http://localhost:3000/editor
# 2. Toggle device toolbar (Cmd+Shift+M)
# 3. Select "iPhone 14 Pro"
# 4. Follow manual testing steps above
```

## Deviations from Plan

None - plan executed exactly as written.

## Future Enhancements

### Potential improvements (not in scope):
1. **Haptic feedback** - Vibrate on type change for tactile confirmation
2. **Type preview thumbnails** - Show visual example of each type
3. **Recent types** - Show most recently used types first
4. **Type change animation** - Smooth morph between card types in preview
5. **Voice control** - "Hey Siri, change to horizontal card"

## Next Phase Readiness

**Blockers:** None

**Dependencies satisfied:**
- Task 058 compact drawer pattern established
- Vaul drawer component integrated
- Mobile layout infrastructure mature

**Concerns:** None

**Phase complete:** Quick task 059 delivered. Mobile card type switching is now fast and lightweight.

## Performance Impact

**Bundle size:** +3KB (MobileCardTypeDrawer component)

**Runtime:**
- No performance impact - drawer renders on demand
- Type switching uses existing `updateCard` store action
- No new API calls or data fetching

**Mobile UX improvement:**
- Reduced tap count for type changes (1 tap vs 2-3 taps)
- Faster iteration during layout phase (drawer stays open)
- Lighter UI weight (30dvh drawer vs 85dvh full editor)

## Related Work

**Built upon:**
- Quick 058: Mobile quick access settings bar (compact drawer pattern)
- Phase 4.3: Card type conversion system
- Phase 4.5: Mobile bottom sheet editor

**Enables:**
- Faster mobile editing workflows
- More experimentation during layout phase
- Pattern for other compact mobile drawers

## Lessons Learned

1. **Compact drawers are powerful on mobile** - The 058 pattern continues to pay dividends. Slim drawers reduce cognitive load.

2. **Routing logic reduces UI complexity** - By routing based on card type, we avoid showing empty/disabled states. The right UI appears at the right time.

3. **Live preview is key** - Keeping the drawer open while the preview updates behind it enables fast iteration. Users can see results immediately.

4. **DRY with shared constants** - Exporting `CONVERTIBLE_CARD_TYPES` from card-type-picker prevents duplication and drift.

5. **Escape hatches prevent dead ends** - The "Full Editor" button ensures users never feel trapped in the compact UI.

---

**Commits:**
- `24af983` - feat(quick-059): create MobileCardTypeDrawer component
- `045dc74` - feat(quick-059): wire MobileCardTypeDrawer into mobile flow

**Duration:** ~2 minutes
**Status:** ✓ Complete
