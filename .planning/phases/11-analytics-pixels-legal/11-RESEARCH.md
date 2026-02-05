# Phase 11: Analytics, Pixels & Legal Compliance - Research

**Researched:** 2026-02-06
**Domain:** Web Analytics, Pixel Tracking, Legal Compliance
**Confidence:** HIGH

## Summary

Phase 11 implements three interconnected systems: (1) Internal analytics tracking and visualization for page views, unique visitors, and card clicks; (2) Third-party pixel integration for Facebook Pixel and Google Analytics GA4 with server-side Conversions API support; and (3) Legal compliance infrastructure including GDPR/CCPA cookie consent, privacy policy generation, data export, and account deletion with grace periods.

The standard approach for 2026 combines server-side analytics tracking in Postgres/TimescaleDB, client-side charting with Recharts, official Next.js third-party integrations (@next/third-parties), and established legal compliance patterns (corner popup consent banner, auto-generated privacy policies, ZIP-based data export, 30-day soft delete).

Key technical decisions: Use Recharts for visualization (most popular, actively maintained, clean API), implement cookieless unique visitor tracking with hashed session IDs (privacy-first), leverage Next.js middleware for analytics capture, adopt Facebook Conversions API for server-side event tracking alongside browser pixel, and use react-cookie-consent for GDPR banner implementation.

**Primary recommendation:** Build analytics tracking tables with TimescaleDB extension for efficient time-series queries, implement dual-tracking (browser pixel + server-side CAPI) for Facebook/GA4, use theme-aware cookie consent banner that appears on scroll, auto-generate privacy policies based on enabled features, and provide 30-day account deletion grace period with full data export as ZIP.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 3.7.0+ | Data visualization charts | Most popular React chart library (26.6k stars), actively maintained (Jan 2026 release), declarative API, minimal dependencies, excellent for dashboards |
| @next/third-parties | latest | GA4 & pixel integration | Official Next.js package for third-party scripts, optimized loading, automatic page view tracking |
| react-cookie-consent | 10.0.x | GDPR/CCPA consent banner | Simple, customizable, actively maintained (updated 18 days ago), widely used for compliance |
| archiver | latest | ZIP file generation | De facto standard for Node.js ZIP creation, streaming support for large files, efficient memory usage |
| TimescaleDB | (extension) | Time-series analytics data | Postgres extension included in Supabase, optimized for time-series queries, hypertable partitioning |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| facebook-nodejs-business-sdk | latest | Facebook Conversions API | Server-side event tracking to complement browser pixel, required for iOS 14+ accuracy |
| jszip | latest | ZIP file manipulation | Alternative to archiver, supports browser + Node.js, better for in-memory operations |
| crypto (Node built-in) | - | Hashing for visitor IDs | Privacy-first unique visitor tracking without persistent cookies |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | Nivo | Nivo offers more chart types but heavier bundle size, Recharts simpler and faster |
| Recharts | Victory | Victory works on React Native too, but Recharts has better developer experience and popularity |
| Recharts | Chart.js (react-chartjs-2) | Chart.js uses Canvas vs SVG, not built for React, requires lifecycle wrappers |
| archiver | jszip | jszip works in browser too, but archiver better for server-side streaming |
| react-cookie-consent | Custom implementation | Custom gives full control but requires GDPR/CCPA legal expertise, risky |

**Installation:**
```bash
npm install recharts react-is @next/third-parties react-cookie-consent archiver
npm install facebook-nodejs-business-sdk  # For Conversions API
```

## Architecture Patterns

### Recommended Project Structure

```
app/
├── api/
│   ├── analytics/
│   │   ├── track/route.ts           # Server-side event tracking
│   │   ├── stats/route.ts           # Fetch analytics data
│   │   └── export/route.ts          # GDPR data export
│   ├── pixels/
│   │   ├── facebook-capi/route.ts   # Facebook Conversions API
│   │   └── test-event/route.ts      # Pixel test mode
│   └── legal/
│       ├── privacy-policy/route.ts  # Auto-generated privacy policy
│       └── delete-account/route.ts  # Account deletion with grace period
├── [username]/
│   ├── layout.tsx                   # Cookie consent wrapper
│   └── insights/
│       └── page.tsx                 # Analytics dashboard
└── middleware.ts                    # Analytics tracking via middleware

components/
├── analytics/
│   ├── InsightsChart.tsx           # Recharts time-series visualization
│   ├── CardStatsTable.tsx          # Per-card leaderboard (ranked by clicks)
│   └── MetricCard.tsx              # Hero metrics (unique visitors)
├── legal/
│   ├── CookieConsentBanner.tsx     # Theme-aware consent popup
│   └── PixelConfigForm.tsx         # Pixel ID input with test mode
└── pixels/
    ├── FacebookPixel.tsx           # Client-side pixel script
    └── GoogleAnalytics.tsx         # GA4 integration

lib/
├── analytics/
│   ├── track-event.ts              # Client-side tracking helper
│   ├── calculate-ctr.ts            # CTR = clicks / views * 100
│   └── visitor-hash.ts             # Privacy-safe visitor ID (IP + UA hash with salt)
├── pixels/
│   ├── facebook-capi-client.ts     # Conversions API wrapper
│   └── event-deduplication.ts      # event_id matching for pixel + CAPI
└── legal/
    ├── privacy-policy-generator.ts # Template-based policy generation
    └── export-user-data.ts         # ZIP with JSON + images

supabase/
└── migrations/
    ├── *_analytics_tables.sql      # page_views, card_clicks, sessions tables
    └── *_enable_timescale.sql      # Enable TimescaleDB extension
```

