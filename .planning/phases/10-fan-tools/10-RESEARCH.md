# Phase 10: Fan Tools - Research

**Researched:** 2026-02-05
**Domain:** Email collection, QR codes, content scheduling, countdown timers
**Confidence:** HIGH

## Summary

This phase implements fan engagement tools: email collection with export/Mailchimp sync, QR code generation, release cards with countdowns, and link scheduling. The technical domain is well-established with mature libraries.

The existing codebase already uses React Hook Form with Zod for form handling (see `signup-form.tsx`), Zustand for state management, and has established patterns for card types and database operations. The `isMusicPlatform()` utility in `platform-embed.ts` can detect Spotify/Apple Music URLs for release card auto-conversion.

Key decisions from CONTEXT.md constrain implementation: scheduled links show with badges (not dimmed), expired links auto-hide from public but remain in editor, browser timezone display (no explicit setting), dedicated Schedule tab for timing overview, release cards are normal flow-positioned cards with optional countdown.

**Primary recommendation:** Use `react-qr-code` for QR generation, `react-countdown` for timers (or `@leenguyen/react-flip-clock-countdown` for visual appeal), store scheduling data in card `content` JSON, and add dedicated database tables for email collection.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-qr-code | ^2.0.18 | QR code generation | 52K+ dependents, works with React 19, SVG output, UTF-8 support |
| react-countdown | ^2.3.6 | Countdown timer | 234 projects use it, custom renderer, lifecycle callbacks |
| @mailchimp/mailchimp_marketing | latest | Mailchimp API | Official library from Mailchimp |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @leenguyen/react-flip-clock-countdown | latest | Flip-clock style countdown | If artist prefers 3D animated aesthetic over simple numeric |
| date-fns | ^4.x | Date manipulation | Timezone display, countdown calculations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-qr-code | next-qrcode | Next-specific hooks vs universal React component |
| react-countdown | react-timer-hook | Hook-based vs component-based API |
| Custom flip clock | @leenguyen/react-flip-clock-countdown | More control vs ready-made 3D animations |

**Installation:**
```bash
npm install react-qr-code react-countdown @mailchimp/mailchimp_marketing
# Optional for flip-clock style:
npm install @leenguyen/react-flip-clock-countdown
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── editor/
│   │   ├── schedule-tab.tsx           # New Schedule tab component
│   │   ├── release-card-fields.tsx    # Release card editor fields
│   │   ├── email-collection-fields.tsx # Email block editor
│   │   └── qr-code-dialog.tsx         # QR code generation modal
│   ├── cards/
│   │   ├── release-card.tsx           # Release card with countdown
│   │   └── email-collection-card.tsx  # Email signup block
│   └── fan-tools/
│       ├── email-export.tsx           # CSV export functionality
│       └── mailchimp-sync.tsx         # Mailchimp integration UI
├── lib/
│   └── fan-tools/
│       ├── csv-export.ts              # CSV generation utilities
│       └── mailchimp.ts               # Server-side Mailchimp client
├── app/
│   └── api/
│       ├── emails/
│       │   ├── route.ts               # Email collection endpoint
│       │   └── export/route.ts        # CSV export endpoint
│       └── mailchimp/
│           └── sync/route.ts          # Mailchimp sync endpoint
└── types/
    └── fan-tools.ts                   # TypeScript types for fan tools
```

### Pattern 1: Card Content Extension for Scheduling
**What:** Store scheduling metadata in existing card `content` JSON field
**When to use:** Link scheduling and release mode timing
**Example:**
```typescript
// Extend existing Card content types
interface ScheduledCardContent {
  // Scheduling fields (stored as ISO 8601 strings)
  publishAt?: string      // null = published immediately
  expireAt?: string       // null = never expires

  // Release card specific
  isRelease?: boolean
  showCountdown?: boolean
  releaseUrl?: string     // Music URL for auto-conversion
  albumArtUrl?: string
  preSaveUrl?: string
}

// Filter for public page (in lib/supabase/public.ts)
const now = new Date().toISOString()
cards.filter(card => {
  const content = card.content as ScheduledCardContent
  const publishAt = content.publishAt
  const expireAt = content.expireAt

  // Check publish date
  if (publishAt && publishAt > now) return false

  // Check expiry date
  if (expireAt && expireAt < now) return false

  return card.is_visible
})
```

