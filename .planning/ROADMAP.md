# Roadmap: LinkLobby

## Overview

LinkLobby delivers a component-based page builder for artists in phases. This roadmap incorporates competitive insights to ensure LinkLobby addresses gaps that Linktree and others leave unfilled.

**Architecture:** Cards (shapes) + Content (what's inside) + Themes (visual skin) = Artist's page

**Competitive Edge:** Audio-native, visually distinctive, fan data ownership, no transaction fees

---

## Phase Summary

### Completed (v1.0 Core)
- [x] Phase 1: Foundation
- [x] Phase 2: Dashboard Shell
- [x] Phase 3: Canvas System
- [x] Phase 4: Basic Cards
- [x] Phase 4.1: Flow Layout
- [x] Phase 4.2: Linktree Import
- [x] Phase 4.3: Card Context Menu
- [x] Phase 4.4: Profile Editor
- [x] Phase 4.5: Editor Polish
- [x] Phase 5: Media Cards

### MVP Milestone (v1.0 Launch)
- [x] Phase 4.4: Profile Editor *(name, photo, social icons)* ✓
- [x] Phase 4.5: Editor Polish *(mobile responsive, error handling, image optimization)* ✓
- [x] Phase 5: Media Cards ✓
- [x] Phase 6: Advanced Cards *(Game Card shipped, Dropdown Card dropped)* ✓
- [x] Phase 7: Theme System *(core differentiator)* ✓
- [x] Phase 8: Public Page *(includes page states, SEO, draft sharing)* ✓
- [x] Phase 9: Platform Integrations *(Spotify, Apple Music, SoundCloud, YouTube, TikTok, etc.)* ✓

### Growth Milestone (v1.1)
- [x] Phase 10: Fan Tools *(email, QR, release mode)* ✓
- [x] Phase 11: Analytics & Pixels *(tracking pixels, cookie consent, legal compliance)* ✓
- [x] Phase 12: Audio System ✓
- [x] Phase 12.1: Scatter Mode *(freeform card positioning for select themes)* ✓
- [x] Phase 12.2: Theme Templates *(pre-built starter pages per theme)* ✓
- [ ] Phase 12.5: Billing & Subscriptions *(Stripe, plan management)*
- [x] Phase 12.6: Security Hardening & Auth Completion *(OAuth, rate limiting, 2FA, security headers, cookie consent)* ✓
- [ ] Phase 12.7: Production Readiness & Onboarding *(Sentry, transactional emails, CI/CD, onboarding, templates, guided setup)*
- [ ] Phase 12.8: Theme System Overhaul *(cleanup, unification, new themes, UI polish)*

### Pro Milestone (v1.2)
- [ ] Phase 13: Tour & Events *(first-class tour dates)*
- [ ] Phase 14: Custom Domains
- [ ] Phase 15: Advanced Analytics *(geo, referrer, time patterns)*
- [ ] Phase 16: Accessibility *(a11y audit, keyboard nav, screen readers)*

---

## Detailed Phase Breakdown

### COMPLETED PHASES

#### Phase 1: Foundation ✓
Project scaffolding, Supabase auth, database schema

#### Phase 2: Dashboard Shell ✓
Split-screen layout, navigation, preview system

#### Phase 3: Canvas System ✓
Vertical stack layout, drag-to-reorder, card sizing

#### Phase 4: Basic Cards ✓
Hero Card, Horizontal Link, Square Card components

#### Phase 4.1: Flow Layout ✓
Grid/flow canvas with side-by-side card sizing

#### Phase 4.2: Linktree Import ✓
One-click import from Linktree with visual variety

---

### MVP MILESTONE (v1.0 Launch)

#### Phase 4.3: Card Context Menu & Undo/Redo
**Goal:** Artists can convert card types, duplicate/delete cards, and undo mistakes safely
**Competitive context:** Polish and UX - makes experimentation frictionless

**Success Criteria:**
1. **Card type picker** - icon tiles in property editor to switch between Hero, Horizontal, Square
2. **Convert preserves content** - title, description, URL, image maintained when switching types
3. **Duplicate** - creates copy below original card
4. **Delete** - removes card immediately, shows toast with Undo button
5. **Undo/Redo stack** - Ctrl/Cmd+Z to undo, Ctrl/Cmd+Shift+Z to redo
6. **Undo/Redo buttons** - visible in header for mobile and discoverability
7. Undo works for: add, delete, reorder, convert, property changes
8. Visual feedback when undo/redo occurs (toast notification)
9. History paused during drag operations

**Plans:** 2 plans

Plans:
- [x] 04.3-01-PLAN.md - Undo/Redo Infrastructure
- [x] 04.3-02-PLAN.md - Card Actions & Type Picker

---

#### Phase 4.4: Profile Editor
**Goal:** Artists can edit their profile header (photo, title, layout, social icons) displayed at the top of their page
**Competitive context:** Table stakes - every link-in-bio has this

**Success Criteria:**
1. **Display name** - editable text, shows at top of page
2. **Profile photo** - upload with crop/resize (universal crop component)
3. **Profile layout** - Classic (small circle) or Hero (larger/banner)
4. **Title style** - Text or Logo with size picker
5. **Social icons row** - add/remove/reorder platform icons (Big 5: Instagram, TikTok, YouTube, Spotify, Twitter/X)
6. **Social icons toggle** - show/hide in header
7. Profile section in Design tab (Header section)
8. Live preview updates as profile is edited
9. **Profile persistence** - changes save to database

**Plans:** 8 plans

Plans:
- [ ] 04.4-01-PLAN.md - Profile Types & Store
- [ ] 04.4-02-PLAN.md - Image Crop Component
- [ ] 04.4-03-PLAN.md - Profile Storage Utilities
- [ ] 04.4-04-PLAN.md - Design Tab & Header Section
- [ ] 04.4-05-PLAN.md - Social Icons Components
- [ ] 04.4-06-PLAN.md - Social Icons Integration
- [ ] 04.4-07-PLAN.md - Preview Integration & Verification
- [ ] 04.4-08-PLAN.md - Database Persistence

---

#### Phase 4.5: Editor Polish
**Goal:** Editor works flawlessly on mobile and handles errors gracefully
**Competitive context:** CRUCIAL - artists edit on their phones constantly

**Success Criteria:**
1. **Mobile responsive editor** - full editing capability on phone/tablet
2. Touch-friendly controls (larger tap targets, swipe gestures)
3. Mobile-optimized sidebar (slide-out drawer or bottom sheet)
4. **Image optimization** - auto-compress uploads, support PNG/JPG/WebP/GIF
5. **Link URL validation** - detect malformed URLs, auto-add https://
6. **Broken link detection** - warn if URL returns 404 (async check) [DEFERRED - CORS issues]
7. **Error handling** - graceful failures with retry options
8. Upload failure recovery (resume or retry)
9. Save failure handling (retry with exponential backoff)
10. Offline indicator (warn user if connection lost)

**Plans:** 3 plans

Plans:
- [x] 04.5-01-PLAN.md — Mobile foundation hooks and utilities
- [x] 04.5-02-PLAN.md — Mobile layout and bottom sheet navigation
- [x] 04.5-03-PLAN.md — Error handling, image compression, URL validation

---

#### Phase 5: Media Cards
**Goal:** Artists can showcase video and photo content with engaging animations
**Competitive context:** Table stakes - every competitor has this

**Success Criteria:**
1. Video Card displays video (YouTube/Vimeo embed or upload)
2. Photo Gallery with multi-image carousel
3. ReactBits animations (auto-scroll, arrows)
4. Gallery supports add/remove/reorder
5. Video Card supports short loop option (muted autoplay)

**Plans:** 3 plans

Plans:
- [x] 05-01-PLAN.md — Types, dependencies, and video infrastructure
- [x] 05-02-PLAN.md — Video Card component and editor
- [x] 05-03-PLAN.md — Photo Gallery Card with Circular Gallery and Carousel styles

---

#### Phase 6: Advanced Cards
**Goal:** Artists can add interactive elements that engage visitors
**Competitive context:** Differentiation through interactivity and delight

**Success Criteria:**
1. **Dropdown Card:** Expandable container holding multiple cards
2. Dropdown supports custom collapse/expand text
3. **Game Card:** Playable games (Snake, Breakout, Flappy) embedded in card
4. Games use fixed retro arcade aesthetic (no high scores for v1)
5. Both cards render correctly within theme system
6. **Multi-select:** Box selection (desktop) and checkbox mode (mobile)
7. **Bulk actions:** Group into Dropdown, Move to Dropdown, Delete All

**Plans:** 16 plans

Plans:
- [ ] 06-01-PLAN.md — Dropdown types and store actions
- [ ] 06-02-PLAN.md — Game types and game loop/swipe hooks
- [ ] 06-03-PLAN.md — Multi-select context and state management
- [ ] 06-04-PLAN.md — Install @air/react-drag-to-select
- [ ] 06-05-PLAN.md — Dropdown Card UI component
- [ ] 06-06-PLAN.md — Nested dnd-kit container structure
- [ ] 06-07-PLAN.md — Game Card wrapper component
- [ ] 06-08-PLAN.md — Snake game implementation
- [ ] 06-09-PLAN.md — Breakout game implementation
- [ ] 06-10-PLAN.md — Flappy Bird game implementation
- [ ] 06-11-PLAN.md — Dropdown editor fields and card picker
- [ ] 06-12-PLAN.md — Game card editor fields
- [ ] 06-13-PLAN.md — Multi-select box selection (desktop)
- [ ] 06-14-PLAN.md — Selection toolbar and bulk actions
- [ ] 06-15-PLAN.md — Mobile checkbox select mode
- [ ] 06-16-PLAN.md — Human verification checkpoint

---

#### Phase 6.1: Dropdown Card Fix
**Goal:** Fix all dropdown card interaction bugs - toggle, drag, child reorder
**Context:** Phase 6 dropdown implementation has critical bugs that need dedicated attention

**Known Issues:**
1. **Collapse/Expand broken** - Dropdown toggle is inconsistent, sometimes stops working entirely
2. **Cards inside dropdown not draggable** - Child cards should reorder within dropdown like main canvas
3. **Dropdown not draggable** - Dropdown card itself can't be reordered on the main canvas
4. **State corruption** - Dropdown gets "stuck" and loses functionality after certain interactions
5. **Event conflicts** - dnd-kit, Radix, and click handlers fighting for events

**Success Criteria:**
1. Dropdown expand/collapse works reliably on every tap/click
2. Cards inside dropdown can be dragged to reorder within the dropdown
3. Dropdown card can be dragged to reorder on main canvas
4. No "stuck" states or loss of functionality
5. Works on both desktop and mobile

**Not in scope:** Cross-container drag (moving cards into/out of dropdowns by dragging) - cards are added to dropdowns via editor panel checkboxes

**Technical Approach:**
- Simplify event handling - clear separation between toggle click and drag
- Use dedicated drag handle for dropdown reordering
- Proper nested SortableContext with correct drag handlers
- State isolation to prevent corruption

**Plans:** 2 plans

Plans:
- [ ] 06.1-01-PLAN.md — Refactor DropdownSortable and DropdownCard (toggle + drag fix)
- [ ] 06.1-02-PLAN.md — Child card drag handles and human verification

---

#### Phase 7: Theme System
**Goal:** Artists can select themes that skin all cards consistently
**Competitive context:** CORE DIFFERENTIATOR - themes that feel like album art, not marketing pages

**Success Criteria:**
1. Mac OS theme: Shadows, traffic light icons, window-like depth
2. Sleek Modern theme: Transparent, glass texture, flat aesthetic
3. Instagram Reels theme: Bold, high contrast styling
4. Dark mode default (artists/DJs aesthetic preference)
5. Theme selection instantly updates all cards
6. Color customization: background, text, border, accent, card bg, link
7. Preset color palettes per theme (2-3 each)
8. Font selection: curated list of 15 fonts, separate heading/body
9. Style controls: border radius, shadows, blur intensity
10. Background options: solid color, image, video

**Plans:** 7 plans

Plans:
- [ ] 07-01-PLAN.md — Theme infrastructure (types, store, configs, applicator)
- [ ] 07-02-PLAN.md — Theme CSS variables and font loading
- [ ] 07-03-PLAN.md — Theme presets tab and theme panel UI
- [ ] 07-04-PLAN.md — Color customization with react-colorful
- [ ] 07-05-PLAN.md — Font picker and style controls
- [ ] 07-06-PLAN.md — Theme-aware card wrappers (Mac OS, Glass)
- [ ] 07-07-PLAN.md — Background controls and verification

---

#### Phase 8: Public Page
**Goal:** Visitors can view artist pages that load fast and share well
**Competitive context:** Performance is a differentiator vs Beacons (slow/bloated)

**Success Criteria:**
1. Public page at linklobby.com/username loads in < 2 seconds
2. All cards render with correct theme styling
3. Canvas layout matches editor preview exactly
4. Responsive across mobile, tablet, desktop
5. Open Graph meta tags and preview image for social sharing
6. Interactive elements work for visitors

**Page States:**
7. **Published** - default, page is live
8. **Unpublished / Coming Soon** - page shows "coming soon" message
9. **404 page** - friendly error for non-existent usernames
10. **Empty state** - message if artist has no cards yet

**SEO & Sharing:**
11. **sitemap.xml** - auto-generated, lists all public pages
12. **robots.txt** - proper configuration
13. **Structured data** - JSON-LD for Person/MusicGroup schema
14. **Twitter Card** meta tags
15. **Draft/Preview sharing** - shareable link for unpublished pages (for feedback)

**Plans:** 4 plans ✓

Plans:
- [x] 08-01-PLAN.md - Data Infrastructure (is_published, fetchPublicPageData)
- [x] 08-02-PLAN.md - Static Render Components
- [x] 08-03-PLAN.md - Dynamic Route & 404
- [x] 08-04-PLAN.md - SEO Features (OG images, sitemap, robots.txt)

---

#### Phase 9: Platform Integrations
**Goal:** Artists can embed content from major platforms with one-at-a-time playback
**Competitive context:** Table stakes, but execution matters

**Success Criteria:**
1. Music: Spotify, Apple Music, SoundCloud, Audiomack, Bandcamp embeds
2. Video: YouTube, TikTok Video, Vimeo embeds (existing + Instagram)
3. Vertical 9:16 content: TikTok and Instagram Reels display correctly
4. Platform auto-detected from URL
5. One-at-a-time playback coordination
6. Platform icons display correctly

**Deferred to later phases:**
- Payments: PayPal, Venmo, Tip Jar, Shopify links
- Social profile links: Instagram profile, TikTok profile, Twitter/X

**Note:** Bandsintown moved to Phase 13 (Tour & Events) for first-class treatment

**Plans:** 6 plans

Plans:
- [ ] 09-01-PLAN.md — Platform detection and music card types
- [ ] 09-02-PLAN.md — Playback coordination context
- [ ] 09-03-PLAN.md — Music card component and editor
- [ ] 09-04-PLAN.md — Vertical 9:16 embed support
- [ ] 09-05-PLAN.md — Integration and playback wiring
- [ ] 09-06-PLAN.md — Human verification checkpoint

---

#### ~~Phase 9.5: Onboarding~~ *(merged into Phase 12.7)*

---

### GROWTH MILESTONE (v1.1)

#### Phase 10: Fan Tools ✓
**Goal:** Artists can capture fan data and control release timing
**Competitive context:** ADDRESSES MAJOR GAP - fan data ownership, release workflows

**Success Criteria:**
1. **Email Collection Block:** Inline form to capture emails ✓
2. **Email Export:** CSV download of all collected emails ✓
3. **Mailchimp Integration:** Optional sync to Mailchimp list ✓
4. **QR Code Generation:** Auto-generated QR for page URL (for flyers, merch) ✓
5. **Release Mode:** Temporary prominence for featured content with countdown ✓
6. **Link Scheduling:** Publish/expire links at specific times ✓

**Plans:** 4 plans

Plans:
- [x] 10-01-PLAN.md — Email collection card type and API
- [x] 10-02-PLAN.md — QR code dialog, CSV export, Mailchimp sync
- [x] 10-03-PLAN.md — Link scheduling infrastructure and Schedule tab
- [x] 10-04-PLAN.md — Release card with countdown and auto-conversion

---

#### Phase 11: Analytics, Pixels & Legal Compliance
**Goal:** Artists can track performance, retarget visitors, and comply with privacy laws
**Competitive context:** ADDRESSES MAJOR GAP - pixel tracking for ad campaigns

**Analytics:**
1. Page views and unique visitors tracked and displayed
2. Per-card click counts and CTR displayed
3. Insights tab shows metrics with visual charts
4. Time period filtering (7 days, 30 days, all time)
5. **Facebook Pixel Integration:** Paste pixel ID, track page views + clicks
6. **Google Analytics Integration:** GA4 measurement ID support
7. Game/gallery interaction tracking

**Legal & Compliance (required for pixels):**
8. **Cookie consent banner** - GDPR/CCPA compliant, only loads pixels after consent
9. **Privacy policy page** - auto-generated or link to custom
10. **Terms of service** - for LinkLobby platform
11. **GDPR data export** - user can download all their data
12. **Account deletion** - user can delete account and all data
13. Cookie preferences saved per visitor

**Plans:** 5 plans ✓

Plans:
- [x] 11-01-PLAN.md — Analytics database schema, tracking API, and public page click tracking
- [x] 11-02-PLAN.md — Cookie consent banner, privacy policy generator, and terms of service
- [x] 11-03-PLAN.md — Insights tab dashboard with charts, metrics, and card leaderboard
- [x] 11-04-PLAN.md — Facebook Pixel, GA4 integration, Conversions API, and pixel config UI
- [x] 11-05-PLAN.md — GDPR data export (ZIP) and account deletion with 30-day grace period

---

#### Phase 12: Audio System
**Goal:** Artists can upload audio with styled players
**Competitive context:** CORE DIFFERENTIATOR - no competitor has styled audio players

**Success Criteria:**
1. Audio upload (WAV converts to MP3)
2. Audio player renders as card on canvas
3. Five player styles: Waveform, Vinyl, OP-1, Cassette, Minimal
4. Visitors can play, pause, scrub; never autoplays
5. Optional varispeed and reverb controls
6. Audio plays tracked for analytics

**Plans:** 5 plans

Plans:
- [ ] 12-01-PLAN.md -- Audio types, upload API, storage, and webpack config
- [ ] 12-02-PLAN.md -- Audio engine port (Superpowered SDK, AudioWorklet, iOS unlock)
- [ ] 12-03-PLAN.md -- Audio player UI components (controls, varispeed, reverb, waveform, track list)
- [ ] 12-04-PLAN.md -- Audio card component, editor fields, and card system wiring
- [ ] 12-05-PLAN.md -- Theme-specific player styling, analytics tracking, and verification

---

#### Phase 12.1: Scatter Mode
**Goal:** Artists can toggle freeform card positioning on select themes — drag cards anywhere, resize freely, save layout. Optional visitor drag on public pages.
**Competitive context:** UNIQUE DIFFERENTIATOR - no competitor offers freeform canvas positioning

**Success Criteria:**
1. Scatter mode toggle for 5 themes: Mac OS, Instagram Reels, System Settings, Macintosh, Word Art
2. Artist can freely drag cards anywhere on canvas (totally free, visual grid overlay for optional alignment)
3. Artist can freely resize cards by dragging corners/edges, content scales perfectly
4. Z-index: last moved card goes to front
5. Cards constrained within canvas bounds
6. Positions and sizes stored as percentages, per-theme (switching themes preserves each theme's layout)
7. Public page renders exact artist arrangement
8. Optional visitor drag toggle — visitors can move cards on public page (resets on refresh)
9. Mobile-first: mobile preview is source of truth, scales proportionally to desktop
10. Click vs drag distinction: tap/click = follow link, hold+move = drag (no delay)

**Plans:** 5 plans

Plans:
- [ ] 12.1-01-PLAN.md — Scatter types, store actions, and theme toggles
- [ ] 12.1-02-PLAN.md — ScatterCanvas and ScatterCard with react-rnd
- [ ] 12.1-03-PLAN.md — Editor integration (style toggle, preview panel wiring)
- [ ] 12.1-04-PLAN.md — Public page scatter rendering and visitor drag
- [ ] 12.1-05-PLAN.md — Build verification and end-to-end human testing

---

#### Phase 12.2: Theme Templates
**Goal:** Ship curated, artist-inspired templates per theme — fully designed pages with real photos, background GIFs, audio, colors, and layout. Users pick a template and get a complete page ready to customize with their own content.
**Competitive context:** ADDRESSES GAP — Linktree templates are generic. LinkLobby templates are artist-energy-driven, curated by the developer with real media and aesthetic vision (e.g. "ASAP Rocky vibes", "indie folk", "techno DJ").

**Dev-Only Template Builder (not shipped to production):**
1. **"Save as Template" dev tool** — dev-only button/route (behind env flag `NEXT_PUBLIC_DEV_TOOLS=true`) that snapshots the current page state
2. **Full page snapshot** — captures everything: all cards (type, title, content, URLs, size, position, sort order), theme settings (palette, colors, transparency, fonts), profile config (title style, layout, social icons), and all uploaded media references
3. **Media asset bundling** — all images, background GIFs, and audio files used in the page are copied to a template assets directory (e.g. `public/templates/{template-id}/`) so they ship with the app
4. **Template metadata editor** — dev UI to name the template, add description, tags, and assign to a theme
5. **Template export format** — JSON file per template containing full page state + relative paths to bundled assets

**User-Facing Template Picker (production):**
6. **Template picker UI** — after selecting a theme, show a grid/carousel of template previews with names and descriptions
7. **Template preview** — live preview or static screenshot showing the full designed page before applying
8. **Template application** — "Use Template" creates all cards, uploads template assets to user's storage, applies theme settings and profile defaults. Confirmation dialog if user has existing cards.
9. **Mobile template picker** — template selection works well on mobile drawer

**Per-Theme Templates (designed by developer in editor):**
10. **Instagram Reels templates** — 3-6 curated pages with the clean modern aesthetic
11. **System Settings templates** — 3-6 curated pages with Poolsuite retro feel
12. **Blinkies templates** — 3-6 curated pages with animated blinkie aesthetic
13. **Mac OS templates** — 3-6 curated pages with traffic light window chrome
14. **Macintosh templates** — 3-6 curated pages with classic 8-bit Mac feel
15. **Classified templates** — 3-6 curated pages with WWII document aesthetic
16. **Departures Board templates** — 3-6 curated pages with airport display style
17. **Receipt templates** — 3-6 curated pages with thermal receipt aesthetic
18. **iPod Classic templates** — 3-6 curated pages with click wheel navigation
19. **VCR Menu templates** — 3-6 curated pages with VHS aesthetic

**Polish:**
20. **Template thumbnails** — auto-generated from snapshot or manually designed preview images
21. **Template metadata** — name, description, tags, artist-energy label for each template

**Plans:** 4 plans

Plans:
- [ ] 12.2-01-PLAN.md — Template types, data infrastructure, and first template
- [ ] 12.2-02-PLAN.md — Dev-only snapshot tool (Save as Template)
- [ ] 12.2-03-PLAN.md — Template application API route
- [ ] 12.2-04-PLAN.md — Template picker UI and ThemePanel integration

---

#### Phase 12.5: Billing & Subscriptions
**Goal:** LinkLobby can monetize through paid tiers
**Competitive context:** Standard SaaS model - needed for sustainability
**Note:** Can be deferred if launching free-only first

**Success Criteria:**
1. **Stripe integration** - secure payment processing
2. **Plan selection UI** - Free / Pro / Artist tier comparison
3. **Checkout flow** - upgrade from Free to paid
4. **Subscription management** - view plan, billing history, cancel
5. **Payment method management** - add/update card
6. **Upgrade prompts** - contextual prompts when hitting Free limits
7. **Graceful degradation** - if subscription lapses, page stays live but pro features disabled
8. **Trial period** - optional X-day trial of Pro features
9. **Receipts/invoices** - email receipts, downloadable invoices
10. Webhook handling for subscription events

**Plans:** 4 plans

Plans:
- [ ] 12.5-01-PLAN.md — Stripe infrastructure, DB schema, webhook handler, checkout & portal API routes
- [ ] 12.5-02-PLAN.md — Pricing page, billing settings, plan badge, upgrade modal
- [ ] 12.5-03-PLAN.md — ProGate editor badges, public page feature stripping, branding & theme gating
- [ ] 12.5-04-PLAN.md — Build verification and human verification checkpoint

---

#### Phase 12.6: Security Hardening & Auth Completion
**Goal:** Lock down the app for real users — complete auth system, protect all endpoints, harden security posture
**Competitive context:** Table stakes for any production app handling user accounts and data

**Authentication:**
1. **Google OAuth** — "Continue with Google" on login/signup (Supabase provider + UI button)
2. **Email verification** — require email confirmation on signup before publishing
3. **Forgot password** — password reset flow via email (Supabase built-in + UI)
4. **Change password** — in settings, requires current password confirmation
5. **Change email** — in settings, sends verification to new email before switching
6. **2FA / Two-step verification** — optional TOTP via authenticator app, with backup codes
7. **Session management** — view active sessions, sign out individual sessions or all

**Rate Limiting:**
8. **Rate limit middleware** — Upstash Redis + `@upstash/ratelimit` across all API routes
9. Login: 5 attempts/15min, Signup: 3/hour, Password reset: 3/15min per email
10. Email collection (public): 10/min per IP, Audio upload: 5/hour per user
11. General API: 60 req/min per user, Analytics tracking: 30 events/min per IP

**Security Headers & Protection:**
12. **CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy** in next.config.ts
13. **Input sanitization** — DOMPurify on all user-generated text (card titles, descriptions, bio)
14. **CSRF protection** — verify Origin header on mutation API routes
15. **File type validation** — server-side MIME type checking on all uploads (audio + images)

**Cookie Consent:**
16. **Wire up react-cookie-consent** — already in package.json, needs implementation
17. Theme-aware banner on public pages when pixels are enabled
18. Pixels only fire after explicit consent

**Storage & Cleanup:**
19. **Storage quota per user** — 500MB for free tier, tracked in profiles table
20. **Orphaned file cleanup** — delete storage files when associated card is deleted

**Plans:** 7 plans ✓

Plans:
- [x] 12.6-01-PLAN.md — Security headers (CSP, HSTS, etc.), CSRF origin validation, DOMPurify input sanitization
- [x] 12.6-02-PLAN.md — Upstash Redis rate limiting on all API routes with fail-open behavior
- [x] 12.6-03-PLAN.md — Google OAuth, forgot password, reset password flows
- [x] 12.6-04-PLAN.md — Change password/email in settings, email verification, publish gate
- [x] 12.6-05-PLAN.md — TOTP 2FA with backup codes, MFA challenge page, middleware enforcement
- [x] 12.6-06-PLAN.md — Session management, cookie consent on public pages
- [x] 12.6-07-PLAN.md — MIME validation, 500MB storage quota tracking, orphaned file cleanup

---

#### Phase 12.7: Production Readiness, Operations & Onboarding
**Goal:** Everything operational that a production app needs beyond features — monitoring, email, CI/CD, performance, SEO, support — plus first-time user onboarding
**Competitive context:** The difference between a side project and a real product. Good onboarding reduces churn.

**Error Tracking & Monitoring:**
1. **Sentry integration** — `@sentry/nextjs` for client + server error capture
2. **Custom error pages** — `error.tsx` (global boundary), improved `not-found.tsx`, `global-error.tsx`
3. **Performance monitoring** — Sentry traces on public page load, editor save, audio upload
4. **Error alerts** — email notification on error spikes
5. **Uptime monitoring** — free service (Uptime Robot) pinging homepage + a public page every 5min

**Transactional Email:**
6. **Resend integration** — transactional email provider
7. **Supabase custom SMTP** — point auth emails through Resend for branded sender (hello@linklobby.com)
8. Welcome email, password reset, email change confirmation, deletion notices
9. Clean HTML email templates with LinkLobby branding

**CI/CD & Environments:**
10. **GitHub Actions** — type-check + lint + build on every PR
11. **Branch protection** — require CI pass before merge to main
12. **Preview deployments** — Vercel preview on every PR
13. **Staging environment** — separate Vercel + Supabase project
14. **`.env.example`** — document all required/optional env vars with descriptions

**Structured Logging:**
15. **Pino logger** — structured JSON logging on server API routes
16. **Request logging** — method, path, user ID, duration, status code
17. **No PII in logs** — never log emails, passwords, or full IPs

**Performance Hardening:**
18. **Cache-Control headers** — static assets immutable, public pages s-maxage=60, API private no-cache
19. **Bundle analysis** — run `@next/bundle-analyzer` to identify oversized deps
20. **Dynamic imports audit** — verify heavy components (games, audio, color picker) are lazy loaded
21. **Image audit** — verify all user images use next/image, no raw `<img>` tags
22. **Analytics event batching** — buffer tracking events client-side, send in batches (every 3-5s or on page unload) instead of one API call per event. Reduces database write load by 80-90% at scale.
23. **Analytics table partitioning** — partition analytics tables by month so queries only scan recent data. Enables efficient archival of old months.

**SEO Enhancements:**
24. **JSON-LD structured data** — Person/MusicGroup + WebPage schemas on public pages
25. **Canonical URLs** — explicit canonical tag on each public page
26. **Meta descriptions** — auto-generate from user bio/card titles

**Database Operations:**
27. **Backup strategy** — document/verify Supabase plan includes daily backups + PITR
28. **Migration deployment docs** — document process for running migrations on production
29. **Index audit** — verify indexes on user_id, page_id, username, analytics created_at

**Contact & Support:**
30. **Contact page** (`/contact`) — support email, FAQ link, bug report link
31. **Footer links** — contact, terms, privacy on public-facing pages
32. **In-app help icon** — "?" in editor linking to support

**Resilience:**
33. **Offline indicator** — detect lost connection in editor, show reconnection banner
34. **Graceful degradation** — if Sentry/Resend are unreachable, app still works

**Onboarding (merged from Phase 9.5):**
35. **Welcome flow** — brief intro after first login
36. **Template gallery** — start from pre-made templates (not just blank)
37. **Guided setup** — optional walkthrough of key features
38. **Empty state coaching** — helpful prompts when canvas is empty
39. **Quick wins** — guide user to publish something fast

**Plans:** 6-7 plans

---

#### Phase 12.8: Theme System Overhaul
**Goal:** Unify theme infrastructure, clean up duplicated code, polish UI across all themes, and add new themes
**Competitive context:** Theme variety is the core visual differentiator — more polished themes = stronger brand identity for artists

**Backend Unification & Code Cleanup:**
1. **Centralise ThemeVariant type** — single source of truth instead of duplicated type definitions across 7+ audio component files
2. **Centralise variant maps** — extract the themeId→themeVariant mapping (duplicated in audio-card.tsx, static-flow-grid.tsx, static-scatter-canvas.tsx, static-macintosh-layout.tsx) into a shared utility
3. **Centralise poolsuite theme check** — the `isPoolsuiteTheme` boolean is duplicated across themed-card-wrapper.tsx, static-flow-grid.tsx, static-scatter-canvas.tsx; extract to shared config
4. **Audio player prop consistency** — audit all AudioPlayer call sites to ensure every public page passes the same props as the editor (autoplay, transparentBackground, blinkieColors, etc.)
5. **Clean up titleBarStyle routing** — the ternary chain for titleBarStyle is duplicated; extract to a `getTitleBarStyle(themeId)` helper
6. **Remove dead code** — audit for any leftover references to removed themes or unused theme branches

**UI Polish & Theme Consistency:**
7. **Audit every theme on public pages vs editor** — systematically verify each theme renders identically in both contexts
8. **Fix card wrapper consistency** — ensure all themes apply correct border radius, shadows, and spacing on both editor and public pages
9. **Mobile drawer theme support** — verify mobile card type drawer works correctly for all themes (blinkie tabs, macintosh cards, etc.)
10. **Font loading audit** — verify all theme-specific fonts (ChiKareGo, Pix Chicago, Special Elite, AuxMono, etc.) load correctly on public pages
11. **Palette/GIF editor polish** — clean up the color palette and GIF background editor UX for audio cards across all themes
12. **Social icons per-theme styling** — ensure social icons render consistently across all themes

**New Themes:**
13. **Research and design 4-6 new themes** — explore aesthetics that appeal to different artist genres (e.g. Y2K, vaporwave, brutalist, minimal Japanese, newspaper/editorial, neon/cyberpunk)
14. **Implement new themes** — theme config, CSS variables, fonts, card wrappers, audio player variants where needed
15. **New theme public page layouts** — custom public page layouts for themes that need them (like macintosh has its own layout)
16. **Theme preview thumbnails** — generate/design preview images for the theme picker

**Plans:** 4-5 plans

---

### PRO MILESTONE (v1.2)

#### Phase 13: Tour & Events
**Goal:** Artists can display tour dates with ticketing integration
**Competitive context:** ADDRESSES GAP - Bandsintown is shallow integration elsewhere

**Success Criteria:**
1. **Tour Dates Block:** List of upcoming shows with date, venue, city
2. **Bandsintown Sync:** Auto-import dates from Bandsintown profile
3. **Songkick Sync:** Alternative integration option
4. **Ticket Links:** Per-show ticket purchase buttons
5. **Geo-targeting:** Highlight shows near visitor (optional)
6. **Past Shows Archive:** Toggle to show/hide past dates

**Plans:** 2-3 plans

---

#### Phase 14: Custom Domains
**Goal:** Artists can use their own domain (yourname.com)
**Competitive context:** Standard pro feature - signals professionalism

**Success Criteria:**
1. Artist can add custom domain in settings
2. DNS verification flow (CNAME or A record)
3. SSL certificate auto-provisioned
4. Both custom domain and linklobby.com/username work
5. Primary domain selection (which shows in Open Graph)

**Plans:** 2 plans

---

#### Phase 15: Advanced Analytics
**Goal:** Artists get insights that help strategic decisions
**Competitive context:** ADDRESSES GAP - "where are my fans?" for tour planning

**Success Criteria:**
1. **Geographic Data:** Map of visitor locations by country/city
2. **Referrer Tracking:** Where visitors came from (Instagram, Twitter, direct)
3. **Device Breakdown:** Mobile vs desktop, iOS vs Android
4. **Time Patterns:** When fans engage most (hour/day heatmap)
5. **Click-to-platform correlation:** Which platforms get most engagement
6. **Export Data:** CSV export of all analytics

**Plans:** 2-3 plans

---

#### Phase 16: Accessibility
**Goal:** LinkLobby is usable by everyone, including users with disabilities
**Competitive context:** Legal compliance (ADA) and ethical responsibility

**Editor Accessibility:**
1. **Keyboard navigation** - all editor actions accessible via keyboard
2. **Focus management** - logical tab order, visible focus indicators
3. **Screen reader support** - proper ARIA labels on editor controls
4. **Reduced motion option** - respect prefers-reduced-motion

**Public Page Accessibility:**
5. **Alt text for images** - artists can add alt text to uploaded images
6. **Color contrast checking** - warn if custom colors have poor contrast
7. **Semantic HTML** - proper heading hierarchy, landmark regions
8. **Link purpose** - clear link text (not "click here")
9. **Audio player accessibility** - keyboard controls, screen reader announcements

**Compliance:**
10. **WCAG 2.1 AA audit** - identify and fix violations
11. **Accessibility statement** - public page describing a11y features

**Plans:** 2-3 plans

---

## Deferred to v2+

| Feature | Rationale |
|---------|-----------|
| Pre-save Links | Requires DistroKid/Feature.fm partnerships |
| Smart Music Links | Auto-routing to user's preferred platform is complex |
| In-app Sales/Marketplace | No transaction fees = no marketplace. Artists link to Shopify, Bandcamp, etc. |
| Multi-page Support | One account = one page is intentional for v1 |
| Mobile App | Web-first strategy |

---

## Competitive Feature Mapping

| Competitive Gap | Phase | How Addressed |
|-----------------|-------|---------------|
| Audio as first-class citizen | 12 | Styled players (OP-1, vinyl, waveform) |
| Visual identity that matches vibe | 7 | Themes that feel like album art |
| Tour/live show integration | 13 | First-class tour block with Bandsintown sync |
| Release-focused workflows | 10 | Release mode, link scheduling |
| Fan data ownership | 10, 15 | Email export, analytics CSV export |
| No transaction fees | - | No marketplace, just links to external stores |
| Speed and professionalism | 8 | Performance budget, sub-2s loads |
| Pixel tracking for retargeting | 11 | Facebook Pixel, Google Analytics |
| Email collection | 10 | Inline email capture block |
| QR codes | 10 | Auto-generated for offline promotion |
| Easy migration from Linktree | 4.2 | One-click import of existing links |
| Frictionless experimentation | 4.3 | Type picker, undo/redo |
| Interactive/memorable experience | 6 | Game Card (Snake), Dropdown lists |
| Quick organization | 6 | Multi-select cards → group into dropdown |
| Mobile editing | 4.5 | Fully responsive editor for phone/tablet |
| Error resilience | 4.5 | Graceful failures, retry, offline detection |
| Professional SEO | 8 | Sitemap, structured data, OG/Twitter cards |
| Page control | 8 | Unpublish, coming soon, draft sharing |
| Smooth onboarding | 9.5 | Templates, guided setup, empty state coaching |
| Legal compliance | 11 | Cookie consent, privacy policy, GDPR |
| Sustainable business | 12.5 | Stripe billing, subscription management |
| Inclusive design | 16 | WCAG 2.1 AA, keyboard nav, screen readers |
| Freeform canvas layout | 12.1 | Scatter mode - drag anywhere, resize freely |
| Security & trust | 12.6 | OAuth, rate limiting, 2FA, security headers, storage quotas |
| Production operations | 12.7 | Error tracking, transactional email, CI/CD, monitoring, structured logging |

---

## Pricing Tiers (Future)

Based on competitive analysis, suggested tier structure:

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | All cards, all themes, basic analytics, templates, LinkLobby branding |
| **Pro** | $12/mo | No branding, email collection, FB Pixel/GA, full analytics, QR codes, link scheduling, release mode |
| **Artist** | $20/mo | Custom domain, advanced analytics (geo, referrer), tour dates block, priority support |

**No transaction fees at any tier.** This is a key differentiator vs Linktree (12%) and Beacons (9%).

**Feature availability by tier:**
| Feature | Free | Pro | Artist |
|---------|------|-----|--------|
| All card types | ✓ | ✓ | ✓ |
| Themes & colors | ✓ | ✓ | ✓ |
| Templates | ✓ | ✓ | ✓ |
| Basic analytics | ✓ | ✓ | ✓ |
| Audio players | ✓ | ✓ | ✓ |
| Scatter mode | ✓ | ✓ | ✓ |
| Remove branding | - | ✓ | ✓ |
| Email collection | - | ✓ | ✓ |
| QR codes | - | ✓ | ✓ |
| FB Pixel / GA | - | ✓ | ✓ |
| Link scheduling | - | ✓ | ✓ |
| Release mode | - | ✓ | ✓ |
| Custom domain | - | - | ✓ |
| Geo analytics | - | - | ✓ |
| Tour dates block | - | - | ✓ |
| Priority support | - | - | ✓ |

---

## Milestone Summary

| Milestone | Phases | Key Deliverables | Target |
|-----------|--------|------------------|--------|
| **v1.0 MVP** | 4.2-9.5 | Import, context menu, profile, editor polish, media cards, advanced cards, themes, public pages, integrations, onboarding | TBD |
| **v1.1 Growth** | 10-12.7 | Fan tools, analytics+pixels+legal, audio players, scatter mode, billing, security hardening, production readiness | TBD |
| **v1.2 Pro** | 13-16 | Tour dates, custom domains, advanced analytics, accessibility | TBD |

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Linktree Import at 4.2 | Quick win for user acquisition, reduces switching friction |
| Undo/redo with context menu at 4.3 | Experimentation requires safety net |
| Profile Editor at 4.4 | Foundational feature needed before public pages |
| Mobile responsive editor at 4.5 | Artists edit on phones constantly - crucial |
| Advanced Cards (Dropdown + Game) at Phase 6 | Differentiation through interactivity |
| Theme system at Phase 7 | Core differentiator must be in MVP |
| Public page expanded at Phase 8 | Includes SEO, page states, draft sharing |
| Onboarding at Phase 9.5 | Reduce churn, help users succeed fast |
| Fan Tools as Phase 10 | Addresses competitor gaps (email, scheduling) |
| Legal compliance with pixels at Phase 11 | Cookie consent required for GDPR when using FB Pixel/GA |
| Billing at Phase 12.5 | Needed for sustainability before Pro features |
| Accessibility at Phase 16 | Legal compliance (ADA) and ethical responsibility |
| Tour & Events as dedicated Phase 13 | First-class treatment vs shallow integration |
| Security hardening at Phase 12.6 | Auth completion + rate limiting + headers must happen before real users |
| Production readiness at Phase 12.7 | Monitoring, email, CI/CD, logging = difference between side project and real product |
| Billing (12.5) can be deferred | Can launch free-only first, add billing before enabling paid tiers |

---

*Last updated: 2026-02-18*
*Based on: COMPETITORS.md competitive analysis*
