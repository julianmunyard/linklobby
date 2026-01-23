# Technology Stack

**Project:** LinkLobby - Artist-focused Link-in-Bio Platform
**Researched:** 2026-01-23
**Overall Confidence:** HIGH

## Executive Summary

LinkLobby requires a modern React stack optimized for three core experiences: (1) a split-screen dashboard editor with live preview, (2) a theming system with frosted glass and flat design variants, and (3) audio processing with varispeed/reverb via Superpowered. The recommended stack leverages Next.js 16 with App Router, shadcn/ui + Radix for the dashboard, Tailwind CSS v4 for theming, and Supabase for auth/storage/realtime.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Next.js** | 16.1.4 | Full-stack React framework | App Router with RSC, Turbopack for fast builds, native Supabase integration, Vercel deployment path. Industry standard for 2025-2026. | HIGH |
| **React** | 19.x | UI library | Required by Next.js 16. Concurrent rendering benefits live preview performance. | HIGH |
| **TypeScript** | 5.x | Type safety | Non-negotiable for a project this size. Type inference with Zod schemas. | HIGH |

**Why Next.js over alternatives:**
- Remix: Good, but Next.js has better ecosystem for component libraries (shadcn/ui designed for it)
- Astro: Better for content-heavy sites, not interactive dashboards
- Vite + React: Viable but loses SSR/ISR benefits for public bio pages

### UI Component Libraries

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **shadcn/ui** | latest | Dashboard components | Copy-paste approach gives full control. Built on Radix + Tailwind. 70+ components including sidebar, tabs, forms, dialogs. Perfect for dashboard UIs. | HIGH |
| **Radix UI** | latest | Primitive components | Underlying primitives for shadcn. WAI-ARIA compliant, unstyled, composable. | HIGH |
| **Tremor** | latest | Analytics/charts | 35+ dashboard-focused components. Now Vercel-owned, free under MIT. Built on Recharts + Radix. Ideal for analytics views if needed. | MEDIUM |

**Why shadcn/ui over alternatives:**
- MUI (Material UI): Opinionated design, harder to customize for unique themes
- Chakra UI: Good but less momentum in 2025, shadcn has become the standard
- Ant Design: Heavy, enterprise-focused, not suited for creative/artist tools

### Dashboard-Specific Libraries

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **react-resizable-panels** | latest | Split-screen layout | By Brian Vaughn (React core team). Accessible, supports collapse/snap, layout persistence. Perfect for editor + preview split. | HIGH |
| **@dnd-kit/core** | latest | Drag-and-drop | Modern, lightweight (~10kb), modular. Supports sortable lists, keyboard accessibility. For reordering links/blocks. | HIGH |
| **@dnd-kit/sortable** | latest | Sortable lists | Preset for common sortable patterns. Works with vertical/horizontal lists. | HIGH |

**Why react-resizable-panels:**
- Split.js: Works but less React-native, older patterns
- react-split-pane: Unmaintained
- Custom CSS Grid: More work, accessibility concerns

### Styling & Theming

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Tailwind CSS** | 4.x | Utility CSS | v4 has native CSS variable theming via `@theme` directive. Design tokens become CSS variables automatically. P3 color palette for vibrant colors. | HIGH |
| **CSS Variables** | native | Theme switching | Browser-native, no JS re-renders on theme switch. Works with `[data-theme]` selectors. Better performance than React Context for theming. | HIGH |

**Theme System Architecture:**
```css
/* Tailwind v4 approach */
@theme {
  --color-primary: var(--primary);
  --color-surface: var(--surface);
  --blur-glass: var(--glass-blur);
}

@layer base {
  :root, [data-theme="modern"] {
    --primary: oklch(70% 0.15 250);
    --surface: oklch(98% 0.01 250);
    --glass-blur: 0px;
  }

  [data-theme="frosted"] {
    --primary: oklch(75% 0.12 280);
    --surface: oklch(100% 0 0 / 0.7);
    --glass-blur: 20px;
  }
}
```

**Why Tailwind v4:**
- CSS-in-JS (styled-components, Emotion): Runtime overhead, worse for SSR
- CSS Modules: Fine but loses utility-first speed
- Tailwind v3: Still works but v4's native CSS variable support is perfect for theming

### Animation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Framer Motion** | 12.x | UI animations | Industry standard for React animation. Layout animations, gestures, scroll-linked animations. 12M+ monthly downloads. | HIGH |

**Why Framer Motion:**
- React Spring: Good but Framer Motion has better DX and more features
- GSAP: Powerful but not React-native, overkill for UI transitions
- CSS animations: Limited for complex sequences

