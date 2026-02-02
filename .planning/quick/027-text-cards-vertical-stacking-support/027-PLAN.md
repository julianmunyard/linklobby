---
phase: quick
plan: 027
type: execute
wave: 1
depends_on: []
files_modified:
  - src/types/card.ts
  - src/components/canvas/sortable-flow-card.tsx
  - src/components/canvas/preview-sortable-card.tsx
  - src/components/editor/card-property-editor.tsx
autonomous: true

must_haves:
  truths:
    - "Text cards can be sized as 'big' (full width) or 'small' (half width)"
    - "Two small text cards can appear side by side on the same row"
    - "Big text cards take full width (current behavior preserved)"
    - "Size picker appears in property editor for text cards"
  artifacts:
    - path: "src/types/card.ts"
      provides: "CARD_TYPE_SIZING includes text with sizing options"
      contains: "text: ['big', 'small']"
    - path: "src/components/canvas/sortable-flow-card.tsx"
      provides: "Text cards use size-based width classes"
    - path: "src/components/canvas/preview-sortable-card.tsx"
      provides: "Text cards use size-based width classes"
  key_links:
    - from: "card-property-editor.tsx"
      to: "CARD_TYPE_SIZING[card.card_type]"
      via: "Conditional size picker rendering"
      pattern: "CARD_TYPE_SIZING\\[card.card_type\\]"
---

<objective>
Enable text cards to stack horizontally (side by side) in addition to vertically.

Purpose: Users need text cards to appear next to each other on the same row, not just stacked underneath each other. This matches how other card types like hero and square support both full-width and half-width layouts.

Output: Text cards with size property support (big/small), half-width text cards stack side by side in flow grid.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/types/card.ts
@src/components/canvas/sortable-flow-card.tsx
@src/components/canvas/preview-sortable-card.tsx
@src/components/editor/card-property-editor.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add text card sizing support to type system</name>
  <files>src/types/card.ts</files>
  <action>
Update CARD_TYPE_SIZING to support sizing for text cards:

1. Change `text: null` to `text: ['big', 'small']` in CARD_TYPE_SIZING record

This enables the size picker to appear in the property editor for text cards.
  </action>
  <verify>TypeScript compiles without errors. CARD_TYPE_SIZING['text'] returns ['big', 'small'].</verify>
  <done>Text card type supports size property in type system.</done>
</task>

<task type="auto">
  <name>Task 2: Update flow grid components for text card sizing</name>
  <files>src/components/canvas/sortable-flow-card.tsx, src/components/canvas/preview-sortable-card.tsx</files>
  <action>
Update both sortable card components to handle text cards with size-based width:

**sortable-flow-card.tsx:**
Currently uses simple size check on line 32: `card.size === "big" ? "w-full" : "w-[calc(50%-0.5rem)]"`
This already works correctly for text cards once sizing is enabled.

**preview-sortable-card.tsx:**
Lines 44-55 have special handling for mini/text as `isPositionableCard` with `w-fit`.
This needs updating:

1. Change `isPositionableCard` to only include 'mini' (text cards should use size-based layout like other cards)
2. Text cards should fall through to the standard size-based width logic:
   - `size === 'big'` -> `w-full`
   - `size === 'small'` -> `w-[calc(50%-0.5rem)]`

3. Remove text from POSITIONABLE_CARD_TYPES in card-property-editor.tsx since position controls are for w-fit cards only (mini), not sized cards (text).
  </action>
  <verify>
Run `npm run build` to verify TypeScript compiles.
Test in browser: Create two text cards, set both to "Small" size, verify they appear side by side on same row.
  </verify>
  <done>Text cards use size-based layout. Small text cards stack horizontally (2 per row). Big text cards are full width.</done>
</task>

<task type="auto">
  <name>Task 3: Remove position control for text cards</name>
  <files>src/components/editor/card-property-editor.tsx</files>
  <action>
Update POSITIONABLE_CARD_TYPES on line 42:

1. Change from `['mini', 'text']` to `['mini']`

Text cards now use size-based layout (big/small) instead of position-based layout (left/center/right). The position control only makes sense for w-fit cards like mini that use margin-based positioning.

The size picker will automatically appear for text cards due to Task 1 (CARD_TYPE_SIZING check on line 307).
  </action>
  <verify>
Open property editor for a text card:
- Size picker (Big/Small) should appear
- Position picker (Left/Center/Right) should NOT appear
  </verify>
  <done>Text card property editor shows size picker, not position picker.</done>
</task>

</tasks>

<verification>
1. `npm run build` passes
2. Create text card - defaults to big (full width)
3. Set text card to Small - card becomes half width
4. Create second text card, set to Small - both appear side by side
5. Property editor shows Size picker for text cards
6. Property editor does NOT show Position picker for text cards
</verification>

<success_criteria>
- Text cards support big/small sizing like hero/square/video/gallery cards
- Two small text cards stack horizontally on the same row
- Big text cards remain full width
- Size picker visible in property editor for text cards
- Position picker removed from text card property editor
</success_criteria>

<output>
After completion, create `.planning/quick/027-text-cards-vertical-stacking-support/027-SUMMARY.md`
</output>
