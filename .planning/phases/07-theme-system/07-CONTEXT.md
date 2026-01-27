# Phase 7: Theme System - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Artists can select themes that skin all cards consistently — visual identity that feels like album art, not marketing pages. Themes are skins that change visual styling while keeping core functionality and sizing the same.

</domain>

<decisions>
## Implementation Decisions

### Theme Scope & Structure
- **3 themes for v1:** Mac OS, Sleek Modern, Instagram Reels
- **Presets with deep tweaking** — no blank slate custom themes, but extensive customization of each preset
- **Instagram Reels aesthetic** — awaiting visual reference from user (justified/spread text style mentioned)

### Theme Selection UI
- **Sidebar theme panel** — Dedicated section in Design tab with theme cards
- **Tabbed interface:** Presets | Colors | Fonts | Style
- **Abstract swatches** — Theme thumbnails show color palette + font sample, not mock pages
- **Instant apply** — Tap theme to apply immediately, no confirmation needed. User can tap another to switch.

### Color Customization
- **Moderate palette (5-6 colors)** — Background, card bg, text, accent, border, link
- **2-3 preset palettes per theme** — Quick start options, then tweak
- **Palettes + free picker** — Start from preset palette, unlock free color picker for each field if wanted
- **Backgrounds:** Solid color + image + video (autoplay muted loop)

### Font Controls
- **Heading + body fonts** — Two separate font pickers (titles vs descriptions)
- **Curated font list (15-20)** — Hand-picked fonts that work for artists
- **Theme default fonts** — Each theme comes with default fonts that users can change
- **Separate heading/body size controls** — Independent sliders for headings and body text
- **Advanced font settings:** Blur effect, bold/regular weight options

### Border & Card Styling
- **Global default + per-card override** — Set global border style, allow individual cards to differ
- **Border controls:** Radius + color (theme defines aesthetic like Mac OS shaded borders)
- **Shadow toggle:** On/off control for card shadows (theme defines shadow style)
- **Glass/blur intensity slider** — User controls blur amount for themes that support glass effects

### Theme Application
- **Themes are skins** — borders, colors, fonts, shadows, hover animations, transitions, entrance/exit animations
- **All visual styling controlled by theme** — comprehensive coverage
- **Everything adapts except:** Circular gallery card and game cards stay fixed
- **Fonts:** Theme has default fonts, artist can override
- **Profile header follows theme** — same styling as cards
- **Instant preview** — see changes immediately as you browse themes/colors

### Dark Mode Behavior
- **Artist controls** — visitors see what artist chose (no system preference detection)
- **No explicit dark/light variants** — all colors interchangeable, artist can make any theme dark or light
- **Dark background by default** — new pages start with dark colors (artist/DJ preference)

### Claude's Discretion
- Technical implementation of CSS variables and theme tokens
- Font pairing suggestions for each theme
- Specific animation timing and easing curves
- How to handle theme transitions (smooth fade vs instant)
- Video background performance optimization
- Curated font list selection

</decisions>

<specifics>
## Specific Ideas

- **Instagram Reels aesthetic** — user will send visual reference showing "spread out" justified text style commonly seen on Instagram
- Core differentiator: themes that feel like album art, not marketing pages
- Artists want visual identity that matches their vibe
- Clean, easy UX for theme customization — don't overwhelm users

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-theme-system*
*Context gathered: 2026-01-28*
