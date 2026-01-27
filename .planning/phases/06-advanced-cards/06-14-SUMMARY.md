---
phase: 06
plan: 14
subsystem: editor
tags: [multi-select, bulk-actions, toolbar, ui, ux]
requires: [06-03, 06-13, 06-01]
provides:
  - SelectionToolbar component
  - Bulk card operations
  - Group into dropdown action
  - Move to dropdown action
  - Bulk delete with confirmation
affects: [06-15]
tech-stack:
  added: []
  patterns:
    - Floating toolbar pattern
    - Bulk operations with confirmation
    - Contextual action menus
key-files:
  created:
    - src/components/editor/selection-toolbar.tsx
  modified:
    - src/components/editor/editor-panel.tsx
decisions:
  - id: floating-bottom-center-toolbar
    decision: Position toolbar at bottom center with z-50
    rationale: Non-intrusive, visible regardless of scroll position
  - id: auto-hide-on-empty-selection
    decision: Toolbar auto-hides when selectedCount is 0
    rationale: Only show when relevant, cleaner UI
  - id: group-creates-new-dropdown
    decision: Group into Dropdown creates new dropdown and moves all selected cards
    rationale: Fast workflow - single action for common use case
  - id: delete-requires-confirmation
    decision: Delete All shows AlertDialog confirmation
    rationale: Destructive action on multiple items needs explicit confirmation
metrics:
  duration: 4 minutes
  completed: 2026-01-27
---

# Phase 6 Plan 14: Selection Toolbar with Bulk Actions Summary

**One-liner:** Floating toolbar with Group into Dropdown, Move to Dropdown, Delete All actions for multi-selected cards

## What Was Built

### SelectionToolbar Component (`src/components/editor/selection-toolbar.tsx`)

Created floating toolbar that appears when cards are selected:

**Features:**
- Shows selected card count
- **Group into Dropdown**: Creates new dropdown, moves all selected cards into it
- **Move to Dropdown**: Dropdown menu listing existing dropdowns with child counts
- **Delete All**: AlertDialog confirmation before bulk deletion
- **Clear selection**: X button to deselect all

**UI/UX:**
- Positioned at bottom center (`fixed bottom-6 left-1/2 -translate-x-1/2`)
- z-50 to float above other content
- Auto-hides when `selectedCount === 0`
- Responsive labels (icons on mobile, text on desktop with `hidden sm:inline`)
- Dividers between action groups for visual clarity

**Integration with Stores:**
- Uses `useMultiSelectContext()` for selection state
- Uses `usePageStore()` for card operations
- Uses `useCards()` hook for database persistence

### Editor Panel Integration

Added `<SelectionToolbar />` at root level of `EditorPanel` component:
- Renders outside tabs/property editor flow
- Always rendered but auto-hides when not needed
- Provides consistent bulk actions regardless of current tab

## Technical Implementation

### Bulk Operations

**Group into Dropdown:**
```typescript
const handleGroupIntoDropdown = () => {
  addCard("dropdown")
  const newDropdown = usePageStore.getState().cards.find(...)
  selectedIds.forEach((cardId) => {
    moveCardToDropdown(cardId, newDropdown.id)
  })
  clearSelection()
}
```

**Move to Dropdown:**
- Filters cards to find existing dropdowns without parents
- Uses type guard `isDropdownContent()` before casting to `DropdownCardContent`
- Shows dropdown title and child count in menu

**Delete All:**
- Shows AlertDialog with destructive action confirmation
- Iterates through `selectedIds` Set
- Optimistic update: removes from store, then database
- Clears selection after completion

### Type Safety

Applied proper type guards:
```typescript
if (!isDropdownContent(dropdown.content)) {
  return null
}
const content = dropdown.content as DropdownCardContent
```

Prevents TypeScript errors when accessing dropdown-specific fields.

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Floating bottom-center toolbar | Non-intrusive position, always visible regardless of scroll |
| Auto-hide when no selection | Only show when relevant, cleaner UI when not needed |
| Group creates new dropdown | Fast workflow - single action creates dropdown and moves cards |
| Delete requires confirmation | Destructive bulk action needs explicit user confirmation |
| Show dropdown child counts | Helps users understand dropdown contents before moving cards |

## Testing Notes

**Verification:**
- ✅ TypeScript compiles without errors for new files
- ✅ Toolbar appears when cards selected (via MultiSelectContext)
- ✅ Group into Dropdown creates dropdown and moves cards
- ✅ Delete All shows confirmation dialog
- ✅ Auto-hides when selection cleared

**Pre-existing errors:**
- Build fails on unrelated file: `src/components/canvas/preview-sortable-card.tsx` (onClick signature)
- Not related to this plan's changes

## Integration Points

**Depends on:**
- Plan 06-03: Selection UI Hook (multi-select context)
- Plan 06-13: Link Card Background Options (general editor stability)
- Plan 06-01: Dropdown types and store operations

**Provides:**
- SelectionToolbar component for bulk card operations
- UX pattern for multi-select actions

**Affects:**
- Plan 06-15: Will benefit from bulk operations in testing/polish phase

## Next Phase Readiness

**Blockers:** None

**Concerns:** None - toolbar integrates cleanly with existing selection system

**Recommendations:**
- Consider adding undo/redo support for bulk operations in future
- Could add "Select All" action to complement selection toolbar

## Files Changed

### Created
- `src/components/editor/selection-toolbar.tsx` - 204 lines
  - SelectionToolbar component with bulk actions
  - AlertDialog for delete confirmation
  - Integration with multi-select context and page store

### Modified
- `src/components/editor/editor-panel.tsx` - 4 lines added
  - Import SelectionToolbar
  - Render at root level

## Commits

1. **4c6a5f0** - feat(06-14): create SelectionToolbar component
   - Shows selected count, Group into Dropdown, Move to Dropdown, Delete All
   - Floating at bottom center with z-50
   - Auto-hides when no selection

2. **7045936** - feat(06-14): integrate SelectionToolbar into editor
   - Import and add to editor panel root level
   - Auto-hides when no selection (handled by component)

## Performance Notes

- Toolbar rerenders only when `selectedCount` or `cards` change
- AlertDialog lazy-renders only when delete action triggered
- Dropdown menu lazy-renders only when opened
- No performance concerns with current implementation

## Accessibility Notes

- AlertDialog uses Radix primitives with built-in a11y
- Buttons have proper aria-labels (X button for clear)
- Keyboard navigation works through all toolbar actions
- Focus management handled by Radix Dialog

---

**Status:** Complete ✅
**Duration:** ~4 minutes
**Commits:** 2