### Pattern 1: Server-Side Analytics Tracking via Middleware

**What:** Use Next.js middleware to capture all page views and route changes server-side before response

**When to use:** For accurate, ad-blocker-proof analytics tracking that doesn't rely on client JavaScript

**Example:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Track page view asynchronously (don't block response)
  if (request.nextUrl.pathname.startsWith('/')) {
    // Create visitor hash from IP + User-Agent + daily salt
    const visitorHash = await createVisitorHash(
      request.ip,
      request.headers.get('user-agent'),
      new Date().toDateString() // Salt changes daily
    )

    // Use waitUntil for background tracking (doesn't delay response)
    request.waitUntil(
      trackPageView({
        pathname: request.nextUrl.pathname,
        visitorHash,
        referrer: request.headers.get('referer'),
        timestamp: new Date()
      })
    )
  }

  return response
}

export const config = {
  matcher: '/:username*' // Only track public pages
}
```

### Pattern 2: Dual Tracking with Browser Pixel + Server-Side Conversions API

**What:** Send events from both browser (pixel) and server (CAPI) with event_id deduplication

**When to use:** For Facebook Pixel and GA4 to maximize accuracy despite iOS restrictions and ad blockers

**Example:**
```typescript
// Client-side click tracking
import { v4 as uuidv4 } from 'uuid'

function handleCardClick(cardId: string) {
  const eventId = uuidv4() // Same ID for pixel and CAPI

  // 1. Browser pixel (immediate)
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [cardId],
      content_type: 'card'
    }, { eventID: eventId })
  }

  // 2. Server-side CAPI (backup/supplement)
  fetch('/api/pixels/facebook-capi', {
    method: 'POST',
    body: JSON.stringify({
      event_name: 'ViewContent',
      event_id: eventId, // Facebook deduplicates by this
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        client_ip_address: '', // Server adds
        client_user_agent: navigator.userAgent,
        fbc: getCookie('_fbc'), // Browser click ID
        fbp: getCookie('_fbp')  // Browser ID
      },
      custom_data: {
        content_ids: [cardId],
        content_type: 'card'
      }
    })
  })
}
```

### Pattern 3: TimescaleDB Hypertables for Analytics Data

**What:** Use TimescaleDB extension to partition analytics tables by time for efficient queries

**When to use:** For storing page views, clicks, and sessions with fast aggregation queries

**Example:**
```sql
-- Enable TimescaleDB extension (included in Supabase)
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Page views table
CREATE TABLE analytics_page_views (
  time TIMESTAMPTZ NOT NULL,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  visitor_hash TEXT NOT NULL,
  pathname TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT
);

-- Convert to hypertable (partitioned by time)
SELECT create_hypertable('analytics_page_views', 'time');

-- Create index for common queries
CREATE INDEX idx_page_views_page_time ON analytics_page_views (page_id, time DESC);

-- Card clicks table
CREATE TABLE analytics_card_clicks (
  time TIMESTAMPTZ NOT NULL,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  visitor_hash TEXT NOT NULL,
  session_id TEXT
);

SELECT create_hypertable('analytics_card_clicks', 'time');
CREATE INDEX idx_card_clicks_card_time ON analytics_card_clicks (card_id, time DESC);

-- Efficient query: Get unique visitors last 30 days
SELECT COUNT(DISTINCT visitor_hash) as unique_visitors
FROM analytics_page_views
WHERE page_id = $1
  AND time > NOW() - INTERVAL '30 days';

-- Efficient query: Per-card CTR
SELECT
  c.id,
  c.title,
  COUNT(DISTINCT ac.visitor_hash) as clicks,
  (SELECT COUNT(DISTINCT visitor_hash)
   FROM analytics_page_views
   WHERE page_id = $1
     AND time > NOW() - INTERVAL '7 days') as views,
  ROUND(
    (COUNT(DISTINCT ac.visitor_hash)::numeric /
     NULLIF((SELECT COUNT(DISTINCT visitor_hash)
             FROM analytics_page_views
             WHERE page_id = $1
               AND time > NOW() - INTERVAL '7 days'), 0)) * 100,
    2
  ) as ctr
FROM cards c
LEFT JOIN analytics_card_clicks ac ON ac.card_id = c.id
WHERE c.page_id = $1
  AND ac.time > NOW() - INTERVAL '7 days'
GROUP BY c.id, c.title
ORDER BY clicks DESC;
```

### Pattern 4: Theme-Aware Cookie Consent Banner

**What:** Cookie consent banner that matches the user's page theme colors and fonts

**When to use:** To comply with GDPR/CCPA while maintaining visual consistency with artist's brand

**Example:**
```typescript
// components/legal/CookieConsentBanner.tsx
'use client'

