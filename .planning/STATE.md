# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-23)

**Core value:** The dashboard and live preview experience - artists watching their page become theirs.
**Current focus:** Phase 11 Analytics, Pixels & Legal (COMPLETE)

## Current Position

Phase: 12.6 of 18 - Security Hardening & Auth Completion
Plan: 3 of 7 - In progress
Status: **Phase 12.6 Plan 03 Complete - Google OAuth + Password Reset flows built**
Last activity: 2026-02-25 - Completed 12.6-03-PLAN.md (Google OAuth + forgot/reset password)

Progress: [████████████████████████████░░░░] ~83%

### IN PROGRESS: Phase 12.6 - Security Hardening & Auth Completion

Building security hardening and completing auth flows:
- ✓ Plan 03: Google OAuth + forgot/reset password flows

**Key decisions (Plan 03):**
- GoogleOAuthButton standalone 'use client' component — reusable on both login and signup
- Forgot password redirectTo includes type=recovery so auth callback can distinguish recovery from normal OAuth
- Auth callback: type=recovery always routes to /reset-password (overrides next param)
- Reset password success state with 2s delay redirect to /login for UX confirmation

### IN PROGRESS (PAUSED): Phase 12.5 - Billing & Subscriptions

Building Stripe billing with 3-tier plans (free/pro/artist):
- ✓ Plan 01: Stripe backend — client singleton, plan config, webhook handler, DB migration, checkout/portal routes
- ✓ Plan 02: Billing UI — /pricing page, PricingTable, PlanBadge, UpgradeModal, BillingSection in settings, sidebar/header badge integration
- ✓ Plan 03: Feature gating — ProGate (soft-lock), PlanTierContext, public page card stripping, branding/theme gating
- ⏸ Plan 04: Build verified (TypeScript + build clean), awaiting human end-to-end verification

**Current status:** Full Stripe billing system built. TypeScript passes clean. Production build succeeds (38 routes). All billing files verified. Awaiting human verification of end-to-end flow with Stripe test keys. **Requires: Stripe test keys in .env.local, DB migration applied, Stripe CLI listener running, test products created in Stripe Dashboard.**

**Key decisions (Plan 03):**
- Soft-lock pattern: ProGate children always interactive, badge overlay triggers UpgradeModal — creates desire not frustration
- PlanTierProvider at dashboard layout level: single UpgradeModal singleton, no Z-index conflicts
- PRO_THEMES = all 8 designer themes; free themes = mac-os, instagram-reels, system-settings, blinkies
- Public theme fallback to 'instagram-reels' (not mac-os) — most polished free theme

**Key decisions (Plan 02):**
- Checkout API accepts tier+period (server resolves Stripe price IDs from env vars — not exposed client-side)
- PlanBadge is not 'use client' — simple Link component usable anywhere
- DashboardHeader gets planTier from editor page server component → EditorClientWrapper
- Free users shown Upgrade Plan link; paid users shown Manage Billing (portal) button

### IN PROGRESS (PAUSED): Phase 12.2 - Theme Templates

Building a template library that lets artists apply pre-built page layouts:
- ✓ Plan 01: Template type system, registry, and first instagram-reels placeholder template
- ✓ Plan 02: Dev Template Saver (NEXT_PUBLIC_DEV_TOOLS-gated snapshot button in editor header)
- ✓ Plan 03: POST /api/templates/apply — uploads media assets to user Supabase storage, replaces all 3 content path shapes (imageUrl, tracks[], images[]), batch-inserts cards, returns theme + profile for client hydration
- Plan 04: Template picker UI in the editor

**Current status:** Apply API route operational. POST `{ templateId, mode }` -> `{ cards, theme, profile, templateName }`. Template picker UI (Plan 04) is the final piece to connect the template library to the editor.

### IN PROGRESS (PAUSED): Phase 12.1 - Scatter Mode

Building freeform card positioning for 5 themes:
- ✓ Plan 01: Scatter Mode Foundation (types, store toggles, scatter actions)
- ✓ Plan 02: Scatter Grid Component (drag, resize, z-index)
- ✓ Plan 03: Scatter Mode UI Controls (toggle, visitor drag, preview panel wiring)
- ✓ Plan 04: Public Scatter Mode (StaticScatterCanvas, visitor drag, public page routing)
- Plan 05: Scatter Persistence (database sync) — paused, continuing after 12.2

**Current status:** Public pages render scatter layouts with optional visitor drag. Artist arrangements display correctly on public pages. Ready for database persistence layer.

### COMPLETE: Phase 12 - Audio System

Built custom audio player with Superpowered Web Audio:
- ✓ Plan 01: Audio Infrastructure Foundation (types, upload API, storage, webpack config)
- ✓ Plan 02: Audio Engine & Hooks (AudioEngine singleton, useAudioPlayer, useWaveform, iOS unlock)
- ✓ Plan 03: Audio Player UI Components (player controls, waveform, varispeed, reverb knob, track list)
- ✓ Plan 04: Audio Card Integration (AudioCard, AudioCardFields, card renderer and editor wiring)
- ✓ Plan 05: Theme-Specific Audio Player Styles (theme-adapted audio players for all 6 themes)

**Phase complete:** Custom audio player with Superpowered Web Audio, theme adaptations, and audio play analytics tracking.

### COMPLETE: Phase 11 - Analytics, Pixels & Legal

Built analytics, pixel tracking, and legal compliance:
- ✓ Plan 01: Analytics Tracking Foundation (privacy-safe visitor tracking, stats API)
- ✓ Plan 02: Legal Compliance Foundation (cookie consent, privacy policy, terms of service)
- ✓ Plan 03: Insights Dashboard (Recharts visualization, hero metrics, per-card leaderboard)
- ✓ Plan 04: Pixel Tracking Integration (Facebook Pixel, GA4, CAPI, cookie consent gating)
- ✓ Plan 05: GDPR Data Export & Account Deletion (ZIP download, 30-day grace period)

**Phase complete:** Full analytics dashboard, Facebook Pixel + GA4 tracking with GDPR compliance, legal pages, data export & account deletion

### COMPLETE: Phase 10 - Fan Tools

Built fan engagement features for artists:
- ✓ Plan 01: Email Collection Infrastructure
- ✓ Plan 02: Email Collection Card (QR Code, Export, Mailchimp)
- ✓ Plan 03: Link Scheduling
- ✓ Plan 04: Release Card

**Phase complete:** Email collection, QR codes, link scheduling, and release card all functional

### COMPLETE: Phase 9 - Platform Integrations

Built embed support for major platforms (Spotify, Apple Music, SoundCloud, YouTube, TikTok, etc.):
- ✓ Plan 01: Platform detection foundation (platform-embed.ts, MusicCardContent type)
- ✓ Plan 02: Playback coordination context (EmbedPlaybackProvider)
- ✓ Plan 03: Music card component and editor
- ✓ Plan 04: Vertical video embed support (TikTok, Instagram Reels)
- ✓ Plan 05: Editor integration (MusicCard in CardRenderer, playback coordination)
- Plan 06: Platform verification (deferred)

**Phase complete:** Music card fully integrated, playback coordination wired

### COMPLETE: Phase 8 - Public Page

Built the public profile page at `linklobby.com/username`:
- ✓ Plan 01: Data infrastructure (is_published, fetchPublicPageData)
- ✓ Plan 02: Static render components (StaticFlowGrid, StaticProfileHeader, PublicPageRenderer)
- ✓ Plan 03: Dynamic route `[username]/page.tsx`
- ✓ Plan 04: SEO metadata and sitemap

**Phase complete:** Public pages fully functional with dynamic OG images, sitemap, and robots.txt

### Dropdown Card Removed

The dropdown card feature was removed due to persistent issues with:
- Collapse/expand causing visual position bugs
- Nested drag-and-drop complexity
- Event propagation conflicts with dnd-kit

**Decision:** Remove feature entirely rather than continue debugging.
Dropdown functionality may be revisited in a future version with a simpler approach.

**Next step:** Complete Phase 6 with Plan 15 (Editor Testing & Polish)

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
| 5 | Media Cards | Complete ✓ |
| 6 | Advanced Cards | Complete ✓ |
| ~~6.1~~ | ~~Dropdown Card Fix~~ | Removed |
| 7 | Theme System | Complete ✓ |
| 8 | Public Page | Complete ✓ |
| 9 | Platform Integrations | Complete ✓ |
| 9.5 | Onboarding | - |

### v1.1 Growth (Phases 10-12.5)
| # | Phase | Status |
|---|-------|--------|
| 10 | Fan Tools | Complete ✓ |
| 11 | Analytics & Pixels & Legal | Complete ✓ |
| 12 | Audio System | In Progress (Plan 1/5 complete) |
| 12.2 | Theme Templates | In Progress (Plan 1/4 complete) |
| 12.5 | Billing & Subscriptions | In Progress (Plan 1/4 complete) |
| 12.6 | Security Hardening & Auth | - |
| 12.7 | Production Readiness | - |
| 12.8 | Theme System Overhaul | - |

