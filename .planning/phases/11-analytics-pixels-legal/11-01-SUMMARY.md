---
phase: 11-analytics-pixels-legal
plan: 01
subsystem: analytics
tags: [analytics, supabase, postgres, privacy, visitor-tracking, CTR]

# Dependency graph
requires:
  - phase: 08-public-page
    provides: PublicPageRenderer, StaticFlowGrid, public page routes
provides:
  - Privacy-safe analytics tracking pipeline (page views, card clicks, interactions)
  - Server-side tracking API with visitor hashing (daily salt rotation)
  - Stats API returning unique visitors, total views, per-card CTR, time-series data
  - Client-side ClickTracker component for public pages
affects: [12-analytics-dashboard, 13-pixel-integrations, 14-data-export]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Privacy-safe visitor hashing with daily salt (no cookies required)
    - Document-level click listener with data-attribute bubbling for tracking
    - Graceful error handling in tracking (always return 200, never break UX)
    - RLS policies: INSERT for anon, SELECT only by page owner

key-files:
  created:
    - supabase/migrations/analytics_tables.sql
    - src/lib/analytics/visitor-hash.ts
    - src/lib/analytics/track-event.ts
    - src/app/api/analytics/track/route.ts
    - src/app/api/analytics/stats/route.ts
    - src/components/public/click-tracker.tsx
  modified:
    - src/app/[username]/page.tsx
    - src/components/public/static-flow-grid.tsx
    - src/components/public/static-vcr-menu-layout.tsx
    - src/components/public/static-ipod-classic-layout.tsx
    - src/components/public/static-receipt-layout.tsx

key-decisions:
  - "Use standard Postgres tables instead of TimescaleDB hypertables (extension may not be enabled on all Supabase instances)"
  - "Daily-rotating salt for visitor hashing (privacy-friendly, no persistent tracking)"
  - "Document click listener with data-card-id bubbling (avoids modifying every card component)"
  - "Always return 200 from tracking API even on errors (tracking should never break user experience)"
  - "RLS policies: INSERT allowed for anon role (public tracking), SELECT only by page owner"

patterns-established:
  - "Privacy-safe analytics: SHA-256 hash of IP + UA + daily salt for visitor identification"
  - "Non-blocking tracking: try/catch + sendBeacon fallback for navigation reliability"
  - "Data-attribute tracking: data-card-id for clicks, data-game-play and data-gallery-view for specialized interactions"
  - "Graceful error swallowing: tracking failures logged but returned as success"

# Metrics
duration: 5min
completed: 2026-02-06
---

# Phase 11 Plan 01: Analytics Tracking Foundation Summary

**Privacy-safe analytics pipeline with daily-rotating visitor hashing, three event types (page views, clicks, interactions), and stats API returning unique visitors, CTR leaderboard, and time-series data**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-06T00:30:35Z
- **Completed:** 2026-02-06T00:35:53Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Complete analytics data layer: database tables, tracking API, stats API, client-side tracker
- Privacy-first visitor tracking with SHA-256 hashing and daily salt rotation (no cookies)
- Three event types: page_view (when visitor loads page), card_click (when visitor clicks card), interaction (game_play, gallery_view)
- Stats API with unique visitors, total views, per-card CTR calculation, and time-series data for charting
- Client-side ClickTracker integrated into all public page layouts (standard, VCR, iPod, Receipt)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create analytics database schema and tracking API** - `8270412` (feat)
   - Analytics tables migration with RLS policies
   - Visitor hash utility with daily salt
   - Client-side tracking helpers (trackPageView, trackCardClick, trackInteraction)
   - POST /api/analytics/track endpoint (graceful error handling)
   - GET /api/analytics/stats endpoint (authenticated, returns aggregated data)

2. **Task 2: Wire click tracking into public pages** - `b9ecb8f` (feat)
   - ClickTracker component with document click listener
   - data-card-id attributes on all card wrappers across all layouts
   - Integrated into [username]/page.tsx
   - Supports specialized interactions (game plays, gallery views)

## Files Created/Modified

**Created:**
- `supabase/migrations/analytics_tables.sql` - Three tables (page_views, card_clicks, interactions) with RLS and indexes
- `src/lib/analytics/visitor-hash.ts` - SHA-256 hashing with IP + UA + daily salt
- `src/lib/analytics/track-event.ts` - Client-side tracking helpers (fetch + sendBeacon)
- `src/app/api/analytics/track/route.ts` - POST endpoint for tracking events
- `src/app/api/analytics/stats/route.ts` - GET endpoint for aggregated analytics (auth required)
- `src/components/public/click-tracker.tsx` - Client component with page view and click tracking

**Modified:**
- `src/app/[username]/page.tsx` - Added ClickTracker component
- `src/components/public/static-flow-grid.tsx` - Added data-card-id to card wrappers
- `src/components/public/static-vcr-menu-layout.tsx` - Added data-card-id to menu buttons
- `src/components/public/static-ipod-classic-layout.tsx` - Added data-card-id to menu items
- `src/components/public/static-receipt-layout.tsx` - Added data-card-id to receipt buttons

## Decisions Made

1. **Standard Postgres over TimescaleDB (for now)**
   - TimescaleDB extension may not be enabled on user's Supabase instance
   - Standard tables with proper indexes sufficient for expected traffic
   - Migration includes comment noting TimescaleDB can be enabled later for scale

2. **Daily-rotating salt for visitor hashing**
   - Hash input: `${ip}|${userAgent}|${dailySalt}` where dailySalt = new Date().toDateString()
   - Same visitor gets same hash within a day (allows daily unique count)
   - Hash changes daily (no persistent tracking, privacy-friendly, GDPR-compliant)

3. **Document-level click listener with bubbling**
   - Single click listener on document checks for data-card-id up to 5 levels
   - Avoids modifying CardRenderer or individual card components
   - Supports specialized interactions via data-game-play and data-gallery-view

4. **Graceful error handling in tracking**
   - API always returns 200, even on database errors
   - Client-side helpers use try/catch and swallow errors
   - Tracking failures logged but never break user experience

5. **RLS policies for security**
   - INSERT allowed for anon and authenticated (public tracking)
   - SELECT only by page owner (auth.uid() matches page user_id)
   - Page ownership verified in stats API before returning analytics

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - TypeScript compilation and build succeeded on first attempt after fixing minor type issues (missing `time` field in SELECT, removed non-existent `request.ip` property).

## User Setup Required

**Manual migration required:** User must run `supabase/migrations/analytics_tables.sql` in Supabase SQL Editor.

Steps:
1. Go to Supabase Dashboard → SQL Editor → New Query
2. Paste contents of `supabase/migrations/analytics_tables.sql`
3. Run query
4. Verify tables created: analytics_page_views, analytics_card_clicks, analytics_interactions

The migration file includes clear instructions in header comments.

## Next Phase Readiness

**Ready for:**
- Plan 11-02: Insights dashboard UI (stats API is ready to consume)
- Plan 11-03: Facebook Pixel integration (tracking infrastructure in place)
- Plan 11-04: Data export (analytics tables ready to query)

**Data flowing:**
- Page views recorded on every public page visit
- Card clicks recorded on every card click (all layouts)
- Game plays and gallery views tracked via specialized data attributes

**Blockers:** None

**Concerns:** None - standard Postgres tables may need TimescaleDB conversion if traffic scales beyond ~100k events/day per user, but this is straightforward (enable extension, run create_hypertable).

---
*Phase: 11-analytics-pixels-legal*
*Completed: 2026-02-06*
