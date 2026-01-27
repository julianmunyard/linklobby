---
phase: 06-advanced-cards
plan: 02
subsystem: ui
tags: [react, hooks, game-loop, touch-controls, requestAnimationFrame, typescript]

# Dependency graph
requires:
  - phase: 04-basic-cards
    provides: Card type system and basic card infrastructure
provides:
  - GameType union type (snake, breakout, flappy)
  - GameCardContent interface for game card data
  - useGameLoop hook for 60fps requestAnimationFrame management
  - useSwipeControls hook for mobile touch gesture detection
affects: [06-03, 06-04, 06-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Game loop pattern: requestAnimationFrame with capped deltaTime"
    - "Touch gesture detection: swipe direction with minimum distance threshold"

key-files:
  created:
    - src/hooks/use-game-loop.ts
    - src/hooks/use-swipe-controls.ts
  modified:
    - src/types/card.ts

key-decisions:
  - "Cap deltaTime to 100ms in game loop to prevent physics explosions after tab switch"
  - "Default 50px minimum swipe distance for gesture recognition"
  - "Game loop manages canvas ref internally and returns it to component"

patterns-established:
  - "Game loop pattern: Accepts onUpdate and onDraw callbacks for separation of logic and rendering"
  - "Touch control pattern: Returns handlers to attach to touch-enabled elements"

# Metrics
duration: 2min
completed: 2026-01-27
---

# Phase 6 Plan 2: Game Card Foundation Summary

**Game card type system and reusable hooks for 60fps animation loop and mobile swipe controls**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-27T03:59:28Z
- **Completed:** 2026-01-27T04:01:31Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Game card type system with GameType union (snake, breakout, flappy) and GameCardContent interface
- useGameLoop hook with requestAnimationFrame management, deltaTime capping, and proper cleanup
- useSwipeControls hook detecting all four swipe directions with configurable minimum distance

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Game Card Content Type** - `50a1b98` (feat)
2. **Task 2: Create useGameLoop Hook** - `5cac85f` (feat)
3. **Task 3: Create useSwipeControls Hook** - `867a36b` (feat)

## Files Created/Modified
- `src/types/card.ts` - Added GameType, GameCardContent, GAME_TYPE_INFO constant, and isGameContent type guard
- `src/hooks/use-game-loop.ts` - Reusable game loop hook with requestAnimationFrame, deltaTime management, and canvas ref
- `src/hooks/use-swipe-controls.ts` - Mobile touch gesture detection returning swipe direction (up/down/left/right)

## Decisions Made

**1. Cap deltaTime to 100ms in game loop**
- Rationale: Prevents physics explosions when user switches tabs (game would receive huge deltaTime on return)
- Implementation: `Math.min(deltaTime, 100)` ensures maximum 10fps as minimum framerate

**2. Default 50px minimum swipe distance**
- Rationale: Balance between responsive gestures and preventing accidental swipes
- Configurable via `minSwipeDistance` parameter for game-specific tuning

**3. Game loop returns canvas ref**
- Rationale: Hook manages canvas internally but component needs ref for rendering
- Pattern: Component receives `canvasRef` from hook, attaches it to canvas element

**4. Separate onUpdate and onDraw callbacks**
- Rationale: Clean separation between game logic (physics, collisions) and rendering (drawing)
- Pattern: Both callbacks receive necessary context (deltaTime for update, ctx for draw)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. TypeScript compilation passed cleanly for all tasks.

**Note:** Pre-existing TypeScript error in `page-store.ts` related to dropdown functionality (missing methods: moveCardToDropdown, removeCardFromDropdown, addCardToDropdown). This is unrelated to game card foundation work.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for game implementations (plans 06-03, 06-04, 06-05):**
- Game card type system defined and typed
- Game loop hook ready for 60fps animation
- Swipe controls hook ready for mobile input
- Hooks are reusable across all three game implementations

**No blockers.** Foundation complete for Snake, Breakout, and Flappy game cards.

---
*Phase: 06-advanced-cards*
*Completed: 2026-01-27*
