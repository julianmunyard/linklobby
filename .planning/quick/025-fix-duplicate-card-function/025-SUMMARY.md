---
task: "025"
type: quick
subsystem: api
tags: [supabase, upsert, duplicate-card, persistence]

# Tech tracking
tech-stack:
  added: []
  patterns: [upsert for new and existing cards]

key-files:
  created: []
  modified:
    - src/lib/supabase/cards.ts
    - src/app/api/cards/[id]/route.ts
    - src/hooks/use-cards.ts

key-decisions:
  - "Use Supabase upsert with PUT endpoint instead of PATCH for saveCards"
  - "Keep PATCH endpoint for backward compatibility"

# Metrics
duration: 1min
completed: 2026-02-02
---

# Quick Task 025: Fix Duplicate Card Function

**Duplicate card function now persists to database using Supabase upsert**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-02T20:35:09Z
- **Completed:** 2026-02-02T20:36:01Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments
- Added `upsertCard` function to Supabase helper library
- Created PUT endpoint for upsert operations
- Changed `saveCards` to use PUT instead of PATCH
- Duplicate cards now persist correctly to database

## Task Commits

1. **Task 1: Add upsertCard function and use in saveCards** - `84c73bf` (fix)

## Files Created/Modified
- `src/lib/supabase/cards.ts` - Added `upsertCard` function using Supabase's `.upsert()` with `onConflict: 'id'`
- `src/app/api/cards/[id]/route.ts` - Added PUT endpoint for upsert, kept PATCH for backward compatibility
- `src/hooks/use-cards.ts` - Changed `saveCards` to use PUT method instead of PATCH

## Decisions Made

**Use PUT for upsert instead of changing PATCH behavior**
- Added separate PUT endpoint for upsert operations
- Kept PATCH endpoint unchanged for backward compatibility
- PUT handles both new cards (from duplicate) and existing cards in single operation

**Include page_id in upsert operation**
- PUT endpoint retrieves page_id from authenticated user
- Ensures new cards are properly associated with user's page

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation was straightforward.

## Root Cause Analysis

**Problem:** When a card is duplicated, the Zustand store creates a new card with a new UUID. The `saveCards` function only used PATCH to update existing cards. When PATCH tried to update a card that didn't exist in the database, Supabase's `.single()` call failed because no row was returned.

**Solution:** Added `upsertCard` function that uses Supabase's native `.upsert()` functionality with `onConflict: 'id'`. This handles both new cards (INSERT) and existing cards (UPDATE) in a single operation.

## Next Steps

Duplicate card function now works correctly. No additional work needed.

---
*Task: quick-025*
*Completed: 2026-02-02*
