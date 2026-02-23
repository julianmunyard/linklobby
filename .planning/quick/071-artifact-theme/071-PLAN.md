---
id: "071"
name: "Artifact Theme"
type: quick
tasks: 7
---

<objective>
Implement the "Artifact" brutalist grid theme -- a full-page grid layout with noise overlay, marquee banner, photo panel with blue tint, vinyl record that opens audio player, cycling-color link cards, and social icons footer.

Purpose: Add a new theme option to the LinkLobby theme library.
Output: Fully working "artifact" theme selectable in dashboard, rendering correctly on public pages.
</objective>

<context>
@src/types/theme.ts (ThemeId union, ThemeConfig interface, ThemeState)
@src/lib/themes/index.ts (THEMES array, THEME_IDS, getTheme)
@src/lib/themes/chaotic-zine.ts (closest reference for isListLayout theme config)
@src/app/fonts.ts (font loading, CURATED_FONTS, FONT_FAMILY_MAP, fontVariables)
@src/components/public/public-page-renderer.tsx (dispatch to custom layouts)
@src/components/public/static-chaotic-zine-layout.tsx (reference for custom layout with AudioPlayer, social icons, card rendering)
@src/components/cards/themed-card-wrapper.tsx (editor card wrapper)
@src/app/[username]/page.tsx (server component wiring theme props)

