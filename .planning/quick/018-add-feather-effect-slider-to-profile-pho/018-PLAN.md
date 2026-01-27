---
phase: quick
plan: 018
type: execute
wave: 1
depends_on: []
files_modified:
  - src/types/profile.ts
  - src/stores/profile-store.ts
  - src/components/editor/header-section.tsx
  - src/components/preview/profile-header.tsx
  - src/app/api/profile/route.ts
  - supabase/migrations/20260127_add_avatar_feather.sql
autonomous: true

must_haves:
  truths:
    - "User can adjust avatar feather amount with a slider"
    - "Avatar edges soften/blur based on feather value"
    - "Feather setting persists to database"
  artifacts:
    - path: "src/types/profile.ts"
      provides: "avatarFeather field in Profile interface"
      contains: "avatarFeather"
    - path: "src/stores/profile-store.ts"
      provides: "avatarFeather state and setAvatarFeather action"
      contains: "setAvatarFeather"
    - path: "src/components/editor/header-section.tsx"
      provides: "Feather slider in Profile Photo section"
      contains: "avatarFeather"
    - path: "src/components/preview/profile-header.tsx"
      provides: "Feather effect applied to avatar"
      contains: "avatarFeather"
  key_links:
    - from: "src/components/editor/header-section.tsx"
      to: "src/stores/profile-store.ts"
      via: "setAvatarFeather action"
      pattern: "setAvatarFeather"
    - from: "src/components/preview/profile-header.tsx"
      to: "src/stores/profile-store.ts"
      via: "avatarFeather subscription"
      pattern: "avatarFeather"
---

<objective>
Add a feather effect slider to the profile photo editor that allows users to soften/blur the edges of their profile avatar.

Purpose: Give users more control over their profile photo appearance - a feathered edge creates a softer, more polished look that blends better with backgrounds.

Output: Slider control in Profile Photo section, avatar displays with CSS mask-image radial gradient feather effect based on slider value.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/types/profile.ts
@src/stores/profile-store.ts
@src/components/editor/header-section.tsx
@src/components/preview/profile-header.tsx
@src/app/api/profile/route.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add avatarFeather to Profile type and store</name>
  <files>
    - src/types/profile.ts
    - src/stores/profile-store.ts
    - src/app/api/profile/route.ts
    - supabase/migrations/20260127_add_avatar_feather.sql
  </files>
  <action>
1. In `src/types/profile.ts`:
   - Add `avatarFeather: number` to Profile interface (0-100, where 0 = no feather, 100 = max feather)
   - Add comment explaining the field

2. In `src/stores/profile-store.ts`:
   - Add `avatarFeather` to defaultProfile with value 0
   - Add `setAvatarFeather: (feather: number) => void` to ProfileState interface
   - Add `setAvatarFeather` action: `set({ avatarFeather: feather, hasChanges: true })`
   - Add `avatarFeather` to getSnapshot return object

3. In `src/app/api/profile/route.ts`:
   - In GET: map `profile.avatar_feather ?? 0` to `avatarFeather`
   - In POST: map `body.avatarFeather` to `avatar_feather`

4. Create migration `supabase/migrations/20260127_add_avatar_feather.sql`:
   ```sql
   -- Add avatar feather column for edge softening effect
   ALTER TABLE public.profiles
     ADD COLUMN IF NOT EXISTS avatar_feather INTEGER NOT NULL DEFAULT 0;

   -- Constraint: 0-100 range
   ALTER TABLE public.profiles
     ADD CONSTRAINT profiles_avatar_feather_range CHECK (avatar_feather >= 0 AND avatar_feather <= 100);

   COMMENT ON COLUMN public.profiles.avatar_feather IS 'Avatar edge feather amount (0-100)';
   ```
  </action>
  <verify>
    - TypeScript compiles without errors: `npx tsc --noEmit`
    - Migration file exists and has correct SQL syntax
  </verify>
  <done>
    - avatarFeather field exists in Profile type
    - Store has setAvatarFeather action
    - API route reads/writes avatar_feather column
    - Migration file ready for database
  </done>
</task>

<task type="auto">
  <name>Task 2: Add feather slider to header editor and apply effect</name>
  <files>
    - src/components/editor/header-section.tsx
    - src/components/preview/profile-header.tsx
  </files>
  <action>
1. In `src/components/editor/header-section.tsx`:
   - Import avatarFeather and setAvatarFeather from profile store
   - Add slider inside the Profile Photo CollapsibleSection, below the avatar upload controls
   - Only show slider when showAvatar is true AND avatarUrl exists
   - Slider: min=0, max=100, step=5, label "Edge Feather", display current value as percentage
   ```tsx
   {showAvatar && avatarUrl && (
     <div className="space-y-2">
       <div className="flex items-center justify-between">
         <Label className="text-xs text-muted-foreground">Edge Feather</Label>
         <span className="text-xs text-muted-foreground">{avatarFeather}%</span>
       </div>
       <Slider
         value={[avatarFeather]}
         onValueChange={(value) => setAvatarFeather(value[0])}
         min={0}
         max={100}
         step={5}
         className="w-full"
       />
     </div>
   )}
   ```

2. In `src/components/preview/profile-header.tsx`:
   - Import avatarFeather from profile store
   - Apply feather effect using CSS mask-image with radial-gradient
   - The feather creates a soft edge by fading the avatar to transparent at the edges
   - Calculate mask based on feather value: higher value = more fade from edge

   For classic layout avatar (circular):
   ```tsx
   const featherMask = avatarFeather > 0
     ? `radial-gradient(circle, black ${100 - avatarFeather}%, transparent 100%)`
     : undefined

   // Apply to the img element:
   style={{
     WebkitMaskImage: featherMask,
     maskImage: featherMask
   }}
   ```

   For hero layout avatar (rectangular banner):
   - Use linear gradient from all edges instead of radial
   - Or skip feather for hero layout since it's a banner (simpler approach)

   Simpler approach: Only apply feather to classic layout circular avatar
  </action>
  <verify>
    - App starts without errors: `npm run dev`
    - Navigate to editor, see Feather slider in Profile Photo section when avatar is set
    - Adjusting slider updates avatar appearance in preview
  </verify>
  <done>
    - Feather slider appears in Profile Photo editor section (only when avatar uploaded)
    - Slider adjusts from 0-100%
    - Avatar in preview shows feathered edges based on slider value
    - Classic layout: radial feather effect
    - Hero layout: no feather (banner doesn't benefit from feather)
  </done>
</task>

</tasks>

<verification>
1. Type check: `npx tsc --noEmit`
2. App runs: `npm run dev`
3. Manual test:
   - Upload avatar photo
   - Feather slider appears
   - Adjust slider - avatar edges soften in real-time
   - Save profile, refresh - feather value persists
</verification>

<success_criteria>
- User can adjust avatar edge feather from 0% to 100%
- Feather effect visually softens avatar edges in preview
- Setting persists across page refreshes
- No TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/quick/018-add-feather-effect-slider-to-profile-pho/018-SUMMARY.md`
</output>
