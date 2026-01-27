# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-23)

**Core value:** The dashboard and live preview experience - artists watching their page become theirs.
**Current focus:** Phase 5 Media Cards

## Current Position

Phase: 5 of 18 - Media Cards (IN PROGRESS)
Plan: 2 of ? complete
Status: **Executing plans**
Last activity: 2026-01-27 - Completed 05-02-PLAN.md

Progress: [████████████████████████████░░] 95%

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
| 4.4 | Profile Editor | Complete ✓ |
| 4.5 | Editor Polish (Mobile) | Complete ✓ |
| 5 | Media Cards | In Progress |
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

## Phase 5 Progress (IN PROGRESS)

| Plan | Name | Status |
|------|------|--------|
| 01 | Foundation - Media Card Types & Helpers | Complete |
| 02 | Video Card Component & Editor | Complete |

## Phase 4.5 Progress (COMPLETE ✓)

| Plan | Name | Status |
|------|------|--------|
| 01 | Foundation Utilities | Complete |
| 02 | Mobile Editor Layout | Complete |
| 03 | Image Upload Polish & Error Handling | Complete |

## Phase 4.4 Progress (COMPLETE ✓)

| Plan | Name | Status |
|------|------|--------|
| 01 | Profile Types & Store | Complete |
| 02 | Image Crop Utility | Complete |
| 03 | Storage Extension | Complete |
| 04 | Header Section UI | Complete |
| 05 | Social Icons Editor | Complete |
| 06 | Social Icons Integration | Complete |
| 07 | Profile-Preview Sync | Complete |
| 08 | API & Persistence | Complete |

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

## v1 Component System (UPDATED)

| Card Type | Description |
|-----------|-------------|
| Link | Simple text link - no image, transparent |
| Hero Card | Large CTA with photo/text/embed |
| Horizontal Link | Linktree-style bar with thumbnail |
| Square Card | Small tile |
| Video Card | Video display |
| Photo Gallery | Multi-image with ReactBits animations |
| Dropdown | Expandable link list, custom text |
| Game Card | Mini-games (Snake, etc.) |
| Social Icons | Draggable widget for social platform links |

