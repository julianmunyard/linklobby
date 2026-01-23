# Architecture Research

**Domain:** Link-in-bio platform with real-time editor
**Researched:** 2026-01-23
**Confidence:** HIGH (patterns verified with official docs and multiple sources)

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┐  ┌─────────────────────────────────────┐   │
│  │      Dashboard (CSR)        │  │       Public Page (ISR/SSR)         │   │
│  │  ┌─────────┬─────────────┐  │  │  ┌─────────────────────────────┐   │   │
│  │  │ Editor  │   Preview   │  │  │  │  Themed Artist Page         │   │   │
│  │  │ Panel   │   Panel     │  │  │  │  (linklobby.com/username)   │   │   │
│  │  │ (Tabs)  │   (Iframe)  │  │  │  └─────────────────────────────┘   │   │
│  │  └─────────┴─────────────┘  │  └─────────────────────────────────────┘   │
│  └─────────────────────────────┘                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                           STATE MANAGEMENT LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐    │
│  │  Page Store    │  │  UI Store      │  │  Auth Store (Supabase)     │    │
│  │  (Zustand)     │  │  (Zustand)     │  │                            │    │
│  │  - links[]     │  │  - activeTab   │  │  - user                    │    │
│  │  - theme       │  │  - previewMode │  │  - session                 │    │
│  │  - settings    │  │  - hasChanges  │  │                            │    │
│  │  - audio       │  │  - isSaving    │  │                            │    │
│  └────────────────┘  └────────────────┘  └────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│                           SERVICE LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Page Service │  │ Media Service│  │ Theme Service│  │Audio Service │   │
│  │ (CRUD)       │  │ (Upload)     │  │ (CSS Vars)   │  │ (Superpowered)│   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                           DATA LAYER                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌────────────────┐   │
│  │ Supabase (PostgreSQL)│  │ Vercel Blob / R2     │  │ Edge Cache     │   │
│  │ - profiles           │  │ - images             │  │ (CDN)          │   │
│  │ - pages              │  │ - audio              │  │                │   │
│  │ - links              │  │ - backgrounds        │  │                │   │
│  │ - analytics          │  │                      │  │                │   │
│  └──────────────────────┘  └──────────────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| **Dashboard Shell** | Layout, navigation, auth guard | Next.js App Router layout |
| **Editor Panel** | Tab switching, form controls | Client components with Zustand |
| **Preview Panel** | Live preview rendering | Iframe embedding public page route |
| **Public Page** | Artist's public-facing page | ISR page with theme application |
| **Page Store** | Draft state, links, theme, settings | Zustand store (client-side) |
| **UI Store** | Transient UI state (tabs, modals) | Zustand store (client-side) |
| **Theme Engine** | CSS variable generation, theme switching | CSS custom properties + JS |
| **Media Service** | Upload, process, CDN delivery | Server Actions + Vercel Blob |
| **Audio Engine** | Playback with varispeed/reverb | Superpowered Audio API (client) |

