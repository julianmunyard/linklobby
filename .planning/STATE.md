# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-23)

**Core value:** The dashboard and live preview experience - artists watching their page become theirs.
**Current focus:** Phase 4.4 Profile Editor

## Current Position

Phase: 4.3 of 18 - Card Context Menu & Undo/Redo (COMPLETE)
Plan: 2 of 2 complete
Status: **Phase complete**
Last activity: 2026-01-26 - Completed quick task 006: Fix stale closure in auto-save

Progress: [██████████████░░░░░░░░░░░] 55%

## Roadmap Summary (18 Phases across 3 Milestones)

### v1.0 MVP (Phases 4.2-9.5)
| # | Phase | Status |
|---|-------|--------|
| 1 | Foundation | Complete ✓ |
| 2 | Dashboard Shell | Complete ✓ |
| 3 | Canvas System | Complete ✓ |
| 4 | Basic Cards | Complete ✓ |
| 4.1 | Flow Layout | Complete ✓ |
| 4.2 | Linktree Import | Complete |
| 4.3 | Card Context Menu & Undo/Redo | Complete |
| 4.4 | Profile Editor | - |
| 4.5 | Editor Polish (Mobile) | - |
| 5 | Media Cards | - |
| 6 | Advanced Cards | - |
| 7 | Theme System | - |
| 8 | Public Page | - |
| 9 | Platform Integrations | - |
| 9.5 | Onboarding | - |

### v1.1 Growth (Phases 10-12.5)
| # | Phase | Status |
|---|-------|--------|
| 10 | Fan Tools | - |
| 11 | Analytics & Pixels & Legal | - |
| 12 | Audio System | - |
| 12.5 | Billing & Subscriptions | - |

### v1.2 Pro (Phases 13-16)
| # | Phase | Status |
|---|-------|--------|
| 13 | Tour & Events | - |
| 14 | Custom Domains | - |
| 15 | Advanced Analytics | - |
| 16 | Accessibility | - |

## Phase 4.3 Progress (COMPLETE)

| Plan | Name | Status |
|------|------|--------|
| 01 | Undo/Redo Infrastructure | Complete |
| 02 | Card Actions & Type Picker | Complete |

## Phase 4.2 Progress (COMPLETE)

| Plan | Name | Status |
|------|------|--------|
| 01 | Linktree Import Infrastructure | Complete |
| 02 | API Route, UI Dialog & Editor Integration | Complete |

## Phase 4.1 Progress (COMPLETE)

| Plan | Name | Status |
|------|------|--------|
| 01 | Type Definitions & Database Mapping | Complete |
| 02 | Flow Layout Components | Complete |
| 03 | Preview Integration & Wiring | Complete |

## Phase 4 Progress (COMPLETE)

| Plan | Name | Status |
|------|------|--------|
| 01 | Card Content Infrastructure | Complete |
| 02 | Basic Card Components | Complete |
| 03 | Card Property Editor | Complete |
| 04 | Editor + Preview Integration | Complete |

## Phase 3 Progress (COMPLETE)

