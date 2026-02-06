---
task: quick-039
type: execute
autonomous: true
files_modified:
  - src/types/theme.ts
  - src/lib/themes/macintosh.ts
  - src/lib/themes/index.ts
  - src/components/cards/macintosh-card.tsx
  - src/components/cards/themed-card-wrapper.tsx
  - src/app/fonts.ts

must_haves:
  truths:
    - User can select "Macintosh" theme from theme picker
    - Cards render with classic Mac window chrome (title bar with horizontal lines, close box)
    - Small cards (link, horizontal, mini) render with slim black frames
    - Page background has gray checkerboard pattern
    - Window titles use VT323 monospace pixel font
    - Cards have pixel-art 3D depth effect (double box-shadow)
  artifacts:
    - path: src/lib/themes/macintosh.ts
      provides: Theme configuration with colors, fonts, palettes
      exports: [macintoshTheme]
    - path: src/components/cards/macintosh-card.tsx
      provides: Card wrapper with Mac window chrome
      exports: [MacintoshCard]
    - path: src/types/theme.ts
      provides: ThemeId includes 'macintosh'
      contains: "'macintosh'"
  key_links:
    - from: src/lib/themes/index.ts
      to: src/lib/themes/macintosh.ts
      via: import and THEMES array
      pattern: "import.*macintoshTheme"
    - from: src/components/cards/themed-card-wrapper.tsx
      to: src/components/cards/macintosh-card.tsx
      via: switch case for 'macintosh'
      pattern: "case 'macintosh'"
    - from: src/components/cards/macintosh-card.tsx
      to: VT323 font
      via: CSS variable reference
      pattern: "var\\(--font-vt323\\)"
---

<objective>
Create a Classic Macintosh theme with authentic 1984-era Mac window chrome, pixel fonts, and checkerboard background.

Purpose: Add a nostalgic retro computing aesthetic to LinkLobby's theme system, following the reference images and HTML code provided by the user.

Output: Working "Macintosh" theme with window chrome cards, pixel fonts, and checkerboard background pattern.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-quick.md
</execution_context>

<context>
@/Users/julianmunyard/LinkLobby/src/types/theme.ts
@/Users/julianmunyard/LinkLobby/src/lib/themes/system-settings.ts
@/Users/julianmunyard/LinkLobby/src/components/cards/system-settings-card.tsx
@/Users/julianmunyard/LinkLobby/src/lib/themes/index.ts
@/Users/julianmunyard/LinkLobby/src/components/cards/themed-card-wrapper.tsx
@/Users/julianmunyard/LinkLobby/src/app/fonts.ts
</context>

<tasks>

<task type="auto">
  <name>Add VT323 Google Font and register Macintosh theme type</name>
  <files>
    src/app/fonts.ts
    src/types/theme.ts
  </files>
  <action>
1. Add VT323 Google Font to src/app/fonts.ts:
   - Import VT323 from 'next/font/google'
   - Export vt323 with variable '--font-vt323'
   - Add to fontVariables array
   - Add to CURATED_FONTS with category 'retro'

2. Add 'macintosh' to ThemeId union in src/types/theme.ts:
   - Update line 3 to include 'macintosh' in the union type
   - Format: export type ThemeId = 'mac-os' | 'instagram-reels' | 'system-settings' | 'vcr-menu' | 'ipod-classic' | 'receipt' | 'macintosh'
  </action>
  <verify>
    - grep "VT323" src/app/fonts.ts shows import and export
    - grep "'macintosh'" src/types/theme.ts shows it in ThemeId union
  </verify>
  <done>VT323 font registered and 'macintosh' added to ThemeId type</done>
</task>

<task type="auto">
  <name>Create Macintosh theme configuration</name>
  <files>
    src/lib/themes/macintosh.ts
  </files>
  <action>
Create src/lib/themes/macintosh.ts following the system-settings.ts pattern:

