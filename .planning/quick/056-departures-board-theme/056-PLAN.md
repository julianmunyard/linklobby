---
phase: quick-056
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/themes/departures-board.ts
  - src/components/cards/departures-board-layout.tsx
  - src/components/public/static-departures-board-layout.tsx
  - src/types/theme.ts
  - src/lib/themes/index.ts
  - src/app/fonts.ts
  - src/app/preview/page.tsx
  - src/components/public/public-page-renderer.tsx
  - src/app/globals.css
  - src/components/cards/audio-card.tsx
  - src/components/public/static-flow-grid.tsx
autonomous: true

must_haves:
  truths:
    - "User can select Departures Board from theme picker and see a dark airport departures board"
    - "Link cards render as tabular flight rows with TIME | DESTINATION | GATE | STATUS columns"
    - "Text cards render as section headers (DEPARTURES / ARRIVALS) with horizontal rules"
    - "Audio cards render inline with departures-board theme styling"
    - "Release cards render as PRE-BOARDING countdown rows"
    - "Social icons display at bottom with silver/grey coloring"
    - "All text is uppercase AuxMono monospace font"
    - "Editor preview and public page both render the departures board correctly"
  artifacts:
    - path: "src/lib/themes/departures-board.ts"
      provides: "ThemeConfig with isListLayout: true, dark colors, AuxMono font"
    - path: "src/components/cards/departures-board-layout.tsx"
      provides: "Editor preview layout component"
    - path: "src/components/public/static-departures-board-layout.tsx"
      provides: "Public page static layout component"
  key_links:
    - from: "src/types/theme.ts"
      to: "src/lib/themes/departures-board.ts"
      via: "ThemeId union includes 'departures-board'"
    - from: "src/lib/themes/index.ts"
      to: "src/lib/themes/departures-board.ts"
      via: "import and THEMES array registration"
    - from: "src/app/preview/page.tsx"
      to: "src/components/cards/departures-board-layout.tsx"
      via: "themeId === 'departures-board' routing"
    - from: "src/components/public/public-page-renderer.tsx"
      to: "src/components/public/static-departures-board-layout.tsx"
      via: "themeId === 'departures-board' routing"
---

<objective>
Implement a Departures Board theme - an airport flight information display aesthetic using list layout.

Purpose: Add a new dark, industrial, information-dense theme inspired by airport departure boards with monospace tabular layout, flight-row card rendering, and section headers styled as DEPARTURES/ARRIVALS dividers.

Output: Fully functional departures-board theme selectable in editor, rendering correctly in both preview iframe and public pages.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/themes/classified.ts (dark list layout theme pattern - closest reference)
@src/lib/themes/receipt.ts (list layout theme config pattern)
@src/lib/themes/index.ts (theme registration)
@src/types/theme.ts (ThemeId union, ThemeConfig, ThemeState)
@src/app/fonts.ts (localFont loading pattern)
@src/components/cards/classified-layout.tsx (dark list layout editor component - primary structural reference)
@src/components/public/static-classified-layout.tsx (dark list layout public component)
@src/components/cards/receipt-layout.tsx (list layout with audio/release cards)
@src/app/preview/page.tsx (editor preview routing)
@src/components/public/public-page-renderer.tsx (public page routing)
@src/app/globals.css (theme CSS - classified-paper, receipt-paper patterns)
@src/components/cards/audio-card.tsx (themeVariantMap for audio)
@src/components/public/static-flow-grid.tsx (variantMap for public audio)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Theme config, font registration, and type system</name>
  <files>
    src/lib/themes/departures-board.ts
    src/types/theme.ts
    src/lib/themes/index.ts
    src/app/fonts.ts
  </files>
  <action>
**1. Create `src/lib/themes/departures-board.ts`:**

