# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-23)

**Core value:** The dashboard and live preview experience - artists watching their page become theirs.
**Current focus:** Phase 2 COMPLETE - Dashboard Shell built

## Current Position

Phase: 2 of 11 - Dashboard Shell (COMPLETE)
Plan: 5 of 5 complete
Status: **Phase complete, verified ✓**
Last activity: 2026-01-24 - Phase 2 verified (6/6 must-haves passed)

Progress: [██████░░░░░░░░░░░░░░] 27%

## Roadmap Summary (11 Phases)

| # | Phase | Status |
|---|-------|--------|
| 1 | Foundation | Complete |
| 2 | Dashboard Shell | Complete ✓ |
| 3 | Canvas System | - |
| 4 | Basic Cards | - |
| 4.1 | Linktree Import | - |
| 5 | Media Cards | - |
| 6 | Advanced Cards | - |
| 7 | Theme System | - |
| 8 | Platform Integrations | - |
| 9 | Public Page | - |
| 10 | Analytics | - |
| 11 | Audio System | - |

## Phase 2 Progress

| Plan | Name | Status |
|------|------|--------|
| 01 | Dependencies & Infrastructure | Complete |
| 02 | Dashboard Sidebar | Complete |
| 03 | Editor Split-Screen | Complete |
| 04 | Preview Route & Header | Complete |
| 05 | Unsaved Changes Protection | Complete |

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

## Session Continuity

Last session: 2026-01-24
Stopped at: Phase 2 complete and verified
Resume with: Plan Phase 3 (Canvas System)

---
*Updated: 2026-01-24 after Phase 2 verification*
