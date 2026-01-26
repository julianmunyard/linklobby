---
phase: quick
plan: 013
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/import/linktree-mapper.ts
  - src/app/api/import/linktree/route.ts
  - src/types/linktree.ts
autonomous: true

must_haves:
  truths:
    - "Social icons from Linktree's socialLinks array are imported"
    - "Imported social icons appear in detectedSocialIcons response"
    - "Duplicate platforms are deduplicated (URL-matched links + socialLinks)"
  artifacts:
    - path: "src/lib/import/linktree-mapper.ts"
      provides: "mapSocialLinks function and updated mapLinktreeToCards"
    - path: "src/types/linktree.ts"
      provides: "LinktreeSocialLink type with type property"
  key_links:
    - from: "src/app/api/import/linktree/route.ts"
      to: "mapLinktreeToCards"
      via: "pass profileData.socialLinks as second argument"
      pattern: "mapLinktreeToCards.*links.*socialLinks"
---

<objective>
Fix Linktree import to detect and import social icons from Linktree's `socialLinks` array.

Purpose: Linktree stores social icons in a separate `socialLinks` array (not in `links`). Currently we only pattern-match URLs in the `links` array, missing the dedicated social icons entirely.

Output: Social icons from Linktree profiles are properly imported and returned in `detectedSocialIcons`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/lib/import/linktree-mapper.ts
@src/lib/import/linktree-scraper.ts
@src/app/api/import/linktree/route.ts
@src/types/linktree.ts
@src/types/profile.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add socialLinks type and update mapper to process them</name>
  <files>
    src/types/linktree.ts
    src/lib/import/linktree-mapper.ts
  </files>
  <action>
1. In `src/types/linktree.ts`:
   - Add a `LinktreeSocialLinkSchema` that captures Linktree's social link structure:
     ```typescript
     export const LinktreeSocialLinkSchema = z.object({
       type: z.string(),  // e.g., "INSTAGRAM", "TIKTOK", "YOUTUBE", "SPOTIFY", "TWITTER"
       url: z.string(),
     }).passthrough()
     ```
   - Update `LinktreePagePropsSchema` to use this typed schema instead of `z.any()`:
     ```typescript
     socialLinks: z.array(LinktreeSocialLinkSchema).optional(),
     ```
   - Export `LinktreeSocialLink` type

2. In `src/lib/import/linktree-mapper.ts`:
   - Import `LinktreeSocialLink` type
   - Add a mapping from Linktree's social type strings to our SocialPlatform:
     ```typescript
     const LINKTREE_SOCIAL_TYPE_MAP: Record<string, SocialPlatform> = {
       'INSTAGRAM': 'instagram',
       'TIKTOK': 'tiktok',
       'YOUTUBE': 'youtube',
       'SPOTIFY': 'spotify',
       'TWITTER': 'twitter',
       'X': 'twitter',  // Linktree may use "X" now
     }
     ```
   - Add a `mapSocialLinks` function that converts Linktree socialLinks to DetectedSocialIcon[]:
     ```typescript
     function mapSocialLinks(socialLinks: LinktreeSocialLink[] | undefined): DetectedSocialIcon[] {
       if (!socialLinks) return []
       const result: DetectedSocialIcon[] = []
       for (const link of socialLinks) {
         const platform = LINKTREE_SOCIAL_TYPE_MAP[link.type?.toUpperCase()]
         if (platform && link.url) {
           result.push({ platform, url: link.url })
         }
       }
       return result
     }
     ```
   - Update `mapLinktreeToCards` signature to accept optional `socialLinks` parameter:
     ```typescript
     export async function mapLinktreeToCards(
       links: LinktreeLink[],
       socialLinks?: LinktreeSocialLink[]
     ): Promise<ImportResult>
     ```
   - In the function, call `mapSocialLinks(socialLinks)` and merge results with URL-detected social icons
   - Deduplicate by platform (keep first occurrence, prefer socialLinks over URL-detected)
  </action>
  <verify>
    TypeScript compiles: `npx tsc --noEmit`
  </verify>
  <done>
    linktree-mapper.ts accepts socialLinks parameter and maps them to DetectedSocialIcon[]
  </done>
</task>

<task type="auto">
  <name>Task 2: Pass socialLinks from API route to mapper</name>
  <files>
    src/app/api/import/linktree/route.ts
  </files>
  <action>
Update line 36 in `src/app/api/import/linktree/route.ts` to pass both links and socialLinks:

Change:
```typescript
const { mappedCards, detectedSocialIcons, failures } = await mapLinktreeToCards(profileData.links)
```

To:
```typescript
const { mappedCards, detectedSocialIcons, failures } = await mapLinktreeToCards(
  profileData.links,
  profileData.socialLinks
)
```

Add a console.log to verify socialLinks are being passed:
```typescript
console.log('[API /import/linktree] Social links count:', profileData.socialLinks?.length ?? 0)
```
  </action>
  <verify>
    TypeScript compiles: `npx tsc --noEmit`
  </verify>
  <done>
    API route passes socialLinks to mapper function
  </done>
</task>

<task type="auto">
  <name>Task 3: Manual test with real Linktree profile</name>
  <files></files>
  <action>
Test the import flow by starting the dev server and importing a Linktree profile that has social icons.

1. Start dev server: `npm run dev`
2. Log in and go to the editor
3. Open import dialog and enter a Linktree username that has social icons (e.g., try common artist/influencer profiles)
4. Check the console logs for:
   - "[API /import/linktree] Social links count: X" (should be > 0)
   - "[LinktreeMapper] Detected social icon: X -> url"
5. Verify the response includes detectedSocialIcons with the imported icons

If no suitable test profile is available, inspect the raw Linktree __NEXT_DATA__ on any profile with social icons to confirm the structure matches our schema.
  </action>
  <verify>
    Console shows social links being detected from socialLinks array
  </verify>
  <done>
    Social icons from Linktree's socialLinks array are properly imported
  </done>
</task>

</tasks>

<verification>
- [ ] `npx tsc --noEmit` passes
- [ ] Import a Linktree profile with social icons
- [ ] `detectedSocialIcons` includes icons from the socialLinks array
- [ ] No duplicate platforms in detectedSocialIcons
</verification>

<success_criteria>
- Linktree profiles with social icons have those icons detected and returned in `detectedSocialIcons`
- Social icons from `socialLinks` array are merged with URL-pattern-detected icons
- Platforms are deduplicated (no duplicate instagram, tiktok, etc.)
</success_criteria>

<output>
After completion, create `.planning/quick/013-fix-linktree-social-icon-import/013-SUMMARY.md`
</output>
