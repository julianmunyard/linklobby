---
phase: quick-052
plan: 01
subsystem: ui
tags: [audio, public-page, system-settings, poolsuite, themeId]

# Dependency graph
requires:
  - phase: quick-051
    provides: Poolsuite FM audio player theme for system-settings
  - phase: 12-audio
    provides: AudioPlayer component and audio card rendering
provides:
  - Working Poolsuite audio player on public pages for system-settings theme
affects: [public-page, audio-system]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - src/components/public/public-page-renderer.tsx

key-decisions:
  - "One-line fix: add themeId prop to StaticFlowGrid in no-frame default layout path"

patterns-established: []

# Metrics
duration: 2min
completed: 2026-02-10
---

# Quick Task 052: Fix Poolsuite Audio Player Not Playing on Public Pages

**Add missing themeId prop to StaticFlowGrid in default layout path so system-settings audio cards render with correct Poolsuite player variant**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-10T00:57:33Z
- **Completed:** 2026-02-10T00:59:33Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Fixed Poolsuite (system-settings) audio player not playing on public pages
- Root cause: themeId not passed to StaticFlowGrid in default no-frame layout path of PublicPageRenderer
- Without themeId, the audio card special handling in StaticFlowGrid was skipped, falling through to CardRenderer which uses useThemeStore (not hydrated on public pages, defaults to instagram-reels)

## Task Commits

Each task was committed atomically:

1. **Task 1: Pass themeId to StaticFlowGrid in default layout path** - `c4954da` (fix)

## Files Created/Modified
- `src/components/public/public-page-renderer.tsx` - Added missing `themeId={themeId}` prop to StaticFlowGrid in the no-frame default layout path (line 421)

## Decisions Made
None - followed plan as specified. Single-line fix exactly as diagnosed.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All audio player themes work correctly on public pages
- system-settings, vcr-menu, receipt, classified, macintosh, instagram-reels all render correct player variants

---
*Phase: quick-052*
*Completed: 2026-02-10*
