---
phase: quick-053
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/audio/audio-player.tsx
  - src/components/audio/waveform-display.tsx
  - src/components/cards/macintosh-card.tsx
  - src/components/public/static-macintosh-layout.tsx
autonomous: true

must_haves:
  truths:
    - "Audio card on Macintosh theme renders with black background, white text, and Pix Chicago font"
    - "Progress bar shows checkerboard fill pattern on played portion"
    - "Play button shows text PLAY/PAUSE instead of icons"
    - "Layout matches VCR stacked bordered sections structure"
    - "Audio card renders in both editor preview and public Macintosh page"
  artifacts:
    - path: "src/components/audio/audio-player.tsx"
      provides: "mac-os theme variant block with full bordered layout"
      contains: "isVcr || isMacOs"
    - path: "src/components/audio/waveform-display.tsx"
      provides: "macintosh progress bar with checkerboard fill"
      contains: "isMacOs"
    - path: "src/components/cards/macintosh-card.tsx"
      provides: "audio card routing in MacintoshCard router"
      contains: "card.card_type === 'audio'"
    - path: "src/components/public/static-macintosh-layout.tsx"
      provides: "audio card rendering in StaticMacCard router"
      contains: "card.card_type === 'audio'"
  key_links:
    - from: "src/components/cards/macintosh-card.tsx"
      to: "src/components/audio/audio-card.tsx"
      via: "AudioCard import and render"
    - from: "src/components/public/static-macintosh-layout.tsx"
      to: "src/components/audio/audio-player.tsx"
      via: "AudioPlayer direct render with themeVariant='mac-os'"
---

<objective>
Add a Macintosh-themed audio player that copies the VCR layout structure (stacked bordered sections) but with 8-bit Macintosh styling: black background, white text, Pix Chicago font, checkerboard progress bar fill, and text PLAY/PAUSE button.

Purpose: The Macintosh theme currently falls through to the default audio player layout, which doesn't match the 8-bit pixel aesthetic of the theme. This task creates a dedicated variant.

Output: Macintosh audio player renders in both editor preview and public pages with correct 8-bit styling.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/audio/audio-player.tsx (VCR layout at lines 138-261 is the template to copy)
@src/components/audio/waveform-display.tsx (progress bar variants, needs macintosh checkerboard)
@src/components/cards/macintosh-card.tsx (router component, needs audio case)
@src/components/public/static-macintosh-layout.tsx (public page, StaticMacCard router needs audio case)
@src/components/cards/audio-card.tsx (maps theme IDs, already maps 'macintosh' -> 'mac-os')
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add Macintosh audio player variant to AudioPlayer and WaveformDisplay</name>
  <files>
    src/components/audio/audio-player.tsx
    src/components/audio/waveform-display.tsx
  </files>
  <action>
**In audio-player.tsx:**

1. Add `const isMacOs = themeVariant === 'mac-os'` alongside existing theme booleans (after line 129).

2. Update `isCompact` to include isMacOs: `const isCompact = isReceipt || isVcr || isClassified || isSystemSettings || isMacOs`

3. Add a new early-return block for the Macintosh theme, placed AFTER the VCR block (after line 261) and BEFORE the classified block. Copy the VCR layout structure but with these Macintosh-specific changes:

   - **Colors/Font:**
     ```typescript
     const macColor = '#fff'  // White text on black
     const macFont: React.CSSProperties = {
       fontFamily: "var(--font-pix-chicago), 'Chicago', monospace",
       color: macColor
     }
     const macBorder = '3px solid #fff'  // Thick pixel borders in white
     ```

   - **Outer wrapper:** Add `style={{ ...macFont, border: macBorder, background: '#000' }}` — black background.

   - **Play/Pause header:** Instead of VCR's `{player.isPlaying ? '> PLAY' : '|| PAUSE'}`, use plain text:
     ```
     {player.isPlaying ? 'PAUSE' : 'PLAY'}
     ```
     No special unicode symbols. The button style should have `borderBottom: macBorder`.

   - **Track info section:** Same structure as VCR but with `macBorder` and `macColor`.

   - **Progress section:** Pass `themeVariant="mac-os"` to `WaveformDisplay` (NOT "vcr-menu"). Use `macColor` for foregroundColor.

   - **Varispeed + Reverb section:** Same structure as VCR. The bordered reverb box uses `macBorder`. Mode toggle button text uses `macColor` and `borderColor: 'currentColor'`.

   - **Track list:** Same as VCR with `macBorder` and `macColor`.

   - All `opacity` values and `tracking-wider` classes stay the same as VCR.

