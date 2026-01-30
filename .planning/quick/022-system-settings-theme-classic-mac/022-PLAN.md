---
phase: quick
plan: 022
type: execute
wave: 1
depends_on: []
files_modified:
  - src/types/theme.ts
  - src/lib/themes/system-settings.ts
  - src/lib/themes/index.ts
  - src/components/cards/system-settings-card.tsx
  - src/components/cards/themed-card-wrapper.tsx
autonomous: true

must_haves:
  truths:
    - "User can select 'System Settings' theme from theme picker"
    - "Cards render with Classic Mac / System 7 aesthetic"
    - "Theme uses warm cream/beige backgrounds with 1px black borders"
    - "Close button appears in top-left, title in top-right using pixel font"
  artifacts:
    - path: "src/lib/themes/system-settings.ts"
      provides: "System Settings theme configuration"
      contains: "systemSettingsTheme"
    - path: "src/components/cards/system-settings-card.tsx"
      provides: "System 7 styled card wrapper"
      exports: ["SystemSettingsCard"]
  key_links:
    - from: "src/lib/themes/index.ts"
      to: "src/lib/themes/system-settings.ts"
      via: "import and THEMES array"
      pattern: "systemSettingsTheme"
    - from: "src/components/cards/themed-card-wrapper.tsx"
      to: "src/components/cards/system-settings-card.tsx"
      via: "switch case for system-settings"
      pattern: "case 'system-settings'"
---

<objective>
Create "System Settings" theme with Classic Macintosh / System 7 aesthetic.

Purpose: Add a nostalgic retro computing theme that captures the warmth and simplicity of early Macintosh interfaces - nested bordered boxes, pixel fonts, beveled buttons, and cream/beige colors.

Output: New theme selectable from theme picker, rendering cards with System 7 window chrome (close box top-left, title top-right, 1px black borders, warm backgrounds).
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@src/types/theme.ts
@src/stores/theme-store.ts
@src/lib/themes/index.ts
@src/lib/themes/mac-os.ts
@src/components/cards/themed-card-wrapper.tsx
@src/components/cards/mac-os-card.tsx
@src/app/fonts.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add Theme Type and Configuration</name>
  <files>
    src/types/theme.ts
    src/lib/themes/system-settings.ts
    src/lib/themes/index.ts
  </files>
  <action>
1. Update `src/types/theme.ts`:
   - Add `'system-settings'` to `ThemeId` union type
   - Add optional `hasWindowChrome?: boolean` to `ThemeConfig` (for System 7 title bar)

