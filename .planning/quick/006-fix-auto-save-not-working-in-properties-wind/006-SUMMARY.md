---
task: 006
type: quick
description: Fix auto-save not working in properties window - stale closure bug
completed: 2026-01-26
files_modified:
  - src/components/editor/editor-panel.tsx
  - src/components/editor/preview-panel.tsx
commits:
  - 707a04c
  - 9f399bd
---

# Quick Task 006: Fix Auto-save Stale Closure Bug

## One-liner

Fixed stale closure bug where `hasChanges` was captured at render time instead of read at call time, breaking auto-save on close.

## Problem

Quick tasks 004 and 005 attempted to fix auto-save on close, but the fix was incomplete. The root cause was a **stale closure bug**:

1. `handleClose` and `handleDeselect` captured `hasChanges` from React's render cycle
2. When user edits a field, `form.watch()` updates the store asynchronously
3. The closure still held the old (stale) value of `hasChanges` (often `false`)
4. When user clicks X or clicks outside, the check `if (hasChanges)` used the stale `false` value
5. Save was skipped, changes were lost

## Solution

Read `hasChanges` directly from the Zustand store at call time using `usePageStore.getState().hasChanges`:

```typescript
const handleClose = async () => {
  const currentHasChanges = usePageStore.getState().hasChanges
  if (currentHasChanges) {
    await saveCards()
  }
  selectCard(null)
}
```

This ensures we check the **current** value of `hasChanges` at the moment of click, not the value captured during the last render.

## Changes Made

### editor-panel.tsx

- Removed: `const hasChanges = usePageStore((state) => state.hasChanges)` subscription
- Added: `const currentHasChanges = usePageStore.getState().hasChanges` in `handleClose`
- Result: X button always triggers save when changes exist

### preview-panel.tsx

- Removed: `const hasChanges = usePageStore((state) => state.hasChanges)` subscription
- Added: `const currentHasChanges = usePageStore.getState().hasChanges` in `handleDeselect`
- Result: Clicking preview panel to deselect always triggers save when changes exist

## Verification

- [x] `npm run build` passes without errors
- [x] TypeScript compiles cleanly
- [ ] Manual test: Changes save when clicking X immediately after editing (user verification)
- [ ] Manual test: Changes save when clicking preview panel immediately after editing (user verification)

## Lesson Learned

When event handlers need to check Zustand state that may have been updated asynchronously (e.g., by `form.watch()` subscriptions), use `useStore.getState().value` to read the current value at call time rather than relying on closure-captured values from `useStore((state) => state.value)`.

---
*Completed: 2026-01-26*
