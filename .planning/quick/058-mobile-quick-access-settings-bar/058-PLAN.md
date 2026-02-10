---
phase: quick
plan: 058
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/editor/mobile-quick-settings.tsx
  - src/components/editor/editor-layout.tsx
  - src/components/editor/design-panel.tsx
autonomous: true

must_haves:
  truths:
    - "On mobile, user sees a row of quick-access setting buttons (Color, Style, Background, Header) below the DashboardHeader toolbar bar"
    - "Tapping a quick-access button opens a compact Drawer with streamlined controls for that setting category"
    - "Each compact Drawer has a 'Full Settings' button that closes the drawer and opens the main editor bottom sheet on the correct Design sub-tab"
    - "Quick settings bar is hidden on desktop (md:hidden)"
  artifacts:
    - path: "src/components/editor/mobile-quick-settings.tsx"
      provides: "MobileQuickSettings component with 4 quick-access buttons and compact drawers"
    - path: "src/components/editor/editor-layout.tsx"
      provides: "Updated mobile layout integrating MobileQuickSettings bar"
    - path: "src/components/editor/design-panel.tsx"
      provides: "Exported activeTab setter or prop to allow external tab navigation"
  key_links:
    - from: "src/components/editor/mobile-quick-settings.tsx"
      to: "src/stores/theme-store.ts"
      via: "useThemeStore hooks for reading/setting colors, style, background"
      pattern: "useThemeStore"
    - from: "src/components/editor/mobile-quick-settings.tsx"
      to: "src/components/editor/editor-layout.tsx"
      via: "callback to open bottom sheet with design tab + sub-tab"
      pattern: "onOpenFullSettings"
    - from: "src/components/editor/editor-layout.tsx"
      to: "src/components/editor/mobile-quick-settings.tsx"
      via: "renders MobileQuickSettings in mobile layout"
      pattern: "MobileQuickSettings"
---

<objective>
Add a mobile-only quick-access settings bar below the DashboardHeader on the editor page. The bar shows 4 compact buttons (Color, Style, Background, Header) that open small Drawer sheets with streamlined versions of the most-used settings. Each drawer includes a "Full Settings" button that opens the main editor bottom sheet directly on the relevant Design sub-tab.

Purpose: On mobile, accessing design settings requires opening the full bottom sheet, navigating to Design tab, then finding the right sub-tab. This adds friction. Quick-access buttons let users make common adjustments (change color palette, toggle card shadows, swap background, edit header name/bio) without the full editor ceremony.

Output: New MobileQuickSettings component, updated editor-layout.tsx mobile section, updated design-panel.tsx to accept initial sub-tab from external navigation.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/editor/editor-layout.tsx
@src/components/editor/design-panel.tsx
@src/components/editor/editor-panel.tsx
@src/components/editor/mobile-bottom-sheet.tsx
@src/components/editor/color-customizer.tsx
@src/components/editor/style-controls.tsx
@src/components/editor/background-controls.tsx
@src/components/editor/header-section.tsx
@src/stores/theme-store.ts
@src/components/dashboard/dashboard-header.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create MobileQuickSettings component with compact drawers</name>
  <files>
    src/components/editor/mobile-quick-settings.tsx
  </files>
  <action>
Create `src/components/editor/mobile-quick-settings.tsx` with a `MobileQuickSettings` component.

**Layout:** A horizontal row of 4 pill-shaped buttons, each with an icon and label:
- Color (Palette icon) - opens compact color quick-access
- Style (Sparkles icon) - opens compact style quick-access
- Background (Image icon) - opens compact background quick-access
- Header (User icon) - opens compact header quick-access

Use a scrollable horizontal row with `overflow-x-auto` and `gap-2`, matching the existing design-panel tab style (rounded-full buttons). Style the buttons with `bg-muted text-muted-foreground` default, and `bg-primary text-primary-foreground` when active (has open drawer).

**Each button opens a Vaul Drawer** (import from `@/components/ui/drawer`) at ~50dvh height (shorter than the full 85dvh editor sheet). The Drawer uses the same pattern as MobileBottomSheet but more compact.

