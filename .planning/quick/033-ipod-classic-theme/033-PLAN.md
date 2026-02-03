---
id: "033"
name: iPod Classic Theme
type: quick
status: planned
files_modified:
  - src/types/theme.ts
  - src/lib/themes/ipod-classic.ts
  - src/lib/themes/index.ts
  - src/components/cards/ipod-classic-layout.tsx
  - src/components/public/static-ipod-classic-layout.tsx
  - src/app/preview/page.tsx
  - src/components/public/public-page-renderer.tsx
  - src/app/globals.css
---

<objective>
Create an iPod Classic theme for LinkLobby that displays the user's links in a classic iPod interface with screen, click wheel, and navigation.

Purpose: Add a nostalgic retro theme that transforms the user's link page into an interactive iPod Classic device.
Output: New theme with iPod body, screen bezel, menu list (user's cards as menu items), click wheel navigation, and rainbow Apple logo.
</objective>

<context>
Reference implementation: /Users/julianmunyard/Downloads/IPOD app/src/App.tsx and App.css

Existing patterns to follow:
- VCR Menu theme (isListLayout: true) at src/lib/themes/vcr-menu.ts
- VcrMenuLayout component at src/components/cards/vcr-menu-layout.tsx
- StaticVcrMenuLayout for public pages at src/components/public/static-vcr-menu-layout.tsx
- Theme integration in src/app/preview/page.tsx (lines 139-161)
- ThemeId type at src/types/theme.ts

Key design from reference:
- iPod body: cream/beige (#f5f0e1), rounded corners (24px), inset shadows
- Screen bezel: black (#1a1a1a), rounded (12px), contains LCD screen
- LCD screen: gray gradient (#d0d0d0 to #b8b8b8), 220px height
- Menu header: blue gradient (#4a90d9 to #357abd) with title and clock
- Menu items: gray bg, blue gradient when selected, emoji icons
- Click wheel: 180px circle, cream gradient, center button, menu/prev/next/play buttons
- Rainbow Apple logo SVG at bottom
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add iPod Classic theme type and config</name>
  <files>
    - src/types/theme.ts
    - src/lib/themes/ipod-classic.ts
    - src/lib/themes/index.ts
  </files>
  <action>
1. Update src/types/theme.ts:
   - Add 'ipod-classic' to ThemeId union type

2. Create src/lib/themes/ipod-classic.ts:
   - Export `ipodClassicTheme: ThemeConfig`
   - Set `id: 'ipod-classic'`, `name: 'iPod Classic'`, `description: 'Classic iPod interface with click wheel navigation'`
   - Set `isListLayout: true` (like VCR Menu)
   - defaultColors:
     - background: '#e8e0d0' (page background - subtle gradient effect via CSS)
     - cardBg: '#c8c8c8' (LCD screen gray)
     - text: '#1a1a1a' (dark text)
     - accent: '#2a6eff' (selection blue)
     - border: '#1a1a1a' (bezel black)
     - link: '#1a1a1a'
   - defaultFonts:
     - heading: 'var(--font-inter)' (clean system font)
     - body: 'var(--font-inter)'
     - headingSize: 1.0
     - bodySize: 1.0
     - headingWeight: 'bold'
   - defaultStyle:
     - borderRadius: 24 (iPod body radius)
     - shadowEnabled: true
     - blurIntensity: 0
   - palettes: single 'classic-ipod' palette with same colors

3. Update src/lib/themes/index.ts:
   - Import ipodClassicTheme from './ipod-classic'
   - Add to THEMES array
   - Add 'ipod-classic' to THEME_IDS array
  </action>
  <verify>TypeScript compiles without errors: `cd /Users/julianmunyard/LinkLobby && npx tsc --noEmit`</verify>
  <done>ThemeId includes 'ipod-classic', theme config exists with isListLayout: true, theme registered in index</done>
</task>

<task type="auto">
  <name>Task 2: Create iPod Classic layout component</name>
  <files>
    - src/components/cards/ipod-classic-layout.tsx
    - src/app/globals.css
  </files>
  <action>
Create src/components/cards/ipod-classic-layout.tsx following VcrMenuLayout pattern:

1. Interface IpodClassicLayoutProps:
   - title: string (display name)
   - cards: Card[]
   - isPreview?: boolean
   - onCardClick?: (cardId: string) => void
   - selectedCardId?: string | null

2. Component state:
   - selectedIndex: number (0)
   - currentTime: Date (updated every second for clock display)
   - containerRef for focus

3. Render structure (port from reference App.tsx):
   - Outer container: centered, min-h-screen, flex items-center justify-center
   - iPod body div (.ipod-container class):
     - 320px width, cream bg (#f5f0e1), rounded-3xl, padding, shadow
   - Screen bezel div:
     - Black bg (#1a1a1a), rounded-xl, padding
   - LCD screen div:
     - Gray gradient bg, 220px height, overflow hidden
     - Status bar: "links" text + battery icon
     - Menu header: blue gradient, title + clock
     - Menu list: scrollable, user's cards as menu items
     - Screen footer: item count
   - Click wheel div:
     - 180px circle, cream gradient, relative positioning
     - Menu button (top), prev/next buttons (left/right), play button (bottom)
     - Center button (70px circle)
     - Touch wheel overlay for click detection
   - Rainbow Apple logo SVG at bottom

4. Navigation logic (port from reference):
   - Keyboard: ArrowUp/ArrowDown to change selection, Enter to activate
   - Touch/click on wheel: detect quadrant, up/down to change selection
   - Center button click: activate selected link
   - Menu item click: select then activate on double-click (like VCR)

5. Menu item rendering:
   - Each card becomes a menu row
   - Show emoji icon (use first emoji from title or generic icon based on card_type)
   - Show card title (or card_type if no title)
   - Selected item: blue gradient bg, white text, arrow indicator

6. Link activation:
   - If isPreview and card has URL, window.open
   - Otherwise call onCardClick(card.id)

Add to src/app/globals.css:
- .ipod-container styles (width, bg, border-radius, shadows)
- .ipod-screen styles (gray gradient, height)
- .ipod-menu-header styles (blue gradient)
- .ipod-menu-item and .ipod-menu-item.selected styles
- .ipod-click-wheel styles (size, gradient, positioning)
- .ipod-center-button styles
- .ipod-wheel-button styles (menu, prev, next, play positions)
  </action>
  <verify>Component imports cleanly: `cd /Users/julianmunyard/LinkLobby && npx tsc --noEmit`</verify>
  <done>IpodClassicLayout component renders iPod body with screen, menu items from cards, click wheel, and Apple logo</done>
</task>

<task type="auto">
  <name>Task 3: Create static version and integrate theme</name>
  <files>
    - src/components/public/static-ipod-classic-layout.tsx
    - src/app/preview/page.tsx
    - src/components/public/public-page-renderer.tsx
  </files>
  <action>
1. Create src/components/public/static-ipod-classic-layout.tsx:
   - Same as IpodClassicLayout but for public pages
   - Props: title, cards, headingSize?, bodySize?
   - No onCardClick/selectedCardId (public pages just open links)
   - Uses same navigation and styling

2. Update src/app/preview/page.tsx:
   - Import IpodClassicLayout from '@/components/cards/ipod-classic-layout'
   - Add condition after VCR menu check (around line 140):
     ```tsx
     if (themeId === 'ipod-classic') {
       return (
         <>
           <PageBackground />
           <DimOverlay />
           <IpodClassicLayout
             title={displayName || 'links'}
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

3. Update src/components/public/public-page-renderer.tsx:
   - Import StaticIpodClassicLayout
   - Add condition for ipod-classic theme to render StaticIpodClassicLayout instead of default grid
   - Pass profile.display_name as title, cards array, font sizes from theme
  </action>
  <verify>
Run dev server and test:
1. `cd /Users/julianmunyard/LinkLobby && npm run dev`
2. Navigate to editor, select iPod Classic theme
3. Verify iPod renders with user's cards as menu items
4. Verify click wheel navigation works
  </verify>
  <done>
- Editor preview shows iPod Classic interface when theme selected
- Public pages render iPod Classic layout
- Navigation (keyboard + click wheel) works
- Links open when activated
  </done>
</task>

<task type="auto">
  <name>Task 4: Polish and visual refinements</name>
  <files>
    - src/components/cards/ipod-classic-layout.tsx
    - src/components/public/static-ipod-classic-layout.tsx
    - src/app/globals.css
  </files>
  <action>
1. Add responsive handling:
   - On mobile (< 400px), reduce iPod width to 280px
   - Reduce click wheel to 150px, center button to 58px
   - Reduce screen height to 190px
   - Hide navigation instructions on mobile

2. Add clock formatting:
   - Format as "12:34 pm" (lowercase, like reference)
   - Update every second via useEffect

3. Add icon extraction helper:
   - Extract first emoji from card title if present
   - Fallback icons by card_type:
     - link/horizontal: chain icon
     - hero: star icon
     - video: play icon
     - gallery: image icon
     - music: music note icon
     - social-icons: people icon
     - default: bullet point

4. Add smooth animations:
   - Menu selection: instant bg change (no transition, VCR-style crisp)
   - Button press: scale(0.95) on :active
   - Center button: subtle shadow change on hover/active

5. Ensure theme colors work:
   - iPod body bg uses --theme-background (or hardcoded cream)
   - Menu selection uses --theme-accent
   - Text uses --theme-text
   - Keep classic iPod aesthetic but allow some customization via palettes

6. Test edge cases:
   - Many items (scrollable menu list)
   - Long titles (truncate with ellipsis)
   - No cards (show "No links" message)
   - Hidden cards filtered out
  </action>
  <verify>
Manual testing:
1. Test keyboard navigation (up/down/enter)
2. Test click wheel (top/bottom quadrants)
3. Test center button activates link
4. Test on mobile viewport
5. Test with various numbers of cards
  </verify>
  <done>
- iPod Classic theme fully functional
- Responsive on mobile
- Clock displays current time
- Icons show for each menu item
- Smooth button interactions
- Works with theme color customization
  </done>
</task>

</tasks>

<verification>
1. TypeScript compiles: `npx tsc --noEmit`
2. Theme appears in theme selector in editor
3. Selecting iPod Classic theme shows iPod interface in preview
4. User's cards appear as menu items
5. Keyboard navigation (arrow keys + enter) works
6. Click wheel navigation works (click top/bottom of wheel ring)
7. Center button activates selected link
8. Clock shows current time
9. Responsive on mobile viewports
10. Public pages render iPod Classic layout
</verification>

<success_criteria>
- iPod Classic theme is selectable from theme panel
- Preview shows classic iPod body with cream housing, black bezel, gray LCD screen
- User's links appear as iPod menu items with icons
- Click wheel navigation works (touch/click)
- Keyboard navigation works (arrow keys)
- Links open when activated (center button or enter key)
- Theme works on public pages
- Responsive design scales down on mobile
</success_criteria>

<output>
After completion, commit with message:
"feat(quick-033): add iPod Classic theme with click wheel navigation"
</output>
