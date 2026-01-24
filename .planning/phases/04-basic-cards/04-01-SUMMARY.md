---
phase: 04-basic-cards
plan: 01
subsystem: ui
tags: [typescript, supabase-storage, react, next.js, image-upload]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Supabase client setup and authentication
  - phase: 03-canvas
    provides: Card types and data model
provides:
  - Card content type schemas (HeroCardContent, HorizontalLinkContent, SquareCardContent)
  - Supabase Storage upload infrastructure
  - Reusable ImageUpload component with preview
affects: [04-02, 04-03, 05-media-cards, 06-advanced-cards]

# Tech tracking
tech-stack:
  added: []
  patterns: [content schemas per card type, image upload with preview pattern]

key-files:
  created:
    - src/types/card.ts
    - src/lib/supabase/storage.ts
    - src/components/cards/image-upload.tsx
    - src/components/ui/textarea.tsx
  modified: []

key-decisions:
  - "Content schemas are card-type specific interfaces (not generic Record<string, unknown>)"
  - "5MB file size limit enforced client-side"
  - "Images organized by cardId/uuid.ext structure in storage"
  - "Orphaned images not deleted immediately (cleanup can happen later)"

patterns-established:
  - "ImageUpload component pattern: value/onChange props, aspect ratio support"
  - "Upload validation: file size + type checks before upload"
  - "Toast notifications for upload feedback"
  - "Preview with remove button (doesn't delete from storage)"

# Metrics
duration: 2min
completed: 2026-01-24
---

# Phase 04 Plan 01: Card Content Infrastructure Summary

**Card content type schemas with Supabase Storage image uploads and reusable ImageUpload component**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-24T12:34:45Z
- **Completed:** 2026-01-24T12:36:38Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Extended Card types with content schemas for hero, horizontal, and square card types
- Created Supabase Storage helper functions for uploading and deleting card images
- Built reusable ImageUpload component with file validation, preview, and remove functionality

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend Card Types with Content Schemas** - `9348674` (feat)
2. **Task 2: Create Supabase Storage Upload Helper** - `dcd319b` (feat)
3. **Task 3: Create ImageUpload Component** - `64dda1f` (feat)

## Files Created/Modified
- `src/types/card.ts` - Added HeroCardContent, HorizontalLinkContent, SquareCardContent interfaces with type guards
- `src/lib/supabase/storage.ts` - uploadCardImage and deleteCardImage functions with validation
- `src/components/cards/image-upload.tsx` - Reusable image upload component with preview and aspect ratio support
- `src/components/ui/textarea.tsx` - Added shadcn textarea component (dependency for future property editor)

## Decisions Made

**Content schema approach:** Card-type specific interfaces instead of generic Record<string, unknown>
- Rationale: Type safety for card components, clear contract for what each card type supports

**Upload organization:** Files stored as cardId/uuid.ext structure
- Rationale: Groups images by card for easier management, unique filenames prevent collisions

**Deferred deletion:** Remove button doesn't delete from storage
- Rationale: Orphan cleanup can happen via background job, avoids accidental data loss if user undos

**5MB limit client-side:** Validation before upload attempt
- Rationale: Better UX than server rejection, saves bandwidth

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed without issues.

## User Setup Required

**External services require manual configuration.** User must create Supabase Storage bucket before image uploads will work:

**Service:** Supabase Storage
**Why:** Image uploads for card content

**Dashboard Configuration:**
1. **Create 'card-images' bucket**
   - Location: Supabase Dashboard → Storage → New Bucket
   - Settings: Public bucket, no file size limit (we validate client-side)

2. **Add RLS policy for authenticated uploads**
   - Location: Supabase Dashboard → Storage → card-images → Policies
   - Settings: INSERT for authenticated users, SELECT for all (public)

**Verification:**
- Run ImageUpload component in editor
- Select image file
- Should upload successfully and display preview

## Next Phase Readiness

**Ready for Phase 4 continuation:**
- Card content types defined and ready for component implementation
- Image upload infrastructure working (pending Supabase bucket setup)
- ImageUpload component ready for use in property editors

**Blockers:**
- Supabase Storage bucket must be created manually (user setup required)

**Next steps:**
- Implement Hero Card component (Plan 04-02)
- Build property editor using ImageUpload component
- Create horizontal and square card components

---
*Phase: 04-basic-cards*
*Completed: 2026-01-24*
