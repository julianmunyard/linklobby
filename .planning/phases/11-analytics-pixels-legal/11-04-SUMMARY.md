---
phase: 11-analytics-pixels-legal
plan: 04
subsystem: analytics-pixels
status: complete
completed: 2026-02-06
duration: 6 minutes
tags:
  - facebook-pixel
  - google-analytics
  - ga4
  - conversions-api
  - capi
  - pixel-tracking
  - cookie-consent
  - gdpr
requires:
  - 11-02
provides:
  - Facebook Pixel tracking with server-side CAPI
  - Google Analytics GA4 tracking
  - Pixel configuration UI in Insights tab
  - Cookie consent gating for GDPR compliance
affects:
  - Future ad retargeting campaigns
  - Analytics accuracy for iOS users
tech-stack:
  added:
    - Facebook Conversions API v19.0
    - Google Analytics gtag.js
  patterns:
    - Dual tracking (client + server)
    - Event deduplication via event_id
    - Cookie consent gating
key-files:
  created:
    - src/components/pixels/facebook-pixel.tsx
    - src/components/pixels/google-analytics.tsx
    - src/components/pixels/pixel-loader.tsx
    - src/app/api/pixels/facebook-capi/route.ts
    - src/app/api/pixels/test-event/route.ts
    - src/components/analytics/pixel-config.tsx
  modified:
    - src/components/editor/insights-tab.tsx
    - src/app/[username]/page.tsx
    - src/types/theme.ts
