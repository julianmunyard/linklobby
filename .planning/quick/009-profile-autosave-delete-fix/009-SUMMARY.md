# Quick Task 009: Profile Auto-save, Delete Fix, Import Defaults

## Completed
**Commit:** aadfdbf

### Issues Fixed

1. **Profile pic auto-save** (`src/hooks/use-auto-save.ts`)
   - Extended `useAutoSave` hook to watch both `cardHasChanges` and `profileHasChanges`
   - Profile changes (including avatar/logo uploads) now auto-save after 500ms debounce
   - Same silent auto-save behavior as cards

2. **Delete button persistence** (`src/components/editor/card-property-editor.tsx`)
   - `handleDelete()` now calls DELETE API endpoint after removing from store
   - Undo action re-creates the card in database via POST
   - Cards no longer "come back" after deletion

3. **Linktree import defaults** (`src/lib/import/linktree-mapper.ts`)
   - Added type-specific default content for imported cards:
     - Hero/Square: `textAlign: 'center', verticalAlign: 'bottom'`
     - Horizontal: `textAlign: 'left', verticalAlign: 'middle'`
     - Link: `textAlign: 'center', verticalAlign: 'middle'`

## Files Modified
- `src/hooks/use-auto-save.ts` - Added profile store watching and saving
- `src/components/editor/card-property-editor.tsx` - API delete call + undo restore
- `src/lib/import/linktree-mapper.ts` - Type-specific default content
