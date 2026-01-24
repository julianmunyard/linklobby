# LinkLobby

## What This Is

LinkLobby is a component-based page builder for musicians, producers, and DJs. Unlike generic link-in-bio tools like Linktree, LinkLobby treats the page as an extension of artistic identity — with a free-form canvas where artists drag and arrange cards, theme systems that skin everything consistently, and a dashboard where artists watch their page come to life in real-time.

The product is for artists first. Fan benefit is secondary.

## Core Value

**The dashboard and live preview experience is where the magic happens.** An artist sits in the editor, drags a Hero Card into place, picks a theme, tweaks their colors — and watches their page transform instantly. That moment of "this is *mine*" is what makes LinkLobby different.

Everything else (cards, themes, integrations) serves this core experience.

## Architecture

```
Artist chooses: CARD TYPE (shape)
     ↓
Artist fills: CONTENT (text, photo, embed)
     ↓
Artist arranges: CANVAS (free-form drag)
     ↓
Artist picks: THEME (Mac OS, Sleek Modern)
     ↓
Theme skins: ALL CARDS consistently
```

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Dashboard & Editor:**
- [ ] Split-screen editor (controls left, live preview right)
- [ ] Three tabs: Cards, Design, Insights
- [ ] Real-time preview updates as artist edits
- [ ] Mobile/desktop preview toggle
- [ ] Save/discard on exit (not constant auto-save)
- [ ] Username display and public URL (linklobby.com/username)

**Canvas System:**
- [ ] Free-form drag arrangement within grid constraints
- [ ] Unlimited cards on canvas
- [ ] Responsive layout (desktop → tablet → mobile)
- [ ] Card z-index/layering control

**Card Types (7):**
- [ ] Hero Card: Large prominent CTA with photo/text/embed
- [ ] Horizontal Link: Wide bar (Linktree-style)
- [ ] Square Card: Small tile
- [ ] Video Card: Video display with playback
- [ ] Photo Gallery: Multi-image with ReactBits animations
- [ ] Dropdown: Expandable link list with custom text
- [ ] Game Card: Mini-games (Snake)

**Theme System:**
- [ ] Mac OS theme (shadows, traffic lights, window-like depth)
- [ ] Sleek Modern theme (transparent, glass, flat)
- [ ] Color customization (background, text, border, accent)
- [ ] Preset color palettes per theme

**Platform Integrations (20+):**
- [ ] Music: Spotify, Apple Music, SoundCloud, Audiomack, Bandcamp
- [ ] Video: YouTube, TikTok Video, Vimeo
- [ ] Social: Instagram, TikTok Profile, Twitter/X
- [ ] Events: Bandsintown
- [ ] Payments: PayPal, Venmo, Tip Jar, Shopify
- [ ] Utility: Contact Form, Generic URL

**Public Page:**
- [ ] Loads instantly, canvas layout renders correctly
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Theme-driven visual coherence
- [ ] Interactive elements work (galleries, dropdowns, games)

**Authentication:**
- [ ] Shared Supabase Auth with Munyard Mixer
- [ ] Username claim during signup
- [ ] Username changes allowed

**Analytics (Insights Tab):**
- [ ] Page views count
- [ ] Unique visitors estimate
- [ ] Per-card click counts and CTR
- [ ] Game play counts, gallery views

**Audio System:**
- [ ] Audio upload (WAV converts to MP3)
- [ ] 5 player styles (Waveform, Vinyl, OP-1, Cassette, Minimal)
- [ ] Varispeed and reverb controls (optional toggle)
- [ ] Never autoplays

### Out of Scope

- Custom domains — complexity for v1, premium feature later
- Real-time chat or social features — changes positioning
- Multi-page support — one account = one page is intentional
- OAuth login (Google, GitHub) — email/password sufficient for v1
- Mobile app — web-first
- v2 integrations (Twitch, NFTs, Podcasts, etc.) — deferred

## Context

**Existing foundation:**
- Munyard Mixer has working Supabase Auth that can be extended
- Audio processing logic (varispeed, reverb) exists in Munyard Mixer via Superpowered Audio API
- This is a new repo, separate from Munyard Mixer

**Technical direction:**
- Next.js 16 with App Router
- Supabase for auth and database
- shadcn-admin for dashboard
- shadcn/ui + ReactBits for public pages
- Tailwind CSS v4 for theming

**Key documents:**
- `.planning/COMPONENT-SYSTEM.md` — Card types, layout, integrations (source of truth)
- `.planning/ROADMAP.md` — 11 phases
- `.planning/REQUIREMENTS.md` — Detailed requirements with traceability

## Constraints

- **Auth**: Must extend existing Supabase Auth from Munyard Mixer
- **Audio**: Will leverage Munyard Mixer's Superpowered Audio integration
- **Aesthetic**: Themes control structure, artists control expression (curated creativity model)
- **Performance**: Page load < 2 seconds

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Component-based cards (not just links) | More expressive, artists can build real pages | Locked for v1 |
| Free-form canvas layout | Differentiation from Linktree's stacked list | Locked for v1 |
| 7 card types for v1 | Balance of flexibility and scope | Locked for v1 |
| 20+ integrations for v1 | Cover major platforms artists use | Locked for v1 |
| Save/discard on exit (not auto-save) | Clearer mental model | Pending |
| shadcn-admin for dashboard | Free, customizable, dark mode | Pending |
| ReactBits for animations | Photo gallery effects | Pending |
| Audio last (Phase 11) | Highest risk, optional for core value | Locked |

---
*Last updated: 2026-01-23 — Updated for component-based page builder scope*