4. Update the effective color computation (around line 134) to include isMacOs:
   ```typescript
   const effectiveForegroundColor = isReceipt ? '#1a1a1a' : isMacOs ? '#fff' : (isVcr || isClassified || isSystemSettings) ? 'var(--theme-text)' : playerColors?.foregroundColor
   const effectiveElementBgColor = (isReceipt || isVcr || isClassified || isSystemSettings || isMacOs) ? 'transparent' : playerColors?.elementBgColor
   ```

**In waveform-display.tsx:**

1. Add `const isMacOs = themeVariant === 'mac-os'` alongside existing theme booleans (after line 52).

2. Update `isCompact` to include isMacOs: `const isCompact = isReceipt || isVcr || isClassified || isMacOs`

3. In the progress bar rendering (the `(isVcr || isClassified)` check around line 142), add a new branch for `isMacOs` BEFORE the VCR branch:
   ```tsx
   isMacOs ? (
     /* Macintosh: bordered bar with checkerboard fill */
     <div
       className="relative w-full p-[3px]"
       style={{ border: `3px solid ${activeColor}` }}
     >
       <div className="relative w-full h-2">
         {/* Checkerboard filled portion */}
         <div
           className="absolute top-0 left-0 h-full"
           style={{
             width: `${progress * 100}%`,
             background: 'repeating-conic-gradient(#fff 0% 25%, #000 0% 50%) 0 0 / 4px 4px',
           }}
         />
       </div>
     </div>
   ) : (isVcr || isClassified) ? (
     /* existing VCR/Classified code */
   ```

4. In the height class (line 110), add isMacOs to use the compact 6-height:
   ```tsx
   `${(isVcr || isClassified || isMacOs) ? 'h-6' : isReceipt ? 'h-8' : 'h-16'}`
   ```

5. In the time display section, add a macintosh branch BEFORE the VCR branch:
   ```tsx
   isMacOs ? (
     <div className="flex justify-between font-mono text-[10px]" style={{ color: activeColor }}>
       <span>{formatTime(currentTime)}</span>
       <span>{formatTime(duration)}</span>
     </div>
   ) : isVcr ? (
   ```

**IMPORTANT:** Do NOT use `var(--theme-text)` for the Macintosh player colors. Use hardcoded `#fff` for text and `#000` for background since the Macintosh player is always black/white regardless of theme palette.
  </action>
  <verify>
    Run `npx tsc --noEmit` to verify no TypeScript errors. Visually confirm in the editor that selecting the Macintosh theme shows the black audio player with white text, bordered sections, checkerboard progress bar, and text PLAY/PAUSE button.
  </verify>
  <done>
    AudioPlayer has a dedicated `isMacOs` block that renders stacked bordered sections with black bg, white text, Pix Chicago font, text PLAY/PAUSE, and WaveformDisplay renders a checkerboard-filled progress bar for the mac-os variant.
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire audio card into MacintoshCard router and StaticMacintoshLayout</name>
  <files>
    src/components/cards/macintosh-card.tsx
    src/components/public/static-macintosh-layout.tsx
  </files>
  <action>
**In macintosh-card.tsx:**

1. Import AudioCard at the top: `import { AudioCard } from './audio-card'`

