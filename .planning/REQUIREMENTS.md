# Requirements: LinkLobby

**Defined:** 2026-01-23
**Core Value:** The dashboard and live preview experience — artists watching their page become theirs.

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
- [ ] **DASH-05**: Dashboard has three tabs: Links, Design, Insights

### Links Tab

- [ ] **LINK-01**: User can add new links with title and URL
- [ ] **LINK-02**: User can edit existing link title and URL
- [ ] **LINK-03**: User can delete links
- [ ] **LINK-04**: User can reorder links via drag-and-drop
- [ ] **LINK-05**: User can choose display style per link (simple, card with icon, embed player, custom icon, link preview)
- [ ] **LINK-06**: User can select platform icon from library (Spotify, Apple Music, Instagram, TikTok, YouTube, SoundCloud, Bandcamp, etc.)
- [ ] **LINK-07**: User can upload custom icon for a link (PNG with transparency)
- [ ] **LINK-08**: User can choose animation for link buttons (hover effects, entrance animations)

### Design Tab

- [ ] **DSGN-01**: User can select theme (Mac OS frosted glass, Sleek Modern flat)
- [ ] **DSGN-02**: User can customize colors (background, text, border, accent)
- [ ] **DSGN-03**: User can select from preset color palettes per theme
- [ ] **DSGN-04**: User can upload background image
- [ ] **DSGN-05**: User can upload background video (8 second loop, muted autoplay)
- [ ] **DSGN-06**: User can set solid color background
- [ ] **DSGN-07**: User can upload logo (PNG with transparency)
- [ ] **DSGN-08**: User can position logo (top left, top center, top right)
- [ ] **DSGN-09**: User can choose logo animation (static, float, DVD bounce)
- [ ] **DSGN-10**: User can select custom cursor style (3 options)

### Audio

- [ ] **AUDIO-01**: User can upload audio track (WAV, MP3 accepted)
- [ ] **AUDIO-02**: WAV uploads convert to MP3 server-side
- [ ] **AUDIO-03**: User can delete uploaded audio
- [ ] **AUDIO-04**: User can toggle audio player visibility on public page
- [ ] **AUDIO-05**: User can select player style (Waveform Modern, Vinyl Spinner, OP-1 Tape, Cassette Deck, Classic Minimal)
- [ ] **AUDIO-06**: User can enable/disable varispeed control for visitors
- [ ] **AUDIO-07**: User can enable/disable reverb control for visitors
- [ ] **AUDIO-08**: Audio player never autoplays on public page

### Public Page

- [ ] **PAGE-01**: Public page loads in under 2 seconds
- [ ] **PAGE-02**: Public page is responsive across mobile, tablet, desktop
- [ ] **PAGE-03**: Public page renders correct Open Graph meta tags for social sharing
- [ ] **PAGE-04**: Public page displays all links immediately on load (no scroll required for core content)
- [ ] **PAGE-05**: Visitors can interact with audio player (play, pause, scrub)
- [ ] **PAGE-06**: Visitors can adjust varispeed if enabled by artist
- [ ] **PAGE-07**: Visitors can adjust reverb if enabled by artist
- [ ] **PAGE-08**: Public page reflects selected theme styling
- [ ] **PAGE-09**: Public page shows custom cursor if selected by artist

### Analytics (Insights Tab)

- [ ] **ANLYT-01**: User can view total page views
- [ ] **ANLYT-02**: User can view unique visitor count
- [ ] **ANLYT-03**: User can view click count per link
- [ ] **ANLYT-04**: User can view click-through rate (CTR) per link
- [ ] **ANLYT-05**: User can view audio play count
- [ ] **ANLYT-06**: User can filter analytics by time period (7 days, 30 days, all time)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Analytics

- **ANLYT-V2-01**: User can view geographic breakdown of visitors
- **ANLYT-V2-02**: User can view device type breakdown (mobile, desktop, tablet)
- **ANLYT-V2-03**: User can view traffic sources (Instagram, TikTok, direct, etc.)
- **ANLYT-V2-04**: User can view audio engagement metrics (play duration, varispeed usage)

### Premium Features

- **PREM-01**: User can connect custom domain
- **PREM-02**: User can hide "Powered by LinkLobby" footer
- **PREM-03**: User can access advanced player styles

### Integrations

- **INTG-01**: Smart music links (auto-detect streaming platforms)
- **INTG-02**: Email collection form
- **INTG-03**: Tour dates integration
- **INTG-04**: Merch store integration (Shopify)

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
| Third theme | TBD, defer decision until v1 ships |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | TBD | Pending |
| AUTH-02 | TBD | Pending |
| AUTH-03 | TBD | Pending |
| AUTH-04 | TBD | Pending |
| DASH-01 | TBD | Pending |
| DASH-02 | TBD | Pending |
| DASH-03 | TBD | Pending |
| DASH-04 | TBD | Pending |
| DASH-05 | TBD | Pending |
| LINK-01 | TBD | Pending |
| LINK-02 | TBD | Pending |
| LINK-03 | TBD | Pending |
| LINK-04 | TBD | Pending |
| LINK-05 | TBD | Pending |
| LINK-06 | TBD | Pending |
| LINK-07 | TBD | Pending |
| LINK-08 | TBD | Pending |
| DSGN-01 | TBD | Pending |
| DSGN-02 | TBD | Pending |
| DSGN-03 | TBD | Pending |
| DSGN-04 | TBD | Pending |
| DSGN-05 | TBD | Pending |
| DSGN-06 | TBD | Pending |
| DSGN-07 | TBD | Pending |
| DSGN-08 | TBD | Pending |
| DSGN-09 | TBD | Pending |
| DSGN-10 | TBD | Pending |
| AUDIO-01 | TBD | Pending |
| AUDIO-02 | TBD | Pending |
| AUDIO-03 | TBD | Pending |
| AUDIO-04 | TBD | Pending |
| AUDIO-05 | TBD | Pending |
| AUDIO-06 | TBD | Pending |
| AUDIO-07 | TBD | Pending |
| AUDIO-08 | TBD | Pending |
| PAGE-01 | TBD | Pending |
| PAGE-02 | TBD | Pending |
| PAGE-03 | TBD | Pending |
| PAGE-04 | TBD | Pending |
| PAGE-05 | TBD | Pending |
| PAGE-06 | TBD | Pending |
| PAGE-07 | TBD | Pending |
| PAGE-08 | TBD | Pending |
| PAGE-09 | TBD | Pending |
| ANLYT-01 | TBD | Pending |
| ANLYT-02 | TBD | Pending |
| ANLYT-03 | TBD | Pending |
| ANLYT-04 | TBD | Pending |
| ANLYT-05 | TBD | Pending |
| ANLYT-06 | TBD | Pending |

**Coverage:**
- v1 requirements: 47 total
- Mapped to phases: 0
- Unmapped: 47 (pending roadmap creation)

---
*Requirements defined: 2026-01-23*
*Last updated: 2026-01-23 after initial definition*
