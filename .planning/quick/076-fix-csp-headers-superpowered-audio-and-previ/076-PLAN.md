---
phase: quick-076
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - next.config.ts
autonomous: true

must_haves:
  truths:
    - "Superpowered audio SDK can fetch WASM from cdn.jsdelivr.net and compile it"
    - "Editor preview iframe loads /preview without being blocked by X-Frame-Options or CSP"
    - "Embedded iframes (YouTube, Vimeo, Spotify, SoundCloud, TikTok) still load"
    - "Supabase auth, storage, and realtime still connect"
    - "Google Analytics and Facebook pixel scripts still load"
    - "Audio worklet processor loads from /processors/"
    - "upgrade-insecure-requests only applies in production (not dev)"
  artifacts:
    - path: "next.config.ts"
      provides: "CSP headers with all required origins whitelisted"
      contains: "wasm-unsafe-eval"
  key_links:
    - from: "next.config.ts CSP script-src"
      to: "cdn.jsdelivr.net"
      via: "wasm-unsafe-eval + cdn.jsdelivr.net origin"
      pattern: "wasm-unsafe-eval.*cdn\\.jsdelivr\\.net"
    - from: "next.config.ts /preview route"
      to: "editor iframe"
      via: "frame-ancestors 'self' + no X-Frame-Options"
      pattern: "frame-ancestors 'self'"
---

<objective>
Audit and finalize CSP header fixes in next.config.ts so all existing functionality works with the security headers added by phase 12.6-01.

Purpose: The security hardening phase added CSP headers but missed origins/directives needed by Superpowered audio SDK, the editor preview iframe, and dev-mode upgrade-insecure-requests. The working tree already has partial fixes applied — this plan audits completeness and commits the result.

Output: A correct, complete next.config.ts with CSP that does not break any existing feature.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@next.config.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Audit and finalize CSP headers in next.config.ts</name>
  <files>next.config.ts</files>
  <action>
    The working tree already has most fixes applied. Audit next.config.ts against this checklist and fix anything missing:

    **script-src must include:**
    - `'self'` — own scripts
    - `'unsafe-inline'` — inline scripts (Next.js hydration)
    - `'wasm-unsafe-eval'` — WebAssembly compilation (Superpowered)
    - `'unsafe-eval'` — dev only (Next.js HMR)
    - `https://*.supabase.co` — Supabase client
    - `https://connect.facebook.net` — Facebook pixel
    - `https://www.googletagmanager.com` — GA tag manager
    - `https://www.google-analytics.com` — GA scripts
    - `https://cdn.jsdelivr.net` — Superpowered WASM loaded via script context

    **connect-src must include:**
    - `'self'` — own API routes
    - `https://*.supabase.co` — Supabase REST/auth
    - `https://www.google-analytics.com` — GA beacons
    - `https://graph.facebook.com` — Facebook CAPI
    - `wss://*.supabase.co` — Supabase realtime
    - `https://cdn.jsdelivr.net` — Superpowered WASM fetch

    **frame-src must include:**
    - `'self'` — editor preview iframe loading /preview
    - YouTube, Vimeo, Spotify, SoundCloud, TikTok origins

    **worker-src must include:**
    - `'self'` — AudioWorklet processor from /processors/
    - `blob:` — Superpowered worker blobs

    **media-src must include:**
    - `'self'` — local media
    - `blob:` — audio blobs
    - `https://*.supabase.co` — uploaded audio/video from storage

    **Route-specific headers:**
    - `/((?!preview).*)` route: Gets full security headers with `frame-ancestors 'none'` and `X-Frame-Options: DENY`
    - `/preview` route: Gets same security headers BUT with `frame-ancestors 'self'` (via string replace) and NO `X-Frame-Options` header (so the iframe is not blocked)
    - `upgrade-insecure-requests` must only be in production CSP (wrapped in isDev ternary)

    If all items are already correct in the working tree, no changes needed — just confirm.
  </action>
  <verify>
    1. Read next.config.ts and confirm every directive listed above is present
    2. Confirm the /preview route does NOT have X-Frame-Options header
    3. Confirm upgrade-insecure-requests is conditional on isDev
    4. Run `npx next build` or `npx next lint` to verify config is syntactically valid
  </verify>
  <done>
    next.config.ts has a complete CSP that whitelists all required origins for Superpowered, preview iframe, embeds, Supabase, analytics, and Facebook. The /preview route allows same-origin framing. Dev mode skips upgrade-insecure-requests.
  </done>
</task>

<task type="auto">
  <name>Task 2: Verify no CSP violations at runtime</name>
  <files></files>
  <action>
    Start the dev server and check that key pages load without CSP violations:

    1. Run `npm run dev` in background
    2. Use curl to fetch the response headers from:
       - `http://localhost:3000/` (should have X-Frame-Options: DENY)
       - `http://localhost:3000/preview` (should NOT have X-Frame-Options, should have frame-ancestors 'self')
    3. Verify CSP header content on both routes
    4. Stop dev server

    If /preview still gets X-Frame-Options: DENY, the Next.js source matching regex is wrong — fix it.
  </action>
  <verify>
    curl -sI responses show:
    - Main route: CSP with frame-ancestors 'none', X-Frame-Options: DENY present
    - /preview route: CSP with frame-ancestors 'self', X-Frame-Options header absent
  </verify>
  <done>
    Headers verified at runtime. Main routes are frame-denied. /preview allows same-origin framing.
  </done>
</task>

</tasks>

<verification>
- next.config.ts passes lint/build check
- All CSP directives cover existing functionality (audio SDK, embeds, Supabase, analytics, preview iframe)
- /preview route has frame-ancestors 'self' and no X-Frame-Options
- All other routes have frame-ancestors 'none' and X-Frame-Options: DENY
- upgrade-insecure-requests only in production
</verification>

<success_criteria>
- Superpowered audio: cdn.jsdelivr.net in both script-src and connect-src, wasm-unsafe-eval in script-src, blob: in worker-src
- Preview iframe: frame-src 'self', /preview route has frame-ancestors 'self' without X-Frame-Options
- Embeds: all 5 iframe providers in frame-src
- Supabase: wildcard in script-src, connect-src, img-src, media-src; wss in connect-src
- Analytics: google-analytics.com in script-src, connect-src, img-src
- Facebook: connect.facebook.net in script-src, graph.facebook.com in connect-src, facebook.com in img-src
- Dev mode: no upgrade-insecure-requests
</success_criteria>

<output>
After completion, create `.planning/quick/076-fix-csp-headers-superpowered-audio-and-previ/076-SUMMARY.md`
</output>