```typescript
import type { ThemeConfig } from '@/types/theme'

export const macintoshTheme: ThemeConfig = {
  id: 'macintosh',
  name: 'Macintosh',
  description: 'Classic 1984 Mac aesthetic with pixel fonts and window chrome',
  hasWindowChrome: true,

  defaultColors: {
    background: '#cccccc',                       // Gray checkerboard base
    cardBg: '#ffffff',                           // White window background
    text: '#000000',                             // Black text
    accent: '#ffffff',                           // White inner content area
    border: '#000000',                           // Black borders (3px)
    link: '#0000ff',                             // Classic blue hyperlinks
  },

  defaultFonts: {
    heading: 'var(--font-vt323)',                // VT323 pixel font for titles
    body: 'var(--font-courier-prime)',           // Courier Prime for body (fallback to monospace if not available)
    headingSize: 1.1,                            // Slightly larger for pixel font readability
    bodySize: 1,
    headingWeight: 'normal',                     // Pixel fonts don't need bold
  },

  defaultStyle: {
    borderRadius: 0,                             // Sharp corners, no rounding
    shadowEnabled: true,                         // Pixel-art 3D depth effect
    blurIntensity: 0,                            // No blur
  },

  palettes: [
    {
      id: 'classic-gray',
      name: 'Classic Gray',
      colors: {
        background: '#cccccc',
        cardBg: '#ffffff',
        text: '#000000',
        accent: '#ffffff',
        border: '#000000',
        link: '#0000ff',
      },
    },
    {
      id: 'calculator-orange',
      name: 'Calculator Orange',
      colors: {
        background: '#999999',
        cardBg: '#ff9933',                       // Calculator orange
        text: '#000000',
        accent: '#ffcc99',                       // Lighter orange for content
        border: '#000000',
        link: '#cc3300',                         // Dark red links
      },
    },
    {
      id: 'notepad-yellow',
      name: 'Notepad Yellow',
      colors: {
        background: '#aaaaaa',
        cardBg: '#ffff99',                       // Yellow notepad
        text: '#000000',
        accent: '#ffffcc',                       // Lighter yellow for content
        border: '#000000',
        link: '#0066cc',                         // Blue links
      },
    },
    {
      id: 'platinum',
      name: 'Platinum',
      colors: {
        background: '#d0d0d0',                   // System 7 Platinum
        cardBg: '#ffffff',
        text: '#000000',
        accent: '#f0f0f0',                       // Light gray content
        border: '#000000',
        link: '#0000ff',
      },
    },
  ],
}
```
  </action>
  <verify>
    - cat src/lib/themes/macintosh.ts shows complete ThemeConfig export
    - grep "id: 'macintosh'" src/lib/themes/macintosh.ts confirms theme ID
  </verify>
  <done>Macintosh theme config file exists with 4 color palettes</done>
</task>

<task type="auto">
  <name>Create MacintoshCard wrapper component</name>
  <files>
    src/components/cards/macintosh-card.tsx
  </files>
  <action>
Create src/components/cards/macintosh-card.tsx with authentic Mac window chrome:

```typescript
'use client'

import { cn } from '@/lib/utils'
import type { CardType } from '@/types/card'

interface MacintoshCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  cardType?: CardType
  transparentBackground?: boolean
}

// Card types that get slim frames instead of full window chrome
const THIN_CARD_TYPES: CardType[] = ['link', 'horizontal', 'mini']

export function MacintoshCard({
  children,
  className,
  title,
  cardType,
  transparentBackground = false
}: MacintoshCardProps) {
  // Link, horizontal, mini cards get slim black frame only
  if (cardType && THIN_CARD_TYPES.includes(cardType)) {
    return (
      <div
        className={cn(
          "overflow-hidden",
          !transparentBackground && "bg-theme-card-bg",
          "border-[3px] border-theme-text",
          className
        )}
        style={{
          boxShadow: '4px 4px 0px rgba(255, 255, 255, 0.8), 6px 6px 0px rgba(0, 0, 0, 0.9)',
        }}
      >
        {children}
      </div>
    )
  }

  // Hero, square, video, text cards get full Mac window chrome
  return (
    <div
      className={cn(
        "overflow-hidden",
        !transparentBackground && "bg-theme-card-bg",
        "border-[3px] border-theme-text",
        className
      )}
      style={{
        boxShadow: '4px 4px 0px rgba(255, 255, 255, 0.8), 6px 6px 0px rgba(0, 0, 0, 0.9)',
      }}
    >
      {/* Mac title bar with horizontal lines pattern */}
      <div
        className="h-6 flex items-center justify-between px-2 border-b border-theme-text"
        style={{
          background: 'repeating-linear-gradient(0deg, #ffffff 0px, #ffffff 1px, #000000 1px, #000000 2px)',
        }}
      >
        {/* Close box - small square on left */}
        <button
          className="w-3 h-3 border border-black bg-white hover:bg-gray-200 active:bg-gray-400 transition-colors flex-shrink-0"
          aria-label="Close"
        >
        </button>

        {/* Centered title */}
        {title && (
          <div
            className="text-xs text-black uppercase tracking-wider mx-auto"
            style={{
              fontFamily: 'var(--font-vt323), monospace',
              lineHeight: '1',
            }}
          >
            {title}
          </div>
        )}

        {/* Spacer to balance centering */}
        <div className="w-3 flex-shrink-0"></div>
      </div>

      {/* Content area */}
      <div className={cn(!transparentBackground && "bg-theme-accent")}>
        {children}
      </div>
    </div>
  )
}
```

