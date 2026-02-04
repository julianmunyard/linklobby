---
phase: 10-fan-tools
plan: 04
subsystem: ui
tags: [react-countdown, release-card, countdown-timer, pre-save, card-conversion]

# Dependency graph
requires:
  - phase: 10-03
    provides: ScheduledContent interface for card scheduling
  - phase: 09-platform-integrations
    provides: platform-embed.ts with detectPlatform, isMusicPlatform, fetchPlatformEmbed
provides:
  - Release card type with countdown timer and pre-save functionality
  - Auto-conversion from release to music card when release goes live
  - ReleaseCardContent interface extending ScheduledContent
  - ReleaseCardFields editor component with album art upload
affects: [11-analytics, public-page]

# Tech tracking
tech-stack:
  added: [react-countdown]
  patterns: [countdown-to-date, card-type-conversion]

key-files:
  created:
    - src/components/cards/release-card.tsx
    - src/components/editor/release-card-fields.tsx
  modified:
    - src/types/card.ts
    - src/components/cards/card-renderer.tsx
    - src/components/editor/cards-tab.tsx
    - src/components/editor/card-property-editor.tsx
    - src/stores/page-store.ts
    - package.json

key-decisions:
  - "Album art uses square (1:1) aspect ratio for consistency with album covers"
  - "Card auto-converts to music card only if musicUrl is a valid music platform"
  - "Countdown triggers conversion after 2 second delay to show 'Out Now!' first"
  - "Release cards support both big and small sizes via CARD_TYPE_SIZING"

patterns-established:
  - "Card type conversion: Update card_type and content in single updateCard call"
  - "Countdown with callback: Use react-countdown's onComplete for state transitions"

# Metrics
duration: 4min
completed: 2026-02-04
---

# Phase 10 Plan 04: Release Card Summary

**Release card with countdown timer, pre-save button, album art display, and automatic conversion to music card when release goes live**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-04T14:30:07Z
- **Completed:** 2026-02-04T14:34:27Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- New 'release' card type for pre-release content
- Countdown timer using react-countdown with days/hours/min/sec display
- Pre-save button with customizable text linking to feature.fm/smarturl/etc.
- Album art upload with square aspect ratio cropping
- Auto-conversion to music card when countdown completes

## Task Commits

Each task was committed atomically:

1. **Task 1: Install countdown and create release card types** - `cc5cb73` (feat)
2. **Task 2: Create release card component with countdown** - `d8096d9` (feat)
3. **Task 3: Release card editor and integration** - `8fa83fd` (feat)

## Files Created/Modified
- `src/types/card.ts` - Added 'release' to CardType, ReleaseCardContent interface, isReleaseContent type guard
- `src/components/cards/release-card.tsx` - New release card component with countdown and conversion logic
- `src/components/editor/release-card-fields.tsx` - Editor fields for release configuration
- `src/components/cards/card-renderer.tsx` - Added release card case with conversion wrapper
- `src/components/editor/cards-tab.tsx` - Added Release to card picker
- `src/components/editor/card-property-editor.tsx` - Integrated ReleaseCardFields
- `src/stores/page-store.ts` - Added default release content
- `package.json` - Added react-countdown dependency

## Decisions Made
- Album art uses square aspect ratio (standard for albums/singles)
- Conversion happens with 2 second delay after countdown to show "Out Now!" message
- Card conversion only triggers for valid music platform URLs (Spotify, Apple Music, etc.)
- Release cards added to CARD_TYPES_NO_IMAGE since they have custom album art handling

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None - all tasks completed smoothly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Release card fully functional for artists to promote upcoming releases
- Scheduling infrastructure from Plan 03 integrates seamlessly (ReleaseCardContent extends ScheduledContent)
- Ready for Phase 11 analytics integration

---
*Phase: 10-fan-tools*
*Completed: 2026-02-04*