```typescript
import type { ThemeConfig } from '@/types/theme'

export const departuresBoardTheme: ThemeConfig = {
  id: 'departures-board',
  name: 'Departures Board',
  description: 'Airport flight information display with tabular monospace layout',
  isListLayout: true,

  defaultColors: {
    background: '#000000',        // Pure black
    cardBg: '#0a0f1a',            // Very dark navy for row backgrounds
    text: '#c0c8d0',              // Silver/light grey monospace text
    accent: '#4a90d9',            // Blue accent (for status highlights, like "ON TIME")
    border: '#1a2236',            // Dark navy border/ruled lines
    link: '#c0c8d0',              // Same silver for links
  },

  defaultFonts: {
    heading: 'var(--font-aux-mono)',
    body: 'var(--font-aux-mono)',
    headingSize: 1.6,
    bodySize: 1.0,
    headingWeight: 'normal',
  },

  defaultStyle: {
    borderRadius: 0,          // Sharp edges - industrial display
    shadowEnabled: false,
    blurIntensity: 0,
  },

  palettes: [
    {
      id: 'terminal-classic',
      name: 'Terminal Classic',
      colors: {
        background: '#000000',
        cardBg: '#0a0f1a',
        text: '#c0c8d0',
        accent: '#4a90d9',
        border: '#1a2236',
        link: '#c0c8d0',
      },
    },
    {
      id: 'amber-display',
      name: 'Amber Display',
      colors: {
        background: '#0a0800',
        cardBg: '#141008',
        text: '#d4a030',
        accent: '#f0c040',
        border: '#2a2010',
        link: '#d4a030',
      },
    },
    {
      id: 'green-screen',
      name: 'Green Screen',
      colors: {
        background: '#000a00',
        cardBg: '#081408',
        text: '#40c060',
        accent: '#60e080',
        border: '#102a10',
        link: '#40c060',
      },
    },
    {
      id: 'heathrow-blue',
      name: 'Heathrow Blue',
      colors: {
        background: '#001028',
        cardBg: '#0a1a38',
        text: '#e0e8f0',
        accent: '#60b0ff',
        border: '#1a2a48',
        link: '#e0e8f0',
      },
    },
  ],
}
```

**2. Update `src/types/theme.ts`:**
Add `'departures-board'` to the ThemeId union type. Find the line:
```
export type ThemeId = 'mac-os' | 'instagram-reels' | ... | 'classified'
```
Append `| 'departures-board'` to the end.

**3. Update `src/lib/themes/index.ts`:**
- Add import: `import { departuresBoardTheme } from './departures-board'`
- Add `departuresBoardTheme` to the `THEMES` array
- Add `'departures-board'` to the `THEME_IDS` array

**4. Update `src/app/fonts.ts`:**
- Add AuxMono localFont declaration after the existing local fonts (after specialElite):
```typescript
// Departures Board theme font
export const auxMono = localFont({
  src: '../../public/fonts/AuxMono-Regular.ttf',
  variable: '--font-aux-mono',
  display: 'swap',
})
```
- Add `auxMono.variable` to the `fontVariables` array (add a comment `// Departures Board font`)
- Add to `CURATED_FONTS` array:
```typescript
{ id: 'aux-mono', name: 'Aux Mono', variable: 'var(--font-aux-mono)', category: 'retro' as const },
```
  </action>
  <verify>
Run `npx tsc --noEmit` - no type errors. Grep for 'departures-board' in theme.ts, index.ts, and fonts.ts to confirm registration.
  </verify>
  <done>
ThemeId includes 'departures-board', theme config registered in THEMES array, AuxMono font loaded with CSS variable --font-aux-mono, font in fontVariables and CURATED_FONTS.
  </done>
</task>

<task type="auto">
  <name>Task 2: Editor preview layout, public layout, routing, audio integration, and CSS</name>
  <files>
    src/components/cards/departures-board-layout.tsx
    src/components/public/static-departures-board-layout.tsx
    src/app/preview/page.tsx
    src/components/public/public-page-renderer.tsx
    src/app/globals.css
    src/components/cards/audio-card.tsx
    src/components/public/static-flow-grid.tsx
  </files>
  <action>
**1. Create `src/components/cards/departures-board-layout.tsx` (editor preview):**

Follow the classified-layout.tsx pattern exactly for structure (imports, props interface, state management, keyboard nav, card click handling, release card rendering, social icons). Key differences for departures board aesthetic:

**Props interface:** `DeparturesBoardLayoutProps` with same shape as ClassifiedLayoutProps: `{ title, cards, isPreview?, onCardClick?, selectedCardId? }`

**State:** Same pattern as classified: focusedIndex, completedReleases, containerRef. Add `boardData` state (client-only, like docData in classified) with fields: `{ terminalNumber: string, currentTime: string }`. Generate on mount via useEffect: terminalNumber = `T${Math.floor(Math.random() * 5) + 1}`, currentTime = formatted HH:MM.

**Profile data:** Read from useProfileStore: displayName, socialIcons, showSocialIcons. Read from useThemeStore: headingSize, bodySize.

**Visual structure (the JSX):**
- Outer container: `fixed inset-0 w-full z-10 overflow-x-hidden overflow-y-auto` with black bg
- Inner: `flex justify-center py-6 px-4` centering a board container
- Board container: `departures-board-container` CSS class (see CSS below), with inline styles for `backgroundColor: 'var(--theme-card-bg)'`, `color: 'var(--theme-text)'`, `fontFamily: 'var(--font-aux-mono)'`

