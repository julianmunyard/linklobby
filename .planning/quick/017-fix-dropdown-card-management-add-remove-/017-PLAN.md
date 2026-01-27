---
phase: quick
plan: 017
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/canvas/dropdown-sortable.tsx
autonomous: true

must_haves:
  truths:
    - "Remove button in dropdown editor removes card from dropdown"
    - "Removed cards reappear on main canvas"
    - "Dropdown collapse/expand does not affect visual position of dropdown"
    - "Child cards render correctly inside expanded dropdown"
  artifacts:
    - path: "src/components/canvas/dropdown-sortable.tsx"
      provides: "Fixed child card rendering with CardRenderer import"
      contains: "import.*CardRenderer"
  key_links:
    - from: "dropdown-sortable.tsx"
      to: "CardRenderer"
      via: "import statement"
      pattern: "import.*CardRenderer.*from"
---

<objective>
Fix dropdown card management: ensure remove from dropdown works, and fix collapse/expand visual issues.

Purpose: Dropdown cards should render their children correctly and maintain stable position when collapsed/expanded.

Output: Working dropdown with functional add/remove and stable collapse/expand behavior.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/canvas/dropdown-sortable.tsx
@src/components/cards/dropdown-card.tsx
@src/components/editor/dropdown-card-fields.tsx
@src/stores/page-store.ts (removeCardFromDropdown function)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix CardRenderer import and verify child rendering</name>
  <files>src/components/canvas/dropdown-sortable.tsx</files>
  <action>
    Add the missing CardRenderer import to dropdown-sortable.tsx:

    ```tsx
    import { CardRenderer } from "@/components/cards/card-renderer"
    ```

    This import is missing but CardRenderer is used on line 114 to render child cards.
    Without this import, child cards cannot render, which may contribute to visual issues.
  </action>
  <verify>
    1. Run `npx tsc --noEmit` - no type errors for dropdown-sortable.tsx
    2. Run dev server and verify dropdown children render when expanded
  </verify>
  <done>CardRenderer import added, child cards render inside expanded dropdown</done>
</task>

<task type="auto">
  <name>Task 2: Verify remove from dropdown functionality</name>
  <files>src/components/editor/dropdown-card-fields.tsx</files>
  <action>
    The remove functionality already exists (lines 157-163 with X button calling removeCardFromDropdown).

    Verify the implementation works correctly:
    1. Open editor for a dropdown card with children
    2. Click the X button next to a child card
    3. Confirm the card is removed from dropdown and appears on main canvas

    If not working, check:
    - removeCardFromDropdown is imported from page-store (line 34)
    - Button onClick calls removeCardFromDropdown(card.id) (line 161)
    - Store function properly clears parentDropdownId and updates childCardIds

    The store function (page-store.ts lines 310-356) looks correct - it:
    - Clears parentDropdownId on the card
    - Removes card ID from parent dropdown's childCardIds
    - Generates new sortKey for main canvas positioning

    Note: The console.error debug log on line 312 can be removed if desired, but leave it for now as it helps trace issues.
  </action>
  <verify>
    1. Add cards to a dropdown via editor
    2. Click X on a child card in the dropdown editor
    3. Confirm card appears on main canvas (no longer in dropdown)
    4. Check browser console for "removeCardFromDropdown called" log to confirm it fires
  </verify>
  <done>Remove button successfully removes cards from dropdown to main canvas</done>
</task>

<task type="auto">
  <name>Task 3: Fix collapse/expand visual stability</name>
  <files>src/components/canvas/dropdown-sortable.tsx</files>
  <action>
    The collapse/expand visual issue (dropdown appearing to move below children) is likely caused by:

    1. **Animation timing with dnd-kit recalculation** - When CollapsibleContent animates closed, dnd-kit may be recalculating positions mid-animation

    2. **Missing min-height on collapsed state** - The dropdown container may collapse to zero height briefly

    Fix approach - Add CSS to ensure stable dimensions:

    In the wrapper div (around line 94-100), ensure the container maintains stable layout:

    ```tsx
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-full",
        isDragging && "opacity-50",
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
    ```

    The structure is correct (header first, then content). The issue may be that when CollapsibleContent animates, the overall height changes cause dnd-kit to recalculate.

    Add `will-change: transform` to the style object to hint GPU acceleration and prevent layout thrashing:

    ```tsx
    const style = {
      transform: CSS.Translate.toString(transform),
      transition: transition ?? 'transform 200ms ease',
      willChange: 'transform',
    }
    ```

    If the issue persists, the problem may be in how dnd-kit handles the SortableContext items when dropdown content height changes. The main canvas SortableContext already filters out parentDropdownId cards correctly, so the issue is likely CSS/animation related.
  </action>
  <verify>
    1. Create a dropdown with 2-3 child cards
    2. Expand the dropdown - children should appear inside
    3. Collapse the dropdown - dropdown header should stay in place, children should animate closed
    4. Verify dropdown does NOT visually jump below where children were
    5. Repeat expand/collapse multiple times to confirm stability
  </verify>
  <done>Dropdown maintains stable visual position during collapse/expand animation</done>
</task>

</tasks>

<verification>
1. TypeScript compiles without errors: `npx tsc --noEmit`
2. Dev server runs without errors: `npm run dev`
3. Child cards render inside expanded dropdown
4. Remove button in editor removes cards from dropdown
5. Collapse/expand animation is smooth and dropdown stays in place
</verification>

<success_criteria>
- CardRenderer import added to dropdown-sortable.tsx
- Child cards render correctly when dropdown is expanded
- Remove (X) button in dropdown editor works - cards move to main canvas
- Collapse/expand does not cause dropdown to visually jump position
- No TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/quick/017-fix-dropdown-card-management-add-remove-/017-SUMMARY.md`
</output>