### State Management

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Zustand** | 5.x | Client state | ~1kb, minimal boilerplate, works great with React 19. For UI state (modal open, selected theme, editor state). | HIGH |
| **TanStack Query** | 5.x | Server state | De facto standard for async state. Caching, background refetch, optimistic updates. For fetching user data, links, themes. | HIGH |

**Why this combination:**
- Zustand for client state (theme, UI): Simple, fast, no provider nesting
- TanStack Query for server state (links, profiles): Purpose-built for async data
- NOT Redux: Overkill, unnecessary boilerplate for this project size
- NOT Jotai: Good for fine-grained reactivity but Zustand simpler for this use case

### Forms & Validation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **React Hook Form** | 7.x | Form handling | Minimal re-renders, great performance, works with shadcn/ui Form component. | HIGH |
| **Zod** | 3.x | Schema validation | Type inference (`z.infer<typeof schema>`), works on client and server. Pairs perfectly with RHF via `@hookform/resolvers`. | HIGH |
| **@hookform/resolvers** | latest | RHF + Zod bridge | Official resolver for Zod integration. | HIGH |

### Backend & Database

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Supabase** | latest | BaaS | Already have Auth from Munyard Mixer. Includes: Auth, Database (Postgres), Storage, Realtime, Edge Functions. | HIGH |
| **Supabase Auth** | latest | Authentication | Already integrated. Extend for LinkLobby users. | HIGH |
| **Supabase Storage** | latest | File storage | Image upload with on-the-fly transformations. Global CDN (285 cities). Supports resumable uploads (TUS). | HIGH |
| **Supabase Realtime** | latest | Live updates | Broadcast for live preview sync (if needed). Presence for future collaboration features. | MEDIUM |

**Why Supabase:**
- Firebase: Viable but Supabase has native Postgres, better for relational data
- PlanetScale: Good DB but no auth/storage, more to integrate
- Convex: Interesting but newer, less battle-tested

### Audio Processing

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **@superpoweredsdk/web** | 2.7.2 | Audio effects | AdvancedAudioPlayer with TimeStretching class for varispeed. Reverb class for reverb effect. WebAssembly performance, runs in AudioWorklet. | MEDIUM |

**Superpowered Key Classes:**
- `AdvancedAudioPlayer`: Main player class with `timeStretching` property
  - `playbackRate`: Speed control (varispeed)
  - `pitchShiftCents`: -2400 to +2400 (two octaves)
- `Reverb`: CPU-friendly reverb
  - `mix`: Dry/wet balance
  - `roomSize`: Decay time
  - `damping`: High frequency absorption

**Licensing Note:** Superpowered JS/WASM SDK requires case-by-case licensing (contact licensing@superpowered.com). Budget for this.

**Why Superpowered:**
- Web Audio API alone: Can do basic playback but varispeed/reverb requires custom DSP
- Tone.js: Good but Superpowered has better time-stretching quality
- Howler.js: No DSP effects, just playback

### Media Processing

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **sharp** | latest | Image processing | Server-side image resize/optimize. 4-5x faster than ImageMagick. Required by Next.js Image Optimization. | HIGH |
| **@ffmpeg/ffmpeg** | latest | Audio conversion | Browser-side audio transcoding. Convert uploads to consistent format before storage. | MEDIUM |
| **ffmpeg.audio.wasm** | latest | Audio-only FFmpeg | 5MB (vs 20MB full FFmpeg). For converting audio uploads to MP3/Opus. | MEDIUM |

**Media Processing Strategy:**
1. Images: Upload to Supabase Storage, use on-the-fly transformations for thumbnails
2. Audio: Client-side convert to MP3 using ffmpeg.audio.wasm, then upload to Supabase Storage
3. Video embeds: Use oEmbed/iframe, don't process video ourselves

---

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **clsx** | latest | Conditional classes | Combining Tailwind classes conditionally |
| **tailwind-merge** | latest | Class deduplication | Merging Tailwind classes without conflicts |
| **date-fns** | latest | Date formatting | If needed for analytics/timestamps |
| **lucide-react** | latest | Icons | Pairs with shadcn/ui, tree-shakeable |
| **sonner** | latest | Toast notifications | Simple, accessible toasts. shadcn uses this. |
| **next-themes** | latest | Theme persistence | Handles localStorage, system preference, flash prevention |
| **@supabase/ssr** | latest | Supabase SSR helpers | Proper cookie handling in Next.js App Router |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 16 | Remix | Less shadcn/ui integration, smaller ecosystem |
| UI Library | shadcn/ui | MUI | Too opinionated, harder to achieve unique themes |
| State | Zustand | Redux Toolkit | Overkill for project size, more boilerplate |
| Styling | Tailwind v4 | CSS-in-JS | Runtime overhead, worse SSR performance |
| Animation | Framer Motion | React Spring | Framer has better DX, more features |
| Forms | React Hook Form | Formik | RHF has better performance, less re-renders |
| Drag/Drop | dnd-kit | react-beautiful-dnd | rbdnd unmaintained, dnd-kit is successor |
| Audio | Superpowered | Tone.js | Superpowered has better time-stretching |