### v1.2 Pro (Phases 13-16)
| # | Phase | Status |
|---|-------|--------|
| 13 | Tour & Events | - |
| 14 | Custom Domains | - |
| 15 | Advanced Analytics | - |
| 16 | Accessibility | - |

## Phase 12.5 Progress (IN PROGRESS)

| Plan | Name | Status |
|------|------|--------|
| 01 | Stripe Billing Backend | Complete ✓ |
| 02 | Pricing Page UI | - |
| 03 | Feature Gating | - |
| 04 | Settings Billing Tab | - |

**Summaries:**
- Plan 01: .planning/phases/12.5-billing-subscriptions/12.5-01-SUMMARY.md

**Plan 01 commits (2026-02-25):**
- `508e367` - feat(12.5-01): Stripe client, plan definitions, subscription helper, admin Supabase client
- `7333279` - feat(12.5-01): billing DB migration and API routes (webhook, checkout, portal)

**Key deliverables:**
- stripe@20.3.1 installed; Stripe singleton in src/lib/stripe/client.ts (API v2026-01-28.clover)
- 3-tier PLANS config (free/pro/artist) with PlanFeatures type and getPlanTierByPriceId() in src/lib/stripe/plans.ts
- getUserPlan(), isPro(), isArtist() reading from local subscriptions table in src/lib/stripe/subscription.ts
- createAdminClient() service role client in src/lib/supabase/admin.ts
- POST /api/webhooks/stripe — signature verification, idempotency, syncSubscription to local DB
- POST /api/billing/checkout — Checkout session with 7-day no-card trial
- POST /api/billing/portal — Customer Portal session
- supabase/migrations/20260225_billing_tables.sql — customers, subscriptions, webhook_events tables with RLS

**Accumulated decisions:**
- Stripe SDK v20 uses API 2026-01-28.clover (not 2025-03-31.basil as planned)
- current_period_start/end is on SubscriptionItem (not Subscription) in SDK v20
- Invoice subscription reference: invoice.parent.subscription_details.subscription (not invoice.subscription)
- customers table has no user SELECT RLS — admin client required for checkout/portal customer lookups

## Phase 12.2 Progress (IN PROGRESS)

| Plan | Name | Status |
|------|------|--------|
| 01 | Template Type System & Registry | Complete ✓ |
| 02 | Template Picker UI | - |
| 03 | Template Apply API Route | - |
| 04 | Additional Templates | - |

**Summaries:**
- Plan 01: .planning/phases/12.2-theme-templates/12.2-01-SUMMARY.md

**Plan 01 commits (2026-02-19):**
- `f6a6d62` - feat(12.2-01): create template type definitions and seed asset files
- `0bfcac9` - feat(12.2-01): create template registry and first instagram-reels template

**Key deliverables:**
- TemplateDefinition, TemplateCard, TemplateTheme, TemplateProfile types in src/lib/templates/types.ts
- Template registry (getAllTemplates, getTemplatesByTheme, getTemplate) in src/lib/templates/index.ts
- instagramReelsDarkMinimal template with 5 cards: hero, 2x horizontal links, Spotify embed, social-icons
- Placeholder JPEG assets: public/templates/instagram-reels-dark-minimal/{thumbnail,hero}.jpg

## Phase 12 Progress (IN PROGRESS)

| Plan | Name | Status |
|------|------|--------|
| 01 | Audio Infrastructure Foundation | Complete ✓ |
| 02 | Audio Upload UI & Track Management | - |
| 03 | Superpowered Audio Engine Integration | - |
| 04 | Custom Audio Player UI | - |
| 05 | Audio Card Editor | - |

**Summaries:**
- Plan 01: .planning/phases/12-audio-system/12-01-SUMMARY.md

**Plan 01 commits (2026-02-08):**
- `b1aa86f` - feat(12-01): create audio types and update card type system
- `bbe8b38` - feat(12-01): audio upload API with storage infrastructure

**Key deliverables:**
- AudioCardContent type system with tracks, reverb config, player colors
- Audio upload API with 100MB limit to Supabase "card-audio" bucket
- Webpack configuration for AudioWorklet support
- public/worklet/ directory for future AudioWorklet processor files
- Pragmatic v1 approach: client-side waveform generation, multi-format support

## Phase 8 Progress (COMPLETE)

| Plan | Name | Status |
|------|------|--------|
| 01 | Data Infrastructure | Complete ✓ |
| 02 | Static Render Components | Complete ✓ |
| 03 | Dynamic Route & 404 Page | Complete ✓ |
| 04 | SEO & Sitemap | Complete ✓ |

**Summaries:**
- Plan 01: .planning/phases/08-public-page/08-01-SUMMARY.md
- Plan 02: .planning/phases/08-public-page/08-02-SUMMARY.md
- Plan 03: .planning/phases/08-public-page/08-03-SUMMARY.md
- Plan 04: .planning/phases/08-public-page/08-04-SUMMARY.md

**Plan 04 commits (2026-02-03):**
- `10b57ff` - feat(08-04): create dynamic OG image with ImageResponse
- `669d692` - feat(08-04): create dynamic sitemap for published pages
- `47cf685` - feat(08-04): create robots.txt configuration

**Key deliverables:**
- Dynamic OG images with profile branding and theme colors
- Sitemap with ISR for search engine discovery
- Robots.txt for crawler access control
- Global 404 page with Ishmeria retro font
- Dynamic SEO metadata (title, description, OpenGraph, Twitter cards)
- Next.js 16 async params pattern

## Phase 7 Progress (COMPLETE ✓)

| Plan | Name | Status |
|------|------|--------|
| 01 | Theme Infrastructure | Complete |
| 02 | CSS Variables & Fonts | Complete |
| 03 | Theme Selection UI | Complete |
| 04 | Color Customization | Complete |
| 05 | Font & Style Controls | Complete |
| 06 | Card Theme Integration | Complete |
| 07 | Background Controls & Verification | Complete |

**Post-phase fixes (2026-01-29):**
- HEIC conversion dynamic import fix
- Profile auto-save fix
- 15 boutique fonts replacing basic ones

## Phase 6.1 Progress (COMPLETE ✓)

| Plan | Name | Status |
|------|------|--------|
| 01 | Dropdown Card Fix | Complete |

## Phase 6 Progress (IN PROGRESS - Unblocked)

| Plan | Name | Status |
|------|------|--------|
| 01 | Dropdown Types & Store | Complete |
| 02 | Game Card Foundation | Complete |
| 03 | Selection UI Hook | - |
| 04 | Install Box Selection Library | Complete |
| 05 | Dropdown Card UI Component | Complete |
| 06 | Nested Drag-and-Drop | Complete |
| 07 | Game Card Wrapper | Complete |
| 08 | Snake Game Implementation | Complete |
| 09 | Breakout Game | Complete |
| 10 | Flappy Game | Complete |
| 11 | Dropdown Editor | Complete |
| 12 | Game Card Editor | Complete |
| 13 | Box Selection | Complete |
| 14 | Selection Toolbar | Removed |
| 15 | Editor Testing & Polish | Skipped |
| 16 | Phase Verification | Complete ✓ |

## Phase 5 Progress (COMPLETE ✓)