| Plan | Name | Status |
|------|------|--------|
| 01 | Canvas Foundation | Complete |
| 02 | Database Schema Updates | Complete |
| 03 | Sortable Card Components | Complete |
| 04 | Store & Editor Integration | Complete |
| 05 | API Routes & useCards | Complete |
| 06 | End-to-End Wiring | Complete |

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
| ROADMAP.md | 18 phases across 3 milestones | Current |
| COMPONENT-SYSTEM.md | Card types, layout, integrations | Current |
| research/SUMMARY.md | Tech stack | Current |
| research/COMPETITORS.md | Competitive analysis | NEW |
| research/FEATURES.md | Feature landscape | Current |

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
| fetchUserPage for API auth | 03-05 | Reusable auth pattern for card routes |
| mapDbToCard/mapCardToDb helpers | 03-05 | sortKey <-> sort_key field mapping |
| useMemo for sorted cards | 03-06 | Avoid infinite loop from getSortedCards() selector |
| size column in database | 03-06 | Card size persists with card data |
| Card-type specific content schemas | 04-01 | Type safety for card components vs generic Record |
| 5MB upload limit client-side | 04-01 | Better UX than server rejection |
| cardId/uuid.ext upload structure | 04-01 | Groups images by card, unique filenames |
| Deferred image deletion | 04-01 | Orphan cleanup via background job, avoid accidental loss |
| Polymorphic wrapper pattern | 04-02 | a vs div based on URL presence for semantic HTML |
| Stretched link pattern | 04-02 | Invisible overlay for full-card clickability |
| Three button styles for hero | 04-02 | Primary, secondary (glass), outline for visual variety |
| Gradient overlays on images | 04-02 | Text readability regardless of image colors |
| Optimistic updates via form.watch() | 04-03 | Immediate feedback in preview without save button |
| Type-specific field components | 04-03 | Each card type can extend fields independently |
| react-hook-form for property editor | 04-03 | Established pattern from phase 01 |
| Wildcard Supabase image domain | 04-04 | *.supabase.co covers all projects, future-proof |
| CardSize is big/small not small/medium/large | 04.1-01 | Simplified for flow layout with half-width concept |
| position field maps to position_x column | 04.1-01 | Reuse existing column (0=left, 1=center, 2=right) |
| Legacy size migration: large->big, small/medium->small | 04.1-01 | Backward compatibility for existing cards |
| CARD_TYPE_SIZING null = always full width | 04.1-01 | horizontal, dropdown, audio cards don't support sizing |
| Position zones overlay during small card drag | 04.1-02 | Only show left/center/right zones when relevant |
| strategy={() => null} for mixed sizes | 04.1-02 | Disables dnd-kit auto-positioning for mixed card sizes |
| Fixed DragOverlay widths | 04.1-02 | w-80 (big) and w-40 (small) for visual consistency |
| rectSortingStrategy for FlowGrid | 04.1-03 | Replaced null strategy for smooth drag animations |
| CARD_TYPE_SIZING enforcement in store | 04.1-03 | addCard/updateCard force 'big' for non-sizable card types |
| Removed position drop zones | 04.1-03 | Left/center/right zones were clunky - cards now flow by order only |
| Hide original card during drag | 04.1-03 | opacity-0 instead of opacity-30 for cleaner drag UX |
| axios/cheerio for __NEXT_DATA__ scraping | 04.2-01 | Lighter weight than Puppeteer for extracting Linktree JSON |
| Custom Linktree error classes | 04.2-01 | LinktreeNotFoundError, LinktreeEmptyError, LinktreeFetchError for clear user feedback |
| Filter to clickable links only | 04.2-01 | Exclude HEADER type and locked links from import |
| Pattern-based layout generation | 04.2-01 | 5 rhythm patterns create "this is different" feeling vs uniform Linktree |
| Deterministic randomization | 04.2-01 | Link count modulo patterns = consistent but varied layouts |
| Structured MappedCardWithImage return | 04.2-02 | Keep imageBlob separate from card data for clean API handling |
| Permissive Zod schemas with passthrough | 04.2-02 | Handle Linktree data variations (null fields, extra properties) |
| Confirmation dialog for existing cards | 04.2-02 | Ask user to add or replace when importing with existing cards |
| Image re-upload to our storage | 04.2-02 | Download from Linktree, upload to Supabase for consistency |
| zundo temporal middleware | 04.3-01 | Native Zustand integration for undo/redo |
| partialize cards only | 04.3-01 | UI state (selectedCardId, hasChanges) not tracked in history |
| 500ms throttle for history | 04.3-01 | Batch rapid field edits into single undo entry |
| pause/resume during drag | 04.3-01 | Prevents intermediate drag states from polluting history |
| Convertible types only | 04.3-02 | Only hero/horizontal/square can convert - dropdown is container, others are specialized |
| Delete no confirmation | 04.3-02 | Delete immediately with undo toast - modern pattern, faster workflow |
| Duplicate selects new card | 04.3-02 | User likely wants to edit the new card immediately |

## Quick Tasks

| # | Description | Status | Commit |
|---|-------------|--------|--------|
| 001 | Add delete button to cards | Complete | 735b927 |
| 002 | Default preview mode to mobile | Complete | 882e9ac |
| 003 | Smooth card drag animation | Complete | 7cb089f |
| 004 | Auto-save on close | Complete | d8d7e65 |
| 005 | Fix auto-save on close | Complete | 34e660c |
| 006 | Fix stale closure in auto-save | Complete | 9f399bd |
| 007 | Fix card type not saving | Complete | b29e077 |

## Session Continuity

Last session: 2026-01-26
Stopped at: Completed 04.3-02-PLAN.md - Card Actions & Type Picker (Phase 4.3 complete)
Resume with: 04.4 Profile Editor

**Phase 04.3 complete - Card Context Menu & Undo/Redo:**
- Zundo temporal middleware for undo/redo history
- Keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z)
- CardTypePicker for hero/horizontal/square conversion
- Duplicate action creates copy after original
- Delete with undo toast (5 second duration)
- Header undo/redo buttons with disabled states

---
*Updated: 2026-01-26 - Completed quick task 007*