### Pattern 2: Email Collection Table Schema
**What:** Dedicated Supabase table for collecting fan emails
**When to use:** Storing collected emails for export/sync
**Example:**
```sql
-- Migration: 20260205_add_email_collection.sql
CREATE TABLE collected_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  source_card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  synced_to_mailchimp BOOLEAN DEFAULT FALSE,
  mailchimp_sync_at TIMESTAMPTZ,

  -- Prevent duplicates per page
  UNIQUE(page_id, email)
);

-- Index for export queries
CREATE INDEX idx_collected_emails_page_id ON collected_emails(page_id);
CREATE INDEX idx_collected_emails_collected_at ON collected_emails(collected_at);

-- RLS policy: users can only access emails for their own pages
ALTER TABLE collected_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their page emails" ON collected_emails
  FOR SELECT USING (
    page_id IN (SELECT id FROM pages WHERE user_id = auth.uid())
  );

CREATE POLICY "Public can insert emails" ON collected_emails
  FOR INSERT WITH CHECK (true);
```

### Pattern 3: QR Code with Download
**What:** Generate QR code and provide download options
**When to use:** QR code generation for page URL
**Example:**
```typescript
// Source: react-qr-code GitHub README
import QRCode from 'react-qr-code'

function QRCodeDialog({ pageUrl }: { pageUrl: string }) {
  const svgRef = useRef<SVGSVGElement>(null)

  const downloadSVG = () => {
    const svg = svgRef.current
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'qrcode.svg'
    link.click()

    URL.revokeObjectURL(url)
  }

  const downloadPNG = async () => {
    const svg = svgRef.current
    if (!svg) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      canvas.width = 1024
      canvas.height = 1024
      ctx?.drawImage(img, 0, 0, 1024, 1024)

      canvas.toBlob((blob) => {
        if (!blob) return
        const pngUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = pngUrl
        link.download = 'qrcode.png'
        link.click()
        URL.revokeObjectURL(pngUrl)
      }, 'image/png')

      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  return (
    <div>
      <QRCode
        ref={svgRef}
        value={pageUrl}
        size={256}
        level="M"
        fgColor="#000000"
        bgColor="#FFFFFF"
      />
      <Button onClick={downloadSVG}>Download SVG</Button>
      <Button onClick={downloadPNG}>Download PNG</Button>
    </div>
  )
}
```

### Pattern 4: Countdown Timer with Custom Renderer
**What:** Countdown to release date with flexible display
**When to use:** Release cards with countdown enabled
**Example:**
```typescript
// Source: react-countdown GitHub README
import Countdown from 'react-countdown'

interface CountdownRendererProps {
  days: number
  hours: number
  minutes: number
  seconds: number
  completed: boolean
}

function ReleaseCountdown({ releaseDate, onComplete }: {
  releaseDate: string
  onComplete: () => void
}) {
  const renderer = ({ days, hours, minutes, seconds, completed }: CountdownRendererProps) => {
    if (completed) {
      // Trigger card type conversion
      return <span>Out Now!</span>
    }

    return (
      <div className="flex gap-2 text-center">
        {days > 0 && (
          <div>
            <span className="text-2xl font-bold">{days}</span>
            <span className="text-xs block">days</span>
          </div>
        )}
        <div>
          <span className="text-2xl font-bold">{String(hours).padStart(2, '0')}</span>
          <span className="text-xs block">hours</span>
        </div>
        <div>
          <span className="text-2xl font-bold">{String(minutes).padStart(2, '0')}</span>
          <span className="text-xs block">min</span>
        </div>
        <div>
          <span className="text-2xl font-bold">{String(seconds).padStart(2, '0')}</span>
          <span className="text-xs block">sec</span>
        </div>
      </div>
    )
  }

  return (
    <Countdown
      date={new Date(releaseDate)}
      renderer={renderer}
      onComplete={onComplete}
    />
  )
}
```

### Pattern 5: CSV Export (Client-Side)
**What:** Generate and download CSV of collected emails
**When to use:** Email export functionality
**Example:**
```typescript
// Source: MDN Blob API, multiple WebSearch sources
interface CollectedEmail {
  email: string
  name: string | null
  collected_at: string
}

function exportEmailsToCSV(emails: CollectedEmail[], filename: string) {
  // CSV header
  const header = ['Email', 'Name', 'Collected At']

  // CSV rows
  const rows = emails.map(e => [
    e.email,
    e.name || '',
    new Date(e.collected_at).toLocaleDateString()
  ])

  // Combine with proper escaping
  const csvContent = [
    header.join(','),
    ...rows.map(row =>
      row.map(cell =>
        // Escape cells containing commas or quotes
        cell.includes(',') || cell.includes('"')
          ? `"${cell.replace(/"/g, '""')}"`
          : cell
      ).join(',')
    )
  ].join('\n')

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()

  URL.revokeObjectURL(url)
}
```

### Pattern 6: Mailchimp Server-Side Sync
**What:** Sync emails to Mailchimp list via API route
**When to use:** Optional Mailchimp integration
**Example:**
```typescript
// src/lib/fan-tools/mailchimp.ts
// Source: Mailchimp Marketing API Node.js docs
import mailchimp from '@mailchimp/mailchimp_marketing'

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX, // e.g., 'us19'
})

