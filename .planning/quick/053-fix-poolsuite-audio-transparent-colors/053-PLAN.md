---
phase: quick
plan: 053
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/public/static-flow-grid.tsx
  - src/components/audio/audio-player.tsx
autonomous: true

must_haves:
  truths:
    - "Poolsuite/system-settings audio player buttons have visible cream background on public pages"
    - "System Settings card chrome (outer border, title bar, inner accent box) wraps audio player on public pages"
    - "Audio player appearance on public page matches editor preview"
  artifacts:
    - path: "src/components/public/static-flow-grid.tsx"
      provides: "System Settings card wrapper around audio player on public pages"
    - path: "src/components/audio/audio-player.tsx"
      provides: "Fallback colors for system-settings variant when CSS vars resolve to theme defaults"
  key_links:
    - from: "src/components/public/static-flow-grid.tsx"
      to: "src/components/cards/system-settings-card.tsx"
      via: "SystemSettingsCard import wrapping AudioPlayer"
      pattern: "SystemSettingsCard"
---

<objective>
Fix the Poolsuite/system-settings audio player rendering with transparent/invisible button backgrounds on public pages.

Purpose: The audio player's system-settings variant uses `var(--theme-card-bg)` for button backgrounds and UI elements. In the editor, the audio player is wrapped by `SystemSettingsCard` (via `ThemedCardWrapper` -> `CardRenderer`), which provides the cream card background, borders, and System 7 window chrome. On public pages, `static-flow-grid.tsx` renders the `AudioPlayer` directly in a bare `<div>`, bypassing the themed card wrapper entirely. This means buttons get the correct CSS variable color but lack the surrounding card frame, making the player look broken.

Output: Audio player on public pages wrapped in proper System Settings chrome, matching the editor appearance.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/components/public/static-flow-grid.tsx
@src/components/audio/audio-player.tsx
@src/components/cards/system-settings-card.tsx
@src/components/cards/macintosh-card.tsx
@src/components/public/theme-injector.tsx
@src/lib/themes/system-settings.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Wrap audio player in themed card chrome on public pages</name>
  <files>src/components/public/static-flow-grid.tsx</files>
  <action>
In the audio card rendering block (lines 88-121 of `static-flow-grid.tsx`), wrap the `AudioPlayer` component in the appropriate themed card wrapper based on `themeId`:

**For `system-settings` theme:**
Import `SystemSettingsCard` from `@/components/cards/system-settings-card`. Wrap the AudioPlayer inside `<SystemSettingsCard cardType="audio">`. This provides the cream outer box (`bg-theme-card-bg`), System 7 title bar with close button, and inner accent-colored content area (`bg-theme-accent`) with borders -- matching exactly what `CardRenderer` -> `ThemedCardWrapper` does in the editor.

**For `macintosh` theme:**
Import `MacintoshCard` from `@/components/cards/macintosh-card`. Wrap the AudioPlayer inside `<MacintoshCard cardType="audio">`.

**For all other themes (instagram-reels, mac-os, etc.):**
Wrap in a standard themed div matching what `ThemedCardWrapper` produces for the default/instagram-reels case:
```tsx
<div
  className="overflow-hidden bg-theme-card-bg border border-theme-border"
  style={{ borderRadius: 'var(--theme-border-radius)' }}
>
  <AudioPlayer ... />
</div>
```

This ensures every audio card on every theme gets the same card chrome on public pages that it gets in the editor preview.

**Important:** Do NOT change the existing approach of bypassing `CardRenderer`/`AudioCard` for public page audio -- the Zustand store issue remains valid. We are only adding the visual wrapper that was missing.

**Do NOT wrap themes that already have their own layout handling for audio (receipt, vcr-menu, classified, ipod-classic).** These themes render audio through their own static layout components (e.g., `StaticVcrMenuLayout`) which handle card styling internally. Only the "default flow" themes need wrapping: `system-settings`, `macintosh`, `mac-os`, `instagram-reels`, and any others that fall through to the `StaticFlowGrid` default path.

Actually, checking the code flow: ALL audio cards in StaticFlowGrid already get the themeVariant. The themes that have separate layouts (vcr-menu, ipod-classic, receipt, macintosh, classified) are routed in `PublicPageRenderer` BEFORE reaching StaticFlowGrid. So by the time we're in StaticFlowGrid, the theme is either `system-settings`, `instagram-reels`, or `mac-os`. Wrap for all of these.

