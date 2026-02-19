---
phase: quick-066
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/editor/mobile-card-type-drawer.tsx
autonomous: true

must_haves:
  truths:
    - "Blinkies audio cards show Background/Colors/Player tabs in mobile drawer"
    - "Background tab shows GIF presets in compact 5-col aspect-square grid with tile pattern picker and dim slider"
    - "Colors tab shows 16 palette presets plus individual color pickers for both card colors AND player colors"
    - "Player tab has track upload, track list with delete, loop and autoplay toggles"
    - "Swipe between tabs works correctly including inside scrollable pane areas"
  artifacts:
    - path: "src/components/editor/mobile-card-type-drawer.tsx"
      provides: "BlinkieAudioBackgroundPane, BlinkieAudioColorsPane, BlinkieAudioPlayerPane sub-components"
      contains: "isBlinkieAudioCard"
  key_links:
    - from: "MobileCardTypeDrawer"
      to: "BlinkieAudioBackgroundPane"
      via: "tab.key === 'background' && isBlinkieAudioCard"
      pattern: "isBlinkieAudioCard"
    - from: "BlinkieAudioColorsPane"
      to: "onContentChange"
      via: "blinkieColors and playerColors content updates"
      pattern: "playerColors"
    - from: "BlinkieAudioPlayerPane"
      to: "/api/audio/upload"
      via: "fetch POST with FormData"
      pattern: "api/audio/upload"
---

<objective>
Fix the mobile top drawer (MobileCardTypeDrawer) for blinkies-theme audio cards to have three properly structured tabs: Background (compact GIF grid + tile patterns + dim), Colors (palette presets + card/player color pickers), and Player (track upload/delete + loop/autoplay toggles).

Purpose: Audio cards on blinkies theme need full mobile editing capability matching desktop AudioCardFields.
Output: Updated mobile-card-type-drawer.tsx with three complete sub-panes for blinkies audio cards.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/editor/mobile-card-type-drawer.tsx
@src/components/editor/audio-card-fields.tsx
@src/data/card-bg-presets.ts
@src/types/audio.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Implement blinkies audio three-tab mobile drawer</name>
  <files>src/components/editor/mobile-card-type-drawer.tsx</files>
  <action>
Add blinkies audio card detection and three-tab structure to MobileCardTypeDrawer:

1. Add imports: `X` from lucide-react, `BlinkieStylePicker`, `CARD_BG_PRESETS`, `BLINKIE_STYLES`, `generateId`, `AudioTrack` type.

2. Add `BLINKIE_PALETTES` constant (16 palettes) at top of file with outerBox, innerBox, text, playerBox, buttons colors.

3. Add state/detection:
   - `themeId` from `useThemeStore`
   - `isBlinkieCard` (link/mini on blinkies theme)
   - `isBlinkieAudioCard` (audio on blinkies theme)
   - `audioBoxBgPickerOpen` state for tile pattern picker

4. Update tab definitions: when `isBlinkieAudioCard`, return `[background, colors, player]` tabs instead of default type/content/photo/text tabs. Also show "Style" label for blinkies link/mini cards.

5. Update swipe blocking: `isSliderTarget` should also block swipe when touch starts inside a vertically-scrollable container (`el.scrollHeight > el.clientHeight && overflowY === 'auto'`), so scrolling GIF grids and color pickers doesn't trigger tab swipe.

6. Add three tab pane renderers in the swipeable area routing to extracted sub-components:
   - `tab.key === 'background' && isBlinkieAudioCard` -> `BlinkieAudioBackgroundPane`
   - `tab.key === 'colors' && isBlinkieAudioCard` -> `BlinkieAudioColorsPane`
   - `tab.key === 'player' && isBlinkieAudioCard` -> `BlinkieAudioPlayerPane`

7. Create `BlinkieAudioBackgroundPane` component:
   - GIF preset grid: `grid-cols-5 gap-1 max-h-[22vh] overflow-y-auto`, each item `aspect-square rounded overflow-hidden border` with ring highlight when selected
   - Clicking a preset sets `blinkieBoxBackgrounds.cardBgUrl` and clears other bg fields
   - Tile pattern button (shows current tile preview or "Tile Pattern..." text) opens `BlinkieStylePicker` in a fixed overlay
   - Clear button to reset all background settings
   - Dim slider (native range input) for `cardOuterDim` (0-100), only shown when a background is active

8. Create `BlinkieAudioColorsPane` component:
   - Palette grid: `grid-cols-4 gap-1`, each palette shows 5 color bands (outerBox, innerBox, playerBox, buttons, text) in `h-5` row, with ring highlight when matching
   - Clicking palette sets all `blinkieColors` fields at once
   - Card color pickers section: 5 ColorPickers for outerBox, innerBox, text, playerBox, buttons with defaults from Default palette
   - Player color pickers section: 3 ColorPickers for borderColor, elementBgColor, foregroundColor stored in `playerColors` content field
   - "Reset All Colors" button clears both blinkieColors and playerColors

9. Create `BlinkieAudioPlayerPane` component:
   - Track list: numbered tracks with title and X delete button, each in `rounded border bg-muted/50` row
   - Delete calls `/api/audio/delete` (best-effort) and removes from tracks array
   - Upload: hidden file input + "Upload Track" Button, POSTs FormData to `/api/audio/upload`, creates AudioTrack with generateId
   - Validates audio mime/extension, 100MB max
   - Loop and Autoplay toggle switches at bottom
  </action>
  <verify>
    Run `npx tsc --noEmit` to confirm no type errors. Open app on mobile viewport with a blinkies-theme audio card and verify all three tabs render and swipe correctly.
  </verify>
  <done>
    Blinkies audio cards in mobile drawer show Background/Colors/Player tabs. Background shows compact 5-col GIF grid with tile picker and dim slider. Colors shows palette presets plus individual card and player color pickers. Player shows track upload/delete and loop/autoplay toggles.
  </done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with no errors
- Mobile drawer opens for blinkies audio card showing three tabs
- Background tab: GIF thumbnails in 5-column grid, tile pattern picker works, dim slider appears
- Colors tab: 16 palette swatches, card color pickers (5), player color pickers (3), reset button
- Player tab: upload button works, tracks listed with delete, loop/autoplay toggles functional
- Swiping between tabs works; scrolling inside panes does not trigger tab swipe
</verification>

<success_criteria>
All three blinkie audio mobile drawer tabs are fully functional with compact layouts optimized for mobile viewport.
</success_criteria>

<output>
After completion, create `.planning/quick/066-blinkies-audio-mobile-drawer-tabs/066-SUMMARY.md`
</output>
