# Phase 2: Dashboard Shell - Research

**Researched:** 2026-01-24
**Domain:** Dashboard UI, Split-screen editor, State management
**Confidence:** HIGH

## Summary

Phase 2 implements the dashboard shell where artists edit their pages. The core experience is a split-screen layout with editor controls on the left and a live preview iframe on the right. The dashboard needs three tabs (Cards, Design, Insights), a mobile/desktop preview toggle, and save/discard prompts for unsaved changes.

The recommended approach uses shadcn/ui's sidebar component for navigation (not shadcn-admin which uses Vite/TanStack Router), react-resizable-panels for the split-screen layout, shadcn/ui tabs for the three-tab interface, and Zustand for tracking unsaved changes. The preview renders via iframe pointing to a `/preview` route that shares the same Zustand store via postMessage communication.

Key insight: The original shadcn-admin template uses Vite and TanStack Router, NOT Next.js. Use the Next.js-native approach with shadcn/ui sidebar + react-resizable-panels instead. Several Next.js 16-compatible dashboard starters exist (Kiranism/next-shadcn-dashboard-starter) that demonstrate this pattern.

**Primary recommendation:** Build dashboard shell using shadcn/ui sidebar + react-resizable-panels for split layout, not the Vite-based shadcn-admin template.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-resizable-panels | latest | Split-screen editor/preview layout | Lightweight, accessible, supports persistence |
| @/components/ui/sidebar | shadcn | Dashboard navigation | Official shadcn component, SidebarProvider pattern |
| @/components/ui/tabs | shadcn | Cards/Design/Insights tabs | Official shadcn, Radix-based, accessible |
| next-themes | ^0.4.6 | Dark mode (default) | Already installed, official shadcn pattern |
| zustand | latest | Unsaved changes tracking | Already decided in Phase 1 research |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @/components/ui/alert-dialog | shadcn | Save/discard confirmation | Exit with unsaved changes |
| lucide-react | ^0.562.0 | Icons | Already installed, dashboard UI |
| sonner | ^2.0.7 | Toast notifications | Save success/error feedback |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-resizable-panels | split.js, react-split | react-resizable-panels has better React 19 support, accessibility |
| Custom iframe viewer | react-responsive-iframe-viewer | Custom is simpler for our fixed viewport needs |
| shadcn-admin template | Next.js dashboard starters | shadcn-admin uses Vite/TanStack Router, incompatible |

**Installation:**
```bash
npm install react-resizable-panels
npx shadcn@latest add sidebar tabs alert-dialog dropdown-menu tooltip
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(dashboard)/
│   ├── layout.tsx           # Dashboard layout with sidebar + header
│   ├── editor/
│   │   └── page.tsx         # Split-screen editor (Server Component wrapper)
│   └── preview/
│       └── page.tsx         # Preview route for iframe (receives postMessage)
├── components/
│   ├── dashboard/
│   │   ├── app-sidebar.tsx  # Main navigation sidebar
│   │   ├── dashboard-header.tsx # Header with username, URL, actions
│   │   └── unsaved-changes-dialog.tsx
│   └── editor/
│       ├── editor-layout.tsx      # Resizable panels container
│       ├── editor-panel.tsx       # Left panel with tabs
│       ├── preview-panel.tsx      # Right panel with iframe
│       └── preview-toggle.tsx     # Mobile/desktop toggle
├── stores/
│   └── page-store.ts        # Zustand store for page state + hasChanges
└── hooks/
    └── use-unsaved-changes.ts  # beforeunload + navigation blocking
```

### Pattern 1: Split-Screen with Resizable Panels
**What:** Editor on left, preview on right, resizable divider
**When to use:** Dashboard editor view
**Example:**
```typescript
// Source: https://github.com/bvaughn/react-resizable-panels
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

export function EditorLayout() {
  return (
    <PanelGroup direction="horizontal" className="h-full">
      <Panel defaultSize={40} minSize={30} maxSize={60}>
        <EditorPanel />
      </Panel>
      <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
      <Panel defaultSize={60} minSize={40}>
        <PreviewPanel />
      </Panel>
    </PanelGroup>
  )
}
```

