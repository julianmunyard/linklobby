---
phase: quick-034
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/globals.css
  - src/components/cards/ipod-classic-layout.tsx
  - src/components/public/static-ipod-classic-layout.tsx
autonomous: true
---

<objective>
Polish iPod Classic theme with authentic screen styling improvements.

Purpose: Make the iPod Classic theme more authentic with correct screen background color, profile name in status bar, old-school battery icon, and proper highlight styling.
Output: Updated iPod theme files with polished screen appearance.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/components/cards/ipod-classic-layout.tsx
@src/components/public/static-ipod-classic-layout.tsx
@src/app/globals.css (iPod styles around lines 259-538)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update screen background and highlight colors in CSS</name>
  <files>src/app/globals.css</files>
  <action>
Update iPod theme CSS in globals.css:

1. Change `.ipod-screen` background to solid #C2C1BA (not gradient):
   ```css
   .ipod-screen {
     background: #C2C1BA;
     /* ... rest unchanged */
   }
   ```

2. Change `.ipod-menu-list` background to #C2C1BA:
   ```css
   .ipod-menu-list {
     /* ... */
     background: #C2C1BA;
   }
   ```

3. Update `.ipod-menu-item.selected` to have black background with screen-color text:
   ```css
   .ipod-menu-item.selected {
     background: #000000;
     color: #C2C1BA;
   }
   ```

4. Update `.ipod-screen-footer` background to match #C2C1BA:
   ```css
   .ipod-screen-footer {
     /* ... */
     background: #C2C1BA;
     border-top: 1px solid #a8a7a0;
   }
   ```
  </action>
  <verify>Grep for the updated color: `grep -n "C2C1BA" src/app/globals.css`</verify>
  <done>iPod screen uses #C2C1BA background, highlighted items have black bg with #C2C1BA text</done>
</task>

<task type="auto">
  <name>Task 2: Replace status bar text and battery icon in both layouts</name>
  <files>
    src/components/cards/ipod-classic-layout.tsx
    src/components/public/static-ipod-classic-layout.tsx
  </files>
  <action>
Update both iPod layout files with identical changes:

1. In ipod-classic-layout.tsx, update the status bar (around line 157-159):
   - Change "links" text to use the `title` prop (profile name)
   - Replace battery emoji `{'\u{1F50B}'}` with old-school ASCII battery symbol

   FROM:
   ```tsx
   <div className="ipod-status-bar">
     <span className="text-[11px] font-semibold lowercase tracking-wide">links</span>
     <span className="text-[10px]">{'\u{1F50B}'}</span>
   </div>
   ```

   TO:
   ```tsx
   <div className="ipod-status-bar">
     <span className="text-[11px] font-semibold lowercase tracking-wide">{title || 'links'}</span>
     <span className="text-[11px] tracking-tight">[####]</span>
   </div>
   ```

   The `[####]` is an old-school ASCII battery representation (4 bars = full).

2. Apply the exact same changes to static-ipod-classic-layout.tsx (around line 143-145):
   - Use `title` prop for status bar text
   - Replace emoji with `[####]` battery symbol
  </action>
  <verify>TypeScript compiles: `cd /Users/julianmunyard/LinkLobby && npx tsc --noEmit`</verify>
  <done>Status bar shows profile name instead of "links", battery icon is old-school ASCII style</done>
</task>

</tasks>

<verification>
1. Run TypeScript check: `npx tsc --noEmit`
2. Visual verification in dev server with iPod Classic theme selected
3. Screen should show #C2C1BA background (warm gray-green)
4. Highlighted menu item should have black background with matching text color
5. Status bar should show profile name (title prop) not "links"
6. Battery should show [####] instead of emoji
</verification>

<success_criteria>
- Screen background color is #C2C1BA
- Highlighted item has black background with #C2C1BA colored text
- Status bar displays profile name (from title prop)
- Battery icon is old-school ASCII `[####]` style
- Both preview and public page layouts match
</success_criteria>

<output>
After completion, create `.planning/quick/034-ipod-theme-screen-polish/034-SUMMARY.md`
</output>
