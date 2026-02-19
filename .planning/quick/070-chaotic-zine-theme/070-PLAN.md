---
phase: quick
plan: 070
type: execute
wave: 1
depends_on: []
files_modified:
  - src/types/theme.ts
  - src/lib/themes/chaotic-zine.ts
  - src/lib/themes/index.ts
  - src/app/fonts.ts
  - src/app/globals.css
  - src/components/cards/chaotic-zine-layout.tsx
  - src/components/public/static-chaotic-zine-layout.tsx
  - src/app/preview/page.tsx
  - src/components/public/public-page-renderer.tsx
  - src/components/editor/theme-presets.tsx
  - src/components/public/static-flow-grid.tsx
autonomous: true

must_haves:
  truths:
    - "Chaotic Zine theme appears in Designer category in theme picker"
    - "Selecting Chaotic Zine renders ransom-note title with rotating fonts/backgrounds per character"
    - "Profile photo has grayscale filter with tape element overlay and irregular clip-path"
    - "Link cards alternate dark/light with torn-paper clip-paths and slight rotations"
    - "SVG scribble decorations and large faded typography decorations render"
    - "Social icons have organic blob border-radius and rotate on hover"
    - "Audio player renders correctly with classified variant"
    - "Public page renders identical layout via static component"
  artifacts:
    - path: "src/lib/themes/chaotic-zine.ts"
      provides: "Theme config with colors, fonts, palettes"
    - path: "src/components/cards/chaotic-zine-layout.tsx"
      provides: "Editor layout component"
    - path: "src/components/public/static-chaotic-zine-layout.tsx"
      provides: "Public page static layout component"
  key_links:
    - from: "src/lib/themes/index.ts"
      to: "src/lib/themes/chaotic-zine.ts"
      via: "import and THEMES array"
      pattern: "chaoticZineTheme"
    - from: "src/app/preview/page.tsx"
      to: "src/components/cards/chaotic-zine-layout.tsx"
      via: "themeId === 'chaotic-zine' branch"
      pattern: "chaotic-zine"
    - from: "src/components/public/public-page-renderer.tsx"
      to: "src/components/public/static-chaotic-zine-layout.tsx"
      via: "themeId === 'chaotic-zine' branch"
      pattern: "StaticChaoticZineLayout"
---

<objective>
Add the Chaotic Zine theme - a ransom-note/cut-and-paste zine aesthetic with torn paper clip-paths, tape over profile photos, alternating dark/light link cards, scribble SVG decorations, and rotating per-character title fonts.

