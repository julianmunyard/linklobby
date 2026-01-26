---
phase: quick-005
plan: 01
type: execute
wave: 1
autonomous: true
---

# Quick Task 005: Fix Auto-Save on Close

## Problem

When clicking X or clicking outside the property editor, changes are lost because:

1. `handleClose()` calls `selectCard(null)` BEFORE `saveCards()`
2. When `selectCard(null)` runs, it triggers a re-render
3. The property editor unmounts because `selectedCard` becomes null
4. The `await saveCards()` never completes or runs after unmount

## Solution

Save BEFORE deselecting, and ensure save completes before changing selection.

## Tasks

<task type="auto">
  <name>Task 1: Fix save order in EditorPanel handleClose</name>
  <files>
    src/components/editor/editor-panel.tsx
  </files>
  <action>
    Change handleClose to save FIRST, then deselect:
    ```typescript
    const handleClose = async () => {
      // Save FIRST, before deselecting (which unmounts the editor)
      if (hasChanges) {
        await saveCards()
      }
      selectCard(null)
    }
    ```
  </action>
  <verify>
    Build succeeds
  </verify>
  <done>
    handleClose saves before deselecting
  </done>
</task>

<task type="auto">
  <name>Task 2: Fix save order in PreviewPanel handleDeselect</name>
  <files>
    src/components/editor/preview-panel.tsx
  </files>
  <action>
    Change handleDeselect to save FIRST, then deselect:
    ```typescript
    const handleDeselect = async () => {
      // Save FIRST, before deselecting
      if (hasChanges) {
        await saveCards()
      }
      selectCard(null)
    }
    ```
  </action>
  <verify>
    Build succeeds
  </verify>
  <done>
    handleDeselect saves before deselecting
  </done>
</task>

## Success Criteria

- [ ] Changes are saved to database when clicking X
- [ ] Changes are saved to database when clicking outside
- [ ] Card data persists after close/reopen
- [ ] Build passes