2. In the `MacintoshCard` router function, add an audio card case BEFORE the gallery check (before line 39):
   ```typescript
   // Audio card renders with mac-os theme variant
   if (card.card_type === 'audio') {
     return (
       <WindowWrapper onClick={onClick} isSelected={isSelected}>
         <CheckerboardTitleBar title={card.title || 'Now Playing'} />
         <div style={{ background: '#000' }}>
           <AudioCard card={card} isPreview={isPreview} />
         </div>
       </WindowWrapper>
     )
   }
   ```
   This wraps the audio player in a Macintosh window with checkerboard title bar and black background content area.

**In static-macintosh-layout.tsx:**

1. Import AudioPlayer: `import { AudioPlayer } from '@/components/audio/audio-player'`
2. Import the audio content type guard and type: `import { isAudioContent } from '@/types/card'` and `import type { AudioCardContent } from '@/types/audio'`

3. In the `StaticMacCard` router function (around line 358), add an audio card case BEFORE the gallery check:
   ```typescript
   // Audio card renders with mac-os theme variant
   if (card.card_type === 'audio' && isAudioContent(card.content)) {
     const audioContent = card.content as AudioCardContent
     return (
       <div data-card-id={card.id} style={{ border: MAC_BORDER, overflow: 'hidden' }}>
         <CheckerboardTitleBar title={card.title || 'Now Playing'} />
         <div style={{ background: '#000' }}>
           <AudioPlayer
             tracks={audioContent.tracks || []}
             albumArtUrl={audioContent.albumArtUrl}
             showWaveform={audioContent.showWaveform ?? true}
             looping={audioContent.looping ?? false}
             reverbConfig={audioContent.reverbConfig}
             playerColors={audioContent.playerColors}
             cardId={card.id}
             pageId={card.page_id}
             themeVariant="mac-os"
           />
         </div>
       </div>
     )
   }
   ```

4. In the `handleCardClick` callback, add a return for audio cards to prevent navigation:
   ```typescript
   if (card.card_type === 'audio') {
     return
   }
   ```
   Add this near the other card_type checks (around line 109).

**NOTE:** The audio card is already routed through `AudioCard` -> `AudioPlayer` with `themeVariant='mac-os'` in the editor preview via card-renderer.tsx. The MacintoshCard wrapping just adds the window chrome (checkerboard title bar + black bg). For the static public page, we render AudioPlayer directly (same pattern as static-flow-grid.tsx for other themes) to avoid Zustand store dependency.
  </action>
  <verify>
    Run `npx tsc --noEmit` to verify no TypeScript errors. Test on a public Macintosh page with an audio card to confirm it renders inside a Macintosh window with checkerboard title bar and the black 8-bit audio player inside.
  </verify>
  <done>
    MacintoshCard router handles audio cards with Macintosh window chrome. StaticMacintoshLayout renders audio cards on public pages with mac-os theme variant and checkerboard title bar.
  </done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with no errors
2. In the editor with Macintosh theme selected, an audio card renders:
   - Black background with white text
   - Pix Chicago pixel font
   - Stacked bordered sections (play header, track info, progress, varispeed+reverb, track list)
   - 3px white pixel borders
   - Checkerboard pattern fill on progress bar (black/white checker on played portion)
   - Text "PLAY" / "PAUSE" button (no unicode symbols)
   - Checkerboard title bar window chrome
3. On the public Macintosh page, the audio card renders identically inside Macintosh window chrome
4. Clicking the audio card on the public page does not navigate away
</verification>

<success_criteria>
- Macintosh audio player visually matches VCR layout structure but with 8-bit black/white aesthetic
- Checkerboard progress bar fill uses `repeating-conic-gradient(#fff 0% 25%, #000 0% 50%) 0 0 / 4px 4px`
- Play button shows text "PLAY"/"PAUSE" not icons
- Font is Pix Chicago throughout
- Works in both editor preview and public Macintosh pages
- No TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/quick/053-macintosh-audio-card-vcr-style/053-SUMMARY.md`
</output>
