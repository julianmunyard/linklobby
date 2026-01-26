---
phase: quick
plan: 013
subsystem: linktree-import
tags: [linktree, social-icons, import, typescript]
requires: [quick-012]
provides: [linktree-sociallinks-import]
affects: []
tech-stack:
  added: []
  patterns: [typed-social-links, deduplication]
key-files:
  created: []
  modified:
    - src/types/linktree.ts
    - src/lib/import/linktree-mapper.ts
    - src/app/api/import/linktree/route.ts
decisions:
  - decision: "Use Linktree's socialLinks array as primary source for social icons"
    rationale: "Linktree stores social icons in dedicated socialLinks array, more reliable than URL pattern matching"
    impact: "Social icons are now detected from both socialLinks array and URL patterns"
  - decision: "Deduplicate by platform, preferring socialLinks over URL-detected"
    rationale: "Avoid duplicate social icons when same platform appears in both sources"
    impact: "Each platform appears at most once in detectedSocialIcons"
  - decision: "Map Linktree's platform type strings to our SocialPlatform type"
    rationale: "Linktree uses uppercase strings like 'INSTAGRAM', we use lowercase types"
    impact: "LINKTREE_SOCIAL_TYPE_MAP provides explicit mapping including 'X' → 'twitter'"
metrics:
  duration: "2 minutes"
  completed: "2026-01-27"
---

# Quick Task 013: Fix Linktree Social Icon Import

**One-liner:** Import social icons from Linktree's socialLinks array and deduplicate with URL-detected icons

## Objective

Fix Linktree import to detect and import social icons from Linktree's `socialLinks` array, which contains the dedicated social platform links that were previously missed by URL pattern matching alone.

## What Was Built

### 1. Typed socialLinks Schema
- Added `LinktreeSocialLinkSchema` to capture Linktree's social link structure
- Updated `LinktreePagePropsSchema` to use typed schema instead of `z.any()`
- Exported `LinktreeSocialLink` type for type safety

### 2. Social Links Mapper
- Created `LINKTREE_SOCIAL_TYPE_MAP` to map Linktree's platform strings to our `SocialPlatform` type
- Supports: INSTAGRAM, TIKTOK, YOUTUBE, SPOTIFY, TWITTER, X (maps to twitter)
- Implemented `mapSocialLinks()` function to convert Linktree socialLinks to `DetectedSocialIcon[]`

### 3. Updated Import Pipeline
- Modified `mapLinktreeToCards()` to accept optional `socialLinks` parameter
- Process socialLinks array first, then URL-detected icons
- Deduplicate by platform (socialLinks takes precedence)
- Updated API route to pass `profileData.socialLinks` to mapper

### 4. Enhanced Logging
- Added console.log in API route to track social links count
- Log each mapped social link with type → platform mapping
- Show breakdown of socialLinks vs URL-detected in final count

## Technical Details

### Deduplication Logic
```typescript
// socialLinks array processed first (takes precedence)
const detectedSocialIcons: DetectedSocialIcon[] = []
detectedSocialIcons.push(...mapSocialLinks(socialLinks))

// Then URL-detected, skipping duplicates
for (const link of links) {
  const platform = detectSocialPlatform(link.url)
  if (platform && !detectedSocialIcons.some(s => s.platform === platform)) {
    detectedSocialIcons.push({ platform, url: link.url })
  }
}
```

### Platform Mapping
```typescript
const LINKTREE_SOCIAL_TYPE_MAP: Record<string, SocialPlatform> = {
  'INSTAGRAM': 'instagram',
  'TIKTOK': 'tiktok',
  'YOUTUBE': 'youtube',
  'SPOTIFY': 'spotify',
  'TWITTER': 'twitter',
  'X': 'twitter',  // Linktree may use "X" for Twitter/X
}
```

## Testing

### Unit Tests Performed
1. **Mapping test**: Verified all supported platform types map correctly
2. **Deduplication test**: Confirmed socialLinks array takes precedence
3. **Unsupported platforms**: Verified unsupported types (e.g., FACEBOOK) are ignored

### Results
- 6 out of 7 test social links mapped successfully (FACEBOOK correctly ignored)
- Deduplication working: instagram from socialLinks retained, URL-detected duplicate skipped
- Console logs show clear mapping progression

## Success Criteria Met

- ✅ Linktree profiles with social icons have those icons detected and returned in `detectedSocialIcons`
- ✅ Social icons from `socialLinks` array are merged with URL-pattern-detected icons
- ✅ Platforms are deduplicated (no duplicate instagram, tiktok, etc.)
- ✅ TypeScript compiles without errors
- ✅ Mapping logic verified with unit tests

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| 987d777 | feat | Add socialLinks type and mapper function |
| 9572d12 | feat | Pass socialLinks to mapper in API route |
| 93baa8c | test | Verify socialLinks mapping and deduplication |

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Status:** Complete and tested

**Integration points:**
- Linktree import dialog already handles `detectedSocialIcons` response
- Social icons automatically added to profile store when detected
- No additional UI changes needed

**No blockers or concerns.**

## Implementation Notes

### Why socialLinks Array?
Linktree stores social icons in a separate `socialLinks` array in their `__NEXT_DATA__` payload. This is more reliable than URL pattern matching because:
1. Explicit platform type provided (no regex needed)
2. Includes icons that might not have traditional profile URLs
3. User's intended social links, not just any URL that matches a pattern

### Precedence Design
socialLinks array takes precedence over URL-detected icons because:
1. It's Linktree's explicit social icon list
2. More accurate than pattern matching
3. User explicitly configured these as social links

This prevents scenarios where a content link (e.g., specific Instagram post) incorrectly detected as profile link would override the correct profile link from socialLinks.

### Future Extensions
If Linktree adds new social platforms to their `socialLinks` array:
1. Add platform to `SocialPlatform` type in `src/types/profile.ts`
2. Add mapping in `LINKTREE_SOCIAL_TYPE_MAP`
3. Add icon and metadata to `SOCIAL_PLATFORMS` in `src/types/profile.ts`

---
*Completed: 2026-01-27*
*Duration: 2 minutes*
*All tasks completed successfully*
