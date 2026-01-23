# Roadmap: LinkLobby

## Overview

LinkLobby delivers an artist-focused link-in-bio platform in eight phases. We start with foundation and authentication, build the split-screen editor with live preview (the core "magic moment"), layer in advanced link features and themes, then ship public pages. Media uploads, analytics, and audio enhancement complete the product. Audio is intentionally last due to browser compatibility risks identified in research.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Project scaffolding, Supabase auth, core state architecture
- [ ] **Phase 2: Editor Core** - Dashboard shell, live preview iframe, basic link CRUD
- [ ] **Phase 3: Link Features** - Display styles, platform icons, custom icons, animations
- [ ] **Phase 4: Theme System** - Theme selection, color customization, preset palettes
- [ ] **Phase 5: Public Page** - ISR-rendered pages, social sharing, responsive layout
- [ ] **Phase 6: Media** - Logo upload, background options, client-side optimization
- [ ] **Phase 7: Analytics** - Event tracking, insights tab, time period filtering
- [ ] **Phase 8: Audio** - Audio upload, player styles, varispeed/reverb controls

## Phase Details

### Phase 1: Foundation
**Goal**: Establish project scaffolding, authentication, and state architecture that all other phases build upon
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. User can sign up with email and password and claim a username
  2. User can log in and session persists across browser sessions
  3. User can change their username from settings
  4. Database schema supports profiles, pages, and links with proper RLS
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD

### Phase 2: Editor Core
**Goal**: Artists can access the split-screen dashboard and manage basic links with live preview
**Depends on**: Phase 1
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, LINK-01, LINK-02, LINK-03, LINK-04
**Success Criteria** (what must be TRUE):
  1. Dashboard displays split-screen layout with editor controls on left and live preview on right
  2. User can add, edit, delete, and reorder links via drag-and-drop
  3. Preview updates in real-time as user makes changes (no page reload)
  4. User can toggle preview between mobile and desktop views
  5. User sees save/discard prompt when exiting with unsaved changes
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD
- [ ] 02-03: TBD

### Phase 3: Link Features
**Goal**: Artists can express themselves through styled links with icons and animations
**Depends on**: Phase 2
**Requirements**: LINK-05, LINK-06, LINK-07, LINK-08
**Success Criteria** (what must be TRUE):
  1. User can choose display style per link (simple, card with icon, embed player, custom icon, link preview)
  2. User can select platform icons from library (Spotify, Apple Music, YouTube, etc.)
  3. User can upload custom PNG icon for individual links
  4. User can apply hover effects and entrance animations to link buttons
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Theme System
**Goal**: Artists can select themes and customize colors to match their artistic identity
**Depends on**: Phase 3
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-06, DSGN-10
**Success Criteria** (what must be TRUE):
  1. User can select theme (Mac OS frosted glass, Sleek Modern flat)
  2. User can customize colors (background, text, border, accent) with color picker
  3. User can select from preset color palettes that match each theme
  4. User can set solid color background
  5. Theme changes render instantly in preview without page reload
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Public Page
**Goal**: Visitors can view artist pages that load fast, look correct, and share well on social
**Depends on**: Phase 4
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-08, PAGE-09
**Success Criteria** (what must be TRUE):
  1. Public page at linklobby.com/username loads in under 2 seconds
  2. Public page is responsive across mobile, tablet, and desktop
  3. Social sharing displays correct Open Graph meta tags and preview image
  4. All links are visible immediately on page load (no scroll required for core content)
  5. Selected theme styling and custom cursor render correctly on public page
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Media
**Goal**: Artists can upload logos and backgrounds to further personalize their page
**Depends on**: Phase 5
**Requirements**: DSGN-04, DSGN-05, DSGN-07, DSGN-08, DSGN-09
**Success Criteria** (what must be TRUE):
  1. User can upload background image that displays correctly on preview and public page
  2. User can upload background video (8 second loop, muted autoplay)
  3. User can upload logo (PNG with transparency) and position it (top left, center, right)
  4. User can apply logo animation (static, float, DVD bounce)
  5. Uploaded media is optimized client-side before upload (images resized, reasonable file limits)
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: Analytics
**Goal**: Artists can track how their page performs with basic insights
**Depends on**: Phase 6
**Requirements**: ANLYT-01, ANLYT-02, ANLYT-03, ANLYT-04, ANLYT-05, ANLYT-06
**Success Criteria** (what must be TRUE):
  1. User can view total page views and unique visitor count on Insights tab
  2. User can view click count and CTR per link
  3. User can view audio play count (prepared for Phase 8)
  4. User can filter all analytics by time period (7 days, 30 days, all time)
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

### Phase 8: Audio
**Goal**: Artists can upload audio with styled players and optional varispeed/reverb controls
**Depends on**: Phase 7
**Requirements**: AUDIO-01, AUDIO-02, AUDIO-03, AUDIO-04, AUDIO-05, AUDIO-06, AUDIO-07, AUDIO-08, PAGE-05, PAGE-06, PAGE-07
**Success Criteria** (what must be TRUE):
  1. User can upload audio track (WAV or MP3) and WAV files convert to MP3 server-side
  2. User can delete uploaded audio and toggle player visibility on public page
  3. User can select player style (Waveform Modern, Vinyl Spinner, OP-1 Tape, Cassette Deck, Classic Minimal)
  4. Visitors can play, pause, and scrub audio; audio never autoplays
  5. User can enable varispeed and reverb controls that visitors can adjust on public page
**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD
- [ ] 08-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/2 | Not started | - |
| 2. Editor Core | 0/3 | Not started | - |
| 3. Link Features | 0/2 | Not started | - |
| 4. Theme System | 0/2 | Not started | - |
| 5. Public Page | 0/2 | Not started | - |
| 6. Media | 0/2 | Not started | - |
| 7. Analytics | 0/2 | Not started | - |
| 8. Audio | 0/3 | Not started | - |

---
*Created: 2026-01-23*
*Last updated: 2026-01-23*
