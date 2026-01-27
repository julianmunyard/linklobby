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
- [ ] Phase 6: Advanced Cards *(Dropdown + Game Card)*
- [ ] Phase 6.1: Dropdown Card Fix *(collapse, drag, reorder)*
- [ ] Phase 7: Theme System *(core differentiator)*
- [ ] Phase 8: Public Page *(includes page states, SEO, draft sharing)*
- [ ] Phase 9: Platform Integrations
- [ ] Phase 9.5: Onboarding *(first-time UX, templates)*

### Growth Milestone (v1.1)
- [ ] Phase 10: Fan Tools *(email, QR, release mode)*
- [ ] Phase 11: Analytics & Pixels *(tracking pixels, cookie consent, legal compliance)*
- [ ] Phase 12: Audio System
- [ ] Phase 12.5: Billing & Subscriptions *(Stripe, plan management)*

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
**Goal:** Fix all dropdown card issues discovered during Phase 6 implementation
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
4. Cards can be dragged into and out of dropdowns
5. No "stuck" states or loss of functionality
6. Works on both desktop and mobile

**Technical Approach:**
- Simplify event handling - clear separation between toggle click and drag
- Use dedicated drag handle for dropdown reordering
- Proper nested SortableContext with correct drag handlers
- State isolation to prevent corruption

**Plans:** TBD (research needed)

---

#### Phase 7: Theme System
**Goal:** Artists can select themes that skin all cards consistently
**Competitive context:** CORE DIFFERENTIATOR - themes that feel like album art, not marketing pages

**Success Criteria:**
1. Mac OS theme: Shadows, traffic light icons, window-like depth
2. Sleek Modern theme: Transparent, glass texture, flat aesthetic
3. Dark mode default (artists/DJs aesthetic preference)
4. Theme selection instantly updates all cards
5. Color customization: background, text, border, accent
6. Preset color palettes per theme
7. Gradient and solid background options

**Plans:** 3-4 plans

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

**Plans:** 3-4 plans

---

#### Phase 9: Platform Integrations
**Goal:** Artists can embed content from major platforms
**Competitive context:** Table stakes, but execution matters

**Success Criteria:**
1. Music: Spotify, Apple Music, SoundCloud, Audiomack, Bandcamp embeds
2. Video: YouTube, TikTok Video, Vimeo embeds
3. Social: Instagram, TikTok Profile, Twitter/X link cards
4. Payments: PayPal, Venmo, Tip Jar, Shopify links
5. Platform auto-detected from URL where possible
6. Platform icons display correctly

**Note:** Bandsintown moved to Phase 13 (Tour & Events) for first-class treatment

**Additional integrations for v1.1+:**
- Discord, Patreon, Ko-fi, Twitch
- Podcasts (Apple Podcasts, Spotify for Podcasters)
- Newsletters (Substack, Buttondown)
- Newer platforms (Threads, Bluesky)

**Plans:** 3-4 plans

---

#### Phase 9.5: Onboarding
**Goal:** New users have a smooth first experience and understand the product quickly
**Competitive context:** Good onboarding reduces churn and support load

**Success Criteria:**
1. **Welcome flow** - brief intro after first login
2. **Template gallery** - start from pre-made templates (not just blank)
3. **Template categories** - "Musician", "DJ", "Producer", "Band" etc.
4. **Guided setup** - optional walkthrough of key features
5. **Sample content** - templates include placeholder content to customize
6. **Quick wins** - guide user to publish something fast
7. **Empty state coaching** - helpful prompts when canvas is empty
8. **Feature discovery** - subtle hints for advanced features

**Plans:** 2 plans

---

### GROWTH MILESTONE (v1.1)

#### Phase 10: Fan Tools
**Goal:** Artists can capture fan data and control release timing
**Competitive context:** ADDRESSES MAJOR GAP - fan data ownership, release workflows

**Success Criteria:**
1. **Email Collection Block:** Inline form to capture emails
2. **Email Export:** CSV download of all collected emails
3. **Mailchimp Integration:** Optional sync to Mailchimp list
4. **QR Code Generation:** Auto-generated QR for page URL (for flyers, merch)
5. **Release Mode:** Temporary prominence for featured content with countdown
6. **Link Scheduling:** Publish/expire links at specific times

**Plans:** 3-4 plans

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

**Plans:** 4 plans

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

**Plans:** 3-4 plans

---

#### Phase 12.5: Billing & Subscriptions
**Goal:** LinkLobby can monetize through paid tiers
**Competitive context:** Standard SaaS model - needed for sustainability

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

**Plans:** 3-4 plans

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
| **v1.1 Growth** | 10-12.5 | Fan tools, analytics+pixels+legal, audio players, billing | TBD |
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

---

*Last updated: 2026-01-27*
*Based on: COMPETITORS.md competitive analysis*
