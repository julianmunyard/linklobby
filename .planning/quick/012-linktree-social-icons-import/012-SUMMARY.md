# Quick Task 012: Auto-detect Social Icons from Linktree Import

## Completed
**Commit:** 4ed1a6c

### Feature Added

During Linktree import, URLs matching social platforms are now automatically extracted as social icons instead of regular cards.

### Supported Platforms
- **Instagram**: instagram.com, instagr.am
- **TikTok**: tiktok.com, vm.tiktok.com
- **YouTube**: youtube.com, youtu.be
- **Spotify**: spotify.com, open.spotify.com
- **Twitter/X**: twitter.com, x.com

### Behavior
1. URLs are checked against platform patterns during mapping
2. Social links are separated from regular links
3. Only one icon per platform (no duplicates)
4. Regular links still become cards with varied layouts
5. Social icons are added to profile store
6. Social-icons card is auto-created if needed
7. Toast shows "Imported X links + Y social icons"

### Files Modified
- `src/lib/import/linktree-mapper.ts` - URL detection patterns, separated social from regular links
- `src/app/api/import/linktree/route.ts` - Return detectedSocialIcons in response
- `src/components/editor/linktree-import-dialog.tsx` - Handle detected icons, add to profile store