**Board header:**
```
<div className="departures-board-header">
  <div className="text-xs tracking-[0.3em] uppercase opacity-60">TERMINAL {terminalNumber}</div>
  <div className="text-2xl tracking-[0.2em] uppercase font-bold" style={{ fontSize: titleFontSize }}>
    {title || 'DEPARTURES'}
  </div>
  <div className="text-xs tracking-widest uppercase opacity-60">{boardData.currentTime} LOCAL TIME</div>
</div>
```

**Column header row (styled like the column labels on the reference):**
```
<div className="departures-board-columns">
  <span className="w-16">TIME</span>
  <span className="flex-1">DESTINATION</span>
  <span className="w-20 text-right">GATE</span>
  <span className="w-24 text-right">REMARKS</span>
</div>
```
Style: text-xs uppercase tracking-wider opacity-50, flex layout, border-bottom 1px solid var(--theme-border).

**Horizontal rule:** 1px solid line using `var(--theme-border)` color between header and rows.

**Card rendering (visibleCards.map):**

- **Text cards:** Render as section dividers - centered uppercase text with horizontal rules above and below (like "--- DEPARTURES ---" or "--- ARRIVALS ---"). Use accent color. Full-width row.

- **Audio cards:** Same pattern as classified: render `<AudioPlayer>` inline with `themeVariant="departures-board"`. Wrap in a row div. Do NOT worry about the audio player having special departures styling -- it will fall through to the default theme variant since we are NOT adding 'departures-board' to the ThemeVariant union (too many files to touch). Instead, pass `themeVariant="classified"` (dark theme, close enough). This matches how the audio player handles dark themes.

  IMPORTANT: Actually, for audio, use `themeVariant="classified"` as the variant since classified is already a dark theme and the audio components have specific dark styling for it. Do NOT try to add a new ThemeVariant.

- **Link/hero/horizontal/square/mini cards (all others):** Render as flight departure rows:
  ```
  <button className="departures-board-row w-full text-left ...">
    <span className="w-16 text-xs opacity-60">{generatedTime}</span>
    <span className="flex-1 uppercase truncate">{displayText}</span>
    <span className="w-20 text-right text-xs opacity-60">{generatedGate}</span>
    <span className="w-24 text-right text-xs" style={{ color: 'var(--theme-accent)' }}>ON TIME</span>
  </button>
  ```
  For the generated "time": derive from card index. Use format like `${String(6 + Math.floor(index * 0.5)).padStart(2, '0')}:${index % 2 === 0 ? '00' : '30'}` to produce times like 06:00, 06:30, 07:00, etc.
  For the generated "gate": use `${String.fromCharCode(65 + (index % 4))}${index + 1}` to produce A1, B2, C3, D4, A5, etc.
  On hover: slight brightness increase on the row (via CSS class `departures-board-row:hover`).

**Release cards:** Render after visibleCards, separated by a horizontal rule. Style as "PRE-BOARDING" rows:
  - Header: "PRE-BOARDING" in accent color, centered
  - Title/artist below if not released
  - Countdown in monospace tabular-nums format (same as classified pattern)
  - Pre-save button styled as underlined uppercase text
  - After release: "NOW BOARDING" text with link

Follow classified-layout.tsx release card logic exactly (the Countdown component usage, completedReleases state, afterCountdownAction handling).

**Social icons:** After all content, separated by horizontal rule. Same pattern as classified: flex centered wrap gap-4, PLATFORM_ICONS map, opacity hover effects.

**Footer:** Centered small text: "INFORMATION SUBJECT TO CHANGE" at bottom, very low opacity.

**2. Create `src/components/public/static-departures-board-layout.tsx` (public page):**

Follow the static-classified-layout.tsx pattern exactly. Key differences:
- Props interface `StaticDeparturesBoardLayoutProps`: `{ username, title, cards, headingSize?, bodySize?, socialIcons?, showSocialIcons? }`
- Same visual structure as the editor layout but:
  - No `onCardClick` / `selectedCardId` props (not interactive in that way)
  - Card clicks use `window.open(card.url, '_blank', 'noopener,noreferrer')` directly (not through onCardClick callback)
  - Uses `<a>` tags instead of `<button>` where appropriate for proper link behavior
  - Audio cards pass `themeVariant="classified"` (same as editor version, no isEditing prop)
  - Release card countdown wrapped in `isMounted` guard (useEffect sets isMounted=true, only render Countdown after mount to avoid hydration mismatch -- follow static-receipt-layout.tsx pattern)
  - Includes LegalFooter at bottom: `<Link href="/privacy?username=${username}">`, `<Link href="/terms">`, "Powered by LinkLobby" -- follow static-receipt-layout.tsx footer pattern exactly, but use light grey text color (style={{ color: 'var(--theme-text)', opacity: 0.3 }})
  - data-card-id attributes on card elements (for analytics)