import CookieConsent from 'react-cookie-consent'
import { useTheme } from '@/contexts/ThemeContext'
import { useEffect, useState } from 'react'

export function CookieConsentBanner() {
  const { theme } = useTheme()
  const [showBanner, setShowBanner] = useState(false)

  // Show on scroll (not immediately)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowBanner(true)
        window.removeEventListener('scroll', handleScroll)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!showBanner) return null

  return (
    <CookieConsent
      location="bottom-right" // Corner popup
      buttonText="Accept All"
      declineButtonText="Reject All"
      enableDeclineButton
      onAccept={() => {
        // Load pixels only after consent
        loadFacebookPixel()
        loadGoogleAnalytics()
      }}
      onDecline={() => {
        // Don't load any tracking pixels
      }}
      style={{
        background: theme.colors.background,
        color: theme.colors.text,
        borderRadius: theme.borderRadius,
        fontFamily: theme.fonts.body,
        maxWidth: '400px',
        padding: '1.5rem'
      }}
      buttonStyle={{
        background: theme.colors.primary,
        color: theme.colors.buttonText,
        fontSize: '14px',
        borderRadius: theme.borderRadius
      }}
      declineButtonStyle={{
        background: 'transparent',
        border: `1px solid ${theme.colors.border}`,
        color: theme.colors.text,
        fontSize: '14px',
        borderRadius: theme.borderRadius
      }}
    >
      We use cookies for analytics and retargeting. Choose your preference.
    </CookieConsent>
  )
}
```

### Pattern 5: Auto-Generated Privacy Policy Based on Enabled Features

**What:** Generate privacy policy dynamically based on which features the user has enabled (pixels, analytics, etc.)

**When to use:** To provide accurate, up-to-date privacy disclosures without manual legal document management

**Example:**
```typescript
// lib/legal/privacy-policy-generator.ts
interface PrivacyPolicyConfig {
  hasFacebookPixel: boolean
  hasGoogleAnalytics: boolean
  collectsEmails: boolean // Mailchimp integration
  hasDataExport: boolean
  hasAccountDeletion: boolean
}

export function generatePrivacyPolicy(config: PrivacyPolicyConfig): string {
  const sections = [
    basicInfoSection(),
    dataCollectionSection(config),
    config.hasFacebookPixel && facebookPixelSection(),
    config.hasGoogleAnalytics && googleAnalyticsSection(),
    config.collectsEmails && emailMarketingSection(),
    cookieSection(config),
    userRightsSection(config),
    config.hasDataExport && dataExportSection(),
    config.hasAccountDeletion && accountDeletionSection(),
    contactSection()
  ].filter(Boolean)

  return sections.join('\n\n')
}

function facebookPixelSection(): string {
  return `
## Facebook Pixel

We use Facebook Pixel to track how you interact with our page so we can show you relevant ads on Facebook and Instagram. The pixel collects:
- Pages you view
- Links you click
- Your device and browser information

Facebook may use this data to show you personalized ads. You can opt out of personalized ads in your Facebook settings.

To learn more about Facebook's privacy practices, visit: https://www.facebook.com/privacy/explanation
  `.trim()
}

function dataExportSection(): string {
  return `
## Your Data Export Rights (GDPR Article 15)

You have the right to receive a copy of all personal data we hold about you. To request an export:
1. Log into your account
2. Go to Settings → Privacy
3. Click "Download My Data"
4. We'll email you a ZIP file containing:
   - Your profile information (JSON)
   - All your uploaded images
   - Your analytics data
   - Your page configuration

Data exports are typically ready within 24 hours.
  `.trim()
}
```

### Pattern 6: Account Deletion with 30-Day Grace Period

**What:** Soft delete account immediately (disable access) but retain data for 30 days before permanent deletion

**When to use:** To allow account recovery if user changes mind, standard practice for major platforms

**Example:**
```typescript
// app/api/legal/delete-account/route.ts
export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const userId = session.user.id

  // 1. Soft delete: Mark account as deleted, set deletion date
  await supabase
    .from('profiles')
    .update({
      deleted_at: new Date().toISOString(),
      deletion_scheduled_for: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      // Immediately disable account access
      is_active: false
    })
    .eq('id', userId)

  // 2. Sign out user immediately
  await supabase.auth.signOut()

  // 3. Schedule background job to permanently delete after 30 days
  // (Use Supabase Edge Functions with pg_cron or external service)

  return Response.json({
    success: true,
    message: 'Account deletion scheduled for 30 days from now. You can recover it before then by logging in.'
  })
}

// Recovery endpoint (if user logs in during grace period)
export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const userId = session.user.id

  // Check if account is in grace period
  const { data: profile } = await supabase
    .from('profiles')
    .select('deleted_at, deletion_scheduled_for')
    .eq('id', userId)
    .single()

  if (profile?.deleted_at && new Date(profile.deletion_scheduled_for) > new Date()) {
    // Restore account
    await supabase
      .from('profiles')
      .update({
        deleted_at: null,
        deletion_scheduled_for: null,
        is_active: true
      })
      .eq('id', userId)

    return Response.json({ success: true, message: 'Account restored successfully' })
  }

  return Response.json({ success: false, message: 'Account cannot be restored' }, { status: 400 })
}
```

### Pattern 7: GDPR Data Export as ZIP with Structured Files

**What:** Export all user data as downloadable ZIP containing JSON files and original images

**When to use:** For GDPR Article 15 (right to data portability) compliance

**Example:**
```typescript
// lib/legal/export-user-data.ts
import archiver from 'archiver'
import { createWriteStream } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