## Recommended Project Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Auth route group
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx             # Auth layout (centered card)
│   ├── (dashboard)/               # Dashboard route group
│   │   ├── editor/
│   │   │   ├── page.tsx           # Main editor page
│   │   │   ├── layout.tsx         # Dashboard layout (sidebar + header)
│   │   │   └── _components/       # Editor-specific components
│   │   │       ├── EditorPanel.tsx
│   │   │       ├── PreviewPanel.tsx
│   │   │       ├── LinksTab.tsx
│   │   │       ├── DesignTab.tsx
│   │   │       └── InsightsTab.tsx
│   │   └── settings/page.tsx      # Account settings
│   ├── [username]/                # Dynamic public page route
│   │   └── page.tsx               # ISR public page
│   ├── preview/                   # Preview route (for iframe)
│   │   └── page.tsx               # Same render as public, reads from store
│   ├── api/                       # API routes (if needed)
│   │   └── revalidate/route.ts    # On-demand ISR revalidation
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page
│
├── components/                    # Shared components
│   ├── ui/                        # Base UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   └── Card.tsx
│   ├── page/                      # Public page components
│   │   ├── LinkCard.tsx
│   │   ├── AudioPlayer.tsx
│   │   ├── Logo.tsx
│   │   └── Background.tsx
│   └── editor/                    # Editor-specific shared components
│       ├── ColorPicker.tsx
│       ├── LinkEditor.tsx
│       └── ThemeSelector.tsx
│
├── stores/                        # Zustand stores
│   ├── pageStore.ts               # Page content state
│   ├── uiStore.ts                 # UI/editor state
│   └── types.ts                   # Store types
│
├── services/                      # Business logic
│   ├── page.ts                    # Page CRUD operations
│   ├── media.ts                   # Media upload/processing
│   ├── analytics.ts               # Analytics tracking
│   └── audio.ts                   # Audio processing
│
├── lib/                           # Utilities and config
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client
│   │   └── middleware.ts          # Auth middleware
│   ├── themes/
│   │   ├── tokens.ts              # Design token definitions
│   │   ├── macos.ts               # Mac OS theme
│   │   ├── sleek.ts               # Sleek Modern theme
│   │   └── utils.ts               # Theme utilities
│   └── utils/
│       ├── cn.ts                  # Class name utility
│       └── debounce.ts            # Debounce utility
│
├── hooks/                         # Custom React hooks
│   ├── usePageData.ts             # Load/save page data
│   ├── usePreview.ts              # Preview synchronization
│   ├── useUnsavedChanges.ts       # Track dirty state
│   └── useAudioPlayer.ts          # Audio player controls
│
├── types/                         # TypeScript types
│   ├── page.ts                    # Page/link types
│   ├── theme.ts                   # Theme types
│   └── database.ts                # Supabase generated types
│
└── styles/                        # Global styles
    ├── globals.css                # Base styles, CSS variables
    └── themes.css                 # Theme-specific CSS
```

### Structure Rationale

- **`app/(dashboard)/editor/_components/`**: Colocate editor-specific components with the route that uses them. Prefixed with `_` to exclude from routing.
- **`components/page/`**: Public page components shared between `[username]/page.tsx` and `preview/page.tsx`.
- **`stores/`**: Zustand stores separate from components for clean imports and testing.
- **`lib/themes/`**: Theme definitions as JS objects for type safety, exported as CSS variables.
- **Route groups `(auth)` and `(dashboard)`**: Separate layouts without affecting URL structure.

## Architectural Patterns

### Pattern 1: Iframe Preview Synchronization

**What:** Editor and preview communicate via shared state, with preview rendered in an iframe.

**When to use:** Real-time preview where editor changes appear immediately.

**Trade-offs:**
- PRO: True isolation, preview renders exactly like production
- PRO: Can switch between mobile/desktop viewport easily
- CON: State sync requires careful handling
- CON: Slight overhead of iframe

**Example:**

```typescript
// stores/pageStore.ts
import { create } from 'zustand'
import type { PageData, Link } from '@/types/page'

interface PageState {
  // Draft state (not yet saved)
  draft: PageData | null

  // Saved state (from database)
  saved: PageData | null

  // Computed
  hasChanges: boolean

  // Actions
  setDraft: (data: PageData) => void
  updateLink: (id: string, updates: Partial<Link>) => void
  reorderLinks: (fromIndex: number, toIndex: number) => void
  updateTheme: (theme: Partial<PageData['theme']>) => void
  save: () => Promise<void>
  discard: () => void
}

export const usePageStore = create<PageState>((set, get) => ({
  draft: null,
  saved: null,

  get hasChanges() {
    return JSON.stringify(get().draft) !== JSON.stringify(get().saved)
  },

  setDraft: (data) => set({ draft: data, saved: data }),

  updateLink: (id, updates) => set((state) => ({
    draft: state.draft ? {
      ...state.draft,
      links: state.draft.links.map(link =>
        link.id === id ? { ...link, ...updates } : link
      )
    } : null
  })),

  reorderLinks: (fromIndex, toIndex) => set((state) => {
    if (!state.draft) return state
    const links = [...state.draft.links]
    const [removed] = links.splice(fromIndex, 1)
    links.splice(toIndex, 0, removed)
    return { draft: { ...state.draft, links } }
  }),

  updateTheme: (theme) => set((state) => ({
    draft: state.draft ? {
      ...state.draft,
      theme: { ...state.draft.theme, ...theme }
    } : null
  })),

  save: async () => {
    const { draft } = get()
    if (!draft) return
    // Save to database via service
    await savePageData(draft)
    set({ saved: draft })
    // Trigger ISR revalidation
    await revalidatePage(draft.username)
  },

  discard: () => set((state) => ({ draft: state.saved }))
}))
```

```typescript
// Preview page reads from store OR from URL params for production
// app/preview/page.tsx (iframe preview route)
'use client'

