---
phase: quick
plan: 016
subsystem: ui
tags: [dropdown, editor, react, zustand]

# Dependency graph
requires:
  - phase: quick-015
    provides: Dropdown card management infrastructure with Add Existing Cards
provides:
  - Card list display in dropdown editor showing cards inside dropdown
  - Remove button functionality to move cards from dropdown back to main canvas
affects: [editor, dropdown-management]

# Tech tracking
tech-stack:
  added: []
  patterns: [bidirectional card removal with store action]

key-files:
  created: []
  modified: [src/components/editor/dropdown-card-fields.tsx]

key-decisions:
  - "Display cards inside dropdown with title/type info and X remove button"
  - "Use removeCardFromDropdown store action for bidirectional updates"

patterns-established:
  - "Card list UI pattern: title, type badge, and action button"

# Metrics
duration: 1min
completed: 2026-01-27
---

# Quick Task 016: Fix Dropdown Card Management - Remove Card

**Dropdown editor displays cards inside dropdown with X buttons to remove them back to main canvas**

## Performance

- **Duration:** 1 min
- **Started:** 2026-01-27T05:31:45Z
- **Completed:** 2026-01-27T05:32:47Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Added "Cards in Dropdown" section to dropdown editor showing all child cards
- Each card displays with title (or "Untitled {type}"), card type badge, and X remove button
- Clicking X removes card from dropdown and returns it to main canvas
- Card count automatically updates after removal

## Task Commits

Each task was committed atomically:

1. **Task 1: Add card list with remove buttons to dropdown editor** - `edadcc1` (feat)

## Files Created/Modified
- `src/components/editor/dropdown-card-fields.tsx` - Added childCards filter, card list UI with remove buttons, removeCardFromDropdown action

## Decisions Made

**Display cards inside dropdown with remove functionality**
- Filter childCards by parentDropdownId to show cards currently in dropdown
- Use similar styling to "Add Existing Cards" popover for visual consistency
- X button positioned on right side with hover:text-destructive for clear affordance
- Only show "Cards in Dropdown" section when childCards.length > 0

**Use existing removeCardFromDropdown store action**
- Leverages bidirectional update pattern from page-store (updates both card.parentDropdownId and dropdown.content.childCardIds)
- No new store actions needed - existing removeCardFromDropdown handles all logic
- Maintains consistency with other dropdown management operations

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation straightforward with existing removeCardFromDropdown store action.

## Next Phase Readiness

Dropdown card management is now complete with both add and remove functionality. Users can:
- Add cards to dropdown via "Add Existing Cards" popover (quick-015)
- Remove cards from dropdown via X buttons (quick-016)
- Drag cards into/out of dropdowns (existing Phase 6 functionality)

Ready for Phase 6 completion and Phase 7 (Theme System).

---
*Phase: quick*
*Completed: 2026-01-27*