export async function addSubscriber(
  listId: string,
  email: string,
  firstName?: string
) {
  try {
    const response = await mailchimp.lists.addListMember(listId, {
      email_address: email,
      status: 'subscribed',
      merge_fields: firstName ? { FNAME: firstName } : undefined,
    })
    return { success: true, id: response.id }
  } catch (error: unknown) {
    // Handle "Member Exists" gracefully
    if (error && typeof error === 'object' && 'status' in error && error.status === 400) {
      return { success: true, alreadyExists: true }
    }
    throw error
  }
}

// API route: src/app/api/mailchimp/sync/route.ts
export async function POST(request: Request) {
  const { emails, listId } = await request.json()

  const results = await Promise.allSettled(
    emails.map((e: { email: string; name?: string }) =>
      addSubscriber(listId, e.email, e.name)
    )
  )

  const synced = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  return Response.json({ synced, failed })
}
```

### Anti-Patterns to Avoid
- **Storing Mailchimp API key client-side:** API keys must only exist in environment variables and be used in server-side API routes
- **Polling for countdown updates:** Let the countdown library handle its own intervals; do not build custom setInterval logic
- **Complex timezone calculations:** Store dates as UTC (ISO 8601), display using browser's Intl.DateTimeFormat for local time
- **Inline card type conversion:** When release goes live, do a proper card update via the store, not just visual changes

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| QR code generation | Canvas drawing / SVG generation | react-qr-code | Reed-Solomon error correction, proper encoding, 50K+ dependents |
| Countdown timer | setInterval with date math | react-countdown | Handles tab visibility, SSR, lifecycle callbacks |
| CSV generation | String concatenation | Proper escaping pattern | Edge cases: commas in names, quotes, unicode |
| Mailchimp sync | Raw HTTP requests | @mailchimp/mailchimp_marketing | Authentication, rate limiting, error types |
| Date formatting | Manual string building | Intl.DateTimeFormat / date-fns | Timezone handling, localization |

**Key insight:** QR codes require specific error correction algorithms (L/M/Q/H levels), countdown timers need to handle browser tab visibility changes to stay accurate, and Mailchimp has specific API patterns for "member exists" handling.

## Common Pitfalls

### Pitfall 1: Timezone Confusion in Scheduling
**What goes wrong:** Artist sets "publish at 9am" but it publishes at wrong local time
**Why it happens:** Mixing UTC storage with local display, or vice versa
**How to avoid:**
- Store all dates as ISO 8601 UTC strings in database
- Use browser's `Intl.DateTimeFormat` to display in user's local timezone
- Use `<input type="datetime-local">` which returns local time, then convert to UTC for storage
**Warning signs:** "It published at the wrong time" bug reports

### Pitfall 2: Email Validation on Client Only
**What goes wrong:** Invalid emails collected, Mailchimp sync fails
**Why it happens:** Relying only on HTML5 `type="email"` validation
**How to avoid:**
- Server-side validation with Zod schema matching existing codebase pattern
- Double-check email format before Mailchimp sync
**Warning signs:** High Mailchimp sync failure rate

### Pitfall 3: Countdown "Flicker" on Initial Load
**What goes wrong:** Countdown shows wrong time briefly, then corrects
**Why it happens:** Server-rendered time differs from client hydration
**How to avoid:**
- Use `react-countdown`'s built-in handling, or
- With flip-clock, use `renderOnServer` prop to render zeros initially
- Consider `suppressHydrationWarning` on countdown container
**Warning signs:** Visual jump when page loads

### Pitfall 4: Release Card Not Converting
**What goes wrong:** Release date passes but card stays as "coming soon"
**Why it happens:** Countdown `onComplete` only fires if user is viewing page at that moment
**How to avoid:**
- Always check release date on page load/render, not just on countdown complete
- Server-side filtering should return the card as a music card after release date
**Warning signs:** Stale "coming soon" cards after release

### Pitfall 5: QR Code Too Small to Scan
**What goes wrong:** Downloaded QR code doesn't scan reliably
**Why it happens:** Exporting at screen resolution (256px) vs print resolution
**How to avoid:**
- Export PNG at 1024x1024 minimum for print
- Offer multiple size options (screen, print, large print)
**Warning signs:** "QR code won't scan" feedback

### Pitfall 6: Mailchimp API Key Exposure
**What goes wrong:** API key visible in browser network tab
**Why it happens:** Calling Mailchimp directly from client
**How to avoid:**
- ALL Mailchimp calls go through server-side API routes
- Store key in `MAILCHIMP_API_KEY` env var, never in client bundle
**Warning signs:** "Request blocked" or key appearing in browser dev tools

## Code Examples

Verified patterns from official sources:

### Email Collection Form with Zod Validation
```typescript
// Following existing codebase pattern from signup-form.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const emailCollectionSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  name: z.string().optional(),
})

