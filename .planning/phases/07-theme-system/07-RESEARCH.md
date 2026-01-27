# Phase 7: Theme System - Research

**Researched:** 2026-01-28
**Domain:** CSS theming, design tokens, dynamic styling with Tailwind CSS v4
**Confidence:** HIGH

## Summary

This phase implements a comprehensive theme system allowing artists to select visual themes (Mac OS, Sleek Modern, Instagram Reels) that skin all cards consistently. The project already uses Tailwind CSS v4 with CSS variables, shadcn/ui, and next-themes - the exact stack needed for this feature.

The standard approach is to extend the existing CSS variable system with theme-specific tokens. Tailwind CSS v4's `@theme inline` directive already powers the current design, and we can leverage this by adding theme variant classes that override CSS variable values. The existing `next-themes` package handles the dark/light mode infrastructure and can be extended for custom themes.

Key recommendations: Use CSS custom properties for all theme tokens, react-colorful for color pickers, next/font/google for font loading, and Zustand persist middleware for theme state persistence. Video backgrounds require careful optimization for mobile.

**Primary recommendation:** Extend the existing CSS variable system with theme-specific overrides using data attributes, keeping all styling in CSS while managing state with Zustand.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| tailwindcss | ^4 | CSS framework with @theme directive | Project already uses; v4 has native CSS variable support |
| next-themes | ^0.4.6 | Theme switching infrastructure | Already installed; handles class/attribute toggling |
| zustand | ^5.0.10 | State management | Already used for page-store; includes persist middleware |

### New Dependencies
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-colorful | ^5.6.1 | Color picker component | 2.8KB gzipped, 13x smaller than react-color, TypeScript native |
| next/font/google | built-in | Google Fonts loading | Zero layout shift, self-hosted, no external requests |

### Supporting (Already Available)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-slider | ^1.3.6 | Blur intensity, font size sliders | Already installed via shadcn |
| @radix-ui/react-tabs | ^1.1.13 | Theme panel tabs (Presets|Colors|Fonts|Style) | Already installed |
| @radix-ui/react-popover | ^1.1.15 | Color picker popover | Already installed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-colorful | react-color | react-color is 35KB, overkill for our needs |
| CSS variables | CSS-in-JS (styled-components) | CSS variables work natively with Tailwind v4, better performance |
| Zustand persist | localStorage directly | Zustand gives reactive state + persistence in one API |

**Installation:**
```bash
npm install react-colorful
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── types/
│   └── theme.ts                 # Theme types (ThemeId, ThemeConfig, ColorPalette)
├── lib/
│   └── themes/
│       ├── index.ts             # Theme registry, getTheme(), theme utils
│       ├── mac-os.ts            # Mac OS theme definition
│       ├── sleek-modern.ts      # Sleek Modern theme definition
│       └── instagram-reels.ts   # Instagram Reels theme definition
├── stores/
│   └── theme-store.ts           # Zustand store with persist middleware
├── components/
│   └── editor/
│       ├── theme-panel.tsx      # Main theme panel with tabs
│       ├── theme-presets.tsx    # Theme card selector
│       ├── color-customizer.tsx # Color palette editor
│       ├── font-picker.tsx      # Font selection UI
│       └── style-controls.tsx   # Border, shadow, blur controls
├── app/
│   └── globals.css              # Extended with theme CSS variables
└── fonts.ts                     # next/font/google exports
```