Design rationale:
- 3px black borders match reference images
- Double box-shadow: white 4px + black 6px creates pixel-art 3D depth
- Title bar: horizontal lines pattern using repeating-linear-gradient (white 1px, black 1px)
- Close box: 12px square button (w-3 h-3), left-aligned
- Title: VT323 font, centered, uppercase, tracking-wider for readability
- THIN_CARD_TYPES get minimal frame (no title bar), others get full window chrome
  </action>
  <verify>
    - cat src/components/cards/macintosh-card.tsx shows MacintoshCard export
    - grep "THIN_CARD_TYPES" src/components/cards/macintosh-card.tsx confirms card type routing
    - grep "repeating-linear-gradient" src/components/cards/macintosh-card.tsx confirms horizontal lines pattern
  </verify>
  <done>MacintoshCard component exists with window chrome and card type routing</done>
</task>

<task type="auto">
  <name>Register theme and wire routing</name>
  <files>
    src/lib/themes/index.ts
    src/components/cards/themed-card-wrapper.tsx
  </files>
  <action>
1. Register Macintosh theme in src/lib/themes/index.ts:
   - Add import: import { macintoshTheme } from './macintosh'
   - Add to THEMES array (after receiptTheme)
   - Add 'macintosh' to THEME_IDS array

2. Add Macintosh routing in src/components/cards/themed-card-wrapper.tsx:
   - Add import: import { MacintoshCard } from './macintosh-card'
   - Add case in switch statement (after system-settings case):
   ```typescript
   case 'macintosh':
     return (
       <MacintoshCard className={className} cardType={cardType} transparentBackground={isTransparent}>
         {children}
       </MacintoshCard>
     )
   ```
  </action>
  <verify>
    - grep "macintoshTheme" src/lib/themes/index.ts shows import and array inclusion
    - grep "case 'macintosh'" src/components/cards/themed-card-wrapper.tsx shows routing case
  </verify>
  <done>Macintosh theme registered in THEMES array and routing added to ThemedCardWrapper</done>
</task>

</tasks>

<verification>
1. Theme appears in theme picker dropdown
2. Selecting Macintosh theme changes background to gray (#cccccc)
3. Hero/square cards show full window chrome (title bar with lines, close box)
4. Link/horizontal/mini cards show slim black frames
5. Window titles use VT323 pixel font
6. Cards have pixel-art 3D effect (white + black box-shadow)
7. Color palettes switch between Classic Gray, Calculator Orange, Notepad Yellow, Platinum
</verification>

<success_criteria>
- Macintosh theme selectable from theme picker
- Cards render with authentic Mac window chrome
- VT323 font loads and displays for window titles
- Background pattern uses gray base color
- Double box-shadow creates 3D depth effect
- Card type routing works (full chrome vs slim frame)
- All 4 color palettes functional
</success_criteria>

<output>
After completion, create `.planning/quick/039-macintosh-theme/039-SUMMARY.md` with:
- Screenshots of theme in action
- Notes on design decisions (horizontal lines pattern, box-shadow values)
- Color palette descriptions
</output>