type EmailFormData = z.infer<typeof emailCollectionSchema>

function EmailCollectionForm({ pageId }: { pageId: string }) {
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EmailFormData>({
    resolver: zodResolver(emailCollectionSchema),
  })

  async function onSubmit(data: EmailFormData) {
    const response = await fetch('/api/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, pageId }),
    })

    if (response.ok) {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return <p>Thanks for subscribing!</p>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input placeholder="Email" type="email" {...register('email')} />
      {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
      <Input placeholder="Name (optional)" {...register('name')} />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </form>
  )
}
```

### Schedule Tab Card List
```typescript
// New component following existing editor-panel.tsx patterns
function ScheduleTab() {
  const cards = usePageStore((state) => state.cards)
  const getSortedCards = usePageStore((state) => state.getSortedCards)

  // Filter to cards with scheduling
  const scheduledCards = useMemo(() => {
    return getSortedCards().filter(card => {
      const content = card.content as ScheduledCardContent
      return content.publishAt || content.expireAt || content.isRelease
    })
  }, [cards])

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        {scheduledCards.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-6 w-6" />}
            title="No scheduled content"
            description="Schedule cards to publish at specific times"
          />
        ) : (
          scheduledCards.map(card => (
            <ScheduleCardItem key={card.id} card={card} />
          ))
        )}
      </div>
    </ScrollArea>
  )
}
```

### Flip Clock Alternative (if visual appeal desired)
```typescript
// Source: @leenguyen/react-flip-clock-countdown GitHub
import FlipClockCountdown from '@leenguyen/react-flip-clock-countdown'
import '@leenguyen/react-flip-clock-countdown/dist/index.css'

function FlipCountdown({ releaseDate }: { releaseDate: string }) {
  return (
    <FlipClockCountdown
      to={new Date(releaseDate)}
      labels={['Days', 'Hours', 'Minutes', 'Seconds']}
      labelStyle={{
        fontSize: 10,
        fontWeight: 500,
        textTransform: 'uppercase'
      }}
      digitBlockStyle={{
        width: 40,
        height: 60,
        fontSize: 30
      }}
      hideOnComplete={false}
      renderOnServer
    />
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-side QR generation | Client-side with react-qr-code | ~2022 | Zero latency, no server cost |
| Basic numeric countdown | Flip-clock or circular timers | ~2023 | Better visual appeal |
| Manual Mailchimp HTTP calls | Official @mailchimp/mailchimp_marketing | Current | Type safety, better errors |
| datetime-local without UTC | ISO 8601 UTC storage | Standard practice | Consistent timezone handling |

**Deprecated/outdated:**
- `qrcode` (deprecated) - use `react-qr-code` instead
- Mailchimp API v2 - use v3 (Marketing API)
- `moment.js` for dates - use `date-fns` or native `Intl` APIs

## Open Questions

Things that couldn't be fully resolved:

1. **Mailchimp OAuth vs API Key**
   - What we know: API Key works for single-account sync; OAuth needed for multi-tenant
   - What's unclear: Will artists connect their own Mailchimp or use shared account?
   - Recommendation: Start with artist-provided API Key (simpler), add OAuth later if needed

2. **Pre-save Button Behavior**
   - What we know: Spotify/Apple Music have pre-save services (e.g., feature.fm, smarturl)
   - What's unclear: Should we integrate with pre-save services or just link out?
   - Recommendation: Start with simple external link to artist's pre-save URL

3. **Email Collection GDPR Compliance**
   - What we know: Need consent checkbox for EU compliance
   - What's unclear: Full compliance requirements (data export, deletion)
   - Recommendation: Add optional consent checkbox, document data retention

## Sources

### Primary (HIGH confidence)
- react-qr-code GitHub: Version 2.0.18, props API, UTF-8 support
- react-countdown GitHub: Custom renderer, lifecycle callbacks, onComplete
- @mailchimp/mailchimp_marketing GitHub: setConfig, addListMember API
- @leenguyen/react-flip-clock-countdown GitHub: SSR support, styling props

### Secondary (MEDIUM confidence)
- Supabase discussions: Date filtering with lt/gt operators
- MDN Blob API: CSV export pattern with createObjectURL/revokeObjectURL
- Mailchimp Developer docs: Add member endpoint /lists/{list_id}/members

### Tertiary (LOW confidence)
- Blog posts on React countdown libraries comparison (subjective rankings)
- Community discussions on timezone handling patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official libraries, well-documented, verified on GitHub
- Architecture: HIGH - Follows existing codebase patterns, uses established card/store system
- Pitfalls: MEDIUM - Based on common patterns, some from experience vs explicit docs

**Research date:** 2026-02-05
**Valid until:** 2026-03-05 (30 days - stable domain, mature libraries)
