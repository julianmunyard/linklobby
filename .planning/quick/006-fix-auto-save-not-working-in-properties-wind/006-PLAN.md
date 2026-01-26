---
task: 006
type: quick
description: Fix auto-save not working in properties window - stale closure bug
files_modified:
  - src/components/editor/editor-panel.tsx
  - src/components/editor/preview-panel.tsx
---

<objective>
Fix the auto-save feature that was "fixed" in quick tasks 004 and 005 but is still broken.

**Root cause identified:** Stale closure bug. The `handleClose` and `handleDeselect` functions capture `hasChanges` from React's render cycle, but `form.watch()` updates happen asynchronously. When the user clicks X or clicks outside, the closure holds an old (stale) value of `hasChanges` (often `false`) even though the store's current value is `true`.

**Solution:** Read `hasChanges` directly from the Zustand store at call time using `usePageStore.getState().hasChanges` instead of relying on the closure-captured React hook value.
</objective>

<context>
@src/components/editor/editor-panel.tsx
@src/components/editor/preview-panel.tsx
@src/stores/page-store.ts
@.planning/quick/005-fix-auto-save-on-close/005-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix stale closure in editor-panel.tsx</name>
  <files>src/components/editor/editor-panel.tsx</files>
  <action>
In the `handleClose` function, replace the closure-captured `hasChanges` with a direct store read:

```typescript
const handleClose = async () => {
  // Read hasChanges directly from store to avoid stale closure
  const currentHasChanges = usePageStore.getState().hasChanges
  if (currentHasChanges) {
    await saveCards()
  }
  selectCard(null)
}
```

This ensures we check the CURRENT value of `hasChanges` at the moment of click, not the value captured during the last render.

Remove the `hasChanges` selector subscription since it's no longer needed:
- Remove: `const hasChanges = usePageStore((state) => state.hasChanges)`
  </action>
  <verify>TypeScript compiles without errors: `npm run build`</verify>
  <done>handleClose reads hasChanges directly from store, not from stale closure</done>
</task>

<task type="auto">
  <name>Task 2: Fix stale closure in preview-panel.tsx</name>
  <files>src/components/editor/preview-panel.tsx</files>
  <action>
In the `handleDeselect` function, replace the closure-captured `hasChanges` with a direct store read:

```typescript
const handleDeselect = async () => {
  // Read hasChanges directly from store to avoid stale closure
  const currentHasChanges = usePageStore.getState().hasChanges
  if (currentHasChanges) {
    await saveCards()
  }
  selectCard(null)
}
```

Remove the `hasChanges` selector subscription since it's no longer needed:
- Remove: `const hasChanges = usePageStore((state) => state.hasChanges)`
  </action>
  <verify>TypeScript compiles without errors: `npm run build`</verify>
  <done>handleDeselect reads hasChanges directly from store, not from stale closure</done>
</task>

<task type="auto">
  <name>Task 3: Verify fix works end-to-end</name>
  <files>N/A - verification only</files>
  <action>
1. Run `npm run dev`
2. Open the editor, select a card
3. Change the title in the property editor
4. IMMEDIATELY click X to close (don't wait for auto-save debounce)
5. Reload the page
6. Verify the title change persisted to the database

Also test clicking outside the card (on preview panel) to deselect - changes should save.
  </action>
  <verify>
- `npm run build` passes
- Manual test: changes persist when clicking X immediately after editing
- Manual test: changes persist when clicking outside immediately after editing
  </verify>
  <done>Auto-save on close works correctly - changes persist even when clicking X/outside immediately after editing</done>
</task>

</tasks>

<verification>
- [ ] `npm run build` passes without errors
- [ ] Changes save when clicking X to close property editor
- [ ] Changes save when clicking preview panel to deselect card
- [ ] Changes persist after page reload
</verification>

<success_criteria>
User can edit a card property, immediately click X or click elsewhere, and the changes are saved to the database and persist after page reload.
</success_criteria>

<output>
After completion, create `.planning/quick/006-fix-auto-save-not-working-in-properties-wind/006-SUMMARY.md`
</output>
