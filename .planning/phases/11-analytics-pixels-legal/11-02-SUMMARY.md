---
phase: 11-analytics-pixels-legal
plan: 02
subsystem: legal
tags: [gdpr, ccpa, cookie-consent, privacy-policy, terms-of-service, react-cookie-consent]

# Dependency graph
requires:
  - phase: 08-public-page
    provides: PublicPageRenderer and layout components for public pages
provides:
  - GDPR/CCPA-compliant cookie consent banner on all public pages
  - Auto-generated privacy policy based on enabled features
  - Terms of service page with platform-specific content
  - Legal footer links on all public page layouts
affects: [11-03-facebook-pixel, 11-04-google-analytics, analytics, pixels]

# Tech tracking
tech-stack:
  added: [react-cookie-consent]
  patterns: [feature-based privacy policy generation, theme-aware legal components]

key-files:
  created:
    - src/components/legal/cookie-consent-banner.tsx
    - src/lib/legal/privacy-policy-generator.ts
    - src/app/privacy/page.tsx
    - src/app/terms/page.tsx
  modified:
    - src/app/[username]/layout.tsx
    - src/components/public/public-page-renderer.tsx
    - src/components/public/static-vcr-menu-layout.tsx
    - src/components/public/static-ipod-classic-layout.tsx
    - src/components/public/static-receipt-layout.tsx
    - src/app/[username]/page.tsx

key-decisions:
  - "Cookie banner appears after 100px scroll to avoid immediate obstruction"
  - "Privacy policy auto-generates based on detected features (pixels, email collection)"
  - "Legal footer added to all theme layouts for consistent compliance"

patterns-established:
  - "Feature-based privacy policy: generatePrivacyPolicy() produces different content based on enabled features"
  - "Theme-aware legal components: cookie banner reads CSS custom properties for theme matching"
  - "Equal prominence buttons: GDPR requires accept/reject buttons have same visual weight"

# Metrics
duration: 6min
completed: 2026-02-05
---

# Phase 11 Plan 02: Legal Compliance Foundation Summary

**GDPR/CCPA-compliant cookie consent with theme-aware banner, auto-generated privacy policy based on enabled features, and terms of service**

## Performance

- **Duration:** 6 minutes
- **Started:** 2026-02-05T23:10:55Z
- **Completed:** 2026-02-05T23:16:55Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Cookie consent banner with equal prominence accept/reject buttons, shows after 100px scroll
- Privacy policy auto-generates based on which features artist has enabled (Facebook Pixel, Google Analytics, email collection)
- Terms of service page with LinkLobby-specific content
- Legal footer links added to all public page layouts (default, VCR, iPod, Receipt)
- Custom events dispatched (consent-granted, consent-declined) for pixel components to listen to

## Task Commits

Each task was committed atomically:

1. **Task 1: Create cookie consent banner and wire into public pages** - `f017285` (feat)
2. **Task 2: Create privacy policy generator and legal pages** - `0efa422` (feat)

## Files Created/Modified

### Created
- `src/components/legal/cookie-consent-banner.tsx` - Theme-aware cookie consent banner with scroll detection, reads CSS custom properties for styling
- `src/lib/legal/privacy-policy-generator.ts` - Auto-generates privacy policy markdown based on PrivacyPolicyConfig (hasFacebookPixel, hasGoogleAnalytics, collectsEmails)
- `src/app/privacy/page.tsx` - Privacy policy page route, fetches user settings to detect enabled features, renders generated policy
- `src/app/terms/page.tsx` - Terms of service page with LinkLobby-specific content

### Modified
- `src/app/[username]/layout.tsx` - Added CookieConsentBanner component
- `src/components/public/public-page-renderer.tsx` - Added username prop, LegalFooter component, footer in default and framed layouts
- `src/components/public/static-vcr-menu-layout.tsx` - Added username prop, legal footer after card list
- `src/components/public/static-ipod-classic-layout.tsx` - Added username prop, legal footer outside iPod device
- `src/components/public/static-receipt-layout.tsx` - Added username prop, legal footer after receipt content
- `src/app/[username]/page.tsx` - Pass username prop to PublicPageRenderer

## Decisions Made

**Cookie banner timing:** Banner appears after 100px scroll instead of immediately. This avoids obstructing the page on initial load while still ensuring consent is collected before significant interaction.

**Privacy policy generation:** Privacy policy content is auto-generated based on which features the artist has enabled. This ensures:
- Compliance: Privacy policy accurately reflects actual data collection
- Maintenance: No manual updates needed when artist enables/disables features
- Transparency: Visitors see exactly what data is collected for their artist

**Equal prominence buttons:** Accept and Reject buttons have equal visual weight (same size, same border treatment) to comply with GDPR requirements. Many cookie banners make "reject" less prominent, which is non-compliant.

**Footer placement:** Legal footer added to all theme layouts (default, VCR, iPod, Receipt) to ensure consistent compliance across all themes. Footer uses theme text color at reduced opacity for subtlety.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all components integrated cleanly with existing public page infrastructure.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for pixel integration:** Cookie consent infrastructure is in place. Pixel components (Facebook Pixel, Google Analytics) can now:
1. Listen for `consent-granted` event before loading tracking scripts
2. Listen for `consent-declined` event to not load tracking scripts
3. Check existing consent state from `linklobby-consent` cookie

**Privacy policy ready:** Privacy policy page will automatically reflect which pixels are enabled when artists add Facebook Pixel ID or GA Measurement ID to their settings.

**Legal compliance complete:** All GDPR/CCPA requirements met:
- ✓ Cookie consent with equal prominence accept/reject
- ✓ Privacy policy disclosing data collection practices
- ✓ Terms of service for platform usage
- ✓ User rights documented (GDPR + CCPA)

---
*Phase: 11-analytics-pixels-legal*
*Completed: 2026-02-05*
