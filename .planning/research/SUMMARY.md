# Project Research Summary

**Project:** LinkLobby - Component-Based Page Builder for Artists
**Domain:** Creator tools / Link-in-bio SaaS
**Researched:** 2026-01-23
**Confidence:** HIGH

## Executive Summary

LinkLobby is a component-based page builder targeting independent musicians, producers, and DJs. Unlike traditional link-in-bio tools (Linktree, Beacons), LinkLobby offers a **free-form canvas** where artists drag and arrange **7 card types** (Hero, Horizontal Link, Square, Video, Photo Gallery, Dropdown, Game), with **themes** that skin all components consistently. The key insight is that differentiation comes from treating the page as a visual composition, not just a list of links.

The recommended approach uses Next.js 16 with App Router, shadcn-admin for the dashboard, shadcn/ui for components, Tailwind CSS v4 for theming via CSS variables, Supabase for auth/database/storage, and Superpowered for audio DSP.

The primary architectural pattern is a split-screen dashboard editor with live preview via iframe, where all edits are managed in Zustand stores client-side until explicit save. The **canvas system** uses a grid-constrained drag-and-drop layout (likely @dnd-kit or react-grid-layout). Public pages use ISR with on-demand revalidation for fast visitor experience.

Key risks are: (1) canvas/layout complexity - free-form drag with responsive behavior is non-trivial; (2) audio features blocking core delivery - Web Audio API has cross-browser issues; (3) state sync storms in live preview. Audio is intentionally last (Phase 11) due to highest risk.

## Key Findings

### Recommended Stack

The stack is optimized for three core experiences: a split-screen dashboard editor, a canvas-based card layout system, and audio processing with varispeed/reverb.

**Core technologies:**
- **Next.js 16**: Full-stack framework with App Router, Turbopack, ISR
- **shadcn-admin**: Dashboard template (dark mode, customizable)
- **shadcn/ui + Radix**: Component library with full styling control
- **Tailwind CSS v4**: Utility CSS with native CSS variable theming
- **Zustand + TanStack Query**: Client state + server state
- **Supabase**: Auth, PostgreSQL database, Storage with CDN
- **@dnd-kit or react-grid-layout**: Canvas drag-and-drop (research during Phase 3)
- **ReactBits**: Photo gallery animations
- **Superpowered SDK**: WebAssembly audio processing (Phase 11)
- **react-resizable-panels**: Split-screen layout
- **Framer Motion**: UI animations

### Expected Features

**Must have (table stakes):**
- Multiple card types with drag arrangement
- Mobile-responsive design (90%+ traffic is mobile)
- Profile photo, header, bio
- Basic analytics (views, clicks, CTR)
- Custom colors, fast loading (<2s), HTTPS

**Should have (differentiators):**
- Free-form canvas layout (not just stacked list)
- 7 card types (Hero, Horizontal, Square, Video, Gallery, Dropdown, Game)
- Theme system (Mac OS, Sleek Modern)
- 20+ platform integrations
- Live preview editor (side-by-side)
- Audio player with styled skins

**Defer (v2+):**
- Custom domains
- Advanced analytics (geographic, referrer)
- Additional themes
- v2 integrations (Twitch, NFTs, Podcasts)

### Architecture Approach

The architecture separates the dashboard (CSR, highly interactive) from public pages (ISR, optimized for visitors).

**Major components:**
1. **Dashboard Shell** - shadcn-admin layout, navigation, auth guard
2. **Canvas System** - Grid-constrained drag-and-drop for card placement
3. **Card Components** - 7 card types with shared interface
4. **Page Store (Zustand)** - Draft state for cards, positions, theme; hasChanges tracking
5. **Editor Panel** - Tab switching (Cards, Design, Insights), card property editing
6. **Preview Panel** - Iframe rendering `/preview` route, same store subscription
7. **Theme Engine** - CSS variable generation, `data-theme` attribute switching
8. **Public Page** - ISR-rendered artist page at `/[username]`
9. **Media Service** - Upload processing with Supabase Storage
10. **Audio Engine** - Superpowered integration (Phase 11)

### Critical Pitfalls

1. **Canvas layout complexity** - Free-form drag with responsive behavior is harder than stacked lists. Research library options carefully in Phase 3 planning.

2. **Live preview state sync storms** - Debounce input changes (150-300ms), use fine-grained Zustand subscriptions.

3. **Theme abstraction explosion** - Start with 10-15 core tokens maximum.

4. **Audio blocking core functionality** - Web Audio API has cross-browser issues. Audio is Phase 11 (last) for this reason.

