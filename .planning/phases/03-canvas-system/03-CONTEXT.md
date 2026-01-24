# Phase 3: Canvas System - Context

**Gathered:** 2026-01-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Artists can arrange cards in a reorderable vertical stack. Cards persist to database and display responsively. This is NOT a free-form 2D canvas — it's a mobile-first single-column layout where order matters.

**Key insight:** Mobile is the primary viewing experience. Desktop shows the same layout, just wider. There is no separate "desktop layout" to design.

</domain>

<decisions>
## Implementation Decisions

### Layout model
- **Vertical stack, not 2D grid** — cards stack top to bottom
- Artist controls order via drag-to-reorder
- No free-form positioning — position is determined by order in stack
- Same layout on desktop and mobile (mobile-first)

### Grid & positioning
- **Loose grid** — soft guidelines, cards don't snap rigidly
- **No overlap** — cards don't stack on top of each other (cleaner, more usable for clicking links)
- **Predefined sizes** — Small, Medium, Large options (not free resize handles)

### Responsive behavior
- **Single column everywhere** — mobile-first, desktop is just wider
- **Artist sets mobile order** — explicit ordering, not derived from position
- **Preview toggle works** — existing mobile/desktop toggle in preview shows the responsive view
- **No tablet breakpoint** — same layout for all screen sizes

### Claude's Discretion
- Card push/reflow behavior when reordering
- Canvas max-width vs full-width decision
- Margin/padding amounts between cards
- Alignment guides (if any)
- Visual hierarchy and depth styling

</decisions>

<specifics>
## Specific Ideas

- Mobile is priority — visitors mostly view on phones
- Desktop preview exists so artists can see how it looks wider, but it's the same layout
- Keep it simple and usable — overlap would confuse visitors trying to click links

</specifics>

<deferred>
## Deferred Ideas

- **Linktree import UI** — user wants to consider how "enter your Linktree link" flow works. Belongs in Phase 4.1.
- **Card grouping/sections** — grouping related cards visually. Could be future enhancement.
- **Creative overlap mode** — allowing overlap for artistic layouts. Could be theme option later.

</deferred>

---

*Phase: 03-canvas-system*
*Context gathered: 2026-01-24*
