---
phase: quick
plan: 015
subsystem: ui
tags: [dnd-kit, context-menu, multi-select, dropdown, drag-drop]

# Dependency graph
requires:
  - phase: 06-13
    provides: Box selection and multi-select infrastructure
  - phase: 06-14
    provides: Selection toolbar with bulk actions
  - phase: 06-06
    provides: Nested drag-and-drop with dropdowns
provides:
  - Multi-drag selected cards together (drag one, all move)
  - Cross-container drag (cards into/out of dropdowns)
  - Right-click context menu on dropdowns with Add Card and Move Selected options
affects: [editor, preview, advanced-cards]

# Tech tracking
tech-stack:
  added: [@radix-ui/react-context-menu (via shadcn)]
  patterns: [optional context hook pattern, cross-container drag-drop, context menu on containers]

key-files:
  created:
    - src/components/ui/context-menu.tsx
  modified:
    - src/components/canvas/selectable-flow-grid.tsx
    - src/components/canvas/dropdown-sortable.tsx
    - src/contexts/multi-select-context.tsx

key-decisions:
  - "useMultiSelectContextOptional hook for graceful degradation in preview iframe"
  - "DROPDOWN_ALLOWED_TYPES limits context menu to link, horizontal, hero, square cards"
  - "Filter SortableContext items to main canvas cards only (exclude parentDropdownId)"
  - "Multi-drag clears selection after drop for clean UX"

patterns-established:
  - "Optional context hook pattern: useXContextOptional returns null if no provider, allows fallback defaults"
  - "Cross-container drag: handleDragEnd checks over.data.current.type to route drops appropriately"
  - "Context menu on containers: Wrap container div with ContextMenuTrigger for right-click actions"

# Metrics
duration: 2.5min
completed: 2026-01-27
---

# Quick Task 015: Fix Phase 6 Multi-Select and Dropdown Issues

**Cross-container drag-drop with multi-select support and right-click context menu for dropdowns**

## Performance

- **Duration:** 2.5 min (147 seconds)
- **Started:** 2026-01-27T10:00:20Z
- **Completed:** 2026-01-27T10:02:47Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Multi-selected cards can be dragged together (drag one card to move all selected)
- Cards can be dragged into dropdowns and out of dropdowns to main canvas
- Right-click context menu on dropdowns with "Add Card" submenu and "Move X cards here" option
- Graceful context degradation for preview iframe (no MultiSelectProvider available)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Context Menu and Fix Multi-Drag** - `c8180d5` (feat)
2. **Task 2: Add Context Menu to DropdownSortable** - `69cc3cd` (feat)
3. **Task 3: Optional Multi-Select Context with Fallback** - `22ba5f3` (feat)

## Files Created/Modified
- `src/components/ui/context-menu.tsx` - Shadcn context menu component (Radix UI wrapper)
- `src/components/canvas/selectable-flow-grid.tsx` - Added cross-container drag support (into/out of dropdowns)
- `src/components/canvas/dropdown-sortable.tsx` - Added right-click context menu with Add Card and Move Selected actions
- `src/contexts/multi-select-context.tsx` - Added optional hook for graceful degradation when no provider

## Decisions Made

**1. Optional context hook pattern**
- Created `useMultiSelectContextOptional` that returns null instead of throwing error
- Allows DropdownSortable to work in both editor (with provider) and preview iframe (without provider)
- Fallback defaults: empty Set for selectedIds, 0 for selectedCount, no-op for clearSelection

**2. Limited dropdown card types**
- `DROPDOWN_ALLOWED_TYPES = ["link", "horizontal", "hero", "square"]`
- Excludes dropdown (no nesting), game, gallery, video (too complex for nested context)
- Keeps context menu simple and prevents UI issues

**3. Filter SortableContext to main canvas only**
- Changed `items={cards.map(...)}` to `items={cards.filter(c => !c.parentDropdownId).map(...)}`
- Prevents main canvas SortableContext from claiming cards inside dropdowns
- Each dropdown has its own SortableContext for child cards

**4. Clear selection after multi-drag**
- After moving multiple cards, `multiSelect.clearSelection()` runs
- Provides clear visual feedback that operation completed
- Prevents confusion about what's still selected

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all components integrated cleanly.

## Next Phase Readiness

- Multi-select bulk operations fully functional
- Nested drag-and-drop works bidirectionally (into and out of dropdowns)
- Context menu provides quick actions for dropdown management
- Phase 6 advanced cards feature set complete

---
*Quick Task: 015*
*Completed: 2026-01-27*
