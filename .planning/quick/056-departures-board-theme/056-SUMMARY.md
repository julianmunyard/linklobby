---
phase: quick-056
plan: 01
type: summary
subsystem: themes
tags: [theme, departures-board, airport, monospace, dark, list-layout]

dependency-graph:
  requires:
    - Phase 7: Theme System (theme infrastructure, CSS variables, font loading)
    - Phase 12: Audio System (audio card theming variants)
    - quick-050: Classified theme (list layout pattern reference)
  provides:
    - Departures Board theme with airport flight display aesthetic
    - AuxMono monospace font support
    - Four color palettes (Terminal Classic, Amber Display, Green Screen, Heathrow Blue)
  affects:
    - Future dark list-layout themes can reference this pattern
    - Audio card dark variant pattern established

tech-stack:
  added: []
  patterns:
    - List layout theme with tabular data display
    - Monospace font for industrial/terminal aesthetic
    - Generated flight data (times, gates) from card indices
    - Section dividers for text cards (DEPARTURES / ARRIVALS style)

key-files:
  created:
    - src/lib/themes/departures-board.ts
    - src/components/cards/departures-board-layout.tsx
    - src/components/public/static-departures-board-layout.tsx
  modified:
    - src/types/theme.ts (added 'departures-board' to ThemeId union)
    - src/lib/themes/index.ts (registered theme in THEMES array)
    - src/app/fonts.ts (added AuxMono font, fontVariables, CURATED_FONTS)
    - src/app/preview/page.tsx (routing for editor preview)
    - src/components/public/public-page-renderer.tsx (routing for public pages)
    - src/components/cards/audio-card.tsx (theme variant mapping)
    - src/components/public/static-flow-grid.tsx (theme variant mapping)
    - src/app/globals.css (departures board CSS styles)

decisions:
  - decision: "Use AuxMono monospace font for authentic airport terminal aesthetic"
    rationale: "Monospace fonts are standard on flight information displays for tabular alignment"
    alternatives: ["VT323 (too pixelated)", "Courier Prime (too traditional)"]
    phase: quick-056
  - decision: "Map departures-board audio variant to 'classified' (dark theme)"
    rationale: "Both are dark list layouts, reusing classified audio styling avoids adding new ThemeVariant"
    alternatives: ["Add new ThemeVariant (would require touching many files)", "Use default variant (wrong aesthetic)"]
    phase: quick-056
  - decision: "Generate flight times and gates algorithmically from card index"
    rationale: "Creates realistic flight board appearance without requiring user to enter times/gates per card"
    alternatives: ["User-editable fields per card (too complex)", "Random values (inconsistent on reload)"]
    phase: quick-056
  - decision: "Text cards render as section headers (DEPARTURES / ARRIVALS style)"
    rationale: "Matches real airport boards which group flights by destination type"
    alternatives: ["Render as regular rows (less authentic)", "Hide text cards (loses organizational utility)"]
    phase: quick-056

metrics:
  duration: 282
  completed: 2026-02-10
---

# Quick Task 056: Departures Board Theme Summary

**One-liner:** Airport departures board theme with AuxMono monospace, tabular flight rows (TIME | DESTINATION | GATE | STATUS), and four terminal-inspired color palettes

## What Was Built

Created a new dark theme with airport flight information display aesthetic:

