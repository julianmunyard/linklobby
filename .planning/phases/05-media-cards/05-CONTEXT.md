# Phase 5: Media Cards - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Video Card and Photo Gallery card types — artists can showcase video and photo content within the existing card system. Both card types follow the same sizing/positioning rules as existing cards (big/small, left/center/right).

</domain>

<decisions>
## Implementation Decisions

### Video Card Behavior
- **Source options:** Both embed (YouTube/Vimeo/TikTok) AND upload — artist chooses per card
- **Uploaded videos:** Always autoplay (muted loop, Instagram-style)
- **Embedded videos:** Thumbnail + play button (clicking loads/plays the embed)
- **Supported platforms:** YouTube, Vimeo, TikTok
- **Sizing:** Supports big (full-width) and small (half-width) — same as other cards

### Photo Gallery Layout
- **Default style:** ReactBits Circular Gallery (https://reactbits.dev/components/circular-gallery)
- **Alternative style:** Classic carousel
- **Two gallery styles total:** Circular Gallery + Carousel (no grid)
- **Image limit:** Hard limit of 10 images per gallery
- **Sizing:** Supports big (full-width) and small (half-width) — same as other cards

### Gallery Interactions
- **No lightbox** — images display within the card, no full-screen view
- **Reordering in editor:** Drag and drop thumbnails to reorder
- **Carousel navigation:** Both swipe (mobile) + arrows (desktop)
- **No auto-advance** — visitor controls navigation, no slideshow mode

### Media Sizing
- **Card sizes:** Same as existing cards (big = full width, small = half width)
- **Position:** Same as existing cards (left/center/right for small cards)
- **Gallery aspect ratios:**
  - Circular Gallery: Crop to match ReactBits component dimensions
  - Carousel: Square crop for consistency

### Claude's Discretion
- Video aspect ratio handling (preserve original vs letterbox for different platforms)
- Specific carousel animation/transition style
- Upload file size limits and compression
- Error states for failed video embeds

</decisions>

<specifics>
## Specific Ideas

- ReactBits Circular Gallery as the primary gallery component — "https://reactbits.dev/components/circular-gallery?scrollEase=0.15&scrollSpeed=4.6&borderRadius=0&bend=10"
- Gallery cards are "just another card type" — no special treatment, same sizing/positioning as Hero, Square, etc.
- Video cards should feel like embedded content (thumbnail preview for embeds, instant autoplay for uploads)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-media-cards*
*Context gathered: 2026-01-27*
