# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-23)

**Core value:** The dashboard and live preview experience - artists watching their page become theirs.
**Current focus:** Phase 3 IN PROGRESS - Canvas System

## Current Position

Phase: 3 of 11 - Canvas System
Plan: 4 of 6 complete (03-01, 03-02, 03-03, 03-04)
Status: **In progress**
Last activity: 2026-01-24 - Completed 03-04 Store & Editor Integration

Progress: [█████████░░░░░░░░░░░] 40%

## Roadmap Summary (11 Phases)

| # | Phase | Status |
|---|-------|--------|
| 1 | Foundation | Complete |
| 2 | Dashboard Shell | Complete |
| 3 | Canvas System | In Progress (4/6) |
| 4 | Basic Cards | - |
| 4.1 | Linktree Import | - |
| 5 | Media Cards | - |
| 6 | Advanced Cards | - |
| 7 | Theme System | - |
| 8 | Platform Integrations | - |
| 9 | Public Page | - |
| 10 | Analytics | - |
| 11 | Audio System | - |

## Phase 2 Progress (COMPLETE)

| Plan | Name | Status |
|------|------|--------|
| 01 | Dependencies & Infrastructure | Complete |
| 02 | Dashboard Sidebar | Complete |
| 03 | Editor Split-Screen | Complete |
| 04 | Preview Route & Header | Complete |
| 05 | Unsaved Changes Protection | Complete |

## Phase 3 Progress

| Plan | Name | Status |
|------|------|--------|
| 01 | Canvas Foundation | Complete |
| 02 | Database Schema Updates | Complete |
| 03 | Sortable Card Components | Complete |
| 04 | Store & Editor Integration | Complete |
| 05 | API Routes & useCards | - |
| 06 | End-to-End Wiring | - |

## v1 Component System (LOCKED)

| Card Type | Description |
|-----------|-------------|
| Hero Card | Large CTA with photo/text/embed |
| Horizontal Link | Linktree-style bar |
| Square Card | Small tile |
| Video Card | Video display |
| Photo Gallery | Multi-image with ReactBits animations |
| Dropdown | Expandable link list, custom text |
| Game Card | Mini-games (Snake, etc.) |

**See:** `.planning/COMPONENT-SYSTEM.md` for full details

## Key Files

| File | Purpose | Status |
|------|---------|--------|
| PROJECT.md | Vision | Current |
| ROADMAP.md | 11 phases | Current |
| COMPONENT-SYSTEM.md | Card types, layout, integrations | Current |
| research/SUMMARY.md | Tech stack | Current |

## Accumulated Decisions

| Decision | Phase | Rationale |
|----------|-------|-----------|
| sonner instead of toast | 01-01 | toast deprecated in shadcn v3.7.0 |
| @supabase/ssr for auth | 01-01 | Official SSR pattern, replaces deprecated auth-helpers |
| getUser() not getSession() | 01-01 | Security: getUser() validates JWT with Supabase server |
| User ran schema manually | 01-02 | Supabase project already existed |
| React Hook Form + Zod | 01-03 | Form validation pattern |
| Zustand for state management | 02-01 | Lightweight, no boilerplate |
| hasChanges pattern | 02-01 | Set on mutations, cleared on save |
| collapsible="icon" sidebar | 02-02 | Sidebar collapses to icon mode |
| Cookie persistence for UI state | 02-02 | sidebar_state cookie read server-side |
| react-resizable-panels v4 API | 02-03 | Group/Panel/Separator replaces PanelGroup/PanelResizeHandle |
| orientation prop not direction | 02-03 | v4 API change for panel orientation |
| postMessage origin check | 02-04 | Security: only accept same-origin messages |
| useDefaultLayout for persistence | 02-04 | v4 pattern for panel layout persistence |
| Capture phase for link clicks | 02-05 | Intercept before React handlers |
| PREVIEW_READY message | 02-05 | Reliable iframe state sync |
| Client wrapper pattern | 02-05 | Separate client hooks from server components |
| dnd-kit over react-beautiful-dnd | 03-01 | Actively maintained, React 19 compatible |
| Fractional-indexing for order | 03-01 | Single UPDATE not N updates on reorder |
| Predefined card sizes | 03-01 | Small/Medium/Large not free resize |
| sortKey for ordering | 03-01 | Vertical stack uses 1D ordering, ignore position_x/y |
| Drag handle isolation | 03-03 | touch-none on handle allows page scroll on mobile |
| Hydration guard pattern | 03-03 | dnd-kit ID mismatch between server/client |
| 8px activation distance | 03-03 | Prevents accidental drags |
| getSortedCards computed | 03-04 | Store returns cards in display order |
| selectedCardId for selection | 03-04 | Track selected card for property editing |

## Session Continuity

Last session: 2026-01-24
Stopped at: Completed 03-04-PLAN.md
Resume with: `/gsd:execute-phase 3` (will continue with 03-05)

**Phase 3 remaining:**
- Wave 3: 03-05 (API Routes & useCards)
- Wave 4: 03-06 (End-to-End Wiring - has checkpoint)

---
*Updated: 2026-01-24 — completed 03-04 Store & Editor Integration*
