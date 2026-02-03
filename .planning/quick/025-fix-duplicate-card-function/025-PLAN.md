---
task: "025"
type: quick
description: "Fix duplicate card function - not persisting to database"
files_modified:
  - src/hooks/use-cards.ts
  - src/lib/supabase/cards.ts
  - src/app/api/cards/[id]/route.ts
---

<objective>
Fix the duplicate card function which currently doesn't work at all.

**Root Cause:** When a card is duplicated, it gets a new UUID in the Zustand store. The `saveCards` function only uses PATCH to update existing cards. When it tries to PATCH a card that doesn't exist in the database, the Supabase `.single()` call fails because no row is returned.

**Solution:** Use Supabase's upsert functionality to handle both new and existing cards in a single operation.
</objective>

<context>
@src/hooks/use-cards.ts - saveCards function uses PATCH for all cards
@src/stores/page-store.ts - duplicateCard creates card with new UUID
@src/lib/supabase/cards.ts - createCard vs updateCard functions
@src/app/api/cards/[id]/route.ts - PATCH endpoint
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add upsertCard function and use in saveCards</name>
  <files>
    src/lib/supabase/cards.ts
    src/app/api/cards/[id]/route.ts
    src/hooks/use-cards.ts
  </files>
  <action>
1. In `src/lib/supabase/cards.ts`, add an `upsertCard` function:
   - Accept full card data including `id` and `page_id`
   - Use Supabase's `.upsert()` with `onConflict: 'id'`
   - Map card to DB format using existing `mapCardToDb`
   - Return the upserted card mapped back with `mapDbToCard`

2. In `src/app/api/cards/[id]/route.ts`, update PATCH to use upsert:
   - Import `upsertCard` instead of just `updateCard`
   - Change PATCH handler to accept `id` in body OR params
   - If body contains full card data with page_id, use upsert
   - Otherwise fall back to existing updateCard behavior
   - OR simpler: add PUT endpoint for upsert, keep PATCH for updates

3. In `src/hooks/use-cards.ts`, update `saveCards`:
   - Instead of PATCH to `/api/cards/{id}`, use PUT with full card data
   - Include `id` and `page_id` in the request body
   - This handles both new cards (from duplicate) and existing cards

**Alternative simpler approach:** Add a PUT route for upsert:
- PUT /api/cards/[id] does upsert with full card in body
- PATCH /api/cards/[id] stays as partial update (backwards compat)
- saveCards uses PUT for all saves
  </action>
  <verify>
    1. Duplicate a card in the editor
    2. Check browser Network tab - PUT request should succeed
    3. Refresh the page - duplicated card should still be there
    4. Check Supabase dashboard - new card row should exist
  </verify>
  <done>
    - Duplicated cards persist to database
    - Auto-save handles both new and existing cards
    - Page refresh preserves duplicated cards
  </done>
</task>

</tasks>

<verification>
1. Create a new card, save, refresh - card persists (baseline)
2. Duplicate the card - new card appears immediately
3. Wait for auto-save (or trigger manual save)
4. Refresh page - both original and duplicate persist
5. Edit the duplicated card, save, refresh - edits persist
</verification>

<success_criteria>
- [ ] Duplicate button creates visible copy in editor
- [ ] Duplicated card persists after page refresh
- [ ] Duplicated card is saved to Supabase database
- [ ] No console errors during duplicate + save flow
- [ ] Existing update functionality still works
</success_criteria>

<output>
After completion, create `.planning/quick/025-fix-duplicate-card-function/025-SUMMARY.md`
</output>
