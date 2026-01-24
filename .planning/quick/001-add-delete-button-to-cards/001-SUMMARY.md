# Quick Task 001: Add Delete Button to Cards

## Result: Complete

## Commits

| Hash | Description |
|------|-------------|
| 735b927 | feat(quick-001): add delete button to cards |

## Files Modified

- `src/components/canvas/sortable-card.tsx` - Added onDelete prop and Trash2 delete button
- `src/components/canvas/sortable-card-list.tsx` - Added onDeleteCard prop, passed to SortableCard
- `src/components/editor/cards-tab.tsx` - Added handleDeleteCard, wired to store and API

## What Was Done

1. Added delete button (Trash2 icon) to each card in the editor list
2. Button appears on the right side of each card
3. Clicking delete removes card from store (optimistic) and then from database
4. Click propagation stopped so card isn't selected when deleting

---
*Completed: 2026-01-24*
