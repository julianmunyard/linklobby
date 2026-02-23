---
phase: quick
plan: 072
type: execute
wave: 1
depends_on: []
files_modified:
  - src/types/theme.ts
  - src/stores/theme-store.ts
  - src/components/editor/background-controls.tsx
  - src/components/preview/page-background.tsx
  - src/components/public/static-overlays.tsx
  - src/app/[username]/page.tsx
  - src/app/preview/page.tsx
  - src/components/glitch/glitch-overlay.tsx
  - src/components/glitch/static-glitch-overlay.tsx
  - public/vendor/glitchgl/glitchGL.min.js
  - public/vendor/glitchgl/three.min.js
autonomous: true
must_haves:
  truths:
    - "User can toggle glitch effects on/off in Background Controls"
    - "User can select between CRT, Pixelation, and Glitch effect types"
    - "User can adjust 2-3 sliders per effect type to control intensity"
    - "Glitch effect applies to background only, not cards or interactive elements"
    - "Effect renders in both editor preview and public page"
    - "When effect is off, zero extra JS is loaded (lazy loading)"
    - "Effect works on solid color, image, and video backgrounds"
  artifacts:
    - path: "public/vendor/glitchgl/glitchGL.min.js"
      provides: "Vendored glitchGL library"
    - path: "public/vendor/glitchgl/three.min.js"
      provides: "Vendored Three.js r128 dependency"
    - path: "src/components/glitch/glitch-overlay.tsx"
      provides: "Editor preview glitch overlay (reads from theme store)"
    - path: "src/components/glitch/static-glitch-overlay.tsx"
      provides: "Public page glitch overlay (takes props)"
  key_links:
    - from: "src/components/editor/background-controls.tsx"
      to: "src/stores/theme-store.ts"
      via: "setBackground() with glitch fields"
      pattern: "glitchEffect|glitchType|glitchIntensity"
    - from: "src/components/glitch/glitch-overlay.tsx"
      to: "public/vendor/glitchgl/glitchGL.min.js"
      via: "dynamic script loading"
      pattern: "glitchGL"
    - from: "src/app/[username]/page.tsx"
      to: "src/components/glitch/static-glitch-overlay.tsx"
      via: "component import and rendering"
      pattern: "StaticGlitchOverlay"
---

<objective>
Integrate glitchGL library to apply WebGL glitch/CRT/pixelation effects to page backgrounds.

Purpose: Add a new visual effect category (CRT scanlines, pixel art, digital glitch) to the background controls, following the exact same pattern as noise overlay. The effect only targets the non-interactive background element, preserving all card/link interactivity.

Output: Vendored glitchGL + Three.js files, type definitions, store integration, editor UI controls, and rendering components for both preview and public pages.
</objective>

<context>
@src/types/theme.ts (BackgroundConfig — add glitch fields next to noiseOverlay/dimOverlay)
@src/stores/theme-store.ts (theme store — add glitch fields to state, loadFromDatabase, getSnapshot)
@src/components/editor/background-controls.tsx (UI — add Glitch Effects section after Dim Overlay, same Switch+sub-controls pattern)
@src/components/preview/page-background.tsx (editor overlays — add GlitchOverlay export like NoiseOverlay)
@src/components/public/static-overlays.tsx (public overlays — add StaticGlitchOverlay like StaticNoiseOverlay)
@src/app/[username]/page.tsx (public page — render StaticGlitchOverlay)
@src/app/preview/page.tsx (preview page — render GlitchOverlay)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Vendor glitchGL + Three.js, add type definitions and store integration</name>
  <files>
    public/vendor/glitchgl/glitchGL.min.js
    public/vendor/glitchgl/three.min.js
    src/types/theme.ts
    src/stores/theme-store.ts
  </files>
  <action>
**Step 1: Vendor the libraries.**

Download `glitchGL.min.js` from https://github.com/naughtyduk/glitchGL (the `scripts/` directory). Place in `public/vendor/glitchgl/glitchGL.min.js`.

Download Three.js r128 minified from CDN (https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js). Place in `public/vendor/glitchgl/three.min.js`.

**Step 2: Add type definitions to `BackgroundConfig` in `src/types/theme.ts`.**

Add these fields to `BackgroundConfig` after the `dimIntensity` field, grouped with a comment `// Glitch effect (glitchGL)`:

