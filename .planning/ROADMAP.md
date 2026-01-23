# Roadmap: LinkLobby

## Overview

LinkLobby delivers a component-based page builder for artists in eleven phases. We start with foundation and authentication, build the shadcn-admin dashboard shell, then implement the free-form canvas system that enables drag-and-drop card placement. Cards are built incrementally: basic shapes first, then media cards with animations, then advanced interactive cards. Theme system skins all components consistently. Integrations add platform embeds. Public pages, analytics, and audio complete the product.

**Architecture:** Cards (shapes) + Content (what's inside) + Themes (visual skin) = Artist's page

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Project scaffolding, Supabase auth, database schema
- [ ] **Phase 2: Dashboard Shell** - shadcn-admin setup, split-screen layout, navigation tabs
- [ ] **Phase 3: Canvas System** - Free-form drag grid, responsive layout engine, card positioning
- [ ] **Phase 4: Basic Cards** - Hero Card, Horizontal Link, Square Card components
- [ ] **Phase 5: Media Cards** - Video Card, Photo Gallery with ReactBits animations
- [ ] **Phase 6: Advanced Cards** - Dropdown (expandable lists), Game Card (Snake)
- [ ] **Phase 7: Theme System** - Mac OS + Sleek Modern themes, color customization
- [ ] **Phase 8: Platform Integrations** - 20+ platform embeds (Spotify, YouTube, TikTok, etc.)
- [ ] **Phase 9: Public Page** - ISR-rendered pages, responsive layout, social sharing
- [ ] **Phase 10: Analytics** - Event tracking, insights tab, engagement metrics
- [ ] **Phase 11: Audio System** - Audio upload, 5 player styles, varispeed/reverb controls

## Phase Details

### Phase 1: Foundation
**Goal**: Establish project scaffolding, authentication, and database schema that all other phases build upon
**Depends on**: Nothing (first phase)
**Success Criteria** (what must be TRUE):
  1. Next.js project initialized with TypeScript, Tailwind, shadcn/ui
  2. Supabase Auth configured with email/password signup
  3. User can sign up and claim a username
  4. User can log in and session persists across browser sessions
  5. Database schema supports profiles, pages, and cards with proper RLS
**Plans**: 3 plans in 2 waves

Plans:
- [ ] 01-01-PLAN.md — Project scaffolding, dependencies, Supabase client setup (Wave 1)
- [ ] 01-02-PLAN.md — Database schema with RLS and triggers (Wave 1)
- [ ] 01-03-PLAN.md — Auth forms, middleware, protected routes (Wave 2)

### Phase 2: Dashboard Shell
**Goal**: Artists can access the split-screen dashboard with editor controls and live preview areas
**Depends on**: Phase 1
**Success Criteria** (what must be TRUE):
  1. shadcn-admin template integrated and customized (dark mode default)
  2. Dashboard displays split-screen: editor controls left, live preview right
  3. Three tabs implemented: Cards, Design, Insights (empty states OK)
  4. Mobile/desktop preview toggle works
  5. Save/discard prompt appears when exiting with unsaved changes
  6. User's username and public URL displayed in header
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Canvas System
**Goal**: Artists can drag cards freely on a grid-constrained canvas with responsive behavior
**Depends on**: Phase 2
**Success Criteria** (what must be TRUE):
  1. Canvas renders in preview area with defined margins and grid
  2. Cards can be dragged to any position within grid constraints
  3. Card positions persist to database
  4. Layout adapts responsively (desktop → tablet → mobile)
  5. Unlimited cards can be added to canvas
  6. Card z-index/layering can be adjusted
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Basic Cards
**Goal**: Artists can add and configure the three foundational card types
**Depends on**: Phase 3
**Success Criteria** (what must be TRUE):
  1. Hero Card: Large prominent CTA with photo, text, or placeholder for embed
  2. Horizontal Link: Wide bar (Linktree-style) with photo, text, or placeholder
  3. Square Card: Small tile with photo, text, or placeholder
  4. All cards support: title, description, URL, and image upload
  5. Cards render correctly on canvas at their designated sizes
  6. Card content editable via sidebar panel when selected
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Media Cards
**Goal**: Artists can showcase video and photo content with engaging animations
**Depends on**: Phase 4
**Success Criteria** (what must be TRUE):
  1. Video Card: Displays video with playback controls (YouTube/Vimeo embed or upload)
  2. Photo Gallery: Multi-image carousel with configurable display
  3. ReactBits animations integrated (auto-scroll, arrows, fancy effects)
  4. Gallery supports multiple photos with add/remove/reorder
  5. Video Card supports short loop option (muted autoplay)
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Advanced Cards
**Goal**: Artists can add interactive elements that engage visitors
**Depends on**: Phase 5
**Success Criteria** (what must be TRUE):
  1. Dropdown Card: Expandable list containing multiple links
  2. Dropdown supports custom collapse/expand text
  3. Game Card: Playable Snake game embedded in card
  4. Game Card tracks high score (local storage or DB)
  5. Both cards render correctly within theme system
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: Theme System
**Goal**: Artists can select themes that skin all cards consistently and customize colors
**Depends on**: Phase 6
**Success Criteria** (what must be TRUE):
  1. Mac OS theme: Shadows, traffic light icons, window-like depth on all cards
  2. Sleek Modern theme: Transparent, glass texture, flat aesthetic on all cards
  3. Theme selection instantly updates all cards in preview
  4. Color customization: background, text, border, accent via color picker
  5. Preset color palettes available per theme
  6. Solid color and gradient background options
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

### Phase 8: Platform Integrations
**Goal**: Artists can embed content from 20+ platforms into their cards
**Depends on**: Phase 7
**Success Criteria** (what must be TRUE):
  1. Music: Spotify, Apple Music, SoundCloud, Audiomack, Bandcamp embeds work
  2. Video: YouTube, TikTok Video, Vimeo embeds work
  3. Social: Instagram, TikTok Profile, Twitter/X link cards work
  4. Events: Bandsintown embed/link works
  5. Payments: PayPal, Venmo, Tip Jar, Shopify links work
  6. Utility: Contact Form card, Generic URL link work
  7. Platform auto-detected from URL where possible
  8. Platform icons display correctly on cards
**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD
- [ ] 08-03: TBD

### Phase 9: Public Page
**Goal**: Visitors can view artist pages that load fast, render correctly, and share well
**Depends on**: Phase 8
**Success Criteria** (what must be TRUE):
  1. Public page at linklobby.com/username loads in under 2 seconds
  2. All cards render with correct theme styling
  3. Canvas layout matches editor preview exactly
  4. Responsive across mobile, tablet, desktop
  5. Open Graph meta tags and preview image for social sharing
  6. Interactive elements (dropdowns, games, galleries) work for visitors
**Plans**: TBD

Plans:
- [ ] 09-01: TBD
- [ ] 09-02: TBD

### Phase 10: Analytics
**Goal**: Artists can track how their page and individual cards perform
**Depends on**: Phase 9
**Success Criteria** (what must be TRUE):
  1. Page views and unique visitors tracked and displayed
  2. Per-card click counts and CTR displayed
  3. Insights tab shows metrics with visual charts
  4. Time period filtering (7 days, 30 days, all time)
  5. Game Card tracks play count
  6. Gallery tracks image views
**Plans**: TBD

Plans:
- [ ] 10-01: TBD
- [ ] 10-02: TBD

### Phase 11: Audio System
**Goal**: Artists can upload audio with styled players and optional effects controls
**Depends on**: Phase 10
**Success Criteria** (what must be TRUE):
  1. Audio upload accepts WAV or MP3 (WAV converts to MP3 server-side)
  2. Audio player renders as card on canvas
  3. Five player styles: Waveform Modern, Vinyl Spinner, OP-1 Tape, Cassette Deck, Classic Minimal
  4. Visitors can play, pause, scrub; never autoplays
  5. Optional varispeed and reverb controls (toggle on/off per page)
  6. Audio plays tracked for analytics
**Plans**: TBD

Plans:
- [ ] 11-01: TBD
- [ ] 11-02: TBD
- [ ] 11-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Planned | - |
| 2. Dashboard Shell | 0/2 | Not started | - |
| 3. Canvas System | 0/2 | Not started | - |
| 4. Basic Cards | 0/2 | Not started | - |
| 5. Media Cards | 0/2 | Not started | - |
| 6. Advanced Cards | 0/2 | Not started | - |
| 7. Theme System | 0/2 | Not started | - |
| 8. Platform Integrations | 0/3 | Not started | - |
| 9. Public Page | 0/2 | Not started | - |
| 10. Analytics | 0/2 | Not started | - |
| 11. Audio System | 0/3 | Not started | - |

---
*Created: 2026-01-23*
*Last updated: 2026-01-23 — Phase 1 planned (3 plans in 2 waves)*
