---
phase: quick
plan: 035
subsystem: ui
tags: [ipod-theme, social-icons, expandable-menu, react]

# Dependency graph
requires:
  - phase: quick-033
    provides: iPod Classic theme with click wheel navigation
provides:
  - Expandable "Socials" menu item in iPod theme
  - Platform name sub-items with click-to-open behavior
  - CSS styling for iPod sub-menu items
affects: [ipod-theme, public-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Expandable menu pattern for themed layouts"
    - "Card-type specific rendering in menu interfaces"

key-files:
  created: []
  modified:
    - src/components/cards/ipod-classic-layout.tsx
    - src/components/public/static-ipod-classic-layout.tsx
    - src/components/public/public-page-renderer.tsx
    - src/app/globals.css

key-decisions:
  - "Social-icons card renders as 'Socials' menu item, not individual icons"
  - "Click selected item to expand, click again to collapse"
  - "Sub-items show platform labels not icons for menu-native appearance"
  - "Sub-items don't participate in wheel navigation"

patterns-established:
  - "Card-type detection for special rendering in themed layouts"
  - "Expandable sub-menu state tracking with card.id"

# Metrics
duration: 8min
completed: 2026-02-04
---

# Quick Task 035: iPod Theme Social Icons as Expandable Menu

**Social icons now render as expandable "Socials" menu item in iPod theme, showing platform names as sub-items when expanded**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-04
- **Completed:** 2026-02-04
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Social-icons cards render as "Socials" menu item in iPod theme
- Clicking expands sub-menu showing platform names (Instagram, TikTok, etc.)
- Clicking platform name opens URL in new tab
- Works in both editor preview and public pages
- CSS styling for indented sub-menu items

## Task Commits

Each task was committed atomically:

1. **Task 1: Add expandable Socials menu to iPod layouts** - `229896f` (feat)
2. **Task 2: Add CSS for iPod sub-menu items** - `6a87b8d` (feat)

## Files Created/Modified
- `src/components/cards/ipod-classic-layout.tsx` - Added expandable Socials menu rendering with social icons from profile store
- `src/components/public/static-ipod-classic-layout.tsx` - Same functionality for public pages via socialIcons prop
- `src/components/public/public-page-renderer.tsx` - Parse and pass socialIcons to static iPod layout
- `src/app/globals.css` - Added `.ipod-menu-subitem` CSS class for sub-menu styling

## Decisions Made
- Social-icons card type detected in menu rendering to show "Socials" label instead of card title
- Sub-items use 24px left padding for visual hierarchy (vs 10px for main items)
- Sub-items use 11px font size (vs 12px for main items) for differentiation
- Chevron indicator shows > when collapsed, v when expanded
- Sub-items don't participate in selectedIndex navigation - they're always clickable

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation was straightforward.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- iPod theme now fully supports social icons in menu-native way
- Ready for further iPod theme enhancements

---
*Phase: quick*
*Plan: 035*
*Completed: 2026-02-04*
