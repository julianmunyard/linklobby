# Session: Public Page Fixes
**Date:** 2026-02-03

## Summary
Fixed multiple issues with the public page rendering to ensure parity with the editor preview.

---

## Issues Fixed

### 1. Frame Overlay Not Showing on Public Page
**Problem:** The AWGE frame border was visible in the editor preview but not on the public page.

**Root Cause:** The public page was server-rendered and didn't include the `FrameOverlay` and `NoiseOverlay` components which were client-side components using `useThemeStore`.

**Solution:**
- Created `src/components/public/static-overlays.tsx` with `StaticFrameOverlay` and `StaticNoiseOverlay` components that accept `BackgroundConfig` as props instead of reading from the store
- Updated `src/app/[username]/page.tsx` to import and render these overlays, passing the background config from theme settings

---

### 2. Frame Layout Not Applied on Public Page
**Problem:** Even with the frame showing, the content wasn't positioned correctly within the frame's "screen" area.

**Root Cause:** The `PublicPageRenderer` didn't handle the `frameFitContent` option or frame insets.

**Solution:**
- Updated `src/components/public/public-page-renderer.tsx` to:
  - Accept `background` prop with `BackgroundConfig` type
  - Include `FRAME_INSETS` config (same as preview page)
  - Handle three rendering modes:
    1. Frame + `frameFitContent`: Fixed positioning with transforms
    2. Frame only: Padding-based insets
    3. No frame: Full-width layout
- Updated `src/app/[username]/page.tsx` to pass `background` prop to renderer

---

### 3. Hydration Mismatch Error (Stack Component)
**Problem:** Console error about hydration mismatch in the `Stack` component used by gallery cards.

**Root Cause:** `Math.random()` was called during `useState` initialization, producing different values on server vs client.

**Solution:**
- Updated `src/components/ui/stack.tsx`:
  - Initialize with `randomRotation: 0` for SSR consistency
  - Added `hasMounted` state flag
  - Apply random rotation only after hydration via `useEffect`
  - Sync effect only runs after mount to avoid hydration issues

---

### 4. Mini Cards Not Rendering on Public Page
**Problem:** Mini card type wasn't rendering with correct sizing on the public page.

**Root Cause:** `StaticFlowGrid` only handled "big" and "small" sizes, not the "mini" card type which needs special width and positioning.

**Solution:**
- Updated `src/components/public/static-flow-grid.tsx` to match preview logic:
  - Mini cards: `w-fit` (compact width) with position-based margins
  - Link/Horizontal cards: Full width (`w-full`)
  - Gallery cards: `overflow-visible` for full-bleed effect
  - Position handling: left (default), center (`mx-auto`), right (`ml-auto`)

---

### 5. Content Not Full-Width on Desktop
**Problem:** Public page content was constrained to `max-w-2xl` (672px) instead of using full width like the AWGE border mode.

**Solution:**
- Updated `src/components/public/public-page-renderer.tsx` default layout:
  - Changed from `max-w-2xl mx-auto px-4 py-8` to full-width with `1rem` padding
  - Added `--page-padding-x` CSS variable for full-bleed components

---

## Files Modified

| File | Changes |
|------|---------|
| `src/components/public/static-overlays.tsx` | **NEW** - Static frame/noise overlays for SSR |
| `src/app/[username]/page.tsx` | Added overlay imports, extract background config, pass to renderer |
| `src/components/public/public-page-renderer.tsx` | Added frame layout handling, full-width default layout |
| `src/components/ui/stack.tsx` | Fixed hydration mismatch with deferred random rotation |
| `src/components/public/static-flow-grid.tsx` | Added mini card, link card, and position handling |
| `src/components/CircularGallery.jsx` | (Reverted) Temporarily added/removed edge fade effect |
| `src/components/cards/gallery-card.tsx` | (Reverted) Temporarily added/removed overlay gradients |

---

## Testing Checklist
- [x] Public page renders with frame overlay when enabled
- [x] Frame zoom/position settings apply correctly
- [x] `frameFitContent` constrains content to frame area
- [x] No hydration errors in console
- [x] Mini cards render with correct sizing
- [x] Mini card positions (left/center/right) work
- [x] Link cards render full width
- [x] Gallery cards have overflow visible
- [x] Content is full-width on desktop (no max-width constraint)
- [x] Noise overlay renders when enabled