import { usePageStore } from '@/stores/pageStore'
import { PublicPageRenderer } from '@/components/page/PublicPageRenderer'

export default function PreviewPage() {
  const draft = usePageStore((s) => s.draft)

  if (!draft) return <div>Loading preview...</div>

  return <PublicPageRenderer data={draft} isPreview={true} />
}
```

### Pattern 2: CSS Variable Theme System

**What:** Themes defined as design tokens, applied via CSS custom properties on a root element.

**When to use:** Multi-theme systems where entire visual language changes.

**Trade-offs:**
- PRO: Fast switching (no JS re-render, just CSS)
- PRO: Works with any CSS approach (Tailwind, CSS Modules, etc.)
- PRO: Inheritable through component tree
- CON: Need fallbacks for very old browsers

**Example:**

```typescript
// lib/themes/tokens.ts
export interface ThemeTokens {
  // Colors
  '--color-background': string
  '--color-surface': string
  '--color-text-primary': string
  '--color-text-secondary': string
  '--color-accent': string
  '--color-border': string

  // Effects
  '--surface-blur': string
  '--surface-opacity': string
  '--border-radius': string
  '--shadow': string

  // Typography
  '--font-family': string
  '--font-size-base': string
}

// lib/themes/macos.ts
import type { ThemeTokens } from './tokens'

export const macOSTheme: ThemeTokens = {
  '--color-background': 'transparent',
  '--color-surface': 'rgba(255, 255, 255, 0.7)',
  '--color-text-primary': '#1d1d1f',
  '--color-text-secondary': '#86868b',
  '--color-accent': '#0071e3',
  '--color-border': 'rgba(0, 0, 0, 0.1)',

  '--surface-blur': '20px',
  '--surface-opacity': '0.7',
  '--border-radius': '12px',
  '--shadow': '0 4px 24px rgba(0, 0, 0, 0.1)',

  '--font-family': '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
  '--font-size-base': '16px',
}

// lib/themes/sleek.ts
export const sleekTheme: ThemeTokens = {
  '--color-background': '#0a0a0a',
  '--color-surface': '#1a1a1a',
  '--color-text-primary': '#ffffff',
  '--color-text-secondary': '#888888',
  '--color-accent': '#ffffff',
  '--color-border': 'rgba(255, 255, 255, 0.1)',

  '--surface-blur': '0px',
  '--surface-opacity': '1',
  '--border-radius': '4px',
  '--shadow': 'none',

  '--font-family': '"Inter", system-ui, sans-serif',
  '--font-size-base': '15px',
}
```

```typescript
// lib/themes/utils.ts
import type { ThemeTokens } from './tokens'

export function applyTheme(tokens: ThemeTokens, element: HTMLElement = document.documentElement) {
  Object.entries(tokens).forEach(([property, value]) => {
    element.style.setProperty(property, value)
  })
}

export function generateThemeStyles(tokens: ThemeTokens): string {
  return Object.entries(tokens)
    .map(([property, value]) => `${property}: ${value};`)
    .join('\n')
}
```

```css
/* styles/themes.css - using the variables */
.link-card {
  background: var(--color-surface);
  backdrop-filter: blur(var(--surface-blur));
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  color: var(--color-text-primary);
}

/* Mac OS glassmorphism enhancement */
[data-theme="macos"] .link-card {
  background: rgba(255, 255, 255, var(--surface-opacity));
  -webkit-backdrop-filter: blur(var(--surface-blur));
}
```

### Pattern 3: ISR with On-Demand Revalidation

**What:** Public pages pre-rendered at build time, revalidated on save.

**When to use:** Public content that changes infrequently but must be fresh after edits.

**Trade-offs:**
- PRO: Instant load times for visitors (served from CDN)
- PRO: Fresh content after artist saves
- PRO: Low server load (not rendering on every request)
- CON: Requires webhook/API call on save

**Example:**

```typescript
// app/[username]/page.tsx
import { notFound } from 'next/navigation'
import { getPageByUsername } from '@/services/page'
import { PublicPageRenderer } from '@/components/page/PublicPageRenderer'

