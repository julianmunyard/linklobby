---
phase: quick
plan: 018
subsystem: profile-editor
tags: [ui, profile, image-effects]
tech-stack:
  added: []
  patterns:
    - css-mask-image-for-image-effects
    - radial-gradient-feathering
key-files:
  created:
    - supabase/migrations/20260127_add_avatar_feather.sql
  modified:
    - src/types/profile.ts
    - src/stores/profile-store.ts
    - src/components/editor/header-section.tsx
    - src/components/preview/profile-header.tsx
    - src/app/api/profile/route.ts
decisions:
  - slug: radial-gradient-for-feather
    title: Use CSS mask-image with radial-gradient for feather effect
    rationale: Pure CSS solution performs better than canvas manipulation, works with any image format
  - slug: feather-classic-only
    title: Apply feather only to classic layout circular avatar
    rationale: Hero layout is a banner - feathering doesn't provide visual benefit for rectangular banners
  - slug: 0-100-range-5-step
    title: Feather range 0-100% with 5% steps
    rationale: Provides fine control without overwhelming options, matches logoScale pattern
metrics:
  duration: 1m 55s
  completed: 2026-01-27
---

# Quick Task 018: Add Feather Effect Slider to Profile Photo

**One-liner:** Edge feathering slider for profile avatar using CSS mask-image radial gradient

## What Was Built

Added a feather effect control to the profile photo editor that allows users to soften/blur the edges of their circular profile avatar.

### Features

1. **Edge Feather Slider**
   - 0-100% range with 5% step increments
   - Only visible when avatar is uploaded and visible
   - Real-time preview of feather effect

2. **CSS Mask-Image Effect**
   - Uses `radial-gradient()` for smooth edge feathering
   - Pure CSS solution - no canvas manipulation
   - Works with all image formats

3. **Layout-Specific Application**
   - Classic layout: Feather applied to circular avatar
   - Hero layout: Feather skipped (banner doesn't benefit)

## Tasks Completed

| Task | Name | Commit | Duration |
|------|------|--------|----------|
| 1 | Add avatarFeather to Profile type and store | 5f412d8 | ~1 min |
| 2 | Add feather slider to header editor and apply effect | c09109b | ~1 min |

### Task 1: Add avatarFeather to Profile type and store

**Changes:**
- Added `avatarFeather: number` field to Profile interface (0-100 range)
- Added `setAvatarFeather` action to profile store
- Updated API route to read/write `avatar_feather` column
- Created database migration with range constraint

**Files:**
- `src/types/profile.ts` - Added avatarFeather field with comment
- `src/stores/profile-store.ts` - Added state, action, and getSnapshot inclusion
- `src/app/api/profile/route.ts` - Added mapping for GET/POST
- `supabase/migrations/20260127_add_avatar_feather.sql` - New migration file

### Task 2: Add feather slider to header editor and apply effect

**Changes:**
- Added Edge Feather slider to Profile Photo collapsible section
- Slider conditionally rendered when avatar is uploaded and visible
- Applied radial gradient mask to classic layout avatar
- Hero layout skips feather effect

**Files:**
- `src/components/editor/header-section.tsx` - Added slider UI
- `src/components/preview/profile-header.tsx` - Applied mask-image effect

**Implementation:**
```tsx
// Feather mask calculation
const featherMask = avatarFeather > 0
  ? `radial-gradient(circle, black ${100 - avatarFeather}%, transparent 100%)`
  : undefined

// Applied to avatar img element
style={{
  WebkitMaskImage: featherMask,
  maskImage: featherMask,
}}
```

## Technical Implementation

### CSS Mask-Image Approach

The feather effect uses CSS `mask-image` with a radial gradient:

1. **Gradient calculation**: `radial-gradient(circle, black ${100 - feather}%, transparent 100%)`
2. **Effect**: Center remains fully opaque (black), edges fade to transparent
3. **Performance**: Pure CSS, no JavaScript image manipulation
4. **Compatibility**: WebKit prefix for Safari support

### Database Schema

```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_feather INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_avatar_feather_range CHECK (avatar_feather >= 0 AND avatar_feather <= 100);
```

## Decisions Made

### 1. Radial Gradient for Feather Effect

**Decision:** Use CSS `mask-image` with `radial-gradient()` instead of canvas manipulation

**Rationale:**
- Pure CSS solution performs better than JavaScript canvas operations
- Works seamlessly with all image formats
- Real-time updates without re-rendering
- Browser-native anti-aliasing produces smooth results

**Alternatives considered:**
- Canvas blur filter: More CPU intensive, requires image re-processing
- SVG mask: More complex to implement, similar performance

### 2. Feather Classic Layout Only

**Decision:** Apply feather only to classic layout circular avatar, skip hero layout

**Rationale:**
- Classic layout uses circular avatar - feathering enhances the circular aesthetic
- Hero layout is a rectangular banner - feathering edges looks odd on rectangles
- Simplifies implementation and user mental model

### 3. 0-100 Range with 5% Steps

**Decision:** Feather range 0-100% with 5% step increments

**Rationale:**
- Matches existing `logoScale` slider pattern for consistency
- 21 steps (0, 5, 10, ..., 100) provides fine control without overwhelming
- 5% increments produce visually distinct results
- 0% = no feather (sharp edges), 100% = maximum feather

## Deviations from Plan

None - plan executed exactly as written.

## Verification

✅ TypeScript compiles without errors: `npx tsc --noEmit`
✅ All files created and modified as expected
✅ Migration file created with correct SQL syntax
✅ Store actions properly update hasChanges flag
✅ API route handles avatarFeather field bidirectionally

## Next Phase Readiness

**Status:** ✅ Complete - no blockers

This quick task is self-contained and doesn't affect other systems. The feature is ready for:
- Manual testing in local development
- Database migration application
- User feedback on feather effect aesthetic

**Testing recommendations:**
1. Upload avatar photo
2. Adjust feather slider from 0-100%
3. Observe real-time edge softening in preview
4. Save profile and refresh - verify feather persists
5. Toggle between classic/hero layout - verify feather only applies to classic

## Related Work

- **Phase 4.4 (Profile Editor)**: Original profile photo upload and crop functionality
- **Quick-014**: Click card image to open crop/edit dialog (similar image editing UX pattern)

## Future Enhancements

Potential improvements for future iterations:

1. **Feather for Hero Layout**: Apply linear gradient feather to banner edges if user feedback indicates value
2. **Feather Preview in Crop Dialog**: Show feather effect during crop for immediate feedback
3. **Preset Feather Values**: Quick buttons for common values (0%, 25%, 50%, 75%)
4. **Feather Shape Options**: Support elliptical or rectangular feather shapes for hero layout

---

**Completed:** 2026-01-27
**Duration:** 1 minute 55 seconds
**Commits:** 2 (task) + 0 (metadata) = 2 total