```typescript
// Glitch effect (glitchGL)
glitchEffect?: boolean           // Master toggle
glitchType?: 'crt' | 'pixelation' | 'glitch'  // Which effect preset
glitchIntensity?: number         // Master intensity 0-100, default 50
// CRT sub-controls
glitchCrtScanlines?: number      // 0-100, default 70
glitchCrtCurvature?: number      // 0-20, default 8
glitchCrtAberration?: number     // 0-100 (maps to 0-0.01), default 40
// Pixelation sub-controls
glitchPixelSize?: number         // 2-32, default 8
glitchPixelShape?: 'square' | 'circle'  // default 'square'
// Glitch sub-controls
glitchRgbShift?: number          // 0-100 (maps to 0-0.05), default 0
glitchDigitalNoise?: number      // 0-100 (maps to 0-0.5), default 10
glitchLineDisplacement?: number  // 0-100 (maps to 0-0.1), default 10
```

**Step 3: Update theme store (`src/stores/theme-store.ts`).**

No new store actions needed — glitch settings live on the `background` object and are updated via `setBackground()` (same as noise/dim). But you MUST update these methods to preserve glitch fields:

1. In `loadFromDatabase`: The `background` object is loaded as-is from the database via `theme.background`, so glitch fields will carry through automatically. No change needed here.

2. In `getSnapshot`: The `background` object is returned as-is, so glitch fields will carry through automatically. No change needed here.

3. In `setTheme` and `setPalette`: These reset background to `{ type: 'solid', value: ... }` which will DROP glitch settings on theme/palette change. This is correct behavior (reset to defaults on theme change, same as noise).

4. In `resetToThemeDefaults`: Same — resets background, dropping glitch settings. Correct.

So actually no store changes are needed — the `background` object is treated as an opaque blob and glitch fields flow through `setBackground()`.

**IMPORTANT:** Verify by reading the store code that `setBackground` does a full replacement (not a merge). It does: `set((state) => { const newState = { background, hasChanges: true }; ... })`. This means callers must spread: `setBackground({ ...background, glitchEffect: true })`. The existing noise/dim handlers in background-controls.tsx already follow this pattern.
  </action>
  <verify>
- `public/vendor/glitchgl/glitchGL.min.js` exists and is non-empty
- `public/vendor/glitchgl/three.min.js` exists and is non-empty
- `npx tsc --noEmit` passes (type definitions valid)
  </verify>
  <done>
- Both vendor files exist in public/vendor/glitchgl/
- BackgroundConfig has all glitch* fields
- TypeScript compiles without errors
  </done>
</task>

<task type="auto">
  <name>Task 2: Create glitch overlay components, editor UI controls, and wire into preview + public pages</name>
  <files>
    src/components/glitch/glitch-overlay.tsx
    src/components/glitch/static-glitch-overlay.tsx
    src/components/editor/background-controls.tsx
    src/components/preview/page-background.tsx
    src/components/public/static-overlays.tsx
    src/app/[username]/page.tsx
    src/app/preview/page.tsx
  </files>
  <action>
**Step 1: Create `src/components/glitch/glitch-overlay.tsx` (editor preview version).**

This component reads from theme store (same pattern as `NoiseOverlay` in page-background.tsx). It:

1. Reads `background` from `useThemeStore()`.
2. If `!background.glitchEffect`, returns null.
3. Uses `useEffect` to dynamically load Three.js then glitchGL from `/vendor/glitchgl/` using script tags (NOT import — these are global scripts).
4. Creates a target div that covers the viewport (fixed, inset-0, -z-[4], pointer-events-none) — between dim overlay (-z-[5]) and content.
5. The target div should have a solid color fill, background image, or be transparent depending on the background type. Actually, glitchGL replaces the target element's visual with a canvas. The approach:
   - Create a container div (the one at -z-[4]) that holds a "source" div inside it.
   - The source div matches the current background (solid color div, or has the background-image, or contains a video element).
   - Call `glitchGL({ target: sourceDiv, ... })` to replace it with a canvas.
   - Wait — glitchGL targets a CSS selector or DOM element. Since we're in React, use a ref.

**Key implementation detail:** glitchGL takes a `target` selector string. Use a unique ID like `glitch-bg-source` and pass `target: '#glitch-bg-source'`. The source div must visually represent the background for glitchGL to process it.

Actually, re-reading the glitchGL docs more carefully — glitchGL creates a WebGL canvas that replaces/overlays the target element. It captures what the element looks like and applies shader effects. So the approach is:

- Render a hidden div (`#glitch-bg-source`) that mirrors the current background (color, image, or snapshot).
- Apply glitchGL to it.
- Position the resulting canvas as the background layer.