2. Create `src/lib/themes/system-settings.ts`:
   - Export `systemSettingsTheme: ThemeConfig` with:
     - id: 'system-settings'
     - name: 'System Settings'
     - description: 'Classic Macintosh System 7 aesthetic'
     - hasWindowChrome: true (new flag for title bar)
     - defaultColors using warm cream/beige palette:
       - background: muted pink `oklch(0.85 0.04 20)` (#E8B4B4 equivalent)
       - cardBg: warm cream `oklch(0.95 0.02 80)` (#F9F0E9 equivalent)
       - text: near-black `oklch(0.15 0 0)` (#1a1a1a)
       - accent: warm gray `oklch(0.70 0.02 80)` (#d4c4b4)
       - border: pure black `oklch(0 0 0)` (#000000)
       - link: dark blue `oklch(0.35 0.15 250)` (classic Mac blue links)
     - defaultFonts:
       - heading: 'var(--font-pix-chicago)' (pixel font for retro feel)
       - body: 'var(--font-dm-sans)' (readable body text)
       - headingSize: 0.9 (pixel fonts render better slightly smaller)
       - bodySize: 1
       - headingWeight: 'normal' (pixel fonts don't need bold)
     - defaultStyle:
       - borderRadius: 4 (subtle, not rounded)
       - shadowEnabled: false (no drop shadows in System 7)
       - blurIntensity: 0 (no blur)
     - palettes array with 2-3 variations:
       - 'classic-cream': warm cream/beige (default)
       - 'platinum': lighter gray System 7 Platinum feel
       - 'compact-pro': darker "Compact Macintosh" style

3. Update `src/lib/themes/index.ts`:
   - Import systemSettingsTheme
   - Add to THEMES array
   - Add 'system-settings' to THEME_IDS array
  </action>
  <verify>
    - TypeScript compiles: `npx tsc --noEmit`
    - Theme exports correctly: `grep -r "system-settings" src/lib/themes/`
  </verify>
  <done>
    - ThemeId includes 'system-settings'
    - systemSettingsTheme exported from themes/index.ts
    - Theme appears in THEMES array
  </done>
</task>

<task type="auto">
  <name>Task 2: Create System Settings Card Wrapper</name>
  <files>
    src/components/cards/system-settings-card.tsx
    src/components/cards/themed-card-wrapper.tsx
  </files>
  <action>
1. Create `src/components/cards/system-settings-card.tsx`:
   - 'use client' directive
   - Import cn from utils, useThemeStore
   - Export SystemSettingsCard component with children and className props

   **Window Chrome Structure:**
   ```
   Outer container:
     - 1px solid black border
     - borderRadius: 4px (outer only)
     - bg-theme-card-bg (warm cream)
     - overflow-hidden

   Title bar (flex, justify-between, items-center):
     - Left: Close box (small square, 12x12px, 1px black border, centered x character)
     - Right: Title text using pixel font (font-[var(--font-pix-chicago)])
     - Background: slightly darker cream
     - Border-bottom: 1px solid black
     - Padding: 2px 6px

   Content area:
     - Children render here
     - Small padding for nested border effect
   ```

   **System 7 Close Box:**
   - 12x12px square with 1px black border
   - Contains small "x" or empty (purely decorative, not functional)
   - Background matches title bar

   **Beveled Button Helper (optional, for future):**
   - Export `SystemSettingsButton` with inset shadow effect
   - box-shadow: inset 1px 1px 0 rgba(255,255,255,0.8), inset -1px -1px 0 rgba(0,0,0,0.2)
   - Press state inverts shadows

2. Update `src/components/cards/themed-card-wrapper.tsx`:
   - Import SystemSettingsCard
   - Add case 'system-settings' in switch statement
   - Return `<SystemSettingsCard className={className}>{children}</SystemSettingsCard>`
  </action>
  <verify>
    - TypeScript compiles: `npx tsc --noEmit`
    - SystemSettingsCard exported: `grep "SystemSettingsCard" src/components/cards/system-settings-card.tsx`
    - Wrapper routes correctly: `grep "system-settings" src/components/cards/themed-card-wrapper.tsx`
  </verify>
  <done>
    - SystemSettingsCard renders with System 7 window chrome
    - Close box in top-left, title placeholder in top-right
    - 1px black borders, warm cream background
    - ThemedCardWrapper routes to SystemSettingsCard for 'system-settings' theme
  </done>
</task>

<task type="auto">
  <name>Task 3: Add CSS Patterns and Test</name>
  <files>
    src/app/globals.css
  </files>
  <action>
1. Add System 7 utility classes to `src/app/globals.css` (in @layer utilities):

   ```css
   /* System 7 / Classic Mac utilities */
   .system7-border {
     border: 1px solid oklch(0 0 0);
   }

   .system7-inset {
     box-shadow: inset 1px 1px 0 oklch(1 0 0 / 0.8), inset -1px -1px 0 oklch(0 0 0 / 0.2);
   }

   .system7-inset-pressed {
     box-shadow: inset -1px -1px 0 oklch(1 0 0 / 0.8), inset 1px 1px 0 oklch(0 0 0 / 0.2);
   }

   /* Optional: halftone/dotted pattern for texture accents */
   .system7-halftone {
     background-image: radial-gradient(oklch(0 0 0 / 0.1) 1px, transparent 1px);
     background-size: 3px 3px;
   }
   ```

2. Verify the complete integration:
   - Build passes: `npm run build` (or `next build`)
   - Theme is selectable in dev mode

3. Commit all changes with message:
   ```
   feat(quick-022): add System Settings theme with Classic Mac aesthetic

   - Add 'system-settings' theme ID to ThemeId type
   - Create systemSettingsTheme config with cream/beige palette
   - Create SystemSettingsCard with System 7 window chrome
   - Add System 7 CSS utility classes for beveled effects
   ```
  </action>
  <verify>
    - Build passes: `npm run build`
    - CSS classes exist: `grep "system7" src/app/globals.css`
  </verify>
  <done>
    - System 7 CSS utilities available (.system7-border, .system7-inset)
    - Build passes with no errors
    - Theme fully integrated and selectable
  </done>
</task>

</tasks>

<verification>
1. TypeScript compiles without errors: `npx tsc --noEmit`
2. Build passes: `npm run build`
3. Theme appears in theme picker UI (run dev server, check design panel)
4. Cards render with System 7 aesthetic:
   - 1px black borders
   - Close box top-left
   - Title area top-right
   - Warm cream backgrounds
   - Pixel font for title
</verification>

<success_criteria>
- "System Settings" theme selectable from theme picker
- Cards display Classic Mac System 7 window chrome
- Warm cream/beige color palette applied
- 1px black borders on all containers
- Close box (x) in top-left corner of card title bar
- Pixel font (Pix Chicago) used for headings
- Build passes with no TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/quick/022-system-settings-theme-classic-mac/022-SUMMARY.md`
</output>
