---
phase: quick
plan: 055
type: execute
wave: 1
depends_on: []
files_modified:
  - src/types/theme.ts
  - src/stores/theme-store.ts
  - src/components/editor/style-controls.tsx
  - src/app/globals.css
  - src/components/cards/receipt-layout.tsx
  - src/components/public/static-receipt-layout.tsx
  - src/components/public/public-page-renderer.tsx
  - src/app/[username]/page.tsx
autonomous: true

must_haves:
  truths:
    - "Receipt paper texture is OFF by default for new users"
    - "Toggle in design panel turns texture on/off"
    - "Setting persists to database via theme_settings"
    - "Editor preview reflects texture toggle state"
    - "Public page reflects texture toggle state"
  artifacts:
    - path: "src/types/theme.ts"
      provides: "receiptPaperTexture field on ThemeState"
      contains: "receiptPaperTexture"
    - path: "src/stores/theme-store.ts"
      provides: "receiptPaperTexture state and setReceiptPaperTexture action"
      contains: "setReceiptPaperTexture"
    - path: "src/components/editor/style-controls.tsx"
      provides: "Paper Texture toggle for receipt theme"
      contains: "Paper Texture"
  key_links:
    - from: "src/components/editor/style-controls.tsx"
      to: "src/stores/theme-store.ts"
      via: "setReceiptPaperTexture action"
      pattern: "setReceiptPaperTexture"
    - from: "src/stores/theme-store.ts"
      to: "src/app/[username]/page.tsx"
      via: "getSnapshot -> theme_settings -> prop"
      pattern: "receiptPaperTexture"
    - from: "src/app/globals.css"
      to: "src/components/cards/receipt-layout.tsx"
      via: "receipt-paper-texture CSS class conditional"
      pattern: "receipt-paper-texture"
---

<objective>
Add a toggle to turn the receipt paper texture overlay on and off. The texture starts OFF by default. The toggle lives in the design panel (StyleControls) alongside the other receipt-specific settings (price, float animation, stickers). The setting persists to database via theme_settings and applies on both the editor preview and the public page.

Purpose: Give users control over the paper texture effect which some find too heavy or want a cleaner look.
Output: Working toggle that controls the ::after and ::before pseudo-element texture overlays on .receipt-paper
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/types/theme.ts
@src/stores/theme-store.ts
@src/components/editor/style-controls.tsx
@src/app/globals.css
@src/components/cards/receipt-layout.tsx
@src/components/public/static-receipt-layout.tsx
@src/components/public/public-page-renderer.tsx
@src/app/[username]/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add receiptPaperTexture to type system, store, and design panel toggle</name>
  <files>
    src/types/theme.ts
    src/stores/theme-store.ts
    src/components/editor/style-controls.tsx
  </files>
  <action>
1. In `src/types/theme.ts`, add `receiptPaperTexture?: boolean` to the `ThemeState` interface, right after `receiptFloatAnimation`. This is an optional boolean (defaults to false when undefined, meaning texture OFF by default).

2. In `src/stores/theme-store.ts`:
   - Add `receiptPaperTexture: boolean` to the ThemeStore interface comment section around line 35, after `receiptFloatAnimation`.
   - Add `setReceiptPaperTexture: (enabled: boolean) => void` to the actions section around line 64, after `setReceiptFloatAnimation`.
   - Set initial value `receiptPaperTexture: false` in the create block around line 139, after `receiptFloatAnimation: true`.
   - Add the action implementation after `setReceiptFloatAnimation`:
     ```
     setReceiptPaperTexture: (enabled: boolean) => {
       set({ receiptPaperTexture: enabled, hasChanges: true })
     },
     ```
   - In `loadFromDatabase` around line 427, add: `receiptPaperTexture: theme.receiptPaperTexture ?? false,` after `receiptFloatAnimation`.
   - In `getSnapshot` around line 457, add: `receiptPaperTexture: state.receiptPaperTexture,` after `receiptFloatAnimation`.
   - Destructure `receiptPaperTexture` and `setReceiptPaperTexture` in the StyleControls import from useThemeStore (line 38).

