---
phase: quick
plan: 041
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/themes/system-settings.ts
  - src/components/editor/theme-presets.tsx
  - src/stores/theme-store.ts
  - src/stores/page-store.ts
autonomous: true

must_haves:
  truths:
    - "When System Settings theme is selected, 5 colorway options appear below the theme card in the Presets tab"
    - "Selecting a transparent colorway (Terminal, Nautical, Amber) sets all cards transparent and applies the correct colors"
    - "Selecting a full color colorway (Cherry Wave, Red Label) sets cards to non-transparent and applies the correct colors"
    - "The colorway swatches show representative colors so the user can visually distinguish them"
    - "Colorways update background, cardBg, text, accent, border, and titleBarLine colors correctly"
  artifacts:
    - path: "src/lib/themes/system-settings.ts"
      provides: "5 new palette entries with correct hex colors and transparent flag"
    - path: "src/components/editor/theme-presets.tsx"
      provides: "Colorway selector UI rendered below selected System Settings theme card"
    - path: "src/stores/theme-store.ts"
      provides: "setPalette action handles transparent palettes by calling setAllCardsTransparency"
  key_links:
    - from: "src/components/editor/theme-presets.tsx"
      to: "src/stores/theme-store.ts"
      via: "setPalette call with transparency side-effect"
      pattern: "setPalette|setAllCardsTransparency"
    - from: "src/lib/themes/system-settings.ts"
      to: "src/components/editor/theme-presets.tsx"
      via: "theme.palettes array consumed by colorway renderer"
      pattern: "theme\\.palettes"
---

<objective>
Add 5 colorways to the System Settings (Poolsuite) theme that appear as selectable swatches below the theme card when the System Settings theme is active in the Presets tab.

Purpose: Give users dramatic visual variety within the Poolsuite aesthetic - from hacker terminal green to nautical blue to cherry red - without leaving the System Settings theme.

Output: 5 new palette entries in the System Settings theme config, colorway selector UI in ThemePresets, and transparency side-effect wiring in the theme store.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/themes/system-settings.ts
@src/lib/themes/index.ts
@src/components/editor/theme-presets.tsx
@src/components/editor/color-customizer.tsx
@src/stores/theme-store.ts
@src/stores/page-store.ts
@src/types/theme.ts
@src/components/cards/system-settings-card.tsx
@src/components/cards/themed-card-wrapper.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add colorway palettes to System Settings theme config and wire transparency</name>
  <files>
    src/lib/themes/system-settings.ts
    src/types/theme.ts
    src/stores/theme-store.ts
  </files>
  <action>
**1. Add `transparent` flag to palette type (src/types/theme.ts):**

In the `ThemeConfig` interface, the `palettes` array items have type `{ id: string; name: string; colors: ColorPalette }`. Add an optional `transparent?: boolean` field to each palette item so palettes can declare whether cards should be transparent. Update the type to:

```ts
palettes: Array<{ id: string; name: string; colors: ColorPalette; transparent?: boolean }>
```

**2. Add 5 new colorway palettes to system-settings.ts:**

Add these 5 palettes to the `palettes` array in `systemSettingsTheme` (AFTER the existing 4 palettes - Poolsuite Pink, Classic Cream, Platinum, Miami Vice):

```ts
{
  id: 'terminal',
  name: 'Terminal',
  transparent: true,
  colors: {
    background: '#133e09',
    cardBg: '#133e09',        // Same as bg (transparent cards)
    text: '#dada19',
    accent: '#133e09',
    border: '#dada19',
    link: '#dada19',
    titleBarLine: '#dada19',
  },
},
{
  id: 'nautical',
  name: 'Nautical',
  transparent: true,
  colors: {
    background: '#122d81',
    cardBg: '#122d81',        // Same as bg (transparent cards)
    text: '#dedec7',
    accent: '#122d81',
    border: '#dedec7',
    link: '#dedec7',
    titleBarLine: '#dedec7',
  },
},
{
  id: 'amber',
  name: 'Amber',
  transparent: true,
  colors: {
    background: '#cd8e0e',
    cardBg: '#cd8e0e',        // Same as bg (transparent cards)
    text: '#e8ead2',
    accent: '#cd8e0e',
    border: '#e8ead2',
    link: '#e8ead2',
    titleBarLine: '#e8ead2',
  },
},
{
  id: 'cherry-wave',
  name: 'Cherry Wave',
  transparent: false,
  colors: {
    background: '#a70000',
    cardBg: '#9bdde0',
    text: '#ffffff',
    accent: '#9bdde0',        // Inner box same as card
    border: '#ffffff',
    link: '#ffffff',
    titleBarLine: '#ffffff',
  },
},
{
  id: 'red-label',
  name: 'Red Label',
  transparent: false,
  colors: {
    background: '#ffffff',
    cardBg: '#ac0000',
    text: '#ffffff',
    accent: '#a70000',        // Slightly different red for inner box
    border: '#ffffff',
    link: '#a70000',
    titleBarLine: '#ffffff',
  },
},
```

