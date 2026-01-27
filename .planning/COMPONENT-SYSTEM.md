# LinkLobby Component System

**Created:** 2026-01-23
**Status:** Locked for v1

## Overview

LinkLobby uses a component-based page builder approach. Artists choose card TYPES (shapes), fill them with CONTENT, then THEMES skin everything consistently.

## v1 Card Types

| Card Type | Shape | Content Options |
|-----------|-------|-----------------|
| **Hero Card** | Large, prominent CTA | Photo, text, app embed (Spotify, etc.) |
| **Horizontal Link** | Wide bar (Linktree-style) | Photo, text, app embed |
| **Square Card** | Small tile | Photo, text, app embed |
| **Video Card** | Video display | Short video loop |
| **Photo Gallery** | Multi-image carousel | Photos + ReactBits animations (auto-scroll, arrows, fancy effects) |
| **Game Card** | Interactive mini-game | Snake, Breakout, Flappy |

## Layout System

- **Free arrangement** — Artists drag cards anywhere on canvas
- **Grid constraints** — Within margins and grid system we define
- **Unlimited cards** — No limits on how many of each type
- **Responsive** — Layout adapts to mobile/desktop

## Theme System

Themes change the APPEARANCE of all components consistently:
- **Mac OS** — Shadows, traffic light icons, window-like depth
- **Sleek Modern** — Transparent, glass texture, flat

Same components, different visual skin.

## v1 Integrations (App Embeds)

### Music Platforms
- Spotify
- Apple Music
- SoundCloud
- Audiomack
- Bandcamp

### Video
- YouTube
- TikTok Video
- Vimeo

### Social
- Instagram
- TikTok Profile
- Twitter/X

### Ticketing/Events
- Bandsintown

### Payments/Support
- PayPal
- Venmo
- Buy Me A Gift / Tip Jar
- Shopify (merch)

### Utility
- Contact Form
- Generic URL link

## v2 Integrations (Deferred)

- Twitch, Clubhouse, Reddit, Pinterest
- NFT stuff (OpenSea, NFT Gallery)
- Podcasts, RSS Feed
- Typeform, Gleam
- Books, Documents
- Square, SendOwl, Spring

## UI Decisions

### Dashboard
- **Base:** shadcn-admin (free, open source)
- **Customize:** Dark mode default, artist-focused feel
- **Split-screen:** Editor left, live preview right

### Public Pages
- **Components:** shadcn/ui base + heavy theme customization
- **Animations:** ReactBits.dev for photo galleries and effects

## Key Architecture Insight

```
Artist chooses: CARD TYPE (shape)
     ↓
Artist fills: CONTENT (text, photo, embed)
     ↓
Artist picks: THEME (Mac OS, Sleek Modern)
     ↓
Theme skins: ALL CARDS consistently
```

---
*This is a significant scope increase from original PRD. Roadmap may need restructuring.*