interface Props {
  params: Promise<{ username: string }>
}

// ISR: revalidate on-demand when artist saves
export const revalidate = false // Disable time-based revalidation

export async function generateStaticParams() {
  // Optionally pre-generate popular pages at build
  return []
}

export default async function PublicPage({ params }: Props) {
  const { username } = await params
  const pageData = await getPageByUsername(username)

  if (!pageData) {
    notFound()
  }

  return <PublicPageRenderer data={pageData} isPreview={false} />
}
```

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { username } = await request.json()

  // Verify user owns this page
  const { data: page } = await supabase
    .from('pages')
    .select('username')
    .eq('user_id', user.id)
    .single()

  if (page?.username !== username) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Revalidate the public page
  revalidatePath(`/${username}`)

  return NextResponse.json({ revalidated: true })
}
```

### Pattern 4: Save/Discard with Unsaved Changes Guard

**What:** Track draft state, warn on navigation, explicit save/discard.

**When to use:** When auto-save is not desired and users expect explicit control.

**Trade-offs:**
- PRO: Clear mental model for users
- PRO: No accidental changes going live
- CON: Risk of losing work if browser closes
- MITIGATION: Optional localStorage backup

**Example:**

```typescript
// hooks/useUnsavedChanges.ts
'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { usePageStore } from '@/stores/pageStore'

export function useUnsavedChanges() {
  const hasChanges = usePageStore((s) => s.hasChanges)
  const router = useRouter()

  // Browser navigation (back button, close tab)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = '' // Required for Chrome
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  // Next.js navigation
  const guardedNavigate = useCallback((path: string) => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Discard and leave?'
      )
      if (!confirmed) return
    }
    router.push(path)
  }, [hasChanges, router])

  return { hasChanges, guardedNavigate }
}
```

## Data Flow

### Editor Data Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Editor    │───>│  Zustand    │───>│  Preview    │
│   Controls  │    │  PageStore  │    │  (Iframe)   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │
       │                  │ (on Save)
       │                  ▼
       │          ┌─────────────┐    ┌─────────────┐
       │          │  Supabase   │───>│  ISR        │
       │          │  Database   │    │  Revalidate │
       │          └─────────────┘    └─────────────┘
       │                                    │
       │                                    ▼
       │                           ┌─────────────────┐
       └──────────────────────────>│  Public Page    │
                                   │  (CDN cached)   │
                                   └─────────────────┘
```

### Media Upload Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  File Input  │───>│  Server      │───>│  Vercel Blob │
│  (Client)    │    │  Action      │    │  / R2 / S3   │
└──────────────┘    └──────────────┘    └──────────────┘
                           │                    │
                           │ (presigned URL)    │ (stored)
                           ▼                    ▼
                    ┌──────────────┐    ┌──────────────┐
                    │  Client      │    │  CDN URL     │
                    │  Upload      │───>│  Returned    │
                    └──────────────┘    └──────────────┘
                                               │
                                               ▼
                                        ┌──────────────┐
                                        │  Store URL   │
                                        │  in Zustand  │
                                        └──────────────┘
```

### Key Data Flows

1. **Editor to Preview:** User edits in editor panel -> Zustand store updates -> Preview iframe re-renders (same store subscription)
2. **Save to Production:** User clicks Save -> Zustand `save()` action -> Write to Supabase -> Call revalidate API -> ISR regenerates public page
3. **Initial Load:** Dashboard mounts -> Fetch page data from Supabase -> Populate Zustand store -> Editor and Preview hydrate
4. **Public Page Load:** Visitor requests `linklobby.com/username` -> CDN serves cached ISR page (or generates on cache miss)

## Database Schema