Implementation pattern:
```tsx
// After creating the AudioPlayer JSX, wrap it based on theme
if (themeId === 'system-settings') {
  return (
    <div key={card.id} data-card-id={card.id} className={cn("transition-all", widthClass, positionClass)}>
      <SystemSettingsCard cardType="audio">
        <AudioPlayer ... />
      </SystemSettingsCard>
    </div>
  )
}
if (themeId === 'macintosh') {
  return (
    <div key={card.id} data-card-id={card.id} className={cn("transition-all", widthClass, positionClass)}>
      <MacintoshCard cardType="audio">
        <AudioPlayer ... />
      </MacintoshCard>
    </div>
  )
}
// Default: standard card wrapper for instagram-reels, mac-os, etc.
return (
  <div key={card.id} data-card-id={card.id} className={cn("transition-all", widthClass, positionClass)}>
    <div className="overflow-hidden bg-theme-card-bg border border-theme-border" style={{ borderRadius: 'var(--theme-border-radius)' }}>
      <AudioPlayer ... />
    </div>
  </div>
)
```

Note: `SystemSettingsCard` and `MacintoshCard` are `'use client'` components but contain no hooks or state -- they are purely visual wrappers. Importing them into the server component `StaticFlowGrid` works because Next.js server components can render client components.
  </action>
  <verify>
Run `npx next build` to verify no import errors or SSR issues. Visually confirm on a public page with system-settings theme that the audio player has:
- Cream outer border and background
- System 7 title bar with close button
- Inner white/accent content area with the Poolsuite player controls
- Buttons with visible cream (`var(--theme-card-bg)`) backgrounds, not transparent
  </verify>
  <done>Audio player on public pages is wrapped in the same themed card chrome as in the editor for system-settings, macintosh, and default themes. Poolsuite buttons are visible with proper card-bg colored backgrounds.</done>
</task>

<task type="auto">
  <name>Task 2: Add defensive fallback colors in audio player system-settings variant</name>
  <files>src/components/audio/audio-player.tsx</files>
  <action>
As a belt-and-suspenders defense, update the system-settings variant in `audio-player.tsx` to use hardcoded fallback colors in the CSS variable references. This ensures that even if CSS variables somehow don't resolve (edge cases, race conditions), the player still renders with visible colors.

At line 409, change:
```tsx
const btnBg = 'var(--theme-card-bg)'
```
to:
```tsx
const btnBg = 'var(--theme-card-bg, #F9F0E9)'
```

The fallback `#F9F0E9` is the default system-settings card background (warm cream) from `system-settings.ts` line 12.

Similarly, at line 400, change:
```tsx
const psColor = 'var(--theme-text)'
```
to:
```tsx
const psColor = 'var(--theme-text, #000000)'
```

The fallback `#000000` is the default system-settings text color (black).

Also update any other inline `var(--theme-card-bg)` references in the system-settings block (there are several at lines 493, 512, 568, 590-591) to include the same fallback:
- `'var(--theme-card-bg)'` -> `'var(--theme-card-bg, #F9F0E9)'`
- `'1px solid var(--theme-text)'` -> `'1px solid var(--theme-text, #000000)'`

This matches the pattern used by VCR and receipt themes which use hardcoded colors as their primary values.

Do NOT change the `psBorder` on line 406 or `psBox` on line 411-414 since they reference `psBorder` and `psRadius` which will inherit the fallback from `psColor` and `psBorder` respectively.

Actually, `psBorder` at line 406 IS `'1px solid var(--theme-text)'` -- add fallback there too:
```tsx
const psBorder = '1px solid var(--theme-text, #000000)'
```
  </action>
  <verify>
Run `npx next build` to verify no syntax errors. Check that the audio player system-settings variant still renders correctly in the editor (CSS variables override the fallbacks). On public pages, if CSS variables load correctly the fallbacks are unused; if they somehow don't, the player still shows cream buttons on black text instead of transparent.
  </verify>
  <done>All `var(--theme-*)` references in the system-settings audio player variant have defensive fallback values matching the theme defaults, preventing transparent rendering even in edge cases.</done>
</task>

</tasks>

<verification>
1. Build succeeds: `npx next build` completes without errors
2. Public page with system-settings theme shows audio player with:
   - System 7 window chrome (outer border, title bar, inner accent box)
   - Cream button backgrounds (not transparent)
   - Black text and borders
   - Halftone dot pattern visible (not lost against background)
3. Editor preview still shows audio player correctly (no regression)
4. Other themes (instagram-reels, mac-os) show audio player with standard card wrapper on public pages
</verification>

<success_criteria>
- Poolsuite/system-settings audio player buttons are visible with proper cream background on public pages
- Audio player on public pages is visually identical to editor preview for all themes
- No build errors or SSR issues from importing client wrapper components in server component
</success_criteria>

<output>
After completion, create `.planning/quick/053-fix-poolsuite-audio-transparent-colors/053-SUMMARY.md`
</output>
