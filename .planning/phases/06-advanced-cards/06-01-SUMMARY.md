---
phase: 06-advanced-cards
plan: 01
subsystem: ui
tags: [zustand, typescript, state-management, fractional-indexing]

# Dependency graph
requires:
  - phase: 03-canvas-system
    provides: Card type system and fractional-indexing for ordering
  - phase: 04-basic-cards
    provides: Card content type patterns
provides:
  - DropdownCardContent interface with childCardIds array for container functionality
  - parentDropdownId field on Card for tracking parent-child relationships
  - Store actions for managing card-dropdown relationships (move, remove, add)
affects: [06-02, dropdown-ui, card-management]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Container card pattern with childCardIds array
    - Parent-child relationships via parentDropdownId field

key-files:
  created: []
  modified:
    - src/types/card.ts
    - src/stores/page-store.ts

key-decisions:
  - "DropdownCardContent uses childCardIds array to store ordering of child cards"
  - "Cards track parent dropdown via optional parentDropdownId field"
  - "Store actions handle bidirectional updates (parent's childCardIds and child's parentDropdownId)"

patterns-established:
  - "Container card pattern: content.childCardIds array + type guard + specialized store actions"
  - "Type casting pattern: Use type guard then cast to specific content type for safe access"

# Metrics
duration: 3min
completed: 2026-01-27
---

# Phase 6 Plan 1: Dropdown Types & Store Summary

**Dropdown container type system with childCardIds tracking, parentDropdownId field, and three store actions for managing card-dropdown relationships**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-27T03:59:27Z
- **Completed:** 2026-01-27T04:02:04Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments
- Defined DropdownCardContent interface with childCardIds array for ordering child cards
- Added parentDropdownId field to Card interface for tracking which dropdown contains a card
- Implemented three store actions: moveCardToDropdown, removeCardFromDropdown, addCardToDropdown
- Used fractional-indexing for sortKey generation within dropdown context

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Dropdown Card Content Type** - `42fd2f8` (feat)
2. **Task 2: Add Parent Dropdown Field to Card** - `2fee9ea` (feat)
3. **Task 3: Add Dropdown Store Actions** - `9f6f21c` (feat)

## Files Created/Modified
- `src/types/card.ts` - Added DropdownCardContent interface, isDropdownContent type guard, parentDropdownId to Card
- `src/stores/page-store.ts` - Added moveCardToDropdown, removeCardFromDropdown, addCardToDropdown actions with bidirectional updates

## Decisions Made

**1. DropdownCardContent childCardIds array**
- Stores child card IDs in order for rendering
- Separate from global cards array for clean separation of concerns
- Uses fractional-indexing sortKey within dropdown context

**2. Optional parentDropdownId field on Card**
- null/undefined for cards on main canvas
- Set to dropdown ID when card is inside a dropdown
- Enables filtering and relationship queries

**3. Bidirectional updates in store actions**
- moveCardToDropdown updates both card.parentDropdownId and dropdown.content.childCardIds
- removeCardFromDropdown clears parentDropdownId and removes from childCardIds array
- addCardToDropdown creates card with parentDropdownId and adds to dropdown's childCardIds

**4. Type casting after type guard**
- Use isDropdownContent(content) to verify, then cast to DropdownCardContent
- Avoids TypeScript errors with Record<string, unknown> base type

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**TypeScript type narrowing with Record<string, unknown>**
- Issue: TypeScript doesn't narrow `dropdown.content` to DropdownCardContent after type guard
- Solution: Added explicit type casts after type guard checks
- Pattern: `if (isDropdownContent(c.content)) { const content = c.content as DropdownCardContent; ... }`

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for UI implementation:**
- Type system supports dropdown as container
- Cards can track parent dropdown
- Store can manage card-dropdown relationships
- sortKey generation handles dropdown context

**No blockers.** Next plan can implement dropdown UI component and drag-and-drop interactions.

---
*Phase: 06-advanced-cards*
*Completed: 2026-01-27*
