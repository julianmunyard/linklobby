---
phase: quick
plan: 062
subsystem: theme
tags: [macintosh, pattern-background, iOS-safari, fixed-positioning, safe-area]
depends_on: [quick-039, quick-040]
provides: [bulletproof-fixed-pattern-bg, larger-pattern-tiles, safe-area-coverage]
affects: []
tech-stack:
  added: []
  patterns: ["oversized fixed div for fullscreen coverage", "solid body fallback for safe areas"]
key-files:
  created: []
  modified:
    - src/components/public/theme-injector.tsx
    - src/components/public/static-macintosh-layout.tsx
    - src/components/cards/macintosh-layout.tsx
decisions:
  - id: mac-pattern-on-fixed-div-not-body
    description: "Pattern rendered by fixed div layer, body gets solid color only as safe area fallback"
  - id: 50vh-50vw-oversized-fixed-div
    description: "Fixed div extends -50vh/-50vw in all directions for guaranteed full coverage without calc/env"
  - id: 500px-pattern-tiles
    description: "Pattern tile size increased from 350px to 500px for better visibility on mobile"
metrics:
  duration: "~1.5 minutes"
  completed: "2026-02-11"
---

# Quick Task 062: Macintosh Pattern Background Fixed Fullscreen

Bulletproof fixed pattern background for Macintosh theme across all devices including iOS Safari safe areas.

## One-liner

Oversized fixed div (-50vh/-50vw) replaces calc-based positioning for gap-free Macintosh pattern, tiles enlarged to 500px, body reduced to solid fallback only.

## What Changed

### Task 1: Theme Injector Body CSS (21d2b3f)

**Problem:** Body CSS was applying the Macintosh pattern image via `macPatternBg`, duplicating what the fixed div in the layout already does. This caused conflicts and made the pattern scroll with the page on some browsers.

**Fix:**
- Removed `macPatternBg` variable that put pattern image on body
- Body now gets only `background-color: ${macPatternColor} !important;` (solid color)
- Added `overflow-x: hidden !important;` on body to prevent horizontal scroll from oversized fixed div
- Kept `padding-bottom: env(safe-area-inset-bottom, 0px)` for safe area spacing
- Pattern rendering fully delegated to the fixed div layer in layout components

### Task 2: Fixed Background Div and Pattern Size (79bf951)

**Problem:** The fixed background div used `calc(-20vh - env(safe-area-inset-top/bottom))` and `-5vw` left/right, which could still leave gaps on devices with unusual safe area configurations.

**Fix in both static-macintosh-layout.tsx and macintosh-layout.tsx:**
1. **Fixed div oversized to -50vh/-50vw** in all four directions. This makes the div extend 50% of the viewport beyond every edge -- massively oversized so there is zero possible gap on any device, any browser, any safe area. Since it's `position: fixed`, overflow is clipped by the viewport naturally.
2. **Pattern tile size: 350px -> 500px.** Larger tiles look less tiny on mobile screens.
3. **Public layout contentStyle** (static-macintosh-layout.tsx non-frame mode): Added `minHeight: '100vh'` and `paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))'` so content fills viewport and last card isn't obscured by iOS safe area.
4. **Menu bar positioning verified correct:** `position: fixed` for public pages (stays at viewport top), `position: sticky` for editor frame mode.

## Deviations from Plan

None -- plan executed exactly as written.

## Commits

| # | Hash | Message |
|---|------|---------|
| 1 | 21d2b3f | feat(quick-062): remove pattern from body CSS, delegate to fixed div |
| 2 | 79bf951 | feat(quick-062): fix fixed bg fullscreen coverage and increase pattern size |

## Files Modified

| File | Changes |
|------|---------|
| src/components/public/theme-injector.tsx | Removed macPatternBg, body gets solid color + overflow-x hidden |
| src/components/public/static-macintosh-layout.tsx | Fixed div -50vh/-50vw, bgSize 500px, contentStyle minHeight + paddingBottom |
| src/components/cards/macintosh-layout.tsx | Fixed div -50vh/-50vw, bgSize 500px |