decisions:
  - id: dual-tracking-pattern
    choice: Client-side pixel + server-side CAPI
    rationale: iOS 14+ ATT restrictions reduce client-side accuracy. Server-side CAPI provides backup tracking with event_id deduplication preventing double-counting.
    alternatives:
      - Client-side only (loses iOS accuracy)
      - Server-side only (loses some browser data)
  - id: cookie-consent-gating
    choice: Pixels only load after consent-granted event
    rationale: GDPR/CCPA compliance requires explicit user consent before loading tracking scripts.
    pattern: CookieConsentBanner fires custom event, PixelLoader listens and conditionally renders
  - id: pixels-in-theme-settings
    choice: Store pixel IDs in theme_settings.pixels JSONB
    rationale: Avoids schema changes, leverages existing JSONB column, co-locates with other page settings
    alternatives:
      - Separate pixel_settings table (overkill for 2 fields)
      - Environment variables (doesn't support per-artist pixels)
  - id: theme-api-for-saving
    choice: Use existing /api/theme endpoint with merge pattern
    rationale: Reuses existing theme_settings update logic, avoids creating /api/page/[id] route
    pattern: Fetch current theme, merge pixels, POST to /api/theme
  - id: card-click-tracking
    choice: Document-level click listener with data-card-id bubbling
    rationale: Single listener for all cards, no per-card overhead, already established pattern in ClickTracker
    alternatives:
      - Per-card onClick handlers (performance overhead)
      - Intersection observer (only tracks visibility, not clicks)
---

# Phase 11 Plan 04: Pixel Tracking Integration Summary

**One-liner:** Facebook Pixel and GA4 tracking with server-side Conversions API, cookie consent gating, and pixel config UI in Insights tab

## Objective

Integrate Facebook Pixel and Google Analytics GA4 into public pages with GDPR-compliant cookie consent gating, server-side Conversions API for iOS accuracy, test event verification, and pixel configuration UI.

## What Was Built

### Pixel Components (Task 1)

**FacebookPixel Component (`src/components/pixels/facebook-pixel.tsx`):**
- Client-side Facebook Pixel integration with standard fbq initialization
- Automatic PageView tracking on mount
- `trackFbEvent()` function for dual tracking (browser pixel + server CAPI)
- TypeScript declarations for `window.fbq`
- Extracts fbc/fbp cookies for user matching

**GoogleAnalytics Component (`src/components/pixels/google-analytics.tsx`):**
- Client-side GA4 integration with gtag.js
- Next.js Script component for optimal loading
- `trackGaEvent()` function for custom event tracking
- TypeScript declarations for `window.gtag` and `window.dataLayer`

**Facebook Conversions API Endpoint (`src/app/api/pixels/facebook-capi/route.ts`):**
- POST handler for server-side event forwarding to Facebook Graph API
- Reads `FACEBOOK_CAPI_TOKEN` from environment (gracefully skips if not set)
- Extracts real client IP from x-forwarded-for header
- Constructs CAPI payload with event_id for deduplication
- Includes user_data (IP, UA, fbc/fbp cookies) for user matching
- Error handling returns 200 with error flag (tracking failures don't break UX)

**Test Event Endpoint (`src/app/api/pixels/test-event/route.ts`):**
- POST handler for pixel verification
- Facebook: Sends test PageView via CAPI with test_event_code
- Google: Returns instructions to check GA4 Realtime report (can't programmatically verify)

### Pixel Configuration UI (Task 2)

**PixelConfig Component (`src/components/analytics/pixel-config.tsx`):**
- Facebook Pixel ID input with save and test buttons
- GA4 Measurement ID input with save and test buttons
- Fetches current pixel settings from `/api/theme`
- Saves to `theme_settings.pixels` via `/api/theme` endpoint
- Test buttons send verification events to `/api/pixels/test-event`
- Loading states, toast notifications, helper text with setup instructions
- Privacy notice card explaining GDPR compliance

**InsightsTab Integration:**
- Added PixelConfig component below analytics charts
- Separated by visual divider
- Passes pageId to PixelConfig
- Full analytics dashboard: metrics, charts, card leaderboard, pixel config

**PixelLoader Component (`src/components/pixels/pixel-loader.tsx`):**
- Checks for `linklobby-consent` cookie on mount
- Listens for `consent-granted` custom event from CookieConsentBanner
- NEVER renders pixels before consent (GDPR compliant)
- Wires card click tracking via document-level click listener
- Fires `ViewContent` events to Facebook Pixel with event_id
- Fires `card_click` events to Google Analytics GA4
- Extracts card ID from `data-card-id` attribute via event bubbling

**Public Page Integration (`src/app/[username]/page.tsx`):**
- Extracts pixel IDs from `theme_settings.pixels`
- Renders PixelLoader with pixel IDs and page/card data
- Pixels load only after cookie consent via CookieConsentBanner (already in layout)

**Type System Updates (`src/types/theme.ts`):**
- Added `pixels` field to `ThemeState` interface
- Structure: `{ facebookPixelId?: string, gaMeasurementId?: string }`

## Key Technical Decisions

**1. Dual Tracking Pattern (Client + Server)**

Facebook Pixel sends events from both browser and server:
- **Client-side:** Traditional fbq pixel tracks in-browser
- **Server-side:** Conversions API (CAPI) tracks from server
- **Deduplication:** event_id ensures same event isn't counted twice

Benefits:
- iOS 14+ ATT restrictions block client-side pixels → CAPI provides backup
- CAPI can include server-side data (real IP, not VPN)
- Combined data improves Facebook's attribution models

**2. Cookie Consent Gating**

Flow:
1. User visits page → CookieConsentBanner appears after 100px scroll
2. User accepts cookies → `consent-granted` event fires
3. PixelLoader hears event → sets `hasConsent = true`
4. Pixels render and start tracking

GDPR Compliance:
- Pixels NEVER load before consent
- React state prevents early rendering
- Cookie check on mount handles returning visitors

**3. Document-Level Click Tracking**

Instead of per-card onClick handlers:
```tsx
document.addEventListener('click', (event) => {
  const cardElement = event.target.closest('[data-card-id]')
  if (cardElement) {
    const cardId = cardElement.getAttribute('data-card-id')
    trackFbEvent('ViewContent', { content_ids: [cardId] }, eventId, pixelId)
    trackGaEvent('card_click', { card_id: cardId })
  }
})
```

Benefits:
- Single listener for all cards (performance)
- Works with dynamically added cards
- Matches existing ClickTracker pattern

**4. Pixels in theme_settings**

Stored as `theme_settings.pixels: { facebookPixelId, gaMeasurementId }`

Rationale:
- No schema changes required (theme_settings is JSONB)
- Co-located with other page configuration
- Leverages existing `/api/theme` endpoint
- Simple merge pattern for updates

## Verification

✅ TypeScript compiles without errors
✅ Build succeeds with `npm run build`
✅ Facebook Pixel API routes created: `/api/pixels/facebook-capi`, `/api/pixels/test-event`
✅ Pixel components export correctly
✅ PixelConfig appears in Insights tab
✅ PixelLoader wired into public page
✅ Cookie consent gating logic implemented
✅ Card click tracking fires events to both platforms

## Deviations from Plan

**None** - Plan executed exactly as written. All requirements met:
- ✅ Artist can paste Facebook Pixel ID in Insights tab
- ✅ Artist can paste GA4 Measurement ID in Insights tab
- ✅ Pixels only load after visitor accepts cookies
- ✅ Artist can send test event to verify pixel
- ✅ Card clicks fire ViewContent events to both platforms
- ✅ Facebook CAPI sends server-side events with event_id deduplication

## Test Plan for Artists

**Setup Facebook Pixel:**
1. Go to Facebook Events Manager → Data Sources → Pixels
2. Copy Pixel ID (15-16 digit number)
3. Open LinkLobby → Insights tab → Paste into "Facebook Pixel ID"
4. Click "Save"
5. Click "Test" → Check Facebook Events Manager → Test Events tab
6. Should see test PageView event appear within seconds

**Setup Google Analytics:**
1. Go to Google Analytics Admin → Data Streams
2. Copy Measurement ID (starts with G-)
3. Open LinkLobby → Insights tab → Paste into "GA4 Measurement ID"
4. Click "Save"
5. Click "Test" → Check GA4 Realtime report
6. Should see active users spike within 30 seconds

**Verify Live Tracking:**
1. Publish your page
2. Open in incognito window
3. Scroll 100px → Cookie banner appears
4. Click "Accept All"
5. Click a card
6. Check Facebook Events Manager → Events → Should see ViewContent event
7. Check GA4 Realtime → Events → Should see card_click event

## Next Phase Readiness

**Blockers:** None

**Prerequisites for Phase 12:**
- Analytics tracking foundation (11-01) ✅
- Cookie consent system (11-02) ✅
- Pixel integration (11-04) ✅

**Notes:**
- Artists must create their own Facebook Pixels and GA4 properties
- Server admin must set `FACEBOOK_CAPI_TOKEN` environment variable for CAPI to work
- Without CAPI token, client-side pixel still works (graceful degradation)
- GA4 tracking works immediately, no server token needed

## Performance Impact

**Bundle Size:**
- facebook-pixel.tsx: ~2KB (script injection)
- google-analytics.tsx: ~1KB (Script component)
- pixel-loader.tsx: ~3KB (consent logic)
- Total: ~6KB additional client JS

**Network:**
- No impact until consent granted
- After consent: 2 external scripts load (fbevents.js, gtag.js)
- Card clicks: 2 fetch requests per click (CAPI + GA4 event)

**Runtime:**
- Document-level click listener: negligible overhead
- Event tracking: async, non-blocking

## Commits

- `fb09015` - feat(11-04): create pixel components and CAPI endpoint (4 files, 458 lines)
- `044d3c5` - feat(11-04): add pixel config UI and wire pixels into public pages (5 files, 495 lines)

**Total:** 2 commits, 9 files created/modified, 953 lines added

## Files Modified

**Created:**
- `src/components/pixels/facebook-pixel.tsx` - Client-side Facebook Pixel integration
- `src/components/pixels/google-analytics.tsx` - Client-side GA4 integration
- `src/components/pixels/pixel-loader.tsx` - Consent-gated pixel loader
- `src/app/api/pixels/facebook-capi/route.ts` - Facebook Conversions API endpoint
- `src/app/api/pixels/test-event/route.ts` - Pixel test verification endpoint
- `src/components/analytics/pixel-config.tsx` - Pixel configuration UI

**Modified:**
- `src/components/editor/insights-tab.tsx` - Added PixelConfig section
- `src/app/[username]/page.tsx` - Wired PixelLoader with consent gating
- `src/types/theme.ts` - Added pixels field to ThemeState

## Success Criteria Met

✅ Facebook Pixel tracks PageView and ViewContent events on public pages
✅ GA4 tracks page_view and card_click events on public pages
✅ Pixels NEVER load before cookie consent (GDPR compliant)
✅ Facebook CAPI provides server-side backup tracking with event_id deduplication
✅ Artist can verify pixel setup via test event button
✅ Pixel IDs persist in page settings (theme_settings.pixels)
