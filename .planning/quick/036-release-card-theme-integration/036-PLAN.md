---
id: "036"
type: quick
title: Release Card Theme Integration
status: planned
files_modified:
  - src/components/cards/ipod-classic-layout.tsx
  - src/components/cards/vcr-menu-layout.tsx
  - src/components/cards/receipt-layout.tsx
  - src/components/public/static-ipod-classic-layout.tsx
  - src/components/public/static-vcr-menu-layout.tsx
  - src/components/public/static-receipt-layout.tsx
---

<objective>
Integrate release card countdown functionality into iPod Classic, VCR Menu, and Receipt themes with theme-appropriate styling.

Purpose: Allow release countdowns to display natively within specialty themes rather than showing as generic card blocks
Output: Three themes updated with release card support, plus their static public page variants
</objective>

<context>
@src/components/cards/release-card.tsx - existing release card with ReleaseCardContent type
@src/types/card.ts - ReleaseCardContent with releaseDate, afterCountdownAction, afterCountdownText, afterCountdownUrl, preSaveUrl, preSaveButtonText, releaseTitle, artistName
</context>

<tasks>

<task type="auto">
  <name>Task 1: iPod Classic Release Screen Integration</name>
  <files>
    src/components/cards/ipod-classic-layout.tsx
    src/components/public/static-ipod-classic-layout.tsx
  </files>
  <action>
    Add release card support to iPod Classic theme with a dedicated 'release' screen:

    1. **Update currentScreen state** from `'main' | 'socials'` to `'main' | 'socials' | 'release'`

    2. **Filter release cards separately:**
       - Import `isReleaseContent` and `ReleaseCardContent` from `@/types/card`
       - Separate release cards: `releaseCards = visibleCards.filter(c => c.card_type === 'release' && isReleaseContent(c.content))`
       - Filter releases from main menu: `menuCards = visibleCards.filter(c => c.card_type !== 'release')`
       - For each release card, check if past release date AND afterCountdownAction === 'hide' -> exclude from releaseCards

    3. **Add release card tracking state:**
       - `const [activeReleaseIndex, setActiveReleaseIndex] = useState(0)` to track which release is being viewed
       - Add useEffect to track countdown completion for auto-navigation back to main

    4. **Render releases as menu items in main screen:**
       - After regular cards in main menu, add release cards as items with display text `{releaseTitle || 'Upcoming Release'}`
       - Click/select navigates to `release` screen (setCurrentScreen('release'), setActiveReleaseIndex(index))

    5. **Create release screen view:**
       - When `currentScreen === 'release'`, render:
         - Title bar shows release title (truncated if long)
         - If albumArtUrl exists: show small dithered image (80x80) centered
         - Release title and artist name below image
         - Countdown in iPod-style format: `03D 12H 45M 30S` using monospace
         - Use react-countdown with custom renderer for the countdown
         - Pre-save button as selectable menu item (if preSaveUrl exists)
       - Add simple countdown renderer that returns null when completed

    6. **Handle post-countdown behavior:**
       - If afterCountdownAction === 'hide': auto-navigate back to main, remove from releaseCards
       - If afterCountdownAction === 'custom': show afterCountdownText as clickable item with afterCountdownUrl

    7. **Navigation:**
       - Menu button from release screen goes back to main
       - Update handleKeyDown, handleWheelClick for release screen handling
       - Escape/Backspace from release -> main

    8. **Apply same changes to static-ipod-classic-layout.tsx:**
       - Same screen state, filtering, and rendering logic
       - Countdown must work client-side (component is already 'use client')
       - No store dependencies (data passed via props)
  </action>
  <verify>
    - `npm run lint` passes
    - In editor preview with iPod theme: release cards appear as menu items
    - Selecting release card navigates to release screen with countdown
    - Menu button returns to main screen
    - Public page shows same behavior
  </verify>
  <done>
    Release cards display as navigable menu items in iPod theme, with dedicated release screen showing countdown, album art (if set), and pre-save button
  </done>
</task>

