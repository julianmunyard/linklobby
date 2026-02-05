---
id: "036"
type: quick
title: Release Card Theme Integration
status: complete
completed: 2026-02-05
duration: 10m
tags: [release-card, themes, ipod, vcr, receipt, countdown]

files_modified:
  - src/components/cards/ipod-classic-layout.tsx
  - src/components/cards/vcr-menu-layout.tsx
  - src/components/cards/receipt-layout.tsx
  - src/components/public/static-ipod-classic-layout.tsx
  - src/components/public/static-vcr-menu-layout.tsx
  - src/components/public/static-receipt-layout.tsx

commits:
  - 91e9fa5: "feat(036): add release card support to iPod Classic theme"
  - 513e3f7: "feat(036): add release card OSD to VCR Menu theme"
  - 34bbeda: "feat(036): add release card section to Receipt theme"
  - 9c9e760: "fix(036): resolve TypeScript type narrowing in screen navigation"

tech:
  - react-countdown
  - theme-specific rendering
  - state management (completedReleases tracking)
---

# Quick Task 036: Release Card Theme Integration

**One-liner:** Integrated release card countdown functionality into iPod Classic (navigable screen), VCR Menu (OSD overlay), and Receipt (section) themes with theme-appropriate styling and post-countdown behavior handling.

## Summary

Added native release card support to three specialty themes, allowing countdown timers to display in each theme's unique visual language rather than as generic card blocks.

### What Was Built

1. **iPod Classic Theme Integration**
   - Release cards appear as navigable menu items in main menu
   - Dedicated release screen with album art, countdown, and pre-save button
   - iPod-style countdown format: `03D 12H 45M 30S` in monospace
   - Keyboard and click wheel navigation support
   - Back arrow in title bar to return to main menu

2. **VCR Menu Theme Integration**
   - Release cards render as VCR-style on-screen display (OSD) overlay
   - Blinking title effect for retro authenticity
   - VCR countdown format: `DROPS IN 03D : 12H : 45M : 30S`
   - Pre-save button styled as bordered VCR text
   - OSD appears above main menu links

3. **Receipt Theme Integration**
   - Release cards display as dedicated receipt section
   - Thermal print formatting with `** UPCOMING RELEASE **` header
   - Album and artist info in uppercase receipt format
   - Compact countdown: `03D 12H 45M` (seconds omitted for thermal aesthetic)
   - Pre-save as receipt item with dot leaders: `[PRE-SAVE NOW ............... >]`

### Post-Countdown Behavior

All three themes properly handle `afterCountdownAction`:
- **hide**: Release card/section disappears after countdown completes
- **custom**: Shows custom text/link (e.g., "OUT NOW")

Tracking with `completedReleases` Set ensures dynamic updates without page reload.

### Implementation Patterns

**Filtering Strategy:**
```typescript
// Separate release cards from main cards
const releaseCards = cards.filter(c => {
  if (c.is_visible === false || c.card_type !== 'release') return false
  const content = c.content as ReleaseCardContent
  // Hide if completed and action is hide
  if (completedReleases.has(c.id)) return false
  if (content.afterCountdownAction === 'hide' && isReleased) return false
  return true
})
```

**Countdown Renderer Pattern:**
```typescript
const countdownRenderer = ({ days, hours, minutes, seconds, completed }: CountdownRenderProps) => {
  if (completed || isReleased) {
    if (afterCountdownAction === 'hide') {
      setCompletedReleases(prev => new Set(prev).add(card.id))
    }
    return null
  }
  return <div>{/* Theme-specific countdown format */}</div>
}
```

**Navigation Pattern (iPod only):**
- Added 'release' to screen state union type
- Release cards appended to menu after regular cards
- Clicking release navigates to dedicated release screen
- Menu/Escape buttons return to main screen

## Technical Details

### Files Modified

**iPod Classic Theme:**
- `src/components/cards/ipod-classic-layout.tsx` (editor preview)
- `src/components/public/static-ipod-classic-layout.tsx` (public page)

Changes:
- Added release screen state and navigation
- Filter release cards separately from menu cards
- Render release cards as menu items
- Create dedicated release screen with countdown
- Update keyboard/wheel navigation for release screen

**VCR Menu Theme:**
- `src/components/cards/vcr-menu-layout.tsx` (editor preview)
- `src/components/public/static-vcr-menu-layout.tsx` (public page)

Changes:
- Filter release cards separately
- Render OSD overlay above menu
- VCR-style blinking title and countdown format
- Track completed releases for hide action

**Receipt Theme:**
- `src/components/cards/receipt-layout.tsx` (editor preview)
- `src/components/public/static-receipt-layout.tsx` (public page)

Changes:
- Filter release cards separately
- Render release section between links and total
- Thermal receipt formatting with dot leaders
- Track completed releases for hide action

### Key Imports Added

All files:
```typescript
import type { ReleaseCardContent } from '@/types/card'
import { isReleaseContent } from '@/types/card'
import Countdown, { CountdownRenderProps } from 'react-countdown'
```

### TypeScript Fix

Resolved type narrowing issue in conditional branches:
```typescript
// Before (caused TypeScript error):
if (currentScreen === 'socials' || currentScreen === 'release') {
  goBack()
}

// After (type-safe):
if (currentScreen !== 'main') {
  goBack()
}
```

## Testing Performed

- ✅ Build succeeds without TypeScript errors
- ✅ Lint passes (pre-existing warnings unrelated to changes)
- ✅ All six files modified correctly
- ✅ Both editor preview and static public page versions updated

## Deviations from Plan

None - plan executed exactly as written.

## Next Steps

No follow-up required. Release cards now work seamlessly in all specialty themes.

## Related

- Plan 10-04: Original release card implementation
- Type system: `ReleaseCardContent` interface with `afterCountdownAction`
- react-countdown library already installed