### Pattern 1: CSS Variables with Data Attributes
**What:** Define theme tokens as CSS variables, switch themes by changing a data attribute on root element
**When to use:** Always - this is the core theming mechanism
**Example:**
```css
/* globals.css - Source: Tailwind CSS v4 docs + shadcn/ui theming */
@import "tailwindcss";
@import "tw-animate-css";

/* Theme token bridge - @theme inline makes these available as utilities */
@theme inline {
  --color-theme-background: var(--theme-background);
  --color-theme-card-bg: var(--theme-card-bg);
  --color-theme-text: var(--theme-text);
  --color-theme-accent: var(--theme-accent);
  --color-theme-border: var(--theme-border);
  --color-theme-link: var(--theme-link);
  --font-theme-heading: var(--theme-font-heading);
  --font-theme-body: var(--theme-font-body);
  --radius-theme-card: var(--theme-border-radius);
  --shadow-theme-card: var(--theme-shadow);
}

/* Base theme (dark default per requirements) */
:root {
  --theme-background: oklch(0.145 0 0);
  --theme-card-bg: oklch(0.205 0 0);
  --theme-text: oklch(0.985 0 0);
  --theme-accent: oklch(0.7 0.15 250);
  --theme-border: oklch(1 0 0 / 10%);
  --theme-link: oklch(0.7 0.2 250);
  --theme-font-heading: var(--font-geist-sans);
  --theme-font-body: var(--font-geist-sans);
  --theme-border-radius: 0.75rem;
  --theme-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --theme-blur-intensity: 16px;
}

/* Mac OS Theme */
[data-theme="mac-os"] {
  --theme-card-bg: oklch(0.25 0.01 250);
  --theme-border: oklch(0.4 0.02 250);
  --theme-border-radius: 0.625rem;
  --theme-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.3), 0 4px 6px -2px rgb(0 0 0 / 0.2);
}

/* Sleek Modern Theme */
[data-theme="sleek-modern"] {
  --theme-card-bg: oklch(1 0 0 / 8%);
  --theme-border: oklch(1 0 0 / 15%);
  --theme-border-radius: 1rem;
  --theme-shadow: none;
}
```

### Pattern 2: Theme Store with Persist Middleware
**What:** Zustand store managing theme state, persisted to localStorage
**When to use:** For all theme state - selected theme, color overrides, font choices
**Example:**
```typescript
// src/stores/theme-store.ts - Source: Zustand persist docs
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ThemeState {
  themeId: 'mac-os' | 'sleek-modern' | 'instagram-reels'
  paletteId: string | null  // Selected preset palette, null if custom
  colors: {
    background: string
    cardBg: string
    text: string
    accent: string
    border: string
    link: string
  }
  fonts: {
    heading: string
    body: string
    headingSize: number  // rem multiplier
    bodySize: number
    headingWeight: 'normal' | 'bold'
  }
  style: {
    borderRadius: number  // px
    shadowEnabled: boolean
    blurIntensity: number  // 0-32
  }
  background: {
    type: 'solid' | 'image' | 'video'
    value: string  // color, URL, or video URL
  }

  // Actions
  setTheme: (themeId: ThemeState['themeId']) => void
  setPalette: (paletteId: string) => void
  setColor: (key: keyof ThemeState['colors'], value: string) => void
  setFont: (key: keyof ThemeState['fonts'], value: string | number) => void
  setStyle: (key: keyof ThemeState['style'], value: number | boolean) => void
  setBackground: (background: ThemeState['background']) => void
  resetToThemeDefaults: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeId: 'sleek-modern',
      paletteId: 'default',
      colors: { /* defaults */ },
      fonts: { /* defaults */ },
      style: { /* defaults */ },
      background: { type: 'solid', value: '#0a0a0a' },

      setTheme: (themeId) => {
        const defaults = getThemeDefaults(themeId)
        set({ themeId, ...defaults })
      },
      // ... other actions
    }),
    {
      name: 'linklobby-theme',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        themeId: state.themeId,
        paletteId: state.paletteId,
        colors: state.colors,
        fonts: state.fonts,
        style: state.style,
        background: state.background,
      }),
    }
  )
)
```