**All cards support:** Text align (left/center/right), Vertical align (top/middle/bottom)

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
| getState() for event handlers | quick-006 | Use `useStore.getState().value` in handlers, not hook-subscribed values (stale closure bug) |
| Explicit save field list | quick-007 | saveCards must list all mutable fields - card_type/position were missing |
| Blob input for profile images | 04.4-03 | getCroppedImg outputs Blob, not File - uploadProfileImage accepts Blob directly |
| Always JPEG for cropped images | 04.4-03 | Crop dialog always outputs JPEG, no type detection needed |
| userId/type-uuid.jpg path structure | 04.4-03 | Organizes profile images by user, distinguishes avatar vs logo |
| Social icon sortKey pattern | 04.4-01 | Fractional indexing for social icon ordering (same as cards) |
| Profile store separate from page-store | 04.4-01 | Cleaner boundaries, parallel structure |
| No temporal/undo for profile | 04.4-01 | Profile editing simpler than cards, defer if needed |
| Export PLATFORM_ICONS for reuse | 04.4-05 | DRY - icon mapping shared between picker and editor |
| 4px activation distance for icons | 04.4-05 | Smaller than cards (8px) since icons are smaller targets |
| ToggleGroup for profile toggles | 04.4-04 | Consistent UI pattern for layout, title style, title size selections |
| Conditional rendering on titleStyle | 04.4-04 | Show display name + size picker for Text, logo upload for Logo |
| Square aspect for avatar, free for logo | 04.4-04 | Avatar crops to 1:1, logo allows any aspect ratio |
| Profile sync via postMessage | 04.4-07 | Preview iframe has separate Zustand instance - sync profile state in STATE_UPDATE message |
| showAvatar toggle for profile photo | 04.4 | User can hide profile photo entirely via Switch toggle |
| logoScale slider 50-300% | 04.4 | Scalable logo size with shadcn Slider, persisted to database |
| img tag for logo (not Next Image) | 04.4 | Fixes transparent PNG black background issue |
| Independent title/logo toggles | 04.4 | Removed titleStyle either/or, showTitle and showLogo are independent |
| Bio field added to profile | 04.4 | Short text bio below title in profile header |
| Collapsible sections in header editor | 04.4 | Each setting group (Photo, Layout, Name, Logo, Bio, Social) collapsible |
| Outer HEADER collapsible | 04.4 | Entire header section collapses under one title for cleaner UI |
| social-icons as card type | 04.4 | Social icons are draggable card, positioned in flow with other cards |
| Social icons auto-create | 04.4 | Adding first icon auto-creates social-icons card at end |
| link card type | 04.4 | Simple text link card - no image, transparent background |
| CARD_TYPES_NO_IMAGE array | 04.4 | Hide image upload for social-icons, link, dropdown, audio cards |
| Text alignment per card | 04.4 | textAlign (left/center/right) stored in card.content |
| Vertical alignment per card | 04.4 | verticalAlign (top/middle/bottom) stored in card.content |
| Tablet orientation handling | 04.5-01 | Landscape → desktop layout, portrait → mobile layout |
| Asymmetric offline debouncing | 04.5-01 | 500ms debounce going offline, immediate when online |
| GIF preservation in compression | 04.5-01 | Animated GIFs bypass compression, other formats compressed to 1MB/1920px |
| Auto-fix URLs with https:// | 04.5-01 | Add https:// if protocol missing, allow empty for optional fields |
| browser-image-compression for uploads | 04.5-01 | Client-side compression before upload with web worker |
| Compress after crop, not before | 04.5-03 | Cropping produces new blob - compress the cropped result for optimal size |
| Store pending blob for retry | 04.5-03 | Allow retry without re-cropping - better UX on network failures |
| Inline errors with retry buttons | 04.5-03 | Keep error context visible, provide immediate recovery option |
| Non-blocking URL validation | 04.5-03 | Warn users of invalid URLs but don't prevent saving - forgiving UX |
| 3 retries with exponential backoff | 04.5-03 | Balance between resilience and user wait time (1s, 2s, 4s delays) |
| Toast on final failure only | 04.5-03 | Silent retries don't alarm users, only show error after exhausting attempts |
| Persistent offline banner | 04.5-03 | Clear, always-visible warning - not dismissible to prevent accidental work loss |
| Vaul Drawer for mobile bottom sheet | 04.5-02 | Built on Radix Dialog, handles swipe physics and iOS Safari quirks |
| 85vh height for bottom sheet | 04.5-02 | Leaves 15% of preview visible (dimmed) for context |
| Auto-open sheet on card selection | 04.5-02 | Mobile users tap card expecting immediate editing |
| 44px minimum touch targets | 04.5-02 | h-11 for all interactive buttons (Apple HIG / Material Design guideline) |
| touch-pan-y on scrollable areas | 04.5-02 | Prevents gesture conflicts between scroll and drawer swipe-to-dismiss |
| TouchSensor for dnd-kit | 04.5-fix | PointerSensor alone doesn't work in Chrome DevTools mobile emulation |
| touch-none on preview cards | 04.5-fix | Required for touch-based drag to work on preview sortable cards |
| 50ms TouchSensor delay | 04.5-fix | Short delay prevents accidental drags while allowing responsive touch drag |
| get-video-id for URL parsing | 05-01 | Handles YouTube/Vimeo/TikTok edge cases, simpler API than js-video-url-parser |
| 100MB video upload limit | 05-01 | Balance between quality and storage/performance, user can compress with HandBrake if needed |
| Embla Carousel for alternative gallery | 05-01 | Lightweight (800K weekly downloads), great touch/swipe support, minimal API vs Swiper |
| oEmbed with YouTube fallback thumbnail | 05-01 | oEmbed provides title + thumbnail, fallback ensures thumbnails always work even if API fails |
| TikTok stores full URL as embedUrl | 05-01 | TikTok oEmbed unreliable, requires original URL for official embed code |
| Optional videoType with 'embed' default | 05-02 | New video cards start empty - videoType defaults in UI, cleaner than forced initialization |
| Video/gallery hide generic ImageUpload | 05-02 | Custom media via VideoCardFields/GalleryCardFields, not standard image upload |
| Embed mode: thumbnail + click-to-play | 05-02 | Better performance - heavy iframe only loads when user clicks play button |
| Upload mode: muted autoplay loop | 05-02 | Instagram-style instant visual impact with autoPlay muted loop playsInline |

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
| 008 | Card defaults and type picker fixes | Complete | 45bd6e6 |
| 009 | Profile auto-save, delete fix, import defaults | Complete | aadfdbf |
| 010 | Link card border + hero button toggle | Complete | 7959232 |
| 011 | Card text overflow and wrapping | Complete | 2bce896 |
| 012 | Auto-detect social icons from Linktree import | Complete | 4ed1a6c |
| 013 | Fix Linktree social icon import | Complete | 93baa8c |
| 014 | Click card image to open crop/edit dialog | Complete | 596cd78 |

## Session Continuity

Last session: 2026-01-27
Stopped at: Completed 05-02-PLAN.md (Video Card Component & Editor)
Resume with: Next plan in Phase 5 or `/gsd:plan-phase 5` to create new plans

**This session's work:**

1. **Phase 5 Media Cards Execution** (2 plans)
   - Plan 01: Foundation - Media Card Types & Helpers
     - Installed get-video-id and embla-carousel-react
     - Created VideoCardContent and GalleryCardContent types with type guards
     - Built parseVideoUrl for YouTube/Vimeo/TikTok with oEmbed thumbnails
     - Added uploadCardVideo/deleteCardVideo storage functions
   - Plan 02: Video Card Component & Editor
     - Created VideoCard with embed (thumbnail + click-to-play) and upload (muted autoplay) modes
     - Built VideoCardFields editor with URL validation and file upload
     - Wired into card renderer and property editor
     - Made videoType optional with 'embed' default

**Key commits this session:**
- `37fe633` - feat(05-02): create VideoCard component
- `a3db260` - feat(05-02): create VideoCardFields editor component
- `5063c5e` - feat(05-02): wire VideoCard into card renderer
- `44b0aea` - feat(05-02): wire VideoCardFields into property editor

**Files created/modified:**
- `src/components/cards/video-card.tsx` - NEW: VideoCard with embed and upload modes
- `src/components/editor/video-card-fields.tsx` - NEW: Editor fields with URL validation and upload
- `src/components/cards/card-renderer.tsx` - Added video case
- `src/components/editor/card-property-editor.tsx` - Added VideoCardFields
- `src/types/card.ts` - Made videoType optional, added video/gallery to CARD_TYPES_NO_IMAGE

---
*Updated: 2026-01-27 - Video Card implementation complete*