### Pattern 2: Sidebar with SidebarProvider
**What:** Collapsible sidebar with navigation items
**When to use:** Dashboard layout wrapper
**Example:**
```typescript
// Source: https://ui.shadcn.com/docs/components/sidebar
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">{children}</main>
    </SidebarProvider>
  )
}
```

### Pattern 3: Zustand Store with hasChanges Tracking
**What:** Track unsaved changes by comparing current state to last saved state
**When to use:** Page editor state management
**Example:**
```typescript
// Source: Zustand patterns + research
import { create } from 'zustand'

interface PageState {
  cards: Card[]
  theme: Theme
  lastSavedAt: number | null
  // Derived state
  hasChanges: boolean
  // Actions
  setCards: (cards: Card[]) => void
  save: () => Promise<void>
  discard: () => void
}

export const usePageStore = create<PageState>()((set, get) => ({
  cards: [],
  theme: defaultTheme,
  lastSavedAt: null,
  hasChanges: false,

  setCards: (cards) => set({ cards, hasChanges: true }),

  save: async () => {
    // Save to Supabase
    set({ lastSavedAt: Date.now(), hasChanges: false })
  },

  discard: () => {
    // Reset to last saved state
    set({ hasChanges: false })
  },
}))
```

### Pattern 4: Preview via Iframe with postMessage
**What:** Iframe loads /preview route, receives state updates via postMessage
**When to use:** Live preview synchronization
**Example:**
```typescript
// Editor side - send state to preview
const sendToPreview = (state: PageState) => {
  const iframe = iframeRef.current
  if (iframe?.contentWindow) {
    iframe.contentWindow.postMessage({ type: 'STATE_UPDATE', payload: state }, '*')
  }
}

// Preview side - receive state updates
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'STATE_UPDATE') {
      setPreviewState(event.data.payload)
    }
  }
  window.addEventListener('message', handleMessage)
  return () => window.removeEventListener('message', handleMessage)
}, [])
```