**Simpler approach:** glitchGL can work on solid-colored elements. For solid backgrounds, create a div with that background color. For images, create a div with background-image. For video, this gets tricky.

**Implementation:**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useThemeStore } from '@/stores/theme-store'

export function GlitchOverlay() {
  const { background } = useThemeStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const effectRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)

  // Load scripts on first enable
  useEffect(() => {
    if (!background.glitchEffect || loaded) return

    const loadScripts = async () => {
      // Load Three.js first, then glitchGL
      if (!(window as any).THREE) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = '/vendor/glitchgl/three.min.js'
          script.onload = () => resolve()
          script.onerror = reject
          document.head.appendChild(script)
        })
      }
      if (!(window as any).glitchGL) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = '/vendor/glitchgl/glitchGL.min.js'
          script.onload = () => resolve()
          script.onerror = reject
          document.head.appendChild(script)
        })
      }
      setLoaded(true)
    }

    loadScripts().catch(console.error)
  }, [background.glitchEffect, loaded])

  // Initialize/update effect
  useEffect(() => {
    if (!loaded || !background.glitchEffect || !containerRef.current) {
      // Cleanup if disabled
      if (effectRef.current?.destroy) {
        effectRef.current.destroy()
        effectRef.current = null
      }
      return
    }

    const glitchGL = (window as any).glitchGL
    if (!glitchGL) return

    const type = background.glitchType ?? 'crt'
    const intensity = (background.glitchIntensity ?? 50) / 100

    const options = {
      target: containerRef.current,
      intensity,
      effects: {
        crt: {
          enabled: type === 'crt',
          scanlineIntensity: ((background.glitchCrtScanlines ?? 70) / 100) * intensity,
          curvature: background.glitchCrtCurvature ?? 8,
          chromaticAberration: ((background.glitchCrtAberration ?? 40) / 100) * 0.01,
        },
        pixelation: {
          enabled: type === 'pixelation',
          pixelSize: background.glitchPixelSize ?? 8,
          pixelShape: background.glitchPixelShape ?? 'square',
        },
        glitch: {
          enabled: type === 'glitch',
          rgbShift: ((background.glitchRgbShift ?? 0) / 100) * 0.05,
          digitalNoise: ((background.glitchDigitalNoise ?? 10) / 100) * 0.5,
          lineDisplacement: ((background.glitchLineDisplacement ?? 10) / 100) * 0.1,
        },
      },
    }

    if (effectRef.current?.updateOptions) {
      effectRef.current.updateOptions(options)
    } else {
      // Destroy previous and create new
      if (effectRef.current?.destroy) effectRef.current.destroy()
      effectRef.current = glitchGL(options)
    }

    return () => {
      if (effectRef.current?.destroy) {
        effectRef.current.destroy()
        effectRef.current = null
      }
    }
  }, [loaded, background.glitchEffect, background.glitchType, background.glitchIntensity, background.glitchCrtScanlines, background.glitchCrtCurvature, background.glitchCrtAberration, background.glitchPixelSize, background.glitchPixelShape, background.glitchRgbShift, background.glitchDigitalNoise, background.glitchLineDisplacement])

  if (!background.glitchEffect) return null

  // Render a background-matching div for glitchGL to process
  const bgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
  }

  if (background.type === 'solid') {
    bgStyle.backgroundColor = background.value
  } else if (background.type === 'image' && background.value) {
    bgStyle.backgroundImage = `url(${background.value})`
    bgStyle.backgroundSize = 'cover'
    bgStyle.backgroundPosition = `${background.imagePositionX ?? 50}% ${background.imagePositionY ?? 50}%`
  } else if (background.type === 'video') {
    bgStyle.backgroundColor = '#000'
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-[4] pointer-events-none"
      style={bgStyle}
    />
  )
}
```

Note: The exact glitchGL API may need adjustment once the vendored file is inspected. The above is based on the documented API. If glitchGL uses a different initialization pattern (e.g., CSS selector string vs DOM element for `target`), adapt accordingly. If it uses `target: '#id'` string format, give the container div an ID and pass that string.

**Step 2: Create `src/components/glitch/static-glitch-overlay.tsx` (public page version).**

Same logic but takes `BackgroundConfig` as props instead of reading from store (same pattern as `StaticNoiseOverlay`):

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import type { BackgroundConfig } from '@/types/theme'

interface StaticGlitchOverlayProps {
  background: BackgroundConfig
}

export function StaticGlitchOverlay({ background }: StaticGlitchOverlayProps) {
  // Same logic as GlitchOverlay but using props instead of store
  // ...identical script loading and effect initialization...
}
```