**Props interface:**
```tsx
interface MobileQuickSettingsProps {
  onOpenFullSettings: (subTab: string) => void
}
```

The `onOpenFullSettings` callback receives the design sub-tab ID ('colors', 'style', 'background', 'header') and the parent (editor-layout) handles opening the bottom sheet with the right tab.

**Compact Drawer contents for each:**

1. **Color drawer:** Show the palette presets swatches from the current theme (use `getTheme(themeId)` to get `theme.palettes`), and the 6 individual color pickers (background, cardBg, text, accent, border, link) from `useThemeStore` colors. Use `ColorPicker` from `@/components/ui/color-picker` for each. Include a "Reset to Default" button. At the bottom, a full-width outlined Button: "Full Color Settings" that calls `onOpenFullSettings('colors')` and closes the drawer. Keep it compact: palette swatches as a single row of small circles, color pickers in a 2-column grid of small swatches (just the color circle + label, clicking opens the picker).

2. **Style drawer:** Show border radius slider (0-32px), card shadows toggle (Switch). These are the two main controls from StyleControls. At the bottom: "Full Style Settings" button calling `onOpenFullSettings('style')`. Hide these controls for list-layout themes (vcr-menu, ipod-classic, receipt) and instead show a message "Style settings not available for this theme".

3. **Background drawer:** Show the solid/image/video ToggleGroup type selector. If solid: show a ColorPicker for the background color. If image: show an upload button. Keep it simple - just the type toggle and the primary control. At the bottom: "Full Background Settings" button calling `onOpenFullSettings('background')`.

4. **Header drawer:** Show display name Input, bio Textarea (2 rows), and the profile layout ToggleGroup (Classic/Hero). These are the most-edited header fields. At the bottom: "Full Header Settings" button calling `onOpenFullSettings('header')`.

**State management:** Use a single `useState<string | null>(null)` for `activeDrawer` that tracks which drawer is open (or null for none). Only one drawer can be open at a time. When a button is tapped, if its drawer is already open close it, otherwise open it (close any other).

**Important patterns to follow:**
- Use `touch-pan-y` on scrollable content inside drawers (per existing mobile-bottom-sheet pattern)
- Use existing UI components: `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`, `DrawerClose` from `@/components/ui/drawer`
- Import `useThemeStore` for reading/writing theme state
- Import `useProfileStore` for reading/writing profile state (header drawer)
- Import `getTheme` from `@/lib/themes` for palette data
- Use `cn` from `@/lib/utils` for conditional classes
  </action>
  <verify>
File exists at `src/components/editor/mobile-quick-settings.tsx`. TypeScript compiles without errors: `npx tsc --noEmit --pretty 2>&1 | head -30`. Component exports `MobileQuickSettings` with `onOpenFullSettings` prop.
  </verify>
  <done>
MobileQuickSettings component created with 4 quick-access buttons (Color, Style, Background, Header), each opening a compact Drawer with streamlined controls and a "Full Settings" navigation button.
  </done>
</task>

<task type="auto">
  <name>Task 2: Integrate MobileQuickSettings into editor layout and wire up full-settings navigation</name>
  <files>
    src/components/editor/editor-layout.tsx
    src/components/editor/design-panel.tsx
    src/components/editor/editor-panel.tsx
  </files>
  <action>
**editor-layout.tsx changes:**

1. Import `MobileQuickSettings` from `./mobile-quick-settings`
2. Add state: `const [initialDesignTab, setInitialDesignTab] = useState<string | null>(null)` to track which design sub-tab to open when the bottom sheet opens via quick settings.
3. In the mobile layout section, add `MobileQuickSettings` between the existing mobile toolbar div (that has MobileSelectToggle) and the MobileSelectionBar. Place it inside the existing toolbar div or as a new row below it. Specifically, render it as a new div below the toolbar:

```tsx
{/* Quick access settings bar */}
<MobileQuickSettings
  onOpenFullSettings={(subTab) => {
    setInitialDesignTab(subTab)
    setMobileSheetOpen(true)
  }}
/>
```

4. Pass `initialDesignTab` to `EditorPanel` as a prop, and clear it when the sheet closes:

Update the `MobileBottomSheet` `onOpenChange` to clear the initialDesignTab when the sheet closes:
```tsx
onOpenChange={(open) => {
  setMobileSheetOpen(open)
  if (!open) setInitialDesignTab(null)
}}
```

Pass to EditorPanel:
```tsx
<EditorPanel initialDesignTab={initialDesignTab} onDesignTabConsumed={() => setInitialDesignTab(null)} />
```

**editor-panel.tsx changes:**

1. Add props to EditorPanel: `initialDesignTab?: string | null` and `onDesignTabConsumed?: () => void`
2. When `initialDesignTab` is provided and truthy:
   - Set activeTab to "design" (switches to the design tab)
   - Pass `initialSubTab={initialDesignTab}` to `DesignTab`
   - Call `onDesignTabConsumed?.()` after consuming (use useEffect)

Add a `useEffect` that watches `initialDesignTab`:
```tsx
useEffect(() => {
  if (initialDesignTab) {
    setActiveTab('design')
    onDesignTabConsumed?.()
  }
}, [initialDesignTab])
```

3. Pass `initialSubTab` prop to `DesignTab`:
```tsx
<DesignTab initialSubTab={initialDesignTab} />
```

**design-panel.tsx changes (via design-tab.tsx):**

1. Update `DesignTab` in `design-tab.tsx` to accept and forward `initialSubTab?: string | null` prop to `DesignPanel`.
2. Update `DesignPanel` to accept `initialSubTab?: string | null` prop.
3. Add a `useEffect` in `DesignPanel` that sets `activeTab` when `initialSubTab` changes:
```tsx
useEffect(() => {
  if (initialSubTab && TABS.some(t => t.id === initialSubTab)) {
    setActiveTab(initialSubTab as TabId)
  }
}, [initialSubTab])
```

This way, when the user taps "Full Color Settings" in the quick-access drawer, the bottom sheet opens directly on the Design tab > Colors sub-tab.

**Also update design-tab.tsx** to pass the prop through:
```tsx
interface DesignTabProps {
  initialSubTab?: string | null
}

export function DesignTab({ initialSubTab }: DesignTabProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 pb-20">
        <DesignPanel initialSubTab={initialSubTab} />
      </div>
    </div>
  )
}
```
  </action>
  <verify>
`npm run build 2>&1 | tail -20` completes without errors. On mobile viewport (Chrome DevTools, iPhone 14 or similar):
1. Quick settings bar visible below the header toolbar
2. Tapping "Color" opens a compact drawer with palette swatches and color pickers
3. Tapping "Full Color Settings" closes the compact drawer, opens the main bottom sheet on Design > Colors sub-tab
4. Quick settings bar scrolls horizontally if needed
5. Desktop layout (md+) does NOT show the quick settings bar
  </verify>
  <done>
MobileQuickSettings integrated into editor-layout.tsx mobile view. Bottom sheet + EditorPanel + DesignPanel wired to accept initial sub-tab navigation. Full settings button in each compact drawer opens the main editor directly on the correct Design sub-tab.
  </done>
</task>

</tasks>

<verification>
1. Mobile viewport: Quick settings bar is visible below the DashboardHeader toolbar
2. Each of the 4 buttons (Color, Style, Background, Header) opens a compact Drawer
3. Compact drawers contain streamlined versions of the relevant settings
4. "Full Settings" button in each drawer navigates to the correct Design sub-tab in the main editor
5. Only one drawer can be open at a time
6. Desktop viewport: Quick settings bar is not visible
7. Quick settings state changes (e.g., changing a color) update the preview in real-time
8. No TypeScript errors, build succeeds
</verification>

<success_criteria>
- MobileQuickSettings component renders 4 quick-access buttons on mobile only
- Each button opens a compact Drawer (~50dvh) with the most-used controls for that category
- "Full Settings" button in each drawer opens the main bottom sheet editor on the correct Design sub-tab
- Theme/profile changes made via quick settings are reflected immediately in the preview
- Desktop layout is completely unaffected
- Build completes without errors
</success_criteria>

<output>
After completion, create `.planning/quick/058-mobile-quick-access-settings-bar/058-SUMMARY.md`
</output>
