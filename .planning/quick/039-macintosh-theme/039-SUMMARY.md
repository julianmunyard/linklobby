# Quick Task 039: Classic Macintosh Theme

## What Was Built

A new "Macintosh" theme that renders cards as authentic 1984-era Mac windows with pixel fonts and window chrome.

## Files Created
- `src/lib/themes/macintosh.ts` - Theme configuration with colors, fonts, 4 palettes
- `src/components/cards/macintosh-card.tsx` - MacintoshCard wrapper component

## Files Modified
- `src/types/theme.ts` - Added 'macintosh' to ThemeId union
- `src/lib/themes/index.ts` - Registered macintoshTheme in THEMES array
- `src/components/cards/themed-card-wrapper.tsx` - Added macintosh routing case
- `src/app/fonts.ts` - Added VT323 and Courier Prime Google Fonts

## Design Details

### Visual Elements
- **Title bar:** Horizontal line pattern (repeating-linear-gradient, 2px black/2px white), close box (14px square), centered title text
- **Borders:** 3px solid black on all cards
- **Box shadow:** Double shadow for pixel-art 3D depth (4px cardBg color + 6px text color)
- **Sharp corners:** borderRadius: 0 (no rounding)
- **Fonts:** VT323 for headings/titles, Courier Prime for body text

### Card Type Routing
- **Full window chrome (title bar + close box):** hero, square, video, text, gallery, game, music, email-collection, release
- **Slim black frame only:** link, horizontal, mini

### Color Palettes
1. **Classic Gray** - White windows on #cccccc gray background (authentic Mac)
2. **Calculator Orange** - #FFB672 orange cards (matching calculator reference image)
3. **Notepad Yellow** - #FFF3B0 yellow cards (matching notepad reference image)
4. **Platinum** - White windows on #d0d0d0 (System 7 Platinum gray)

## Commit
- `259704d` - feat(quick-039): add Classic Macintosh theme with window chrome