**Step 3: Add Glitch Effects controls to `src/components/editor/background-controls.tsx`.**

Add a new section AFTER the Dim Overlay section (before the Status Bar Color section), following the exact same pattern. Import `Zap` from lucide-react for the icon (represents electricity/glitch).

The section structure:

```tsx
{/* Divider */}
<div className="h-px bg-border" />

{/* Glitch Effects Section */}
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Zap className="w-4 h-4 text-muted-foreground" />
      <Label className="text-xs font-medium text-muted-foreground">Glitch Effects</Label>
    </div>
    <Switch
      checked={background.glitchEffect ?? false}
      onCheckedChange={(checked) => setBackground({ ...background, glitchEffect: checked })}
    />
  </div>

  {background.glitchEffect && (
    <div className="space-y-4 pl-4 border-l-2 border-border">
      {/* Effect Type Selector */}
      <div className="space-y-2">
        <Label className="text-xs">Effect Type</Label>
        <div className="flex gap-1">
          {(['crt', 'pixelation', 'glitch'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setBackground({ ...background, glitchType: type })}
              className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                (background.glitchType ?? 'crt') === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {type === 'crt' ? 'CRT' : type === 'pixelation' ? 'Pixel' : 'Glitch'}
            </button>
          ))}
        </div>
      </div>

      {/* Master Intensity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Intensity</Label>
          <span className="text-xs text-muted-foreground">{background.glitchIntensity ?? 50}%</span>
        </div>
        <Slider
          value={[background.glitchIntensity ?? 50]}
          onValueChange={([v]) => setBackground({ ...background, glitchIntensity: v })}
          min={10}
          max={100}
          step={5}
        />
      </div>

      {/* CRT sub-controls */}
      {(background.glitchType ?? 'crt') === 'crt' && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Scanlines</Label>
              <span className="text-xs text-muted-foreground">{background.glitchCrtScanlines ?? 70}%</span>
            </div>
            <Slider value={[background.glitchCrtScanlines ?? 70]} onValueChange={([v]) => setBackground({ ...background, glitchCrtScanlines: v })} min={0} max={100} step={5} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Curvature</Label>
              <span className="text-xs text-muted-foreground">{background.glitchCrtCurvature ?? 8}</span>
            </div>
            <Slider value={[background.glitchCrtCurvature ?? 8]} onValueChange={([v]) => setBackground({ ...background, glitchCrtCurvature: v })} min={0} max={20} step={1} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Chromatic Aberration</Label>
              <span className="text-xs text-muted-foreground">{background.glitchCrtAberration ?? 40}%</span>
            </div>
            <Slider value={[background.glitchCrtAberration ?? 40]} onValueChange={([v]) => setBackground({ ...background, glitchCrtAberration: v })} min={0} max={100} step={5} />
          </div>
        </>
      )}

      {/* Pixelation sub-controls */}
      {(background.glitchType ?? 'crt') === 'pixelation' && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Pixel Size</Label>
              <span className="text-xs text-muted-foreground">{background.glitchPixelSize ?? 8}px</span>
            </div>
            <Slider value={[background.glitchPixelSize ?? 8]} onValueChange={([v]) => setBackground({ ...background, glitchPixelSize: v })} min={2} max={32} step={1} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Pixel Shape</Label>
            <div className="flex gap-2">
              {(['square', 'circle'] as const).map((shape) => (
                <button
                  key={shape}
                  onClick={() => setBackground({ ...background, glitchPixelShape: shape })}
                  className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                    (background.glitchPixelShape ?? 'square') === shape
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  {shape.charAt(0).toUpperCase() + shape.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Glitch sub-controls */}
      {(background.glitchType ?? 'crt') === 'glitch' && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">RGB Shift</Label>
              <span className="text-xs text-muted-foreground">{background.glitchRgbShift ?? 0}%</span>
            </div>
            <Slider value={[background.glitchRgbShift ?? 0]} onValueChange={([v]) => setBackground({ ...background, glitchRgbShift: v })} min={0} max={100} step={5} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Digital Noise</Label>
              <span className="text-xs text-muted-foreground">{background.glitchDigitalNoise ?? 10}%</span>
            </div>
            <Slider value={[background.glitchDigitalNoise ?? 10]} onValueChange={([v]) => setBackground({ ...background, glitchDigitalNoise: v })} min={0} max={100} step={5} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Line Displacement</Label>
              <span className="text-xs text-muted-foreground">{background.glitchLineDisplacement ?? 10}%</span>
            </div>
            <Slider value={[background.glitchLineDisplacement ?? 10]} onValueChange={([v]) => setBackground({ ...background, glitchLineDisplacement: v })} min={0} max={100} step={5} />
          </div>
        </>
      )}
    </div>
  )}
</div>
```