export async function exportUserData(userId: string): Promise<string> {
  const zipPath = join(tmpdir(), `user-data-${userId}-${Date.now()}.zip`)
  const output = createWriteStream(zipPath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  archive.pipe(output)

  // 1. Profile data (JSON)
  const profile = await fetchProfileData(userId)
  archive.append(JSON.stringify(profile, null, 2), { name: 'profile.json' })

  // 2. Page configuration (JSON)
  const page = await fetchPageData(userId)
  archive.append(JSON.stringify(page, null, 2), { name: 'page-config.json' })

  // 3. All cards (JSON)
  const cards = await fetchCardsData(userId)
  archive.append(JSON.stringify(cards, null, 2), { name: 'cards.json' })

  // 4. Analytics data (JSON)
  const analytics = await fetchAnalyticsData(userId)
  archive.append(JSON.stringify(analytics, null, 2), { name: 'analytics.json' })

  // 5. Images (original files)
  const images = await fetchUserImages(userId)
  for (const image of images) {
    const imageBuffer = await downloadImageFromSupabase(image.url)
    archive.append(imageBuffer, { name: `images/${image.filename}` })
  }

  // 6. README explaining contents
  const readme = `
# Your LinkLobby Data Export

This ZIP file contains all your personal data from LinkLobby.

## Contents:

- profile.json - Your profile information
- page-config.json - Your page theme and settings
- cards.json - All your cards and their content
- analytics.json - Your page view and click statistics
- images/ - All images you've uploaded

## Data Portability

This data is provided in standard JSON format which can be imported into other services.
Images are in their original format (JPG, PNG, etc.).

Generated: ${new Date().toISOString()}
User ID: ${userId}
  `
  archive.append(readme, { name: 'README.txt' })

  await archive.finalize()

  return new Promise((resolve, reject) => {
    output.on('close', () => resolve(zipPath))
    archive.on('error', reject)
  })
}
```

### Anti-Patterns to Avoid

- **Loading pixels before consent:** NEVER load Facebook Pixel or GA4 before user accepts cookies - violates GDPR, can result in fines
- **Storing raw IPs permanently:** Don't store IP addresses long-term for analytics - hash them with daily salt rotation for privacy
- **Client-side only tracking:** Don't rely solely on browser JavaScript for analytics - iOS restrictions and ad blockers will cause massive undercounting
- **Unique visitor by session cookie:** Don't use cookies for unique visitors if claiming "cookieless" - use hashed fingerprints with short TTL
- **Hard delete on first request:** Don't permanently delete user data immediately - grace period is industry standard and improves UX
- **Manual privacy policy updates:** Don't make users manually edit privacy policy when enabling pixels - auto-generate based on enabled features
- **Blocking pixel scripts:** Don't use blocking script tags for pixels - use Next.js @next/third-parties for optimized loading

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie consent banner | Custom GDPR banner with all legal requirements | react-cookie-consent | GDPR compliance is complex (must be equal prominence, granular consent, withdrawal mechanism) - wrong implementation = fines |
| Privacy policy text | Write legal docs from scratch | Termly/GetTerms generators with auto-update | Legal language must be precise for GDPR/CCPA compliance, policies must update as laws change |
| ZIP file creation | Manual ZIP creation with buffers | archiver library | Streaming is critical for large exports, compression levels matter, error handling is complex |
| Facebook CAPI integration | Raw HTTP requests to Graph API | facebook-nodejs-business-sdk | Event format validation, error handling, batch sending, automatic retries all built-in |
| Unique visitor tracking | Custom fingerprinting algorithm | Hashed IP+UA with crypto library | Privacy implications are huge, must be GDPR-compliant, salt rotation is essential |
| Chart rendering | Canvas-based custom charts | Recharts | Responsive behavior, accessibility, tooltips, legends, animations all included |
| Time-series queries | Standard Postgres tables with date filters | TimescaleDB hypertables | Automatic partitioning, compression, continuous aggregates - 10-100x faster queries |
| CTR calculation | Manual percentages | Established formula: (clicks / views) * 100 | Edge cases (zero views), rounding precision, NULL handling already solved |

**Key insight:** Legal compliance and privacy are areas where "move fast and break things" can result in massive fines. Use battle-tested libraries and follow established patterns - innovation here is liability, not value.

## Common Pitfalls

### Pitfall 1: Event Duplication with Pixel + CAPI

**What goes wrong:** Facebook counts the same conversion twice when both browser pixel and Conversions API send the same event

**Why it happens:** Without event_id deduplication, Facebook sees two separate events and inflates conversion numbers

**How to avoid:**
- Always generate unique event_id (UUID) for each event
- Send same event_id in both browser pixel (via eventID parameter) and CAPI (via event_id field)
- Facebook automatically deduplicates events with matching IDs within 48-hour window

**Warning signs:** Facebook Ads Manager shows 2x expected conversions, suspiciously high ROAS

### Pitfall 2: Counting Page Views vs Unique Visitors Incorrectly

**What goes wrong:** Conflating page views (total visits) with unique visitors (distinct people), leading to wildly inflated CTR calculations

**Why it happens:** Using COUNT(*) instead of COUNT(DISTINCT visitor_hash) on analytics tables

**How to avoid:**
- Page views: COUNT(*) of page_view events
- Unique visitors: COUNT(DISTINCT visitor_hash) of page_view events
- CTR denominator MUST be unique visitors, not total page views
- Document this clearly in analytics display ("5 unique visitors, 12 page views")

**Warning signs:** CTR percentages below 0.5% (too many views) or above 20% (using views when should use uniques)

### Pitfall 3: Cookie Banner Not Blocking Pixels Before Consent

**What goes wrong:** Loading Facebook Pixel or GA4 immediately on page load, before user accepts cookies

**Why it happens:** Putting pixel scripts in layout/head without checking consent state first

**How to avoid:**
- Store consent preference in localStorage
- Only render pixel components AFTER consent is true
- Use conditional rendering: `{hasConsent && <FacebookPixel />}`
- Never use static script tags in HTML head for pixels

**Warning signs:** GDPR audit tools (like CookieBot scanner) detect pixel firing before consent, user complaints, potential regulatory investigation

### Pitfall 4: Privacy Policy Out of Sync with Features

**What goes wrong:** User enables Facebook Pixel but privacy policy still says "we don't use tracking pixels"

**Why it happens:** Static privacy policy text not updated when user toggles features

**How to avoid:**
- Auto-generate privacy policy based on enabled features
- Query which pixels/features are active before rendering policy
- Include "Last updated" timestamp that changes when features change
- Example: `generatePrivacyPolicy({ hasFacebookPixel: !!user.facebook_pixel_id })`

**Warning signs:** GDPR data subject requests reveal tracking not disclosed in policy, privacy policy dated 2024 but features added in 2026

### Pitfall 5: Hard Delete Instead of Soft Delete (No Grace Period)

**What goes wrong:** User accidentally deletes account, all data permanently lost immediately, user can't recover

**Why it happens:** Implementing `DELETE FROM users WHERE id = ?` directly on delete request

**How to avoid:**
- Add deleted_at and deletion_scheduled_for columns
- On delete request: Set deleted_at = NOW(), deletion_scheduled_for = NOW() + 30 days
- Disable account access immediately (is_active = false)
- Create scheduled job to permanently delete after grace period
- Allow user to cancel deletion by logging in during grace period

**Warning signs:** Support tickets from users asking to restore accounts, poor UX compared to competitors (Linktree, Beacons have grace periods)

### Pitfall 6: TimescaleDB Not Enabled for Analytics Tables

**What goes wrong:** Analytics queries become slow as data grows, 30-day aggregations take seconds, poor UX on Insights tab

**Why it happens:** Creating standard Postgres tables for time-series data without converting to hypertables

**How to avoid:**
- Enable TimescaleDB extension: `CREATE EXTENSION timescaledb`
- Convert analytics tables to hypertables: `SELECT create_hypertable('analytics_page_views', 'time')`
- Create time-based indexes: `CREATE INDEX idx ON analytics_page_views (page_id, time DESC)`
- Use TimescaleDB continuous aggregates for common queries (daily/weekly rollups)

**Warning signs:** Analytics dashboard loads slowly, Supabase query times above 500ms, users complain Insights tab is laggy

### Pitfall 7: Not Implementing Server-Side Conversions API

**What goes wrong:** Facebook Pixel misses 30-60% of conversions due to iOS restrictions, ad blockers, browser privacy features

**Why it happens:** Only implementing browser pixel, not realizing iOS 14+ requires server-side tracking for accuracy

**How to avoid:**
- Implement both browser pixel AND Conversions API
- Use event_id deduplication (Pitfall 1)
- Send user data from server (IP, user agent, fbc/fbp cookies)
- Test both paths in Facebook Events Manager

**Warning signs:** Facebook Ads Manager shows "Low Event Match Quality" warning, conversion count drops 40%+ after iOS updates, attribution windows shortened

### Pitfall 8: Exposing Personal Data in Analytics Export

**What goes wrong:** GDPR data export includes OTHER users' data (e.g., visitor IPs who viewed the page)

**Why it happens:** Exporting analytics_page_views table without filtering to only the requesting user's pages

**How to avoid:**
- Export only data WHERE page_id IN (SELECT id FROM pages WHERE user_id = requesting_user)
- Aggregate analytics (counts, CTR) instead of raw visitor hashes
- Never include other users' personal data (IPs, user agents) in export
- Document what's included/excluded in README.txt

**Warning signs:** GDPR audit reveals privacy violation (exposing others' data), data export contains visitor_hash values from other pages

## Code Examples

Verified patterns from official sources and documentation:

### Analytics: Tracking Page Views Server-Side

```typescript
// app/api/analytics/track/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const { pathname, pageId } = await request.json()
  const supabase = createClient()

  // Create privacy-safe visitor hash (IP + UA + daily salt)
  const ip = request.headers.get('x-forwarded-for') || request.ip
  const ua = request.headers.get('user-agent')
  const dailySalt = new Date().toDateString() // Changes daily
  const visitorHash = crypto
    .createHash('sha256')
    .update(`${ip}|${ua}|${dailySalt}`)
    .digest('hex')

  // Insert page view
  await supabase.from('analytics_page_views').insert({
    time: new Date().toISOString(),
    page_id: pageId,
    visitor_hash: visitorHash,
    pathname,
    referrer: request.headers.get('referer'),
    user_agent: ua
  })

  return Response.json({ success: true })
}
```

### Analytics: Fetching Insights Data with CTR

```typescript
// app/api/analytics/stats/route.ts
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageId = searchParams.get('pageId')
  const days = parseInt(searchParams.get('days') || '7')

  const supabase = createClient()
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  // 1. Unique visitors (hero metric)
  const { data: viewsData } = await supabase
    .from('analytics_page_views')
    .select('visitor_hash')
    .eq('page_id', pageId)
    .gte('time', startDate.toISOString())

  const uniqueVisitors = new Set(viewsData?.map(v => v.visitor_hash)).size
  const totalViews = viewsData?.length || 0

  // 2. Per-card stats (leaderboard)
  const { data: cardsData } = await supabase
    .from('cards')
    .select(`
      id,
      title,
      card_type,
      analytics_card_clicks (
        visitor_hash
      )
    `)
    .eq('page_id', pageId)

  const cardStats = cardsData?.map(card => {
    const clicks = new Set(
      card.analytics_card_clicks
        ?.filter(c => new Date(c.time) >= startDate)
        .map(c => c.visitor_hash)
    ).size

    // CTR = (unique clickers / unique visitors) * 100
    const ctr = uniqueVisitors > 0
      ? ((clicks / uniqueVisitors) * 100).toFixed(2)
      : '0.00'

    return {
      id: card.id,
      title: card.title,
      type: card.card_type,
      clicks,
      ctr: parseFloat(ctr)
    }
  }).sort((a, b) => b.clicks - a.clicks) // Leaderboard: most clicks first

  // 3. Time-series data (for chart)
  const { data: timeSeriesData } = await supabase.rpc('get_daily_stats', {
    p_page_id: pageId,
    p_start_date: startDate.toISOString()
  })

  return Response.json({
    uniqueVisitors,
    totalViews,
    cardStats,
    timeSeries: timeSeriesData
  })
}
```

**Source:** Based on TimescaleDB and Supabase analytics patterns

### Recharts: Time-Series Chart Component

```typescript
// components/analytics/InsightsChart.tsx
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartData {
  date: string
  views: number
  visitors: number
}