### Pattern 3: Dynamic CSS Variable Injection
**What:** Apply theme colors from Zustand state to CSS variables on the document
**When to use:** In a ThemeApplicator component at root level
**Example:**
```typescript
// src/components/theme-applicator.tsx
'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/stores/theme-store'

export function ThemeApplicator({ children }: { children: React.ReactNode }) {
  const { themeId, colors, fonts, style, background } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement

    // Set theme attribute for base theme styles
    root.setAttribute('data-theme', themeId)

    // Apply color overrides
    root.style.setProperty('--theme-background', colors.background)
    root.style.setProperty('--theme-card-bg', colors.cardBg)
    root.style.setProperty('--theme-text', colors.text)
    root.style.setProperty('--theme-accent', colors.accent)
    root.style.setProperty('--theme-border', colors.border)
    root.style.setProperty('--theme-link', colors.link)

    // Apply font overrides
    root.style.setProperty('--theme-font-heading', fonts.heading)
    root.style.setProperty('--theme-font-body', fonts.body)

    // Apply style overrides
    root.style.setProperty('--theme-border-radius', `${style.borderRadius}px`)
    root.style.setProperty('--theme-blur-intensity', `${style.blurIntensity}px`)

  }, [themeId, colors, fonts, style])

  return <>{children}</>
}
```

### Pattern 4: Font Loading with next/font/google
**What:** Pre-load curated fonts at build time, expose as CSS variables
**When to use:** For all theme fonts
**Example:**
```typescript
// src/app/fonts.ts - Source: Next.js font docs
import {
  Inter,
  Poppins,
  Playfair_Display,
  Montserrat,
  Roboto,
  Open_Sans,
  Bebas_Neue,
  Oswald,
  Archivo_Black,
  Space_Grotesk,
  DM_Sans,
  Outfit,
  Plus_Jakarta_Sans,
  Sora,
  Urbanist,
} from 'next/font/google'

// Variable fonts (recommended)
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

// ... more fonts

// Export all font variables for layout
export const fontVariables = [
  inter.variable,
  poppins.variable,
  // ... all font variables
].join(' ')

// Font registry for UI
export const CURATED_FONTS = [
  { id: 'inter', name: 'Inter', variable: '--font-inter', category: 'sans' },
  { id: 'poppins', name: 'Poppins', variable: '--font-poppins', category: 'sans' },
  { id: 'playfair', name: 'Playfair Display', variable: '--font-playfair', category: 'serif' },
  // ... 15-20 total
] as const
```

### Anti-Patterns to Avoid
- **Inline styles for theming:** Use CSS variables, not React style props for theme colors
- **Re-rendering on every color change:** Debounce color picker updates, apply via CSS not state
- **Loading all Google Fonts:** Only load the curated 15-20, use subsets, use variable fonts when available
- **Animating backdrop-filter:** Causes performance issues; transition opacity instead
- **Using filter:blur() on positioned ancestors:** Breaks position:fixed children

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color picker | Custom HSL sliders | react-colorful | 2.8KB, handles all color models, accessible |
| Theme persistence | localStorage + useEffect | Zustand persist middleware | Handles hydration, SSR, rehydration edge cases |
| Font loading | @import in CSS | next/font/google | Self-hosted, no FOUT/FOIT, no layout shift |
| Dark mode toggle | Custom classList toggle | next-themes | Already installed, handles system preference, prevents flash |
| CSS variable reactivity | MutationObserver | CSS custom properties | Native browser feature, no JS needed for cascade |
| Video autoplay detection | Try/catch with play() | Intersection Observer + muted attribute | Browsers handle muted autoplay natively |

**Key insight:** The existing stack (Tailwind v4 + next-themes + Zustand) already provides 90% of what's needed. The main work is extending CSS variables and building the UI, not fighting with theme infrastructure.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch with Persisted Theme State
**What goes wrong:** Server renders with default theme, client hydrates with persisted theme, React throws hydration error
**Why it happens:** Zustand persist loads from localStorage after initial render
**How to avoid:** Use `skipHydration: true` in persist config, manually rehydrate after mount, or use CSS-only theming for initial render
**Warning signs:** Console errors about hydration mismatch, theme flash on page load

### Pitfall 2: backdrop-filter Performance on Mobile
**What goes wrong:** Janky scrolling, high battery drain, UI feels sluggish
**Why it happens:** backdrop-filter: blur() is GPU-intensive, especially with large areas or animations
**How to avoid:**
- Limit blur radius (8-16px max)
- Avoid animating blur values
- Use will-change: transform on blurred elements
- Test on real mobile devices
- Provide CSS @supports fallback
**Warning signs:** Low FPS in dev tools, device getting warm, users complaining about battery

