---
phase: quick
plan: "070"
subsystem: themes
tags: [theme, zine, fonts, css, layout]
dependency-graph:
  requires: [phase-7-themes, quick-050-classified]
  provides: [chaotic-zine-theme]
  affects: []
tech-stack:
  added: [Permanent_Marker, Abril_Fatface, Bangers, Rock_Salt]
  patterns: [ransom-note-character-cycling, torn-paper-clip-paths, tape-overlay]
key-files:
  created:
    - src/lib/themes/chaotic-zine.ts
    - src/components/cards/chaotic-zine-layout.tsx
    - src/components/public/static-chaotic-zine-layout.tsx
  modified:
    - src/types/theme.ts
    - src/lib/themes/index.ts
    - src/app/fonts.ts
    - src/app/globals.css
    - src/components/editor/theme-presets.tsx
    - src/components/public/static-flow-grid.tsx
    - src/app/preview/page.tsx
    - src/components/public/public-page-renderer.tsx
decisions:
  - id: chaotic-zine-char-cycling
    summary: "Faithful nth-child CSS cycling for ransom-note characters with priority-based override"
  - id: chaotic-zine-audio-classified
    summary: "Audio player uses classified variant for dark ink theme compatibility"
  - id: chaotic-zine-4-clip-paths
    summary: "Cards cycle through 4 torn-paper clip-path variants from original design"
metrics:
  duration: ~8 minutes
  completed: 2026-02-20
---

# Quick Task 070: Chaotic Zine Theme Summary

Chaotic Zine theme with ransom-note title, torn paper clip-paths, tape overlay on photos, alternating dark/light cards, SVG scribble decorations, and blob-shaped social icons.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Theme foundation - types, config, fonts, CSS, presets, audio mapping | 4126ce1 | theme.ts, chaotic-zine.ts, fonts.ts, globals.css |
| 2 | Editor layout component | 874c857 | chaotic-zine-layout.tsx, preview/page.tsx |
| 3 | Public static layout and renderer wiring | b1b77e4 | static-chaotic-zine-layout.tsx, public-page-renderer.tsx |

## Key Deliverables

### Theme Config
- 4 palettes: Classic Zine (ink on paper), Punk Pink, Xerox Blue, Newsprint
- isListLayout: true (custom layout, not standard card grid)
- Default fonts: Permanent Marker (heading), Special Elite (body)

### 4 New Google Fonts
- Permanent Marker (--font-permanent-marker) - used for link text
- Abril Fatface (--font-abril-fatface) - display character variant
- Bangers (--font-bangers) - loud character variant
- Rock Salt (--font-rock-salt) - scratchy character variant

### Ransom-Note Title
Per-character styling faithfully reproducing the original CSS nth-child rules:
- 2n: Abril Fatface, dark bg, light text, rotate(3deg)
- 2n+1: Permanent Marker, 3rem, rotate(-2deg) translateY(5px)
- 3n: Bangers, 3.5rem, 3px border, transparent bg, rotate(5deg)
- 4n: Special Elite, dark bg, light text, polygon clip-path, rotate(-5deg)
- 5n: Rock Salt, 4px border-bottom, 2rem, rotate(0deg)

### Profile Photo
- grayscale(100%) contrast(120%) filter
- Irregular polygon clip-path: polygon(5% 5%, 95% 0%, 100% 90%, 85% 100%, 5% 95%, 0% 50%)
- Tape overlay: semi-transparent white, backdrop-filter blur, slight rotation

### Cards
- 4 torn-paper clip-path variants cycling per card (exact values from original design)
- Alternating dark/light backgrounds
- Permanent Marker font for link text
- "NEW!" badge on first card with jitter animation

### CSS Classes (globals.css)
- .zine-tape, .zine-bio, .zine-card-dark, .zine-card-light
- .zine-clip-1 through .zine-clip-4
- .zine-badge with jitter animation
- .zine-social-icon with blob border-radius and spin hover
- .zine-scribble, .zine-decoration
- @keyframes zine-jitter, zine-spin

### SVG Decorations
- Hand-drawn arrow scribble (curved path with arrowhead)
- Double-wave scribble
- Large faded typography: "&", "?!", "CUT HERE"

### Social Icons
- Organic blob border-radius: 50% 40% 60% 30% / 40% 50% 60% 50%
- 3px ink border
- 360deg rotate on hover with cubic-bezier easing

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- TypeScript: `npx tsc --noEmit` passes with no errors
- Build: `npm run build` completes successfully
- Theme appears in Designer category in theme picker
- Audio variant mapped to 'classified' in static-flow-grid.tsx
