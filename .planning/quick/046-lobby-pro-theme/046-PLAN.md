---
phase: quick
plan: 046
type: execute
wave: 1
depends_on: []
files_modified:
  - src/types/theme.ts
  - src/lib/themes/lobby-pro.ts
  - src/lib/themes/index.ts
  - src/components/cards/lobby-pro-layout.tsx
  - src/components/public/static-lobby-pro-layout.tsx
  - src/app/preview/page.tsx
  - src/components/public/public-page-renderer.tsx
  - src/stores/theme-store.ts
autonomous: true

must_haves:
  truths:
    - "User can select Lobby Pro theme from presets"
    - "Editor preview shows animated list layout with profile header, social icons, and all card types rendered as sleek list items"
    - "Public page renders the same Lobby Pro layout with legal footer"
    - "Cards animate in on scroll with scale+fade using framer-motion"
    - "Gradient overlays fade at top/bottom of scroll area"
    - "Five colorway palettes work (Midnight, Frost, Neon, Sunset, Monochrome)"
    - "Music cards show embedded player, video cards show full-width video, gallery shows carousel, email shows form input"
  artifacts:
    - path: "src/lib/themes/lobby-pro.ts"
      provides: "Theme config with 5 palettes"
    - path: "src/components/cards/lobby-pro-layout.tsx"
      provides: "Editor preview layout with framer-motion animations"
    - path: "src/components/public/static-lobby-pro-layout.tsx"
      provides: "Public page layout with framer-motion animations"
  key_links:
    - from: "src/types/theme.ts"
      to: "src/lib/themes/lobby-pro.ts"
      via: "ThemeId union includes 'lobby-pro'"
    - from: "src/lib/themes/index.ts"
      to: "src/lib/themes/lobby-pro.ts"
      via: "import and registration in THEMES array"
    - from: "src/app/preview/page.tsx"
      to: "src/components/cards/lobby-pro-layout.tsx"
      via: "themeId === 'lobby-pro' routing"
    - from: "src/components/public/public-page-renderer.tsx"
      to: "src/components/public/static-lobby-pro-layout.tsx"
      via: "themeId === 'lobby-pro' routing"
---

<objective>
Create "Lobby Pro" theme - a modern, sleek custom-website style theme with animated vertical list layout using framer-motion.

Purpose: Add a premium, modern theme that differentiates from retro themes. Uses scroll-triggered animations (scale+fade via framer-motion useInView) and glassmorphism for a custom-website feel. Supports all card types rendered as sleek list items.

Output: Fully functional Lobby Pro theme selectable from presets, rendering in both editor preview and public pages, with 5 colorway palettes.
</objective>

