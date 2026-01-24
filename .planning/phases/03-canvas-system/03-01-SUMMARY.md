---
phase: 03-canvas-system
plan: 01
subsystem: ui
tags: [dnd-kit, fractional-indexing, drag-and-drop, typescript, zustand]

# Dependency graph
requires:
  - phase: 02-dashboard-shell
    provides: Dashboard layout, page-store foundation
provides:
  - dnd-kit drag-and-drop library suite (@dnd-kit/core, sortable, utilities)
  - fractional-indexing package for efficient card ordering
  - Card type definition matching database schema with sortKey field
  - CARD_SIZES configuration for small/medium/large card heights
  - Ordering utility functions (sortCardsBySortKey, generateAppendKey, generateInsertKey, generateMoveKey)
affects: [03-02-database, 03-03-sortable, 03-04-preview, canvas-ui, card-management]

# Tech tracking
tech-stack:
  added:
    - "@dnd-kit/core@6.3.1"
    - "@dnd-kit/sortable@10.0.0"
    - "@dnd-kit/utilities@3.2.2"
    - "fractional-indexing@3.2.0"
  patterns:
    - "Fractional indexing for card ordering (only updates moved card, not all rows)"
    - "Predefined card sizes (Small: 96px, Medium: 160px, Large: 256px)"
    - "sortKey field for persistent ordering using string keys"

key-files:
  created:
    - "src/types/card.ts - Card, CardType, CardSize types and CARD_SIZES config"
    - "src/lib/ordering.ts - Fractional indexing helper functions"
  modified:
    - "package.json - Added dnd-kit and fractional-indexing dependencies"

key-decisions:
  - "Use dnd-kit instead of react-beautiful-dnd (actively maintained, React 19 compatible)"
  - "Use fractional-indexing strings instead of integer positions (efficient reordering)"
  - "Predefined card sizes (small/medium/large) not free resize"
  - "sortKey field for ordering, ignore position_x/position_y columns (vertical stack not 2D canvas)"

patterns-established:
  - "Card type system: 8 card types (hero, horizontal, square, video, gallery, dropdown, game, audio)"
  - "Fractional indexing pattern: generateKeyBetween for insertions, only updates moved card"
  - "Tailwind size classes: CARD_SIZES constant with height/minHeight configurations"

# Metrics
duration: 2min
completed: 2026-01-24
---

# Phase 03 Plan 01: Canvas Foundation Summary

**dnd-kit drag-and-drop suite installed with fractional-indexing for efficient card reordering, Card type system established**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-24T04:18:31Z
- **Completed:** 2026-01-24T04:20:06Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Installed dnd-kit package suite (core, sortable, utilities) for drag-and-drop functionality
- Installed fractional-indexing package for efficient order persistence
- Created Card type definition matching database schema with sortKey for ordering
- Created CARD_SIZES configuration for predefined card heights
- Implemented ordering utility functions using fractional-indexing

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dnd-kit and fractional-indexing packages** - `b376512` (chore)
2. **Task 2: Create Card type definitions** - `5acc4ef` (feat)
3. **Task 3: Create fractional-indexing helper functions** - `279bfd3` (feat)

## Files Created/Modified
- `package.json` - Added @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fractional-indexing
- `package-lock.json` - Locked dependency versions
- `src/types/card.ts` - Card, CardType, CardSize types with CARD_SIZES configuration
- `src/lib/ordering.ts` - sortCardsBySortKey, generateAppendKey, generateInsertKey, generateMoveKey helpers

## Decisions Made

**1. dnd-kit over react-beautiful-dnd**
- Rationale: dnd-kit is actively maintained, React 19 compatible, and lighter (10kb vs 50kb)
- Impact: Modern drag-and-drop with better accessibility and keyboard support

**2. Fractional-indexing over integer positions**
- Rationale: Only updates moved card instead of renumbering all subsequent cards
- Impact: Database efficiency - single UPDATE instead of N updates on reorder
- Pattern: String keys like "a0", "a1", "a0V" allow infinite insertions between any two values

**3. Predefined card sizes (Small/Medium/Large)**
- Rationale: Simpler UX than free resize, matches mobile-first vertical stack approach
- Impact: CARD_SIZES constant with Tailwind classes (h-24, h-40, h-64)

**4. sortKey field for ordering**
- Rationale: Vertical stack layout only needs 1D ordering, not 2D positioning
- Impact: Ignore position_x/position_y columns, use sort_key column for order

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all packages installed successfully, TypeScript compilation passed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 03-02 (Database Schema Updates):**
- Card type definition matches database schema expectations
- sortKey field defined for fractional-indexing storage
- Ordering helpers ready for use once sort_key column exists

**Ready for Plan 03-03 (Sortable Card List):**
- dnd-kit packages installed and importable
- Card type available for component props
- Ordering functions ready for drag-and-drop reordering

**No blockers or concerns.**

---
*Phase: 03-canvas-system*
*Completed: 2026-01-24*
