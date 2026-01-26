# Quick Task 004: Auto-save on Close

## Problem

Users must manually click Save button after editing cards or reordering. They expect changes to persist automatically.

## Current State

- `createCard` → already saves to DB immediately ✓
- `removeCard` → already deletes from DB immediately ✓
- `updateCard` (property editor) → only updates store, needs Save button
- `reorderCards` → only updates store, needs Save button

## Solution

Implement debounced auto-save: when store changes occur, automatically save to DB after 500ms of inactivity. This:
1. Prevents API spam while typing
2. Ensures changes persist without manual save
3. Keeps the Save button for manual saves if needed

## Tasks

### Task 1: Create useAutoSave hook

**File:** `src/hooks/use-auto-save.ts`

Create a hook that:
- Watches `hasChanges` from store
- Debounces for 500ms
- Calls `saveCards()` automatically
- Shows subtle toast on auto-save

```typescript
import { useEffect, useRef } from "react"
import { usePageStore } from "@/stores/page-store"
import { useCards } from "./use-cards"
import { toast } from "sonner"

export function useAutoSave(debounceMs = 500) {
  const hasChanges = usePageStore((state) => state.hasChanges)
  const { saveCards } = useCards()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!hasChanges) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new debounced save
    timeoutRef.current = setTimeout(async () => {
      try {
        await saveCards()
        // Subtle feedback - no toast needed, just mark saved
      } catch {
        toast.error("Auto-save failed")
      }
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [hasChanges, saveCards, debounceMs])
}
```

### Task 2: Add useAutoSave to EditorClientWrapper

**File:** `src/components/editor/editor-client-wrapper.tsx`

Add the hook call at the top of the component to enable auto-save.

### Task 3: Update dashboard header UI

**File:** `src/components/dashboard/dashboard-header.tsx`

- Change "Unsaved changes" indicator to show "Saving..." when auto-save is in progress
- Keep Save button but make it secondary (auto-save handles most cases)
- Show "Saved" checkmark briefly after save completes

## Acceptance Criteria

- [ ] Changes auto-save after 500ms of inactivity
- [ ] No toast spam - subtle or no feedback for successful auto-save
- [ ] Error toast if auto-save fails
- [ ] Save button still works for manual saves
- [ ] "Unsaved changes" indicator disappears after auto-save