<context>
@.planning/STATE.md
@src/types/theme.ts
@src/lib/themes/index.ts
@src/lib/themes/vcr-menu.ts (reference for isListLayout theme pattern)
@src/components/cards/vcr-menu-layout.tsx (reference for custom layout component)
@src/components/public/static-vcr-menu-layout.tsx (reference for static layout)
@src/app/preview/page.tsx (routing pattern for custom layouts)
@src/components/public/public-page-renderer.tsx (public page routing)
@src/stores/theme-store.ts (SYNC_TEXT_COLOR_THEMES, setTheme, loadFromDatabase)
@src/app/fonts.ts (available font variables: --font-dm-sans, --font-space-grotesk)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install framer-motion and create theme config</name>
  <files>
    package.json
    src/types/theme.ts
    src/lib/themes/lobby-pro.ts
    src/lib/themes/index.ts
  </files>
  <action>
    1. Install framer-motion:
       ```
       npm install framer-motion
       ```

    2. In `src/types/theme.ts`, add `'lobby-pro'` to the ThemeId union type:
       ```ts
       export type ThemeId = 'mac-os' | 'instagram-reels' | 'system-settings' | 'vcr-menu' | 'ipod-classic' | 'receipt' | 'macintosh' | 'lobby-pro'
       ```

    3. Create `src/lib/themes/lobby-pro.ts` with ThemeConfig:
       - id: 'lobby-pro'
       - name: 'Lobby Pro'
       - description: 'Modern animated list with glassmorphism and scroll animations'
       - isListLayout: true (completely custom layout, no flow grid)
       - hasGlassEffect: true (enables blur slider in style controls)
       - defaultColors (Midnight palette as default):
         - background: '#0a0a1a' (deep navy/near-black)
         - cardBg: 'rgba(255, 255, 255, 0.08)' (semi-transparent white for glass effect)
         - text: '#ffffff' (white)
         - accent: '#3b82f6' (blue-500)
         - border: 'rgba(255, 255, 255, 0.12)' (subtle white border)
         - link: '#60a5fa' (blue-400)
       - defaultFonts:
         - heading: 'var(--font-dm-sans)' (clean modern sans-serif, already available)
         - body: 'var(--font-dm-sans)'
         - headingSize: 1.3
         - bodySize: 1
         - headingWeight: 'bold'
       - defaultStyle:
         - borderRadius: 16 (rounded corners)
         - shadowEnabled: false
         - blurIntensity: 12 (glassmorphism backdrop blur)
       - palettes array with 5 colorways:
         a. Midnight (id: 'midnight'): Deep navy bg '#0a0a1a', white text, blue accent '#3b82f6', glass cardBg 'rgba(255,255,255,0.08)', border 'rgba(255,255,255,0.12)', transparent: true
         b. Frost (id: 'frost'): Off-white bg '#f0f4f8', dark text '#1a1a2e', icy blue accent '#0ea5e9', cardBg 'rgba(0,0,0,0.04)', border 'rgba(0,0,0,0.08)', transparent: true
         c. Neon (id: 'neon'): Dark bg '#0a0a0a', white text, neon green accent '#22d3ee', cardBg 'rgba(34,211,238,0.06)', border 'rgba(34,211,238,0.15)', transparent: true
         d. Sunset (id: 'sunset'): Warm dark bg '#1a0a0a', warm white text '#fff5f0', coral accent '#f97316', cardBg 'rgba(249,115,22,0.06)', border 'rgba(249,115,22,0.12)', transparent: true
         e. Monochrome (id: 'monochrome'): Pure black bg '#000000', pure white text '#ffffff', white accent '#ffffff', cardBg 'rgba(255,255,255,0.06)', border 'rgba(255,255,255,0.10)', transparent: true

    4. In `src/lib/themes/index.ts`:
       - Add import: `import { lobbyProTheme } from './lobby-pro'`
       - Add to THEMES array: `lobbyProTheme`
       - Add to THEME_IDS array: `'lobby-pro'`
  </action>
  <verify>
    Run `npx tsc --noEmit` - no type errors. Verify framer-motion is in package.json dependencies.
  </verify>
  <done>
    ThemeId includes 'lobby-pro', theme config exists with 5 palettes, framer-motion installed, theme registered in index.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create editor preview layout component (LobbyProLayout)</name>
  <files>
    src/components/cards/lobby-pro-layout.tsx
  </files>
  <action>
    Create `src/components/cards/lobby-pro-layout.tsx` as a 'use client' component.

    Follow the VcrMenuLayout pattern for interface and props:
    ```ts
    interface LobbyProLayoutProps {
      title: string
      cards: Card[]
      isPreview?: boolean
      onCardClick?: (cardId: string) => void
      selectedCardId?: string | null
    }
    ```

    **Imports needed:**
    - `{ useRef } from 'react'`
    - `{ motion, useInView } from 'framer-motion'` (framer-motion v11+ uses this import path)
    - Card types, sortCardsBySortKey, useThemeStore, useProfileStore, SOCIAL_PLATFORMS, SiIcons
    - For music/video embeds: import the existing MusicCard and VideoCard components if they exist, otherwise render simplified versions

    **Component structure:**

    1. **Outer container**: `fixed inset-0 w-full z-10 overflow-x-hidden overflow-y-auto` with theme background color. This matches VCR/Macintosh pattern.

    2. **Gradient overlays** (signature visual):
       - Top: `fixed top-0 left-0 right-0 h-24 z-20 pointer-events-none` with CSS `background: linear-gradient(to bottom, var(--theme-background), transparent)`
       - Bottom: `fixed bottom-0 left-0 right-0 h-24 z-20 pointer-events-none` with CSS `background: linear-gradient(to top, var(--theme-background), transparent)`

    3. **Content wrapper**: `flex flex-col items-center w-full max-w-xl mx-auto px-6 py-16` (narrower than VCR for modern website feel)

    4. **Profile header section** (rendered inline, not using ProfileHeader component since this is a custom layout):
       - Avatar (if showAvatar): circular, 80px, with feather effect using existing CSS mask pattern
       - Display name (if showTitle): clean heading with theme heading font
       - Bio (if exists): smaller text below name, opacity-70
       - Social icons row: horizontal flex with gap-4

    5. **Card list**: Map over sorted visible cards. Each card wrapped in `<AnimatedListItem>` sub-component.

    **AnimatedListItem sub-component:**
    ```tsx
    function AnimatedListItem({ children, index }: { children: React.ReactNode; index: number }) {
      const ref = useRef<HTMLDivElement>(null)
      const isInView = useInView(ref, { once: true, margin: '-50px' })

      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.5, delay: index * 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="w-full"
        >
          {children}
        </motion.div>
      )
    }
    ```

    **Card type rendering** - each card gets a glass-style list item:

    a. **Link/horizontal/hero/square cards**: Render as a clickable row:
       ```
       <button/a> with:
         - backdrop-filter: blur(var(--theme-blur))
         - bg: var(--theme-card-bg)
         - border: 1px solid var(--theme-border)
         - border-radius: var(--theme-border-radius)
         - padding: 16px 20px
         - Full width
         - Flex row: thumbnail (if image, 48px rounded square) + text (title) + arrow icon (ChevronRight from lucide)
         - Hover: scale(1.02) transition, brighter bg
       ```
       If the card has a URL and isPreview, clicking opens the URL. Otherwise call onCardClick.
       Hero cards with images: Show image as a larger banner above the text row (aspect-video, rounded, overflow-hidden).

    b. **Music cards** (card_type === 'music'): Glass container with the platform embed. Show the title text above and the platform name. Use a simplified render - just show the thumbnail image if available with a play button overlay, or show the embed URL text. Don't try to render the full MusicCard component (it needs embed providers). Keep it simple: glass container, album art thumbnail (if content.thumbnailUrl), title, platform badge.

    c. **Video cards** (card_type === 'video'): Full-width rounded container. If video has a thumbnail, show it with play button overlay. If it's an upload type with videoUrl, show a simple video element. Keep styling consistent with glass effect.

    d. **Release cards**: Glass container with album art (if content.albumArtUrl), release title, countdown text (use react-countdown as in VCR layout), pre-save button styled as a pill button with accent color.

    e. **Email collection** (card_type === 'email'): Glass container with heading text, an input[type=email] styled with glass effect and rounded corners, and a submit button with accent bg.

    f. **Social icons** (card_type === 'social-icons'): Skip rendering (icons are in profile header above). Filter out like VCR does.

    g. **Gallery** (card_type === 'gallery'): Glass container with images in a horizontal scrollable row (overflow-x-auto, snap-x). Each image as a rounded square.

    h. **Text cards**: Render as clean typography blocks - just the title text with heading font, no glass container, centered. Acts as section dividers like in VCR.

    i. **Game cards**: Show as a regular link-style glass item with the game name. Games don't play in list layout.

    **Important patterns to follow:**
    - Use `sortCardsBySortKey()` for ordering (required for custom layouts per quick-037 decision)
    - Filter `c.is_visible !== false` and exclude `social-icons` from main list
    - Use `var(--theme-*)` CSS variables for all colors (theme reactive)
    - Use `var(--theme-border-radius)` for border radius
    - For click handling in editor: call `onCardClick(card.id)` for card selection
    - For click handling in preview: open card.url in new tab
    - Show selected card with a ring: `ring-2 ring-blue-500` when `card.id === selectedCardId`
  </action>
  <verify>
    `npx tsc --noEmit` passes. Component file exists and exports LobbyProLayout.
  </verify>
  <done>
    LobbyProLayout renders profile header, animated card list with glass items, gradient overlays, and handles all card types. Each item animates in on scroll with framer-motion.
  </done>
