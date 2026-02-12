---
phase: quick
plan: 062
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/public/theme-injector.tsx
  - src/components/public/static-macintosh-layout.tsx
  - src/components/cards/macintosh-layout.tsx
autonomous: true

must_haves:
  truths:
    - "Pattern background stays stationary while cards scroll over it on all devices"
    - "Pattern fills the entire viewport including iOS Safari bottom safe area with no cutoff or white gaps"
    - "Pattern tiles are slightly larger than current 350px (zoom in to ~500px)"
    - "Mac menu bar stays fixed at top of viewport while scrolling"
  artifacts:
    - path: "src/components/public/static-macintosh-layout.tsx"
      provides: "Fixed pattern background div + sticky menu bar + scrollable content"
    - path: "src/components/cards/macintosh-layout.tsx"
      provides: "Editor preview with same fixed bg pattern approach"
    - path: "src/components/public/theme-injector.tsx"
      provides: "Body CSS for Macintosh solid color fill in safe areas"
  key_links:
    - from: "theme-injector.tsx"
      to: "static-macintosh-layout.tsx"
      via: "body background-color fills iOS safe areas, fixed div renders pattern"
---

<objective>
Fix the Macintosh theme pattern background on mobile so that: (1) the pattern is stationary/fixed while only cards scroll, (2) the pattern fills the ENTIRE page including iOS Safari bottom safe area with zero cutoff, (3) pattern tiles are bigger (~500px instead of 350px), (4) the Mac menu bar stays fixed at top while scrolling.

Purpose: The current implementation has issues on iOS Safari where `background-attachment: fixed` does not work, and the fixed div approach with calc(-20vh) can still leave gaps. This fix ensures a bulletproof fullscreen fixed pattern across all devices.

Output: Updated theme-injector.tsx, static-macintosh-layout.tsx, and macintosh-layout.tsx with correct fixed background behavior.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/public/theme-injector.tsx
@src/components/public/static-macintosh-layout.tsx
@src/components/cards/macintosh-layout.tsx
@src/app/[username]/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix theme-injector body CSS and increase pattern size</name>
  <files>src/components/public/theme-injector.tsx</files>
  <action>
In theme-injector.tsx, update the Macintosh body CSS injection:

1. Keep `html` background-color set to `macPatternColor` (solid fallback for safe areas).

2. For the `body` Macintosh CSS:
   - Remove the current `macPatternBg` that puts the pattern on body. The pattern should NOT be on body at all -- body just gets solid `macPatternColor` as fallback for safe area gaps.
   - Set body to: `background-color: ${macPatternColor} !important;` (solid color only, no pattern image on body).
   - Keep the existing `padding-bottom: env(safe-area-inset-bottom, 0px) !important;` on body.
   - Add `overflow-x: hidden !important;` on body to prevent horizontal scroll from the oversized fixed div.

The pattern itself is rendered by the fixed div in static-macintosh-layout.tsx (Task 2), NOT by body. Body is just a solid color safety net for any area not covered by the fixed div.

Do NOT change any non-Macintosh CSS paths. Only modify the `isMacintosh` conditional branches.
  </action>
  <verify>
Visually inspect the injected CSS in browser devtools:
- body should have `background-color: [macPatternColor]` (solid, no image)
- html should have `background-color: [macPatternColor]`
- No pattern image on body
  </verify>
  <done>Body and html for Macintosh theme only emit solid macPatternColor, with overflow-x hidden. Pattern rendering is fully delegated to the fixed div layer.</done>
</task>

<task type="auto">
  <name>Task 2: Fix fixed background div and menu bar in public + editor layouts</name>
  <files>src/components/public/static-macintosh-layout.tsx, src/components/cards/macintosh-layout.tsx</files>
  <action>
In BOTH static-macintosh-layout.tsx and macintosh-layout.tsx, make these changes:

**A. Fixed background div -- make it truly cover everything:**

Replace the current fixed background div styling:
```
top: 'calc(-20vh - env(safe-area-inset-top, 0px))',
left: '-5vw',
right: '-5vw',
bottom: 'calc(-20vh - env(safe-area-inset-bottom, 0px))',
```

With a simpler, more aggressive approach using `inset` with large negative values that guarantee full coverage without relying on env() in calc():
```
top: '-50vh',
left: '-50vw',
right: '-50vw',
bottom: '-50vh',
```

