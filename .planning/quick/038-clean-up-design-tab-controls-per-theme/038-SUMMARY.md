---
phase: quick
plan: 038
subsystem: ui
tags: [react, theme-system, conditional-rendering, useMemo]

# Dependency graph
requires:
  - phase: 07-theme-system
    provides: Theme infrastructure with ThemeId type and theme-specific controls
provides:
  - Design panel intelligently hides irrelevant tabs per theme
  - Style tab hides inapplicable controls for list-layout themes
affects: [design-panel, style-controls, user-experience]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useMemo for computing visible tabs based on theme state"
    - "FIXED_FONT_THEMES and LIST_LAYOUT_THEMES constants for theme categorization"
    - "Conditional rendering of sections based on theme capabilities"

key-files:
  created: []
  modified:
    - src/components/editor/design-panel.tsx
    - src/components/editor/style-controls.tsx

key-decisions:
  - "FIXED_FONT_THEMES includes vcr-menu, ipod-classic, receipt (themes with fixed fonts)"
  - "LIST_LAYOUT_THEMES includes vcr-menu, ipod-classic, receipt (list-based layouts where card styles don't apply)"
  - "Theme-specific controls (VCR center, iPod texture/stickers, receipt price/stickers) remain visible regardless of category"

patterns-established:
  - "Pattern 1: Use useMemo to compute visible UI elements based on theme state changes"
  - "Pattern 2: Create ThemeId[] constants to categorize themes by capability"
  - "Pattern 3: Wrap irrelevant controls in conditional rendering based on theme category"

# Metrics
duration: 1min 17sec
completed: 2026-02-05
---

# Quick Task 038: Design Tab Controls Per Theme Summary

**Design panel tabs and controls now intelligently hide based on theme capabilities to eliminate user confusion**

## Performance

- **Duration:** 1 min 17 sec
- **Started:** 2026-02-05T22:45:37Z
- **Completed:** 2026-02-05T22:46:54Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Fonts tab hidden for VCR Menu, iPod Classic, and Receipt themes (fixed fonts)
- Border radius and card shadows hidden in Style tab for list-layout themes
- Theme-specific controls (VCR center, iPod texture/stickers, receipt price/stickers) remain functional
- Tab visibility updates immediately when switching themes via useMemo reactivity

## Task Commits

Each task was committed atomically:

1. **Task 1: Hide Fonts tab for fixed-font themes** - `677fcdc` (feat)
2. **Task 2: Hide border radius and shadows for list-layout themes** - `1e8a1f2` (feat)

## Files Created/Modified
- `src/components/editor/design-panel.tsx` - Added useMemo to filter visible tabs based on FIXED_FONT_THEMES
- `src/components/editor/style-controls.tsx` - Added conditional rendering for border radius and shadows based on LIST_LAYOUT_THEMES

## Decisions Made

**Theme categorization:**
- FIXED_FONT_THEMES = ['vcr-menu', 'ipod-classic', 'receipt'] - themes where fonts cannot be changed
- LIST_LAYOUT_THEMES = ['vcr-menu', 'ipod-classic', 'receipt'] - themes where card style controls don't apply
- Currently the same themes fall into both categories, but kept as separate constants for future flexibility

**Implementation approach:**
- Used useMemo in design-panel.tsx to recompute visible tabs when themeId changes
- Used simple boolean flag in style-controls.tsx since no memoization needed for single calculation
- Wrapped border radius and shadows sections together in single conditional for cleaner code
- Glass blur section maintains its own conditional (theme?.hasGlassEffect) as before

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward conditional rendering implementation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Design panel UX improved. Users will no longer see:
- Font controls for themes with fixed fonts (VCR Menu, iPod Classic, Receipt)
- Border radius and shadow controls for list-layout themes where they have no effect

Theme-specific controls remain accessible for each theme's unique features.

---
*Phase: quick-038*
*Completed: 2026-02-05*
