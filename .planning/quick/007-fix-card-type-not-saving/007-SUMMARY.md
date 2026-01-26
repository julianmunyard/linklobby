---
quick: 007
subsystem: api
tags: [auto-save, cards, persistence]

key-files:
  modified:
    - src/hooks/use-cards.ts

duration: 5min
completed: 2026-01-26
---

# Quick Task 007: Fix Card Type Not Saving

**Added card_type and position to saveCards PATCH payload - card type changes now persist across page refresh**

## Performance

- **Duration:** 5 min
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Card type changes (hero/horizontal/square) now persist after page refresh
- Position field also added to payload for consistency
- All mutable card fields now included in auto-save

## Task Commits

1. **Task 1: Add card_type to saveCards payload** - `b29e077` (fix)

## Files Modified
- `src/hooks/use-cards.ts` - Added card_type and position to PATCH request body

## Root Cause

The `saveCards` function explicitly listed fields to send in the PATCH request body:
```typescript
body: JSON.stringify({
  title: card.title,
  description: card.description,
  url: card.url,
  content: card.content,
  size: card.size,
  sortKey: card.sortKey,
  is_visible: card.is_visible,
}),
```

This omitted `card_type` and `position`, so changes to these fields were stored in Zustand state but never sent to the database, causing them to revert on page refresh.

## Fix

Added the missing fields to the payload:
```typescript
body: JSON.stringify({
  card_type: card.card_type,  // NEW
  title: card.title,
  description: card.description,
  url: card.url,
  content: card.content,
  size: card.size,
  position: card.position,    // NEW
  sortKey: card.sortKey,
  is_visible: card.is_visible,
}),
```

## Decisions Made
None - followed plan as specified.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

---
*Quick Task: 007*
*Completed: 2026-01-26*
