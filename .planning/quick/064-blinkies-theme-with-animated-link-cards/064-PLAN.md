---
phase: quick
plan: 064
type: execute
wave: 1
depends_on: []
files_modified:
  - src/types/theme.ts
  - src/types/card.ts
  - src/types/scatter.ts
  - src/lib/themes/blinkies.ts
  - src/lib/themes/index.ts
  - src/components/cards/blinkies-card.tsx
  - src/components/cards/blinkie-link.tsx
  - src/components/cards/themed-card-wrapper.tsx
  - src/components/cards/card-renderer.tsx
  - src/components/editor/theme-presets.tsx
  - src/stores/theme-store.ts
  - src/components/public/static-flow-grid.tsx
  - src/components/public/static-scatter-canvas.tsx
  - src/app/globals.css
autonomous: true

must_haves:
  truths:
    - "Blinkies theme appears in Custom Link Page category in theme picker"
    - "Selecting Blinkies theme applies System Settings window chrome to non-link cards"
    - "Link and mini cards render as animated blinky badges (150x20px-ish, pixel font, color-cycling CSS animations)"
    - "User can choose from 10 blinky styles via blinkieStyle field in card content"
    - "Blinky style picker appears in card property editor when blinkies theme is active and card is link/mini"
    - "Blinkies render correctly on public pages (both flow and scatter mode)"
    - "Audio cards on public pages render with blinkies theme wrapping"
  artifacts:
    - path: "src/lib/themes/blinkies.ts"
      provides: "Theme config cloned from system-settings"
    - path: "src/components/cards/blinkies-card.tsx"
      provides: "Card wrapper with System Settings chrome + blinky routing for link/mini"
    - path: "src/components/cards/blinkie-link.tsx"
      provides: "Animated blinky badge component with 10 styles and CSS keyframe animations"
  key_links:
    - from: "src/components/cards/themed-card-wrapper.tsx"
      to: "src/components/cards/blinkies-card.tsx"
      via: "switch case 'blinkies'"
      pattern: "case 'blinkies'"
    - from: "src/components/cards/card-renderer.tsx"
      to: "src/components/cards/blinkie-link.tsx"
      via: "conditional render when blinkies theme + link/mini card type"
      pattern: "blinkies.*link|blinkies.*mini"
    - from: "src/lib/themes/index.ts"
      to: "src/lib/themes/blinkies.ts"
      via: "import and THEMES array"
      pattern: "blinkiesTheme"
---

<objective>
Create the "Blinkies" theme -- a clone of System Settings (Poolsuite-inspired retro Mac aesthetic) where link and mini cards render as animated pixel-art blinky badges instead of plain text links.

Purpose: Adds a nostalgic early-web aesthetic option. Blinkies (150x20px animated pixel badges from Geocities/blinkies.cafe era) bring personality to simple link cards while keeping the System 7 chrome for richer card types.

