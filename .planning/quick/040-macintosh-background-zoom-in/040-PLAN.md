---
phase: quick-040
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/cards/macintosh-layout.tsx
  - src/components/public/static-macintosh-layout.tsx
autonomous: true

must_haves:
  truths:
    - "Pattern backgrounds on Macintosh theme are visibly textured and recognizable"
    - "Default checkerboard desktop still works when no pattern is selected"
    - "Both editor preview and public page show the same zoomed-in patterns"
  artifacts:
    - path: "src/components/cards/macintosh-layout.tsx"
      provides: "Editor preview Macintosh background with larger pattern size"
      contains: "backgroundSize"
    - path: "src/components/public/static-macintosh-layout.tsx"
      provides: "Public page Macintosh background with larger pattern size"
      contains: "backgroundSize"
  key_links:
    - from: "src/components/cards/macintosh-layout.tsx"
      to: "public/images/mac-patterns/*.png"
      via: "backgroundImage url() with backgroundSize"
      pattern: "backgroundSize.*200"
---

<objective>
Scale up the Macintosh theme background patterns so the texture is actually visible.

Purpose: The pattern images (4000x2673px each) are being tiled at `backgroundSize: '8px'` which renders them as indistinguishable noise. Increasing to ~200px makes the repeating pattern texture clearly visible and recognizable.

Output: Updated background-size in both the editor layout and the public static layout.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/cards/macintosh-layout.tsx — Editor preview layout, line 36: `backgroundSize: '8px'`
@src/components/public/static-macintosh-layout.tsx — Public page layout, line 54: `backgroundSize: '8px'`
</context>

<tasks>

<task type="auto">
  <name>Task 1: Increase pattern backgroundSize in both Macintosh layout files</name>
  <files>
    src/components/cards/macintosh-layout.tsx
    src/components/public/static-macintosh-layout.tsx
  </files>
  <action>
In `src/components/cards/macintosh-layout.tsx` line 36, change `backgroundSize: '8px'` to `backgroundSize: '200px'`.

In `src/components/public/static-macintosh-layout.tsx` line 54, change `backgroundSize: '8px'` to `backgroundSize: '200px'`.

Both files have the same pattern: a `bgStyle` object that sets `backgroundImage: url(...)`, `backgroundRepeat: 'repeat'`, and `backgroundSize`. Only the `backgroundSize` value needs to change.

Do NOT change the default checkerboard pattern (`DEFAULT_DESKTOP_BG` which uses `repeating-conic-gradient` at `4px 4px`) -- that is intentionally small for the classic Mac checkerboard look.

Also ensure `imageRendering: 'pixelated'` is added to the bgStyle when a pattern is selected, so the scaled-up pixel art patterns stay crisp rather than getting blurry interpolation. Add `imageRendering: 'pixelated' as const` to the pattern bgStyle object in both files.
  </action>
  <verify>
    Run `npx tsc --noEmit` to confirm no type errors.
    Grep both files for `backgroundSize` to confirm the value is `'200px'`.
    Grep both files for `imageRendering` to confirm pixelated rendering is set.
  </verify>
  <done>
    Both Macintosh layout files use backgroundSize '200px' for pattern backgrounds with pixelated rendering. The patterns are visibly textured when viewed in the editor preview and on public pages. The default checkerboard pattern remains unchanged.
  </done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with no errors
- Pattern backgrounds in editor preview show visible, recognizable texture at 200px tile size
- Public page renders the same zoomed-in patterns
- Default checkerboard (no pattern selected) still renders correctly at 4px size
</verification>

<success_criteria>
- backgroundSize changed from '8px' to '200px' in both macintosh-layout.tsx and static-macintosh-layout.tsx
- imageRendering: 'pixelated' added to pattern bgStyle in both files
- No TypeScript errors
- Default desktop background unchanged
</success_criteria>

<output>
After completion, create `.planning/quick/040-macintosh-background-zoom-in/040-SUMMARY.md`
</output>
