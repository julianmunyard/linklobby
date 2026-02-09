---
phase: quick
plan: 050
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/themes/classified.ts
  - src/types/theme.ts
  - src/lib/themes/index.ts
  - src/app/fonts.ts
  - src/app/globals.css
  - src/components/cards/classified-layout.tsx
  - src/components/public/static-classified-layout.tsx
  - src/app/preview/page.tsx
  - src/components/public/public-page-renderer.tsx
autonomous: true

must_haves:
  truths:
    - "User can select 'Classified' theme in the theme picker"
    - "Editor preview renders a pink/salmon A4-style paper with CLASSIFIED stamps, red headers, and purple-blue typewriter links"
    - "Public page renders the same classified document layout with functional links"
    - "Text is rendered in Special Elite typewriter font"
    - "Links are centered and clickable in purple-blue typewriter text"
  artifacts:
    - path: "src/lib/themes/classified.ts"
      provides: "ThemeConfig for classified document theme"
    - path: "src/components/cards/classified-layout.tsx"
      provides: "Editor preview layout component"
    - path: "src/components/public/static-classified-layout.tsx"
      provides: "Public page static layout component"
  key_links:
    - from: "src/lib/themes/index.ts"
      to: "src/lib/themes/classified.ts"
      via: "import and THEMES array registration"
      pattern: "classifiedTheme"
    - from: "src/app/preview/page.tsx"
      to: "src/components/cards/classified-layout.tsx"
      via: "themeId === 'classified' conditional"
      pattern: "classified"
    - from: "src/components/public/public-page-renderer.tsx"
      to: "src/components/public/static-classified-layout.tsx"
      via: "themeId === 'classified' conditional"
      pattern: "classified"
---

<objective>
Add a "Classified Document" theme to LinkLobby -- a WWII military document aesthetic with pink/salmon paper, red title/stamps, purple-blue typewriter text, "CLASSIFIED" stamp, centered links on A4-style paper.

Purpose: This is the 10th theme, following the exact same architecture pattern as Receipt, VCR, iPod, Lanyard, and Word Art themes. It uses `isListLayout: true` with a completely custom layout component.

Output: A fully working theme selectable in the editor with matching public page rendering.
</objective>

<context>
@src/lib/themes/receipt.ts (theme config pattern to follow)
@src/lib/themes/lanyard-badge.ts (most recent theme config)
@src/lib/themes/index.ts (theme registration)
@src/types/theme.ts (ThemeId union type)
@src/app/fonts.ts (font setup pattern)
@src/app/globals.css (CSS styles pattern)
@src/components/cards/receipt-layout.tsx (editor layout component pattern)
@src/components/public/static-receipt-layout.tsx (public layout component pattern)
@src/app/preview/page.tsx (preview routing)
@src/components/public/public-page-renderer.tsx (public page routing)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Theme config, type registration, font setup</name>
  <files>
    src/lib/themes/classified.ts
    src/types/theme.ts
    src/lib/themes/index.ts
    src/app/fonts.ts
  </files>
  <action>
1. **Add 'classified' to ThemeId union** in `src/types/theme.ts`:
   - Append `| 'classified'` to the ThemeId type union

2. **Create theme config** at `src/lib/themes/classified.ts`:
   - Import ThemeConfig from '@/types/theme'
   - Export `classifiedTheme: ThemeConfig` with:
     - `id: 'classified'`
     - `name: 'Classified'`
     - `description: 'WWII classified military document with typewriter text and rubber stamps'`
     - `isListLayout: true` (like receipt, VCR, iPod, lanyard)
     - `defaultColors`:
       - `background: '#2a2a2a'` (dark desk background behind the paper)
       - `cardBg: '#E8A0A0'` (pink/salmon paper color)
       - `text: '#3B2F7E'` (purple-blue typewriter/mimeograph ink)
       - `accent: '#CC0000'` (red for stamps and headers)
       - `border: '#3B2F7E'` (purple-blue borders)
       - `link: '#3B2F7E'` (purple-blue links)
     - `defaultFonts`:
       - `heading: 'var(--font-special-elite)'`
       - `body: 'var(--font-special-elite)'`
       - `headingSize: 1.6`
       - `bodySize: 1.1`
       - `headingWeight: 'normal'`
     - `defaultStyle`:
       - `borderRadius: 0` (clean A4 edges)
       - `shadowEnabled: false`
       - `blurIntensity: 0`
     - `palettes` array with 4 palettes:
       1. `'war-department'` (default pink/salmon - the colors above)
       2. `'top-secret'` - slightly more aged/tan paper: `background: '#1a1a1a'`, `cardBg: '#d4a088'` (warmer aged pink), `text: '#2a1f5e'` (darker purple), `accent: '#990000'` (darker red), `border/link: '#2a1f5e'`
       3. `'intelligence-bureau'` - cooler blue-tinted: `background: '#1c2333'` (dark navy), `cardBg: '#c4b8c8'` (lavender-grey paper), `text: '#2b2d5e'` (navy-purple), `accent: '#8b0000'` (dark red), `border/link: '#2b2d5e'`
       4. `'field-report'` - olive/military green tinted: `background: '#1a1e14'` (dark olive), `cardBg: '#c8c0a0'` (khaki/green-tinted paper), `text: '#2a3020'` (dark olive text), `accent: '#8b2500'` (burnt red), `border/link: '#2a3020'`

