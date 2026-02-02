# Quick Task 024: Remove Sleek Modern, Dark Defaults

## Objective

Remove the Sleek Modern theme preset and change defaults to Instagram Reels theme with black background and white text.

## Tasks

### Task 1: Remove Sleek Modern theme

**Files to modify:**
- `src/types/theme.ts` - Remove 'sleek-modern' from ThemeId type
- `src/lib/themes/index.ts` - Remove sleekModernTheme import and references
- `src/components/cards/themed-card-wrapper.tsx` - Remove sleek-modern case
- Delete `src/lib/themes/sleek-modern.ts`

### Task 2: Update default theme to Instagram Reels

**File:** `src/stores/theme-store.ts`

Change:
- `defaultThemeId` from 'sleek-modern' to 'instagram-reels'
- Default `paletteId` from 'frosted-glass' to 'ig-dark'
- Update `initialState.colors` to Instagram Reels defaults (black bg, white text)
- Update `initialState.fonts` to Instagram Reels defaults
- Update `initialState.style` to Instagram Reels defaults
- Update `initialState.background.value` to black

### Task 3: Verify GlassCard is preserved

The GlassCard component should remain available for potential future use, just not linked to sleek-modern theme.

## Expected Outcome

- Theme picker shows: Mac OS, Instagram Reels, System Settings (no Sleek Modern)
- New users get Instagram Reels theme with black background by default
- Existing users with sleek-modern in localStorage will fall back to instagram-reels
