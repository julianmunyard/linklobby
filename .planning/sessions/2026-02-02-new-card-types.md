# Session: 2026-02-02 - New Card Types & Positioning

## Summary

Added two new card types (mini, text) with horizontal positioning controls, fixed duplicate card persistence, and made various UI improvements.

## Changes Made

### 1. New Card Type: Mini Link

A compact button-style link card that fits content width.

**Files Modified:**
- `src/types/card.ts` - Added 'mini' to CardType, CARD_TYPE_SIZING, CARD_TYPES_NO_IMAGE
- `src/types/theme.ts` - Added 'mini' to CardTypeFontSizes
- `src/stores/theme-store.ts` - Added mini font size default
- `src/components/cards/card-renderer.tsx` - Mini uses LinkCard component
- `src/components/cards/link-card.tsx` - Uses correct font size based on card_type
- `src/components/cards/themed-card-wrapper.tsx` - Mini gets standard themed styling on all themes (no Mac OS traffic lights, but does get System Settings white box)
- `src/components/cards/system-settings-card.tsx` - Added 'mini' to THIN_CARD_TYPES
- `src/components/editor/card-type-picker.tsx` - Added Mini with Tag icon
- `src/components/editor/card-property-editor.tsx` - Mini uses LinkCardFields
- `src/components/editor/cards-tab.tsx` - Added "Mini Link" to dropdown

**Behavior:**
- Compact width (w-fit)
- Gets themed card wrapper (background, border, shadow)
- On Mac OS: Has traffic lights like link cards
- On System Settings: Has white box styling like link cards

### 2. New Card Type: Text

Plain text without any card wrapper - just the text content.

**Files Modified:**
- `src/types/card.ts` - Added 'text' to CardType, CARD_TYPE_SIZING, CARD_TYPES_NO_IMAGE
- `src/types/theme.ts` - Added 'text' to CardTypeFontSizes
- `src/stores/theme-store.ts` - Added text font size default
- `src/components/cards/text-card.tsx` - NEW FILE: Plain text component
- `src/components/cards/card-renderer.tsx` - Text bypasses ThemedCardWrapper entirely
- `src/components/editor/card-type-picker.tsx` - Added Text with AlignLeft icon
- `src/components/editor/card-property-editor.tsx` - Text uses LinkCardFields
- `src/components/editor/cards-tab.tsx` - Added "Text" to dropdown

**Behavior:**
- Compact width (w-fit)
- No card wrapper - just plain text
- Transparent background
- Can have URL (becomes clickable link)

### 3. Horizontal Position Controls for Mini/Text Cards

Mini and text cards can be positioned left, center, or right within the page.

**Files Modified:**
- `src/components/editor/card-property-editor.tsx` - Added Position toggle (left/center/right) for POSITIONABLE_CARD_TYPES
- `src/components/canvas/preview-sortable-card.tsx` - Position controls via CSS margins
- `src/components/editor/cards-tab.tsx` - Mini/text default to center position

**Positioning Logic:**
- **Left**: Normal flow (no margin)
- **Center**: `mx-auto` (centers, takes own row)
- **Right**: `ml-auto` (pushes to right edge)

**Use Cases:**
- 2 cards (left + right): Spread apart on same row
- 3 cards (left + center + right): Center on own row, left/right spread on another
- 1 card: Positioned where specified

### 4. Selection Highlight Improvements

Tightened the selection ring around cards.

**File:** `src/components/canvas/preview-sortable-card.tsx`

**Change:** `ring-offset-2 rounded-xl` → `ring-offset-1 rounded-lg`

### 5. AWGE Frame Padding Increase

Increased frame insets so card borders don't touch frame edges.

**File:** `src/app/preview/page.tsx`

**Change:** Frame insets from (6/12/5/5)% to (8/14/7/7)%

### 6. Duplicate Card Fix (Quick Task 025)

Fixed duplicate cards not persisting to database.

**Root Cause:** `saveCards` only used PATCH which failed for new card IDs.

**Solution:**
- Added `upsertCard` function using Supabase `.upsert()`
- Added PUT endpoint for upsert operations
- Changed `saveCards` to use PUT instead of PATCH

**Files Modified:**
- `src/lib/supabase/cards.ts` - Added upsertCard function
- `src/app/api/cards/[id]/route.ts` - Added PUT endpoint
- `src/hooks/use-cards.ts` - saveCards uses PUT

## Card Type Summary

| Type | Width | Wrapper | Position Controls |
|------|-------|---------|-------------------|
| link | Full width | Themed (Mac OS traffic lights, etc.) | No |
| mini | w-fit | Themed (no Mac OS traffic lights) | Yes (left/center/right) |
| text | w-fit | None (plain text) | Yes (left/center/right) |
| horizontal | Full width | Themed | No |
| hero | Big/Small | Themed | No |
| square | Big/Small | Themed | No |

## Resume Point

All changes are in working tree (not committed). To continue:

1. Test the new mini and text card types
2. Verify positioning works as expected
3. Commit changes when satisfied

## Files Changed (Uncommitted)

```
src/types/card.ts
src/types/theme.ts
src/stores/theme-store.ts
src/components/cards/text-card.tsx (NEW)
src/components/cards/card-renderer.tsx
src/components/cards/link-card.tsx
src/components/cards/themed-card-wrapper.tsx
src/components/cards/system-settings-card.tsx
src/components/canvas/preview-sortable-card.tsx
src/components/editor/card-type-picker.tsx
src/components/editor/card-property-editor.tsx
src/components/editor/cards-tab.tsx
src/app/preview/page.tsx
```