Color palette from reference:
- Pink: #FFC0CB (header, card cycle)
- Orange: #FF8C55 (marquee, card cycle)
- Grey: #A6A6A6 (left panel, card cycle)
- Blue: #4A6FA5 (right panel/photo mat)
- Green: #2F5233 (card cycle)
- Cream: #F2E8DC (footer, card cycle)
- Black: #080808 (background/gaps)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Register theme type, config, and Space Mono font</name>
  <files>
    src/types/theme.ts
    src/lib/themes/artifact.ts
    src/lib/themes/index.ts
    src/app/fonts.ts
  </files>
  <action>
    1. In `src/types/theme.ts`:
       - Add `'artifact'` to the ThemeId union type (append after 'chaotic-zine')

    2. Create `src/lib/themes/artifact.ts`:
       - Export `artifactTheme: ThemeConfig` with:
         - id: 'artifact', name: 'Artifact', description: 'Brutalist grid layout with noise overlay and cycling color blocks'
         - isListLayout: true
         - defaultColors: background '#080808', cardBg '#2F5233', text '#F2E8DC', accent '#FF8C55', border '#080808', link '#F2E8DC'
         - defaultFonts: heading 'var(--font-archivo-black)', body 'var(--font-space-mono)', headingSize 1.6, bodySize 0.9, headingWeight 'normal'
         - defaultStyle: borderRadius 0, shadowEnabled false, blurIntensity 0
         - palettes array with 4-5 variations:
           (a) "Brutalist" (default: black bg, cream text, green cards)
           (b) "Neon Terminal" (dark green bg, bright green text, black cards)
           (c) "Concrete" (grey bg, black text, cream cards)
           (d) "Inverted" (cream bg, black text, pink accent)
           (e) "Midnight" (deep navy bg, white text, blue accent)

    3. In `src/lib/themes/index.ts`:
       - Import artifactTheme from './artifact'
       - Add to THEMES array
       - Add 'artifact' to THEME_IDS array

    4. In `src/app/fonts.ts`:
       - Import Space_Mono from 'next/font/google'
       - Create export: `export const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-space-mono', display: 'swap' })`
       - Add spaceMono.variable to fontVariables array (under "Artifact theme font" comment)
       - Add to CURATED_FONTS: `{ id: 'space-mono', name: 'Space Mono', variable: 'var(--font-space-mono)', category: 'retro' as const }`
       - Add to FONT_FAMILY_MAP: `'var(--font-space-mono)': spaceMono.style.fontFamily`
  </action>
  <verify>
    Run `npx tsc --noEmit` -- no type errors.
    Grep for 'artifact' in theme.ts, index.ts confirms registration.
    Grep for 'space-mono' in fonts.ts confirms font setup.
  </verify>
  <done>
    'artifact' is a valid ThemeId. artifactTheme config exists with palettes. Space Mono font is loaded and registered in all font maps.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create the static artifact layout component</name>
  <files>
    src/components/public/static-artifact-layout.tsx
  </files>
  <action>
    Create `src/components/public/static-artifact-layout.tsx` as a 'use client' component.

    Props interface `StaticArtifactLayoutProps`:
    - username: string, title: string, cards: Card[], headingSize?: number, bodySize?: number
    - socialIcons?: SocialIcon[], showSocialIcons?: boolean
    - avatarUrl?: string | null, showAvatar?: boolean, bio?: string | null

    Color cycle array (used for card backgrounds):
    ```
    const ARTIFACT_COLORS = ['#2F5233', '#F2E8DC', '#FFC0CB', '#A6A6A6', '#FF8C55']
    ```

    Layout structure (full viewport grid, 3px black gaps):

    ```
    <div className="fixed inset-0 overflow-y-auto overflow-x-hidden"
         style={{ background: '#080808' }}>

      {/* Noise overlay - fixed, covers everything */}
      <div className="fixed inset-0 pointer-events-none z-50"
           style={{ opacity: 0.05, backgroundImage: `url("data:image/svg+xml,...")` }} />

      <div style={{ display: 'grid', gridTemplateRows: 'auto auto 25vh 1fr auto', gap: '3px', minHeight: '100vh' }}>

        {/* 1. HEADER BLOCK - Pink background, giant display name */}
        <div style={{ background: '#FFC0CB', padding: '1rem 1.5rem', position: 'relative' }}>
          - Top row: "USER.ID" left, "[ONLINE]" center, formatted date right (Space Mono, 0.7rem, black)
          - Center: Display name in Archivo Black, fontSize '16vw', lineHeight 0.85, uppercase, black, overflow hidden
          - Bottom row: "EST. 2024" left, "V1.0" right (Space Mono, small)
        </div>

        {/* 2. MARQUEE BANNER - Orange, scrolling text */}
        <div style={{ background: '#FF8C55', height: '60px', overflow: 'hidden', position: 'relative' }}>
          - Inner div with CSS animation `marquee 20s linear infinite`
          - Duplicated text content for seamless loop
          - Text: ">>> LINKS_DATABASE /// ACCESS_GRANTED >>> CONNECT_NOW /// NET_RUNNER"
          - Archivo Black, ~2rem, uppercase, black text
          - Inline keyframes via style tag or useEffect to inject @keyframes
        </div>

        {/* 3. TWO-PANEL HERO AREA (25vh) */}
        <div style={{ display: 'grid', gridTemplateColumns: '40% 60%', gap: '3px' }}>

          {/* Left panel - Grey with vinyl record */}
          <div style={{ background: '#A6A6A6', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}
               onClick handler to toggle audio player visibility>
            - Render a vinyl record SVG/CSS graphic:
              * Black circle with grooves (concentric rings), label circle in center with accent color
              * CSS spin animation when audio is playing (use state)
              * Size ~60% of panel height
            - Small label beneath: "PLAY" / "NOW PLAYING" (Space Mono, tiny)
          </div>

          {/* Right panel - Blue with profile photo */}
          <div style={{ background: '#4A6FA5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            - If avatarUrl && showAvatar: render img with grayscale filter, mixBlendMode 'multiply', contrast(1.2)
            - Object-fit cover, filling the panel
            - The blue background shows through as a colored "mat" effect
            - If no avatar: show a large "NO SIGNAL" text in Archivo Black
          </div>
        </div>

        {/* 4. LINK CARDS SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          Map over visible cards (filter out social-icons, release, audio). For each card at index i:

          ```
          const bgColor = ARTIFACT_COLORS[i % ARTIFACT_COLORS.length]
          const isLightBg = ['#F2E8DC', '#FFC0CB', '#A6A6A6'].includes(bgColor)
          const textColor = isLightBg ? '#080808' : '#F2E8DC'
          ```

          Each card block:
          - Full width, padding '1.5rem 2rem', min-height ~80px
          - Background: bgColor, color: textColor
          - Top-left: "LINK_{String(i+1).padStart(2,'0')}" (Space Mono, 0.65rem, opacity 0.6)
          - Top-right: Arrow icon (ArrowUpRight from lucide-react), transitions rotate(45deg) on hover
          - Center: Card title in Archivo Black, text-3xl/text-4xl, uppercase
          - Bottom-right: Card subtitle/description if available (Space Mono, 0.75rem, opacity 0.7)
          - Hover effect: swap bg and text colors (use CSS transition or state). Implement with inline styles and onMouseEnter/onMouseLeave toggling a hoveredIndex state.
          - If card has URL, wrap in `<a>` tag with href, target="_blank", rel="noopener noreferrer"

          For non-link cards (text, gallery, video, etc.):
          - Same colored block style but show card_type as subtitle label
          - Text cards: show the text content as the "title"
          - Gallery/video: show "GALLERY" or "VIDEO" as the title with appropriate icon
        </div>

        {/* 5. AUDIO PLAYER (conditionally shown) */}
        Find the first audio card from cards array. If exists and audio player is toggled open (via vinyl record click):
        - Render a full-width block (background: #080808, padding) containing:
          - AudioPlayer component directly (NOT through CardRenderer -- per CLAUDE.md rule #2)
          - Import AudioPlayer from '@/components/audio/audio-player'
          - Pass tracks, albumArtUrl, showWaveform, looping, reverbConfig, playerColors, cardId, pageId, themeVariant="classified"
        - If no audio card exists, vinyl record click does nothing (or shows "NO TRACK" label)
        - Use useState for `audioOpen` boolean, toggled by vinyl record panel click

        {/* 6. SOCIAL ICONS FOOTER - Cream bar */}
        {showSocialIcons && socialIcons.length > 0 && (
          <div style={{ background: '#F2E8DC', padding: '1rem' }}>
            - 4-column grid of social icons
            - Each icon cell has 3px black right border (except last in row)
            - Use the same PLATFORM_ICONS pattern from chaotic-zine (import social icon components from react-icons/si)
            - Icons in black (#080808), hover opacity transition
            - Space Mono labels beneath each icon (optional, could just be icons)
          </div>
        )}

      </div>

      {/* Legal footer */}
      <footer style={{ padding: '1rem', textAlign: 'center', fontSize: '0.65rem', color: '#A6A6A6' }}>
        <Link> privacy + terms links </Link>
        <div>Powered by LinkLobby</div>
      </footer>
    </div>
    ```

    For the noise overlay SVG, use an inline base64 SVG like:
    ```
    url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")
    ```

    For the marquee animation, inject a `<style>` tag in the component:
    ```css
    @keyframes artifact-marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    ```

    For the vinyl record spinning animation:
    ```css
    @keyframes artifact-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    ```

    Import pattern: Follow chaotic-zine exactly for imports (Card types, AudioCardContent, SocialIcon, AudioPlayer, lucide icons, react-icons/si, sortCardsBySortKey, cn, Link, useState).
  </action>
  <verify>
    Run `npx tsc --noEmit` -- no type errors.
    File exists and exports StaticArtifactLayout.
  </verify>
  <done>
    StaticArtifactLayout renders the complete brutalist grid with: header block, marquee, two-panel hero (vinyl + photo), cycling-color link cards, audio player toggle, social footer, and noise overlay.
  </done>
