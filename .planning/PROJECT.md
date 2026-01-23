# LinkLobby

## What This Is

LinkLobby is an artist-focused link-in-bio replacement that lets musicians, producers, and DJs create a styled, expressive one-page destination. Unlike generic tools like Linktree, LinkLobby treats the page as an extension of artistic identity — with theme systems, styled audio players, and a dashboard where artists watch their page come to life in real-time.

The product is for artists first. Fan benefit is secondary.

## Core Value

**The dashboard and live preview experience is where the magic happens.** An artist sits in the editor, tweaks their colors, drags their links, picks a theme — and watches their page transform instantly. That moment of "this is *mine*" is what makes LinkLobby different.

Everything else (audio, themes, player styles) serves this core experience.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Dashboard & Editor:**
- [ ] Split-screen editor (controls left, live preview right)
- [ ] Three tabs: Links, Design, Insights
- [ ] Real-time preview updates as artist edits
- [ ] Mobile/desktop preview toggle
- [ ] Save/discard on exit (not constant auto-save)
- [ ] Username display and public URL (linklobby.com/username)

**Links Tab:**
- [ ] Add/edit/delete/reorder links via drag-and-drop
- [ ] Multiple display styles per link (simple, card with icon, embed, custom icon, link preview)
- [ ] Audio upload (WAV accepted, convert to MP3)
- [ ] Audio player with varispeed and reverb controls (toggle on/off)
- [ ] Show/hide audio player toggle

**Design Tab:**
- [ ] Theme selection (Mac OS, Sleek Modern, third TBD)
- [ ] Background options (solid color, image upload, video upload)
- [ ] Color customization (background, text, border, accent)
- [ ] Preset color palettes per theme
- [ ] Player style selection (Waveform Modern, Vinyl Spinner, OP-1 Tape, Cassette Deck, Classic Minimal)
- [ ] Logo upload with position options
- [ ] Logo animations (static, float, DVD bounce)

**Public Page:**
- [ ] Loads instantly, all links visible on arrival
- [ ] Audio player never autoplays
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Theme-driven visual coherence

**Authentication:**
- [ ] Shared Supabase Auth with Munyard Mixer
- [ ] Username claim during signup
- [ ] Username changes allowed

**Insights Tab:**
- [ ] Page views count
- [ ] Unique visitors estimate
- [ ] Audio plays count
- [ ] Per-link click counts and CTR

### Out of Scope

- Custom domains — complexity for v1, premium feature later
- Real-time chat or social features — changes positioning
- Multi-page support — one account = one page is intentional
- OAuth login (Google, GitHub) — email/password sufficient for v1
- Mobile app — web-first

## Context

**Existing foundation:**
- Munyard Mixer has working Supabase Auth that can be extended
- Audio processing logic (varispeed, reverb) exists in Munyard Mixer via Superpowered Audio API
- This is a new repo, separate from Munyard Mixer

**Technical direction:**
- React/Next.js frontend (likely)
- Supabase for auth and database
- CDN for media storage (Vercel Blob, Cloudflare R2, or S3)
- Superpowered Audio API for client-side audio effects

**Research needed:**
- UI templates or design systems for the dashboard editor
- Live preview architecture patterns
- Theme system implementation (CSS variables, styled-components, etc.)
- WAV to MP3 conversion approach (server-side FFmpeg)
- oEmbed/Open Graph for link preview cards

**Reference document:**
- Full PRD at: `/Users/julianmunyard/Documents/2026/WORK/LINK LOBBY/LinkLobby_PRD_v2_Comprehensive.md`

## Constraints

- **Auth**: Must extend existing Supabase Auth from Munyard Mixer
- **Audio**: Will leverage Munyard Mixer's Superpowered Audio integration
- **Aesthetic**: Themes control structure, artists control expression (curated creativity model)
- **Performance**: Page load < 1.5 seconds, time to interactive < 2 seconds

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Save/discard on exit (not auto-save) | Clearer mental model, avoid accidental changes going live | — Pending |
| Username changes allowed | Artist flexibility, may need redirect handling | — Pending |
| Different display styles per link | More expressive, lets artists emphasize what matters | — Pending |
| Shared auth with Munyard Mixer | Leverage existing system, unified artist identity | — Pending |
| Third theme TBD | Need research, don't force decision now | — Pending |
| Dashboard UX is core priority | Audio can wait, editor experience is where magic happens | — Pending |

---
*Last updated: 2026-01-23 after initialization*