**3. Update `src/app/preview/page.tsx`:**
- Add import: `import { DeparturesBoardLayout } from "@/components/cards/departures-board-layout"`
- Add routing block after the classified block (around line 295, after the `if (themeId === 'classified')` block):
```typescript
// Departures Board theme uses airport departures display layout
if (themeId === 'departures-board') {
  return (
    <>
      <PageBackground />
      <DimOverlay />
      <DeparturesBoardLayout
        title={displayName || 'DEPARTURES'}
        cards={state.cards}
        isPreview={true}
        onCardClick={handleCardClick}
        selectedCardId={state.selectedCardId}
      />
      <NoiseOverlay />
    </>
  )
}
```

**4. Update `src/components/public/public-page-renderer.tsx`:**
- Add import: `import { StaticDeparturesBoardLayout } from "./static-departures-board-layout"`
- Add routing block after the classified block (around line 290, after `if (themeId === 'classified')` block):
```typescript
// Departures Board theme uses airport departures display layout
if (themeId === 'departures-board') {
  const socialIcons: SocialIcon[] = socialIconsJson ? JSON.parse(socialIconsJson) : []
  return (
    <StaticDeparturesBoardLayout
      username={username}
      title={displayName || 'DEPARTURES'}
      cards={cards}
      headingSize={headingSize}
      bodySize={bodySize}
      socialIcons={socialIcons}
      showSocialIcons={showSocialIcons}
    />
  )
}
```

**5. Update `src/components/cards/audio-card.tsx`:**
Add to themeVariantMap (around line 20-29):
```typescript
'departures-board': 'classified',  // Dark theme - use classified variant
```

**6. Update `src/components/public/static-flow-grid.tsx`:**
Add to variantMap (around line 93-101):
```typescript
'departures-board': 'classified',  // Dark theme - use classified variant
```

**7. Add CSS to `src/app/globals.css`:**
Append after the classified theme section (after line ~1123):

```css
/* ========================================
   Departures Board Theme Styles
   ======================================== */

[data-theme="departures-board"] {
  --theme-shadow: none;
}

/* Departures board container */
.departures-board-container {
  width: 520px;
  max-width: 100%;
  position: relative;
  padding: 0;
  overflow: visible;
}

/* Board header */
.departures-board-header {
  text-align: center;
  padding: 24px 24px 16px;
  border-bottom: 2px solid var(--theme-border);
}

/* Column headers */
.departures-board-columns {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  opacity: 0.5;
  border-bottom: 1px solid var(--theme-border);
}

/* Flight row */
.departures-board-row {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid var(--theme-border);
  transition: background-color 0.15s ease;
  cursor: pointer;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
}

.departures-board-row:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.departures-board-row:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.05);
}

/* Section divider (text cards) */
.departures-board-section {
  text-align: center;
  padding: 16px;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-size: 0.75rem;
  border-top: 2px solid var(--theme-border);
  border-bottom: 2px solid var(--theme-border);
  margin: 8px 0;
}

/* Departures board content area */
.departures-board-content {
  padding: 0 0 24px;
}

/* Departures board divider */
.departures-board-divider {
  border-top: 1px solid var(--theme-border);
  margin: 8px 16px;
}

/* Responsive */
@media (max-width: 560px) {
  .departures-board-container {
    width: 100%;
  }
}
```
  </action>
  <verify>
Run `npx tsc --noEmit` - no type errors. Run `npm run build` to verify the build succeeds. Open the app in browser, switch to Departures Board theme in the editor, verify the dark board renders with flight rows. Visit a public page URL with the theme applied.
  </verify>
  <done>
Editor preview shows departures board with dark background, monospace AuxMono font, tabular flight rows for link cards, section dividers for text cards, inline audio player, PRE-BOARDING release countdown, social icons at bottom. Public page renders identical static version with proper links, legal footer, and hydration-safe countdown. All four palettes (Terminal Classic, Amber Display, Green Screen, Heathrow Blue) switch correctly.
  </done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with zero errors
2. `npm run build` succeeds with no build errors
3. Theme appears in theme picker with name "Departures Board"
4. Selecting theme in editor shows dark board with flight rows
5. Text cards render as section headers with horizontal rules
6. Audio cards render inline with dark theme styling
7. Release cards show PRE-BOARDING countdown
8. Palette switching works (Terminal Classic, Amber Display, Green Screen, Heathrow Blue)
9. Public page renders the departures board correctly
10. AuxMono monospace font renders on all text
</verification>

<success_criteria>
- Departures Board theme fully functional in editor and public page
- All card types render with appropriate departures board styling
- Four color palettes available and switchable
- No TypeScript errors, no build errors
- Font loads correctly via CSS variable
</success_criteria>

<output>
After completion, create `.planning/quick/056-departures-board-theme/056-SUMMARY.md`
</output>