Purpose: New Designer theme that faithfully reproduces the provided HTML/CSS chaotic zine design.
Output: Complete theme with editor layout, public layout, config, fonts, and CSS.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/types/theme.ts
@src/lib/themes/classified.ts (reference pattern for isListLayout theme config)
@src/lib/themes/index.ts
@src/app/fonts.ts
@src/components/cards/classified-layout.tsx (reference pattern for editor custom layout)
@src/components/public/static-classified-layout.tsx (reference pattern for public custom layout)
@src/app/preview/page.tsx (add chaotic-zine branch like classified branch at ~line 408)
@src/components/public/public-page-renderer.tsx (add chaotic-zine branch like classified branch at ~line 307)
@src/components/editor/theme-presets.tsx (add to Designer category themeIds array)
@src/components/public/static-flow-grid.tsx (add audio variant mapping at ~line 93)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Theme foundation - types, config, fonts, CSS, presets, audio mapping</name>
  <files>
    src/types/theme.ts
    src/lib/themes/chaotic-zine.ts
    src/lib/themes/index.ts
    src/app/fonts.ts
    src/app/globals.css
    src/components/editor/theme-presets.tsx
    src/components/public/static-flow-grid.tsx
  </files>
  <action>
    1. **src/types/theme.ts**: Add `'chaotic-zine'` to the ThemeId union type (line 3).

    2. **src/app/fonts.ts**: Add 4 new Google Font imports (Special_Elite and Courier_Prime already exist):
       - `Permanent_Marker` with variable `--font-permanent-marker`, weight '400'
       - `Abril_Fatface` with variable `--font-abril-fatface`, weight '400'
       - `Bangers` with variable `--font-bangers`, weight '400'
       - `Rock_Salt` with variable `--font-rock-salt`, weight '400'
       Add all 4 to the `fontVariables` array. Add all 4 to `CURATED_FONTS` array in the 'display' category. Add all 4 to `FONT_FAMILY_MAP` record.

    3. **src/lib/themes/chaotic-zine.ts**: Create theme config file following the classified.ts pattern:
       ```typescript
       import type { ThemeConfig } from '@/types/theme'

       export const chaoticZineTheme: ThemeConfig = {
         id: 'chaotic-zine',
         name: 'Chaotic Zine',
         description: 'Cut-and-paste zine aesthetic with ransom-note lettering and torn paper',
         isListLayout: true,
         defaultColors: {
           background: '#f4f4f0',  // paper
           cardBg: '#050505',      // ink (dark cards)
           text: '#050505',        // ink
           accent: '#ff3b3b',      // red accent for badges/highlights
           border: '#050505',      // ink borders
           link: '#050505',        // ink links
         },
         defaultFonts: {
           heading: 'var(--font-permanent-marker)',
           body: 'var(--font-special-elite)',
           headingSize: 1.4,
           bodySize: 1.0,
           headingWeight: 'normal',
         },
         defaultStyle: {
           borderRadius: 0,
           shadowEnabled: false,
           blurIntensity: 0,
         },
         palettes: [
           {
             id: 'classic-zine',
             name: 'Classic Zine',
             colors: {
               background: '#f4f4f0',
               cardBg: '#050505',
               text: '#050505',
               accent: '#ff3b3b',
               border: '#050505',
               link: '#050505',
             },
           },
           {
             id: 'punk-pink',
             name: 'Punk Pink',
             colors: {
               background: '#f0e4e8',
               cardBg: '#1a0a10',
               text: '#1a0a10',
               accent: '#ff1493',
               border: '#1a0a10',
               link: '#1a0a10',
             },
           },
           {
             id: 'xerox-blue',
             name: 'Xerox Blue',
             colors: {
               background: '#e8ecf4',
               cardBg: '#0a0a1a',
               text: '#0a0a1a',
               accent: '#2b4fff',
               border: '#0a0a1a',
               link: '#0a0a1a',
             },
           },
           {
             id: 'newsprint',
             name: 'Newsprint',
             colors: {
               background: '#e8e4d8',
               cardBg: '#2a2418',
               text: '#2a2418',
               accent: '#8b4513',
               border: '#2a2418',
               link: '#2a2418',
             },
           },
         ],
       }
       ```

    4. **src/lib/themes/index.ts**: Import `chaoticZineTheme` from './chaotic-zine'. Add to `THEMES` array (after phoneHomeTheme). Add `'chaotic-zine'` to `THEME_IDS` array.

    5. **src/app/globals.css**: Add `[data-theme="chaotic-zine"]` CSS rules:
       - CSS custom properties for the 6 zine fonts (--zine-font-marker, --zine-font-typewriter, --zine-font-display, --zine-font-loud, --zine-font-scratch, --zine-font-mono) mapping to the CSS variables
       - Torn paper clip-path definitions as CSS custom properties
       - `.zine-tape` styles for the tape over profile photo (semi-transparent white/cream strip, slight rotation, box-shadow)
       - `.zine-torn-edge` with the torn paper polygon clip-path
       - `.zine-card-dark` and `.zine-card-light` for alternating card backgrounds
       - `.zine-badge` with red background, white text, slight rotation, jitter animation
       - `@keyframes zine-jitter` animation (subtle position/rotation jitter)
       - `@keyframes zine-spin` for social icon hover (rotate 360deg)
       - `.zine-scribble` for SVG decoration positioning
       - `.zine-decoration` for large faded background typography (&, ?!)
       - `.zine-bio` with black bg, paper-colored text, torn-edge clip-path, slight rotation
       - `.zine-social-icon` with organic blob border-radius (50% 40% 60% 30% / 40% 50% 60% 50%) and hover rotate

    6. **src/components/editor/theme-presets.tsx**: Add `'chaotic-zine'` to the Designer category `themeIds` array (after 'phone-home', line ~39).

    7. **src/components/public/static-flow-grid.tsx**: Add `'chaotic-zine': 'classified'` to the `variantMap` record (~line 93-105). The classified variant works for dark-ink themes.
  </action>
  <verify>
    Run `npx tsc --noEmit` - no type errors. Grep for 'chaotic-zine' across modified files to confirm presence.
  </verify>
  <done>
    ThemeId type includes 'chaotic-zine'. Theme config exists with correct colors/fonts/palettes. 4 new Google Fonts registered. CSS rules for all zine elements exist. Theme appears in Designer category. Audio variant mapped.
  </done>
</task>

