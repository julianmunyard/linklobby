---
phase: 06-advanced-cards
plan: 06
subsystem: ui
tags: [dnd-kit, drag-and-drop, nested-containers, dropdown-cards]

# Dependency graph
requires:
  - phase: 06-01
    provides: Dropdown types and store actions (moveCardToDropdown, removeCardFromDropdown)
  - phase: 06-05
    provides: DropdownCard component with collapsible UI
provides:
  - Multi-container drag-and-drop infrastructure for nested card management
  - DropdownSortable wrapper component with droppable zones
  - dnd-kit utilities for container management and collision detection
affects: [06-09, 06-10, dropdown-editor, bulk-actions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Nested SortableContext for multi-container drag-and-drop"
    - "Container detection pattern for cross-container moves"
    - "Droppable zones with visual feedback (ring)"

key-files:
  created:
    - src/lib/dnd-utils.ts
    - src/components/canvas/dropdown-sortable.tsx
  modified:
    - src/components/canvas/flow-grid.tsx
    - src/components/canvas/sortable-flow-card.tsx

key-decisions:
  - "Dropdowns cannot be nested (enforced via canDropInContainer)"
  - "Main canvas SortableContext only contains cards without parentDropdownId"
  - "Each dropdown has its own nested SortableContext for child cards"
  - "Cross-container moves update parentDropdownId and container's childCardIds array"

patterns-established:
  - "findContainer pattern: Determines which container (canvas or dropdown) a card belongs to"
  - "getContainerCards pattern: Filters cards by container for sorting operations"
  - "canDropInContainer validation: Prevents invalid nesting (dropdowns in dropdowns)"

# Metrics
duration: 2min
completed: 2026-01-27
---

# Phase 6 Plan 6: Nested Drag-and-Drop Summary

**Multi-container dnd-kit infrastructure enabling cards to be dragged into/out of dropdowns with nested SortableContexts and visual feedback**

## Performance

- **Duration:** 2 minutes
- **Started:** 2026-01-27T04:07:59Z
- **Completed:** 2026-01-27T04:10:20Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Cards can be dragged into expanded dropdowns from main canvas
- Cards can be dragged out of dropdowns back to main canvas
- Cards inside dropdowns can be reordered independently
- Dropdowns cannot be nested (enforced validation)
- Visual feedback shows ring around dropdown when dragging over

## Task Commits

Each task was committed atomically:

1. **Task 1: Create dnd-kit Multi-Container Utilities** - `11ae258` (feat)
2. **Task 2: Create DropdownSortable Component** - `d42734d` (feat)
3. **Task 3: Extend FlowGrid for Multi-Container Drag** - `5e198e3` (feat)

## Files Created/Modified
- `src/lib/dnd-utils.ts` - Container utilities (findContainer, getContainerCards, canDropInContainer)
- `src/components/canvas/dropdown-sortable.tsx` - Droppable wrapper with nested SortableContext for dropdown children
- `src/components/canvas/flow-grid.tsx` - Extended with onDragOver handler and cross-container move logic
- `src/components/canvas/sortable-flow-card.tsx` - Added isInsideDropdown prop for future styling

## Decisions Made

**Container architecture:**
- Main canvas SortableContext only includes cards without parentDropdownId
- Each dropdown renders its own nested SortableContext for child cards
- Cross-container moves handled via findContainer and canDropInContainer

**Visual feedback:**
- Ring appears around dropdown when card is dragged over (isOver state)
- DragOverlay still shows card following cursor during drag

**Nesting prevention:**
- canDropInContainer explicitly checks card.card_type === "dropdown" and rejects if containerId !== "canvas"
- Prevents infinite nesting complexity and maintains simple mental model

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

Multi-container drag infrastructure is complete and ready for:
- **06-09:** Dropdown editor UI (add/remove cards via editor, not just drag)
- **06-10:** Dropdown card editor fields (headerText, expandText, collapseText)
- **Bulk actions:** Multi-select could extend to work across containers

**Technical foundation:**
- Nested SortableContext pattern works cleanly with dnd-kit
- Store actions (moveCardToDropdown, removeCardFromDropdown) handle bidirectional updates correctly
- No collision detection issues between main canvas and dropdown containers

---
*Phase: 06-advanced-cards*
*Completed: 2026-01-27*
