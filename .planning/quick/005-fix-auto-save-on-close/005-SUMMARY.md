# Quick Task 005: Fix Auto-Save on Close - Summary

## Problem

When clicking X or clicking outside the property editor, changes were lost because:

1. `handleClose()` and `handleDeselect()` called `selectCard(null)` BEFORE `saveCards()`
2. When `selectCard(null)` runs, it triggers a re-render
3. The property editor unmounts because `selectedCard` becomes null
4. The `await saveCards()` never completes (runs after unmount)

## Solution

Changed the order of operations in both handlers to save FIRST, then deselect.

## Changes Made

### 1. editor-panel.tsx

Fixed `handleClose` to save before deselecting:

```typescript
const handleClose = async () => {
  // IMPORTANT: Save FIRST, before deselecting (which unmounts the editor)
  if (hasChanges) {
    await saveCards()
  }
  selectCard(null)
}
```

### 2. preview-panel.tsx

Fixed `handleDeselect` to save before deselecting:

```typescript
const handleDeselect = async () => {
  // IMPORTANT: Save FIRST, before deselecting (which unmounts the editor)
  if (hasChanges) {
    await saveCards()
  }
  selectCard(null)
}
```

## Verification

- [x] Build passes
- [x] Changes saved to database when clicking X
- [x] Changes saved to database when clicking outside
- [x] Card data persists after close/reopen

## Files Modified

- `src/components/editor/editor-panel.tsx`
- `src/components/editor/preview-panel.tsx`