3. In `src/components/editor/style-controls.tsx`:
   - Add `receiptPaperTexture` and `setReceiptPaperTexture` to the destructured values from `useThemeStore()` on line 38.
   - Add a new Switch toggle for the receipt theme BEFORE the Float Animation toggle (around line 148), using the same pattern:
     ```tsx
     {/* Receipt Theme: Paper Texture Toggle */}
     {themeId === 'receipt' && (
       <div className="flex items-center justify-between">
         <div>
           <Label className="text-sm">Paper Texture</Label>
           <p className="text-xs text-muted-foreground">Overlay paper and plastic texture effects</p>
         </div>
         <Switch
           checked={receiptPaperTexture}
           onCheckedChange={setReceiptPaperTexture}
         />
       </div>
     )}
     ```
  </action>
  <verify>
    TypeScript compiles without errors: `npx tsc --noEmit` (check for no errors related to receiptPaperTexture).
    The toggle appears in the design panel when the receipt theme is selected.
  </verify>
  <done>
    receiptPaperTexture field exists in ThemeState type, theme store has state + action + persistence, toggle renders in design panel for receipt theme only. Default value is false (texture OFF).
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire texture toggle to CSS class and propagate to editor preview and public page</name>
  <files>
    src/app/globals.css
    src/components/cards/receipt-layout.tsx
    src/components/public/static-receipt-layout.tsx
    src/components/public/public-page-renderer.tsx
    src/app/[username]/page.tsx
  </files>
  <action>
1. In `src/app/globals.css`: The texture is currently applied via `.receipt-paper::after` (paper texture, line ~193) and `.receipt-paper::before` (plastic texture, line ~214). Change the selectors so texture only applies when the parent has the `receipt-paper-texture` class:
   - Change `.receipt-paper::after` to `.receipt-paper.receipt-paper-texture::after` (line 193)
   - Change `.receipt-paper::before` to `.receipt-paper.receipt-paper-texture::before` (line 214)
   This way the pseudo-elements only render when the `receipt-paper-texture` class is present.

2. In `src/components/cards/receipt-layout.tsx` (editor preview):
   - The component already reads from `useThemeStore`. Add `receiptPaperTexture` to the existing store selectors around line 125:
     ```
     const receiptPaperTexture = useThemeStore((s) => s.receiptPaperTexture)
     ```
   - On the receipt paper div (line ~355), the className currently is `cn("receipt-paper relative", receiptFloatAnimation && "receipt-float")`. Add the texture class conditionally:
     ```
     cn("receipt-paper relative", receiptFloatAnimation && "receipt-float", receiptPaperTexture && "receipt-paper-texture")
     ```

3. In `src/components/public/static-receipt-layout.tsx` (public page):
   - Add `receiptPaperTexture?: boolean` to the `StaticReceiptLayoutProps` interface (around line 105), after `receiptFloatAnimation`.
   - Add `receiptPaperTexture = false` to the destructured props (around line 125), after `receiptFloatAnimation`.
   - On the receipt paper div (line ~303), add the texture class conditionally, same pattern as the editor:
     ```
     cn("receipt-paper relative", receiptFloatAnimation && "receipt-float", receiptPaperTexture && "receipt-paper-texture")
     ```

4. In `src/components/public/public-page-renderer.tsx`:
   - Add `receiptPaperTexture?: boolean` to the `PublicPageRendererProps` interface (around line 89), after `receiptFloatAnimation`.
   - Add `receiptPaperTexture` to the destructured props (around line 147), after `receiptFloatAnimation`.
   - Pass it to `StaticReceiptLayout` (around line 221), after `receiptFloatAnimation`:
     ```
     receiptPaperTexture={receiptPaperTexture}
     ```

5. In `src/app/[username]/page.tsx`:
   - Add extraction of the value (around line 52), after `receiptFloatAnimation`:
     ```
     const receiptPaperTexture = themeSettings?.receiptPaperTexture ?? false
     ```
   - Pass it to `PublicPageRenderer` (around line 113), after `receiptFloatAnimation`:
     ```
     receiptPaperTexture={receiptPaperTexture}
     ```
  </action>
  <verify>
    1. `npx tsc --noEmit` passes with no errors.
    2. In the editor with receipt theme selected:
       - Texture toggle OFF (default): receipt paper has NO paper/plastic texture overlays (clean flat paper look).
       - Texture toggle ON: receipt paper shows the paper and plastic texture overlays.
    3. Save and view the public page - the texture state matches what was set in the editor.
  </verify>
  <done>
    Paper texture is controlled by toggle. Default OFF (clean look). When toggled ON, both ::after (paper) and ::before (plastic) texture overlays appear. Setting persists to database via theme_settings JSON and renders correctly on both editor preview and public page.
  </done>
</task>

</tasks>

<verification>
1. Select receipt theme in the editor
2. Verify texture is OFF by default (clean paper, no overlays)
3. Toggle "Paper Texture" ON in design panel
4. Verify texture overlays appear on the receipt paper in the preview
5. Toggle OFF again, verify overlays disappear
6. Save, refresh - verify the setting persists
7. Publish and check the public page matches
</verification>

<success_criteria>
- Receipt paper texture is OFF by default
- Toggle in design panel controls texture visibility
- Setting persists across page refresh (localStorage) and to database (theme_settings)
- Editor preview and public page both respect the toggle state
- No TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/quick/055-receipt-texture-toggle/055-SUMMARY.md`
</output>
