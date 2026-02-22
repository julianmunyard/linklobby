---
phase: quick
plan: 072
subsystem: background-effects
tags: [glitchGL, three.js, webgl, crt, pixelation, background]
requires: [07-07]
provides: [glitch-background-effects]
affects: []
tech-stack:
  added: [glitchGL, three.js-r128]
  patterns: [lazy-script-loading, vendor-scripts]
key-files:
  created:
    - public/vendor/glitchgl/glitchGL.min.js
    - public/vendor/glitchgl/three.min.js
    - src/components/glitch/glitch-overlay.tsx
    - src/components/glitch/static-glitch-overlay.tsx
  modified:
    - src/types/theme.ts
    - src/components/editor/background-controls.tsx
    - src/app/preview/page.tsx
    - src/app/[username]/page.tsx
decisions:
  - id: glitchgl-vendor-scripts
    choice: "Vendor glitchGL and Three.js as static files in public/vendor/"
    rationale: "glitchGL is not an npm package; Three.js r128 is the specific version it depends on"
  - id: glitch-lazy-loading
    choice: "Scripts loaded on-demand via dynamic script tags when effect is toggled on"
    rationale: "Zero cost when effect is off (700KB of JS not loaded)"
  - id: glitch-z-index-4
    choice: "Glitch overlay at -z-[4], between dim overlay (-z-[5]) and content"
    rationale: "Renders on top of dim but below cards; pointer-events: none preserves interactivity"
  - id: glitch-css-selector-target
    choice: "Use DOM ID selector (#glitch-bg-source) for glitchGL target"
    rationale: "glitchGL API requires CSS selector string, not DOM element ref"
  - id: interaction-disabled
    choice: "Set interaction.enabled: false in glitchGL options"
    rationale: "Background-only effect, no mouse interaction needed"
metrics:
  duration: 4min
  completed: 2026-02-22
---

# Quick Task 072: glitchGL Background Effects Summary

WebGL glitch/CRT/pixelation effects for page backgrounds using glitchGL library with Three.js r128.

## What Was Built

Integrated the glitchGL library to provide three categories of background effects:

1. **CRT Effect** - Scanlines, screen curvature, and chromatic aberration simulating a CRT monitor
2. **Pixelation Effect** - Configurable pixel size with square or circle pixel shapes
3. **Glitch Effect** - RGB shift, digital noise, and line displacement for a digital corruption aesthetic

### Architecture

- **Vendor files**: `public/vendor/glitchgl/` contains glitchGL.min.js (100KB) and three.min.js (603KB)
- **Editor overlay**: `GlitchOverlay` reads from theme store (Zustand), same pattern as NoiseOverlay/DimOverlay
- **Public overlay**: `StaticGlitchOverlay` takes BackgroundConfig as props, same pattern as StaticNoiseOverlay
- **Shared utilities**: `buildGlitchOptions()`, `buildBgStyle()`, `loadGlitchScripts()` exported from glitch-overlay.tsx and reused by static variant
- **Lazy loading**: Three.js + glitchGL only loaded when user toggles effect on (zero cost when off)

### Editor Controls

Background Controls gains a "Glitch Effects" section (after Dim Background, before Status Bar Color):
- Master on/off Switch toggle
- Effect type selector: CRT / Pixel / Glitch buttons
- Master intensity slider (10-100%)
- Per-type sub-controls that show/hide based on selected type:
  - CRT: Scanlines, Curvature, Chromatic Aberration
  - Pixel: Pixel Size (2-32px), Pixel Shape (Square/Circle)
  - Glitch: RGB Shift, Digital Noise, Line Displacement

Settings are stored on the `background` object in BackgroundConfig (same as noise/dim) and flow through `setBackground()` with spread pattern.

## Commits

| # | Hash | Message |
|---|------|---------|
| 1 | 959f1e0 | feat(quick-072): vendor glitchGL + Three.js and add BackgroundConfig glitch types |
| 2 | 77eeb21 | feat(quick-072): add glitch effects UI, overlay components, and wire into preview + public pages |

## Deviations from Plan

None - plan executed exactly as written.
