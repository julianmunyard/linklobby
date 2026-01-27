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

### Color Customization
- **Full palette (6-8 colors)** — primary, secondary, background, text, accent, borders, etc.
- **2-3 preset palettes per theme** — quick start options, then tweak
- **Backgrounds:** Solid + gradients + image + video
- **Video backgrounds:** Autoplay muted loop

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

</decisions>

<specifics>
## Specific Ideas

- **Instagram Reels aesthetic** — user will send visual reference showing "spread out" justified text style commonly seen on Instagram
- Core differentiator: themes that feel like album art, not marketing pages
- Artists want visual identity that matches their vibe

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-theme-system*
*Context gathered: 2026-01-28*
