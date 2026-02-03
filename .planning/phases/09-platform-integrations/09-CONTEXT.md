# Phase 9: Platform Integrations - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Artists can embed content from major platforms (music, video, social) into their pages. URLs are auto-detected, embeds are theme-wrapped, and playback is coordinated. Payment links deferred to later phase.

</domain>

<decisions>
## Implementation Decisions

### Embed Behavior
- Load pattern: Claude decides per platform (e.g., music auto-embed, video click-to-load)
- Card shape adapts to embed — Spotify track = wider, album = square, YouTube = 16:9
- Only one embed plays at a time — starting a new embed pauses any currently playing
- Error state: Show "Content unavailable" message in card with platform icon when embed fails

### Platform Detection
- Auto-detect always — parse URL, show detected platform, artist can override if wrong
- Unknown URLs fall back to regular link card (no rejection)
- Auto-fetch metadata (title, thumbnail) from platform when URL is pasted
- Support whatever URL formats make sense — standard share URLs at minimum

### Card Appearance
- No platform branding where possible — clean minimal look
- Card wrapper follows theme (border/shadow), embed inside is platform's native design
- No custom title/description on embeds — embed speaks for itself
- Thumbnail state for click-to-load: Claude designs what looks best per platform

### Supported Platforms
**Music (must-have):**
- Spotify
- Apple Music
- SoundCloud
- Bandcamp
- Audiomack

**Video (must-have):**
- YouTube
- TikTok Video
- Vimeo

**Social (must-have):**
- Instagram — both profile links AND post embeds
- TikTok — both profile links AND video embeds

### Claude's Discretion
- Load pattern per platform (click-to-load vs auto-embed)
- Thumbnail/preview state design per platform
- URL format support scope (short URLs, embed codes, etc.)
- Technical approach to embed coordination (pausing other players)

</decisions>

<specifics>
## Specific Ideas

- Cards should adapt shape to the embed content (not force embeds into existing card sizes)
- One-at-a-time playback for cleaner user experience
- Instagram and TikTok support both profile-level links and individual post/video embeds

</specifics>

<deferred>
## Deferred Ideas

- Payment links (PayPal, Venmo, CashApp, Shopify) — revisit in later phase
- Twitter/X integration — not mentioned as priority

</deferred>

---

*Phase: 09-platform-integrations*
*Context gathered: 2026-02-03*
