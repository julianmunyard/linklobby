# Requirements: LinkLobby

**Defined:** 2026-01-23
**Core Value:** The dashboard and live preview experience - artists watching their page become theirs.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User claims username during signup (linklobby.com/username)
- [ ] **AUTH-03**: User session persists across browser sessions
- [ ] **AUTH-04**: User can change username after signup

### Dashboard & Editor

- [ ] **DASH-01**: Dashboard displays split-screen layout (editor left, preview right)
- [ ] **DASH-02**: Preview updates in real-time as user edits
- [ ] **DASH-03**: User can toggle preview between mobile and desktop views
- [ ] **DASH-04**: User sees save/discard prompt when exiting with unsaved changes
- [ ] **DASH-05**: Dashboard has three tabs: Cards, Design, Insights
- [ ] **DASH-06**: User's username and public URL displayed in header

### Canvas System

- [ ] **CANVAS-01**: Canvas renders in preview area with defined margins and grid
- [ ] **CANVAS-02**: Cards can be dragged to any position within grid constraints
- [ ] **CANVAS-03**: Card positions persist to database
- [ ] **CANVAS-04**: Layout adapts responsively (desktop → tablet → mobile)
- [ ] **CANVAS-05**: Unlimited cards can be added to canvas
- [ ] **CANVAS-06**: Card z-index/layering can be adjusted

### Card Types

**Basic Cards:**
- [ ] **CARD-01**: Hero Card renders as large prominent CTA
- [ ] **CARD-02**: Hero Card supports photo, text, or embed content
- [ ] **CARD-03**: Horizontal Link renders as wide bar (Linktree-style)
- [ ] **CARD-04**: Horizontal Link supports photo, text, or embed content
- [ ] **CARD-05**: Square Card renders as small tile
- [ ] **CARD-06**: Square Card supports photo, text, or embed content
- [ ] **CARD-07**: All basic cards support title, description, URL, and image upload
- [ ] **CARD-08**: Card content editable via sidebar panel when selected

**Media Cards:**
- [ ] **CARD-09**: Video Card displays video with playback controls
- [ ] **CARD-10**: Video Card supports YouTube/Vimeo embed or direct upload
- [ ] **CARD-11**: Video Card supports short loop option (muted autoplay)
- [ ] **CARD-12**: Photo Gallery displays multi-image carousel
- [ ] **CARD-13**: Photo Gallery supports add/remove/reorder images
- [ ] **CARD-14**: Photo Gallery has ReactBits animations (auto-scroll, arrows, effects)

**Advanced Cards:**
- [ ] **CARD-15**: Dropdown Card renders as expandable list
- [ ] **CARD-16**: Dropdown Card contains multiple links inside
- [ ] **CARD-17**: Dropdown Card supports custom collapse/expand text
- [ ] **CARD-18**: Game Card renders playable Snake game
- [ ] **CARD-19**: Game Card tracks high score

### Theme System

- [ ] **THEME-01**: User can select Mac OS theme (shadows, traffic lights, window depth)
- [ ] **THEME-02**: User can select Sleek Modern theme (transparent, glass, flat)
- [ ] **THEME-03**: Theme selection instantly updates all cards in preview
- [ ] **THEME-04**: User can customize colors (background, text, border, accent)
- [ ] **THEME-05**: User can select from preset color palettes per theme
- [ ] **THEME-06**: User can set solid color or gradient background

### Platform Integrations

**Music:**
- [ ] **INTG-01**: Spotify embed works in cards
- [ ] **INTG-02**: Apple Music embed works in cards
- [ ] **INTG-03**: SoundCloud embed works in cards
- [ ] **INTG-04**: Audiomack embed works in cards
- [ ] **INTG-05**: Bandcamp embed works in cards

**Video:**
- [ ] **INTG-06**: YouTube embed works in cards
- [ ] **INTG-07**: TikTok Video embed works in cards
- [ ] **INTG-08**: Vimeo embed works in cards

**Social:**
- [ ] **INTG-09**: Instagram link card works
- [ ] **INTG-10**: TikTok Profile link card works
- [ ] **INTG-11**: Twitter/X link card works

**Events/Payments/Utility:**
- [ ] **INTG-12**: Bandsintown embed/link works
- [ ] **INTG-13**: PayPal link works
- [ ] **INTG-14**: Venmo link works
- [ ] **INTG-15**: Tip Jar / Buy Me A Gift link works
- [ ] **INTG-16**: Shopify (merch) link works
- [ ] **INTG-17**: Contact Form card works
- [ ] **INTG-18**: Generic URL link works

