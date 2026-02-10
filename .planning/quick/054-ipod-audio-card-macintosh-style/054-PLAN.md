---
phase: quick-054
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/audio/audio-player.tsx
  - src/components/cards/ipod-classic-layout.tsx
  - src/components/public/static-ipod-classic-layout.tsx
autonomous: true

must_haves:
  truths:
    - "iPod theme audio card renders with Macintosh-style VCR bordered layout"
    - "iPod audio uses black/off-black colors instead of Macintosh black-on-white"
    - "Clicking audio menu item in iPod navigates to a Now Playing screen"
    - "Audio player is fully functional within iPod Now Playing screen (play, pause, seek, varispeed, reverb)"
    - "Both editor preview and public page iPod layouts support Now Playing navigation"
  artifacts:
    - path: "src/components/audio/audio-player.tsx"
      provides: "iPod-classic dedicated audio branch with off-black color scheme"
    - path: "src/components/cards/ipod-classic-layout.tsx"
      provides: "Now Playing screen navigation for audio cards in editor"
    - path: "src/components/public/static-ipod-classic-layout.tsx"
      provides: "Now Playing screen navigation for audio cards on public pages"
  key_links:
    - from: "ipod-classic-layout.tsx"
      to: "audio-player.tsx"
      via: "AudioCard rendered inside Now Playing screen"
    - from: "static-ipod-classic-layout.tsx"
      to: "audio-player.tsx"
      via: "AudioCard rendered inside Now Playing screen on public page"
---

<objective>
Create an iPod audio card that replicates the Macintosh audio player layout (VCR-style bordered sections, 8-bit pixel boxes, checkerboard progress, marquee title, text PLAY/PAUSE buttons) but with black/off-black colors matching the iPod theme aesthetic. Clicking the audio menu item in the iPod interface navigates to a "Now Playing" screen that renders the audio player.

Purpose: Give the iPod theme a dedicated audio experience that matches its dark aesthetic while reusing the proven Macintosh layout structure.
Output: Functional iPod audio player with Now Playing screen navigation in both editor and public page.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/components/audio/audio-player.tsx (lines 277-523: Macintosh isMacOs branch to replicate)
@src/components/cards/ipod-classic-layout.tsx (iPod editor layout with menu navigation)
@src/components/public/static-ipod-classic-layout.tsx (iPod public page layout)
@src/components/cards/macintosh-card.tsx (Macintosh card wrapper for reference)
@src/lib/themes/ipod-classic.ts (iPod theme colors)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add iPod-classic audio branch to audio-player.tsx</name>
  <files>src/components/audio/audio-player.tsx</files>
  <action>
Add a new `isIpodClassic` boolean alongside the existing theme booleans (line ~142):
```
const isIpodClassic = themeVariant === 'ipod-classic'
```

Update `isCompact` to include iPod:
```
const isCompact = isReceipt || isVcr || isClassified || isSystemSettings || isMacOs || isIpodClassic
```

Update `effectiveForegroundColor` to use iPod off-white for iPod theme:
```
const effectiveForegroundColor = isReceipt ? '#1a1a1a' : isMacOs ? '#000' : isIpodClassic ? '#e0e0e0' : ...
```

Update `effectiveElementBgColor` to include iPod:
```
const effectiveElementBgColor = (isReceipt || isVcr || isClassified || isSystemSettings || isMacOs || isIpodClassic) ? 'transparent' : ...
```

Add a new iPod-classic branch BEFORE the default/receipt section (after the `isSystemSettings` block, around line 923). This branch should be a near-copy of the `isMacOs` branch (lines 277-523) with these color changes:

**iPod color scheme (dark inversion of Macintosh):**
- `macBg` (background) -> `ipodBg = '#1a1a1a'` (off-black, not pure black)
- `macBorder` (borders/text) -> `ipodBorder = '#c0c0c0'` (light gray, readable on dark)
- `macChecker` (checkerboard pattern) -> `ipodChecker = '#c0c0c0'` (light gray checkers on off-black)
- Title font: same `var(--font-pix-chicago)` as Macintosh

**Structural replication from Macintosh branch:**
1. Row 1: PLAY/PAUSE text button (left) + Track info marquee (right) -- same layout, inverted colors
2. Progress bar: full width, checkerboard fill using `ipodChecker`/`ipodBg` colors
3. Varispeed slider: checkerboard bar with rectangle knob, same pixel clip-paths
4. Speed display + mode toggle in pixel boxes
5. Reverb knob (scaled 0.7, tucked right)
6. Track list in pixel box (multi-track only)
7. Marquee CSS animation (reuse `mac-audio-marquee` class or create `ipod-audio-marquee`)

Use the same `macPixelClip` polygon clip-path for 8-bit rounded boxes. Create an `IpodBox` helper identical to the `MacBox` helper but using `ipodBorder` for the outer shell and `ipodBg` for the inner fill.

The entire player container should have `background: ipodBg` and `color: ipodBorder` as the base.

