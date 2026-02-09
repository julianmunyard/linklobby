# Quick Task 051: Poolsuite FM Audio Player for System Settings Theme

## Goal

Create a fully custom Poolsuite FM-style audio player layout for the `system-settings` theme variant. The player should match the Poolsuite FM desktop app aesthetic with:
- Retro beveled transport buttons (Play, Pause) in a row with borders
- Halftone dot pattern on the volume/varispeed slider background (like Macintosh Calculator)
- ChiKareGo/Ishmeria Poolsuite fonts throughout
- Compact card layout - this is a dense, efficient player
- Cream/pink color palette matching System Settings theme
- System 7 beveled button effects on transport controls

## Reference Design Analysis

From the Poolsuite FM screenshots:
1. **Transport buttons**: Row of bordered buttons (Play ▶, Pause ‖) with light blue/teal highlight on active button, pink accent on rightmost button
2. **Volume slider**: Bordered inset track with halftone/dotted pattern filling the unused portion (right side)
3. **Speaker icon**: Small speaker icon to the left of volume slider
4. **Track info**: Title + artist displayed above controls
5. **Time display**: Current time shown with play indicator
6. **Overall feel**: System 7 beveled, bordered sections, warm cream backgrounds

## Tasks

### Task 1: Add Poolsuite halftone CSS pattern and audio player styles to globals.css

**File:** `src/app/globals.css`

Add CSS for the Poolsuite audio player:

```css
/* Poolsuite audio player halftone pattern for slider backgrounds */
.poolsuite-halftone {
  background-image: radial-gradient(circle, oklch(0 0 0 / 0.25) 1px, transparent 1px);
  background-size: 3px 3px;
}

/* Poolsuite transport button styling */
.poolsuite-transport-btn {
  border: 1px solid oklch(0 0 0 / 0.8);
  box-shadow: inset -1px -1px 1px oklch(0 0 0 / 0.15), inset 1px 1px 1px oklch(1 0 0 / 0.5);
  transition: all 0.1s ease;
}

.poolsuite-transport-btn:active,
.poolsuite-transport-btn.poolsuite-active {
  box-shadow: inset 1px 1px 2px oklch(0 0 0 / 0.2), inset -1px -1px 1px oklch(1 0 0 / 0.3);
}

/* Poolsuite inset track (for sliders/progress) */
.poolsuite-inset-track {
  border: 1px solid oklch(0 0 0 / 0.6);
  box-shadow: inset 1px 1px 2px oklch(0 0 0 / 0.1);
  border-radius: 4px;
}
```

### Task 2: Create the Poolsuite FM audio player layout in audio-player.tsx

**File:** `src/components/audio/audio-player.tsx`

Add a new early return branch for `themeVariant === 'system-settings'` (similar to VCR and Classified branches) that creates a completely custom Poolsuite FM-style layout.

**Key design elements:**

1. **Track info section** (top):
   - Track title in ChiKareGo font, bold
   - Artist name below, smaller
   - Thin 1px divider line

2. **Time + Transport row** (middle):
   - Left: Play indicator (▶) + current time in mm:ss
   - Right: Transport buttons in a bordered row:
     - ▶ Play (teal/light blue bg when active)
     - ‖ Pause (cream bg)
     - Use Unicode symbols, NOT Lucide icons (matches Poolsuite retro feel)
     - Each button has System 7 beveled effect via .poolsuite-transport-btn class

3. **Volume/Varispeed row** (bottom):
   - Speaker icon (🔈) on left
   - Inset bordered slider track with:
     - Filled portion = solid color (cream/theme color)
     - Unfilled portion = halftone dot pattern (.poolsuite-halftone)
   - Custom range input with square thumb (no rounded)

4. **Reverb knob**: Rendered inline, compact, matching theme colors

5. **Track list**: If multi-track, show below with bordered items

**Behavior:**
- Mark `isSystemSettings` as compact: add to `isCompact` check
- Use `var(--font-chikarego)` for all text
- Colors: follow `var(--theme-text)` for foreground, `var(--theme-card-bg)` for backgrounds
- Active play button gets teal tint: `oklch(0.85 0.05 180)` (matching Poolsuite blue-green)
- The whole thing should feel like a System 7 control panel

**Implementation approach:**
- Add `const isSystemSettings = themeVariant === 'system-settings'` boolean
- Add to `isCompact` check: `const isCompact = isReceipt || isVcr || isClassified || isSystemSettings`
- Add color overrides for system-settings (use `var(--theme-text)` like VCR)
- Create a new early-return block after the Classified block but before the default rendering
- Render custom inline transport buttons, custom slider, inline reverb
- All text uses poolsuite font via inline style

### Task 3: Update system-settings-card.tsx to handle audio card type

**File:** `src/components/cards/system-settings-card.tsx`

Add `'audio'` to the card types that get full window chrome treatment (it already should, but verify the title shows "Now Playing" or track title).

## Constraints

- No new component files - everything in existing files
- Must work with existing PlayerColors, useAudioPlayer, ReverbConfig systems
- Transport buttons must be native HTML buttons calling handlePlay (not PlayerControls component)
- Slider must be native HTML `<input type="range">` with halftone background styling
- ReverbKnob component reused as-is with theme colors
- TrackList component reused as-is with theme colors
- The player should NOT show album art (compact design)
- WaveformDisplay NOT used - replaced by custom inline progress/time display

## Files Modified

1. `src/app/globals.css` - Poolsuite halftone + transport button CSS
2. `src/components/audio/audio-player.tsx` - New system-settings early return branch
3. `src/components/cards/system-settings-card.tsx` - Verify audio card handling

## Atomic Commits

1. `feat(quick-051): add Poolsuite halftone and transport button CSS`
2. `feat(quick-051): create Poolsuite FM audio player for system-settings theme`