Output: New theme selectable from editor, with 10 CSS-animated blinky styles for link/mini cards, a blinky style picker in the card editor, and full public page support.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/types/theme.ts
@src/types/card.ts
@src/types/scatter.ts
@src/lib/themes/system-settings.ts
@src/lib/themes/index.ts
@src/components/cards/system-settings-card.tsx
@src/components/cards/themed-card-wrapper.tsx
@src/components/cards/card-renderer.tsx
@src/components/cards/link-card.tsx
@src/components/editor/theme-presets.tsx
@src/stores/theme-store.ts
@src/components/public/static-flow-grid.tsx
@src/components/public/static-scatter-canvas.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Theme infrastructure and BlinkiesCard wrapper</name>
  <files>
    src/types/theme.ts
    src/types/card.ts
    src/types/scatter.ts
    src/lib/themes/blinkies.ts
    src/lib/themes/index.ts
    src/components/cards/blinkies-card.tsx
    src/components/cards/themed-card-wrapper.tsx
    src/stores/theme-store.ts
    src/components/editor/theme-presets.tsx
  </files>
  <action>
    **1. Add 'blinkies' to ThemeId union** in `src/types/theme.ts`:
    - Add `| 'blinkies'` to the ThemeId type

    **2. Add blinkieStyle to LinkCardContent** in `src/types/card.ts`:
    - Add `blinkieStyle?: string` field to `LinkCardContent` interface
    - This stores which blinky animation style the user chose (e.g., 'classic-pink', 'rainbow', 'starry', etc.)

    **3. Add 'blinkies' to SCATTER_THEMES** in `src/types/scatter.ts`:
    - Add `'blinkies'` to the SCATTER_THEMES array (since it's a card-layout theme like system-settings)

    **4. Create theme config** at `src/lib/themes/blinkies.ts`:
    - Clone `system-settings.ts` almost exactly
    - Change id to `'blinkies'`, name to `'Blinkies'`, description to `'Animated pixel badges with retro Mac chrome'`
    - Keep `hasWindowChrome: true`
    - Keep ALL the same palettes (Poolsuite Pink, Classic Cream, Platinum, Miami Vice, Terminal, Nautical, Amber, Cherry Wave, Red Label)
    - Keep the same default colors, fonts (Ishmeria heading, DM Sans body), and style config
    - The only difference from system-settings is the theme ID -- the rendering difference comes from BlinkiesCard

    **5. Register theme** in `src/lib/themes/index.ts`:
    - Import `blinkiesTheme` from `'./blinkies'`
    - Add to THEMES array
    - Add `'blinkies'` to THEME_IDS array

    **6. Create BlinkiesCard** at `src/components/cards/blinkies-card.tsx`:
    - Clone `system-settings-card.tsx` structure exactly
    - Same SystemSettingsCard logic but: for THIN_CARD_TYPES (link, horizontal, mini), instead of rendering the slim frame with children inside, render children inside the blinky badge wrapper. The BlinkiesCard itself does NOT render the blinky -- it just provides the System 7 chrome. The card-renderer will swap LinkCard for BlinkieLink when the theme is blinkies.
    - Actually, keep it simpler: BlinkiesCard is identical to SystemSettingsCard. The blinky rendering is handled in card-renderer.tsx by swapping LinkCard -> BlinkieLink for link/mini types when theme is blinkies. BlinkiesCard just provides the System 7 window chrome identical to SystemSettingsCard. Export it as `BlinkiesCard`.
    - You can literally re-export SystemSettingsCard as BlinkiesCard, or create a thin wrapper that delegates to SystemSettingsCard. Simplest approach: just re-export. `export { SystemSettingsCard as BlinkiesCard } from './system-settings-card'`

    **7. Add blinkies case to ThemedCardWrapper** in `src/components/cards/themed-card-wrapper.tsx`:
    - Import BlinkiesCard (or SystemSettingsCard and alias)
    - Add `case 'blinkies':` before the `case 'system-settings':` case, so both route to the same SystemSettingsCard component. Or add blinkies as a separate case that returns `<SystemSettingsCard>` (same as system-settings case).

    **8. Add blinkies to SYNC_TEXT_COLOR_THEMES** in `src/stores/theme-store.ts`:
    - Add `'blinkies'` to the `SYNC_TEXT_COLOR_THEMES` array (line ~19)

    **9. Add blinkies to theme-presets.tsx** in `src/components/editor/theme-presets.tsx`:
    - Add `'blinkies'` to the `'custom-link-page'` category themeIds array: `['mac-os', 'instagram-reels', 'system-settings', 'blinkies']`
  </action>
  <verify>
    - `npx tsc --noEmit` passes with no type errors
    - Theme appears in the THEMES array when importing from `@/lib/themes`
    - BlinkiesCard wrapper renders System 7 chrome for non-link cards
  </verify>
  <done>
    - 'blinkies' is a valid ThemeId
    - Theme config exists with system-settings clone + blinkies identity
    - Theme registered in index, theme presets, scatter themes, sync-text-color themes
    - ThemedCardWrapper routes blinkies to System 7 chrome
    - LinkCardContent has blinkieStyle field
  </done>
</task>

<task type="auto">
  <name>Task 2: BlinkieLink component with 10 CSS-animated styles</name>
  <files>
    src/components/cards/blinkie-link.tsx
    src/components/cards/card-renderer.tsx
    src/app/globals.css
  </files>
  <action>
    **1. Create BlinkieLink component** at `src/components/cards/blinkie-link.tsx`:

    This is the core visual component. It renders a 150x20px-ish animated pixel-art badge.

    Props:
    ```tsx
    interface BlinkieLinkProps {
      card: Card
      isPreview?: boolean
    }
    ```

    The component should:
    - Read `blinkieStyle` from `card.content as LinkCardContent` (default to `'classic-pink'`)
    - Render a fixed-height badge container (~20-24px tall, full width of parent, with max-width ~200px, centered)
    - Use a pixel font: `fontFamily: 'var(--font-pix-chicago), var(--font-chikarego), monospace'` at 10-11px
    - Display `card.title || 'Untitled'` as the badge text, truncated with overflow hidden
    - Apply CSS animation classes based on the blinkieStyle
    - Wrap in `<a>` tag when card.url exists and not isPreview (same polymorphic wrapper pattern as LinkCard)
    - 1px solid border around the badge

    **10 Blinky Styles** (each is a CSS class with keyframe animations):

    1. **classic-pink** (`blinkie-classic-pink`):
       - Background: linear-gradient(90deg, #ff69b4, #ff1493, #ff69b4)
       - Text: white with 1px text-shadow
       - Animation: background-position cycling (sparkle shimmer effect), 2s infinite
       - Border: #ff1493

    2. **rainbow** (`blinkie-rainbow`):
       - Background: linear-gradient cycling through rainbow hues
       - Text: white with dark shadow
       - Animation: hue-rotate filter 0-360deg, 3s infinite linear
       - Border: rotating color

    3. **starry** (`blinkie-starry`):
       - Background: #1a0033 (dark purple)
       - Text: #fff with glow
       - Animation: pseudo-element with radial-gradient "stars" that twinkle via opacity keyframe
       - Border: #4a0080

    4. **neon** (`blinkie-neon`):
       - Background: #0a0a0a
       - Text: #0ff (cyan) or #0f0 (green)
       - Animation: text-shadow glow pulsing (0px to 4px blur), 1.5s ease-in-out infinite
       - Border: currentColor with glow

    5. **hearts** (`blinkie-hearts`):
       - Background: #ffb6c1 (light pink)
       - Text: #8b0000
       - Animation: pseudo-element with heart emoji pattern scrolling horizontally, 4s linear infinite
       - Border: #ff69b4

    6. **pastel** (`blinkie-pastel`):
       - Background: cycling pastel gradient (pink -> lavender -> mint -> peach)
       - Text: #333
       - Animation: background-position shift through gradient, 4s ease infinite
       - Border: #d8bfd8

    7. **matrix** (`blinkie-matrix`):
       - Background: #000
       - Text: #00ff00
       - Animation: text-shadow flicker (slight random opacity changes), pseudo-element with vertical "rain" lines scrolling down
       - Border: #003300

    8. **glitter** (`blinkie-glitter`):
       - Background: #ffd700 (gold)
       - Text: #8b4513
       - Animation: pseudo-element overlay with repeating radial-gradient dots that shift position, simulating glitter sparkle, 0.5s steps infinite
       - Border: #daa520

    9. **flame** (`blinkie-flame`):
       - Background: linear-gradient(0deg, #ff4500, #ff8c00, #ffd700)
       - Text: white with dark shadow
       - Animation: background-position vertical cycling (flames rising), 1.5s ease infinite
       - Border: #ff4500

    10. **ocean** (`blinkie-ocean`):
        - Background: linear-gradient(90deg, #006994, #00b4d8, #48cae4, #00b4d8, #006994)
        - Text: white
        - Animation: background-position horizontal wave motion, 3s ease-in-out infinite
        - Border: #006994

    Implementation approach:
    - Define a `BLINKIE_STYLES` constant mapping style ID to { name, className }
    - Export `BLINKIE_STYLES` for use in the editor picker
    - All animations use CSS classes defined in globals.css
    - The component applies the appropriate class and renders the badge

    Structure of the rendered badge:
    ```tsx
    <Wrapper className="blinkie-badge blinkie-{style} ..." href={...}>
      <span className="blinkie-text">{card.title || 'Untitled'}</span>
    </Wrapper>
    ```

    **2. Add CSS keyframe animations** to `src/app/globals.css`:

    Add a `/* Blinkie animations */` section with all 10 blinkie style classes and their keyframes.

    Base `.blinkie-badge` class:
    ```css
    .blinkie-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 20px;
      max-width: 200px;
      width: 100%;
      margin: 4px auto;
      overflow: hidden;
      position: relative;
      image-rendering: pixelated;
      border-width: 1px;
      border-style: solid;
    }
    .blinkie-text {
      position: relative;
      z-index: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 10px;
      line-height: 1;
      letter-spacing: 0.5px;
      padding: 0 6px;
    }
    ```

    Then each `.blinkie-{style}` class with its specific colors, backgrounds, borders, and animation.
    Use `@keyframes blinkie-{name}` naming convention.

    For pseudo-element animations (starry stars, hearts, matrix rain, glitter), use `::before` or `::after` on `.blinkie-{style}` with absolute positioning, pointer-events-none.

    **3. Wire BlinkieLink into card-renderer.tsx**:

    In `src/components/cards/card-renderer.tsx`:
    - Import `BlinkieLink` from `'./blinkie-link'`
    - Import `useThemeStore` (it's a 'use client' component already)
    - In the `case "link"` and `case "mini"` block, check if current theme is 'blinkies'
    - If blinkies theme: `cardContent = <BlinkieLink card={card} isPreview={isPreview} />`
    - If not: `cardContent = <LinkCard card={card} isPreview={isPreview} />` (existing behavior)

    The check: read themeId from props first (for public pages), fall back to the `themeId` prop or a direct store read. Since card-renderer already receives `themeId` as a prop, use that. For editor preview, read from useThemeStore.

    Simplest approach:
    ```tsx
    case "link":
    case "mini": {
      // Determine effective theme: prop (public pages) or store (editor)
      const effectiveTheme = themeId || storeThemeId
      if (effectiveTheme === 'blinkies') {
        cardContent = <BlinkieLink card={card} isPreview={isPreview} />
      } else {
        cardContent = <LinkCard card={card} isPreview={isPreview} />
      }
      break
    }
    ```

    This requires adding `const { themeId: storeThemeId } = useThemeStore()` at the top of CardRenderer. Note CardRenderer is already 'use client'. BUT on public pages, useThemeStore won't have the correct theme. The `themeId` prop is passed from public pages. So: use `themeId` prop if provided, else fall back to store.

    Actually, looking at the existing code, card-renderer receives `themeId?: string` prop. On public pages this is set. In editor, it's undefined so we need the store. Add at the component level:
    ```tsx
    const storeThemeId = useThemeStore?.((s) => s.themeId)
    ```
    Wait -- useThemeStore is already imported in other files in this codebase, and CardRenderer is 'use client'. Just add:
    ```tsx
    import { useThemeStore } from '@/stores/theme-store'
    ```
    And inside the component:
    ```tsx
    const storeThemeId = useThemeStore((s) => s.themeId)
    const effectiveThemeId = themeId || storeThemeId
    ```
    Then use effectiveThemeId in the link/mini case.
  </action>
  <verify>
    - `npx tsc --noEmit` passes
    - In dev server: select Blinkies theme, add a link card -- it renders as an animated blinky badge
    - Changing blinkieStyle in content changes the animation
    - Non-link cards (hero, square, video) still render with System 7 chrome
    - Link/mini cards on other themes still render as normal LinkCard
  </verify>
  <done>
    - BlinkieLink component renders 10 distinct CSS-animated blinky badge styles
    - CSS keyframe animations defined in globals.css
    - CardRenderer conditionally renders BlinkieLink for link/mini when blinkies theme is active
    - Blinky badges show card title, link to URL, have pixel font and 150x20px aesthetic
  </done>
</task>

<task type="auto">
  <name>Task 3: Blinky style picker and public page support</name>
  <files>
    src/components/cards/blinkie-link.tsx (add picker export)
    src/components/cards/card-renderer.tsx (verify)
    src/components/public/static-flow-grid.tsx
    src/components/public/static-scatter-canvas.tsx
  </files>
  <action>
    **1. Add BlinkieStylePicker to blinkie-link.tsx** (or create separate file `src/components/cards/blinkie-style-picker.tsx`):

    Create a simple visual picker that shows all 10 blinky styles as mini preview badges.

    ```tsx
    interface BlinkieStylePickerProps {
      currentStyle: string
      onStyleChange: (style: string) => void
    }
    ```

    The picker renders a grid of 10 small buttons, each showing a mini-preview of the blinky style (just a small colored bar with the style name, using the actual blinkie CSS class). When clicked, calls `onStyleChange(styleId)`.

    Layout: 2-column grid of small blinky previews, each ~100px wide x 20px tall.

    **2. Wire picker into card property editor**:

    In the card property editor (look at how other card-type-specific fields work -- e.g., `GameCardFields`, `VideoCardFields`), add the blinky style picker for link/mini cards WHEN the current theme is blinkies.

    Find where `LinkCardContent` fields are edited. The property editor likely has a section for link cards. Add conditionally:
    ```tsx
    {themeId === 'blinkies' && (card.card_type === 'link' || card.card_type === 'mini') && (
      <BlinkieStylePicker
        currentStyle={(card.content as LinkCardContent).blinkieStyle || 'classic-pink'}
        onStyleChange={(style) => updateCard(card.id, { content: { ...card.content, blinkieStyle: style } })}
      />
    )}
    ```

    Look at existing property editor patterns to find the right file. It's likely `src/components/editor/card-property-editor.tsx` or similar. Read it to find the exact integration point.

    **3. Update static-flow-grid.tsx for blinkies audio wrapping**:

    In the audio card rendering section of `static-flow-grid.tsx`:
    - Add `'blinkies': 'system-settings'` to the `variantMap` (blinkies audio uses system-settings audio variant)
    - Add blinkies to the SystemSettingsCard wrapping condition: `if (themeId === 'system-settings' || themeId === 'blinkies')`

    The link/mini cards on public pages already go through CardRenderer which will handle the BlinkieLink swap (since we pass `themeId` prop). No additional work needed for link cards.

    **4. Update static-scatter-canvas.tsx for blinkies audio wrapping**:

    Same as static-flow-grid: add blinkies to audio variant map and SystemSettingsCard wrapping condition. Check the file for similar audio card handling patterns.

    **5. Verify the full public page flow**:
    - Public pages pass `themeId` to CardRenderer, which uses it to determine effectiveThemeId
    - When themeId='blinkies', link/mini cards render as BlinkieLink
    - Audio cards get system-settings wrapping
    - Other cards get System 7 chrome via ThemedCardWrapper -> SystemSettingsCard (routed by blinkies case)
  </action>
  <verify>
    - `npx tsc --noEmit` passes
    - In dev server editor: select Blinkies theme, select a link card, blinky style picker appears
    - Changing style immediately updates the blinky animation in preview
    - Public page with blinkies theme renders link cards as blinkies, audio cards with System 7 chrome
  </verify>
  <done>
    - Blinky style picker renders 10 style options with visual previews
    - Style picker appears in property editor for link/mini cards when blinkies theme active
    - Public page flow grid handles blinkies audio wrapping
    - Public page scatter canvas handles blinkies audio wrapping
    - Full end-to-end: theme selection -> link card blinky rendering -> style customization -> public page display
  </done>
</task>

</tasks>

<verification>
1. Theme type system: `npx tsc --noEmit` passes
2. Theme registration: Blinkies appears in Custom Link Page category in theme picker
3. Visual check: Selecting Blinkies shows System 7 chrome on hero/square/video cards
4. Visual check: Link and mini cards render as animated blinky badges with CSS animations
5. Editor: Blinky style picker visible for link/mini cards, selecting style changes animation
6. Public page: Link cards render as blinkies, audio cards have System 7 chrome wrapping
7. Scatter mode: Blinkies theme supports scatter positioning
8. Colorways: All 9 System Settings palettes work with Blinkies theme
</verification>

<success_criteria>
- Blinkies theme is selectable and visually distinct from System Settings (link/mini cards show animated badges)
- 10 blinky CSS animation styles render correctly with pixel fonts, colors, and motion
- Blinky style is user-configurable per card via style picker in editor
- Public pages render blinkies correctly in both flow and scatter modes
- No regressions to other themes or card types
</success_criteria>

<output>
After completion, create `.planning/quick/064-blinkies-theme-with-animated-link-cards/064-SUMMARY.md`
</output>
