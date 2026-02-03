---
phase: quick
plan: 031
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/canvas/sortable-card.tsx
  - src/components/canvas/sortable-card-list.tsx
  - src/components/canvas/selectable-flow-grid.tsx
  - src/components/canvas/preview-sortable-card.tsx
autonomous: true

must_haves:
  truths:
    - "User can toggle card visibility from cards list"
    - "Hidden cards do not appear in preview (rearrange as if deleted)"
    - "Hidden cards remain in cards list with visual indicator"
    - "User can unhide cards to restore them in preview"
  artifacts:
    - path: "src/components/canvas/sortable-card.tsx"
      provides: "Hide toggle button next to delete"
    - path: "src/components/canvas/selectable-flow-grid.tsx"
      provides: "Filters out hidden cards from preview"
  key_links:
    - from: "sortable-card.tsx"
      to: "page-store.updateCard"
      via: "onToggleVisibility callback"
---

<objective>
Add hide/unhide toggle button next to delete button in the cards list, and make hidden cards completely disappear from preview (not just show overlay).

Purpose: Allow users to temporarily hide cards without deleting them, useful for A/B testing or saving cards for later.
Output: Toggle button in cards list + hidden cards filtered from preview.
</objective>

<context>
@.planning/STATE.md

Key existing code:
- `src/types/card.ts` - Card type already has `is_visible: boolean`
- `src/components/editor/card-property-editor.tsx` - Lines 258-276 show existing visibility toggle in property editor
- `src/components/canvas/sortable-card.tsx` - Has delete button at lines 76-90, needs hide toggle added next to it
- `src/components/canvas/preview-sortable-card.tsx` - Currently shows hidden cards with overlay (lines 103-110), should be filtered out instead
- `src/stores/page-store.ts` - `updateCard(id, { is_visible })` already works
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add hide toggle button to cards list</name>
  <files>
    src/components/canvas/sortable-card.tsx
    src/components/canvas/sortable-card-list.tsx
    src/components/editor/cards-tab.tsx
  </files>
  <action>
1. In `sortable-card.tsx`:
   - Import `Eye, EyeOff` from lucide-react (alongside existing Trash2)
   - Add `onToggleVisibility?: (id: string) => void` to SortableCardProps interface
   - Add a hide toggle button BEFORE the delete button (around line 76)
   - Button should show `EyeOff` icon when card is visible (clicking will hide)
   - Button should show `Eye` icon when card is hidden (clicking will unhide)
   - Add visual indicator when card is hidden: `opacity-50` on the card row + strikethrough or muted title
   - Button styling: same as delete button (`variant="ghost" size="sm" className="h-8 w-8 p-0"`)

2. In `sortable-card-list.tsx`:
   - Add `onToggleVisibility?: (id: string) => void` to SortableCardListProps
   - Pass `onToggleVisibility` through to each SortableCard

3. In `cards-tab.tsx`:
   - Create `handleToggleVisibility` function that calls `usePageStore.getState().updateCard(id, { is_visible: !currentVisibility })`
   - Pass it to SortableCardList
  </action>
  <verify>
Cards list shows hide button (eye icon) next to delete button. Hidden cards show with reduced opacity and Eye icon (to unhide).
  </verify>
  <done>Toggle button appears next to delete, clicking toggles card visibility in store</done>
</task>

<task type="auto">
  <name>Task 2: Filter hidden cards from preview</name>
  <files>
    src/components/canvas/selectable-flow-grid.tsx
    src/components/canvas/preview-sortable-card.tsx
  </files>
  <action>
1. In `selectable-flow-grid.tsx`:
   - Filter cards to only show visible ones: `const visibleCards = cards.filter(c => c.is_visible)`
   - Use `visibleCards` for rendering the grid (line 191)
   - Keep `cards` (unfiltered) for orderedIds in multiSelect (so selection state works correctly)
   - Update empty state check to use `visibleCards.length === 0` but still allow showing "No visible cards" vs "No cards"

2. In `preview-sortable-card.tsx`:
   - Remove the hidden card overlay (lines 103-110) since hidden cards won't render at all
   - Remove the `!card.is_visible && "opacity-50"` conditions (lines 114, 155) since hidden cards won't render
   - Keep the EyeOff import for potential future use, or remove if not used elsewhere

Note: Hidden cards should rearrange as if deleted - the flex layout will naturally close gaps when hidden cards are filtered out.
  </action>
  <verify>
Hide a card via the toggle in cards list. Card disappears from preview, remaining cards close the gap. Unhide and card reappears in its original position (by sortKey).
  </verify>
  <done>Hidden cards are completely removed from preview, visible cards flow naturally</done>
</task>

</tasks>

<verification>
1. Add a card and verify hide toggle appears next to delete
2. Click hide toggle - card shows EyeOff icon, reduced opacity in cards list
3. Preview no longer shows the hidden card (gap closes)
4. Click unhide (Eye icon) - card reappears in preview at its original position
5. Verify the existing visibility toggle in property editor still works and syncs
</verification>

<success_criteria>
- Hide toggle button visible in cards list next to delete button
- Hidden cards show visual indicator (opacity/icon) in cards list
- Hidden cards completely removed from preview (not just overlay)
- Preview layout rearranges naturally when cards hidden
- Unhiding restores card to correct position
- Property editor visibility toggle and list toggle stay in sync
</success_criteria>

<output>
After completion, create `.planning/quick/031-hide-card-toggle-in-cards-list/031-SUMMARY.md`
</output>