```sql
-- Extends existing Supabase Auth
-- profiles table linked to auth.users

-- Core profile (extends auth for public data + username)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artist page configuration
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL REFERENCES public.profiles(username) ON UPDATE CASCADE,

  -- Theme settings
  theme_id TEXT NOT NULL DEFAULT 'sleek', -- 'macos', 'sleek', 'third-tbd'
  background_type TEXT DEFAULT 'color', -- 'color', 'image', 'video'
  background_value TEXT DEFAULT '#0a0a0a',

  -- Color overrides (null = use theme defaults)
  color_background TEXT,
  color_text TEXT,
  color_accent TEXT,
  color_border TEXT,

  -- Logo settings
  logo_url TEXT,
  logo_position TEXT DEFAULT 'top', -- 'top', 'left', 'right'
  logo_animation TEXT DEFAULT 'static', -- 'static', 'float', 'dvd-bounce'

  -- Audio settings
  audio_url TEXT,
  audio_player_style TEXT DEFAULT 'waveform', -- 'waveform', 'vinyl', 'op1', 'cassette', 'minimal'
  audio_player_visible BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT one_page_per_user UNIQUE (user_id)
);

-- Links on the page
CREATE TABLE public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,

  -- Link content
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  display_style TEXT DEFAULT 'simple', -- 'simple', 'card', 'embed', 'custom-icon', 'link-preview'
  icon_url TEXT, -- for custom-icon style

  -- Ordering
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Visibility
  is_visible BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events
CREATE TABLE public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  link_id UUID REFERENCES public.links(id) ON DELETE SET NULL,

  event_type TEXT NOT NULL, -- 'page_view', 'link_click', 'audio_play'

  -- Visitor info (anonymized)
  visitor_hash TEXT, -- hashed IP + user agent for unique counting
  country TEXT,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  referrer TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_pages_username ON public.pages(username);
CREATE INDEX idx_links_page_id ON public.links(page_id);
CREATE INDEX idx_links_sort_order ON public.links(page_id, sort_order);
CREATE INDEX idx_analytics_page_id ON public.analytics(page_id);
CREATE INDEX idx_analytics_created_at ON public.analytics(created_at);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Pages: public read by username, owner full access
CREATE POLICY "Public pages are viewable by everyone"
  ON public.pages FOR SELECT USING (true);

CREATE POLICY "Users can manage own page"
  ON public.pages FOR ALL USING (auth.uid() = user_id);

-- Links: public read, owner full access
CREATE POLICY "Links are viewable by everyone"
  ON public.links FOR SELECT USING (true);

CREATE POLICY "Users can manage own links"
  ON public.links FOR ALL
  USING (
    page_id IN (SELECT id FROM public.pages WHERE user_id = auth.uid())
  );

-- Analytics: owner read only, insert from edge function
CREATE POLICY "Users can view own analytics"
  ON public.analytics FOR SELECT
  USING (
    page_id IN (SELECT id FROM public.pages WHERE user_id = auth.uid())
  );

-- Trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'display_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for auto-creating page when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.pages (user_id, username)
  VALUES (NEW.id, NEW.username);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-10k users | Current architecture is fine. Single Supabase project, Vercel Blob, default ISR. |
| 10k-100k users | Add analytics aggregation (roll up daily). Consider Supabase connection pooling. |
| 100k+ users | Move media to dedicated S3 + CloudFront. Database read replicas. Edge analytics. |

### Scaling Priorities

1. **First bottleneck:** Database queries for analytics. **Fix:** Pre-aggregate metrics in a separate table with hourly cron job.
2. **Second bottleneck:** Media storage costs and CDN. **Fix:** Move to Cloudflare R2 (cheaper egress) with image optimization.

## Anti-Patterns

### Anti-Pattern 1: Auto-Save Everything

**What people do:** Save to database on every keystroke or with aggressive debouncing.

**Why it's wrong:**
- Creates confusing state (is this live?)
- Pollutes version history
- Higher database costs
- Conflicts with "save/discard" mental model

**Do this instead:** Keep all edits in Zustand until explicit Save. Optionally backup to localStorage as crash protection.

### Anti-Pattern 2: SSR for Dashboard

**What people do:** Server-side render the dashboard editor.

**Why it's wrong:**
- Dashboard is always authenticated (no SEO benefit)
- Editor needs frequent re-renders (defeats SSR purpose)
- Adds latency for every interaction
- State management becomes complex (hydration issues)

**Do this instead:** Use CSR for dashboard. Load data on mount, manage entirely client-side with Zustand.

### Anti-Pattern 3: Single Mega-Store

**What people do:** Put all state (page data, UI state, auth, etc.) in one Zustand store.

**Why it's wrong:**
- Triggers unnecessary re-renders
- Hard to reason about
- Makes testing difficult

**Do this instead:** Separate stores by concern: `pageStore` (page content), `uiStore` (UI state). Use Zustand's slice pattern or multiple stores.

### Anti-Pattern 4: Theme via Styled-Components ThemeProvider

**What people do:** Use JS-based theming that requires React tree traversal.

**Why it's wrong:**
- Performance overhead on theme switch
- Requires all components to re-render
- Doesn't work with CSS-only elements
- Hydration issues with SSR

**Do this instead:** Use CSS custom properties. Theme switch = update CSS variables on root. No React re-renders needed.

### Anti-Pattern 5: Real-time Database Sync for Preview

**What people do:** Write to database, then read back for preview.

**Why it's wrong:**
- Latency (write -> read round trip)
- Coupling (preview depends on save working)
- Cost (many database operations)
- Breaks save/discard model

**Do this instead:** Preview reads from local Zustand state. Database is only touched on explicit Save.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase Auth | `@supabase/ssr` with cookies | Use middleware for session refresh |
| Supabase Database | Server components + client via RLS | RLS policies for security |
| Vercel Blob | Server Actions with presigned URLs | Client uploads directly to blob storage |
| Superpowered Audio | Client-side only, WASM | Must load after component mount |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Editor <-> Preview | Zustand store (shared state) | Both subscribe to same store |
| Dashboard <-> Public Page | Database (source of truth) | Save writes DB, ISR reads DB |
| Server <-> Client | Server Actions, API routes | No REST API needed for basic CRUD |

## Build Order Dependencies

Based on architectural dependencies, recommended implementation order:

```
Phase 1: Foundation
├── Supabase schema setup (profiles, pages, links)
├── Auth integration (login, signup, middleware)
├── Basic project structure (folders, routing)
└── Zustand stores (pageStore, uiStore)