**3. Wire transparency into setPalette (src/stores/theme-store.ts):**

The `setPalette` action currently just sets colors. It needs to also handle the `transparent` flag from the palette. Import `usePageStore` is NOT possible inside a zustand store (circular deps). Instead, the transparency side-effect should be triggered from the component layer (Task 2 handles this).

However, do add a way to detect if a palette is transparent. In the `setPalette` action, after finding the palette, store whether the palette was transparent. Do NOT add new state for this - the component will read the palette's `transparent` flag directly from the theme config when needed.

No changes needed to setPalette itself beyond what exists - the component will handle calling `setAllCardsTransparency` after `setPalette`.
  </action>
  <verify>
    - `src/lib/themes/system-settings.ts` has 9 total palettes (4 existing + 5 new)
    - Each new palette has `id`, `name`, `transparent`, and full `colors` object with `titleBarLine`
    - `src/types/theme.ts` palette type includes `transparent?: boolean`
    - TypeScript compiles: `npx tsc --noEmit --pretty 2>&1 | head -30`
  </verify>
  <done>System Settings theme has 9 palettes including Terminal, Nautical, Amber, Cherry Wave, and Red Label with correct hex colors and transparency flags. Type system supports the transparent flag.</done>
</task>

<task type="auto">
  <name>Task 2: Add colorway selector UI below selected theme card</name>
  <files>
    src/components/editor/theme-presets.tsx
  </files>
  <action>
Modify ThemePresets to show colorway swatches below the System Settings theme card when it is the active theme.

**1. Import dependencies:**
- Import `getTheme` from `@/lib/themes` (already have THEMES and getThemeDefaults)
- Import `usePageStore` from `@/stores/page-store` to access `setAllCardsTransparency`

**2. Get the setAllCardsTransparency action:**
- Add: `const setAllCardsTransparency = usePageStore((state) => state.setAllCardsTransparency)`
- Get current paletteId: `const paletteId = useThemeStore((state) => state.paletteId)` (already have themeId)
- Get setPalette: `const setPalette = useThemeStore((state) => state.setPalette)` (need to add to destructuring)

**3. Create a handleColorwaySelect function:**
```ts
const handleColorwaySelect = (palette: { id: string; transparent?: boolean }) => {
  setPalette(palette.id)
  clearCardColorOverrides()
  // Apply transparency based on colorway flag
  setAllCardsTransparency(palette.transparent === true)
}
```

**4. Render colorway swatches below the System Settings theme button:**

After each theme button in the map, if the theme is `system-settings` AND it is the currently selected theme (`isSelected`), render a colorway row. The colorways should appear as small circular or rectangular swatches showing the palette's background and text colors, displayed inline below the theme card but still inside the same grid cell.

Structure for the colorway row (rendered immediately after the theme card button, inside the same map iteration):

```tsx
{isSelected && theme.id === 'system-settings' && (
  <div className="mt-2 space-y-1.5">
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Colorways</p>
    <div className="flex flex-wrap gap-1.5">
      {theme.palettes.map((palette) => {
        const isActivePalette = paletteId === palette.id
        return (
          <button
            key={palette.id}
            onClick={(e) => {
              e.stopPropagation()
              handleColorwaySelect(palette)
            }}
            className={cn(
              "relative flex gap-0.5 h-6 rounded overflow-hidden border-2 transition-all",
              isActivePalette ? "border-accent ring-1 ring-accent" : "border-transparent hover:border-muted"
            )}
            title={palette.name}
          >
            {/* Show 3 key colors as mini swatches: background, card, text */}
            <div className="w-4 h-full" style={{ backgroundColor: palette.colors.background }} />
            <div className="w-4 h-full" style={{ backgroundColor: palette.colors.cardBg }} />
            <div className="w-4 h-full" style={{ backgroundColor: palette.colors.text }} />
            {isActivePalette && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Check className="w-2.5 h-2.5 text-white drop-shadow-sm" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  </div>
)}
```