export function InsightsChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => new Date(date).toLocaleDateString()}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(date) => new Date(date).toLocaleDateString()}
          formatter={(value: number, name: string) => [
            value,
            name === 'visitors' ? 'Unique Visitors' : 'Total Views'
          ]}
        />
        <Line
          type="monotone"
          dataKey="visitors"
          stroke="#8884d8"
          strokeWidth={2}
          name="Unique Visitors"
        />
        <Line
          type="monotone"
          dataKey="views"
          stroke="#82ca9d"
          strokeWidth={2}
          name="Total Views"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

**Source:** https://github.com/recharts/recharts (official examples)

### Facebook Pixel: Client-Side Integration

```typescript
// components/pixels/FacebookPixel.tsx
'use client'

import { useEffect } from 'react'

export function FacebookPixel({ pixelId }: { pixelId: string }) {
  useEffect(() => {
    // Facebook Pixel base code
    ;(function(f,b,e,v,n,t,s) {
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    })(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', pixelId)
    window.fbq('track', 'PageView')
  }, [pixelId])

  return null
}

// Track card click
export function trackCardClick(cardId: string, eventId: string) {
  if (typeof window.fbq === 'undefined') return

  window.fbq('track', 'ViewContent', {
    content_ids: [cardId],
    content_type: 'card'
  }, {
    eventID: eventId // For CAPI deduplication
  })
}
```