| Plan | Name | Status |
|------|------|--------|
| 01 | Foundation - Media Card Types & Helpers | Complete |
| 02 | Video Card Component & Editor | Complete |
| 03 | Gallery Card Component | Complete |

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
| Game Card | Mini-games (Snake, Breakout, Flappy) |
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
| Set for multi-select IDs | 06-03 | O(1) lookup performance using Set data structure |
| Shift-click range selection | 06-03 | Uses orderedIds array to calculate ranges between last selected and current |
| isSelectMode flag for mobile | 06-03 | Separate mobile checkbox mode from desktop click mode |
| @air/react-drag-to-select for box selection | 06-04 | useSelectionContainer hook + boxesIntersect helper, 60fps performance, built-in TS types |
| DropdownCardContent childCardIds array | 06-01 | childCardIds stores child card IDs in order using fractional-indexing |
| Optional parentDropdownId on Card | 06-01 | null/undefined for main canvas cards, set to dropdown ID when inside dropdown |
| Bidirectional dropdown updates | 06-01 | moveCardToDropdown updates both card.parentDropdownId and dropdown.content.childCardIds |
| Type casting after type guard | 06-01 | Use isDropdownContent(content) then cast to DropdownCardContent for safe access |
| Start dropdown collapsed by default | 06-05 | Cleaner initial state per CONTEXT.md |
| Radix Collapsible for dropdown | 06-05 | Accessible component with built-in CSS variables for animation |
| 200ms ease-out dropdown animation | 06-05 | Smooth animation timing that feels responsive |
| Children slot pattern for dropdown | 06-05 | Accepts children prop for nested cards (flow-grid will pass in later plan) |
| Fixed retro arcade aesthetic for games | 06-07 | Game cards use black bg, green accents, CRT scanlines - doesn't adapt to theme for retro feel |
| Three-state game pattern | 06-07 | idle (demo + play button) → playing (game + score) → gameOver (score + replay) |
| isEditing prop for static preview | 06-07 | Game cards in editor show static preview only, no gameplay to avoid confusion/performance |
| Game aspect ratio adapts to card size | 06-07 | Small cards = square (1:1), big cards = video (16:9) for optimal layout |
| Nested SortableContext for dropdowns | 06-06 | Each dropdown has its own SortableContext for child cards, separate from main canvas |
| Dropdowns cannot be nested | 06-06 | canDropInContainer enforces no nested dropdowns - prevents infinite nesting complexity |
| Main canvas filters out parentDropdownId cards | 06-06 | Main SortableContext only contains cards without parentDropdownId, dropdowns render their own children |
| Cross-container moves update bidirectionally | 06-06 | Moving card updates both card.parentDropdownId and container's content.childCardIds |
| Pointer events for game controls | 06-09 | onPointerMove unifies mouse and touch control, simpler than separate handlers |
| Paddle width as canvas ratio | 06-09 | 20% paddle width scales properly for both aspect-video and aspect-square cards |
| Refs to avoid stale closures in game loop | 06-09 | paddleXRef.current accessed in onUpdate callback prevents stale closure bugs |
| Ball angle based on paddle hit position | 06-09 | vx = (hitPos - 0.5) * 8 adds skill element to breakout gameplay |
| DragSelection as sibling component | 06-13 | DragSelection renders as sibling, not wrapper - per @air/react-drag-to-select API |
| boxesIntersect for hit detection | 06-13 | Uses boxesIntersect helper to detect cards within selection box |
| shouldStartSelecting excludes interactives | 06-13 | Prevents box selection from starting on drag handles, buttons, interactive elements |
| data-selectable-id for box selection | 06-13 | Cards have data-selectable-id attribute for querySelector-based hit detection |
| Snake grid size 20px | 06-08 | Balance between visibility and playability - too small is hard to see, too large limits movement |
| Snake game speed 100ms per move | 06-08 | Classic snake speed - fast enough to be challenging but not overwhelming |
| Direction ref pattern prevents reversing | 06-08 | Prevents 180-degree turns (up→down or left→right) which would cause instant self-collision |
| 30px min swipe for snake controls | 06-08 | More responsive than default 50px, better for quick direction changes in game |
| Floating bottom-center toolbar | 06-14 | Non-intrusive position for selection toolbar, visible regardless of scroll |
| Auto-hide on empty selection | 06-14 | Toolbar only shows when selectedCount > 0, cleaner UI |
| Group creates new dropdown | 06-14 | Single action creates dropdown and moves all selected cards - fast workflow |
| Delete requires confirmation | 06-14 | Destructive bulk action needs explicit AlertDialog confirmation |
| Controlled dropdown component | 06.1-01 | Lift isOpen state to parent prevents corruption during drag transforms |
| Remove stopPropagation from dropdown | 06.1-01 | Allow dnd-kit events to propagate for drag functionality |
| Drag handle on dropdown right side | 06.1-01 | setActivatorNodeRef pattern separates toggle from drag interactions |
| Auto-collapse dropdown on drag | 06.1-01 | isDragging effect sets isOpen false for cleaner drag UX |
| CSS mask-image for avatar feather | quick-018 | Radial gradient mask softens avatar edges - pure CSS performs better than canvas manipulation |
| Feather classic layout only | quick-018 | Circular avatars benefit from feathering, rectangular hero banners do not |
| Gallery image captions and links | quick-019 | Optional caption and link fields per GalleryImage, edited via popover UI |
| Popover editor for gallery images | quick-019 | Pencil icon opens popover with caption and link fields - cleaner than inline inputs |
| Circular gallery captions only | quick-019 | WebGL rendering supports captions via text prop but not clickable links |
| Carousel supports links | quick-019 | Standard DOM allows anchor wrapping for clickable images in carousel mode |
| Circular gallery tap-to-open-link pattern | quick-020 | WebGL canvas prevents per-image clicks - tap anywhere opens centered image's link |
| Vertical list editor for gallery images | quick-020 | Hidden popover approach poor discoverability - visible inputs make caption/link editing obvious |
| Carousel mode images-only | quick-020 | Simplify carousel to focus on images - circular mode handles captions/links |
| @theme inline for theme token bridge | 07-02 | Makes theme CSS variables available as Tailwind utilities (bg-theme-background, text-theme-text) |
| 15 curated Google Fonts | 07-02 | Hand-picked fonts covering sans, serif, display categories - loaded via next/font/google |
| display: swap for fonts | 07-02 | Prevents FOUT/FOIT - fonts swap smoothly without blocking render |
| Dark theme as default | 07-02 | Per CONTEXT.md - "Dark by default for artist aesthetic" |
| Web Audio fallback for AudioEngine | 12-02 | Superpowered SDK requires license - Web Audio fallback allows development without blocking |
| iOS silent audio unlock pattern | 12-02 | Looping silent MP3 at 0.001 volume keeps iOS media channel active during playback |
| useOptionalEmbedPlayback for audio | 12-02 | Graceful degradation - audio player works outside EmbedPlaybackProvider context |
| Client-side waveform generation | 12-02 | Decode audio buffer and extract 128 peaks, cache results to avoid re-generation |
| Singleton AudioEngine pattern | 12-02 | getAudioEngine() returns shared instance to prevent memory leaks from multiple instances |
| Glassmorphism support | 07-02 | backdrop-filter blur effects for sleek-modern theme with @supports fallback |
| On-demand font loading | 07-02 | next/font only downloads fonts actually rendered - no 15-font bundle penalty |
| Sleek Modern default theme | 07-01 | Per research recommendation - transparent, glass texture, modern aesthetic |
| OKLCH color format | 07-01 | All theme colors use OKLCH to match existing globals.css |
| Preset palettes with custom override | 07-01 | setPalette loads preset, setColor switches to custom mode (paletteId null) |
| Theme store persistence | 07-01 | Entire theme state persists to localStorage under 'linklobby-theme' |
| CSS variable injection | 07-01 | ThemeApplicator sets data-theme attribute and injects CSS vars on :root |
| react-colorful for color picker | 07-04 | Lightweight (2.4kb), zero dependencies, accessible color picker |
| Debounce store updates by 100ms | 07-04 | Local state + debounced store updates prevents UI lag while dragging color picker |
| Palette presets as mini swatches | 07-04 | Visual recognition faster than text labels, matches abstract swatch pattern |
| Custom color label when paletteId null | 07-04 | Clear indicator when user has modified colors beyond presets |
| Horizontal varispeed slider | 12-03 | Simpler than Munyard Mixer's vertical - more familiar UX |
| Vertical drag for rotary knob | 12-03 | Up = increase, down = decrease - better mobile UX than circular tracking |
| Auto-hide track list for single tracks | 12-03 | Only render track list when tracks.length > 1 for cleaner UI |
| Auto-save in reverb config modal | 12-03 | Changes apply immediately via onSave callback - modern UX pattern |
| Color customization via CSS variables | 12-03 | var(--player-foreground, fallback) enables theme overrides with safe defaults |
| Font dropdowns grouped by category | 07-05 | Sans, serif, display categories for easier font discovery |
| Separate heading/body size sliders | 07-05 | Independent control (heading 75-200%, body 75-150%) |
| Conditional blur slider | 07-05 | Only shows for themes with hasGlassEffect: true |
| Game/gallery cards exempt from theming | 07-06 | Fixed arcade aesthetic for games, WebGL for gallery - no theme override |
| Mac OS traffic lights in title bar | 07-06 | Visual signature element for Mac OS theme |
| ThemedCardWrapper routing | 07-06 | Single wrapper selects MacOSCard, GlassCard, or standard based on themeId |
| ThemeApplicator inside ThemeProvider | 07-06 | Custom theme CSS vars coexist with next-themes light/dark mode |
| Background type toggle | 07-07 | Solid/image/video selection via ToggleGroup |
| Video background autoplay muted | 07-07 | Instagram-style background video with muted loop playsInline |
| IntersectionObserver for video | 07-07 | Pause video when not visible for performance |
| Dynamic import for heic2any | 07-fix | Prevents "window is not defined" SSR error - import only when needed client-side |
| sendBeacon for beforeunload save | 07-fix | Best-effort save on page close without blocking dialog |
| 15 boutique fonts | 07-fix | Replaced basic fonts with curated selection: Jakarta, Sora, Playfair, Bebas Neue, etc. |
| hasWindowChrome flag for themes | quick-022 | Distinguishes themes with custom window chrome (System Settings, Mac OS) from standard wrappers |
| Warm cream System 7 palette | quick-022 | oklch(0.95 0.02 80) creates nostalgic beige feel over pure gray |
| Pixel font for headings only | quick-022 | Pix Chicago for retro feel, DM Sans body for readability |
| System 7 beveled CSS utilities | quick-022 | .system7-inset uses box-shadow for authentic 3D button effects |
| Poolsuite fonts (ChiKareGo, Ishmeria, Pixolde) | quick-023 | Custom retro fonts for System Settings theme |
| Card-type conditional rendering in SystemSettingsCard | quick-023 | Link/horizontal get slim frame, hero/square/video get full window chrome |
| Inner box uses theme accent color | quick-023 | White inner box customizable via accent color picker |
| Gallery overflow-visible for full-bleed | quick-023 | Allows circular gallery to extend to viewport edges |
| Retro video control bar | quick-023 | Mac-style control bar at bottom of video cards (System Settings only) |
| Video bar uses Pixolde font | quick-023 | Retro pixel font for authentic Mac look |
| Video bar colors follow theme | quick-023 | Bar bg = text color, text = card-bg color (inverted) |
| Instagram Reels default theme | quick-024 | Replaced Sleek Modern as default theme |
| White cards on Instagram Reels | quick-024 | High contrast white cards with black text on black background |
| Background color picker sync | quick-024 | colors.background and background.value sync when type is solid |
| Clear per-card colors on preset | quick-024 | Selecting theme/palette/reset clears textColor from all cards |
| Use PUT for card upsert | quick-025 | saveCards uses PUT endpoint with Supabase upsert for both new and existing cards |
| Text cards use size-based layout | quick-027 | Text cards support ['big', 'small'] sizing not position-based (w-fit + margins) layout |
| POSITIONABLE_CARD_TYPES is ['mini'] only | quick-027 | Position control only for w-fit cards, size control for sized cards |
| transparentBackground in card.content | quick-028 | Boolean flag makes card background transparent, border remains visible |
| setAllCardsTransparency bulk action | quick-028 | Single action applies transparency to all cards at once |
| ThemedCardWrapper respects transparency | quick-028 | All theme types (Instagram Reels, Mac OS, System Settings) conditionally remove bg when transparent |
| Hidden cards filtered from preview | quick-031 | visibleCards = cards.filter(c => c.is_visible) removes hidden cards completely, not just overlay |
| Dual visibility feedback pattern | quick-031 | Cards list shows all cards with indicators, preview shows only visible cards |
| Icon size range 16-48px with 4px step | quick-032 | Balanced sizing options for social icons, default 24px maintains existing appearance |
| Wrapper div pattern for dynamic sizing | quick-032 | Inline style on wrapper div with w-full h-full on icon for dynamic sizing (react-icons don't accept style prop) |
| Server-side theme injection via inline styles | 08-03 | Prevents flash of unstyled content on public pages - CSS variables set before hydration |
| Ishmeria font for 404 page | 08-03 | Matches retro/poolsuite-inspired aesthetic (per CONTEXT.md) on error pages |
| Dynamic metadata with fallbacks | 08-03 | Generates SEO metadata from profile data with OpenGraph and Twitter cards |
| notFound() for 404 handling | 08-03 | Uses Next.js built-in 404 instead of custom error UI for cleaner separation |
| ImageResponse for OG images | 08-04 | Satori-based OG image generation instead of Puppeteer screenshots - faster, edge-compatible |
| Edge runtime for OG images | 08-04 | Sub-100ms image generation for fast social sharing preview |
| 1-hour sitemap ISR | 08-04 | Balance between search engine freshness and database load (3600s revalidation) |
| Sitemap joins profiles.pages | 08-04 | Single query filtering by is_published for published pages only |
| Theme colors in OG images | 08-04 | OG images use background and text colors from theme_settings for brand consistency |
| Twitter image re-exports OG | 08-04 | Same 1.91:1 aspect ratio allows sharing implementation (twitter-image.tsx re-exports opengraph-image.tsx) |
| Ref-based Map for pause functions | 09-02 | embedsRef.current avoids re-renders when embeds register/unregister |
| useOptionalEmbedPlayback hook | 09-02 | Returns null outside provider for graceful degradation on public pages |
| Disallow private routes in robots | 08-04 | API, editor, settings, insights routes blocked from crawlers via robots.txt |
| Instagram direct embed URL | 09-04 | Instagram oEmbed requires access token - use direct embed URL instead |
| Only Reels marked vertical | 09-04 | Instagram Reels isVertical: true, regular posts can vary aspect ratio |
| TikTok always vertical | 09-04 | TikTok videos are always 9:16 aspect ratio |
| 325px max-width for vertical | 09-04 | Matches TikTok's embed max width for consistent vertical content |
| 177.78% padding-bottom for 9:16 | 09-04 | Padding-bottom technique creates exact 9:16 aspect ratio (16/9 * 100)
| useOptionalEmbedPlayback for embeds | 09-05 | Graceful degradation on public pages where provider might not exist
| Pause resets to thumbnail state | 09-05 | Simplest pause - unloads heavy iframe, saves resources
| ScheduledContent mixin interface | 10-03 | Any card type can have scheduling without modifying content types
| UTC storage with local display | 10-03 | ISO 8601 UTC for storage, Intl.DateTimeFormat for user's timezone display
| Public page schedule filtering | 10-03 | Server-side filter hides future publishAt and past expireAt cards
| Album art square aspect ratio | 10-04 | Album art uses 1:1 aspect ratio for consistency with album covers
| Countdown conversion delay | 10-04 | Card auto-converts to music card 2 seconds after countdown ends to show "Out Now!"
| Card type conversion pattern | 10-04 | Update card_type and content in single updateCard call for atomic conversion
| Linktree flat array with parent refs | quick-037 | Linktree __NEXT_DATA__ uses flat array where children have parent.id (int) pointing to GROUP.id (string) |
| JS sorting over DB ORDER BY | quick-037 | Sort cards in JavaScript instead of PostgreSQL to avoid collation mismatches |
| Custom layouts must sort by sortKey | quick-037 | Receipt/iPod/VCR layouts need explicit sortCardsBySortKey since they filter cards |
| Standard Postgres over TimescaleDB | 11-01 | TimescaleDB extension may not be enabled on all instances, use standard tables with comment for future scale |
| Daily-rotating salt for visitor hashing | 11-01 | SHA-256(IP + UA + dailySalt) for privacy-safe unique visitors, no persistent tracking |
| Document click listener for tracking | 11-01 | Single listener with data-card-id bubbling avoids modifying every card component |
| Always return 200 from tracking API | 11-01 | Tracking failures should never break user experience, log errors but return success |
| RLS policies for analytics tables | 11-01 | INSERT for anon (public tracking), SELECT only by page owner (auth.uid() matches page user_id) |
| Cookie banner after 100px scroll | 11-02 | Avoids obstructing page on initial load while ensuring consent collected before significant interaction |
| Auto-generated privacy policy | 11-02 | generatePrivacyPolicy() produces different content based on enabled features (pixels, email) for accurate compliance |
| Equal prominence buttons | 11-02 | Accept/reject buttons have same visual weight (size, border) to comply with GDPR requirements |
| Legal footer on all layouts | 11-02 | Footer added to all theme layouts (default, VCR, iPod, Receipt) for consistent compliance |
| Recharts for analytics visualization | 11-03 | React-native integration, good defaults for dashboards, area charts with gradient fills |
| Unique Visitors as hero metric | 11-03 | Primary metric representing growth and reach, Total Views as secondary context |
| Top 3 card highlighting | 11-03 | Gold/silver/bronze borders make top performers immediately recognizable in leaderboard |
| JSZip for data export | 11-05 | Client-side ZIP generation reduces server load, no temporary file storage needed |
| 30-day deletion grace period | 11-05 | Industry best practice (GitHub, Google) prevents permanent accidental data loss |
| Username confirmation for deletion | 11-05 | Prevents accidental deletion - user must type exact username in AlertDialog |
| Analytics export aggregated only | 11-05 | Total counts included, raw visitor hashes excluded for third-party privacy |
| Immediate unpublish on deletion | 11-05 | Page becomes inaccessible during grace period, account disabled until recovery |
| VT323 + Courier Prime for Macintosh theme | quick-039 | Authentic pixel font for titles, monospace for body text - loaded from Google Fonts |
| 3px borders + double box-shadow | quick-039 | Pixel-art 3D depth: 4px cardBg shadow + 6px text shadow for classic Mac window look |
| MacintoshCard thin/full routing | quick-039 | link/horizontal/mini get slim frames, all others get full title bar with lines and close box |
| CSS var references in box-shadow | quick-039 | Use var(--theme-text) and var(--theme-card-bg) in inline styles for palette-reactive shadows |
| Colorway UI for any theme with palettes | quick-041 | Show colorway swatches below selected theme card when palettes.length > 0, reusable for all themes |
| Transparent flag on palettes | quick-041 | Optional transparent?: boolean on palette entries controls card transparency when colorway selected |
| handleColorwaySelect side effects | quick-041 | setPalette + clearCardColorOverrides + setAllCardsTransparency in one action for clean state |
| Three.js dynamic import ssr:false | quick-049 | Three.js requires WebGL, cannot server-render - dynamic import with ssr disabled |
| drei Html for card overlay | quick-049 | Renders React DOM on 3D card surface - preserves CSS blend modes and interactivity |
| e.stopPropagation on card UI | quick-049 | Prevents Three.js drag handler from capturing arrow clicks and link interactions |
| Camera z=37 for badge framing | quick-049 | User-specified cameraDistance=37 from ReactBits URL parameter |
| Reuse receipt fonts/textures | quick-049 | Conference badge shares receipt paper aesthetic - Hypermarket + Ticket De Caisse |
| Mobile physics optimization | quick-049 | 30fps physics timestep and lower DPR on mobile for performance |
| Special Elite Google Font | quick-050 | Real 1940s Smith Corona typewriter font for authentic classified document aesthetic |
| 420px classified paper width | quick-050 | Wider than receipt (320px) to suggest A4 document proportions |
| No photo/stickers in classified | quick-050 | Military documents don't have photos - clean document aesthetic |
| Red accent for stamps + headers | quick-050 | Distinct from purple-blue body text, matches real WWII classified docs |
| Unicode transport symbols for Poolsuite | quick-051 | ▶ ‖ ◀◀ ▶▶ ♪ match retro aesthetic, avoid Lucide icon dependency |
| Teal active button oklch(0.88 0.06 180) | quick-051 | Matches Poolsuite FM signature blue-green highlight |
| Halftone dot pattern on slider unfilled area | quick-051 | Macintosh Calculator aesthetic - radial-gradient dots at 3px spacing |
| Hidden range input with visual thumb overlay | quick-051 | Accessible slider with custom Poolsuite visual styling |
| No album art in Poolsuite player | quick-051 | Compact card layout - dense efficient player matching reference design |
| System Settings is compact audio theme | quick-051 | Joins receipt/VCR/classified as compact variant with bordered controls |
| Per-theme scatter layouts | 12.1-01 | card.content.scatterLayouts keyed by ThemeId allows different card arrangements per theme |
| Percentage-based scatter positioning | 12.1-01 | ScatterPosition uses percentages (0-100) for responsive layouts across viewport sizes |
| Grid-based scatter initialization | 12.1-01 | initializeScatterLayout distributes cards in grid pattern when scatter mode first enabled |
| visitorDrag depends on scatterMode | 12.1-01 | setScatterMode(false) auto-disables visitorDrag (one-way dependency) |
| Scatter toggle before border radius | 12.1-03 | Freeform Layout toggle positioned at top of style controls for visual prominence |
| Visitor drag indented with border | 12.1-03 | border-l-2 indentation shows visitor drag is a child toggle of scatter mode |
| Conditional scatter rendering | 12.1-03 | Preview renders ScatterCanvas only when scatterMode=true AND isScatterTheme(themeId) |
| SystemSettingsCard wraps audio on public pages | quick-053 | Audio player wrapped in System 7 window chrome on public pages, matching editor preview |
| CSS variable fallbacks for system-settings player | quick-053 | var(--theme-card-bg, #F9F0E9) and var(--theme-text, #000000) prevent transparent buttons |
| Macintosh audio hardcoded colors | quick-053 | Use #fff text and #000 bg for Macintosh player - always black/white for authentic 8-bit aesthetic |
| Text PLAY/PAUSE for Macintosh | quick-053 | Plain text instead of unicode symbols for simpler 8-bit look |
| Checkerboard progress fill | quick-053 | repeating-conic-gradient for classic Macintosh UI pattern, no image assets |
| 3px Macintosh borders | quick-053 | Thicker borders (3px vs 1px) create authentic pixel-art aesthetic |
| iPod audio hardcoded dark colors | quick-054 | #1a1a1a bg, #c0c0c0 borders - consistent dark aesthetic regardless of iPod colorway |
| Now Playing screen navigation in iPod | quick-054 | Audio cards navigate to dedicated screen with AudioCard themeIdOverride="ipod-classic" |
| Music note U+266B for audio indicator | quick-054 | Replaces > arrow in iPod menu for audio cards to visually distinguish them |
| Receipt texture OFF by default | quick-055 | Clean receipt look by default, users opt-in to paper/plastic texture overlays |
| CSS class toggle for pseudo-elements | quick-055 | .receipt-paper.receipt-paper-texture::after/::before - class presence controls overlay visibility |
| AuxMono monospace for departures board | quick-056 | Custom local font loaded via localFont(), --font-aux-mono CSS variable, all text uppercase |
| Generated flight data from card index | quick-056 | Times derived from index (06:00, 06:30...), gates from index (A1, B2, C3...), all show "ON TIME" |
| 520px board container width | quick-056 | Wider than receipt (320px) for tabular column layout, responsive down to 100% on mobile |
| Four departures board palettes | quick-056 | Terminal Classic (silver), Amber Display (CRT), Green Screen (phosphor), Heathrow Blue (modern) |
| Audio maps to classified variant | quick-056 | departures-board audio uses themeVariant="classified" to avoid adding new ThemeVariant across files |
| Lazy AudioContext init on play() | quick-057 | Mobile browsers require AudioContext creation in user gesture - defer init to first play tap, not useEffect mount |
| setPendingTrack for deferred loading | quick-057 | Store track URL before engine init, play() loads after init - prevents loadTrack throwing when engine not started |
| setIsPlaying after await play() | quick-057 | Prevents phantom playing state on mobile when init fails - only set true after successful play |
| Top-sliding drawer for mobile card type | quick-060 | Drawer slides from top (direction="top") instead of bottom for better preview visibility below |
| Conditional size toggle in drawer | quick-060 | Big/Small buttons only render when CARD_TYPE_SIZING[card.card_type] is non-null |
| Mobile phone frame with gestures | quick-061 | 375x667 phone frame with @use-gesture/react pinch-to-zoom (0.1x-3x) and drag-to-pan on mobile layout |
| touch-action: none for gestures | quick-061 | Prevents browser default pinch-zoom from interfering with custom gesture handling |
| Expandable drawer controls | quick-061 | "More" section in drawer reveals font size (theme store) and text color (card.content) controls |
| Pattern on fixed div not body | quick-062 | Pattern rendered by fixed div layer, body gets solid color only as safe area fallback |
| -50vh/-50vw oversized fixed div | quick-062 | Fixed div extends 50% viewport in all directions for guaranteed full coverage without calc/env |
| 500px pattern tiles | quick-062 | Pattern tile size increased from 350px to 500px for better visibility on mobile |
| react-rnd for scatter mode | 12.1-02 | react-rnd library for drag and resize - battle-tested, supports bounds and 8-direction resizing |
| ResizeObserver for canvas | 12.1-02 | ResizeObserver tracks canvas container dimensions, more accurate than window resize events |
| Bounds key recalculation | 12.1-02 | Incrementing boundsKey in ScatterCard key forces react-rnd remount for fresh bounds calculation on window resize |
| Percentage storage, pixel display | 12.1-02 | Store positions as percentages for responsive layouts, convert to pixels for react-rnd rendering |
| Visitor drag uses pointer events | 12.1-04 | Native pointer/touch events instead of react-dnd-kit for lighter weight, server-renderable when visitorDrag=false |
| 8px drag threshold for click vs drag | 12.1-04 | < 8px movement = click (follows link), >= 8px = drag - prevents accidental drags on taps |
| Ephemeral drag offsets | 12.1-04 | Visitor drag positions stored in useState, reset on refresh - artist layout is source of truth |
| isPoolsuite replaces isSystemSettings | quick-067 | Unified routing: mac-os, instagram-reels, system-settings, blinkies all use Poolsuite player layout |
| detectPlatformLoose domain fallback | quick-069 | URL.hostname includes() checks when strict regex fails — no regex needed for domain matching |
| generic-music in MusicPlatform not EmbedPlatform | quick-069 | Fallback display type, not an embeddable platform — keeps EmbedPlatform clean |
| embeddable flag backward compat | quick-069 | embeddable:undefined treated as true — existing iframe cards unaffected |
| MusicLinkFallback for all non-iframe states | quick-069 | Single fallback component for embeddable:false AND iframe load errors |
| DevTemplateSaver in dashboard-header.tsx not editor-header.tsx | 12.2-02 | editor-header.tsx didn't exist; dashboard-header.tsx IS the rendered editor header; created editor-header.tsx as barrel re-export |
| NEXT_PUBLIC_DEV_TOOLS gate via process.env check | 12.2-02 | Component returns null at top of render if env not set — self-gating, zero impact on production |
| TemplateTheme omits pixels | 12.2-01 | Tracking pixel config (Facebook, GA4) is user-specific — never cloned from templates into another user's page |
| TemplateProfile omits avatarUrl/logoUrl | 12.2-01 | Profile photos always user-supplied — templates only suggest display toggles and colors |
| themeId string not ThemeId union | 12.2-01 | Forward-compatible — new themes don't require updating all template type references |
| mediaAssets relative filenames | 12.2-01 | Apply route prefixes with template.id — keeps template definitions path-agnostic |
| Template data at src/lib/templates/data/{theme-id}/ | 12.2-01 | One file per template, named export pattern — easy to add templates per theme |
| Template apply is Node.js runtime (not Edge) | 12.2-03 | Needs fs.readFileSync to read template asset files from disk |
| Non-fatal asset upload failures | 12.2-03 | Missing/failed assets log warn and skip — card inserts still proceed, missing image beats failed apply |
| fetchUserPage() + getUser() dual auth | 12.2-03 | fetchUserPage gives pageId, getUser gives userId for user-scoped storage paths |
| User-scoped template asset paths: {userId}/{uuid}.{ext} | 12.2-03 | Each user gets their own copy of template assets in storage, not shared paths |
| POSITION_REVERSE map for response | 12.2-03 | Converts DB position_x integer back to HorizontalPosition string for Card type |
| 6 zine fonts via Google Fonts | quick-070 | Permanent Marker, Special Elite, Abril Fatface, Bangers, Rock Salt, Courier Prime — loaded on-demand |
| nth-child cycling for ransom-note title | quick-070 | Characters styled by index % 5 cycling through font/bg/rotation combos matching exact CSS nth-child rules |
| 4 torn-paper clip-path variants | quick-070 | Cards cycle through 4 irregular polygon clip-paths with alternating dark/light backgrounds |
| Grayscale + tape profile photo | quick-070 | grayscale(100%) contrast(120%) filter with semi-transparent tape overlay element |
| Chaotic Zine uses classified audio variant | quick-070 | Dark-ink theme maps to classified audio player variant |
| isListLayout for Chaotic Zine | quick-070 | Custom layout replaces standard flow grid — same pattern as classified/receipt/departures-board |

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
| 015 | Fix Phase 6 multi-select, dropdown drag-drop, context menu | Complete | 22ab61b |
| 016 | Fix dropdown card management - remove card | Complete | edadcc1 |
| 017 | Fix dropdown CardRenderer import + visual stability | Complete | a6697fa |
| 018 | Add feather effect slider to profile photo | Complete | c09109b |
| 019 | Gallery image links and captions | Complete | 4432753 |
| 020 | Gallery circular links editor redesign | Complete | 3ecff1b |
| 021 | Gallery upload UI polish (plus icon button) | Complete | 8257065 |
| 022 | System Settings theme with Classic Mac aesthetic | Complete | 0d8b7f0 |
| 023 | System Settings theme refinements (Poolsuite style) | Complete | c967d8e |
| 024 | Remove Sleek Modern, white cards, reset per-card colors | Complete | 6ff2ed8 |
| 025 | Fix duplicate card function - not persisting to database | Complete | 84c73bf |
| 027 | Text cards horizontal stacking support | Complete | 1b9a42d |
| 028 | Transparent card background toggle with Apply to All | Complete | 9416989 |
| 029 | Analyze social icons implementation and improvements | Complete | 98d9139 |
| 030 | Expand social icons to 25+ platforms with brand icons | Complete | 502233e |
| 031 | Hide card toggle in cards list | Complete | 05ae720 |
| 032 | Social icon size slider (16-48px) | Complete | 8af2f89 |
| 033 | iPod Classic theme with click wheel navigation | Complete | d50f247 |
| 034 | iPod theme screen polish | Complete | 45e24b4 |
| 036 | Release card theme integration (iPod, VCR, Receipt) | Complete | 91e9fa5, 513e3f7, 34bbeda |
| 037 | Fix Linktree import ordering | Complete | 6028dbb, 7c5635e, dd1ab62, 3d8c516 |
| 038 | Clean up design tab controls per theme | Complete | 677fcdc, 1e8a1f2 |
| 039 | Classic Macintosh theme with window chrome | Complete | 259704d |
| 040 | Macintosh background pattern zoom in (8px -> 200px) | Complete | 4f306eb |
| 041 | System Settings theme colorways (5 presets) | Complete | f7d8838, 3d051a5 |
| 042 | Fix card drag reorder (IDs not indices) | Complete | 979a8cb |
| 043 | Macintosh gallery card in large window | Complete | fd68b8c, f2ae195 |
| 044 | Mac gallery full-bleed with 8-bit arrows | Complete | facd477 |
| 045 | Macintosh menu bar: File Edit View [username] | Complete | 1153a0b |
| 049 | Lanyard Badge theme with 3D card and swipeable views | Complete | 9ab52af...f5adae3 |
| 050 | Classified Document theme with WWII military aesthetic | Complete | 3ca9a15, c8dcdf0 |
| 050 | Classified Document theme (WWII military aesthetic) | Complete | 3ca9a15, c8dcdf0 |
| 051 | Poolsuite FM audio player for system-settings theme | Complete | ba33ef6, d4403c0 |
| 052 | Fix Poolsuite audio player not playing on public pages | Complete | c4954da |
| 053 | Macintosh audio card VCR-style | Complete | 1f17db3, 10306e3 |
| 053b | Fix Poolsuite audio transparent colors on public pages | Complete | 7fc0fc9, 719ad58 |
| 054 | iPod audio card with Macintosh-style dark layout | Complete | 8e2db69, 893c6fe |
| 055 | Receipt paper texture toggle (OFF by default) | Complete | da87b95, e3a614c |
| 056 | Departures Board theme with airport display aesthetic | Complete | f17b87b, c785150 |
| 057 | Fix mobile audio playback (lazy AudioEngine init) | Complete | ba30282 |
| 058 | Mobile quick access settings bar | Complete | 0409dbc, 82f6e93 |
| 059 | Mobile compact card type drawer | Complete | 24af983, 045dc74 |
| 060 | Card type drawer size and top slide | Complete | 94acf5e |
| 061 | Mobile phone zoom and drawer expand | Complete | e72eb1f, 429a19e |
| 062 | Macintosh pattern bg fixed fullscreen | Complete | 21d2b3f, 79bf951 |
| 063 | Fix audio card not working in scatter mode | Complete | a1f777f |
| 064 | Blinkies theme with animated link cards | Complete | 385d23e, 941cc89, 20ba895 |
| 065 | WAV/FLAC/AIFF to MP3 conversion on upload | Complete | ef14a41, 3056d15 |
| 066 | Blinkies audio mobile drawer three-tab layout | Complete | 71ba66b |
| 067 | Poolsuite audio player for all standard themes | Complete | d1ee11d |
| 069 | Fix music card link paste — loose detection + link fallback | Complete | c58b996, 442123c, 78c1e48 |
| 070 | Chaotic Zine theme — ransom-note title, torn paper cards, tape photo | Complete | 4126ce1, 874c857, b1b77e4 |
| 070 | Chaotic Zine theme with ransom-note title and torn paper | Complete | 4126ce1, 874c857, b1b77e4 |
| 072 | glitchGL background effects (CRT/Pixel/Glitch) | Complete | 959f1e0, 77eeb21 |
| 074 | Featured Themes tab as default editor landing tab | Complete | 1433a5e, 3944f35 |
| 075 | Featured themes apply on click and mobile preview dismiss | Complete | 637a753, 7bfdc4d |

## Phase 10 Progress (IN PROGRESS)

| Plan | Name | Status |
|------|------|--------|
| 01 | Email Collection Infrastructure | Complete ✓ |
| 02 | QR Code and Email Tools | Complete ✓ |
| 03 | Link Scheduling | Complete ✓ |
| 04 | Release Card | Complete ✓ |

**Summaries:**
- Plan 01: .planning/phases/10-fan-tools/10-01-SUMMARY.md
- Plan 02: .planning/phases/10-fan-tools/10-02-SUMMARY.md
- Plan 03: .planning/phases/10-fan-tools/10-03-SUMMARY.md
- Plan 04: .planning/phases/10-fan-tools/10-04-SUMMARY.md

**Plan 02 commits (2026-02-04):**
- `9908c3a` - feat(10-02): QR code generation dialog with download options
- `f4f8f56` - feat(10-02): email export API and CSV download
- `74bb547` - feat(10-02): Mailchimp sync and settings tab with fan tools

**Plan 02 key deliverables:**
- QR code dialog with SVG/PNG download at multiple sizes
- Email export API with CSV download
- Mailchimp integration for email sync
- Settings tab added to editor with all fan tools

**Plan 03 commits (2026-02-04):**
- `f2cd74c` - feat(10-03): add scheduling fields to card content type
- `e611108` - feat(10-03): create Schedule tab and card item components
- `5b05964` - feat(10-03): add schedule badges and public page filtering

**Key deliverables:**
- ScheduledContent interface with publishAt/expireAt timestamps
- Schedule tab in editor with categorized cards (Scheduled/Active/Expired)
- datetime-local inputs with UTC storage and local display
- Schedule badges on preview cards
- Public page filtering by schedule dates

**Plan 04 commits (2026-02-04):**
- `cc5cb73` - feat(10-04): install react-countdown and add release card type
- `d8096d9` - feat(10-04): create release card component with countdown
- `8fa83fd` - feat(10-04): integrate release card with editor and store

**Plan 04 key deliverables:**
- Release card type with ReleaseCardContent interface
- Countdown timer using react-countdown library
- Pre-save button with customizable text
- Album art upload with square aspect crop
- Auto-conversion to music card when countdown completes

## Phase 9 Progress (COMPLETE)

| Plan | Name | Status |
|------|------|--------|
| 01 | Platform Detection Foundation | Complete ✓ |
| 02 | Playback Coordination Context | Complete ✓ |
| 03 | Music Card Component | Complete ✓ |
| 04 | Vertical Video Embed Support | Complete ✓ |
| 05 | Editor Integration | Complete ✓ |
| 06 | Platform Verification | Deferred |

**Summaries:**
- Plan 01: .planning/phases/09-platform-integrations/09-01-SUMMARY.md
- Plan 02: .planning/phases/09-platform-integrations/09-02-SUMMARY.md
- Plan 03: .planning/phases/09-platform-integrations/09-03-SUMMARY.md
- Plan 04: .planning/phases/09-platform-integrations/09-04-SUMMARY.md
- Plan 05: .planning/phases/09-platform-integrations/09-05-SUMMARY.md

**Key deliverables:**
- MusicCard renders in CardRenderer switch statement
- MusicCardFields in property editor for music card type
- Music card in Add Card dropdown menu
- Playback coordination with useOptionalEmbedPlayback in music-card.tsx and video-card.tsx
- Starting one embed pauses others (resets to thumbnail state)

## Session Continuity

Last session: 2026-02-24
Last activity: 2026-02-24 - Completed quick task 075: Featured themes apply and mobile preview
Stopped at: Quick task 075 complete
Resume file: None

**Phase 12.2 In Progress:** Plans 01-02 complete. Template type system + dev snapshot tool ready. Need Plan 03 (template picker UI) next.

**Next step:** Execute Phase 12.2 Plan 03 - Template Picker UI

**This session's work (2026-02-03):**

### Dynamic Route and 404 Page (Plan 08-03)

Implemented dynamic public page route with server-side rendering:

**Changes:**
- Created ThemeInjector component for server-side CSS variable injection
- Built [username] dynamic route with Next.js 16 async params pattern
- Added global 404 page with Ishmeria font
- Implemented dynamic metadata generation (title, description, OpenGraph, Twitter cards)
- Server-side theme injection prevents flash of unstyled content

**Result:** Users can visit linklobby.com/username to see published pages. Invalid/unpublished usernames show 404 with retro font.

**Commits:**
- `fbe89b3` - feat(08-03): create ThemeInjector component for server-side CSS variables
- `3f7452f` - feat(08-03): create dynamic [username] route with SSR and metadata
- `ec61ef9` - feat(08-03): create global 404 page with Ishmeria font

---

**Earlier this session's work (2026-02-03):**

### Static Render Components (Plan 08-02)

Created server components for rendering public pages:

**Changes:**
- StaticFlowGrid: Non-interactive card grid with filtering/sorting
- StaticProfileHeader: Server-rendered profile header (Classic and Hero layouts)
- PublicPageRenderer: Complete page composition

**Result:** Zero client-side JavaScript for core public page layout.

**Commits:**
- `007e789` - feat(08-02): create StaticFlowGrid component
- `332df1c` - feat(08-02): create StaticProfileHeader component
- `d0938eb` - feat(08-02): create PublicPageRenderer component

---

**Earlier this session's work (2026-02-03):**

### Expand Social Icons to 25+ Platforms (Quick Task 030)

Expanded social icon support from 5 to 25+ platforms with proper brand icons:

**Changes:**
- Installed react-icons package for Simple Icons brand SVGs
- Expanded SocialPlatform type to 25+ platforms
- Replaced Lucide icons with brand icons (SiInstagram, SiTiktok, SiSpotify, etc.)
- Added categorized icon picker UI (Popular, Music, Social, Streaming, etc.)
- Added URL detection patterns for all platforms in Linktree import
- Expanded LINKTREE_SOCIAL_TYPE_MAP for import type mapping

**New platforms:** SoundCloud, Apple Music, Bandcamp, Deezer, Amazon Music, Facebook, Threads, Bluesky, Snapchat, Pinterest, LinkedIn, WhatsApp, Twitch, Kick, Discord, Website, Email, Patreon, Venmo, CashApp, PayPal

**Commits:**
- `f9d31e9` - feat(quick-030): add 25+ social platforms with brand icons
- `502233e` - feat(quick-030): add URL patterns for 25+ platforms in Linktree import

---

### Transparent Card Background Toggle (Quick Task 028)

Added transparency feature for cards with bulk apply functionality:

**Changes:**
- Added `setAllCardsTransparency(transparent: boolean)` action to page-store.ts
- Added Switch toggle for "Transparent Background" in card property editor
- Added "Apply to All" button next to toggle with toast notification
- Updated ThemedCardWrapper to accept `content` prop and conditionally remove background
- Updated MacOSCard to accept `transparentBackground` prop
- Updated SystemSettingsCard to accept `transparentBackground` prop
- CardRenderer passes card.content to ThemedCardWrapper

**Result:** Users can make individual cards or all cards transparent, showing page background through bordered cards.

**Commits:**
- `21766a1` - feat(quick-028): add transparency toggle with Apply to All
- `c0ea8b6` - feat(quick-028): apply transparency in themed card wrappers
- `9416989` - feat(quick-028): pass card content to themed wrapper

---

**Previous session's work (2026-02-02):**

### Text Cards Horizontal Stacking (Quick Task 027)

Enabled text cards to stack horizontally when sized as "small":

**Changes:**
- Updated `CARD_TYPE_SIZING` to support `text: ['big', 'small']` instead of `null`
- Removed text from `isPositionableCard` in preview-sortable-card.tsx
- Removed text from `POSITIONABLE_CARD_TYPES` in card-property-editor.tsx
- Text cards now use size-based layout (big/small) like hero/square/video/gallery
- Small text cards stack side-by-side on same row
- Position control (left/center/right) only for w-fit cards like mini

**Result:** Text cards have size picker in property editor, two small text cards appear side-by-side.

**Commits:**
- `7eb22a4` - feat(quick-027): add text card sizing support to type system
- `e694403` - feat(quick-027): enable size-based layout for text cards
- `1b9a42d` - feat(quick-027): remove position control from text cards

---

### Duplicate Card Persistence Fix (Quick Task 025)

Fixed duplicate card function which wasn't persisting to database:

**Root Cause:** `saveCards` used PATCH for all cards, but duplicated cards have new UUIDs that don't exist in the database yet. Supabase `.single()` failed when trying to update non-existent rows.

**Solution:**
- Added `upsertCard` function to `src/lib/supabase/cards.ts` using Supabase's `.upsert()` with `onConflict: 'id'`
- Added PUT endpoint to `/api/cards/[id]` for upsert operations
- Changed `saveCards` to use PUT instead of PATCH
- Kept PATCH endpoint for backward compatibility

**Result:** Duplicate cards now persist correctly to database after auto-save.

**Commit:** `84c73bf` - fix(quick-025): use upsert for duplicate card persistence

---

**Previous session's work (2026-01-31):**

### System Settings Theme Refinements (Quick Task 023)

Refined the System Settings theme to match Poolsuite FM aesthetic:

**1. New Fonts Added**
- ChiKareGo (Poolsuite pixel font)
- Ishmeria (default heading font for theme)
- Pixolde (used for retro video control bar)

**2. Card Styling Updates**
- Multi-layer framing: cream outer box with white inner box
- Thin 1px borders (reduced from 2px)
- Subtle rounded corners (6px outer, 4px inner)
- Close button (×) without border box
- Card-type specific rendering:
  - Hero/square/video: Full window chrome with title bar
  - Link/horizontal: Slim frame, no title bar

**3. Default Theme Colors**
- Background: #F6D5D5 (light pink)
- Card background: #F9F0E9 (warm cream)
- Inner box: white (customizable via accent picker)
- Text: pure black

**4. Gallery Full-Bleed Fix**
- Added overflow-visible to ThemedCardWrapper for gallery
- Added overflow-visible to SortableFlowCard for gallery
- Added overflow-visible to PreviewSortableCard for gallery
- Circular gallery now extends to viewport edges

**5. Retro Video Control Bar**
- Mac-style control bar at bottom of video cards
- Only appears on System Settings theme
- Play/pause buttons, filename, aspect ratio, expand icon
- Uses Pixolde font
- Bar color = theme text color (black)
- Text color = theme card-bg color (cream/white)
- Colors update when theme colors change

**Commits (13 total):**
- `9221625` - Add Poolsuite fonts and multi-layer framing
- `ff9732a` - Thin 1px borders
- `53a9ee2` - Remove title bar line, customizable inner box
- `89d1be2` - Same border thickness inner/outer
- `e079e74` - Same black border color inner/outer
- `97e3679` - Spacing and border adjustments
- `7d390c2` - Default colors (#F6D5D5, #F9F0E9, white)
- `c170e81` - Card-type variations (slim for link/horizontal)
- `786f69a` - 1px borders (final)
- `719e9bf` - Black text default
- `114bec9` - Gallery full-bleed overflow fix
- `98fe336` - Lighter borders (reverted)
- `67eb29a` - Retro video control bar
- `2765fee` - Pixolde font and theme colors for bar
- `c967d8e` - All-black bar styling

---

**Previous session's work (2026-01-29):**

### Bug Fixes & Improvements

1. **HEIC Image Conversion Fix**
   - Problem: "window is not defined" SSR error when importing heic2any
   - Solution: Changed to dynamic import in 3 files:
     - `src/components/editor/design-panel.tsx`
     - `src/components/editor/header-section.tsx`
     - `src/components/cards/image-upload.tsx`
   - Pattern: `const heic2anyModule = await import('heic2any')`

2. **Profile Auto-Save Fix**
   - Problem: Profile changes (including photos) not persisting after refresh
   - Solution: Added immediate save after photo upload in design-panel.tsx
   - Also reduced debounce from 1000ms to 500ms for snappier saves

3. **Database Schema Fixes** (user ran SQL in Supabase)
   - Added `header_text_color` column to profiles table
   - Added `avatar_feather` column to profiles table
   - Fixed 500 errors on profile save

4. **Removed Annoying Reload Dialog**
   - Removed `e.preventDefault()` and `e.returnValue` from beforeunload
   - Now uses `sendBeacon` for best-effort save without blocking

### Font System Upgrade

Replaced basic fonts with **15 curated boutique fonts** in `src/app/fonts.ts`:

**Boutique Sans-Serif:**
- Plus Jakarta Sans, Sora, Space Grotesk, DM Sans, Outfit, Manrope, Josefin Sans

**Boutique Serif:**
- Playfair Display, Cormorant Garamond, Instrument Serif, Fraunces

**Display/Distinctive:**
- Bebas Neue, Archivo Black, Syne, Krona One

**Kept Retro/Pixel fonts:**
- Auto Mission, New York, Pix Chicago, Village

### Attempted (Reverted)

- Font hover preview feature: Tried to make live preview update as user hovers over fonts in dropdown. Broke the Select dropdown - reverted to simple implementation.

---

**Previous session's work (2026-01-28):**

Executed Phase 7 Theme System (7 plans across 5 waves):

1. **Wave 1 (parallel):**
   - 07-01: Theme Infrastructure - types, store, 3 theme configs, ThemeApplicator
   - 07-02: CSS Variables & Fonts - 15 curated Google Fonts, theme token bridge

2. **Wave 2 (parallel):**
   - 07-03: Theme Selection UI - ThemePresets cards, ThemePanel with tabs
   - 07-04: Color Customization - react-colorful, ColorPicker, palette presets

3. **Wave 3:**
   - 07-05: Font & Style Controls - FontPicker, StyleControls, blur slider

4. **Wave 4:**
   - 07-06: Card Theme Integration - MacOSCard, GlassCard, ThemedCardWrapper

5. **Wave 5 (checkpoint):**
   - 07-07: Background Controls - solid/image/video backgrounds (AWAITING APPROVAL)

**Key commits:**
- `fa5b299` - feat(07-01): create theme store with persistence
- `506188d` - feat(07-02): extend globals.css with theme CSS variables
- `1e73ffb` - feat(07-03): create ThemePresets component
- `504e53e` - feat(07-04): add ColorPicker component
- `f3f7c45` - feat(07-05): create FontPicker
- `f504958` - feat(07-06): create Mac OS and Glass card wrappers
- `080686c` - feat(07-07): create BackgroundControls component
- `b10d146` - feat(07-07): integrate PageBackground

---
*Updated: 2026-01-27 - Phase 6.1 complete, Phase 6 unblocked*

**Previous session's work:**

1. **Plan 06-05: Dropdown Card UI Component** (3 commits in 2 minutes)
   - Created DropdownCard component with Radix Collapsible (`f4e7b96`)
   - Added slideDown/slideUp CSS animations (`4570aaf`)
   - Integrated DropdownCard into CardRenderer (`69d65eb`)
   - Established children slot pattern for nested card rendering

**Key commits this session:**
- `f4e7b96` - feat(06-05): create DropdownCard component
- `4570aaf` - feat(06-05): add dropdown animation CSS
- `69d65eb` - feat(06-05): integrate DropdownCard into CardRenderer

---
*Updated: 2026-01-27 - Dropdown Card UI component complete*

2. **Plan 06-09: Breakout Game** (2 commits in 2.4 minutes)
   - Implemented BreakoutGame component with ball/paddle/brick physics (`de7de19`)
   - Integrated BreakoutGame into GameCard with pointer controls (`003324d`)
   - Established pointer events pattern for cross-platform control

3. **Plan 06-08: Snake Game** (2 commits in 2.2 minutes)
   - Implemented SnakeGame with grid-based movement and collision detection (`c0bc8a2`)
   - Integrated SnakeGame into GameCard with dimensions and callbacks (`f5f475e`)
   - Established dual input pattern: keyboard (Arrow/WASD) + touch swipe controls

**Key commits this session:**
- `c0bc8a2` - feat(06-08): implement snake game with keyboard and swipe controls
- `f5f475e` - feat(06-08): integrate snake game into game card

---
*Updated: 2026-01-27 - Snake game complete*

4. **Plan 06-10: Flappy Game** (2 commits in 3 minutes)
   - Implemented FlappyGame component with tap-to-flap mechanics (`e71e164`)
   - Integrated FlappyGame into GameCard (integrated with snake in `f5f475e`)
   - All three games (Snake, Breakout, Flappy) now playable

**Key commits this session:**
- `e71e164` - feat(06-10): implement Flappy Bird game
- `f5f475e` - feat(06-08): integrate snake game into game card (also integrated flappy)

---
*Updated: 2026-01-27 - Flappy game complete, all three games implemented*

5. **Plan 06-13: Box Selection** (4 commits in 5 minutes)
   - Created SelectableFlowGrid with useSelectionContainer hook (`f87d1ce`)
   - Updated PreviewSortableCard with data-selectable-id and MouseEvent onClick (`4a486b6`)
   - Integrated MultiSelectProvider in editor and preview (`cda7256`)
   - Fixed DragSelection usage as sibling component (`8141246`)
   - Box selection via drag creates blue selection rectangle
   - Shift+click toggles individual card selection
   - Selected cards show white ring visual indicator

**Key commits this session:**
- `4a486b6` - feat(06-13): update PreviewSortableCard for box selection
- `f87d1ce` - feat(06-13): create SelectableFlowGrid with box selection
- `cda7256` - feat(06-13): integrate box selection in editor
- `8141246` - fix(06-13): correct DragSelection usage as sibling component

---
*Updated: 2026-01-27 - Box selection complete*

5. **Plan 06-12: Game Card Editor Fields** (4 commits in 2.2 minutes)
   - Created GameCardFields component with visual game type selector (`c966f82`)
   - Added game to cards tab and store defaults (`ca378da`)
   - Integrated GameCardFields into property editor (`9b2ca02`)
   - Fixed type with Partial<GameCardContent> (`fea049a`)
   - Game card now fully editable in property panel

**Key commits this session:**
- `c966f82` - feat(06-12): create GameCardFields component
- `ca378da` - feat(06-12): add game to cards tab and update store defaults
- `9b2ca02` - feat(06-12): integrate GameCardFields into property editor
- `fea049a` - fix(06-12): use Partial<GameCardContent> for optional fields

---
*Updated: 2026-01-27 - Game card editor complete*

6. **Plan 06-14: Selection Toolbar with Bulk Actions** (2 commits in 4 minutes)
   - Created SelectionToolbar component with bulk actions (`4c6a5f0`)
   - Integrated SelectionToolbar into editor panel (`7045936`)
   - Floating toolbar with Group into Dropdown, Move to Dropdown, Delete All
   - Auto-hides when no selection

**Key commits this session:**
- `4c6a5f0` - feat(06-14): create SelectionToolbar component
- `7045936` - feat(06-14): integrate SelectionToolbar into editor

---
*Updated: 2026-01-27 - Selection toolbar complete*

7. **Plan 06-15: Mobile Checkbox Selection Mode** (3 commits in 3 minutes)
   - Created mobile-select-mode.tsx with MobileSelectToggle, MobileSelectCheckbox, MobileSelectionBar (`0f57281`)
   - Added Select toggle to mobile toolbar (`4271b00`)
   - Added checkbox overlay to preview cards (`4e20ace`)
   - Mobile checkbox mode for touch-friendly multi-select

**Key commits this session:**
- `0f57281` - feat(06-15): create mobile select mode components
- `4271b00` - feat(06-15): add select toggle to mobile toolbar
- `4e20ace` - feat(06-15): add checkbox overlay to preview cards

---
*Updated: 2026-01-27 - Mobile checkbox selection mode complete*
