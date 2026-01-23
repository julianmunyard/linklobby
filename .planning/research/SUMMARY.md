# Project Research Summary

**Project:** LinkLobby - Artist-focused Link-in-Bio Platform
**Domain:** Creator tools / Link-in-bio SaaS
**Researched:** 2026-01-23
**Confidence:** HIGH

## Executive Summary

LinkLobby is a link-in-bio platform targeting independent musicians, producers, and DJs. The key insight from research is that this domain is commoditized at the feature level (Linktree, Beacons, Carrd all offer similar basics), but differentiation is achievable through **audio-native features** (embedded players with styled skins, varispeed, reverb) and **distinct visual themes** (frosted glass, sleek modern) that feel like album artwork rather than marketing templates. The recommended approach uses Next.js 16 with App Router, shadcn/ui for the dashboard, Tailwind CSS v4 for theming via CSS variables, Supabase for auth/database/storage, and Superpowered for audio DSP.

The primary architectural pattern is a split-screen dashboard editor with live preview via iframe, where all edits are managed in Zustand stores client-side until explicit save. Public pages use ISR with on-demand revalidation for fast visitor experience. The theme system leverages CSS custom properties rather than React Context to avoid re-renders on theme switch. This architecture supports the core "magic moment" - when an artist applies a theme and sees their audio player styled as an OP-1 or vinyl record.

Key risks are: (1) audio features blocking core delivery - the Web Audio API has significant cross-browser issues, so audio must be phased as enhancement, not foundation; (2) state sync storms in the live preview causing laggy editing - requires debounced state updates and fine-grained Zustand subscriptions from day one; (3) Supabase Realtime reliability - subscriptions can silently drop, so persistence must use explicit save, not realtime sync. Budget 2-3x time for audio features and test on real mobile devices early.

## Key Findings

### Recommended Stack

The stack is optimized for three core experiences: a split-screen dashboard editor, a CSS variable-based theming system, and audio processing with varispeed/reverb. Next.js 16 provides App Router with RSC for the public page ISR, while the dashboard runs client-side rendered for optimal interactivity. shadcn/ui gives full control over component styling (critical for unique themes), and Tailwind v4's native `@theme` directive enables design tokens as CSS variables.

**Core technologies:**
- **Next.js 16**: Full-stack framework with App Router, Turbopack, ISR - industry standard for modern React apps
- **shadcn/ui + Radix**: Dashboard components with full styling control, WAI-ARIA compliant
- **Tailwind CSS v4**: Utility CSS with native CSS variable theming via `@theme` directive
- **Zustand + TanStack Query**: Client state (Zustand ~1kb) + server state (TanStack Query for caching)
- **Supabase**: Auth, PostgreSQL database, Storage with CDN, existing integration from Munyard Mixer
- **Superpowered SDK**: WebAssembly audio processing for varispeed and reverb (requires licensing contact)
- **react-resizable-panels**: Split-screen layout by Brian Vaughn (React core team)
- **dnd-kit**: Modern drag-and-drop (~10kb) for link reordering
- **Framer Motion**: UI animations, 12M+ monthly downloads

### Expected Features

**Must have (table stakes):**
- Unlimited links with drag-and-drop reordering
- Mobile-responsive design (90%+ traffic is mobile)
- Profile photo, header, bio, social icons
- Basic analytics (views, clicks, CTR)
- Custom colors, fast loading (<2s), HTTPS
- QR code generation for offline promotion

**Should have (differentiators):**
- Distinct theme system (Mac OS frosted glass, sleek modern) - core differentiator
- Embedded audio player with styled skins (OP-1, vinyl, waveform) - unique opportunity
- Live preview editor (side-by-side) - the "magic moment"
- Mobile preview toggle in editor
- Varispeed and reverb controls - novel, no competitor has this

**Defer (v2+):**
- Custom domains (standard upsell)
- Advanced analytics (geographic, referrer)
- Email collection (integration complexity)
- Tour dates integration (third-party APIs)
- Link scheduling (nice-to-have)
- Smart music links (auto-detect platforms)
- Merch integration (Shopify)

### Architecture Approach

