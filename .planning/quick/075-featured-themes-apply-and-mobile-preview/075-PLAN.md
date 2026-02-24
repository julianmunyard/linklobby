---
phase: quick
plan: 075
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/editor/featured-themes-tab.tsx
  - src/components/editor/editor-panel.tsx
  - src/components/editor/editor-layout.tsx
autonomous: true

must_haves:
  truths:
    - "Clicking a featured template card applies it (calls /api/templates/apply, hydrates stores)"
    - "If user has existing cards, a confirmation dialog appears with Replace/Add options"
    - "Loading spinner shows on the clicked card while template is applying"
    - "On mobile, after applying a template the bottom sheet dismisses to reveal the preview"
    - "On mobile, the FAB or a button allows returning to the Featured tab in the bottom sheet"
    - "The 'Explore theme' link still navigates to Design > Templates without applying"
  artifacts:
    - path: "src/components/editor/featured-themes-tab.tsx"
      provides: "Template apply logic with confirmation dialog and loading state"
    - path: "src/components/editor/editor-panel.tsx"
      provides: "onTemplateApplied callback threading"
    - path: "src/components/editor/editor-layout.tsx"
      provides: "Mobile bottom sheet dismiss on template apply"
  key_links:
    - from: "featured-themes-tab.tsx"
      to: "/api/templates/apply"
      via: "fetch POST"
      pattern: "fetch.*api/templates/apply"
    - from: "featured-themes-tab.tsx"
      to: "editor-panel.tsx"
      via: "onTemplateApplied callback"
      pattern: "onTemplateApplied"
    - from: "editor-panel.tsx"
      to: "editor-layout.tsx"
      via: "onTemplateApplied prop"
      pattern: "onTemplateApplied"
---

<objective>
Make featured template cards apply the template on click (with confirmation dialog and loading state), and on mobile dismiss the editor bottom sheet after apply so the user sees the preview.

Purpose: Currently featured templates are display-only. Users need to click and immediately see the template applied to their page.
Output: Working apply flow from Featured tab with mobile-optimized UX.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/editor/featured-themes-tab.tsx
@src/components/editor/template-picker.tsx (reference for apply logic - DO NOT modify)
@src/components/editor/editor-panel.tsx
@src/components/editor/editor-layout.tsx
@src/lib/templates/types.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add template apply flow to FeaturedThemesTab</name>
  <files>src/components/editor/featured-themes-tab.tsx</files>
  <action>
    Add template apply logic to `featured-themes-tab.tsx`, replicating the pattern from `template-picker.tsx`:

    1. **New props:** Add `onTemplateApplied?: () => void` to `FeaturedThemesTabProps`.

    2. **State:** Add `useState` for:
       - `applyingId: string | null` - tracks which template card is loading
       - `showConfirm: boolean` - confirmation dialog visibility
       - `pendingTemplate: TemplateDefinition | null` - template awaiting confirmation

    3. **Import** the same stores used by TemplatePicker:
       - `usePageStore` from `@/stores/page-store`
       - `useThemeStore` from `@/stores/theme-store`
       - `useProfileStore` from `@/stores/profile-store`
       - `toast` from `sonner`
       - `Loader2` from `lucide-react`
       - `AlertDialog` + sub-components from `@/components/ui/alert-dialog`
       - `TemplateDefinition` type from `@/lib/templates`
       - `Card` type from `@/types/card`
       - `ThemeState` type from `@/types/theme`
       - `Profile` type from `@/types/profile`

    4. **`applyTemplate(template, mode)` function** - copy the exact logic from TemplatePicker lines 46-88:
       - Set `applyingId` to `template.id`
       - POST to `/api/templates/apply` with `{ templateId: template.id, mode }`
       - On success: hydrate stores (setCards, loadFromDatabase, initializeProfile)
       - CRITICAL: Set `hasChanges: true` on theme and profile stores after hydration (same pattern as TemplatePicker lines 76-77)
       - Show success toast
       - Call `onTemplateApplied?.()` after successful apply
       - On error: show error toast
       - Finally: clear `applyingId` and `pendingTemplate`

    5. **`handleCardClick(template)` function:**
       - Check `usePageStore.getState().cards.length`
       - If > 0: set `pendingTemplate` and `showConfirm = true`
       - If 0: call `applyTemplate(template, 'replace')` directly

    6. **Make the card clickable:** Wrap the existing `motion.div` in a clickable area OR change it to `motion.button`. The entire card (thumbnail + info) should be clickable to apply. But the "Explore theme" button must use `e.stopPropagation()` to prevent also triggering the apply.

    7. **Loading indicator:** When `applyingId === template.id`, overlay a spinner (Loader2 with animate-spin) on the card thumbnail area with a semi-transparent backdrop. Disable clicking other cards while any template is applying.

    8. **Confirmation dialog:** Add the same AlertDialog as TemplatePicker (lines 216-238) at the bottom of the component return. The dialog offers "Replace my page" and "Add to my page" buttons, both calling `applyTemplate(pendingTemplate, mode)`.

    Keep the "Explore theme" button working exactly as before - it calls `onNavigateToTheme` and does NOT apply.
  </action>
  <verify>
    Build passes: `npm run build` (or `npx next build`).
    Manually verify: clicking a featured card triggers the apply API call, stores update, preview refreshes. "Explore theme" still navigates without applying.
  </verify>
  <done>
    Featured template cards are clickable to apply. Confirmation dialog appears when user has existing cards. Loading spinner shows during apply. "Explore theme" link still works independently.
  </done>
