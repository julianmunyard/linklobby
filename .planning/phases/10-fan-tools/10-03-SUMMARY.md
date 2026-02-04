---
phase: 10-fan-tools
plan: 03
subsystem: scheduling
tags: [scheduling, card-content, filtering, datetime, timezone]

dependency-graph:
  requires: []
  provides:
    - ScheduledContent interface with publishAt/expireAt
    - isScheduled() and getScheduleStatus() helpers
    - Schedule tab in editor with date controls
    - Schedule badges on preview cards
    - Public page filtering by schedule

tech-stack:
  added:
    - shadcn Badge component
  patterns:
    - Mixin interface for optional scheduling fields
    - UTC storage with local display via Intl.DateTimeFormat
    - datetime-local inputs with conversion helpers

file-tracking:
  key-files:
    created:
      - src/components/editor/schedule-tab.tsx
      - src/components/editor/schedule-card-item.tsx
      - src/components/ui/badge.tsx
    modified:
      - src/types/card.ts
      - src/components/editor/editor-panel.tsx
      - src/components/canvas/preview-sortable-card.tsx
      - src/components/canvas/sortable-card.tsx
      - src/lib/supabase/public.ts

decisions:
  - id: scheduled-content-mixin
    choice: Mixin interface for scheduling fields
    rationale: Any card type can be scheduled without modifying content types
  - id: utc-storage
    choice: Store ISO 8601 UTC timestamps
    rationale: Consistent server-side filtering, display in user's local timezone
  - id: local-datetime-input
    choice: datetime-local HTML input with conversion
    rationale: Native browser UI with timezone-aware conversion

metrics:
  tasks-completed: 3
  tasks-total: 3
  duration: 4 minutes
  completed: 2026-02-04
---

# Phase 10 Plan 03: Link Scheduling Summary

Scheduling infrastructure allowing artists to control when cards appear on their public page via publishAt and expireAt timestamps.

## What Was Built

### 1. Scheduling Type System
- **ScheduledContent interface** - Mixin with optional `publishAt` and `expireAt` ISO 8601 timestamps
- **isScheduled()** - Check if card has any scheduling
- **getScheduleStatus()** - Returns `'scheduled' | 'active' | 'expired' | null`

### 2. Schedule Tab
- New tab in editor panel with Calendar icon
- Cards categorized into Scheduled, Active, and Expired sections
- **ScheduleCardItem** component with:
  - Card title and type display
  - Status badge (Scheduled/Active with expiry/Expired/Always visible)
  - datetime-local inputs for publish and expire dates
  - Clear buttons to remove scheduling
  - Timezone conversion (local input to UTC storage)

### 3. Schedule Badges
- Preview cards show schedule status badges:
  - Blue "Scheduled [date]" for future cards
  - Orange "Expires [date]" for active cards with expiry
  - Gray "Expired" for past cards
- Cards list shows schedule indicator icons with tooltips:
  - Clock icon (blue) for scheduled
  - Clock icon (orange) for expiring
  - Warning icon (gray) for expired

### 4. Public Page Filtering
- Cards with `publishAt` in future are hidden
- Cards with `expireAt` in past are hidden
- Filter applied server-side in fetchPublicPageData

## Key Patterns

### Timezone Handling
```typescript
// Store in UTC
const parseInputToIso = (localDatetime: string) => new Date(localDatetime).toISOString()

// Display in local
const formatDateDisplay = (iso: string) => new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short"
}).format(new Date(iso))
```

### Schedule Status Logic
```typescript
const now = new Date().toISOString()
if (publishAt && publishAt > now) return 'scheduled'
if (expireAt && expireAt < now) return 'expired'
if (publishAt || expireAt) return 'active'
return null
```

## Commits

| Hash | Type | Description |
|------|------|-------------|
| f2cd74c | feat | Add scheduling fields to card content type |
| e611108 | feat | Create Schedule tab and card item components |
| 5b05964 | feat | Add schedule badges and public page filtering |

## Deviations from Plan

### Rule 3 - Blocking Issue
**Badge component missing:** The Badge component from shadcn was not installed. Installed via `npx shadcn add badge` to unblock ScheduleCardItem styling.

## Verification

- [x] TypeScript compilation passes
- [x] Schedule tab shows all cards with timing controls
- [x] Datetime inputs work with proper timezone handling
- [x] Badges display correctly for scheduled/expired cards
- [x] Public page filters out scheduled-future and expired cards
- [x] Build completes successfully

## Next Phase Readiness

**Ready for Plan 04:** Enhanced visibility toggle with schedule awareness. The scheduling infrastructure is complete and can be extended with more visibility controls.
