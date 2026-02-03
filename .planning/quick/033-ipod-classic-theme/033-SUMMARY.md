---
id: "033"
name: iPod Classic Theme
status: complete
completed: 2026-02-04
duration: ~15 minutes
commits:
  - 2a53f1d: "feat(quick-033): add iPod Classic theme type and config"
  - b77a9ba: "feat(quick-033): create iPod Classic layout component"
  - edf2e20: "feat(quick-033): integrate iPod Classic theme into preview and public pages"
  - d50f247: "feat(quick-033): polish iPod Classic theme"
files_created:
  - src/lib/themes/ipod-classic.ts
  - src/components/cards/ipod-classic-layout.tsx
  - src/components/public/static-ipod-classic-layout.tsx
files_modified:
  - src/types/theme.ts
  - src/lib/themes/index.ts
  - src/app/globals.css
  - src/app/preview/page.tsx
  - src/components/public/public-page-renderer.tsx
  - src/app/[username]/page.tsx
  - src/app/fonts.ts
---

# Quick Task 033: iPod Classic Theme Summary

**One-liner:** Classic iPod interface theme with cream body, LCD screen, click wheel navigation, and rainbow Apple logo.

## What Was Built

### iPod Classic Theme Configuration
- Added `ipod-classic` to ThemeId union type
- Created theme config with `isListLayout: true` (like VCR Menu)
- 4 color palettes: Classic, Mini Pink, Mini Blue, Mini Green
- Uses Inter font for clean system look

### iPod Classic Layout Component (`ipod-classic-layout.tsx`)
The interactive iPod interface with:

**Visual Elements:**
- 320px iPod body with cream housing (#f5f0e1)
- Black screen bezel with inset shadows
- LCD screen with gray gradient (220px height)
- Status bar with "links" label and battery icon
- Blue menu header with title and live clock
- Menu list showing user's cards as items
- Click wheel (180px) with center button
- Rainbow Apple logo SVG at bottom

**Navigation:**
- Arrow keys (up/down) + Enter for keyboard navigation
- Click wheel quadrant detection (top = up, bottom = down)
- Center button activates selected link
- Menu item click selects, double-click activates

**Card Display:**
- Cards rendered as menu rows with emoji icons
- Icon extraction: first emoji from title, or fallback by card_type
- Selected item: blue gradient background, white text, arrow indicator
- Scrollable list for many items
- Footer shows item count

### Static Version for Public Pages
- `static-ipod-classic-layout.tsx` for SSR
- Same navigation and styling
- Uses theme accent color from CSS variables

### Theme Integration
- Preview page conditionally renders IpodClassicLayout
- Public page renderer conditionally renders StaticIpodClassicLayout
- Theme appears in theme selector automatically (iterates THEMES array)

### CSS Styles Added
- Complete iPod styling in globals.css
- `.ipod-container`, `.ipod-screen-bezel`, `.ipod-screen`
- `.ipod-menu-header`, `.ipod-menu-item`, `.ipod-menu-item.selected`
- `.ipod-click-wheel`, `.ipod-center-button`, `.ipod-wheel-button`
- `.ipod-apple-logo`, `.ipod-instructions`
- Responsive breakpoint at 400px (smaller iPod)

### Font Addition
- Added Inter font to fonts.ts
- Registered in fontVariables and CURATED_FONTS

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| isListLayout: true | Like VCR Menu, iPod shows cards as list items not a card grid |
| Inter font | Clean system font matches iPod's original interface |
| Click quadrant detection | Upper quadrant = scroll up, lower = scroll down (matches iPod UX) |
| Emoji icon extraction | Makes menu items more visual; fallback icons by card type |
| 4 color palettes | Classic cream + 3 iPod Mini color variants for personalization |
| Rainbow Apple logo | Nostalgic retro touch with gradient SVG |

## Icon Mapping

```typescript
switch (card.card_type) {
  case 'link':
  case 'horizontal': return '\u{1F517}' // chain link
  case 'hero':       return '\u{2B50}'  // star
  case 'video':      return '\u{25B6}'  // play
  case 'gallery':    return '\u{1F5BC}' // image
  case 'music':      return '\u{1F3B5}' // music note
  case 'social-icons': return '\u{1F465}' // people
  default:           return '\u{2022}'  // bullet
}
```

## Responsive Design

| Breakpoint | iPod Width | Wheel Size | Center Button | Screen Height |
|------------|------------|------------|---------------|---------------|
| >= 400px   | 320px      | 180px      | 70px          | 220px         |
| < 400px    | 280px      | 150px      | 58px          | 190px         |

Instructions hidden on mobile.

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- [x] TypeScript compiles: `npx tsc --noEmit` passes
- [x] Build succeeds: `npm run build` completes
- [x] Theme appears in THEMES array
- [x] isListLayout: true set
- [x] Preview page has ipod-classic conditional
- [x] Public page renderer has ipod-classic conditional
- [x] CSS styles in globals.css
- [x] Inter font registered
