# Phase 8: Public Page - Research

**Researched:** 2026-02-03
**Domain:** Next.js App Router public pages with SSR, metadata, and OG images
**Confidence:** HIGH

## Summary

This phase implements the visitor-facing public page at `linklobby.com/[username]`. The page uses Next.js App Router with Server Components for SSR, fetching profile/cards/theme data from Supabase and rendering the exact same components currently used in the editor preview. Key decisions from CONTEXT.md constrain the implementation: SSR (no loading skeletons), two page states only (published/404), screenshot-based OG images, and Ishmeria font for 404 pages.

The standard approach leverages Next.js's built-in metadata API (`generateMetadata`) for dynamic SEO, file-based sitemap/robots generation, and JSON-LD structured data for search engines. For OG images, the decision to use "dynamic screenshots" means either Puppeteer/Chromium serverless functions or the simpler `@vercel/og` approach with Satori (which renders JSX to images without browser overhead).

**Primary recommendation:** Use Next.js App Router dynamic routes with `generateMetadata`, Supabase server-side queries in Server Components, reuse existing card/theme components, and implement OG images with `@vercel/og` ImageResponse for speed and simplicity (Puppeteer screenshots add 4-8x latency and complexity).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.4 | App Router, SSR, metadata API | Already in project, provides `generateMetadata`, sitemap, robots |
| @supabase/ssr | 0.8.0 | Server-side Supabase client | Already in project, used for server component data fetching |
| next/og | built-in | OG image generation | Built into Next.js, uses Satori, 100x lighter than Puppeteer |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| schema-dts | ^1.1.2 | TypeScript types for JSON-LD | Type-safe structured data (optional, can use inline types) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @vercel/og | Puppeteer + @sparticuz/chromium | True screenshots but 50MB bundle, 4-8s cold start, complex setup |
| Built-in sitemap | next-sitemap | More features but unnecessary for simple use case |

**Installation:**
```bash
# Optional - for typed JSON-LD
npm install schema-dts
```

No additional packages needed - Next.js 16 includes everything required.

## Architecture Patterns

### Recommended Project Structure
```
src/app/
├── [username]/              # Dynamic public page route
│   ├── page.tsx             # Server Component - fetches data, renders page
│   ├── opengraph-image.tsx  # Dynamic OG image generation
│   └── twitter-image.tsx    # Twitter card image (can share logic)
├── sitemap.ts               # Dynamic sitemap generation
├── robots.ts                # Robots.txt configuration
└── not-found.tsx            # Global 404 page (Ishmeria font)

src/components/public/       # Public page specific components
├── public-page-renderer.tsx # Static page renderer (no client interactivity)
└── static-flow-grid.tsx     # Non-interactive version of SelectableFlowGrid
```

### Pattern 1: Server Component Data Fetching
**What:** Fetch all page data in a Server Component, pass to children
**When to use:** Public page needs SSR without loading states
**Example:**
```typescript
// Source: Next.js App Router documentation
// app/[username]/page.tsx
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function PublicPage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Fetch profile with page and cards in one query
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      *,
      pages!inner (
        id,
        is_published,
        theme_settings,
        cards (*)
      )
    `)
    .eq("username", username.toLowerCase())
    .single()

  // 404 for non-existent or unpublished pages
  if (error || !profile || !profile.pages?.[0]?.is_published) {
    notFound()
  }

  return <PublicPageRenderer profile={profile} cards={profile.pages[0].cards} />
}
```

### Pattern 2: Dynamic Metadata Generation
**What:** Generate page-specific meta tags using `generateMetadata`
**When to use:** Every dynamic page needs unique title/description/OG tags
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata, ResolvingMetadata } from "next"

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { username } = await params
  const profile = await fetchPublicProfile(username)

  if (!profile) {
    return { title: "Page Not Found | LinkLobby" }
  }

  const displayName = profile.display_name || username

  return {
    title: `${displayName} | LinkLobby`,
    description: `${displayName} links`,
    openGraph: {
      title: displayName,
      description: `${displayName} links`,
      type: "profile",
      images: [`/api/og/${username}`], // Or use file-based opengraph-image.tsx
    },
    twitter: {
      card: "summary_large_image",
      title: displayName,
      description: `${displayName} links`,
    },
  }
}
```

