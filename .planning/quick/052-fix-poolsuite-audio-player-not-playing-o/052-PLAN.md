---
phase: quick-052
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/public/public-page-renderer.tsx
  - src/components/public/static-flow-grid.tsx
autonomous: true

must_haves:
  truths:
    - "Poolsuite (system-settings) audio player plays audio on public page when play button is pressed"
    - "Audio player renders with correct Poolsuite/system-settings theme variant on public page (not Instagram Reels fallback)"
    - "VCR, receipt, and classified audio players continue to work correctly on their respective public page layouts"
  artifacts:
    - path: "src/components/public/public-page-renderer.tsx"
      provides: "Passes themeId to StaticFlowGrid in default (no-frame) layout path"
      contains: "themeId={themeId}"
    - path: "src/components/public/static-flow-grid.tsx"
      provides: "Audio card rendering with correct themeVariant for all themes"
  key_links:
    - from: "src/components/public/public-page-renderer.tsx"
      to: "src/components/public/static-flow-grid.tsx"
      via: "themeId prop"
      pattern: "themeId=\\{themeId\\}"
    - from: "src/components/public/static-flow-grid.tsx"
      to: "src/components/audio/audio-player.tsx"
      via: "themeVariant prop derived from themeId"
      pattern: "themeVariant=\\{themeVariant\\}"
---

<objective>
Fix the Poolsuite (system-settings) audio player not playing on public pages.

Purpose: The system-settings theme audio card renders as a broken Instagram Reels player instead of the Poolsuite player because the `themeId` prop is not passed to `StaticFlowGrid` in the default layout path of `PublicPageRenderer`. This causes the audio card special handling in `StaticFlowGrid` to be skipped (the `themeId` guard fails), falling through to `CardRenderer` which uses `useThemeStore` (not hydrated on public pages, defaults to instagram-reels). The result is the wrong player variant renders inside System Settings window chrome, and play does nothing.

Output: Working Poolsuite audio player on public pages for system-settings theme.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/public/public-page-renderer.tsx
@src/components/public/static-flow-grid.tsx
@src/components/audio/audio-player.tsx
@src/components/cards/audio-card.tsx
</context>

<root_cause>
In `public-page-renderer.tsx`, the `system-settings` theme does NOT have a dedicated layout (unlike VCR, receipt, classified which each have their own `Static*Layout` with direct `AudioPlayer` rendering). It falls through to the default layout path.

There are TWO default layout paths:
1. **Frame-aware path** (line ~368): DOES pass `themeId={themeId}` to `StaticFlowGrid` -- works correctly
2. **No-frame default path** (line ~414): does NOT pass `themeId` to `StaticFlowGrid` -- BROKEN

Without `themeId`, in `StaticFlowGrid` line 89, the condition `card.card_type === 'audio' && themeId && isAudioContent(card.content)` fails because `themeId` is falsy. The audio card then falls through to `CardRenderer` which:
- Wraps in `ThemedCardWrapper` (adds System Settings window chrome)
- Renders `AudioCard` which uses `useThemeStore` (not hydrated on public pages, defaults to `instagram-reels`)
- Result: Instagram Reels audio player inside System Settings chrome, play button does nothing
</root_cause>

<tasks>

<task type="auto">
  <name>Task 1: Pass themeId to StaticFlowGrid in default layout path</name>
  <files>src/components/public/public-page-renderer.tsx</files>
  <action>
  In `public-page-renderer.tsx`, find the no-frame default layout path (the `return` block starting around line 387). Locate the `StaticFlowGrid` component call around line 415-422 that currently looks like:

  ```tsx
  <StaticFlowGrid
    cards={cards}
    socialIconsJson={hasSocialIconsCard ? socialIconsJson : undefined}
    socialIconSize={socialIconSize}
    socialIconColor={socialIconColor}
    headerTextColor={headerTextColor}
  />
  ```

  Add the missing `themeId` prop:

  ```tsx
  <StaticFlowGrid
    cards={cards}
    socialIconsJson={hasSocialIconsCard ? socialIconsJson : undefined}
    socialIconSize={socialIconSize}
    socialIconColor={socialIconColor}
    headerTextColor={headerTextColor}
    themeId={themeId}
  />
  ```

  This is the only change needed. The frame-aware path (line ~368) already passes `themeId={themeId}` correctly.

  This ensures that when system-settings (or any theme using the default layout) renders audio cards, `StaticFlowGrid` has the `themeId` value, the audio card special handling condition passes, and `AudioPlayer` receives the correct `themeVariant="system-settings"` prop -- rendering the Poolsuite player with working play/pause.
  </action>
  <verify>
  1. Run `npx tsc --noEmit` to verify no type errors
  2. Run `npm run build` to verify build succeeds
  3. Visually confirm on public page with system-settings theme: audio card renders as Poolsuite player (bordered boxes with transport buttons), not as Instagram Reels player. Press play -- audio plays.
  </verify>
  <done>
  - System-settings audio card on public page renders with Poolsuite theme variant (bordered transport buttons, halftone slider, reverb knob)
  - Play button works and audio plays
  - VCR, receipt, classified audio cards unaffected (they use their own dedicated layouts)
  - Instagram Reels default theme audio cards unaffected (themeId passed correctly now)
  </done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes
- `npm run build` succeeds
- Public page with system-settings theme shows Poolsuite audio player, not Instagram Reels fallback
- Play button on Poolsuite audio player works and plays audio
- Other themes' audio players continue working (VCR, receipt, classified all have dedicated layouts unaffected by this change)
</verification>

<success_criteria>
- The Poolsuite (system-settings) audio player renders correctly on public pages with the bordered-box Poolsuite design
- Pressing play on the Poolsuite audio player plays audio
- No regression on other themes' audio playback
</success_criteria>

<output>
After completion, create `.planning/quick/052-fix-poolsuite-audio-player-not-playing-o/052-SUMMARY.md`
</output>