This makes the fixed div extend 50% of the viewport in every direction beyond the viewport edges -- massively oversized so there is NO possible gap on any device, any browser, any safe area configuration. Since it is `position: fixed` with `z-index: 0`, the overflow is naturally clipped by the viewport and does not cause scrollbars (the body overflow-x: hidden from Task 1 is an extra safety net).

**B. Increase pattern background-size from 350px to 500px:**

In the `bgStyle` object (both files), change:
```
backgroundSize: '350px auto'
```
to:
```
backgroundSize: '500px auto'
```

This zooms in the pattern tiles so they look less tiny on mobile screens.

**C. Menu bar positioning -- ensure it stays fixed at top for non-frame mode:**

In both files, the menu bar already uses `position: hasFrame ? 'sticky' : 'fixed'`. Verify this is correct:
- When `hasFrame` is false (normal public page): menu bar is `position: fixed`, `top: 0`, `left: 0`, `right: 0`, `zIndex: 100`. This keeps it pinned to viewport top while cards scroll underneath.
- When `hasFrame` is true (editor preview with phone frame): menu bar is `position: sticky`, pinned to top of the scrollable content area.

This should already be correct. Do NOT change the menu bar positioning logic -- just verify it is working as described above.

**D. Content wrapper for non-frame mode (static-macintosh-layout.tsx only):**

In static-macintosh-layout.tsx, the non-frame `contentStyle` is currently:
```
padding: '0 0 20px 0',
position: 'relative' as const,
zIndex: 1,
```

Add `minHeight: '100vh'` to match macintosh-layout.tsx, and add `paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))'` so the last card is not obscured by the iOS safe area:
```
minHeight: '100vh',
padding: '0 0 20px 0',
paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
position: 'relative' as const,
zIndex: 1,
```

Wait -- `padding` shorthand would override `paddingBottom`. Instead use:
```
minHeight: '100vh',
paddingTop: '0',
paddingLeft: '0',
paddingRight: '0',
paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
position: 'relative' as const,
zIndex: 1,
```

**Summary of changes per file:**

static-macintosh-layout.tsx:
1. Fixed div: top/left/right/bottom to -50vh/-50vw/-50vw/-50vh
2. bgStyle: backgroundSize '350px auto' -> '500px auto'
3. Non-frame contentStyle: add minHeight '100vh', change padding to paddingBottom with safe-area-inset

macintosh-layout.tsx:
1. Fixed div: top/left/right/bottom to -50vh/-50vw/-50vw/-50vh
2. bgStyle: backgroundSize '350px auto' -> '500px auto'
3. Non-frame contentStyle already has minHeight '100vh' -- no change needed
  </action>
  <verify>
1. Open the Macintosh theme public page on iOS Safari (or Chrome DevTools device emulation with safe area insets enabled).
2. Verify pattern fills the entire screen including bottom safe area -- no white/solid gaps.
3. Scroll down through cards -- pattern stays stationary, only cards move.
4. Mac menu bar (File Edit View [username]) stays pinned at top while scrolling.
5. Pattern tiles appear larger than before (500px wide tiles).
6. Test on desktop browser -- same behavior, pattern fixed, menu bar fixed.
  </verify>
  <done>Pattern background is truly fullscreen and fixed on all devices. Pattern tiles are 500px. Menu bar stays fixed. No gaps in iOS Safari safe areas. Both editor preview and public page layouts are updated.</done>
</task>

</tasks>

<verification>
1. Pattern fills entire viewport including iOS Safari bottom safe area (no gaps, no cutoff)
2. Pattern stays stationary/fixed while cards scroll over it
3. Pattern tiles are noticeably larger than before (~500px vs 350px)
4. Mac menu bar stays fixed at top during scroll
5. Works in Safari, Chrome, Firefox on both mobile and desktop
6. Editor preview (macintosh-layout.tsx) shows same behavior
7. No horizontal scrollbar appears
</verification>

<success_criteria>
- Zero visual gaps in the pattern on iOS Safari (including bottom safe area bounce scroll)
- Pattern is stationary during scroll on all tested browsers
- Pattern tiles are larger (500px)
- Menu bar is fixed at viewport top during scroll
- No regressions in frame mode (editor phone frame preview)
</success_criteria>

<output>
After completion, create `.planning/quick/062-macintosh-pattern-bg-fixed-fullscreen/062-SUMMARY.md`
</output>