</task>

<task type="auto">
  <name>Task 3: Wire layout into public page renderer</name>
  <files>
    src/components/public/public-page-renderer.tsx
  </files>
  <action>
    1. Import StaticArtifactLayout at top of file:
       `import { StaticArtifactLayout } from './static-artifact-layout'`

    2. Add artifact theme dispatch block BEFORE the chaotic-zine block (after departures-board):
       ```tsx
       if (themeId === 'artifact') {
         const socialIcons: SocialIcon[] = socialIconsJson ? JSON.parse(socialIconsJson) : []
         return (
           <StaticArtifactLayout
             username={username}
             title={displayName || 'ARTIFACT'}
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

    No new props are needed on PublicPageRendererProps since artifact uses only existing props (displayName, cards, headingSize, bodySize, socialIconsJson, showSocialIcons, avatarUrl, showAvatar, bio).
  </action>
  <verify>
    Run `npx tsc --noEmit` -- no type errors.
    Grep for 'artifact' in public-page-renderer.tsx confirms dispatch.
  </verify>
  <done>
    When themeId is 'artifact', public page renders StaticArtifactLayout instead of default flow grid.
  </done>
</task>

<task type="auto">
  <name>Task 4: Add ArtifactCard wrapper for dashboard editor preview</name>
  <files>
    src/components/cards/themed-card-wrapper.tsx
  </files>
  <action>
    Add a case for 'artifact' in the ThemedCardWrapper switch statement. Artifact cards in the editor should get a brutalist style:

    ```tsx
    case 'artifact':
      return (
        <div
          className={cn("overflow-hidden border-2 border-black", className)}
          style={{
            borderRadius: 0,
            backgroundColor: isTransparent ? 'transparent' : 'var(--theme-card-bg)',
            color: 'var(--theme-text)',
            fontFamily: 'var(--font-space-mono)',
          }}
        >
          {children}
        </div>
      )
    ```

    Place this case before the `default:` case in the switch statement. Keep it simple -- the editor preview doesn't need the full grid layout, just the brutalist card styling (no border-radius, thick black border).
  </action>
  <verify>
    Run `npx tsc --noEmit` -- no type errors.
    Grep for 'artifact' in themed-card-wrapper.tsx confirms case exists.
  </verify>
  <done>
    Cards in the dashboard editor render with brutalist styling when artifact theme is selected.
  </done>
</task>

<task type="auto">
  <name>Task 5: Add artifact CSS to globals.css</name>
  <files>
    src/app/globals.css
  </files>
  <action>
    Add artifact-specific CSS at the end of globals.css (before the closing comments if any), following the pattern of existing theme CSS (e.g., zine-card-dark, zine-card-light, zine-badge):

    ```css
    /* Artifact theme */
    @keyframes artifact-marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    @keyframes artifact-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .artifact-card-hover {
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    .artifact-vinyl {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: radial-gradient(circle at center,
        #FF8C55 0%, #FF8C55 15%,
        #1a1a1a 16%, #1a1a1a 18%,
        #2a2a2a 19%, #1a1a1a 21%,
        #2a2a2a 22%, #1a1a1a 24%,
        #2a2a2a 25%, #1a1a1a 27%,
        #2a2a2a 28%, #1a1a1a 30%,
        #2a2a2a 31%, #1a1a1a 33%,
        #2a2a2a 34%, #1a1a1a 36%,
        #2a2a2a 37%, #1a1a1a 39%,
        #2a2a2a 40%, #1a1a1a 100%
      );
      box-shadow: 0 0 0 3px #080808, 0 0 0 6px #A6A6A6;
    }

    .artifact-vinyl.spinning {
      animation: artifact-spin 3s linear infinite;
    }

    .artifact-noise {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
      background-repeat: repeat;
      background-size: 256px 256px;
    }
    ```

    This moves the animations out of inline styles (cleaner) and the vinyl record is a reusable CSS class.
  </action>
  <verify>
    Grep for 'artifact-marquee' in globals.css confirms CSS is added.
    Run `npx next build` or dev server -- no CSS errors.
  </verify>
  <done>
    Artifact theme CSS animations (marquee, vinyl spin), vinyl record graphic, noise overlay texture, and card hover transitions are defined in globals.css.
  </done>
</task>

<task type="auto">
  <name>Task 6: Add theme thumbnail and preview metadata</name>
  <files>
    src/components/theme-picker.tsx (or equivalent theme selector UI)
  </files>
  <action>
    Find the theme picker/selector component that displays theme options in the dashboard. Search for where other themes like 'chaotic-zine' have their preview/thumbnail defined.

    Add artifact theme entry with:
    - Name: "Artifact"
    - Description: "Brutalist grid layout"
    - Preview colors or thumbnail that matches the black/pink/orange palette

    Follow the exact pattern of how chaotic-zine or other recent themes are listed. This may be automatic if the theme picker reads from the THEMES array -- in that case, verify the theme appears in the picker by checking the component logic.

    If there's a theme preview/thumbnail image system, create a simple preview that shows the grid layout aesthetic (or skip thumbnail if themes auto-generate from config colors).
  </action>
  <verify>
    Theme picker shows "Artifact" as a selectable option.
    Run `npx tsc --noEmit` -- no type errors.
  </verify>
  <done>
    Artifact theme appears in the dashboard theme picker and can be selected.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 7: Visual verification of Artifact theme</name>
  <what-built>
    Complete Artifact brutalist grid theme with:
    - Giant pink header with 16vw display name
    - Orange scrolling marquee banner
    - Two-panel hero: vinyl record (left) + blue-tinted photo (right)
    - Cycling-color link cards with hover inversion
    - Social icons footer on cream background
    - Noise overlay across everything
    - Vinyl record click toggles audio player
  </what-built>
  <how-to-verify>
    1. Open dashboard, go to theme selector
    2. Select "Artifact" theme
    3. Verify editor shows cards with brutalist styling (thick black borders, no border-radius)
    4. Open public page preview
    5. Verify: Pink header block with giant display name text
    6. Verify: Orange marquee banner scrolls continuously
    7. Verify: Left panel shows vinyl record, right panel shows profile photo with blue tint
    8. Verify: Link cards cycle through green/cream/pink/grey/orange backgrounds
    9. Hover over link cards -- verify color inversion effect
    10. Click vinyl record -- verify audio player appears/opens
    11. Verify: Social icons show in cream footer bar
    12. Verify: Subtle noise texture visible across the page
    13. Test on mobile viewport -- layout should stack gracefully
  </how-to-verify>
  <resume-signal>Type "approved" or describe any visual issues to fix</resume-signal>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with no errors
- 'artifact' exists in ThemeId union type
- artifactTheme config is registered in THEMES array
- Space Mono font is loaded and in all font registries
- Public page renders StaticArtifactLayout when themeId is 'artifact'
- Editor cards render with brutalist wrapper
- All 7 color palette blocks render correctly (header pink, marquee orange, left grey, right blue, cards cycling, footer cream, bg black)
</verification>

<success_criteria>
- Artifact theme is selectable in dashboard
- Public page shows the complete brutalist grid layout
- Vinyl record click activates audio player
- Link cards cycle through 5 colors with hover inversion
- Marquee scrolls seamlessly
- Profile photo renders with blue-tint multiply effect
- Social icons display in cream footer
- Noise overlay is visible at low opacity
- No TypeScript errors, no console errors
</success_criteria>