**Platform Detection:**
- [ ] **INTG-19**: Platform auto-detected from URL where possible
- [ ] **INTG-20**: Platform icons display correctly on cards

### Public Page

- [ ] **PAGE-01**: Public page at linklobby.com/username loads in under 2 seconds
- [ ] **PAGE-02**: All cards render with correct theme styling
- [ ] **PAGE-03**: Canvas layout matches editor preview exactly
- [ ] **PAGE-04**: Public page is responsive across mobile, tablet, desktop
- [ ] **PAGE-05**: Open Graph meta tags and preview image for social sharing
- [ ] **PAGE-06**: Interactive elements work (dropdowns, games, galleries)

### Analytics (Insights Tab)

- [ ] **ANLYT-01**: User can view total page views
- [ ] **ANLYT-02**: User can view unique visitor count
- [ ] **ANLYT-03**: User can view click count per card
- [ ] **ANLYT-04**: User can view click-through rate (CTR) per card
- [ ] **ANLYT-05**: User can filter analytics by time period (7 days, 30 days, all time)
- [ ] **ANLYT-06**: Game Card tracks play count
- [ ] **ANLYT-07**: Photo Gallery tracks image views

### Audio System

- [ ] **AUDIO-01**: User can upload audio track (WAV or MP3 accepted)
- [ ] **AUDIO-02**: WAV uploads convert to MP3 server-side
- [ ] **AUDIO-03**: User can delete uploaded audio
- [ ] **AUDIO-04**: User can toggle audio player visibility
- [ ] **AUDIO-05**: Audio player renders as card on canvas
- [ ] **AUDIO-06**: User can select player style (Waveform Modern, Vinyl Spinner, OP-1 Tape, Cassette Deck, Classic Minimal)
- [ ] **AUDIO-07**: Visitors can play, pause, scrub; never autoplays
- [ ] **AUDIO-08**: User can enable/disable varispeed control
- [ ] **AUDIO-09**: User can enable/disable reverb control
- [ ] **AUDIO-10**: Audio plays tracked for analytics

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Analytics

- **ANLYT-V2-01**: User can view geographic breakdown of visitors
- **ANLYT-V2-02**: User can view device type breakdown (mobile, desktop, tablet)
- **ANLYT-V2-03**: User can view traffic sources (Instagram, TikTok, direct, etc.)

### Premium Features

- **PREM-01**: User can connect custom domain
- **PREM-02**: User can hide "Powered by LinkLobby" footer
- **PREM-03**: User can access additional themes

### v2 Integrations