3. **Register theme** in `src/lib/themes/index.ts`:
   - Add `import { classifiedTheme } from './classified'`
   - Append `classifiedTheme` to THEMES array
   - Append `'classified'` to THEME_IDS array

4. **Add Special Elite font** in `src/app/fonts.ts`:
   - Import `Special_Elite` from `next/font/google`
   - Create: `export const specialElite = Special_Elite({ subsets: ['latin'], weight: ['400'], variable: '--font-special-elite', display: 'swap' })`
   - Add `specialElite.variable` to the `fontVariables` array (in the "Retro/Pixel" or a new "Classified" section)
   - Add to `CURATED_FONTS` array: `{ id: 'special-elite', name: 'Special Elite', variable: 'var(--font-special-elite)', category: 'retro' as const }`
  </action>
  <verify>
Run `npx tsc --noEmit` - no type errors. Grep for 'classified' in index.ts and theme.ts to confirm registration.
  </verify>
  <done>
ThemeId includes 'classified', theme config exists with correct colors/fonts/palettes, Special Elite font is registered, theme appears in THEMES array.
  </done>
</task>

<task type="auto">
  <name>Task 2: Editor preview layout component and CSS</name>
  <files>
    src/components/cards/classified-layout.tsx
    src/app/globals.css
    src/app/preview/page.tsx
  </files>
  <action>