### Pattern 3: File-Based OG Image Generation
**What:** Generate OG images using ImageResponse in opengraph-image.tsx
**When to use:** Dynamic social sharing images for each page
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/image-response
// app/[username]/opengraph-image.tsx
import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Profile preview"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({ params }: { params: { username: string } }) {
  const profile = await fetchProfileData(params.username)

  return new ImageResponse(
    (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: profile.theme.background,
        fontFamily: "Inter",
      }}>
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            width={120}
            height={120}
            style={{ borderRadius: "50%" }}
          />
        )}
        <h1 style={{ fontSize: 48, color: profile.theme.text }}>
          {profile.display_name}
        </h1>
      </div>
    ),
    { ...size }
  )
}
```

### Anti-Patterns to Avoid
- **Client-side data fetching for initial render:** Use Server Components, not useEffect. SSR means instant content.
- **Loading skeletons on public page:** Decision says "instant render, no loading skeleton". All data must be SSR.
- **Lazy loading images:** Decision says "all images load immediately". Use priority on Next/Image or eager loading.
- **Complex OG image rendering:** Keep it simple - profile header representation, not full page screenshot.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OG image generation | Custom canvas rendering | `next/og` ImageResponse | Built-in, Edge-optimized, handles fonts/images |
| Sitemap generation | Manual XML string building | `app/sitemap.ts` export | Type-safe, auto-cached, handles pagination |
| Robots.txt | Static file in public/ | `app/robots.ts` export | Dynamic, type-safe, co-located with code |
| Meta tag management | Manual head tags | `generateMetadata` | Deduplication, inheritance, streaming support |
| 404 handling | Custom error checking | `notFound()` function | Integrates with not-found.tsx, proper status codes |

**Key insight:** Next.js App Router has built-in solutions for all common SEO/metadata needs. These are optimized for streaming, caching, and search engine crawlers - custom solutions will be slower and miss edge cases.

## Common Pitfalls

### Pitfall 1: Fetch Waterfall in Server Components
**What goes wrong:** Sequential data fetching causes slow page loads
**Why it happens:** Awaiting one query before starting another
**How to avoid:** Use Promise.all or Supabase joins
**Warning signs:** TTFB > 500ms when database is fast

```typescript
// BAD: Sequential fetches
const profile = await fetchProfile(username)
const page = await fetchPage(profile.id)
const cards = await fetchCards(page.id)

// GOOD: Parallel or joined
const { data } = await supabase
  .from("profiles")
  .select("*, pages!inner(*, cards(*))")
  .eq("username", username)
  .single()
```

### Pitfall 2: Missing notFound() for Edge Cases
**What goes wrong:** Error pages show generic errors instead of 404
**Why it happens:** Not handling all failure modes
**How to avoid:** Check for unpublished pages, deleted profiles, etc.
**Warning signs:** Users see error stack traces or blank pages

```typescript
// Check ALL conditions that should return 404
if (!profile) notFound()
if (!profile.pages?.[0]) notFound()
if (!profile.pages[0].is_published) notFound()
```

### Pitfall 3: OG Image Font Loading Failures
**What goes wrong:** OG images render with fallback/missing fonts
**Why it happens:** Custom fonts not loaded in Edge runtime
**How to avoid:** Use Google Fonts fetch or bundle font files
**Warning signs:** Social previews show system fonts

```typescript
// Load font explicitly for ImageResponse
const fontData = await fetch(
  new URL("../../public/fonts/Inter.ttf", import.meta.url)
).then((res) => res.arrayBuffer())

return new ImageResponse(jsx, {
  fonts: [{ name: "Inter", data: fontData, style: "normal" }],
})
```

### Pitfall 4: Sitemap Missing New Users
**What goes wrong:** New profiles not appearing in sitemap
**Why it happens:** Sitemap cached and not revalidated
**How to avoid:** Use ISR revalidation or on-demand revalidation
**Warning signs:** Search engines don't index new pages

```typescript
// Force periodic revalidation
export const revalidate = 3600 // Regenerate every hour
```

### Pitfall 5: Theme Hydration Mismatch
**What goes wrong:** Flash of wrong theme on page load
**Why it happens:** Client theme state differs from server-rendered theme
**How to avoid:** Inject theme CSS variables server-side, not via client store
**Warning signs:** Brief flicker of default colors before correct theme appears

## Code Examples

Verified patterns from official sources:

### Dynamic Sitemap with Database Query
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
// app/sitemap.ts
import type { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"

export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Fetch all published profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("username, updated_at, pages!inner(is_published)")
    .eq("pages.is_published", true)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://linklobby.com"

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...(profiles || []).map((profile) => ({
      url: `${baseUrl}/${profile.username}`,
      lastModified: new Date(profile.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}
```

