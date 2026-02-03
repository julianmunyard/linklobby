# Phase 8: Public Page - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

The visitor-facing profile page at `linklobby.com/username`. Renders artist pages with themes applied, handles page states (published/unpublished/404), implements SEO and social sharing, and provides preview functionality for artists before publishing.

</domain>

<decisions>
## Implementation Decisions

### Page States
- **Two states only:** Published (live) or Unpublished (not visible)
- No "Coming Soon" state — unnecessary complexity
- Unpublished pages return **404** — same as non-existent usernames
- Published page with zero cards shows profile header only (no special message)
- 404 page uses **Ishmeria font** for the error message

### SEO & Social Sharing
- OG image is a **dynamic screenshot** of the page (above-the-fold only)
- Meta description format: **"[Artist Name] links"**
- Twitter Cards: Standard card format with screenshot
- Sitemap.xml: Auto-generated with all published pages
- robots.txt: Standard configuration

### Preview & Draft Sharing
- **No external draft sharing** — preview is in-editor only
- "Preview" button opens the **actual public page URL in a new tab**
- Artists can only view their page publicly while logged in and unpublished
- **No owner indicator** — page looks exactly as visitors see it (clean preview)

### Loading & Performance
- **Server-side rendering (SSR)** — instant render, no loading skeleton
- All images load immediately (no lazy loading)
- Video embeds can hydrate async — page structure loads instantly, embeds follow
- Performance target: **As fast as possible** (no hard number, just optimize well)

### Claude's Discretion
- Structured data (JSON-LD) — Claude decides if Person schema is worth adding
- 404 page design details — keep it minimal with Ishmeria font
- OG image generation approach — Playwright, Puppeteer, or similar

</decisions>

<specifics>
## Specific Ideas

- 404 message should use **Ishmeria font** (matches System Settings theme aesthetic)
- Page should "boom load up" — instant feel, embeds can catch up
- Preview opens in new tab so artists see exactly what visitors see

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-public-page*
*Context gathered: 2026-02-03*