The architecture separates the dashboard (CSR, highly interactive) from public pages (ISR, optimized for visitors). The dashboard uses Zustand stores to manage draft state, with both editor panel and preview iframe subscribing to the same store for instant updates without network round-trips. On explicit save, data writes to Supabase and triggers on-demand ISR revalidation of the public page.

**Major components:**
1. **Dashboard Shell** - Layout, navigation, auth guard (Next.js App Router layout)
2. **Page Store (Zustand)** - Draft state for links, theme, settings; hasChanges tracking
3. **Editor Panel** - Tab switching (Links, Design, Insights), form controls
4. **Preview Panel** - Iframe rendering `/preview` route, same store subscription
5. **Theme Engine** - CSS variable generation, `data-theme` attribute switching
6. **Public Page** - ISR-rendered artist page at `/[username]`
7. **Media Service** - Upload processing with Vercel Blob or Supabase Storage
8. **Audio Engine** - Superpowered integration for varispeed/reverb (client-side only)

### Critical Pitfalls

1. **Live preview state sync storms** - Debounce input changes (150-300ms), use fine-grained Zustand subscriptions, separate form state from preview state. Address in Phase 1.

2. **Theme abstraction explosion** - Start with 10-15 core tokens maximum. Three-layer max: primitives -> semantic -> component. Let real usage drive token creation. Address in Phase 2.

3. **Audio blocking core functionality** - Web Audio API has cross-browser issues, AudioWorklet causes "massive distortion across all mobile devices." Ship core link-in-bio first, phase audio as enhancement. Address in Phase 4+.

4. **Supabase Realtime reliability** - Subscriptions silently drop on tab focus loss, sleep, network issues. Use explicit save as persistence mechanism, show "last saved" timestamp. Address in Phase 1.

5. **Mobile responsive afterthought** - 60%+ of visitors are mobile. Build mobile-first preview from day 1, include device frame toggle, test on real devices. Address in Phase 1.

6. **Missing image optimization** - Supabase Storage serves raw files. Implement client-side resize before upload, use Image Transformations, configure custom Next.js image loader. Address in Phase 3.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation
**Rationale:** State architecture, preview pattern, and auth must be established before building features. Pitfalls research shows these are "hard to change later" decisions.
**Delivers:** Project scaffolding, Supabase schema (profiles, pages, links), auth flow, Zustand stores with debounced state sync, iframe preview route, unsaved changes guard, mobile preview toggle.
**Addresses:** Table stakes foundation, basic profile
**Avoids:** State sync storms, Realtime reliability issues, mobile afterthought

### Phase 2: Editor Core
**Rationale:** The dashboard editor is the creator-facing product. Split-screen with live preview is the "magic moment" that differentiates the experience.
**Delivers:** Dashboard layout (sidebar + preview area), editor tabs structure, Links tab with CRUD and drag-drop reordering, basic link rendering on preview.
**Uses:** shadcn/ui, react-resizable-panels, dnd-kit
**Implements:** Iframe preview synchronization pattern, save/discard flow

### Phase 3: Theme System
**Rationale:** Themes are a core differentiator. Architecture research shows CSS variable approach enables fast switching without React re-renders.
**Delivers:** Theme token system with 10-15 core variables, Design tab with theme selection, Mac OS frosted glass theme, Sleek Modern theme, color customization.
**Uses:** Tailwind v4 @theme, CSS custom properties, next-themes
**Avoids:** Theme abstraction explosion

### Phase 4: Public Page
**Rationale:** After editor works, public pages need ISR optimization for visitor experience. This validates the full save -> publish flow.
**Delivers:** Dynamic `/[username]` route with ISR, on-demand revalidation API, meta tags for social sharing, performance optimization (<2s load).
**Implements:** ISR with on-demand revalidation pattern

### Phase 5: Media
**Rationale:** Image uploads add polish but require careful optimization to avoid performance traps identified in pitfalls research.
**Delivers:** Logo upload with client-side resize, background options (color, image, video), media CDN pipeline, logo positioning and animation options.
**Uses:** Supabase Storage, sharp, browser-image-compression
**Avoids:** Missing image optimization pitfall

### Phase 6: Analytics
**Rationale:** Analytics is table stakes but can be built incrementally. Basic tracking validates user engagement before advanced features.
**Delivers:** View/click event tracking, Insights tab with basic metrics, visitor geographic data (anonymized, GDPR-compliant).
**Avoids:** No consent flow pitfall

