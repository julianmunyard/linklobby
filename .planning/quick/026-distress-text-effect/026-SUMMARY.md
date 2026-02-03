# Quick Task 026: Distress Text Effect

## Summary
Added a global "Distress Effect" toggle in the Fonts tab that applies an animated fuzzy/CRT-style displacement effect to all title text across the app.

## What Was Built

### New Component
**`src/components/ui/fuzzy-text.tsx`**
- SVG filter-based text distortion effect
- Uses `feTurbulence` + `feDisplacementMap` for horizontal pixel displacement
- Animates by changing the turbulence seed on each frame
- Preserves text layout (wrapping, sizing, positioning unchanged)
- Props:
  - `intensity` (0-1): Controls displacement amount (default 0.19)
  - `speed` (fps): Animation speed (default 12)

### Theme Store Updates
**`src/types/theme.ts`** - Added to `FontConfig`:
- `fuzzyEnabled?: boolean` - Toggle for the effect
- `fuzzyIntensity?: number` - Displacement intensity (0-1)
- `fuzzySpeed?: number` - Animation FPS

**`src/stores/theme-store.ts`**:
- Added default values for fuzzy settings
- Updated `setFont` to accept boolean values

### UI Controls
**`src/components/editor/font-picker.tsx`**:
- "Distress Effect" toggle switch
- "Intensity" slider (5% to 50%)
- "Speed" slider (4 to 30 fps)
- Live preview in the font preview section

### Cards Updated
Applied FuzzyText wrapper to title text when enabled:
- `src/components/cards/link-card.tsx`
- `src/components/cards/hero-card.tsx`
- `src/components/cards/square-card.tsx`
- `src/components/cards/text-card.tsx`
- `src/components/preview/profile-header.tsx`

## Technical Approach

### Why SVG Filters (not Canvas)
Initial attempts used canvas-based rendering (like ReactBits FuzzyText), but this caused:
- Layout changes when toggling the effect
- Text wrapping issues
- Font resolution problems with CSS variables

SVG filters apply to existing DOM elements, so:
- Layout stays exactly the same
- Text wraps naturally
- Fonts/colors inherited from parent elements

### The Filter
```svg
<filter>
  <feTurbulence
    type="fractalNoise"
    baseFrequency="0.005 0.8"  <!-- Low X freq, high Y freq = horizontal bands -->
    numOctaves="1"
  />
  <feDisplacementMap
    scale={intensity * 32}
    xChannelSelector="R"
    yChannelSelector="R"  <!-- Same channel = horizontal only -->
  />
</filter>
```

The key insight: `baseFrequency="0.005 0.8"` creates horizontal "scanline" displacement similar to the row-by-row pixel shifting in the original ReactBits component.

## How to Use
1. Go to Editor → Design panel → Fonts tab
2. Scroll to "Distress Effect" toggle
3. Enable it
4. Adjust Intensity (how much displacement)
5. Adjust Speed (animation fps)

## Files Changed
- `src/components/ui/fuzzy-text.tsx` (new)
- `src/types/theme.ts`
- `src/types/card.ts` (fuzzyText settings added to card content types - unused, can be cleaned up)
- `src/stores/theme-store.ts`
- `src/components/editor/font-picker.tsx`
- `src/components/cards/link-card.tsx`
- `src/components/cards/hero-card.tsx`
- `src/components/cards/square-card.tsx`
- `src/components/cards/text-card.tsx`
- `src/components/preview/profile-header.tsx`

## Inspiration
- [ReactBits FuzzyText](https://reactbits.dev/text-animations/fuzzy-text) - Original effect reference
- Ported concept to SVG filters for better DOM integration