### Pitfall 3: Video Background Autoplay Blocked
**What goes wrong:** Video doesn't play, shows black rectangle or poster
**Why it happens:** Browsers block autoplay for videos with audio or without user interaction
**How to avoid:**
- Always use `muted` attribute
- Always use `playsinline` for iOS
- Use `preload="metadata"` not `preload="auto"`
- Implement Intersection Observer to only play when visible
- Provide poster image as fallback
**Warning signs:** Video works in dev, fails in production; works on desktop, fails on mobile

### Pitfall 4: Font Loading Flash (FOUT/FOIT)
**What goes wrong:** Text renders in fallback font, then snaps to custom font
**Why it happens:** Font files not loaded before first paint
**How to avoid:** Use next/font/google which self-hosts and preloads fonts
**Warning signs:** Visible font swap on page load, layout shifts

### Pitfall 5: CSS Variable Specificity with Theme Overrides
**What goes wrong:** Theme colors don't apply, or wrong colors show
**Why it happens:** CSS specificity rules - inline styles beat CSS variables, :root may not be overridden
**How to avoid:**
- Use data attributes (`[data-theme="mac-os"]`) for specificity
- Apply inline style overrides via JavaScript to document.documentElement
- Don't use !important
**Warning signs:** Some components ignore theme, color changes don't propagate

### Pitfall 6: Color Contrast Accessibility
**What goes wrong:** Text unreadable on certain backgrounds, WCAG failures
**Why it happens:** User picks low-contrast color combinations with free picker
**How to avoid:**
- Provide pre-tested palette presets
- Add contrast ratio warning in color picker
- Test all palette combinations before shipping
**Warning signs:** Squinting to read text, accessibility audit failures

## Code Examples

Verified patterns from official sources:

### Color Picker with Popover
```typescript
// Source: react-colorful GitHub + shadcn/ui patterns
'use client'

import { HexColorPicker, HexColorInput } from 'react-colorful'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label: string
}

export function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium min-w-[80px]">{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-10 h-10 p-0 border-2"
            style={{ backgroundColor: color }}
          >
            <span className="sr-only">Pick color for {label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <HexColorPicker color={color} onChange={onChange} />
          <HexColorInput
            color={color}
            onChange={onChange}
            prefixed
            className="mt-2 w-full px-2 py-1 text-sm border rounded"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
```

### Mac OS Traffic Light Buttons
```typescript
// Source: CodePen examples + CSS Tricks
export function MacOSTrafficLights({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e14942]" />
      <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#dea123]" />
      <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1dad2b]" />
    </div>
  )
}

// Mac OS card wrapper with traffic lights
export function MacOSCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-theme-border bg-theme-card-bg shadow-theme-card overflow-hidden">
      {/* Title bar with traffic lights */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-b from-white/5 to-transparent border-b border-white/10">
        <MacOSTrafficLights />
      </div>
      {/* Content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}
```

### Glassmorphism Card (Sleek Modern Theme)
```typescript
// Source: MDN backdrop-filter docs + Josh W. Comeau's frosted glass article
export function GlassCard({
  children,
  blurIntensity = 16
}: {
  children: React.ReactNode
  blurIntensity?: number
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/20",
        "bg-white/10",
        "shadow-xl"
      )}
      style={{
        backdropFilter: `blur(${blurIntensity}px)`,
        WebkitBackdropFilter: `blur(${blurIntensity}px)`, // Safari
      }}
    >
      {children}
    </div>
  )
}

// CSS fallback for browsers without backdrop-filter
// In globals.css:
// @supports not (backdrop-filter: blur(1px)) {
//   .glass-card { background: rgba(0, 0, 0, 0.8); }
// }
```

### Video Background with Performance Optimization
```typescript
// Source: web.dev video performance + MDN autoplay guide
'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoBackgroundProps {
  src: string
  poster?: string
}

export function VideoBackground({ src, poster }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Autoplay blocked, show poster
          })
        } else {
          video.pause()
        }
      },
      { threshold: 0.25 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full object-cover"
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
    >
      {/* WebM first for smaller file size where supported */}
      <source src={src.replace('.mp4', '.webm')} type="video/webm" />
      <source src={src} type="video/mp4" />
    </video>
  )
}
```