---

## Installation

```bash
# Core
npx create-next-app@latest linklobby --typescript --tailwind --eslint --app --src-dir

# UI Components (shadcn/ui - run in project root)
npx shadcn@latest init
npx shadcn@latest add button card dialog form input label tabs sidebar

# State & Data
npm install zustand @tanstack/react-query

# Forms
npm install react-hook-form zod @hookform/resolvers

# Layout & DnD
npm install react-resizable-panels @dnd-kit/core @dnd-kit/sortable

# Animation
npm install framer-motion

# Utilities
npm install clsx tailwind-merge lucide-react sonner next-themes

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Media Processing
npm install sharp
npm install @ffmpeg/ffmpeg @ffmpeg/util

# Audio (specific version required)
npm install @superpoweredsdk/web@2.7.2

# Dev Dependencies
npm install -D @types/node
```

---

## Architecture Implications

### Live Preview Pattern

For the split-screen editor with live preview, use this pattern:

```typescript
// Editor state in Zustand
const useEditorStore = create<EditorState>((set) => ({
  links: [],
  theme: 'modern',
  updateLink: (id, data) => set((state) => ({
    links: state.links.map(l => l.id === id ? { ...l, ...data } : l)
  })),
}));

// Both panels read from same store
// No network round-trip, instant updates
function EditorPanel() {
  const { links, updateLink } = useEditorStore();
  // Edit controls
}

function PreviewPanel() {
  const { links, theme } = useEditorStore();
  // Render preview using same data
}
```

### Theme System Pattern

```typescript
// next-themes handles persistence
// CSS variables handle actual styling
// No React re-renders on theme switch

// ThemeProvider setup
<ThemeProvider attribute="data-theme" defaultTheme="modern">
  {children}
</ThemeProvider>

// Theme switcher
const { setTheme } = useTheme();
setTheme('frosted'); // Changes data-theme attribute
// CSS variables automatically apply
```

### Audio Player Pattern

```typescript
// Superpowered in AudioWorklet
const player = new Superpowered.AdvancedAudioPlayer(
  sampleRate,
  Superpowered.AdvancedAudioPlayerSettings_Default
);

player.timeStretching = true;
player.playbackRate = 1.0; // 0.5 = half speed, 2.0 = double
player.pitchShiftCents = 0; // -2400 to +2400

// Reverb as separate processor
const reverb = new Superpowered.Reverb(sampleRate);
reverb.enabled = true;
reverb.mix = 0.3;
reverb.roomSize = 0.5;
```

---

## Risk Assessment

| Technology | Risk | Mitigation |
|------------|------|------------|
| Superpowered licensing | Unknown cost, case-by-case | Contact early, have Tone.js as fallback |
| Tailwind v4 | Newer, less community examples | Can fall back to v3 patterns if needed |
| ffmpeg.wasm | Large bundle, requires SharedArrayBuffer | Use audio-only build (5MB), lazy load |
| Next.js 16 | Newest major version | Well-documented, stable App Router |

---

## Sources

### Official Documentation (HIGH Confidence)
- [Next.js Documentation](https://nextjs.org/docs) - Version 16.1.4 confirmed
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4) - Theme variables
- [Supabase Storage](https://supabase.com/docs/guides/storage) - Upload processing
- [Superpowered Integration Guide](https://docs.superpowered.com/getting-started/how-to-integrate/?lang=js) - Version 2.7.2
- [dnd-kit Documentation](https://docs.dndkit.com) - Sortable preset
- [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) - Split layout

### WebSearch Verified (MEDIUM Confidence)
- [Tremor acquisition by Vercel](https://vercel.com/blog/vercel-acquires-tremor) - Free under MIT
- [Zustand vs Jotai comparison](https://makersden.io/blog/react-state-management-in-2025) - State management
- [React Hook Form + Zod](https://wasp.sh/blog/2025/01/22/advanced-react-hook-form-zod-shadcn) - Form validation
- [CSS Variables over Context](https://www.epicreact.dev/css-variables) - Kent C. Dodds recommendation

### Low Confidence (Needs Validation in Development)
- ffmpeg.audio.wasm specific build sizes
- Superpowered licensing terms and cost
- Exact Framer Motion v12 features
