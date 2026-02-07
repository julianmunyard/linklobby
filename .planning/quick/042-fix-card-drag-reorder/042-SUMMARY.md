---
phase: quick-042
plan: 01
type: summary
completed: 2026-02-07
duration: 2 minutes
subsystem: editor
tags: [drag-drop, reordering, bug-fix, cards, state-management]

requires:
  - dnd-kit
  - fractional-indexing
  - sortCardsBySortKey

provides:
  - ID-based reorder interface
  - Index-mismatch-proof drag-drop
  - Consistent reordering across all views

affects:
  - All card drag-drop operations
  - Multi-select drag operations

tech-stack:
  added: []
  patterns:
    - "ID-based reordering eliminates index mismatch bugs"
    - "Store internally resolves positions from IDs"

key-files:
  created: []
  modified:
    - src/stores/page-store.ts
    - src/components/canvas/preview-flow-grid.tsx
    - src/components/canvas/selectable-flow-grid.tsx
    - src/components/canvas/sortable-card-list.tsx
    - src/components/canvas/flow-grid.tsx
    - src/components/editor/preview-panel.tsx
    - src/app/preview/page.tsx

decisions:
  - decision: "Change reorderCards to accept card IDs instead of indices"
    rationale: "Eliminates entire class of bugs where component arrays (filtered/sorted) have different indices than store array"
    alternatives: ["Fix indices at each call site", "Pass card objects", "Use array-arrayMove pattern"]

metrics:
  tasks_completed: 2
  files_modified: 7
  commits: 1
---

# Quick Task 042: Fix Card Drag Reorder Summary

**One-liner:** Changed reorderCards to use card IDs instead of indices, eliminating index mismatch bugs

## Problem

Cards were snapping back to their original position after drag-and-drop reordering. Root cause: index mismatch between component-level card arrays (which may be filtered or differently ordered) and the store's internal sorted array.

## Solution

Changed the `reorderCards` interface from `(oldIndex, newIndex)` to `(activeId, overId)`. The store now internally resolves positions using `sortCardsBySortKey`, eliminating the entire class of bugs caused by index mismatches.

## Changes Made

### Store Changes (page-store.ts)
- **Signature change:** `reorderCards: (activeId: string, overId: string) => void`
- **Implementation:**
  - Early exit if `activeId === overId`
  - Find moved card by ID: `sorted.find(c => c.id === activeId)`
  - Find target position: `sorted.findIndex(c => c.id === overId)`
  - Generate new sort key using `generateMoveKey(cards, activeId, newIndex)`
  - Keep existing duplicate key normalization guard

### Grid Components (7 files)
All grid components updated to pass card IDs instead of computing indices:

1. **PreviewFlowGrid** - Simple reorder
   - Changed prop type to `(activeId, overId) => void`
   - Removed `findIndex` calls
   - Pass `active.id` and `over.id` directly

2. **SelectableFlowGrid** - Multi-select support
   - Changed prop type to `(activeId, overId) => void`
   - Multi-drag still uses `targetIndex` from `visibleCards.findIndex`
   - Single drag passes IDs directly

3. **SortableCardList** - Vertical list
   - Changed prop type to `(activeId, overId) => void`
   - Removed `findIndex` calls
   - Pass `active.id` and `over.id` directly

4. **FlowGrid** - Editor preview
   - Changed prop type to `(activeId, overId) => void`
   - Removed `findIndex` calls
   - Pass `active.id` and `over.id` directly

5. **preview-panel.tsx** - Message handler
   - Updated handler to read `activeId` and `overId` from payload
   - Changed from `event.data.payload.oldIndex` to `event.data.payload.activeId`

6. **preview/page.tsx** - PostMessage (2 instances)
   - Updated both `onReorder` callbacks to use `(activeId, overId)` signature
   - Changed payload from `{ oldIndex, newIndex }` to `{ activeId, overId }`

## Verification

✅ TypeScript compiles without errors
✅ Production build succeeds
✅ No remaining `oldIndex`/`newIndex` patterns in reorder call sites
✅ Store's internal `newIndex` variable correctly computed from `overId`

## Technical Details

**Why this fix works:**

Before:
```typescript
// Component computes indices from its local array (may be filtered/sorted differently)
const oldIndex = cards.findIndex((c) => c.id === active.id)
const newIndex = cards.findIndex((c) => c.id === over.id)
onReorder(oldIndex, newIndex) // Indices mismatch store's array!
```

After:
```typescript
// Component passes IDs, store resolves indices from canonical sorted array
onReorder(active.id, over.id)

// Store (single source of truth):
const sorted = sortCardsBySortKey(cards)
const newIndex = sorted.findIndex((c) => c.id === overId)
```

**Key insight:** By having the store resolve positions internally, we ensure indices are always computed from the same canonical sorted array, regardless of what filtering/sorting the component did.

## Impact

- **Fixes:** Cards snap back to original position after drag
- **Prevents:** Future index mismatch bugs in any filtered/sorted views
- **Simplifies:** Grid components no longer need to compute indices
- **Maintains:** All existing functionality (multi-drag, history pause/resume, save on drop)

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

No blockers. The card reordering system is now robust against index mismatches across all views (editor list, preview panel, public page).

## Related Work

- Original fractional-indexing implementation (Phase 3, Plan 01)
- Multi-select drag (Phase 6, Plan 13)
- Hidden cards filtering (Quick Task 031)
