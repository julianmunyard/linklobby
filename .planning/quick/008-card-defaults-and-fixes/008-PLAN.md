# Quick Task 008: Card Defaults and Fixes

## Goal
Fix card default alignments, add Link card to type picker, and fix delete button.

## Tasks

### Task 1: Set type-specific default alignments when creating cards
**Files:** `src/stores/page-store.ts`

Set default `textAlign` and `verticalAlign` in `content` when creating cards:
- Hero: center-bottom
- Square: center-bottom
- Horizontal: left-center (left text align, middle vertical align)
- Link: center-center

Update the `addCard` function to include type-specific content defaults.

### Task 2: Add Link card to type picker
**Files:** `src/components/editor/card-type-picker.tsx`

Add `link` card type to the `CONVERTIBLE_CARD_TYPES` array with appropriate icon (Type or Link2 from lucide-react).

### Task 3: Verify delete button functionality
**Files:** `src/components/editor/card-property-editor.tsx`

The delete button code looks correct. The issue may be that the button is inside a `<form>` element which could cause a form submission instead of calling onClick. Need to verify and potentially add `type="button"` explicitly or move outside the form.

Looking at the code, the button already has `type="button"`. The actual issue might be that the `toast()` action is failing silently. Will test and fix if needed.

## Expected Outcome
- New hero/square cards default to center-bottom text
- New horizontal cards default to left-center text
- New link cards default to center-center text
- Link card shows in type picker alongside hero/horizontal/square
- Delete button works correctly in card property editor