**Source:** Facebook Pixel official documentation, Linktree pattern research

### Facebook Conversions API: Server-Side Events

```typescript
// app/api/pixels/facebook-capi/route.ts
import { NextRequest } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const { event_name, event_id, custom_data, user_data } = await request.json()

  const pixelId = process.env.FACEBOOK_PIXEL_ID
  const accessToken = process.env.FACEBOOK_CAPI_TOKEN

  // Hash user data for privacy (SHA-256)
  const hashedUserData = {
    client_ip_address: crypto
      .createHash('sha256')
      .update(request.headers.get('x-forwarded-for') || request.ip)
      .digest('hex'),
    client_user_agent: crypto
      .createHash('sha256')
      .update(user_data.client_user_agent)
      .digest('hex'),
    fbc: user_data.fbc, // Already a cookie value
    fbp: user_data.fbp
  }

  // Send to Facebook Conversions API
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id, // Deduplication with browser pixel
          event_source_url: request.headers.get('referer'),
          action_source: 'website',
          user_data: hashedUserData,
          custom_data
        }]
      })
    }
  )

  const result = await response.json()
  return Response.json(result)
}
```

**Source:** Facebook Conversions API documentation, facebook-conversion-api-nextjs GitHub

### Google Analytics 4: Official Next.js Integration

