# Phase 6: Advanced Cards - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Interactive card types that engage visitors: **Dropdown** (container for organizing cards) and **Game Card** (playable retro games). Also includes **multi-select grouping** for bulk card operations.

</domain>

<decisions>
## Implementation Decisions

### Dropdown Card

**Core behavior:**
- Dropdown is a **container for real cards** — not a list of links
- Any card type can go inside (horizontal, square, video, gallery, etc.)
- No nesting — dropdowns cannot contain other dropdowns
- Smooth accordion animation on expand/collapse
- Starts **collapsed** on page load (always)

**Header:**
- Custom text set by artist (e.g., "Music Links", "More Videos")
- Count badge shows number of items (e.g., "(5 items)")
- Styled to match current theme (not minimal)
- Chevron icon indicates expand/collapse state

**Creating dropdowns:**
- Two methods:
  1. Add from card picker (empty dropdown, then fill it)
  2. Select multiple cards → right-click → "Group into Dropdown"

**Adding cards to dropdown:**
- Drag existing cards into the dropdown
- Shift+click or box-select cards → right-click → "Move to Dropdown" → pick from submenu
- On mobile: checkbox select mode → "Move to Dropdown" action

**Managing cards inside:**
- Expand dropdown in editor to see contents
- Click card inside → property editor opens for that card
- Drag to reorder cards within dropdown (same as main canvas)
- Drag card OUT of dropdown to main canvas to ungroup
- Right-click card → "Move to Canvas" also works

### Game Card

**Available games (v1):**
- Snake
- Breakout (Brick Breaker)
- Flappy Bird clone

**Visual style:**
- Fixed retro arcade aesthetic (neon/classic) — does NOT adapt to page theme
- Artist picks game type in editor, no other customization
- No title/caption overlay — just the game

**Card sizing:**
- Sizeable like other cards (big or small)
- Games adapt to available space

**Idle state:**
- Animated demo/preview mode when not playing
- Visitor clicks to start playing

**Game over:**
- Shows "Game Over" message
- "Play Again" button to restart
- No high score tracking — just for fun

**Controls:**
- Desktop: Arrow keys / WASD
- Mobile: Claude decides per game (swipe for Snake, tap for Flappy, etc.)

### Multi-Select Grouping

**Selection methods (desktop):**
- Shift+click to add/toggle individual cards
- Click-drag to draw selection box around multiple cards
- Same white border as single-card selection

**Selection methods (mobile):**
- "Select" button in toolbar enters checkbox mode
- Tap cards to toggle selection (checkboxes appear)
- Floating action bar shows when cards selected
- Exit select mode via toolbar button or action completion

**Bulk actions:**
- Group into Dropdown → creates new dropdown containing selected cards
- Move to Dropdown → submenu lists existing dropdowns
- Delete All → confirmation dialog first
- Move together → drag selection to reorder as a group

**UI:**
- Right-click context menu with all actions
- Floating toolbar above selection for quick access
- Both available on desktop

### Card Interactions

**Editor preview:**
- Dropdowns: fully interactive (expand/collapse works)
- Game cards: static preview only (animated demo, no gameplay)

**Mobile editing:**
- Long-press card for context menu
- Tap dropdown to expand → tap card inside to edit
- Checkbox select mode for bulk operations

**Ungroup cards:**
- Drag card out of dropdown to main canvas
- Right-click → "Move to Canvas" option

### Claude's Discretion

- Mobile game controls per game type
- Exact animation timing for dropdown accordion
- Selection box visual style (dashed border, highlight, etc.)
- Floating toolbar design and positioning
- How games scale at small card size

</decisions>

<specifics>
## Specific Ideas

- Games should feel nostalgic — arcade aesthetic, satisfying sounds
- Dropdown is about organization, not a new link type
- Checkbox select mode on mobile mirrors iOS/Android patterns (select → act)
- Confirmation on bulk delete to prevent accidents (unlike single card delete which uses undo toast)

</specifics>

<deferred>
## Deferred Ideas

- Pac-Man game — complex AI and licensing concerns, save for later
- High scores / leaderboards — keeping games simple for v1
- Simon Says / 2048 / other puzzle games — future game expansion
- Nested dropdowns — keep it flat for v1

</deferred>

---

*Phase: 06-advanced-cards*
*Context gathered: 2026-01-27*
