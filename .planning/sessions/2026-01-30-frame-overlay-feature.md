# Session: Frame Overlay Feature

**Date:** 2026-01-30
**Focus:** Adding device frame overlays to page backgrounds

---

## Summary

Added a new "Frame Overlay" feature that lets users wrap their entire page content inside a device frame (retro TV, CRT monitor, Motorola RAZR, etc.). The frame PNG sits on top of all content with a transparent "screen" area where content shows through.

---

## Features Implemented

### 1. Frame Overlay System
- PNG frames with transparent centers overlay the entire page
- Content displays through the transparent "screen" area
- Frame sits at `z-index: 50` with `pointer-events: none`

### 2. Frame Selection UI
Added to Background Controls panel:
- Toggle to enable/disable frame overlay
- Grid of frame options to choose from
- Visual preview thumbnails for each frame

### 3. Frame Library
Three frames added to `/public/frames/`:
- `awge-tv.png` - AWGE-style retro TV (inspired by A$AP Rocky's site)
- `retro-crt.png` - Classic CRT television with control panel
- `motorola-razr.png` - Motorola RAZR flip phone

### 4. Frame Insets Configuration
Each frame has defined insets that position content within the screen area:
```typescript
const FRAME_INSETS = {
  '/frames/awge-tv.png': { top: 7, bottom: 12, left: 5, right: 5 },
  '/frames/retro-crt.png': { top: 6, bottom: 6, left: 6, right: 32 },
  '/frames/motorola-razr.png': { top: 15, bottom: 48, left: 12, right: 12 },
}
```

### 5. Frame Zoom & Position Controls
- **Zoom:** Scale frame from 50% to 200%
- **Position X:** Move frame left/right (-50% to +50%)
- **Position Y:** Move frame up/down (-50% to +50%)
- **Reset button:** Return to defaults

### 6. "Fit Content to Frame" Toggle
When enabled:
- Content transforms with the frame (scales and positions together)
- Allows floating device effect (e.g., small phone in center of page)
- Content stays locked inside frame's screen area regardless of zoom

When disabled:
- Content fills page normally with padding for frame insets
- Content scrolls smoothly behind the fixed frame overlay

---

## Technical Implementation

### Files Modified

**Types:**
- `src/types/theme.ts` - Added `frameOverlay`, `frameZoom`, `framePositionX`, `framePositionY`, `frameFitContent` to `BackgroundConfig`

**Components:**
- `src/components/preview/page-background.tsx` - Added `FrameOverlay` component
- `src/components/editor/background-controls.tsx` - Added frame selection UI and controls
- `src/app/preview/page.tsx` - Added frame insets config, content positioning logic, fit-to-frame mode

**Assets:**
- `public/frames/awge-tv.png`
- `public/frames/retro-crt.png`
- `public/frames/motorola-razr.png`

### Key Technical Details

1. **Frame persistence:** Frame overlay persists when changing background type (solid/image/video) - fixed by spreading existing background state in all `setBackground` calls

2. **Full-bleed gallery:** Added CSS variable `--page-padding-x` so circular gallery can break out of container padding and extend edge-to-edge

3. **Smooth scroll:** Content scrolls naturally behind fixed frame (no clipping) by using padding instead of fixed overflow containers

4. **Responsive frames:** Frames use `object-fill` to stretch to viewport, with percentage-based insets for content positioning

---

## Research Conducted

Before implementation, researched:
- How AWGE (A$AP Rocky's site) implements device frames (PNG with transparent center)
- CSS techniques for responsive device frames (viewBox, padding hack, percentage positioning)
- Libraries: React95, NES.css, Spline, React Three Fiber, Aceternity UI, Magic UI
- 3D asset sources: Spline Community, pmndrs Market, Poly Haven, itch.io

Key insight: Complex-looking device frames are often just PNGs with transparent centers + CSS positioning. No WebGL or SVG required.

---

## Future Expansion

Easy to add more frames:
1. Drop PNG with transparent screen area in `/public/frames/`
2. Add insets to `FRAME_INSETS` in `preview/page.tsx`
3. Add button to frame grid in `background-controls.tsx`

Potential frames to add:
- GameBoy / GameBoy Color
- Old Macintosh
- iMac G3
- Nokia 3310
- Polaroid
- VHS tape border
- Terminal window
- Browser window
