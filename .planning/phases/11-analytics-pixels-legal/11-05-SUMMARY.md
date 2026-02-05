---
phase: 11-analytics-pixels-legal
plan: 05
subsystem: legal
tags: [gdpr, data-export, account-deletion, jszip, privacy]

# Dependency graph
requires:
  - phase: 11-01
    provides: Analytics database tables (analytics_page_views, analytics_card_clicks)
  - phase: 10-01
    provides: Email collection infrastructure (collected_emails table)
provides:
  - GDPR-compliant data export as ZIP download (all user data in JSON + images)
  - Account deletion API with 30-day grace period and recovery
  - Data & Privacy section in Settings tab
  - SQL migration for account deletion columns (deleted_at, deletion_scheduled_for, is_active)
affects: [future-admin-dashboard, data-retention-policies, backup-systems]

# Tech tracking
tech-stack:
  added: [jszip, @types/jszip]
  patterns: [data-export-pattern, soft-delete-with-grace-period, username-confirmation-for-destructive-actions]

key-files:
  created:
    - src/lib/legal/export-user-data.ts
    - src/app/api/legal/export-data/route.ts
    - src/app/api/legal/delete-account/route.ts
    - src/components/settings/data-privacy-section.tsx
    - supabase/migrations/20260206_account_deletion_columns.sql
  modified:
    - src/components/editor/settings-tab.tsx

key-decisions:
  - "JSZip for data export instead of server-side archiving - client-side generation reduces server load"
  - "30-day grace period for account deletion following industry best practice"
  - "Username confirmation required for deletion to prevent accidental loss"
  - "Analytics export aggregated only - raw visitor hashes excluded for third-party privacy"
  - "Immediate unpublish on deletion request - page becomes inaccessible during grace period"

patterns-established:
  - "Data export pattern: exportUserData() returns ZIP with JSON files + images from storage"
  - "Soft delete pattern: deleted_at + deletion_scheduled_for + is_active for recoverable deletion"
  - "Destructive action confirmation: require username match in AlertDialog before delete"

# Metrics
duration: 3.6min
completed: 2026-02-06
---

# Phase 11 Plan 05: GDPR Data Export & Account Deletion Summary

**GDPR-compliant ZIP data export with profile/cards/analytics/emails, account deletion with 30-day recovery grace period, username confirmation for safety**

## Performance

- **Duration:** 3.6 min
- **Started:** 2026-02-06T10:21:56Z
- **Completed:** 2026-02-06T10:25:30Z
- **Tasks:** 2
- **Files created:** 5
- **Files modified:** 1

## Accomplishments
- Complete data export system generating ZIP with profile, page config, cards, analytics summary, collected emails, and all images
- Account deletion API with 30-day grace period, immediate unpublish, and recovery endpoint
- Data & Privacy section in Settings tab with download and delete account UI
- SQL migration for account deletion columns (deleted_at, deletion_scheduled_for, is_active)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create data export and account deletion API routes** - `e1e1dc7` (feat)
2. **Task 2: Create data & privacy UI section in Settings tab** - `a922ead` (feat)

## Files Created/Modified

**Created:**
- `supabase/migrations/20260206_account_deletion_columns.sql` - Adds deleted_at, deletion_scheduled_for, is_active columns to profiles table
- `src/lib/legal/export-user-data.ts` - exportUserData() function generates ZIP with all user data (profile, page, cards, analytics, emails, images)
- `src/app/api/legal/export-data/route.ts` - GET endpoint streams ZIP download with Content-Disposition header
- `src/app/api/legal/delete-account/route.ts` - POST initiates deletion with username confirmation, PATCH recovers account during grace period
- `src/components/settings/data-privacy-section.tsx` - Data & Privacy UI with download and delete account cards, username confirmation dialog

**Modified:**
- `src/components/editor/settings-tab.tsx` - Added Data & Privacy collapsible section with Shield icon

## Decisions Made

**1. JSZip for client-side export generation**
- Server generates ZIP in memory and streams to client
- Avoids temporary file storage on server
- Client downloads immediately via Content-Disposition attachment

**2. Analytics export aggregated counts only**
- Total page views and card clicks included
- Raw visitor hashes excluded for third-party privacy protection
- README explains privacy-safe export approach

**3. 30-day grace period for account deletion**
- Industry best practice (GitHub, Google use similar periods)
- Prevents permanent accidental data loss
- User can log in during grace period to recover account

**4. Username confirmation required**
- Prevents accidental deletion
- User must type exact username in AlertDialog
- Delete button disabled until username matches

**5. Immediate unpublish on deletion request**
- Page set to is_published = false immediately
- Account set to is_active = false
- User cannot access editor during grace period (must recover first)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**TypeScript type error with NextResponse body**
- Issue: Uint8Array not assignable to NextResponse body parameter
- Solution: Wrapped with Buffer.from() for proper type compatibility
- Fixed in Task 1 commit

## User Setup Required

**Manual SQL migration required.** User must run the SQL migration in Supabase SQL Editor:
- File: `supabase/migrations/20260206_account_deletion_columns.sql`
- Adds: deleted_at, deletion_scheduled_for, is_active columns to profiles table
- Creates index: idx_profiles_deletion_scheduled for cleanup job queries

The migration file includes clear comments noting it must be run manually.

## Next Phase Readiness

- GDPR data export and account deletion complete
- Settings tab now has comprehensive data & privacy controls
- Ready for analytics dashboard UI (Phase 11 remaining plans)
- Consider: Background job for permanent deletion after 30 days (future enhancement)

**Recommended:** Set up periodic cleanup job to check deletion_scheduled_for dates and permanently delete expired accounts. This is not required for MVP but should be added before public launch.

---
*Phase: 11-analytics-pixels-legal*
*Completed: 2026-02-06*