### Pattern 5: Unsaved Changes Dialog
**What:** Show confirmation when navigating away with unsaved changes
**When to use:** Exit protection
**Example:**
```typescript
// Source: https://ui.shadcn.com/docs/components/alert-dialog
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog"

export function UnsavedChangesDialog({
  open,
  onSave,
  onDiscard,
  onCancel
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. Would you like to save them before leaving?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="outline" onClick={onDiscard}>
            Discard
          </AlertDialogAction>
          <AlertDialogAction onClick={onSave}>Save</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### Anti-Patterns to Avoid
- **Using shadcn-admin template directly:** It uses Vite + TanStack Router, not Next.js
- **Storing preview state separately from editor state:** Use single Zustand store with postMessage sync
- **Auto-save on every keystroke:** Use explicit save/discard pattern per requirements
- **Refreshing iframe on every change:** Use postMessage for efficient state sync

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Resizable split layout | Custom drag handlers | react-resizable-panels | Accessibility, persistence, keyboard support built-in |
| Dark mode toggle | Custom theme switching | next-themes + ThemeProvider | SSR hydration handling, system preference detection |
| Exit confirmation dialog | Browser confirm() | shadcn AlertDialog | Consistent styling, accessible, customizable actions |
| Sidebar navigation | Custom nav component | shadcn/ui sidebar | SidebarProvider, useSidebar hook, collapsible, mobile support |
| beforeunload handling | Basic event listener | Custom hook with App Router handling | App Router lacks routeChangeStart, needs popstate + click handlers |

**Key insight:** The App Router lacks the Pages Router's `router.events.routeChangeStart`. Unsaved changes detection requires handling: (1) beforeunload for browser close, (2) popstate for back/forward, (3) click interception for internal links.

## Common Pitfalls

### Pitfall 1: Using shadcn-admin Template Directly
**What goes wrong:** Template uses Vite + TanStack Router, causes routing conflicts with Next.js App Router
**Why it happens:** shadcn-admin is a standalone project, not a Next.js integration
**How to avoid:** Use shadcn/ui components individually (sidebar, tabs) + react-resizable-panels
**Warning signs:** Import errors for TanStack Router, Vite build errors

### Pitfall 2: Iframe Preview State Sync Storms
**What goes wrong:** Preview re-renders on every keystroke, performance degrades
**Why it happens:** postMessage fires on every state change without debouncing
**How to avoid:** Debounce postMessage calls (150-300ms), use Zustand selectors for fine-grained updates
**Warning signs:** Preview flickers, high CPU usage during typing

### Pitfall 3: Hydration Errors with Theme
**What goes wrong:** "Hydration mismatch" errors on page load
**Why it happens:** next-themes modifies html element, server/client mismatch
**How to avoid:** Add `suppressHydrationWarning` to html element, use ThemeProvider correctly
**Warning signs:** React hydration warnings in console, flash of wrong theme

### Pitfall 4: Missing beforeunload on Mobile
**What goes wrong:** Mobile users lose unsaved changes without warning
**Why it happens:** beforeunload is unreliable on mobile browsers
**How to avoid:** Show inline "unsaved changes" indicator, save draft to localStorage
**Warning signs:** User complaints about lost work on mobile

### Pitfall 5: Sidebar State Not Persisting
**What goes wrong:** Sidebar collapses on navigation, user must re-expand
**Why it happens:** Sidebar state not persisted, resets on route change
**How to avoid:** Use SidebarProvider with cookie persistence (built-in to shadcn sidebar)
**Warning signs:** Sidebar "jumps" on navigation

### Pitfall 6: App Router Navigation Blocking
**What goes wrong:** Can't block navigation with unsaved changes in App Router
**Why it happens:** router.events from Pages Router don't exist in App Router
**How to avoid:** Implement custom hook with popstate listener + link click interception
**Warning signs:** Users navigate away without save prompt

## Code Examples

Verified patterns from official sources:

### Dark Mode Setup (next-themes)
```typescript
// Source: https://ui.shadcn.com/docs/dark-mode/next
// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"  // Dark mode default per requirements
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

// components/theme-provider.tsx
"use client"
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### Tabs for Editor Sections
```typescript
// Source: https://ui.shadcn.com/docs/components/tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function EditorTabs() {
  return (
    <Tabs defaultValue="cards" className="w-full">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="cards">Cards</TabsTrigger>
        <TabsTrigger value="design">Design</TabsTrigger>
        <TabsTrigger value="insights">Insights</TabsTrigger>
      </TabsList>
      <TabsContent value="cards">
        {/* Card management - empty state for Phase 2 */}
        <EmptyState icon={LayoutGrid} text="Card management coming soon" />
      </TabsContent>
      <TabsContent value="design">
        {/* Theme/design - empty state for Phase 2 */}
        <EmptyState icon={Palette} text="Design options coming soon" />
      </TabsContent>
      <TabsContent value="insights">
        {/* Analytics - empty state for Phase 2 */}
        <EmptyState icon={BarChart} text="Insights coming soon" />
      </TabsContent>
    </Tabs>
  )
}
```

### Mobile/Desktop Preview Toggle
```typescript
// Source: Research synthesis
type PreviewMode = 'mobile' | 'desktop'

export function PreviewToggle({
  mode,
  onModeChange
}: {
  mode: PreviewMode
  onModeChange: (mode: PreviewMode) => void
}) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      <Button
        variant={mode === 'mobile' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('mobile')}
      >
        <Smartphone className="h-4 w-4" />
      </Button>
      <Button
        variant={mode === 'desktop' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('desktop')}
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Preview iframe sizing
const PREVIEW_SIZES = {
  mobile: { width: 375, height: 667 },
  desktop: { width: '100%', height: '100%' },
}
```

