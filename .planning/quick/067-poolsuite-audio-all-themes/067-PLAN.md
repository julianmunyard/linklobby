---
phase: quick
plan: 067
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/audio/audio-player.tsx
autonomous: true

must_haves:
  truths:
    - "Mac OS theme audio cards render the Poolsuite player (transport buttons, halftone progress, varispeed slider, reverb knob in bordered boxes)"
    - "Instagram Reels theme audio cards render the Poolsuite player identically"
    - "System Settings theme continues to render the Poolsuite player as before"
    - "Blinkies theme continues to render the Poolsuite player as before"
    - "Receipt, iPod Classic, Classified, VCR, and Departures Board themes are NOT affected"
  artifacts:
    - path: "src/components/audio/audio-player.tsx"
      provides: "Unified Poolsuite player for standard themes"
  key_links:
    - from: "audio-player.tsx theme routing"
      to: "isSystemSettings branch"
      via: "mac-os and instagram-reels now route to Poolsuite render path"
      pattern: "isSystemSettings"
---

<objective>
Unify the audio player layout so Mac OS, Instagram Reels, System Settings, and Blinkies themes all use the same Poolsuite/system-settings player layout (transport buttons, halftone progress bar, varispeed slider with bordered boxes, reverb knob).

Purpose: Consistent audio player UX across the three "standard" themes plus blinkies. Special-purpose themes (receipt, ipod-classic, classified, vcr-menu) keep their own layouts.

Output: Modified audio-player.tsx where mac-os and instagram-reels route to the existing Poolsuite render path instead of their own custom layouts.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/audio/audio-player.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Route mac-os and instagram-reels to Poolsuite player</name>
  <files>src/components/audio/audio-player.tsx</files>
  <action>
Modify the theme boolean logic in audio-player.tsx to make mac-os and instagram-reels use the Poolsuite/system-settings render path:

1. Change the `isSystemSettings` boolean (line ~189) to ALSO include `isMacOs` and the instagram-reels default case:
   ```
   const isPoolsuite = themeVariant === 'system-settings' || isBlinkies || isMacOs || themeVariant === 'instagram-reels'
   ```
   Or equivalently, rename `isSystemSettings` to `isPoolsuite` and update the `if (isSystemSettings)` guard to `if (isPoolsuite)`.

2. Remove the entire `if (isMacOs) { ... }` block (lines ~326-581). This is the Macintosh-specific render path with MacBox, pixel clip-paths, checkerboard sliders, and marquee animations. It is no longer needed because mac-os now routes through the Poolsuite path.

3. Remove the instagram-reels-specific rendering from the default/fallback section at the bottom (lines ~1255-1469). The instagram-reels variant was previously using the default render path (album art, PlayerControls circle button, standard VarispeedSlider). Since instagram-reels is now routed to the Poolsuite `if` block, the default/fallback section only needs to handle `receipt` (which still has its own specific rendering there).

4. Update the `isCompact` boolean (line ~192) — remove `isMacOs` from it since mac-os now falls under `isPoolsuite` (which is already included via `isSystemSettings`). Actually, review if `isCompact` is even used anymore after the removals.

5. Update `effectiveForegroundColor` (line ~196) — for mac-os and instagram-reels, the Poolsuite path uses `psColor` which is derived from `var(--theme-text)`. The existing logic for `isMacOs` (hardcoded `#000`) and instagram-reels (uses `playerColors?.foregroundColor`) should be removed from this line since those variants now go through the Poolsuite block which computes `psColor` independently.

6. In the Poolsuite render path (the `if (isSystemSettings)` block, lines ~719-995), the `psColor` computation currently only handles blinkies and system-settings:
   ```
   const psColor = (isBlinkies && (blinkieColors?.text || '#9898a8')) || 'var(--theme-text, #000000)'
   ```
   This already works for mac-os and instagram-reels because they both have `--theme-text` CSS variables set. No change needed here.

7. The `psFont` uses `var(--font-chikarego), var(--font-ishmeria), monospace`. This font will now apply to mac-os and instagram-reels audio players too — this is correct since we want the Poolsuite look.

8. Keep the `btnBg` and `playerBoxBg` logic as-is — for non-blinkies themes, `btnBg` resolves to `var(--theme-card-bg, #F9F0E9)` (with transparent fallback) and `playerBoxBg` is undefined, both of which work fine for mac-os and instagram-reels.

IMPORTANT: Do NOT touch the VCR, Classified, iPod Classic, or Receipt render paths. Only remove the mac-os block and update the routing logic.

After removing the mac-os block, the `marqueeContainerRef`, `marqueeTextRef`, `isMarqueeNeeded`, and the marquee-related useEffect (lines ~130-143) become unused (they were only used by mac-os and ipod-classic, and ipod-classic has its own refs). Check if ipod-classic still uses these same refs — if it does, keep them. If ipod-classic has its own refs, remove the mac-os-specific ones.

Looking at the code: ipod-classic (lines ~998-1253) DOES use `marqueeContainerRef` and `marqueeTextRef` and `isMarqueeNeeded`. So keep those refs and the useEffect — they are still needed for ipod-classic.

Also keep `varispeedTrackRef` and `speedTouch` — ipod-classic uses those too.
  </action>
  <verify>
Run `npx tsc --noEmit` to confirm no type errors. Run `npm run build` to confirm the build succeeds. Search the file for any remaining references to the removed mac-os block to ensure clean removal.
  </verify>
  <done>
Mac OS, Instagram Reels, System Settings, and Blinkies themes all render the identical Poolsuite player layout. Receipt, iPod Classic, Classified, and VCR themes are unchanged. No TypeScript errors. Build passes.
  </done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with no errors
- `npm run build` succeeds
- In the editor, switching to Mac OS theme shows Poolsuite player (transport buttons, halftone progress, varispeed with tick marks)
- In the editor, switching to Instagram Reels theme shows Poolsuite player
- System Settings and Blinkies themes continue working as before
- Receipt, iPod Classic, VCR, Classified themes are visually unchanged
</verification>

<success_criteria>
- audio-player.tsx has no separate mac-os render block
- instagram-reels no longer falls through to the default render path
- All four "standard" themes (mac-os, instagram-reels, system-settings, blinkies) hit the Poolsuite render path
- Special themes (receipt, ipod-classic, vcr-menu, classified) are untouched
- TypeScript compiles, build passes
</success_criteria>

<output>
After completion, create `.planning/quick/067-poolsuite-audio-all-themes/067-SUMMARY.md`
</output>