### Theme-Aware Card Component
```typescript
// Example of card using theme CSS variables
export function ThemedCard({ card }: { card: Card }) {
  const { themeId } = useThemeStore()

  // Theme-specific wrapper components
  const CardWrapper = themeId === 'mac-os' ? MacOSCard :
                      themeId === 'sleek-modern' ? GlassCard :
                      BaseCard

  return (
    <CardWrapper>
      <div className="font-theme-heading text-theme-text">
        {card.title}
      </div>
      <div className="font-theme-body text-theme-text/70">
        {card.description}
      </div>
    </CardWrapper>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JavaScript config (tailwind.config.js) | CSS-first config (@theme directive) | Tailwind v4 (2024) | Themes defined entirely in CSS |
| System color-scheme detection | User-controlled themes | Design trend 2024+ | Artists control visitor experience |
| RGB/HSL colors | OKLCH color space | shadcn/ui 2024 | Better perceptual uniformity |
| @import for fonts | next/font/* | Next.js 13+ | Self-hosted, no FOUT |
| CSS-in-JS for theming | CSS custom properties | 2023+ | Better performance, standard CSS |

**Deprecated/outdated:**
- **tailwind.config.js theme extension**: Use @theme directive in CSS instead
- **react-color library**: Use react-colorful (13x smaller)
- **HSL for color manipulation**: OKLCH provides better perceptual results
- **webkit-backdrop-filter only**: Now supported unprefixed in Safari 17+

## Open Questions

Things that couldn't be fully resolved:

1. **Instagram Reels visual reference**
   - What we know: User mentioned "spread out" justified text style
   - What's unclear: Exact aesthetic without visual reference
   - Recommendation: Implement with letter-spacing + word-spacing controls, adjust when reference provided

2. **Circular gallery and game cards theme exemption**
   - What we know: Per CONTEXT.md, these cards stay fixed (don't adapt to theme)
   - What's unclear: Do they get ANY theme styling (border, shadow) or completely exempt?
   - Recommendation: Exempt from colors/fonts, but may inherit border-radius and shadow

3. **Per-card style override storage**
   - What we know: User wants global defaults + per-card overrides
   - What's unclear: How to store per-card overrides (in card.content? separate field?)
   - Recommendation: Add optional `styleOverrides` object to Card content, merge with theme at render

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) - @theme directive, CSS variable patterns
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) - next/font/google usage
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming) - CSS variable conventions, OKLCH colors
- [react-colorful GitHub](https://github.com/omgovich/react-colorful) - API, color formats, HexColorInput
- [MDN backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter) - Glass effects, browser support
- [web.dev Video Performance](https://web.dev/learn/performance/video-performance) - Autoplay, lazy loading

### Secondary (MEDIUM confidence)
- [Zustand Persist Docs](https://zustand.docs.pmnd.rs/middlewares/persist) - Middleware API
- [Josh W. Comeau Frosted Glass](https://www.joshwcomeau.com/css/backdrop-filter/) - Performance tips
- [simonswiss Tailwind v4 Multi-Theme](https://simonswiss.com/posts/tailwind-v4-multi-theme) - Theme switching patterns
- [Glassmorphism 2026 Guide](https://invernessdesignstudio.com/glassmorphism-what-it-is-and-how-to-use-it-in-2026) - Current best practices

### Tertiary (LOW confidence)
- [CodePen Mac OS Traffic Lights](https://codepen.io/atdrago/pen/yezrBR) - Visual reference only
- Instagram Reels typography - No authoritative source found; implement based on general letter-spacing patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All core libraries verified in official docs
- Architecture: HIGH - Patterns verified in Tailwind v4 and Next.js docs
- Pitfalls: HIGH - Documented in MDN and verified via multiple sources
- Mac OS theme: MEDIUM - CSS implementation verified, exact styling is design judgment
- Instagram Reels theme: LOW - Awaiting visual reference from user

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days - stable domain)