### Unsaved Changes Hook for App Router
```typescript
// Source: Research synthesis from multiple GitHub gists/discussions
"use client"
import { useEffect, useCallback } from 'react'
import { usePageStore } from '@/stores/page-store'

export function useUnsavedChanges() {
  const hasChanges = usePageStore((state) => state.hasChanges)
  const [showDialog, setShowDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  // Handle browser close/refresh
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

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      if (hasChanges) {
        // Push current state back to prevent navigation
        window.history.pushState(null, '', window.location.href)
        setShowDialog(true)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [hasChanges])

  // Intercept link clicks
  const handleLinkClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    const link = target.closest('a')
    if (link && hasChanges && link.href.startsWith(window.location.origin)) {
      e.preventDefault()
      setPendingNavigation(link.href)
      setShowDialog(true)
    }
  }, [hasChanges])

  useEffect(() => {
    document.addEventListener('click', handleLinkClick)
    return () => document.removeEventListener('click', handleLinkClick)
  }, [handleLinkClick])

  return { showDialog, setShowDialog, pendingNavigation, setPendingNavigation }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| shadcn-admin (Vite) | shadcn/ui components + Next.js | 2025 | Use individual components, not full template |
| router.events (Pages) | Custom popstate/click handlers | Next.js 13+ App Router | No built-in navigation blocking |
| CSS split panes | react-resizable-panels | 2024 | Better accessibility, persistence |
| Re-render iframe | postMessage sync | Standard pattern | Performance, no flash |

**Deprecated/outdated:**
- toast (shadcn): Deprecated in v3.7.0, use sonner instead (already decided Phase 1)
- Pages Router navigation events: Not available in App Router

## Open Questions

Things that couldn't be fully resolved:

1. **Preview route authentication**
   - What we know: Preview route needs page data without full auth flow
   - What's unclear: Should preview be a separate route or same component with different rendering?
   - Recommendation: Use `/preview` route accessible only from iframe origin, pass page ID via postMessage

2. **Layout persistence for react-resizable-panels**
   - What we know: Library supports autoSaveId for localStorage persistence
   - What's unclear: Should we persist layout to user preferences in DB?
   - Recommendation: Start with localStorage via autoSaveId, consider DB persistence later

3. **Mobile preview accuracy**
   - What we know: 375x667 is iPhone 8/SE size, common baseline
   - What's unclear: Should we show device frame/bezel?
   - Recommendation: Start simple (just sized container), add device frame later if needed

## Sources

### Primary (HIGH confidence)
- [shadcn/ui sidebar](https://ui.shadcn.com/docs/components/sidebar) - Sidebar component API
- [shadcn/ui tabs](https://ui.shadcn.com/docs/components/tabs) - Tabs component API
- [shadcn/ui alert-dialog](https://ui.shadcn.com/docs/components/alert-dialog) - Alert dialog API
- [shadcn/ui dark mode](https://ui.shadcn.com/docs/dark-mode/next) - next-themes setup
- [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) - Split pane API
- [next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter) - Next.js 16 dashboard pattern

### Secondary (MEDIUM confidence)
- [Payload CMS live preview](https://payloadcms.com/docs/live-preview/client) - postMessage pattern
- [Next.js unsaved changes gists](https://gist.github.com/icewind/71d31b2984948271db33784bb0df8393) - App Router navigation blocking
- [Zustand re-render optimization](https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow) - Selector patterns

### Tertiary (LOW confidence)
- [react-responsive-iframe-viewer](https://github.com/danmindru/react-responsive-iframe-viewer) - Reference only, building custom

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official docs
- Architecture: HIGH - Patterns verified with multiple sources
- Pitfalls: HIGH - Common issues well-documented in GitHub discussions
- Unsaved changes handling: MEDIUM - App Router pattern requires custom implementation

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (30 days - stable domain)