**5. Wrap the theme button and colorway row in a fragment or div:**

The current code renders `<button key={theme.id}>` directly in the grid. Since we need to render the colorway row after the button for the selected system-settings theme, wrap in a React Fragment with the key on the fragment:

```tsx
{THEMES.map((theme) => {
  const isSelected = themeId === theme.id
  const defaults = getThemeDefaults(theme.id)

  return (
    <div key={theme.id}>
      <button ... >
        {/* existing button content */}
      </button>
      {/* Colorway row - only for selected system-settings */}
      {isSelected && theme.id === 'system-settings' && (
        <div className="mt-2 space-y-1.5">
          ...colorway swatches...
        </div>
      )}
    </div>
  )
})}
```

**IMPORTANT:** The `handleThemeSelect` function already calls `setTheme` and `clearCardColorOverrides`. When switching TO system-settings, the default palette (poolsuite-pink) is applied which is NOT transparent, so no transparency change needed on theme switch. The transparency side-effect only triggers when explicitly selecting a colorway.

**IMPORTANT:** Also apply this same colorway pattern for the `macintosh` theme if it has palettes - check if `theme.palettes.length > 0` rather than hardcoding `system-settings`. This makes it reusable. Actually, per the user's request this is specifically for the Poolsuite/System Settings theme. But to keep it clean, conditionally show colorways for any theme that is selected and has more than 4 palettes (or simply for any selected theme with palettes). The simplest approach: show colorways for ANY selected theme. This way Macintosh palettes also become accessible. Use:

```tsx
{isSelected && theme.palettes.length > 0 && (
  <div className="mt-2 space-y-1.5">
    ...
  </div>
)}
```

This way all themes get colorway swatches when selected, which is a nice bonus.
  </action>
  <verify>
    - Select System Settings theme in the editor Presets tab
    - 9 colorway swatches appear below the selected System Settings theme card
    - Clicking "Terminal" swatch changes page to dark green bg with yellow text and makes cards transparent
    - Clicking "Cherry Wave" swatch changes page to red bg with teal cards (not transparent)
    - Clicking another theme hides the colorway swatches
    - TypeScript compiles: `npx tsc --noEmit --pretty 2>&1 | head -30`
    - Dev server runs without errors: check browser console
  </verify>
  <done>Colorway swatches appear below the selected theme card in the Presets tab. Selecting a transparent colorway makes all cards transparent. Selecting a full-color colorway makes cards opaque. Colors (background, text, card, border, titleBarLine) all update correctly per colorway spec.</done>
</task>

</tasks>

<verification>
1. Select "System Settings" theme in the Presets tab
2. Verify 9 colorway swatches appear below the theme card (4 original + 5 new)
3. Click "Terminal" - background turns #133e09, text/borders turn #dada19, cards become transparent
4. Click "Nautical" - background turns #122d81, everything else #dedec7, cards stay transparent
5. Click "Amber" - background turns #cd8e0e, everything else #e8ead2, cards stay transparent
6. Click "Cherry Wave" - background turns #a70000, cards turn #9bdde0 (opaque), text white
7. Click "Red Label" - background turns #ffffff, cards turn #ac0000 (opaque), text white
8. Click "Poolsuite Pink" to restore defaults - cards return to original cream look (opaque)
9. Switch to a different theme (e.g., Instagram Reels) - colorway swatches disappear
10. TypeScript compiles clean: `npx tsc --noEmit`
</verification>

<success_criteria>
- 5 new colorways selectable in the System Settings theme Presets tab
- Transparent colorways (Terminal, Nautical, Amber) make all cards transparent
- Full-color colorways (Cherry Wave, Red Label) make cards opaque
- All colors (background, cardBg, text, accent, border, titleBarLine) apply correctly
- Switching between colorways is smooth with no errors
- TypeScript compiles without errors
</success_criteria>

<output>
After completion, create `.planning/quick/041-macintosh-theme-colorways/041-SUMMARY.md`
</output>
