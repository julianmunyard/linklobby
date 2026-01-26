# Quick Task 010: Link Card Border + Hero Button Toggle

## Completed
**Commit:** 7959232

### Changes Made

1. **Link card border** (`src/components/cards/link-card.tsx`)
   - Added `border border-white/20` class for thin white border
   - Provides visual distinction similar to selected state

2. **Hero button toggle**
   - `src/types/card.ts` - Added `showButton?: boolean` to HeroCardContent
   - `src/components/cards/hero-card.tsx` - Button only renders when `showButton !== false`
   - `src/components/editor/hero-card-fields.tsx` - Added Switch toggle for show/hide
   - When button hidden, entire card becomes clickable (stretched link pattern)
   - Button text and style fields hidden when toggle is off

## Files Modified
- `src/components/cards/link-card.tsx` - Added border class
- `src/types/card.ts` - Added showButton to HeroCardContent
- `src/components/cards/hero-card.tsx` - Conditional button rendering
- `src/components/editor/hero-card-fields.tsx` - Show Button toggle UI