### Phase 7: Audio
**Rationale:** Audio is the unique differentiator but has highest risk. Research shows significant browser compatibility issues. Deferring ensures core product ships regardless of audio complexity.
**Delivers:** Audio upload with ffmpeg.wasm conversion, basic player (play/pause), player style selection (waveform, vinyl, OP-1), varispeed control, reverb effect.
**Uses:** Superpowered SDK, @ffmpeg/ffmpeg
**Avoids:** Audio blocking core functionality pitfall

### Phase Ordering Rationale

- **Foundation before features:** State architecture, preview pattern, and persistence model are foundational. Pitfalls research explicitly warns these are "hard to change later."
- **Editor before public page:** Creators must be able to build pages before optimizing visitor experience. Editor is the product for users; public page is the output.
- **Themes before media:** Themes are higher differentiation value than media uploads. CSS variable architecture enables media styling later.
- **Analytics before audio:** Analytics is table stakes expected by users. Audio is a differentiator but has 2-3x time risk.
- **Audio last:** Highest complexity, highest risk, but optional for core value prop. Can ship meaningful product without it.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 7 (Audio):** Superpowered licensing costs unknown, browser compatibility requires real device testing, varispeed implementation details sparse
- **Phase 5 (Media):** Video background performance implications, ffmpeg.wasm bundle size management

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Supabase auth, Zustand patterns well-documented
- **Phase 2 (Editor):** shadcn/ui, dnd-kit, react-resizable-panels all have comprehensive docs
- **Phase 4 (Public Page):** Next.js ISR patterns are mature and well-documented
- **Phase 6 (Analytics):** Standard event tracking, Supabase queries

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js 16, shadcn/ui, Tailwind v4, Supabase all verified via official docs |
| Features | HIGH | Competitor analysis across Linktree, Beacons, Carrd, Feature.fm |
| Architecture | HIGH | Patterns verified with official Next.js, Supabase, Zustand documentation |
| Pitfalls | HIGH | Verified via official docs, GitHub issues, community discussions |

**Overall confidence:** HIGH

### Gaps to Address

- **Superpowered licensing:** Cost is case-by-case. Contact licensing@superpowered.com early in Phase 7 planning. Have Tone.js as fallback.
- **ffmpeg.wasm bundle size:** Audio-only build claimed to be 5MB but needs validation. May require lazy loading strategy.
- **Video background performance:** Not fully researched. May need to limit to premium tier or implement performance detection.
- **Third theme design:** Mac OS and Sleek Modern defined, but a third theme TBD. Consider artist input during Phase 3.

## Sources

### Primary (HIGH confidence)
- [Next.js Documentation](https://nextjs.org/docs) - App Router, ISR, Image component
- [shadcn/ui](https://ui.shadcn.com/) - Component library patterns
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4) - @theme directive, CSS variables
- [Supabase Docs](https://supabase.com/docs) - Auth, Storage, Realtime, RLS
- [Superpowered Integration Guide](https://docs.superpowered.com/getting-started/how-to-integrate/?lang=js) - Audio SDK
- [dnd-kit Documentation](https://docs.dndkit.com) - Drag-and-drop
- [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) - Split layout

### Secondary (MEDIUM confidence)
- [Linktree Pricing & Features](https://linktr.ee/s/pricing) - Competitor analysis
- [Beacons for Musicians](https://beacons.ai/i/musicians) - Competitor analysis
- [Feature.fm Smart Links](https://www.feature.fm/solutions/links) - Music-native competitor
- [Zustand vs Jotai comparison](https://makersden.io/blog/react-state-management-in-2025) - State management
- [React Hook Form + Zod](https://wasp.sh/blog/2025/01/22/advanced-react-hook-form-zod-shadcn) - Form validation
- [Supabase Realtime Issues](https://github.com/orgs/supabase/discussions/5641) - Reliability concerns

### Tertiary (LOW confidence, needs validation)
- ffmpeg.audio.wasm specific build sizes - verify during Phase 7
- Superpowered licensing terms - contact vendor during Phase 7 planning
- Video background performance impact - validate during Phase 5

---
*Research completed: 2026-01-23*
*Ready for roadmap: yes*
