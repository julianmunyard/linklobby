---
phase: quick
plan: 032
type: execute
wave: 1
depends_on: []
files_modified:
  - src/types/profile.ts
  - src/stores/profile-store.ts
  - src/components/editor/header-section.tsx
  - src/components/cards/social-icons-card.tsx
  - src/app/api/profile/route.ts
autonomous: true

must_haves:
  truths:
    - "User can adjust social icon size via slider"
    - "Social icons render at user-selected size in preview"
    - "Icon size persists across page refresh"
  artifacts:
    - path: "src/types/profile.ts"
      provides: "socialIconSize property on Profile type"
      contains: "socialIconSize"
    - path: "src/stores/profile-store.ts"
      provides: "setSocialIconSize action"
      contains: "setSocialIconSize"
    - path: "src/components/editor/header-section.tsx"
      provides: "Icon size slider UI"
      contains: "socialIconSize"
    - path: "src/components/cards/social-icons-card.tsx"
      provides: "Dynamic icon sizing"
      contains: "socialIconSize"
  key_links:
    - from: "src/components/editor/header-section.tsx"
      to: "src/stores/profile-store.ts"
      via: "setSocialIconSize action"
      pattern: "setSocialIconSize"
    - from: "src/components/cards/social-icons-card.tsx"
      to: "src/stores/profile-store.ts"
      via: "socialIconSize selector"
      pattern: "socialIconSize"
---

<objective>
Add a slider to control the size of social icons in the profile header.

Purpose: Let users customize icon prominence - smaller for subtlety, larger for emphasis.
Output: Working size slider (16-48px range) that updates icon rendering in real-time.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@src/types/profile.ts
@src/stores/profile-store.ts
@src/components/editor/header-section.tsx
@src/components/cards/social-icons-card.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add socialIconSize to types and store</name>
  <files>src/types/profile.ts, src/stores/profile-store.ts</files>
  <action>
1. In `src/types/profile.ts`:
   - Add `socialIconSize: number` to Profile interface (after socialIcons)
   - Comment: `// Icon size in pixels (16-48), default 24`

2. In `src/stores/profile-store.ts`:
   - Add `socialIconSize: 24` to defaultProfile
   - Add `setSocialIconSize: (size: number) => void` to ProfileState interface
   - Implement action: `setSocialIconSize: (size) => set({ socialIconSize: size, hasChanges: true })`
   - Add `socialIconSize` to getSnapshot return object
  </action>
  <verify>TypeScript compiles without errors: `npx tsc --noEmit`</verify>
  <done>Profile type includes socialIconSize, store has setter action and includes in snapshot</done>
</task>

<task type="auto">
  <name>Task 2: Add size slider to header editor and apply to icons</name>
  <files>src/components/editor/header-section.tsx, src/components/cards/social-icons-card.tsx, src/app/api/profile/route.ts</files>
  <action>
1. In `src/components/editor/header-section.tsx`:
   - Add selector: `const socialIconSize = useProfileStore((state) => state.socialIconSize)`
   - Add action: `const setSocialIconSize = useProfileStore((state) => state.setSocialIconSize)`
   - Inside the "Social Icons" CollapsibleSection, after the SocialIconPicker button, add:
     ```tsx
     <div className="space-y-2">
       <div className="flex items-center justify-between">
         <Label className="text-xs text-muted-foreground">Icon Size</Label>
         <span className="text-xs text-muted-foreground">{socialIconSize}px</span>
       </div>
       <Slider
         value={[socialIconSize]}
         onValueChange={(value) => setSocialIconSize(value[0])}
         min={16}
         max={48}
         step={4}
         className="w-full"
       />
     </div>
     ```

2. In `src/components/cards/social-icons-card.tsx`:
   - Add selector: `const socialIconSize = useProfileStore((state) => state.socialIconSize)`
   - Replace hardcoded `w-6 h-6` (24px) with dynamic style:
     ```tsx
     <Icon style={{ width: socialIconSize, height: socialIconSize }} />
     ```
   - Remove the className from Icon element

3. In `src/app/api/profile/route.ts`:
   - Add `social_icon_size` to the SELECT query (GET handler)
   - Add `socialIconSize: profile.social_icon_size ?? 24` to the profile mapping
   - Add `social_icon_size: socialIconSize` to the UPDATE payload (PUT handler)
  </action>
  <verify>
1. Run dev server: `npm run dev`
2. Open editor, go to Header > Social Icons
3. Adjust slider - icons should resize in preview immediately
4. Refresh page - size should persist
  </verify>
  <done>
- Slider appears in Social Icons section (16-48px range, step 4)
- Icons resize in real-time as slider moves
- Size persists after page refresh via API
  </done>
</task>

</tasks>

<verification>
1. TypeScript compiles: `npx tsc --noEmit`
2. Visual: Icons resize smoothly when slider moved
3. Persistence: Size survives page refresh
4. Default: New profiles show 24px icons (unchanged behavior)
</verification>

<success_criteria>
- Slider visible in Header > Social Icons section
- Icons resize between 16px and 48px
- Size persists to database and loads on refresh
- Default size is 24px (existing icon size preserved)
</success_criteria>

<output>
After completion, create `.planning/quick/032-social-icon-size-slider/032-SUMMARY.md`
</output>