<task type="auto">
  <name>Task 2: VCR Menu OSD Release Display</name>
  <files>
    src/components/cards/vcr-menu-layout.tsx
    src/components/public/static-vcr-menu-layout.tsx
  </files>
  <action>
    Add release card support to VCR Menu theme as OSD-style overlay:

    1. **Filter release cards:**
       - Import `isReleaseContent` and `ReleaseCardContent` from `@/types/card`
       - Separate release cards: `releaseCards = cards.filter(c => c.is_visible && c.card_type === 'release' && isReleaseContent(c.content))`
       - Filter out hidden completed releases (afterCountdownAction === 'hide' && past date)
       - Keep regular cards filter as-is for main menu

    2. **Add countdown state:**
       - Track if countdown completed for each release to handle hide action
       - `const [completedReleases, setCompletedReleases] = useState<Set<string>>(new Set())`

    3. **Render OSD above menu list** (before title):
       - For each active release card (not completed-hidden), render VCR OSD block:
       ```
       <div className="vcr-osd mb-4 text-center">
         <div className="vcr-osd-title vcr-blink">-- {RELEASE TITLE} --</div>
         <div className="vcr-osd-countdown">DROPS IN 03D : 12H : 45M : 30S</div>
         {preSaveUrl && (
           <a href={preSaveUrl} className="vcr-osd-presave">[PRE-SAVE]</a>
         )}
       </div>
       ```
       - Use theme text color for all elements
       - Optional blink animation on title using existing `vcr-blink` class

    4. **Countdown format:**
       - Use react-countdown with custom renderer
       - Format: `{DD}D : {HH}H : {MM}M : {SS}S`
       - All uppercase, monospace-style with existing VCR font

    5. **Handle post-countdown:**
       - If afterCountdownAction === 'hide': add to completedReleases set, OSD disappears
       - If afterCountdownAction === 'custom': OSD transforms to show afterCountdownText as link

    6. **Add OSD as focusable option:**
       - If there are releases, add pre-save as focusable item at top of menu (index 0)
       - Adjust focusedIndex handling to account for release items
       - OR keep OSD separate (non-focusable) and only show pre-save text

    7. **Apply same changes to static-vcr-menu-layout.tsx:**
       - Same filtering and OSD rendering
       - Countdown must work client-side
       - No store dependencies
  </action>
  <verify>
    - `npm run lint` passes
    - In editor preview with VCR theme: OSD displays above menu with countdown
    - Countdown ticks down in VCR style format
    - When countdown completes: hide action removes OSD, custom action shows custom text
    - Public page shows same behavior
  </verify>
  <done>
    Release cards display as VCR-style OSD overlay with blinking title, countdown timer in retro format, and pre-save link
  </done>
</task>

<task type="auto">
  <name>Task 3: Receipt Theme Release Section</name>
  <files>
    src/components/cards/receipt-layout.tsx
    src/components/public/static-receipt-layout.tsx
  </files>
  <action>
    Add release card support to Receipt theme as dedicated section:

    1. **Filter release cards:**
       - Import `isReleaseContent` and `ReleaseCardContent` from `@/types/card`
       - Separate release cards before social URL filter:
         ```
         const releaseCards = cards.filter(c =>
           c.is_visible !== false &&
           c.card_type === 'release' &&
           isReleaseContent(c.content)
         )
         ```
       - Filter out hidden completed releases

    2. **Add countdown state:**
       - Track completed releases: `const [completedReleases, setCompletedReleases] = useState<Set<string>>(new Set())`

    3. **Render release section between links and "TOTAL LINKS":**
       - After `</div>` of links list, before the divider and total section
       - For each active release card:
       ```
       <div className="receipt-divider">{'-'.repeat(60)}</div>
       <div className="my-4 text-center">
         <div className="font-bold mb-2">** UPCOMING RELEASE **</div>
         <div className="text-xs">ALBUM: {releaseTitle}</div>
         {artistName && <div className="text-xs">ARTIST: {artistName}</div>}
         <div className="text-sm font-bold my-2">
           DROPS IN: {countdown in format 03D 12H 45M}
         </div>
         {preSaveUrl && (
           <button className="w-full text-left py-1 px-2">
             <div className="flex justify-between items-center">
               <span>[PRE-SAVE NOW</span>
               <span className="receipt-dots">{'.''.repeat(15)}</span>
               <span>&gt;]</span>
             </div>
           </button>
         )}
       </div>
       ```

    4. **Countdown format:**
       - Compact format: `03D 12H 45M` (omit seconds for thermal receipt aesthetic)
       - Use react-countdown with custom renderer
       - Monospace styling with receipt font

    5. **Handle post-countdown:**
       - If afterCountdownAction === 'hide': section disappears (add to completedReleases)
       - If afterCountdownAction === 'custom': section shows afterCountdownText as purchasable "item"
         ```
         <div className="flex justify-between">
           <span>{afterCountdownText}</span>
           <span className="receipt-dots">{'.''.repeat(10)}</span>
           <span>&gt;</span>
         </div>
         ```

    6. **Update TOTAL LINKS count:**
       - Include active release pre-save links in count if desired, or keep separate

    7. **Apply same changes to static-receipt-layout.tsx:**
       - Same filtering and section rendering
       - Countdown must work client-side
       - No store dependencies
  </action>
  <verify>
    - `npm run lint` passes
    - In editor preview with Receipt theme: release section appears between links and total
    - Countdown displays in compact thermal receipt format
    - Pre-save shows as receipt item with dot leaders
    - After countdown: hide removes section, custom shows as regular item
    - Public page shows same behavior
  </verify>
  <done>
    Release cards display as dedicated receipt section with thermal-print styled countdown, album/artist info, and pre-save as receipt item
  </done>
</task>

</tasks>

<verification>
- `npm run lint` passes for all modified files
- `npm run build` completes without errors
- iPod theme: release cards as navigable menu items with dedicated screen
- VCR theme: release cards as OSD overlay with VCR-style countdown
- Receipt theme: release cards as dedicated section with receipt formatting
- All three themes handle afterCountdownAction correctly (hide vs custom)
- Static public page versions work identically to editor preview versions
</verification>

<success_criteria>
- Release cards integrate naturally with each theme's visual language
- Countdowns tick down in theme-appropriate formats
- Post-countdown behavior (hide/custom) works correctly in all themes
- Both editor preview and public page render release cards properly
- No TypeScript errors, lint passes, build succeeds
</success_criteria>
