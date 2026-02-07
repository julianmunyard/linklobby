---
phase: quick-042
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/stores/page-store.ts
  - src/components/canvas/preview-flow-grid.tsx
  - src/components/canvas/selectable-flow-grid.tsx
  - src/components/canvas/sortable-card-list.tsx
  - src/components/canvas/flow-grid.tsx
  - src/components/editor/preview-panel.tsx
  - src/components/editor/cards-tab.tsx
  - src/app/preview/page.tsx
autonomous: true

must_haves:
  truths:
    - "Dragging a card in the editor cards list reorders it and it stays at new position"
    - "Dragging a card in the preview panel reorders it and it stays at new position"
    - "Multi-card drag reorder still works correctly"
    - "Cards persist in new order after page refresh (auto-save fires)"
  artifacts:
    - path: "src/stores/page-store.ts"
      provides: "reorderCards accepting card IDs instead of indices"
      contains: "reorderCards.*activeId.*overId"
    - path: "src/components/canvas/sortable-card-list.tsx"
      provides: "Passes card IDs to onReorder"
      contains: "onReorder.*active.id.*over.id"
  key_links:
    - from: "src/components/canvas/sortable-card-list.tsx"
      to: "src/stores/page-store.ts"
      via: "onReorder(activeId, overId) -> reorderCards(activeId, overId)"
      pattern: "onReorder\\(.*active\\.id.*over\\.id"
    - from: "src/app/preview/page.tsx"
      to: "src/components/editor/preview-panel.tsx"
      via: "postMessage REORDER_CARDS with activeId/overId"
      pattern: "REORDER_CARDS.*activeId.*overId"
---

<objective>
Fix card drag reorder - cards snap back to original position instead of staying where dropped.

Purpose: The root cause is an index mismatch between component-level card arrays (which may be filtered or differently ordered) and the store's internal sorted array. Changing the interface from indices to card IDs eliminates this entire class of bugs.

Output: All drag reorder call sites pass card IDs, store resolves positions internally.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/stores/page-store.ts
@src/lib/ordering.ts
@src/components/canvas/preview-flow-grid.tsx
@src/components/canvas/selectable-flow-grid.tsx
@src/components/canvas/sortable-card-list.tsx
@src/components/canvas/flow-grid.tsx
@src/components/editor/preview-panel.tsx
@src/components/editor/cards-tab.tsx
@src/app/preview/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Change reorderCards store signature from indices to IDs</name>
  <files>src/stores/page-store.ts</files>
  <action>
Change the `reorderCards` function signature and implementation:

**Interface change (line 36):**
- FROM: `reorderCards: (oldIndex: number, newIndex: number) => void`
- TO: `reorderCards: (activeId: string, overId: string) => void`

**Implementation change (lines 167-190):**
- FROM: Takes `oldIndex` and `newIndex`, does `sorted[oldIndex]` to find moved card
- TO: Takes `activeId` and `overId`, finds indices internally:

```typescript
reorderCards: (activeId, overId) => set((state) => {
  if (activeId === overId) return state

  // Sort cards to find positions
  let cards = state.cards
  if (hasDuplicateSortKeys(cards)) {
    const keyMap = normalizeSortKeys(cards)
    cards = cards.map((c) => ({ ...c, sortKey: keyMap.get(c.id)! }))
  }

  const sorted = sortCardsBySortKey(cards)
  const movedCard = sorted.find((c) => c.id === activeId)
  if (!movedCard) return state

  // Find the target index: where overId currently sits in the sorted list
  const newIndex = sorted.findIndex((c) => c.id === overId)
  if (newIndex === -1) return state

  // Generate new sort key for the moved card at the target position
  const newSortKey = generateMoveKey(cards, activeId, newIndex)

  return {
    cards: cards.map((c) =>
      c.id === activeId
        ? { ...c, sortKey: newSortKey, updated_at: new Date().toISOString() }
        : c
    ),
    hasChanges: true,
  }
}),
```

IMPORTANT: Keep the existing `hasDuplicateSortKeys` / `normalizeSortKeys` guard. Keep `generateMoveKey` usage - it already handles filtering out the moved card and finding neighbors. The `newIndex` passed to `generateMoveKey` is the index of `overId` in the sorted array (the position the user dropped onto).
  </action>
  <verify>TypeScript compiles: `npx tsc --noEmit` passes (or only pre-existing errors)</verify>
  <done>reorderCards accepts (activeId: string, overId: string) and resolves positions internally using sortCardsBySortKey</done>
</task>

<task type="auto">
  <name>Task 2: Update all call sites to pass card IDs instead of indices</name>
  <files>
    src/components/canvas/preview-flow-grid.tsx
    src/components/canvas/selectable-flow-grid.tsx
    src/components/canvas/sortable-card-list.tsx
    src/components/canvas/flow-grid.tsx
    src/components/editor/preview-panel.tsx
    src/components/editor/cards-tab.tsx
    src/app/preview/page.tsx
  </files>
  <action>