1. **Create editor layout component** at `src/components/cards/classified-layout.tsx`:
   - Follow the EXACT same pattern as `receipt-layout.tsx` but adapted for classified doc aesthetic
   - `'use client'` at top
   - Import same types: Card, ReleaseCardContent, isReleaseContent, SocialPlatform, isAudioContent, AudioCardContent, AudioPlayer, cn, sortCardsBySortKey, useThemeStore, useProfileStore, social platform icons, Countdown
   - Interface: `ClassifiedLayoutProps { title, cards, isPreview?, onCardClick?, selectedCardId? }`
   - Component structure (the document):
     - Outer container: `fixed inset-0 w-full z-10 overflow-x-hidden overflow-y-auto` with keyboard handler and tabIndex=0
     - Inner: `flex justify-center py-8 px-4`
     - Paper container div with className `classified-paper relative`:
       - Style: `backgroundColor: 'var(--theme-card-bg)'`, `color: 'var(--theme-text)'`, `fontFamily: 'var(--font-special-elite)'`

     - **Punch holes row** at top: 3 circles (div with flex justify-around, three 12px diameter circles with dark border, semi-transparent fill)

     - **Top CLASSIFIED stamp**: A div with className `classified-stamp` positioned at top, text "CLASSIFIED" in red (accent color), rotated slightly (-3deg), font-size ~1.2rem, letter-spacing wide, border: 2px solid accent, padding 4px 12px

     - **Header section**:
       - "WAR DEPARTMENT" in accent color, text-center, uppercase, letter-spacing widest, font-size 0.7rem
       - "CLASSIFIED MESSAGE CENTER" in accent color, text-center, uppercase, font-size 0.8rem, font-weight bold
       - "INCOMING MESSAGE" in accent color, text-center, font-size 0.7rem
       - Horizontal rule (1px solid accent)

     - **Document metadata** (like receipt's date/time section):
       - Use client-side useEffect to generate: DATE, TIME, REF NO (random 6-digit), CLASSIFICATION: "SECRET"
       - Displayed in small text, two-column layout (label left, value right)
       - Text in theme-text color (purple-blue)

     - **Divider**: A line of dashes or equals signs, like receipt divider

     - **Title display**: The user's display name/title, centered, uppercase, in accent color (red), slightly larger font

     - **Links section**: Map over visibleCards (same filtering as receipt - exclude social-icons, release, sort by sortKey)
       - Text cards render as section headers: `--- {TEXT} ---` centered
       - Audio cards render AudioPlayer with `themeVariant="receipt"` (reuse receipt variant styling)
       - Link cards render as centered text buttons:
         - Full width, text-center, py-2, cursor-pointer
         - Display text in purple-blue (theme-text), uppercase, letter-spacing slightly wide
         - On hover: underline
         - Styled like typewriter-struck text
         - NO dot leaders (unlike receipt) -- just clean centered text

     - **Release cards section**: Same pattern as receipt-layout.tsx for handling release/countdown cards

     - **Social icons section**: Same as receipt - flex centered row

     - **Bottom CLASSIFIED stamp**: Another "CLASSIFIED" stamp, rotated opposite direction (+2deg)

     - **Footer**: "END OF MESSAGE" centered, small text, in accent color

   - **Keyboard navigation**: Copy from receipt-layout.tsx (ArrowUp/Down to move focus, Enter to open link)
   - **Card click handling**: Copy from receipt-layout.tsx
   - Do NOT include: sticker system, dithered photo, barcode, torn edges, float animation

2. **Add CSS styles** to `src/app/globals.css`:
   - Add at the end, after the existing theme styles:

   ```css
   /* Classified Document Theme Styles */
   [data-theme="classified"] {
     --theme-shadow: none;
   }

   /* Classified paper container */
   .classified-paper {
     width: 420px;
     max-width: 100%;
     position: relative;
     padding: 0;
     overflow: visible;
     box-shadow:
       0 4px 20px rgba(0, 0, 0, 0.3),
       2px 0 0 rgba(0, 0, 0, 0.08),
       -2px 0 0 rgba(0, 0, 0, 0.08);
   }

   /* Paper texture overlay for classified doc (reuse paper-texture.jpeg) */
   .classified-paper::after {
     content: '';
     position: absolute;
     top: 0;
     left: 0;
     right: 0;
     bottom: 0;
     width: 100%;
     height: 100%;
     background-image: url('/images/paper-texture.jpeg');
     background-size: cover;
     background-position: center;
     mix-blend-mode: multiply;
     pointer-events: none;
     z-index: 9999;
     opacity: 0.5;
   }

   /* Classified content area */
   .classified-content {
     padding: 32px 28px;
     position: relative;
     z-index: 10;
   }

   /* CLASSIFIED rubber stamp effect */
   .classified-stamp {
     display: inline-block;
     border: 3px solid var(--theme-accent, #CC0000);
     color: var(--theme-accent, #CC0000);
     padding: 4px 16px;
     font-size: 1.4rem;
     font-weight: bold;
     letter-spacing: 0.3em;
     text-transform: uppercase;
     opacity: 0.85;
     /* Slight ink bleed effect */
     text-shadow: 0.5px 0.5px 0px var(--theme-accent, #CC0000);
   }

   /* Classified document item styles */
   .classified-item {
     border: none;
     background: transparent;
   }

   .classified-item:hover {
     text-decoration: underline;
     text-underline-offset: 3px;
   }

   /* Classified item keyboard selection */
   .classified-item-selected {
     background-color: var(--theme-text);
     color: var(--theme-card-bg);
   }

   /* Classified punch holes */
   .classified-punch-hole {
     width: 14px;
     height: 14px;
     border-radius: 50%;
     border: 1px solid rgba(0, 0, 0, 0.3);
     background: rgba(0, 0, 0, 0.08);
   }

   /* Classified divider */
   .classified-divider {
     text-align: center;
     letter-spacing: 0;
     opacity: 0.4;
     font-size: 10px;
     overflow: hidden;
     white-space: nowrap;
   }

   /* Responsive */
   @media (max-width: 480px) {
     .classified-paper {
       width: 100%;
     }
   }
   ```

3. **Add preview routing** in `src/app/preview/page.tsx`:
   - Import `ClassifiedLayout` from `@/components/cards/classified-layout`
   - Add a conditional block (following the same pattern as receipt, lanyard, etc.):
     ```tsx
     if (themeId === 'classified') {
       return (
         <>
           <PageBackground />
           <DimOverlay />
           <ClassifiedLayout
             title={displayName || 'CLASSIFIED'}
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
   - Place this block AFTER the lanyard-badge block and BEFORE the word-art block (or after word-art, doesn't matter as long as it's before the default layout)
  </action>
  <verify>
Run `npx tsc --noEmit` - no type errors. Check that preview/page.tsx has the classified routing. Check that globals.css has the classified styles.
  </verify>
  <done>
ClassifiedLayout component renders a WWII-style classified document with punch holes, red CLASSIFIED stamps, red WAR DEPARTMENT header, metadata section, centered purple-blue typewriter links, and END OF MESSAGE footer. Preview routing connects it. CSS provides paper container, stamp, and item styles.
  </done>
</task>

<task type="auto">
  <name>Task 3: Static public layout and public page routing</name>
  <files>
    src/components/public/static-classified-layout.tsx
    src/components/public/public-page-renderer.tsx
  </files>
  <action>
1. **Create static public layout** at `src/components/public/static-classified-layout.tsx`:
   - Follow the EXACT same pattern as `static-receipt-layout.tsx` but for classified theme
   - `'use client'` at top (needed for keyboard nav and client-side date generation)
   - Same imports as static-receipt-layout: useState, useRef, useEffect, Link, Card types, release types, audio types, AudioPlayer, SocialIcon, SocialPlatform, cn, sortCardsBySortKey, platform icons, Countdown

   - Interface: `StaticClassifiedLayoutProps`:
     - `username: string`
     - `title: string`
     - `cards: Card[]`
     - `headingSize?: number` (default 1.6)
     - `bodySize?: number` (default 1.1)
     - `socialIcons?: SocialIcon[]` (default [])
     - `showSocialIcons?: boolean` (default true)
     - NO avatarUrl/showAvatar/bio props (classified doesn't show avatar)
     - NO receiptPrice/receiptStickers/receiptFloatAnimation props

   - Component renders the SAME document structure as ClassifiedLayout but:
     - Links use `<a>` tags with href instead of `<button>` with onClick
     - Release pre-save/after-countdown links use `<a>` instead of `<button>`
     - No isPreview checks
     - Has isMounted state for countdown hydration safety (same as static-receipt)
     - Includes `<footer>` at end with LegalFooter pattern (Privacy Policy link with `?username=`, Terms, Powered by LinkLobby) - styled with dark text at 0.4 opacity (same as static-receipt-layout)

   - The visual output should be identical to the editor preview version

2. **Add public page routing** in `src/components/public/public-page-renderer.tsx`:
   - Import `StaticClassifiedLayout` from `./static-classified-layout`
   - Add conditional block (following same pattern as receipt/lanyard):
     ```tsx
     if (themeId === 'classified') {
       const socialIcons: SocialIcon[] = socialIconsJson ? JSON.parse(socialIconsJson) : []
       return (
         <StaticClassifiedLayout
           username={username}
           title={displayName || 'CLASSIFIED'}
           cards={cards}
           headingSize={headingSize}
           bodySize={bodySize}
           socialIcons={socialIcons}
           showSocialIcons={showSocialIcons}
         />
       )
     }
     ```
   - Place after the lanyard-badge block (before word-art or after, consistent with preview routing order)
  </action>
  <verify>
Run `npx tsc --noEmit` - no type errors. Check that public-page-renderer.tsx has the classified routing. Check static-classified-layout.tsx exists and exports StaticClassifiedLayout.
  </verify>
  <done>
Public pages with classified theme render the same WWII document layout with working links (using `<a>` tags), legal footer, and keyboard navigation. The routing in public-page-renderer.tsx correctly dispatches to StaticClassifiedLayout.
  </done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with no errors
2. `npm run build` completes successfully
3. Theme appears in theme picker in editor
4. Preview iframe shows classified document with pink paper, red stamps, purple-blue typewriter text
5. Public page renders identical layout with clickable links
6. Special Elite font loads and renders correctly
7. Keyboard navigation (up/down arrows, Enter) works in both preview and public
</verification>

<success_criteria>
- 'classified' is a valid ThemeId
- Theme config has 4 palettes (war-department, top-secret, intelligence-bureau, field-report)
- Special Elite Google Font loads via next/font/google
- Editor preview renders ClassifiedLayout for themeId === 'classified'
- Public page renders StaticClassifiedLayout for themeId === 'classified'
- Document shows: punch holes, CLASSIFIED stamps (top/bottom), WAR DEPARTMENT header, metadata, centered links, END OF MESSAGE footer
- Colors: pink/salmon paper (#E8A0A0), red stamps/headers (#CC0000), purple-blue text (#3B2F7E)
- No TypeScript errors, no build errors
</success_criteria>

<output>
After completion, create `.planning/quick/050-classified-document-theme/050-SUMMARY.md`
</output>