Phase 2: Editor Core
├── Dashboard layout (sidebar + preview area)
├── Preview iframe route (/preview)
├── Links tab (CRUD, drag-drop reorder)
└── Basic link display on public page

Phase 3: Theming
├── Theme token system (CSS variables)
├── Design tab (theme selection)
├── Color customization
└── Mac OS + Sleek Modern themes

Phase 4: Public Page
├── Dynamic route ([username])
├── ISR configuration
├── On-demand revalidation
└── Performance optimization

Phase 5: Media
├── Image upload (logo, background)
├── Background options (color, image, video)
├── Media pipeline (upload, CDN)
└── Logo positioning + animation

Phase 6: Audio
├── Audio upload + conversion
├── Player styles (waveform, vinyl, etc.)
├── Superpowered integration
└── Varispeed + reverb controls

Phase 7: Analytics
├── Event tracking (views, clicks)
├── Insights tab
├── Aggregation + display
└── Per-link CTR
```

## Sources

- [Next.js App Router Documentation](https://nextjs.org/docs/app/getting-started/project-structure) - Official routing and file conventions
- [Zustand and React Context](https://tkdodo.eu/blog/zustand-and-react-context) - State management patterns
- [React State Management in 2025](https://dev.to/cristiansifuentes/react-state-management-in-2025-context-api-vs-zustand-385m) - Zustand vs Context comparison
- [Supabase User Management](https://supabase.com/docs/guides/auth/managing-user-data) - Profile patterns with RLS
- [Next.js Rendering Strategies](https://dev.to/rayan2228/nextjs-rendering-strategies-csr-vs-ssr-vs-ssg-vs-isr-complete-guide-26j4) - SSR/SSG/ISR comparison
- [Vercel Blob Documentation](https://vercel.com/templates/next.js/blob-starter) - Media upload patterns
- [CSS Custom Properties for Theming](https://www.joshwcomeau.com/css/css-variables-for-react-devs/) - CSS variable patterns
- [Glassmorphism Implementation](https://www.joshwcomeau.com/css/backdrop-filter/) - Frosted glass effects
- [dnd-kit Documentation](https://dndkit.com/) - Modern drag-and-drop for React
- [React useOptimistic](https://react.dev/reference/react/useOptimistic) - Optimistic UI patterns

---
*Architecture research for: LinkLobby link-in-bio platform*
*Researched: 2026-01-23*