### Theme Configuration
- **ID:** `departures-board`
- **Layout type:** `isListLayout: true` (vertical list like VCR, receipt, classified)
- **Font:** AuxMono monospace from `public/fonts/AuxMono-Regular.ttf`
- **Default colors:** Pure black background (#000000), dark navy rows (#0a0f1a), silver/grey text (#c0c8d0), blue accent (#4a90d9)
- **Four palettes:**
  1. **Terminal Classic** - Silver on black (default)
  2. **Amber Display** - Classic amber CRT terminal
  3. **Green Screen** - Retro green phosphor monitor
  4. **Heathrow Blue** - Modern airport blue

### Visual Features
- **Board header:** Terminal number (T1-T5 randomly generated), title, local time display
- **Column headers:** `TIME | DESTINATION | GATE | REMARKS` (tabular layout)
- **Flight rows:** Generated times (06:00, 06:30, 07:00...), card title as destination, gates (A1, B2, C3...), "ON TIME" status in accent color
- **Text cards:** Render as section headers with double border rules (like "DEPARTURES" or "ARRIVALS")
- **Audio cards:** Inline player with classified dark variant
- **Release cards:** "PRE-BOARDING" countdown with "Departure in:" messaging
- **Social icons:** Bottom section with horizontal divider, silver icons
- **Footer:** "INFORMATION SUBJECT TO CHANGE" message

### Layout Components
1. **DeparturesBoardLayout** (editor preview):
   - Client component with keyboard navigation (arrow keys, enter)
   - Hooks into useThemeStore and useProfileStore
   - Interactive card selection for property editing
   - Release card countdown management

2. **StaticDeparturesBoardLayout** (public pages):
   - Client component (needed for countdown hydration)
   - No Zustand dependencies (passes data as props)
   - Direct link clicks (no onCardClick callback)
   - Legal footer with privacy/terms links
   - Analytics data-card-id attributes

### Routing Integration
- **Editor preview:** `src/app/preview/page.tsx` routes to DeparturesBoardLayout when `themeId === 'departures-board'`
- **Public pages:** `src/components/public/public-page-renderer.tsx` routes to StaticDeparturesBoardLayout

### Audio Integration
- **Theme variant mapping:** Both `audio-card.tsx` and `static-flow-grid.tsx` map `'departures-board': 'classified'`
- Audio players render inline in flight rows with dark theme styling
- No new ThemeVariant added (reuses classified for dark aesthetic)

### CSS Styling
Added to `src/app/globals.css`:
- `.departures-board-container` - 520px width, centered board
- `.departures-board-header` - Terminal info, title, time display
- `.departures-board-columns` - Column header row with flex layout
- `.departures-board-row` - Flight row with hover states (rgba white overlay)
- `.departures-board-section` - Text card section dividers with double borders
- `.departures-board-content` - Content area wrapper
- `.departures-board-divider` - Horizontal rule for sections
- Responsive: 100% width on mobile (<560px)

## File Changes

### Created Files (3)
1. `src/lib/themes/departures-board.ts` - Theme config with 4 palettes
2. `src/components/cards/departures-board-layout.tsx` - Editor preview component (378 lines)
3. `src/components/public/static-departures-board-layout.tsx` - Public page component (355 lines)

### Modified Files (8)
1. `src/types/theme.ts` - Added `'departures-board'` to ThemeId union
2. `src/lib/themes/index.ts` - Imported and registered departuresBoardTheme
3. `src/app/fonts.ts` - Added auxMono localFont, fontVariables entry, CURATED_FONTS entry
4. `src/app/preview/page.tsx` - Added DeparturesBoardLayout routing block
5. `src/components/public/public-page-renderer.tsx` - Added StaticDeparturesBoardLayout routing block
6. `src/components/cards/audio-card.tsx` - Added `'departures-board': 'classified'` to themeVariantMap
7. `src/components/public/static-flow-grid.tsx` - Added `'departures-board': 'classified'` to variantMap
8. `src/app/globals.css` - Added 96 lines of departures board CSS styles

## Implementation Details

### Flight Data Generation
Card indices drive generated flight data for realistic board appearance:
- **Time:** `06:00 + (index * 30 minutes)` → 06:00, 06:30, 07:00, 07:30...
- **Gate:** `${letter}${number}` where letter cycles A-D (index % 4), number is index+1 → A1, B2, C3, D4, A5...
- **Status:** Always "ON TIME" in accent color (could be extended for delays/boarding states)

### Keyboard Navigation
- Arrow Up/Down: Navigate between flight rows
- Enter: Click selected row (opens URL or selects card in editor)
- Focus ring: Slight white overlay on focused row

### Card Type Handling
- **Link, hero, horizontal, square, mini:** Render as flight rows
- **Text:** Section headers with double border rules (accent color)
- **Audio:** Inline player with classified dark variant
- **Release:** PRE-BOARDING countdown section with divider
- **Social icons:** Not rendered inline (separate section at bottom)
- **Hidden cards:** Filtered out (is_visible = false)

### Theme State
- Terminal number generated client-side to avoid hydration mismatch
- Current time formatted as HH:MM (24-hour) local time
- Board data in useState with useEffect hydration guard

## Deviations from Plan

None - plan executed exactly as written.

## Testing Checklist

- [x] TypeScript compilation passes (`npx tsc --noEmit`)
- [x] Theme appears in theme picker with name "Departures Board"
- [x] Four palettes selectable (Terminal Classic, Amber Display, Green Screen, Heathrow Blue)
- [x] Link cards render as flight rows with TIME | DESTINATION | GATE | STATUS
- [x] Text cards render as section headers with border rules
- [x] Audio cards render inline with dark styling
- [x] Release cards show PRE-BOARDING countdown
- [x] Social icons display at bottom with divider
- [x] AuxMono font loads and renders (ALL CAPS monospace)
- [x] Editor preview routes correctly (preview/page.tsx)
- [x] Public page routes correctly (public-page-renderer.tsx)

## Next Steps

None required. Theme is complete and production-ready.

## Performance Notes

- Font loading: AuxMono loaded as local font with display: swap (no FOUT/FOIT)
- CSS specificity: All styles scoped to `.departures-board-*` classes
- Client components: Both layouts are 'use client' (required for keyboard nav, countdown, state management)
- Hydration safety: Terminal number and time generated after mount with useState/useEffect

## Commits

1. `f17b87b` - Theme config and AuxMono font registration
2. `c785150` - Layout components, routing, audio integration, and CSS

**Total execution time:** 282 seconds (4m 42s)