- **INTG-V2-01**: Twitch embed
- **INTG-V2-02**: Clubhouse, Reddit, Pinterest links
- **INTG-V2-03**: NFT Gallery (OpenSea)
- **INTG-V2-04**: Podcast / RSS Feed
- **INTG-V2-05**: Typeform, Gleam embeds
- **INTG-V2-06**: Additional payment options (Square, SendOwl, Spring)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| OAuth login (Google, GitHub) | Email/password sufficient for v1, adds complexity |
| Multi-page support | One account = one page is intentional positioning |
| Real-time chat / social features | Changes positioning from tool to platform |
| Mobile app | Web-first approach, mobile app is v2+ |
| Link scheduling | Nice-to-have, not core value |
| A/B testing for artists | Advanced feature, v2+ |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1: Foundation | Pending |
| AUTH-02 | Phase 1: Foundation | Pending |
| AUTH-03 | Phase 1: Foundation | Pending |
| AUTH-04 | Phase 1: Foundation | Pending |
| DASH-01 | Phase 2: Dashboard Shell | Pending |
| DASH-02 | Phase 2: Dashboard Shell | Pending |
| DASH-03 | Phase 2: Dashboard Shell | Pending |
| DASH-04 | Phase 2: Dashboard Shell | Pending |
| DASH-05 | Phase 2: Dashboard Shell | Pending |
| DASH-06 | Phase 2: Dashboard Shell | Pending |
| CANVAS-01 | Phase 3: Canvas System | Pending |
| CANVAS-02 | Phase 3: Canvas System | Pending |
| CANVAS-03 | Phase 3: Canvas System | Pending |
| CANVAS-04 | Phase 3: Canvas System | Pending |
| CANVAS-05 | Phase 3: Canvas System | Pending |
| CANVAS-06 | Phase 3: Canvas System | Pending |
| CARD-01 | Phase 4: Basic Cards | Pending |
| CARD-02 | Phase 4: Basic Cards | Pending |
| CARD-03 | Phase 4: Basic Cards | Pending |
| CARD-04 | Phase 4: Basic Cards | Pending |
| CARD-05 | Phase 4: Basic Cards | Pending |
| CARD-06 | Phase 4: Basic Cards | Pending |
| CARD-07 | Phase 4: Basic Cards | Pending |
| CARD-08 | Phase 4: Basic Cards | Pending |
| CARD-09 | Phase 5: Media Cards | Pending |
| CARD-10 | Phase 5: Media Cards | Pending |
| CARD-11 | Phase 5: Media Cards | Pending |
| CARD-12 | Phase 5: Media Cards | Pending |
| CARD-13 | Phase 5: Media Cards | Pending |
| CARD-14 | Phase 5: Media Cards | Pending |
| CARD-15 | Phase 6: Advanced Cards | Pending |
| CARD-16 | Phase 6: Advanced Cards | Pending |
| CARD-17 | Phase 6: Advanced Cards | Pending |
| CARD-18 | Phase 6: Advanced Cards | Pending |
| CARD-19 | Phase 6: Advanced Cards | Pending |
| THEME-01 | Phase 7: Theme System | Pending |
| THEME-02 | Phase 7: Theme System | Pending |
| THEME-03 | Phase 7: Theme System | Pending |
| THEME-04 | Phase 7: Theme System | Pending |
| THEME-05 | Phase 7: Theme System | Pending |
| THEME-06 | Phase 7: Theme System | Pending |
| INTG-01 | Phase 8: Platform Integrations | Pending |
| INTG-02 | Phase 8: Platform Integrations | Pending |
| INTG-03 | Phase 8: Platform Integrations | Pending |
| INTG-04 | Phase 8: Platform Integrations | Pending |
| INTG-05 | Phase 8: Platform Integrations | Pending |
| INTG-06 | Phase 8: Platform Integrations | Pending |
| INTG-07 | Phase 8: Platform Integrations | Pending |
| INTG-08 | Phase 8: Platform Integrations | Pending |
| INTG-09 | Phase 8: Platform Integrations | Pending |
| INTG-10 | Phase 8: Platform Integrations | Pending |
| INTG-11 | Phase 8: Platform Integrations | Pending |
| INTG-12 | Phase 8: Platform Integrations | Pending |
| INTG-13 | Phase 8: Platform Integrations | Pending |
| INTG-14 | Phase 8: Platform Integrations | Pending |
| INTG-15 | Phase 8: Platform Integrations | Pending |
| INTG-16 | Phase 8: Platform Integrations | Pending |
| INTG-17 | Phase 8: Platform Integrations | Pending |
| INTG-18 | Phase 8: Platform Integrations | Pending |
| INTG-19 | Phase 8: Platform Integrations | Pending |
| INTG-20 | Phase 8: Platform Integrations | Pending |
| PAGE-01 | Phase 9: Public Page | Pending |
| PAGE-02 | Phase 9: Public Page | Pending |
| PAGE-03 | Phase 9: Public Page | Pending |
| PAGE-04 | Phase 9: Public Page | Pending |
| PAGE-05 | Phase 9: Public Page | Pending |
| PAGE-06 | Phase 9: Public Page | Pending |
| ANLYT-01 | Phase 10: Analytics | Pending |
| ANLYT-02 | Phase 10: Analytics | Pending |
| ANLYT-03 | Phase 10: Analytics | Pending |
| ANLYT-04 | Phase 10: Analytics | Pending |
| ANLYT-05 | Phase 10: Analytics | Pending |
| ANLYT-06 | Phase 10: Analytics | Pending |
| ANLYT-07 | Phase 10: Analytics | Pending |
| AUDIO-01 | Phase 11: Audio System | Pending |
| AUDIO-02 | Phase 11: Audio System | Pending |
| AUDIO-03 | Phase 11: Audio System | Pending |
| AUDIO-04 | Phase 11: Audio System | Pending |
| AUDIO-05 | Phase 11: Audio System | Pending |
| AUDIO-06 | Phase 11: Audio System | Pending |
| AUDIO-07 | Phase 11: Audio System | Pending |
| AUDIO-08 | Phase 11: Audio System | Pending |
| AUDIO-09 | Phase 11: Audio System | Pending |
| AUDIO-10 | Phase 11: Audio System | Pending |

**Coverage:**
- v1 requirements: 76 total
- Mapped to phases: 76
- Unmapped: 0

---
*Requirements defined: 2026-01-23*
*Last updated: 2026-01-23 — Restructured for component-based page builder (11 phases)*