**1. Update all onReorder prop types** in these components:
- `PreviewFlowGrid`: Change `onReorder: (oldIndex: number, newIndex: number) => void` to `onReorder: (activeId: string, overId: string) => void`
- `SelectableFlowGrid`: Same change
- `SortableCardList`: Same change
- `FlowGrid`: Same change

**2. Simplify handleDragEnd in all four grid components.** Remove the `findIndex` calls and pass IDs directly:

For `preview-flow-grid.tsx`, `flow-grid.tsx`, and `sortable-card-list.tsx`:
```typescript
if (active.id !== over.id) {
  onReorder(active.id as string, over.id as string)
}
```
No more `cards.findIndex(...)` needed.

For `selectable-flow-grid.tsx` (has multi-drag logic):
```typescript
if (active.id !== over.id) {
  if (cardIdsToDrag.length > 1 && onReorderMultiple) {
    // Multi-drag uses the over card's index in visible cards for targetIndex
    const targetIndex = visibleCards.findIndex((c) => c.id === over.id)
    if (targetIndex !== -1) {
      onReorderMultiple(cardIdsToDrag, targetIndex)
    }
    multiSelect.clearSelection()
  } else {
    // Single drag - pass IDs
    onReorder(active.id as string, over.id as string)
  }
}
```
Note: `reorderMultipleCards` already uses card IDs, only `reorderCards` needs the fix. Keep `reorderMultipleCards` call as-is.

**3. Update preview/page.tsx postMessage calls** (two instances, around lines 302-305 and 386-393):
- FROM: `{ type: "REORDER_CARDS", payload: { oldIndex, newIndex } }`
- TO: `{ type: "REORDER_CARDS", payload: { activeId: active.id as string, overId: over.id as string } }`

Wait - the preview page passes a CALLBACK to SelectableFlowGrid's onReorder. Since we changed the onReorder signature, the callback params change automatically. Update the postMessage inside the onReorder callback:
- FROM: `onReorder={(oldIndex, newIndex) => { window.parent.postMessage({ type: "REORDER_CARDS", payload: { oldIndex, newIndex } }, ...) }}`
- TO: `onReorder={(activeId, overId) => { window.parent.postMessage({ type: "REORDER_CARDS", payload: { activeId, overId } }, ...) }}`

There are TWO instances of this in preview/page.tsx (one in the frameInsets block around line 302, one in the main block around line 386). Update BOTH.

**4. Update preview-panel.tsx message handler** (line 89):
- FROM: `reorderCards(event.data.payload.oldIndex, event.data.payload.newIndex)`
- TO: `reorderCards(event.data.payload.activeId, event.data.payload.overId)`

**5. cards-tab.tsx** (line 262): Already passes `reorderCards` directly as `onReorder={reorderCards}`. Since the store signature changed and SortableCardList signature changed, this just works. No code change needed here - just verify it compiles.
  </action>
  <verify>
1. `npx tsc --noEmit` passes (or only pre-existing errors)
2. `npm run build` succeeds
3. Grep confirms no remaining `oldIndex.*newIndex` patterns in the modified files: `grep -rn "oldIndex\|newIndex" src/components/canvas/preview-flow-grid.tsx src/components/canvas/selectable-flow-grid.tsx src/components/canvas/sortable-card-list.tsx src/components/canvas/flow-grid.tsx src/components/editor/preview-panel.tsx src/app/preview/page.tsx` should return no matches
  </verify>
  <done>All drag reorder call sites pass card IDs (activeId, overId) instead of computed indices. No component computes findIndex for reorder anymore (except reorderMultipleCards which uses IDs already).</done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` - TypeScript compiles without new errors
2. `npm run build` - Production build succeeds
3. No remaining index-based reorder patterns:
   - `grep -rn "oldIndex\|newIndex" src/stores/page-store.ts src/components/canvas/ src/components/editor/preview-panel.tsx src/app/preview/page.tsx` returns nothing related to reorderCards
4. Manual test: Drag a card in the editor cards list - it stays at the new position
5. Manual test: Drag a card in the preview panel - it stays at the new position
</verification>

<success_criteria>
- reorderCards store function accepts (activeId: string, overId: string) not (oldIndex, newIndex)
- All 4 grid components pass active.id and over.id directly
- postMessage REORDER_CARDS uses activeId/overId payload
- preview-panel.tsx handler reads activeId/overId from payload
- Cards stay where dropped in both editor and preview
- TypeScript compiles and build succeeds
</success_criteria>

<output>
After completion, create `.planning/quick/042-fix-card-drag-reorder/042-SUMMARY.md`
</output>