```typescript
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html>
      <body>
        {children}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  )
}

// Track custom events
import { sendGAEvent } from '@next/third-parties/google'

function handleCardClick(cardId: string, cardTitle: string) {
  sendGAEvent({
    event: 'card_click',
    value: cardTitle,
    card_id: cardId
  })
}
```

**Source:** https://nextjs.org/docs/app/guides/third-party-libraries (official Next.js docs)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Browser-only tracking | Dual tracking (pixel + CAPI) | 2021 (iOS 14.5) | Facebook requires server-side to maintain conversion accuracy post-ATT |
| Cookie-based unique visitors | Hashed fingerprints with daily salt | 2023-2024 (GDPR enforcement) | Privacy-first analytics, no persistent cookies, GDPR-compliant |
| Universal Analytics (UA) | Google Analytics 4 (GA4) | July 2023 (UA sunset) | Event-based model vs session-based, better cross-platform tracking |
| Manual script tags | @next/third-parties package | Next.js 13+ | Optimized loading, automatic page view tracking, better performance |
| Standard Postgres | TimescaleDB hypertables | Supabase added support | 10-100x faster time-series queries, automatic compression |
| Pre-checked consent boxes | Equal prominence accept/reject | 2022 (GDPR rulings) | "Reject All" must be equally visible as "Accept All", no dark patterns |
| Immediate hard delete | 30-day soft delete grace period | 2020s (industry standard) | Better UX, account recovery option, matches big platforms |
| Static privacy policies | Auto-generated based on features | 2025+ (dynamic SaaS) | Always accurate, updates when features toggle, reduces compliance risk |

**Deprecated/outdated:**
- **Facebook Pixel without CAPI:** Browser-only tracking now misses 30-60% of iOS conversions, Meta Ads Manager shows warnings
- **Google Universal Analytics (analytics.js):** Completely shut down July 1, 2023 - must use GA4 (gtag.js)
- **Cookie consent after data collection:** GDPR requires consent BEFORE setting non-essential cookies, not after
- **Manual GTM setup for Next.js:** @next/third-parties is now official, better performance than manual GTM

## Competitor Analysis: Event Tracking Patterns

### Linktree (Industry Leader)

**Facebook Pixel Events:**
- PageView: Every profile visit
- linkClick: Every link/card click

**Analytics Dashboard:**
- Hero metric: Total views (not unique visitors)
- Click-through rate per link
- Traffic sources (referrers)
- Geographic breakdown (Pro plan)

**Pixel Configuration:**
- Location: Settings → Integrations → Facebook Pixel
- Input: Pixel ID only (not full script)
- Verification: No built-in test mode

**Privacy Compliance:**
- Cookie consent: Generic banner (not theme-matched)
- Privacy policy: Static page, not auto-generated
- Data export: Available but manual request via support

**Source:** https://help.linktr.ee/en/articles/5434194-facebook-meta-pixel-integration

### Beacons (Competitor)

**Pixel Support:**
- Facebook Pixel
- Google Analytics (GA4)
- TikTok Pixel
- Google Tag Manager
- Twitter/X Pixel

**Analytics Features:**
- Page views tracking
- Link click tracking
- Form submission tracking (email signups)
- Integration with third-party analytics platforms

**Pixel Configuration:**
- Location: Settings → Tracking Pixels
- Input: Pixel ID for each platform
- Multiple pixels supported simultaneously

**Source:** https://help.beacons.ai/en/articles/4698689 and https://help.beacons.ai/en/articles/5229377

### Standard Event Nomenclature (2026)

Based on competitor analysis and industry standards:

| Event Type | Event Name | When Triggered | Parameters |
|------------|------------|----------------|------------|
| Page load | PageView | User visits profile page | page_id, referrer |
| Card click | ViewContent | User clicks any card/link | content_id (card_id), content_type ('card'), content_name (card title) |
| Email signup | Lead | User submits email form | None (email handled server-side) |
| Game played | Engagement | User starts game card | content_id, content_type ('game'), value (play_count) |
| Gallery viewed | ViewContent | User opens photo gallery | content_id, content_type ('gallery'), num_items |
| Video played | ViewContent | User plays video card | content_id, content_type ('video'), video_title |

**Recommendation:** Match Linktree's simple model (PageView + ViewContent) but exceed it by:
1. Adding content_type parameter for segmentation
2. Including content_name for readability in Facebook Events Manager
3. Supporting game/gallery-specific events (competitive differentiation)

## Open Questions

Things that couldn't be fully resolved:

1. **TimescaleDB Continuous Aggregates for Real-Time Dashboards**
   - What we know: TimescaleDB supports continuous aggregates (materialized views that auto-refresh)
   - What's unclear: Performance impact on Supabase's managed Postgres, whether to pre-aggregate daily stats
   - Recommendation: Start with direct queries, add continuous aggregates if Insights tab loads >1 second

