---
phase: quick
plan: 067
subsystem: audio
tags: [audio-player, theme-routing, poolsuite]
dependency-graph:
  requires: [quick-051, quick-053, quick-064]
  provides: [unified-poolsuite-player-routing]
  affects: []
tech-stack:
  added: []
  patterns: [theme-routing-consolidation]
key-files:
  created: []
  modified:
    - src/components/audio/audio-player.tsx
decisions:
  - id: poolsuite-routing
    choice: "Route mac-os and instagram-reels to Poolsuite render path"
    reason: "Consistent audio player UX across standard themes"
metrics:
  duration: "2m 29s"
  completed: "2026-02-16"
---

# Quick Task 067: Poolsuite Audio Player for All Standard Themes

Unified audio player routing so mac-os, instagram-reels, system-settings, and blinkies all render the Poolsuite FM player layout.

## One-liner

Consolidated four standard themes to shared Poolsuite audio player by removing 250-line Mac OS render block and updating theme routing boolean.

## What Changed

### Theme Routing Consolidation

Renamed `isSystemSettings` boolean to `isPoolsuite` and expanded it to include all four standard themes:

```typescript
const isPoolsuite = themeVariant === 'system-settings' || isBlinkies || isMacOs || themeVariant === 'instagram-reels'
```

### Removed Mac OS Audio Render Block

Removed the entire `if (isMacOs)` block (~250 lines) which contained:
- MacBox helper component with 8-bit pixel clip-paths
- Checkerboard varispeed slider with pixel-art knob
- PLAY/PAUSE text buttons in bordered boxes
- Marquee animation for track title overflow
- Mac-specific color hardcoding (#000, #fff)

Mac OS audio cards now render the Poolsuite player with transport buttons, halftone progress bar, varispeed slider with tick marks, and reverb knob in bordered boxes.

### Updated Color Logic

Removed mac-os and instagram-reels from `effectiveForegroundColor` and `effectiveElementBgColor` since these themes now go through the Poolsuite block which computes `psColor` independently via `var(--theme-text)`.

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Message |
|------|---------|
| d1ee11d | feat(quick-067): route mac-os and instagram-reels to Poolsuite player |

## Verification

- TypeScript compiles with zero errors (`npx tsc --noEmit`)
- Build passes (`npm run build`)
- No remaining `isSystemSettings` references in audio-player.tsx
- No remaining `MacBox`, `macPixelClip`, `mac-audio-marquee` references
- Special themes (receipt, ipod-classic, vcr-menu, classified) untouched
