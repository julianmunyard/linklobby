---
type: quick
task_id: "045"
title: "Macintosh custom menu bar"
files_modified:
  - src/components/cards/macintosh-layout.tsx
  - src/components/public/static-macintosh-layout.tsx
autonomous: true
---

<objective>
Simplify the Macintosh theme menu bar from the full Mac OS menu (Apple icon, File, Edit, View, Label, Special, Help icon, Window icon) to a minimal custom version showing only "File Edit View [username]" in Pix Chicago font.

**Purpose:** Cleaner, more personalized menu bar that shows the user's identity alongside essential menu items.

**Output:** Simplified menu bar in both editor preview and public page.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/julianmunyard/LinkLobby/.planning/STATE.md

Current menu bar structure (identical in both files):
- Left side: Apple icon ('\uF8FF'), File, Edit, View, Label, Special
- Right side: ? icon (help), window icon
- Font: TITLE_FONT (Pix Chicago)
- Styling: white background, 2px black border-bottom, 28px height

Target: Keep only "File Edit View" on left, add `{title}` prop on right, remove all icons.

The `title` prop is already passed to both components and contains the user's display name.
</context>

<tasks>

<task type="auto">
  <name>Simplify menu bar in editor preview</name>
  <files>src/components/cards/macintosh-layout.tsx</files>
  <action>
    Update the menu bar div (lines 111-124):

    **Left side div (lines 111-118):**
    - Remove Apple icon span: `<span style={{ fontSize: '14px', flexShrink: 0 }}>{'\uF8FF'}</span>`
    - Keep: File, Edit, View spans
    - Remove: Label, Special spans

    **Right side div (lines 119-124):**
    - Remove entire right side div with ? icon and window icon
    - Replace with: `<span>{title}</span>` (title prop already available)

    Keep all other styling intact: fontFamily: TITLE_FONT, fontSize: '12px', gap: '10px', white background, 2px black border-bottom.
  </action>
  <verify>
    Start dev server: `npm run dev`
    Open editor at http://localhost:3000/editor
    Select Macintosh theme
    Check menu bar shows "File Edit View [display name]"
  </verify>
  <done>Menu bar in editor preview shows simplified "File Edit View [username]" with no icons</done>
</task>

<task type="auto">
  <name>Simplify menu bar in public page</name>
  <files>src/components/public/static-macintosh-layout.tsx</files>
  <action>
    Update the menu bar div (lines 185-198):

    **Left side div (lines 185-192):**
    - Remove Apple icon span: `<span style={{ fontSize: '14px', flexShrink: 0 }}>{'\uF8FF'}</span>`
    - Keep: File, Edit, View spans
    - Remove: Label, Special spans

    **Right side div (lines 193-198):**
    - Remove entire right side div with ? icon and window icon
    - Replace with: `<span>{title}</span>` (title prop already available)

    Keep all other styling intact: fontFamily: TITLE_FONT, fontSize: '12px', gap: '10px', white background, 2px black border-bottom.
  </action>
  <verify>
    Visit published Macintosh-themed public page
    Check menu bar shows "File Edit View [username]"
  </verify>
  <done>Menu bar in public page shows simplified "File Edit View [username]" with no icons</done>
</task>

</tasks>

<verification>
**Both files should have identical simplified menu bar:**
- Left side: "File Edit View" in Pix Chicago font
- Right side: User's display name (from title prop)
- No Apple icon, no Label/Special, no help/window icons
- White background, 2px black border-bottom, 28px height preserved
</verification>

<success_criteria>
- [ ] Menu bar shows only "File Edit View [username]"
- [ ] All icons removed (Apple, help, window)
- [ ] Label and Special menu items removed
- [ ] Same changes applied to both editor preview and public page files
- [ ] Pix Chicago font and white bar styling preserved
- [ ] Dev server shows updated menu bar in editor
</success_criteria>

<output>
After completion, create `.planning/quick/045-macintosh-custom-menu-bar/045-SUMMARY.md`
</output>
