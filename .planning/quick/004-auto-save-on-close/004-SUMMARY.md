# Quick Task 004: Auto-save on Close - Summary

## Completed

Implemented debounced auto-save so changes persist automatically without needing to click Save.

## Changes Made

### 1. Created `src/hooks/use-auto-save.ts`

New hook that:
- Watches `hasChanges` from the page store
- Debounces for 500ms to prevent API spam while typing
- Automatically calls `saveCards()` after inactivity
- Shows error toast only on failure (no toast spam for success)
- Prevents concurrent saves with ref tracking

### 2. Updated `src/components/editor/editor-client-wrapper.tsx`

- Added `useAutoSave(500)` hook call to enable auto-save in the editor

## How It Works

1. User makes a change (edit text, reorder cards, change size, etc.)
2. `hasChanges` becomes `true` in the store
3. `useAutoSave` hook detects this and starts a 500ms timer
4. If user makes another change within 500ms, timer resets
5. After 500ms of inactivity, changes are saved to DB
6. `hasChanges` becomes `false`, "Unsaved changes" indicator disappears

## Result

- No more need to click Save button (it still works for manual saves)
- Changes persist automatically
- Closing the editor preserves all changes
- Subtle UX - no toast spam, just auto-saves in background