2. **Facebook CAPI Test Mode Programmatic Verification**
   - What we know: Facebook provides Test Events tool in Events Manager UI
   - What's unclear: Whether there's an API to programmatically verify test events (for "Test Pixel" button in UI)
   - Recommendation: Send test event with test_event_code parameter, provide link to Events Manager for manual verification

3. **GA4 Server-Side Measurement Protocol**
   - What we know: GA4 has Measurement Protocol for server-side events, but limited compared to client-side
   - What's unclear: Whether dual tracking (browser + server) provides meaningful benefit for GA4 like it does for Facebook
   - Recommendation: Start with client-side only (@next/third-parties), add server-side if attribution issues arise

4. **Auto-Updating Privacy Policy Legal Validity**
   - What we know: Services like Termageddon auto-update policies when laws change
   - What's unclear: Whether dynamically generating policy based on enabled features is legally equivalent to manually drafting
   - Recommendation: Use established templates (Termly/GetTerms) as base, customize sections based on features, include "Last Updated" timestamp

5. **GDPR Data Export Image Optimization**
   - What we know: Must provide original uploaded images in export
   - What's unclear: Whether to include Supabase-generated thumbnails/optimized versions or just originals
   - Recommendation: Include only originals (what user uploaded), not derivative processed images - cleaner and legally sufficient

## Sources

### Primary (HIGH confidence)

**Official Documentation:**
- Next.js Analytics Guide: https://nextjs.org/docs/pages/guides/analytics
- Next.js Third-Party Libraries: https://nextjs.org/docs/app/guides/third-party-libraries
- Recharts GitHub: https://github.com/recharts/recharts (v3.7.0, Jan 2026)
- Supabase TimescaleDB: https://supabase.com/docs/guides/database/extensions/timescaledb
- Facebook Conversions API: https://developers.facebook.com/docs/marketing-api/conversions-api
- Google Analytics 4 Events: https://developers.google.com/analytics/devguides/collection/ga4/events

**Competitor Official Documentation:**
- Linktree Facebook Pixel: https://help.linktr.ee/en/articles/5434194-facebook-meta-pixel-integration
- Linktree Analytics: https://help.linktr.ee/en/articles/5434186-creating-advanced-meta-pixel-audiences
- Beacons Pixel Tracking: https://help.beacons.ai/en/articles/4698689 and https://help.beacons.ai/en/articles/5229377

### Secondary (MEDIUM confidence)

**Technical Guides (2026):**
- Facebook Pixel 2026 Guide: https://m.aisensy.com/blog/facebook-pixel/
- GA4 Implementation Next.js: https://medium.com/@aashari/google-analytics-ga4-implementation-guide-for-next-js-16-a7bbf267dbaa
- Cookie Banner Design 2026: https://secureprivacy.ai/blog/cookie-banner-design-2026
- GDPR Compliance 2026: https://secureprivacy.ai/blog/gdpr-compliance-2026
- Cookieless Analytics 2026: https://getsimplifyanalytics.com/the-ultimate-guide-to-cookieless-analytics-implementation-and-privacy-focused-website-tracking-in-2026/
- React Chart Libraries 2026: https://aglowiditsolutions.com/blog/react-chart-libraries/

**Library Comparisons:**
- react-cookie-consent npm: https://www.npmjs.com/package/react-cookie-consent
- archiver vs jszip: https://npm-compare.com/adm-zip,archiver,jszip,zip-local
- Recharts vs Victory vs Chart.js: https://npm-compare.com/chart.js,react-vis,recharts,victory-chart

**Legal Templates:**
- Termly Privacy Policy Generator: https://termly.io/products/privacy-policy-generator/
- GetTerms SaaS Generator: https://getterms.io/privacy-policy-generator/saas
- GDPR Right to Erasure: https://gdpr-info.eu/art-17-gdpr/

### Tertiary (LOW confidence - marked for validation)

**Web Search Results:**
- Best practices for event naming: https://www.wudpecker.io/blog/simple-event-naming-conventions-for-product-analytics
- CTR calculation standards: https://dashthis.com/kpi-examples/click-through-rate/
- Account deletion grace periods: Community discussions on Microsoft/Google patterns (30-60 days)

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - Recharts verified actively maintained (Jan 2026 release), @next/third-parties is official Next.js package, react-cookie-consent actively maintained
- Architecture: **HIGH** - TimescaleDB patterns from official Supabase docs, Facebook CAPI from official Meta documentation, Next.js middleware from official docs
- Legal compliance: **MEDIUM** - Privacy policy generation based on established services (Termly, GetTerms), GDPR requirements from official regulation text, implementation patterns from web research
- Pitfalls: **HIGH** - Facebook deduplication from official CAPI docs, cookie consent violations from GDPR enforcement cases, grace period patterns from major platform analysis

**Research date:** 2026-02-06
**Valid until:** ~60 days (March 2026) for technical stack, indefinite for legal requirements (GDPR/CCPA laws stable)

**Notes:**
- Facebook Pixel and GA4 integrations are mature, stable patterns
- Legal compliance requirements are strict - prioritize using established libraries over custom solutions
- TimescaleDB is already included in Supabase projects, no additional setup needed
- Recharts is the clear winner for React charts in 2026 (popularity, maintenance, DX)
- Cookie consent and privacy policies are legal minefields - use battle-tested solutions