</task>

<task type="auto">
  <name>Task 3: Create public page layout and wire routing in preview + public renderer</name>
  <files>
    src/components/public/static-lobby-pro-layout.tsx
    src/app/preview/page.tsx
    src/components/public/public-page-renderer.tsx
    src/stores/theme-store.ts
  </files>
  <action>
    **1. Create `src/components/public/static-lobby-pro-layout.tsx`:**

    This is the public page version. It's a 'use client' component (needs framer-motion, which is client-only). Follow the StaticVcrMenuLayout pattern for the interface:

    ```ts
    interface StaticLobbyProLayoutProps {
      username: string
      title: string
      cards: Card[]
      headingSize?: number
      bodySize?: number
      socialIcons?: SocialIcon[]
      avatarUrl?: string | null
      showAvatar?: boolean
      avatarFeather?: number
      bio?: string | null
      showTitle?: boolean
      socialIconSize?: number
      blurIntensity?: number
    }
    ```

    Port the LobbyProLayout rendering logic but with these differences:
    - No onCardClick or selectedCardId (public page, not editor)
    - Links open via `<a href>` tags with `target="_blank" rel="noopener noreferrer"` and `data-card-id={card.id}` for analytics tracking
    - Add isMounted state with useEffect for hydration safety on countdown (same pattern as StaticVcrMenuLayout)
    - Include LegalFooter at the bottom (copy the pattern from StaticVcrMenuLayout with privacy/terms links)
    - Music card embeds: For public pages, render just the thumbnail + link to the embed URL. Don't load heavy iframes.
    - Release cards with countdowns: Use react-countdown with isMounted guard (same as StaticVcrMenuLayout pattern)

    **2. Wire routing in `src/app/preview/page.tsx`:**

    Add lobby-pro routing block after the macintosh block (before the default layout). Follow exact pattern of VCR/iPod/Receipt/Macintosh blocks:

    ```tsx
    // Lobby Pro theme uses animated list layout
    if (themeId === 'lobby-pro') {
      return (
        <>
          {/* Page background */}
          <PageBackground />
          {/* Dim overlay */}
          <DimOverlay />

          {/* Lobby Pro Layout */}
          <LobbyProLayout
            title={displayName || ''}
            cards={state.cards}
            isPreview={true}
            onCardClick={handleCardClick}
            selectedCardId={state.selectedCardId}
          />

          {/* Noise overlay */}
          <NoiseOverlay />
        </>
      )
    }
    ```

    Add the import at the top: `import { LobbyProLayout } from '@/components/cards/lobby-pro-layout'`

    **3. Wire routing in `src/components/public/public-page-renderer.tsx`:**

    Add lobby-pro routing block after the macintosh block. Follow the pattern:

    ```tsx
    // Lobby Pro theme uses animated list layout
    if (themeId === 'lobby-pro') {
      const socialIcons: SocialIcon[] = socialIconsJson ? JSON.parse(socialIconsJson) : []

      return (
        <StaticLobbyProLayout
          username={username}
          title={displayName || ''}
          cards={cards}
          headingSize={headingSize}
          bodySize={bodySize}
          socialIcons={socialIcons}
          avatarUrl={avatarUrl}
          showAvatar={showAvatar}
          avatarFeather={avatarFeather}
          bio={bio}
          showTitle={showTitle}
          socialIconSize={socialIconSize}
        />
      )
    }
    ```

    Add the import: `import { StaticLobbyProLayout } from './static-lobby-pro-layout'`

    **4. Update `src/stores/theme-store.ts`:**

    Add 'lobby-pro' to `SYNC_TEXT_COLOR_THEMES` array so header text/icon colors auto-sync:
    ```ts
    const SYNC_TEXT_COLOR_THEMES: ThemeId[] = ['mac-os', 'instagram-reels', 'system-settings', 'lobby-pro']
    ```

    In the `setTheme` action, add 'lobby-pro' to `basicThemes` array so it defaults to centered cards:
    ```ts
    const basicThemes: ThemeId[] = ['mac-os', 'instagram-reels', 'system-settings', 'lobby-pro']
    ```
  </action>
  <verify>
    `npx tsc --noEmit` passes. Run `npm run build` to verify no build errors. Check that:
    1. preview/page.tsx imports and routes to LobbyProLayout
    2. public-page-renderer.tsx imports and routes to StaticLobbyProLayout
    3. theme-store.ts includes lobby-pro in sync arrays
  </verify>
  <done>
    Lobby Pro theme fully wired: selectable from presets, renders animated list in editor preview, renders same layout on public pages with legal footer. Text color syncs to header. All card types handled.
  </done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` - no type errors across the project
2. `npm run build` - builds successfully
3. In the editor, selecting "Lobby Pro" theme shows animated list layout in preview
4. All 5 colorway palettes (Midnight, Frost, Neon, Sunset, Monochrome) apply correctly
5. Cards animate in on scroll with scale+fade effect
6. Gradient overlays visible at top/bottom of scroll area
7. Profile header (avatar, name, bio, social icons) renders above card list
8. All card types render appropriately (links as glass pills, music/video with thumbnails, text as dividers, email as form)
9. Public page at /username renders the Lobby Pro layout when that theme is active
</verification>

<success_criteria>
- Lobby Pro appears in theme presets and is selectable
- Editor preview shows animated vertical list with glassmorphism styling
- Public page renders the same layout with legal footer
- 5 colorway palettes work and can be switched
- framer-motion scroll animations (scale 0.95->1, opacity 0->1, y 20->0) trigger on scroll into view
- Gradient fade overlays at top and bottom of scroll area
- All card types supported: link, horizontal, hero, square, video, music, gallery, release, email, text, game
</success_criteria>

<output>
After completion, create `.planning/quick/046-lobby-pro-theme/046-SUMMARY.md`
</output>
