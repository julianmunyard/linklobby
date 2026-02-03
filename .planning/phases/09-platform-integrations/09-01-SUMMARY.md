---
phase: 09-platform-integrations
plan: 01
completed: 2026-02-03
subsystem: embeds
tags: [platform-detection, oembed, music-cards, types]

dependency_graph:
  requires: []
  provides:
    - Platform URL detection for 9 platforms
    - MusicCardContent type with proper schema
    - Store music card creation
  affects:
    - 09-02 (MusicCard component will use platform-embed.ts)
    - 09-03 (Instagram card will use platform-embed.ts)
    - 09-05 (Platform picker uses detection)

tech_stack:
  added: []
  patterns:
    - get-video-id for YouTube/Vimeo detection
    - Regex pattern matching for other platforms
    - oEmbed fetching with graceful fallback

key_files:
  created:
    - src/lib/platform-embed.ts
  modified:
    - src/types/card.ts
    - src/stores/page-store.ts

decisions:
  - key: platform-embed-separate-module
    choice: New platform-embed.ts alongside video-embed.ts
    rationale: Unified detection for all platforms without disrupting existing video card
  - key: music-platform-type-subset
    choice: MusicPlatform as 5-platform subset of EmbedPlatform
    rationale: Clear distinction between music/video/social embed types
  - key: oembed-graceful-fallback
    choice: Return basic embedUrl on oEmbed failure
    rationale: Better UX than error - embed still works without metadata

metrics:
  duration: ~3 minutes
  tasks: 2/2
---

# Phase 09 Plan 01: Platform Detection Foundation Summary

**One-liner:** Platform URL detection module with regex patterns for 9 platforms and MusicCardContent type for music embeds.

## What Was Built

### 1. Platform Embed Module (src/lib/platform-embed.ts)

Created a unified platform detection module handling all supported embed platforms.

**Platform Types:**
```typescript
export type EmbedPlatform =
  | 'spotify' | 'apple-music' | 'soundcloud' | 'bandcamp' | 'audiomack'
  | 'youtube' | 'vimeo' | 'tiktok'
  | 'instagram'

export type MusicPlatform = 'spotify' | 'apple-music' | 'soundcloud' | 'bandcamp' | 'audiomack'
```

**Key Exports:**
- `detectPlatform(url)` - Detects platform from any supported URL
- `getEmbedUrl(url, platform)` - Constructs iframe embed URL
- `fetchPlatformEmbed(url, platform)` - Fetches oEmbed metadata
- `isVerticalPlatform(platform)` - Returns true for 9:16 content (TikTok, Instagram)
- `isMusicPlatform(platform)` / `isVideoPlatform(platform)` / `isSocialPlatform(platform)`
- `PLATFORM_PATTERNS` - Regex patterns for URL matching
- `getDefaultAspectRatio(platform)` - Fallback dimensions per platform
- `getPlatformDisplayName(platform)` - UI display names

**URL Detection Patterns:**
| Platform | Pattern |
|----------|---------|
| Spotify | `open.spotify.com/(track\|album\|playlist\|artist)/ID` |
| Apple Music | `music.apple.com/COUNTRY/(album\|playlist\|artist\|song)/NAME/ID` |
| SoundCloud | `soundcloud.com/USER/(sets/)?TRACK` |
| Bandcamp | `ARTIST.bandcamp.com/(album\|track)/SLUG` |
| Audiomack | `audiomack.com/(song\|album\|playlist)/ARTIST/TITLE` |
| Instagram | `instagram.com/(p\|reel\|reels)/ID` |
| TikTok | `tiktok.com/@USER/video/ID` |
| YouTube | Via get-video-id library |
| Vimeo | Via get-video-id library |

**oEmbed Support:**
- Spotify, SoundCloud, Audiomack: Full oEmbed with thumbnail/title
- Apple Music, Bandcamp, Instagram, TikTok: Basic embed URL (oEmbed requires auth or unavailable)
- YouTube, Vimeo: Handled by existing video-embed.ts

### 2. Music Card Types (src/types/card.ts)

Added music card type system to existing card types.

**Changes:**
- Added `'music'` to CardType union
- Added `music: ['big', 'small']` to CARD_TYPE_SIZING
- Added `'music'` to CARD_TYPES_NO_IMAGE array
- Added MusicPlatform type
- Added MusicCardContent interface
- Added isMusicContent type guard

**MusicCardContent Interface:**
```typescript
export interface MusicCardContent {
  platform?: MusicPlatform
  embedUrl?: string              // Original URL pasted by user
  embedIframeUrl?: string        // Constructed iframe src
  thumbnailUrl?: string          // From oEmbed
  title?: string                 // From oEmbed
  bandcampAlbumId?: string       // Bandcamp-specific
  bandcampTrackId?: string       // Bandcamp-specific
  textColor?: string             // Override text color
  fuzzyText?: FuzzyTextSettings  // Distress text effect
}
```

### 3. Store Updates (src/stores/page-store.ts)

Updated page store to handle music card creation.

**Changes:**
- Imported MusicCardContent type
- Added case 'music' in addCard with default content:
  ```typescript
  case 'music':
    return {
      platform: undefined,
      embedUrl: undefined,
    } satisfies MusicCardContent
  ```

## Verification Results

- [x] `npm run build` completes without TypeScript errors
- [x] `detectPlatform` correctly identifies Spotify, Apple Music, SoundCloud, Bandcamp, Audiomack URLs
- [x] `detectPlatform` correctly identifies Instagram post/reel URLs
- [x] `isVerticalPlatform` returns true for tiktok and instagram
- [x] `getEmbedUrl` returns correct iframe URLs for each platform
- [x] MusicCardContent type exists with all required fields
- [x] Store's addCard creates music cards with correct default content

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | `e59d71e` | feat(09-01): create platform-embed.ts with URL detection and oEmbed |
| 2 | `54dd637` | feat(09-01): add MusicCardContent type and store defaults |

## Next Phase Readiness

Ready for Plan 02: MusicCard component and editor integration.

**Dependencies satisfied:**
- platform-embed.ts provides URL detection and oEmbed fetching
- MusicCardContent type defines data structure
- Store can create music cards

**Integration points:**
- MusicCard component will import from platform-embed.ts
- MusicCardFields editor will use detectPlatform and fetchPlatformEmbed
- CardRenderer will route 'music' type to MusicCard