Also remove `'audio-player-ipod': themeVariant === 'ipod-classic'` from the default theme classes section (~line 932) since iPod now has its own early return branch.
  </action>
  <verify>
Run `npx tsc --noEmit` to confirm no TypeScript errors. Visually inspect that the iPod audio branch is structurally identical to the Macintosh branch with inverted dark colors.
  </verify>
  <done>
iPod-classic theme variant renders a dedicated dark-themed audio player with 8-bit pixel aesthetic matching the Macintosh layout structure but with off-black background and light gray borders/text.
  </done>
</task>

<task type="auto">
  <name>Task 2: Add Now Playing screen to iPod layouts (editor + public)</name>
  <files>src/components/cards/ipod-classic-layout.tsx, src/components/public/static-ipod-classic-layout.tsx</files>
  <action>
**In both ipod-classic-layout.tsx (editor) AND static-ipod-classic-layout.tsx (public):**

1. Add `'nowplaying'` to the `currentScreen` state type:
   ```
   const [currentScreen, setCurrentScreen] = useState<'main' | 'socials' | 'release' | 'nowplaying'>('main')
   ```

2. Add state to track the active audio card:
   ```
   const [activeAudioCard, setActiveAudioCard] = useState<Card | null>(null)
   ```

3. Add import for AudioCard:
   ```
   import { AudioCard } from '@/components/cards/audio-card'
   ```
   For static layout, also import `isAudioContent` from `@/types/card`.

4. Add a `goToNowPlaying` function:
   ```
   const goToNowPlaying = (card: Card) => {
     setCurrentScreen('nowplaying')
     setActiveAudioCard(card)
     setSelectedIndex(0)
   }
   ```

5. In the menu item rendering for `menuCards.map(...)`, add audio card detection:
   - When an audio card is clicked (double-click/center button activation), call `goToNowPlaying(card)` instead of `activateLink(card)`.
   - Detection: `if (card.card_type === 'audio') { goToNowPlaying(card) }` in the activation logic (center button, Enter key, and second click).

6. Update the `displayTitle` logic to handle nowplaying:
   ```
   } else if (currentScreen === 'nowplaying') {
     displayTitle = 'Now Playing'
   }
   ```

7. Update the `goBack` logic: `nowplaying` goes back to `main`.

8. Update keyboard handler and wheel handler: `nowplaying` screen should behave like `release` screen (menu/escape goes back, no scroll).

9. Add the Now Playing screen content inside the menu list rendering:
   ```
   currentScreen === 'nowplaying' ? (
     activeAudioCard ? (
       <div className="flex flex-col h-full overflow-hidden" style={{ background: '#1a1a1a' }}>
         <AudioCard
           card={activeAudioCard}
           isPreview={isPreview}  // or omit for static
           themeIdOverride="ipod-classic"
         />
       </div>
     ) : (
       <div className="flex items-center justify-center h-full text-[13px] text-gray-500">
         No audio
       </div>
     )
   ) : null
   ```

   For the static (public) layout, pass `themeIdOverride="ipod-classic"` and set `isPreview={false}`.

10. Show "Now Playing" as a menu item label for audio cards in the menu list:
    - Audio cards should display their title followed by a music note indicator. E.g., the display text for audio cards: `displayText = card.title || 'Now Playing'` and show a note symbol instead of `>` arrow: replace `>` with a music note unicode character for audio cards only.

**Important for static layout:** The AudioCard component is a client component and uses hooks (useAudioPlayer), which is fine since StaticIpodClassicLayout is already a 'use client' component.
  </action>
  <verify>
Run `npx tsc --noEmit` to confirm no TypeScript errors. In the editor, switch to iPod theme with an audio card present -- the audio card should appear as a menu item. Clicking it (or pressing center/Enter) should navigate to the Now Playing screen showing the dark-themed audio player. Pressing menu or back arrow should return to the main menu.
  </verify>
  <done>
Audio cards in the iPod menu navigate to a "Now Playing" screen that renders the full iPod-themed audio player. Both editor preview and public page layouts support this navigation. The back button returns to the main menu.
  </done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with no errors
2. Editor preview with iPod theme shows audio card as menu item with music note indicator
3. Clicking audio menu item navigates to Now Playing screen
4. Now Playing screen renders dark-themed audio player (off-black bg, light gray borders)
5. Audio player plays/pauses, seek works, varispeed slider functions, reverb knob works
6. Menu button or back arrow returns to main iPod menu
7. Public page iPod layout has same Now Playing navigation behavior
8. Macintosh theme audio card is unchanged (regression check)
</verification>

<success_criteria>
- iPod audio player renders with identical layout to Macintosh but with off-black/light-gray color scheme
- iPod menu shows audio cards as navigable items with music note indicator
- Clicking audio menu item opens Now Playing screen with functional audio player
- Back navigation works from Now Playing screen
- Both editor and public page iPod layouts support audio navigation
- No regressions to Macintosh or other theme audio players
</success_criteria>

<output>
After completion, create `.planning/quick/054-ipod-audio-card-macintosh-style/054-SUMMARY.md`
</output>