</task>

<task type="auto">
  <name>Task 2: Thread onTemplateApplied callback and mobile dismiss</name>
  <files>src/components/editor/editor-panel.tsx, src/components/editor/editor-layout.tsx</files>
  <action>
    **In `editor-panel.tsx`:**

    1. Add `onTemplateApplied?: () => void` to `EditorPanelProps`.
    2. Pass it through to `FeaturedThemesTab`:
       ```tsx
       <FeaturedThemesTab
         onNavigateToTheme={handleNavigateToTheme}
         onTemplateApplied={onTemplateApplied}
       />
       ```

    **In `editor-layout.tsx`:**

    1. Create a `handleTemplateApplied` callback that runs on mobile only:
       ```tsx
       const handleTemplateApplied = useCallback(() => {
         if (isMobileLayout) {
           setMobileSheetOpen(false)
         }
       }, [isMobileLayout])
       ```

    2. Pass it to both EditorPanel instances (mobile bottom sheet and desktop):
       - Mobile: `<EditorPanel ... onTemplateApplied={handleTemplateApplied} />`
       - Desktop: `<EditorPanel ... onTemplateApplied={handleTemplateApplied} />`
       (On desktop it's a no-op since isMobileLayout is false, but keeps props consistent.)

    3. **Mobile re-entry to Featured tab:** The existing MobileFAB does not have a "Featured" button. Add a fourth FAB action to open the bottom sheet on the Featured tab:
       - In the `MobileFAB` section, add an `onOpenFeatured` prop call:
         ```tsx
         onOpenFeatured={() => {
           setInitialTab('featured')
           setInitialDesignTab(null)
           setMobileSheetOpen(true)
         }}
         ```
       - This requires updating `mobile-fab.tsx` to accept and render `onOpenFeatured`. Add it as the topmost FAB button with a Sparkles icon (matching the Featured tab icon). Label it "Featured".

    **In `src/components/editor/mobile-fab.tsx`:**

    4. Add `onOpenFeatured?: () => void` to the MobileFAB props.
    5. Add a FAB button for it using the `Sparkles` icon from lucide-react, positioned in the FAB stack alongside the existing buttons. Use the same styling pattern as the other FAB buttons.
  </action>
  <verify>
    Build passes: `npm run build`.
    On mobile (or responsive dev tools): apply a featured template -> bottom sheet closes -> preview visible -> tap Featured FAB -> bottom sheet reopens on Featured tab.
    On desktop: apply works, no sheet behavior (no-op).
  </verify>
  <done>
    On mobile, applying a featured template dismisses the bottom sheet to reveal the preview. A "Featured" FAB button lets the user reopen the Featured tab. Desktop apply works without side effects.
  </done>
</task>

</tasks>

<verification>
1. `npm run build` passes with no TypeScript errors
2. Click a featured template card -> template applies (stores hydrated, preview updates)
3. With existing cards, clicking shows confirmation dialog with Replace/Add options
4. "Explore theme" link navigates to Design > Templates without applying
5. Loading spinner shows on the card being applied
6. Mobile: after apply, bottom sheet closes; Featured FAB reopens it
</verification>

<success_criteria>
- Featured template cards apply on click with the same flow as TemplatePicker
- Confirmation dialog appears when user has existing cards
- Mobile: bottom sheet dismisses after apply, Featured FAB provides re-entry
- "Explore theme" link behavior is unchanged
- No TypeScript or build errors
</success_criteria>

<output>
After completion, create `.planning/quick/075-featured-themes-apply-and-mobile-preview/075-SUMMARY.md`
</output>