5. **Mobile responsive afterthought** - 60%+ of visitors are mobile. Build mobile-first from day 1.

## Implications for Roadmap

Based on research and scope refinement, the 11-phase structure:

### Phase 1: Foundation
**Delivers:** Project scaffolding, Supabase schema (profiles, pages, cards), auth flow, Zustand stores
**Rationale:** State architecture and persistence model are foundational

### Phase 2: Dashboard Shell
**Delivers:** shadcn-admin integration, split-screen layout, tabs structure, save/discard flow
**Uses:** shadcn-admin, react-resizable-panels

### Phase 3: Canvas System
**Delivers:** Grid-constrained drag-and-drop canvas, card positioning, responsive layout
**Uses:** @dnd-kit or react-grid-layout (research during planning)
**Rationale:** Canvas is the core differentiator - must work before adding card types

### Phase 4: Basic Cards
**Delivers:** Hero Card, Horizontal Link, Square Card components
**Rationale:** Start with simpler card types before media/interactive

### Phase 5: Media Cards
**Delivers:** Video Card, Photo Gallery with ReactBits animations
**Uses:** ReactBits for gallery effects

### Phase 6: Advanced Cards
**Delivers:** Dropdown (expandable), Game Card (Snake)
**Rationale:** Most complex card types, built on foundation of basic cards

### Phase 7: Theme System
**Delivers:** Mac OS + Sleek Modern themes, color customization, CSS variable architecture
**Uses:** Tailwind v4 @theme, CSS custom properties

### Phase 8: Platform Integrations
**Delivers:** 20+ platform embeds (Spotify, YouTube, TikTok, etc.)
**Rationale:** Integrations layer on top of card system

### Phase 9: Public Page
**Delivers:** ISR-rendered pages, responsive canvas layout, social sharing
**Rationale:** After editor works, optimize visitor experience

### Phase 10: Analytics
**Delivers:** Event tracking, insights tab, per-card metrics
**Rationale:** Table stakes, can be built incrementally

### Phase 11: Audio System
**Delivers:** Audio upload, 5 player styles, varispeed/reverb
**Uses:** Superpowered SDK
**Rationale:** Highest risk, optional for core value prop - last intentionally

### Phase Ordering Rationale

- **Foundation → Dashboard → Canvas**: Core infrastructure before features
- **Canvas before Cards**: Need placement system before card types
- **Basic → Media → Advanced Cards**: Increasing complexity
- **Theme after Cards**: Themes skin cards, so cards must exist first
- **Integrations after Themes**: Platform embeds work within themed cards
- **Public Page after Integrations**: Full feature set before optimizing visitor view
- **Audio last**: Highest complexity, highest risk, but optional

### Research Flags

Phases needing deeper research during planning:
- **Phase 3 (Canvas):** Library selection (@dnd-kit vs react-grid-layout), responsive behavior
- **Phase 5 (Media Cards):** ReactBits integration, video upload vs embed
- **Phase 11 (Audio):** Superpowered licensing, browser compatibility

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Supabase auth, Zustand patterns well-documented
- **Phase 2 (Dashboard):** shadcn-admin is a template, straightforward
- **Phase 10 (Analytics):** Standard event tracking

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js 16, shadcn/ui, Tailwind v4, Supabase verified |
| Features | HIGH | Component system locked after user discussion |
| Architecture | HIGH | Patterns verified with official docs |
| Canvas System | MEDIUM | Library selection needs Phase 3 research |
| Audio | MEDIUM | Superpowered licensing unclear, browser issues |

**Overall confidence:** HIGH

### Gaps to Address

- **Canvas library selection:** @dnd-kit vs react-grid-layout - research during Phase 3 planning
- **Superpowered licensing:** Contact licensing@superpowered.com during Phase 11 planning
- **ReactBits integration:** Verify animation capabilities during Phase 5 planning

## Sources

### Primary (HIGH confidence)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [shadcn-admin](https://github.com/satnaing/shadcn-admin)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4)
- [Supabase Docs](https://supabase.com/docs)
- [dnd-kit Documentation](https://docs.dndkit.com)
- [ReactBits](https://reactbits.dev)

### Secondary (MEDIUM confidence)
- [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout)
- [Superpowered Integration Guide](https://docs.superpowered.com)
- Competitor analysis (Linktree, Beacons, Carrd, Feature.fm)

---
*Research completed: 2026-01-23*
*Last updated: 2026-01-23 — Updated for component-based page builder (11 phases)*
