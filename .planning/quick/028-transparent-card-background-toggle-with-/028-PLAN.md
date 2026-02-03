---
phase: quick
plan: 028
type: execute
wave: 1
depends_on: []
files_modified:
  - src/types/card.ts
  - src/components/editor/card-property-editor.tsx
  - src/components/cards/themed-card-wrapper.tsx
  - src/stores/page-store.ts
autonomous: true

must_haves:
  truths:
    - "User can toggle transparent background on any card"
    - "Transparent cards show only border, no background fill"
    - "User can apply transparency to all cards at once"
  artifacts:
    - path: "src/types/card.ts"
      provides: "transparentBackground field in card content types"
    - path: "src/components/editor/card-property-editor.tsx"
      provides: "Transparency toggle with Apply to All button"
    - path: "src/components/cards/themed-card-wrapper.tsx"
      provides: "Conditional background removal"
  key_links:
    - from: "card-property-editor.tsx"
      to: "page-store.ts"
      via: "handleContentChange and applyTransparencyToAll"
    - from: "themed-card-wrapper.tsx"
      to: "card.content.transparentBackground"
      via: "conditional bg-theme-card-bg class"
---

<objective>
Add a "Make Card Transparent" toggle in the card property editor settings. When enabled, makes the card background transparent while keeping the border. Include an "Apply to All" button so users can apply transparency to all cards at once.

Purpose: Allow users to create visual variety by having some cards with backgrounds and others transparent, showing the page background through the card.
Output: Working transparency toggle with Apply to All functionality.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/types/card.ts
@src/components/editor/card-property-editor.tsx
@src/components/cards/themed-card-wrapper.tsx
@src/stores/page-store.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add transparency toggle to card property editor with Apply to All</name>
  <files>
    src/components/editor/card-property-editor.tsx
    src/stores/page-store.ts
  </files>
  <action>
1. In page-store.ts, add a new action `setAllCardsTransparency: (transparent: boolean) => void` that sets `transparentBackground` in the content of ALL cards.

2. In card-property-editor.tsx, add a new section after the Vertical Alignment toggle group:
   - Import Switch from "@/components/ui/switch"
   - Add a "Transparent Background" section with:
     - Switch toggle bound to `content.transparentBackground`
     - Small "Apply to All" button next to it (use variant="ghost" size="sm")
   - When switch toggled: `handleContentChange({ transparentBackground: !current })`
   - When "Apply to All" clicked: call `setAllCardsTransparency(currentValue)`
   - Layout: Use flex row with justify-between, switch on left with label, button on right

Note: The `transparentBackground` field will be stored in card.content as a boolean (defaults to undefined/false meaning opaque).
  </action>
  <verify>
    - Editor shows transparency toggle for cards
    - Toggle updates card content correctly
    - Apply to All button is visible and callable
  </verify>
  <done>Card property editor has transparency toggle with Apply to All functionality</done>
</task>

<task type="auto">
  <name>Task 2: Apply transparency in themed card wrapper</name>
  <files>
    src/components/cards/themed-card-wrapper.tsx
  </files>
  <action>
1. Update ThemedCardWrapperProps to accept `content?: Record<string, unknown>` prop to read transparency setting.

2. In the default/instagram-reels case (and mac-os non-traffic-light case), conditionally apply background:
   - Current: `bg-theme-card-bg border border-theme-border`
   - New: `${!content?.transparentBackground ? 'bg-theme-card-bg' : ''} border border-theme-border`
   - Use cn() for conditional class composition

3. For MacOSCard and SystemSettingsCard, pass the transparentBackground prop through so those themed wrappers can also respect it (optional - start with default theme only, can be expanded later).

4. Test that transparent cards show page background through them while keeping border visible.

Note: Game and gallery cards are exempt from theming (EXEMPT_CARD_TYPES), so they won't be affected by this change. This is correct behavior - games have fixed arcade aesthetic.
  </action>
  <verify>
    - Card with transparentBackground=true shows no background fill
    - Card with transparentBackground=false/undefined shows normal bg-theme-card-bg
    - Border remains visible in both states
    - `npm run build` succeeds with no type errors
  </verify>
  <done>Themed card wrapper conditionally removes background based on transparency setting</done>
</task>

<task type="auto">
  <name>Task 3: Update card renderer to pass content to wrapper</name>
  <files>
    src/components/cards/card-renderer.tsx
  </files>
  <action>
1. In CardRenderer, pass card.content to ThemedCardWrapper:
   - Find where ThemedCardWrapper is used
   - Add content={card.content} prop

2. This ensures the wrapper has access to transparentBackground setting.

3. Verify the preview updates when toggling transparency in the editor.
  </action>
  <verify>
    - Toggling transparency in editor immediately updates preview
    - `npm run build` succeeds
  </verify>
  <done>Card renderer passes content to themed wrapper for transparency support</done>
</task>

</tasks>

<verification>
1. Open editor, select any card
2. Find "Transparent Background" toggle in property editor
3. Toggle ON - card background should disappear, showing page background through
4. Toggle OFF - card background should return
5. Click "Apply to All" - all cards should match the current transparency state
6. Refresh page - transparency setting should persist (via auto-save)
</verification>

<success_criteria>
- Transparency toggle visible in card property editor
- Toggle works for individual cards
- "Apply to All" applies to all cards
- Transparent cards show page background through border
- Changes persist after refresh
- Build passes with no errors
</success_criteria>

<output>
After completion, create `.planning/quick/028-transparent-card-background-toggle-with-/028-SUMMARY.md`
</output>
