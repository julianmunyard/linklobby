---
phase: quick
plan: 038
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/editor/design-panel.tsx
  - src/components/editor/style-controls.tsx
autonomous: true
---

<objective>
Clean up design tab controls to hide irrelevant options per theme type.

Purpose: Currently the Fonts tab shows for themes with fixed fonts (VCR, iPod, Receipt) where users cannot change them, and the Style tab shows border radius/shadows for list-layout themes where they have no effect. This creates confusion.

Output: Design panel intelligently shows/hides tabs and controls based on current theme.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Theme characteristics from research:
- Card layout themes (customizable fonts): mac-os, instagram-reels, system-settings
- List layout themes (fixed fonts): vcr-menu, ipod-classic, receipt
- Border radius/shadows apply to: mac-os, instagram-reels, system-settings
- VCR Menu fixed font: Pixter Granular
- iPod Classic fixed font: Chiq
- Receipt fixed fonts: Hypermarket, Ticket de Caisse

Current files:
- design-panel.tsx: Has TABS array with ['presets', 'colors', 'fonts', 'background', 'style', 'header']
- style-controls.tsx: Already has theme-specific sections (VCR center toggle, receipt price/stickers, iPod texture/stickers)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Hide Fonts tab for fixed-font themes</name>
  <files>src/components/editor/design-panel.tsx</files>
  <action>
1. Import useThemeStore to get current themeId
2. Create constant FIXED_FONT_THEMES = ['vcr-menu', 'ipod-classic', 'receipt']
3. Filter TABS array before rendering to exclude 'fonts' tab when themeId is in FIXED_FONT_THEMES
4. Use useMemo to compute filtered tabs based on themeId

Pattern:
```tsx
const themeId = useThemeStore((state) => state.themeId)
const FIXED_FONT_THEMES: ThemeId[] = ['vcr-menu', 'ipod-classic', 'receipt']

const visibleTabs = useMemo(() => {
  return TABS.filter(tab => {
    if (tab.id === 'fonts' && FIXED_FONT_THEMES.includes(themeId)) {
      return false
    }
    return true
  })
}, [themeId])
```

Then map over visibleTabs instead of TABS in the render.
  </action>
  <verify>
1. Switch to VCR Menu theme - Fonts tab should not appear
2. Switch to iPod Classic theme - Fonts tab should not appear
3. Switch to Receipt theme - Fonts tab should not appear
4. Switch to Mac OS, Instagram Reels, or System Settings - Fonts tab should appear
  </verify>
  <done>Fonts tab hidden for vcr-menu, ipod-classic, and receipt themes</done>
</task>

<task type="auto">
  <name>Task 2: Hide border radius and shadows for list-layout themes</name>
  <files>src/components/editor/style-controls.tsx</files>
  <action>
1. Create constant LIST_LAYOUT_THEMES = ['vcr-menu', 'ipod-classic', 'receipt'] (same as fixed font themes)
2. Wrap the Border Radius slider section in a conditional: only show if themeId is NOT in LIST_LAYOUT_THEMES
3. Wrap the Card Shadows toggle section in the same conditional
4. The Glass Blur section already has its own conditional (theme?.hasGlassEffect), keep that as-is
5. Theme-specific controls (VCR center, receipt price/stickers, iPod texture/stickers) remain visible - they're already conditional

The result for each theme's Style tab:
- Mac OS / Instagram Reels / System Settings: Border Radius, Card Shadows, Card Preview
- VCR Menu: Center Content toggle, Card Preview
- iPod Classic: Body Texture picker, Stickers, Card Preview
- Receipt: Price input, Float Animation toggle, Stickers, Card Preview

Pattern:
```tsx
const LIST_LAYOUT_THEMES: ThemeId[] = ['vcr-menu', 'ipod-classic', 'receipt']
const showCardStyleControls = !LIST_LAYOUT_THEMES.includes(themeId)

{showCardStyleControls && (
  <>
    {/* Border Radius section */}
    {/* Shadow Toggle section */}
  </>
)}
```
  </action>
  <verify>
1. Switch to VCR Menu theme, open Style tab - should only see Center Content toggle and Card Preview
2. Switch to iPod Classic theme, open Style tab - should only see Body Texture, Stickers, and Card Preview
3. Switch to Receipt theme, open Style tab - should only see Price, Float Animation, Stickers, and Card Preview
4. Switch to Mac OS/Instagram Reels/System Settings - should see Border Radius, Card Shadows, and Card Preview
  </verify>
  <done>Border radius and card shadows hidden for list-layout themes; theme-specific controls remain visible</done>
</task>

</tasks>

<verification>
1. Test all 6 themes and verify correct tab visibility:
   - Mac OS: All tabs visible
   - Instagram Reels: All tabs visible
   - System Settings: All tabs visible
   - VCR Menu: No Fonts tab, Style tab shows only Center Content
   - iPod Classic: No Fonts tab, Style tab shows only Texture + Stickers
   - Receipt: No Fonts tab, Style tab shows only Price + Float Animation + Stickers

2. Switching between themes updates tabs immediately (no stale state)
3. No console errors when switching themes
</verification>

<success_criteria>
- Fonts tab hidden for VCR Menu, iPod Classic, and Receipt themes
- Border radius and card shadows hidden in Style tab for list-layout themes
- Theme-specific Style controls (VCR center, iPod texture/stickers, receipt price/stickers) remain functional
- Tab visibility updates immediately when switching themes
</success_criteria>

<output>
After completion, create `.planning/quick/038-clean-up-design-tab-controls-per-theme/038-SUMMARY.md`
</output>