### Robots.txt Configuration
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
// app/robots.ts
import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://linklobby.com"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/editor/", "/settings/", "/login/", "/signup/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

### JSON-LD Structured Data (Person Schema)
```typescript
// Source: https://nextjs.org/docs/app/guides/json-ld
// Component to add in public page
function JsonLd({ profile }: { profile: Profile }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.display_name,
    url: `https://linklobby.com/${profile.username}`,
    image: profile.avatar_url,
    description: profile.bio,
    sameAs: profile.social_icons?.map((icon) => icon.url).filter(Boolean),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  )
}
```

### Static Card Grid (Non-Interactive for Public Page)
```typescript
// Source: Project codebase pattern (adapted from selectable-flow-grid.tsx)
// components/public/static-flow-grid.tsx
import { CardRenderer } from "@/components/cards/card-renderer"
import { cn } from "@/lib/utils"
import type { Card } from "@/types/card"

interface StaticFlowGridProps {
  cards: Card[]
}

export function StaticFlowGrid({ cards }: StaticFlowGridProps) {
  const visibleCards = cards.filter((c) => c.is_visible)

  if (visibleCards.length === 0) {
    return null // Per decision: "Published page with zero cards shows profile header only"
  }

  return (
    <div className="flex flex-wrap gap-4">
      {visibleCards.map((card) => (
        <div
          key={card.id}
          className={cn(
            card.size === "big" ? "w-full" : "w-[calc(50%-0.5rem)]"
          )}
        >
          <CardRenderer card={card} isPreview />
        </div>
      ))}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router getServerSideProps | App Router Server Components | Next.js 13+ | Simpler data fetching, streaming |
| next/head for meta | generateMetadata export | Next.js 13+ | Type-safe, async support |
| next-seo package | Built-in metadata API | Next.js 13+ | No external dependency |
| Puppeteer OG screenshots | @vercel/og ImageResponse | 2022 | 100x smaller, 5x faster |
| Manual sitemap.xml | app/sitemap.ts export | Next.js 13.3+ | Type-safe, auto-cached |

**Deprecated/outdated:**
- `next/head`: Replaced by metadata API in App Router
- `getServerSideProps`: Replaced by Server Components
- `pages/api` for simple routes: Replaced by Route Handlers

## Open Questions

Things that couldn't be fully resolved:

1. **OG Image: Satori vs True Screenshot**
   - What we know: CONTEXT.md says "OG image is a dynamic screenshot of the page"
   - What's unclear: Whether this means true browser screenshot (Puppeteer) or styled representation (Satori)
   - Recommendation: Use Satori/ImageResponse for simplicity and speed. True screenshots are 4-8x slower and add deployment complexity. If pixel-perfect screenshots are truly required, use @sparticuz/chromium-min + puppeteer-core with aggressive caching.

2. **Database Schema: is_published Column**
   - What we know: Current schema has no published/unpublished flag
   - What's unclear: Should this be on profiles or pages table?
   - Recommendation: Add `is_published BOOLEAN DEFAULT false` to `pages` table. Migration needed.

3. **Theme State on Public Page**
   - What we know: Preview iframe receives theme via postMessage from editor
   - What's unclear: How theme is stored/retrieved for public page
   - Recommendation: Add theme_settings JSONB column to pages table, or store in localStorage for preview and fetch from DB for public.

## Sources

### Primary (HIGH confidence)
- [Next.js generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - Dynamic metadata patterns
- [Next.js ImageResponse](https://nextjs.org/docs/app/api-reference/functions/image-response) - OG image generation
- [Next.js sitemap.xml](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) - Sitemap generation
- [Next.js robots.txt](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots) - Robots configuration
- [Next.js JSON-LD](https://nextjs.org/docs/app/guides/json-ld) - Structured data

### Secondary (MEDIUM confidence)
- [Vercel OG Image Blog](https://vercel.com/blog/introducing-vercel-og-image-generation-fast-dynamic-social-card-images) - Performance comparison vs Puppeteer
- [Vercel Puppeteer Guide](https://vercel.com/kb/guide/deploying-puppeteer-with-nextjs-on-vercel) - Chromium deployment on Vercel

### Tertiary (LOW confidence)
- WebSearch results on Next.js 16 performance patterns - needs validation during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All built into Next.js 16, well-documented
- Architecture: HIGH - Follows established App Router patterns
- Pitfalls: HIGH - Common issues documented in official docs and community
- OG image approach: MEDIUM - Satori recommended but true screenshot approach is valid alternative

**Research date:** 2026-02-03
**Valid until:** 30 days (stable Next.js patterns)
