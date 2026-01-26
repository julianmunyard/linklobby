---
quick: 007
type: execute
autonomous: true
files_modified:
  - src/hooks/use-cards.ts
  - src/hooks/use-auto-save.ts

must_haves:
  truths:
    - "When user changes card type (hero/horizontal/square), the change persists after page refresh"
    - "Auto-save includes card_type in the PATCH payload"
  artifacts:
    - path: "src/hooks/use-cards.ts"
      provides: "saveCards function with card_type in payload"
      contains: "card_type: card.card_type"
  key_links:
    - from: "src/hooks/use-cards.ts"
      to: "/api/cards/[id]"
      via: "PATCH request body"
      pattern: "card_type.*card\\.card_type"
---

<objective>
Fix card type changes not persisting to database.

Purpose: The `saveCards` function in `use-cards.ts` explicitly lists fields to save but omits `card_type`. When a user changes card type via CardTypePicker, the change is stored locally in Zustand but never sent to the database, so it reverts on page refresh.

Output: Card type changes persist across page refreshes.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/hooks/use-cards.ts
@src/stores/page-store.ts
@src/lib/supabase/cards.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add card_type to saveCards payload</name>
  <files>src/hooks/use-cards.ts</files>
  <action>
In the `saveCards` function around line 60-68, the PATCH request body explicitly lists fields but omits `card_type`. Add `card_type: card.card_type` to the JSON payload.

Also add `position: card.position` which is similarly missing (for consistency - all mutable card fields should be saved).

The updated body should include:
- card_type: card.card_type
- title: card.title
- description: card.description
- url: card.url
- content: card.content
- size: card.size
- position: card.position
- sortKey: card.sortKey
- is_visible: card.is_visible
  </action>
  <verify>
1. Grep for "card_type: card.card_type" in use-cards.ts - should find it
2. Start dev server, change a card's type in the editor
3. Refresh page - card type should persist
  </verify>
  <done>
- saveCards includes card_type in PATCH payload
- saveCards includes position in PATCH payload
- Card type changes persist after page refresh
  </done>
</task>

</tasks>

<verification>
1. Change a hero card to horizontal using CardTypePicker
2. Refresh the page
3. Card should still be horizontal (not reverted to hero)
4. Check Network tab - PATCH request body should include card_type
</verification>

<success_criteria>
- Card type changes persist across page refresh
- All card fields are included in save payload (no other missing fields)
</success_criteria>

<output>
Update `.planning/STATE.md` quick tasks table with 007 completion.
</output>
