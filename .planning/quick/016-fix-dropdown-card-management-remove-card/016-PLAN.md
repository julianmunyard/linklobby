---
phase: quick
plan: 016
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/editor/dropdown-card-fields.tsx
autonomous: true

must_haves:
  truths:
    - "User can see list of cards currently inside a dropdown in the editor panel"
    - "User can remove individual cards from dropdown back to main canvas via editor panel"
    - "Removed cards appear on main canvas after removal"
  artifacts:
    - path: "src/components/editor/dropdown-card-fields.tsx"
      provides: "Card list with remove buttons in dropdown editor"
      contains: "removeCardFromDropdown"
  key_links:
    - from: "src/components/editor/dropdown-card-fields.tsx"
      to: "page-store.removeCardFromDropdown"
      via: "button onClick handler"
      pattern: "removeCardFromDropdown"
---

<objective>
Add ability to remove cards from dropdown back to main canvas via the editor panel.

Purpose: Users need to manage cards inside dropdowns - currently can only add, cannot remove. This completes the dropdown card management workflow.

Output: Updated dropdown-card-fields.tsx with card list and remove buttons
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/editor/dropdown-card-fields.tsx (current dropdown editor fields)
@src/stores/page-store.ts (removeCardFromDropdown action exists at lines 309-352)
@src/components/cards/dropdown-card.tsx (dropdown card component with Collapsible)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add card list with remove buttons to dropdown editor</name>
  <files>src/components/editor/dropdown-card-fields.tsx</files>
  <action>
Update dropdown-card-fields.tsx to:

1. Import `removeCardFromDropdown` from page-store (add to existing usePageStore destructure)
2. Import `X` icon from lucide-react for remove button
3. Get the actual child cards from the store by filtering cards where `card.parentDropdownId === dropdownId`
4. After the child count info section (lines 68-140), add a new section that displays the cards inside the dropdown:
   - Show a list of cards currently in the dropdown (use childCards array)
   - Each card item shows: card title (or "Untitled {type}"), card type badge, and X remove button
   - Style similar to the "Add Existing Cards" popover items but with remove button instead of checkbox
   - Remove button onClick calls `removeCardFromDropdown(card.id)`
   - If no cards inside, show "No cards in dropdown" message
5. Keep the "Add Existing Cards" popover functionality as-is

Structure:
```tsx
{/* Cards inside dropdown */}
{childCards.length > 0 && (
  <div className="space-y-2">
    <Label>Cards in Dropdown</Label>
    <div className="space-y-1">
      {childCards.map((card) => (
        <div key={card.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{card.title || `Untitled ${card.card_type}`}</p>
            <p className="text-xs text-muted-foreground capitalize">{card.card_type}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => removeCardFromDropdown(card.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  </div>
)}
```
  </action>
  <verify>
    - npm run lint passes
    - In editor, select a dropdown card
    - Should see list of cards inside the dropdown (if any)
    - Click X on a card to remove it - card should move to main canvas
    - Child count should update after removal
  </verify>
  <done>
    - Dropdown editor shows list of cards inside dropdown
    - Each card has visible remove (X) button
    - Clicking remove moves card back to main canvas
    - Card count updates correctly after removal
  </done>
</task>

</tasks>

<verification>
1. Lint check: `npm run lint`
2. Manual test:
   - Create a dropdown card
   - Add some cards to it via "Add Existing Cards"
   - Verify cards appear in the "Cards in Dropdown" list in editor
   - Click X on a card to remove it
   - Verify card reappears on main canvas
   - Verify dropdown card count updates
</verification>

<success_criteria>
- Users can see all cards inside a dropdown from the editor panel
- Users can remove individual cards from dropdown via X button
- Removed cards appear on main canvas with correct positioning
- No lint errors
</success_criteria>

<output>
After completion, create `.planning/quick/016-fix-dropdown-card-management-remove-card/016-SUMMARY.md`
</output>