Add `Zap` to the lucide-react import at the top of background-controls.tsx.

Add this section in BOTH the macintosh-specific return (after the Noise Overlay section, before Status Bar Color) AND the main return (after the Dim Overlay section, before Status Bar Color).

**Step 4: Wire into preview page (`src/app/preview/page.tsx`).**

Import `GlitchOverlay` from `@/components/glitch/glitch-overlay` at the top. Add `<GlitchOverlay />` in every layout branch where `<NoiseOverlay />` appears — place it RIGHT BEFORE `<NoiseOverlay />` (glitch renders below noise in z-order). The pattern is: wherever you see `<NoiseOverlay />`, add `<GlitchOverlay />` on the line before it.

**Step 5: Wire into public page (`src/app/[username]/page.tsx`).**

Import `StaticGlitchOverlay` from `@/components/glitch/static-glitch-overlay`. Add `<StaticGlitchOverlay background={background} />` right before `<StaticNoiseOverlay background={background} />` (line ~189).

**Step 6: Export from page-background.tsx (optional, for consistency).**

Actually, since the glitch overlay is a separate component in its own directory (unlike noise which is simple enough to live in page-background.tsx), we do NOT need to re-export from page-background.tsx. The preview page imports directly from `@/components/glitch/glitch-overlay`.
  </action>
  <verify>
- `npx tsc --noEmit` passes
- Editor preview page loads without console errors
- Background Controls shows "Glitch Effects" toggle after "Dim Background"
- Toggling on shows effect type selector and intensity slider
- Selecting CRT/Pixelation/Glitch shows correct sub-controls
- Public page renders `StaticGlitchOverlay` component
  </verify>
  <done>
- Glitch Effects section appears in Background Controls with toggle, type selector, and per-type sliders
- GlitchOverlay renders in editor preview when enabled
- StaticGlitchOverlay renders on public pages when enabled
- Three.js and glitchGL are only loaded when effect is toggled on (lazy)
- Effect applies to background layer only (pointer-events: none, correct z-index)
- All three background types (solid, image, video) are supported
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>glitchGL background effects integration with CRT/Pixelation/Glitch modes, editor controls, and rendering on both preview and public pages</what-built>
  <how-to-verify>
    1. Open the editor at localhost:3000/editor
    2. Scroll to Background section in the sidebar
    3. Find "Glitch Effects" toggle (should be after "Dim Background")
    4. Toggle it ON — verify sub-controls appear (Effect Type buttons, Intensity slider)
    5. Select "CRT" — verify scanlines/curvature/aberration sliders appear and the preview shows a CRT effect on the background
    6. Select "Pixel" — verify pixel size slider appears and background pixelates
    7. Select "Glitch" — verify RGB shift/noise/displacement sliders appear
    8. Adjust sliders — verify effect updates in real-time
    9. Try with different background types (solid color, upload an image, set a video URL)
    10. Toggle OFF — verify effect disappears and no WebGL artifacts remain
    11. Check browser Network tab — Three.js and glitchGL scripts should only load AFTER toggling ON
    12. Save and visit the public page — verify the glitch effect renders there too
  </how-to-verify>
  <resume-signal>Type "approved" or describe any visual/functional issues</resume-signal>
</task>

</tasks>

<verification>
- TypeScript compiles: `npx tsc --noEmit`
- Dev server runs: `npm run dev` without errors
- Glitch toggle works in editor Background Controls
- Effect renders on both preview iframe and public page
- Lazy loading confirmed: scripts only load on toggle-on
- No interactivity loss: cards, links, scrolling unaffected by overlay
</verification>

<success_criteria>
- Glitch Effects toggle + type selector + per-type sliders appear in Background Controls
- CRT, Pixelation, and Glitch effects render on page background in both editor and public page
- Three.js + glitchGL lazy-loaded (zero cost when off)
- Background interactivity preserved (pointer-events: none on overlay)
- Settings persist through save/load cycle
</success_criteria>

<output>
After completion, create `.planning/quick/072-glitchgl-background-effects/072-SUMMARY.md`
</output>
