---
phase: 10-fan-tools
plan: 02
subsystem: ui, api
tags: [react-qr-code, mailchimp, csv-export, fan-engagement]

# Dependency graph
requires:
  - phase: 10-fan-tools
    provides: Phase context and CollectedEmail type from plan 01
provides:
  - QR code generation dialog with SVG/PNG export
  - Email CSV export functionality
  - Mailchimp sync integration
  - Settings tab in editor panel
affects: [11-release-scheduling, future-analytics]

# Tech tracking
tech-stack:
  added: [react-qr-code, @mailchimp/mailchimp_marketing]
  patterns: [fan-tools-lib-pattern, api-ownership-verification]

key-files:
  created:
    - src/components/fan-tools/qr-code-dialog.tsx
    - src/components/fan-tools/email-export.tsx
    - src/components/fan-tools/mailchimp-settings.tsx
    - src/lib/fan-tools/csv-export.ts
    - src/lib/fan-tools/mailchimp.ts
    - src/app/api/emails/export/route.ts
    - src/app/api/mailchimp/sync/route.ts
    - src/app/api/page/route.ts
    - src/components/editor/settings-tab.tsx
  modified:
    - package.json
    - src/components/editor/editor-panel.tsx

key-decisions:
  - "Store Mailchimp list ID in localStorage per page (no database schema change)"
  - "PNG export enforces minimum 1024px for print quality"
  - "Settings tab added to editor panel (4th tab after Schedule)"

patterns-established:
  - "Fan tools library pattern: src/lib/fan-tools/*.ts for reusable utilities"
  - "API ownership verification: check page.user_id === user.id before data access"

# Metrics
duration: 4min
completed: 2026-02-04
---

# Phase 10 Plan 02: QR Code and Email Tools Summary

**QR code generation with download options, email CSV export, and Mailchimp sync integration accessible from editor Settings tab**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-04T14:22:18Z
- **Completed:** 2026-02-04T14:26:28Z
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments

- QR code dialog with SVG and PNG download at multiple sizes (256/512/1024px)
- Color scheme options: black on white, white on black, theme colors
- Email export API with ownership verification and CSV download
- Mailchimp sync with batch processing and "Member Exists" handling
- Settings tab added to editor with all fan tools in one place

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create QR code dialog** - `9908c3a` (feat)
2. **Task 2: Email export API and CSV utility** - `f4f8f56` (feat)
3. **Task 3: Mailchimp sync and settings integration** - `74bb547` (feat)

## Files Created/Modified

- `package.json` - Added react-qr-code and @mailchimp/mailchimp_marketing dependencies
- `src/components/fan-tools/qr-code-dialog.tsx` - QR code generation modal with download
- `src/lib/fan-tools/csv-export.ts` - CSV generation utility with proper escaping
- `src/app/api/emails/export/route.ts` - GET endpoint for fetching emails
- `src/components/fan-tools/email-export.tsx` - Email count display and export button
- `src/lib/fan-tools/mailchimp.ts` - Mailchimp client and addSubscriber function
- `src/app/api/mailchimp/sync/route.ts` - POST endpoint for batch email sync
- `src/components/fan-tools/mailchimp-settings.tsx` - List ID input and sync button
- `src/app/api/page/route.ts` - GET endpoint for user page info
- `src/components/editor/settings-tab.tsx` - Settings tab with fan tools section
- `src/components/editor/editor-panel.tsx` - Added Settings tab to editor

## Decisions Made

- **Mailchimp list ID storage:** Using localStorage per page rather than adding database column (simpler, no migration needed, user can change easily)
- **PNG export size:** Enforcing minimum 1024px regardless of selected size ensures print quality
- **Settings tab placement:** Added as 4th tab after Schedule, grouping all fan engagement tools together
- **API pattern:** All fan tool APIs verify page ownership before allowing data access

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created /api/page endpoint**
- **Found during:** Task 3 (Settings tab needed page ID and username)
- **Issue:** No existing API to get user's page info
- **Fix:** Created /api/page route returning page ID
- **Files modified:** src/app/api/page/route.ts
- **Verification:** Build succeeds, API returns page data
- **Committed in:** 74bb547 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary for settings tab to function. No scope creep.

## Issues Encountered

None - plan executed as expected with one minor addition.

## User Setup Required

**Mailchimp integration requires manual configuration.** To enable Mailchimp sync:

1. Get your Mailchimp API key from: Mailchimp Dashboard > Account > Extras > API keys
2. Add to environment variables:
   ```
   MAILCHIMP_API_KEY=your-api-key-here
   MAILCHIMP_SERVER_PREFIX=us19  # Last part of your API key (e.g., 'us19' from 'xxx-us19')
   ```
3. Find your List ID in Mailchimp: Audience > Settings > Audience name and defaults
4. Enter the List ID in the Settings tab and click "Sync to Mailchimp"

## Next Phase Readiness

- All fan tools functional and accessible from Settings tab
- QR code works without any external dependencies
- Email export works with existing collected_emails table
- Mailchimp sync ready when env vars are configured
- Ready for Phase 10 Plan 03 (if exists) or Phase 11

---
*Phase: 10-fan-tools*
*Completed: 2026-02-04*
