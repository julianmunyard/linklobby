---
phase: 10-fan-tools
plan: 01
subsystem: ui, api, database
tags: [react, zod, supabase, email-collection, forms, react-hook-form]

# Dependency graph
requires:
  - phase: 09-platform-integrations
    provides: Card system, themed card wrapper, editor infrastructure
provides:
  - EmailCollectionCardContent type with customizable fields
  - CollectedEmail type for database records
  - POST /api/emails endpoint for public email submission
  - EmailCollectionCard component with form validation
  - EmailCollectionFields editor component
  - email-collection card type integrated into card picker and renderer
affects: [11-analytics, 12-monetization, fan-engagement, newsletter-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Public API endpoint pattern for visitor submissions
    - Card content defaults with fan-tools module
    - Form card with react-hook-form + zod validation

key-files:
  created:
    - src/types/fan-tools.ts
    - src/app/api/emails/route.ts
    - src/components/cards/email-collection-card.tsx
    - src/components/editor/email-collection-fields.tsx
    - src/types/mailchimp-marketing.d.ts
  modified:
    - src/types/card.ts
    - src/components/cards/card-renderer.tsx
    - src/components/editor/card-property-editor.tsx
    - src/components/editor/cards-tab.tsx
    - src/stores/page-store.ts

key-decisions:
  - "Email collection card is always full-width (null sizing) for optimal form UX"
  - "Form disabled in editor preview mode to prevent accidental submissions"
  - "Duplicate emails handled gracefully - returns success with alreadySubscribed flag"
  - "SQL migration documented in comments - user runs manually"

patterns-established:
  - "Fan tools types in dedicated src/types/fan-tools.ts module"
  - "Public API endpoints for visitor actions (no auth required)"
  - "Card content defaults exported from type modules"

# Metrics
duration: 5min
completed: 2026-02-04
---

# Phase 10 Plan 01: Email Collection Card Summary

**Email collection card type with customizable form, API endpoint, and editor integration for capturing fan emails**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-04T14:21:28Z
- **Completed:** 2026-02-04T14:26:21Z
- **Tasks:** 3
- **Files modified:** 10 (5 created, 5 modified)

## Accomplishments

- Created EmailCollectionCardContent and CollectedEmail types with full schema documentation
- Implemented POST /api/emails public endpoint with Zod validation and duplicate handling
- Built EmailCollectionCard component with react-hook-form validation and success states
- Integrated email-collection into card picker, renderer, and property editor
- Added default content for email-collection cards in page-store

## Task Commits

Each task was committed atomically:

1. **Task 1: Email collection types and database schema** - `e938488` (feat)
2. **Task 2: Email collection API endpoint** - `13caf2c` (feat)
3. **Task 3: Email collection card and editor integration** - `0341eac` (feat)

**Plan metadata:** (pending)

## Files Created/Modified

- `src/types/fan-tools.ts` - CollectedEmail and EmailCollectionCardContent types, SQL migration docs
- `src/types/card.ts` - Added email-collection to CardType, sizing, no-image arrays, type guard
- `src/app/api/emails/route.ts` - POST endpoint for email submission
- `src/components/cards/email-collection-card.tsx` - Form card component with validation
- `src/components/editor/email-collection-fields.tsx` - Editor fields for customization
- `src/components/cards/card-renderer.tsx` - Added email-collection case
- `src/components/editor/card-property-editor.tsx` - Added EmailCollectionFields
- `src/components/editor/cards-tab.tsx` - Added Email Collection to card picker
- `src/stores/page-store.ts` - Added default content for email-collection
- `src/types/mailchimp-marketing.d.ts` - Type declarations for mailchimp package (blocking fix)

## Decisions Made

- Email collection card is always full-width to provide optimal space for form fields
- Form is disabled in editor preview mode - prevents accidental test submissions
- Duplicate email submissions handled gracefully (200 with alreadySubscribed flag) rather than error
- SQL migration documented in code comments for user to run manually in Supabase

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added type declarations for @mailchimp/mailchimp_marketing**
- **Found during:** Task 3 (build verification)
- **Issue:** Pre-existing mailchimp.ts file had type error blocking build
- **Fix:** Created src/types/mailchimp-marketing.d.ts with minimal declarations
- **Files modified:** src/types/mailchimp-marketing.d.ts (new)
- **Verification:** npm run build completes successfully
- **Committed in:** 0341eac (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Type declaration needed to unblock build. No scope creep.

## Issues Encountered

None - plan executed smoothly after fixing the blocking type error.

## User Setup Required

**Database migration required.** Run this SQL in Supabase SQL Editor:

```sql
CREATE TABLE collected_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  source_card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  synced_to_mailchimp BOOLEAN DEFAULT FALSE,
  mailchimp_sync_at TIMESTAMPTZ,
  UNIQUE(page_id, email)
);

CREATE INDEX idx_collected_emails_page_id ON collected_emails(page_id);
ALTER TABLE collected_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their page emails" ON collected_emails
  FOR SELECT USING (page_id IN (SELECT id FROM pages WHERE user_id = auth.uid()));

CREATE POLICY "Public can insert emails" ON collected_emails
  FOR INSERT WITH CHECK (true);
```

## Next Phase Readiness

- Email collection card is fully functional for capturing emails
- Ready for Phase 10 Plan 02: Email list viewing and export
- Mailchimp sync fields are in place for future newsletter integration
- Fan engagement foundation established for analytics and monetization phases

---
*Phase: 10-fan-tools*
*Completed: 2026-02-04*
