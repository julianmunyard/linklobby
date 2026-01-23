# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-23)

**Core value:** The dashboard and live preview experience - artists watching their page become theirs.
**Current focus:** Scope refinement — component system defined

## Current Position

Phase: Pre-execution (scope expanded)
Status: **ROADMAP NEEDS UPDATE** — Component system changes scope significantly
Last activity: 2026-01-23 - Component system defined, scope expanded

Progress: [--------------------] 0%

## CRITICAL: Scope Evolution

**Original scope:** Simple link-in-bio with themes (like Linktree+)
**Refined scope:** Component-based PAGE BUILDER for artists

### v1 Component System (LOCKED)

| Card Type | Description |
|-----------|-------------|
| Hero Card | Large CTA with photo/text/embed |
| Horizontal Link | Linktree-style bar |
| Square Card | Small tile |
| Video Card | Video display |
| Photo Gallery | Multi-image with ReactBits animations |
| Dropdown | Expandable link list, custom text |
| Game Card | Mini-games (Snake, etc.) |

### Layout System
- **Free drag arrangement** — Not just stacked, artists place cards anywhere
- **Grid constraints** — Within margins we define
- **Unlimited cards** — No limits on count

### UI Decisions
- Dashboard: shadcn-admin template (dark mode, customize)
- Public pages: shadcn/ui + heavy theme customization
- Animations: ReactBits.dev for photo galleries

### v1 Integrations (20+)
- Music: Spotify, Apple Music, SoundCloud, Audiomack, Bandcamp
- Video: YouTube, TikTok Video, Vimeo
- Social: Instagram, TikTok Profile, Twitter/X
- Events: Bandsintown
- Payments: PayPal, Venmo, Tip Jar, Shopify
- Utility: Contact Form, Generic URL

**See:** `.planning/COMPONENT-SYSTEM.md` for full details

## Key Files

| File | Purpose | Status |
|------|---------|--------|
| PROJECT.md | Vision | Current |
| REQUIREMENTS.md | 47 requirements | Needs update for components |
| ROADMAP.md | 8 phases | Needs restructure |
| COMPONENT-SYSTEM.md | Card types, layout, integrations | **NEW - Source of truth** |
| research/SUMMARY.md | Tech stack | Current |

## Session Continuity

Last session: 2026-01-23
Stopped at: Component system discussion complete, roadmap needs restructure
Resume with: `/gsd:resume-work` — READ COMPONENT-SYSTEM.md FIRST

## Resume Instructions

1. Read this STATE.md
2. **Read COMPONENT-SYSTEM.md** — This is the expanded scope
3. Roadmap phases need restructuring for:
   - 7 card types (not just links)
   - Free-form drag layout
   - 20+ integrations
   - Game card
   - Photo gallery with ReactBits
4. Original 8 phases may become 10-12 phases

---
*Updated: 2026-01-23 after component system discussion*
