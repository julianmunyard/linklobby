---
phase: 08-public-page
plan: 02
subsystem: rendering
tags: [nextjs, ssr, server-components, public-page, static-render]

dependency-graph:
  requires:
    - "07-*: Theme system for card styling"
    - "06-*: All card types (hero, square, gallery, video, game, etc.)"
    - "04-*: Card type definitions and flow layout"
  provides:
    - "Static rendering components for public pages"
    - "Server-side profile header rendering"
    - "Non-interactive card grid"
  affects:
    - "08-03: Dynamic route will use PublicPageRenderer"
    - "08-04: Theme application will wrap these components"

tech-stack:
  added: []
  patterns:
    - "Server Components (no 'use client')"
    - "Props-based rendering (no client stores)"
    - "Next.js Image optimization with priority"

key-files:
  created:
    - src/components/public/static-flow-grid.tsx
    - src/components/public/static-profile-header.tsx
    - src/components/public/public-page-renderer.tsx
  modified: []

decisions:
  - id: server-components-only
    decision: Use Server Components without client-side JavaScript
    rationale: Public pages should be fast, SEO-friendly, and work without JavaScript
    alternatives: Could have used client components with SSR
    impact: Better performance, simpler code, automatic optimization

  - id: reuse-card-renderer
    decision: Reuse existing CardRenderer component with isPreview flag
    rationale: Cards already work in preview mode, same behavior needed for public
    alternatives: Could have created separate public card components
    impact: Less code duplication, consistent rendering

  - id: props-vs-stores
    decision: Pass all data as props instead of using Zustand stores
    rationale: Server Components can't access client-side stores
    alternatives: Could have made components client-side to use stores
    impact: Clear data flow, easier to test, better for SSR

metrics:
  duration: 2.5 minutes
  commits: 3
  files-created: 3
  files-modified: 0
  completed: 2026-02-03
---

# Phase 8 Plan 2: Static Render Components Summary

**One-liner:** Server-rendered React components for public pages (StaticFlowGrid, StaticProfileHeader, PublicPageRenderer) with zero client-side JavaScript

## What Was Built

Created three Server Components for rendering public LinkLobby pages:

1. **StaticFlowGrid**: Non-interactive card grid
   - Filters hidden cards (`is_visible = false`)
   - Sorts by `sortKey` for correct ordering
   - Flow layout: big cards 100% width, small cards 50%
   - No dnd-kit, no drag handlers, no selection state
   - Pure render - maps cards to CardRenderer

2. **StaticProfileHeader**: Server-rendered profile header
   - Receives all data as props (no Zustand stores)
   - Parses `social_icons` JSON from database
   - Supports Classic (circle avatar) and Hero (banner) layouts
   - Uses Next/Image with `priority` for LCP optimization
   - Handles avatar feathering, logo scaling, fuzzy text

3. **PublicPageRenderer**: Complete page composition
   - Composes StaticProfileHeader + StaticFlowGrid
   - Uses `max-w-2xl` container (matches editor preview)
   - Consistent spacing with padding and gaps
   - Entry point for public page route

## Key Technical Details

**Server Components Pattern:**
- No `"use client"` directive - fully server-rendered
- Props-based data flow (no client stores)
- Automatic Next.js optimization
- Works without JavaScript enabled

**Performance Optimizations:**
- Next/Image with `priority` on above-the-fold images
- No client-side hydration overhead
- Minimal JavaScript bundle (only interactive cards if needed)

**Rendering Behavior:**
- Cards render in sortKey order (fractional indexing)
- Hidden cards filtered out server-side
- Theme styles applied via CSS variables
- Responsive flow layout (2-column on mobile+)

## Code Quality

**TypeScript:**
- All props strictly typed
- Reuses existing type definitions (Card, SocialIcon)
- No type errors in compilation

**Consistency:**
- Matches editor preview layout exactly
- Reuses CardRenderer for consistent card appearance
- Same spacing, sizing, and visual patterns

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Blockers:** None

**Ready for 08-03:** Dynamic route can now import PublicPageRenderer and fetch data server-side

**Notes:**
- These components expect theme CSS variables to be present (applied in 08-04)
- Social icons card will render if included in cards array
- Profile social icons (header) are stored separately from social icons card

## Testing Notes

**Verified:**
- ✅ All three files created
- ✅ TypeScript compiles without errors
- ✅ No "use client" directives (Server Components)
- ✅ All exports present and correct
- ✅ Imports resolve correctly

**Manual testing needed in 08-03:**
- Actual rendering with real database data
- Theme variable application
- Image loading and optimization
- Responsive layout on different screen sizes
- Hidden card filtering
- Card sorting order

## Performance Characteristics

**Expected Metrics:**
- **LCP:** < 2.5s (with Next/Image priority)
- **TTI:** < 3.5s (minimal JavaScript)
- **Bundle Size:** +~2KB (these components only)
- **Server Render:** < 100ms (simple component tree)

## Files Created

```
src/components/public/
├── static-flow-grid.tsx          (54 lines)
├── static-profile-header.tsx     (214 lines)
└── public-page-renderer.tsx      (84 lines)
```

**Total:** 352 lines of production code

## Commits

| Task | Commit  | Description                             |
| ---- | ------- | --------------------------------------- |
| 1    | 007e789 | Create StaticFlowGrid component         |
| 2    | 332df1c | Create StaticProfileHeader component    |
| 3    | d0938eb | Create PublicPageRenderer component     |

## Related Documentation

- Plan: `.planning/phases/08-public-page/08-02-PLAN.md`
- Context: `.planning/phases/08-public-page/CONTEXT.md`
- Previous: `08-01-SUMMARY.md` (Domain research)
- Next: `08-03-PLAN.md` (Dynamic route `[username]/page.tsx`)