<task type="auto">
  <name>Task 2: Editor layout component (chaotic-zine-layout.tsx)</name>
  <files>
    src/components/cards/chaotic-zine-layout.tsx
    src/app/preview/page.tsx
  </files>
  <action>
    1. **src/components/cards/chaotic-zine-layout.tsx**: Create the editor layout component following the ClassifiedLayout pattern ('use client', useState/useRef/useEffect, imports Card types, AudioPlayer, social icons, useThemeStore, useProfileStore, sortCardsBySortKey).

    Interface: `ChaoticZineLayoutProps { title: string; cards: Card[]; isPreview?: boolean; onCardClick?: (cardId: string) => void; selectedCardId?: string | null }`

    The component renders:

    **A. Page wrapper**: `min-h-screen` with paper background color from theme, `overflow-hidden relative`.

    **B. Large faded decorations**: Position 2-3 `absolute` divs with giant faded characters ("&", "?!", "CUT HERE") at various positions, using `opacity-[0.04]`, `text-[180px]`, various zine fonts, pointer-events-none.

    **C. Profile section** (centered, max-w-md mx-auto):
      - **Ransom-note title**: Split `title` (or displayName from useProfileStore) into individual characters. Each character wrapped in an inline-block `<span>` with:
        - Rotating font-family based on `index % 6` cycling through the 6 zine fonts (Permanent Marker, Special Elite, Abril Fatface, Bangers, Rock Salt, Courier Prime)
        - Alternating: some chars get dark bg with light text, some get light bg with dark text, some get accent bg
        - Slight random-looking rotation via `rotate(${(index % 5 - 2) * 3}deg)`
        - Different clip-paths on some characters (slight polygon variations)
        - `inline-block px-1 py-0.5 mx-0.5 leading-tight` spacing
        - Font size ~2rem for title characters
      - **Profile photo** (if avatar exists from useProfileStore):
        - `grayscale(100%) contrast(1.2)` CSS filter
        - Irregular polygon clip-path: `polygon(3% 5%, 97% 0%, 100% 88%, 4% 95%)`
        - Tape element overlay: absolute-positioned div across top of photo, cream/semi-transparent background, slight rotation (-2deg), small box-shadow, z-10
        - Width ~120px, centered
      - **Bio text** (if bio exists from useProfileStore):
        - Black background, paper-colored text
        - Slight rotation (-1deg)
        - Torn-edge clip-path: `polygon(0% 2%, 3% 0%, 7% 3%, ... jagged top/bottom edges)`
        - Padding, max-width constrained
        - Special Elite font

    **D. SVG Scribble decorations**: 2-3 inline SVGs with hand-drawn arrow/circle/underline paths, positioned absolute, `pointer-events-none`, `opacity-30`. Use simple path data for scribble arrows (curved paths with arrowheads). Place them between profile and cards section.

    **E. Cards section** (max-w-md mx-auto):
      For each visible card (sorted by sortCardsBySortKey), render:

      - **Link cards**: Torn-paper styled card with:
        - 3px border in ink color
        - Torn-edge clip-path (each card gets slightly different polygon values, cycle through 3-4 variants based on index)
        - Alternating dark/light: even-index cards get dark bg (ink) with light text (paper), odd-index cards get light bg (paper) with dark text (ink)
        - Slight rotation: `rotate(${(index % 3 - 1) * 1.5}deg)`
        - Font: Permanent Marker for link text
        - Padding: `p-4`
        - First card gets a "NEW!" badge: small red rotated badge element with `zine-jitter` animation, positioned absolute top-right
        - onClick calls onCardClick if provided
        - Selected card gets accent border/outline

      - **Audio cards**: Render AudioPlayer directly (same pattern as ClassifiedLayout):
        - Get audio content, render AudioPlayer with tracks, albumArtUrl, etc.
        - Use `themeVariant="classified"` for the audio player
        - Wrap in a torn-paper card container matching the alternating style

      - **Release cards**: Show release title and optional date in a torn-paper card, link to URL if present

      - **Text cards**: Render content text in Special Elite font within torn-paper card

      - **Social icons row** (from useProfileStore):
        - Each icon in a small container with organic blob border-radius: `border-radius: 50% 40% 60% 30% / 40% 50% 60% 50%`
        - 3px ink border
        - On hover: `transition: transform 0.6s` with `rotate(360deg)`
        - Icon size ~28px

    2. **src/app/preview/page.tsx**:
      - Add import: `import { ChaoticZineLayout } from "@/components/cards/chaotic-zine-layout"`
      - Add branch BEFORE the final default layout (after the departures-board branch or after classified branch, around line 423):
        ```typescript
        if (themeId === 'chaotic-zine') {
          return (
            <>
              <PageBackground />
              <DimOverlay />
              <ChaoticZineLayout
                title={displayName || 'ZINE'}
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
  </action>
  <verify>
    Run `npx tsc --noEmit` - no type errors. Verify the import path resolves. Check that the preview page branch exists for chaotic-zine.
  </verify>
  <done>
    Editor preview shows Chaotic Zine layout when theme is selected: ransom-note title with per-character styling, grayscale taped photo, torn-paper alternating cards, scribble decorations, blob social icons. Cards are clickable for selection.
  </done>
</task>

<task type="auto">
  <name>Task 3: Public static layout component (static-chaotic-zine-layout.tsx) and renderer wiring</name>
  <files>
    src/components/public/static-chaotic-zine-layout.tsx
    src/components/public/public-page-renderer.tsx
  </files>
  <action>
    1. **src/components/public/static-chaotic-zine-layout.tsx**: Create the public/static version following the StaticClassifiedLayout pattern ('use client' for AudioPlayer, imports Link from next/link, Card types, AudioPlayer, SocialIcon/SocialPlatform types, sortCardsBySortKey, social icon components from react-icons/si, Countdown for release cards).

    Interface: `StaticChaoticZineLayoutProps { username: string; title: string; cards: Card[]; headingSize?: number; bodySize?: number; socialIcons?: SocialIcon[]; showSocialIcons?: boolean }`

    This is the SERVER-RENDERED equivalent of chaotic-zine-layout.tsx. Key differences from editor version:
    - Uses `socialIcons` prop instead of useProfileStore (no Zustand on public pages)
    - No `onCardClick`, no `selectedCardId`, no `isPreview`
    - Link cards wrapped in `<a href={url} target="_blank" rel="noopener noreferrer">` for real navigation
    - Audio cards rendered with AudioPlayer directly (same pattern as StaticClassifiedLayout)
    - Release cards use Link component for internal links or `<a>` for external
    - Includes LegalFooter at bottom (import from or inline the privacy/terms links like other static layouts)
    - Avatar comes from props or is not shown (check how StaticClassifiedLayout handles it - if it doesn't have avatar, skip it; the profile header handles avatar separately via the public-page-renderer)

    Actually, looking at the pattern more carefully: The static layout should handle its own profile rendering (title, avatar, bio) since it's a custom layout that replaces the standard StaticProfileHeader. So add props for `avatarUrl?: string | null`, `showAvatar?: boolean`, `bio?: string | null`.

    The visual output must be IDENTICAL to the editor version:
    - Same ransom-note title character styling
    - Same grayscale + tape profile photo
    - Same torn-paper clip-path cards with alternating dark/light
    - Same scribble SVG decorations
    - Same large faded typography decorations
    - Same blob border-radius social icons
    - Same "NEW!" badge on first card

    Include the PLATFORM_ICONS record (copy from static-classified-layout.tsx pattern) for social icon rendering.

    2. **src/components/public/public-page-renderer.tsx**:
      - Add import: `import { StaticChaoticZineLayout } from "./static-chaotic-zine-layout"`
      - Add branch BEFORE the word-art branch (after the classified branch, around line 324):
        ```typescript
        if (themeId === 'chaotic-zine') {
          const socialIcons: SocialIcon[] = socialIconsJson ? JSON.parse(socialIconsJson) : []
          return (
            <StaticChaoticZineLayout
              username={username}
              title={displayName || 'ZINE'}
              cards={cards}
              headingSize={headingSize}
              bodySize={bodySize}
              socialIcons={socialIcons}
              showSocialIcons={showSocialIcons}
              avatarUrl={avatarUrl}
              showAvatar={showAvatar}
              bio={bio}
            />
          )
        }
        ```
  </action>
  <verify>
    Run `npx tsc --noEmit` - no type errors. Run `npm run build` to verify the public page server component compiles. Grep for 'chaotic-zine' in public-page-renderer.tsx to confirm branch exists.
  </verify>
  <done>
    Public page for users with Chaotic Zine theme renders the full zine layout server-side: ransom-note title, torn-paper cards, scribble decorations, social icons with blob borders. Links navigate correctly. Audio player works. Layout matches editor preview exactly.
  </done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with no errors
2. `npm run build` completes successfully
3. Theme appears in Designer category in the editor theme picker
4. Selecting Chaotic Zine in editor shows the zine layout in preview iframe
5. Public page renders the same zine layout for a user with this theme
6. All visual elements present: ransom-note title, torn paper cards, tape on photo, scribble decorations, blob social icons
</verification>

<success_criteria>
- Chaotic Zine theme fully functional in both editor and public views
- 4 new Google Fonts (Permanent Marker, Abril Fatface, Bangers, Rock Salt) registered and available
- Ransom-note title renders each character with rotating font/background/rotation
- Profile photo has grayscale filter + tape overlay + irregular clip-path
- Link cards alternate dark/light with torn-paper clip-paths
- SVG scribble decorations and large faded typography visible
- Social icons have organic blob border-radius
- Audio cards render with classified variant
- No TypeScript errors, build succeeds
</success_criteria>

<output>
After completion, create `.planning/quick/070-chaotic-zine-theme/070-SUMMARY.md`
</output>
