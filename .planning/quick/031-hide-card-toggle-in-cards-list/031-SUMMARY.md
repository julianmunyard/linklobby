---
phase: quick
plan: 031
subsystem: ui
tags: [cards, visibility, editor]

# Dependency graph
requires:
  - phase: 04-04
    provides: Card visibility toggle in property editor
provides:
  - Hide/unhide toggle button in cards list
  - Hidden cards filtered from preview (not just overlay)
  - Visual indicators for hidden state in cards list
affects: [editor, preview]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Hidden cards filter pattern (visibleCards = cards.filter(c => c.is_visible))
    - Dual visual feedback (list shows all with indicators, preview shows only visible)

key-files:
  created: []
  modified:
    - src/components/canvas/sortable-card.tsx
    - src/components/canvas/sortable-card-list.tsx
    - src/components/editor/cards-tab.tsx
    - src/components/canvas/selectable-flow-grid.tsx
    - src/components/canvas/preview-sortable-card.tsx

key-decisions:
  - "Hide toggle shows EyeOff when visible (click to hide), Eye when hidden (click to unhide)"
  - "Hidden cards filtered completely from preview instead of showing with overlay"
  - "Cards list shows all cards with visual indicators (opacity, strikethrough) for hidden state"
  - "Empty state distinguishes between no cards and no visible cards"

patterns-established:
  - "Visibility filtering: preview uses visibleCards = cards.filter(c => c.is_visible)"
  - "Visual feedback: cards list uses opacity-50 and line-through for hidden cards"
  - "Toggle button pattern: positioned before delete button in cards list"

# Metrics
duration: 2m 23s
completed: 2026-02-03
---

# Quick Task 031: Hide Card Toggle in Cards List

**Hide/unhide toggle in cards list with Eye/EyeOff icons filters hidden cards completely from preview**

## Performance

- **Duration:** 2m 23s
- **Started:** 2026-02-03T02:17:40Z
- **Completed:** 2026-02-03T02:20:03Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Added Eye/EyeOff toggle button next to delete in cards list
- Hidden cards completely filtered from preview (gaps close naturally)
- Visual indicators for hidden state (opacity, strikethrough, icon change)
- Dual view pattern: list shows all cards, preview shows only visible

## Task Commits

Each task was committed atomically:

1. **Task 1: Add hide toggle button to cards list** - `8ad90cf` (feat)
2. **Task 2: Filter hidden cards from preview** - `05ae720` (feat)

## Files Created/Modified
- `src/components/canvas/sortable-card.tsx` - Added Eye/EyeOff toggle button, visual indicators for hidden state
- `src/components/canvas/sortable-card-list.tsx` - Pass through onToggleVisibility callback
- `src/components/editor/cards-tab.tsx` - handleToggleVisibility updates card.is_visible
- `src/components/canvas/selectable-flow-grid.tsx` - Filter to visibleCards for preview rendering
- `src/components/canvas/preview-sortable-card.tsx` - Removed hidden overlay and opacity (cards filtered out instead)

## Decisions Made

**1. Filter vs Overlay approach**
- Previously: Hidden cards shown in preview with EyeOff overlay and opacity-50
- Now: Hidden cards completely filtered from preview rendering
- Rationale: Cleaner preview experience, cards rearrange naturally as if hidden cards don't exist

**2. Dual visual feedback pattern**
- Cards list: Shows ALL cards with visual indicators (opacity-50, strikethrough title, Eye icon)
- Preview: Shows ONLY visible cards (filtered)
- Rationale: Users need to see hidden cards to unhide them, but preview should show clean visitor experience

**3. Toggle button icon direction**
- Visible card shows EyeOff (action: click to hide)
- Hidden card shows Eye (action: click to unhide)
- Rationale: Icon shows the action that will be taken, not current state

**4. Empty state messaging**
- "No cards yet. Add your first card above." when cards.length === 0
- "No visible cards. Unhide cards to see them here." when visibleCards.length === 0 but cards exist
- Rationale: Clear guidance on why preview is empty

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward implementation using existing is_visible field and updateCard store action.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Visibility toggle feature complete across all UI surfaces (property editor, cards list)
- Hidden cards work seamlessly with drag-drop, multi-select, and all existing features
- Ready for testing A/B page variations and saving cards for later

---
*Phase: quick*
*Completed: 2026-02-03*
