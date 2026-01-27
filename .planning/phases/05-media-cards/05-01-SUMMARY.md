---
phase: "05-media-cards"
plan: "01"
subsystem: "content-types"
tags: ["types", "video", "gallery", "storage", "oEmbed"]
requires:
  - "04.5-editor-polish"
provides:
  - "VideoCardContent and GalleryCardContent type definitions"
  - "Video URL parsing with oEmbed support"
  - "Video upload/delete storage functions"
affects:
  - "05-02-video-card-ui"
  - "05-03-gallery-card-ui"
  - "05-04-editor-integration"
tech-stack:
  added:
    - "get-video-id (^4.1.7)"
    - "embla-carousel-react (^8.6.0)"
  patterns:
    - "oEmbed APIs for video thumbnail extraction"
    - "Lazy loading pattern for video embeds (thumbnail preview)"
    - "Video storage bucket separation from images"
key-files:
  created:
    - "src/lib/video-embed.ts"
  modified:
    - "src/types/card.ts"
    - "src/lib/supabase/storage.ts"
    - "package.json"
decisions:
  - name: "get-video-id for URL parsing"
    rationale: "Handles YouTube/Vimeo/TikTok edge cases, simpler API than js-video-url-parser"
    phase: "05-01"
  - name: "100MB video upload limit"
    rationale: "Balance between quality and storage/performance, user can compress with HandBrake if needed"
    phase: "05-01"
  - name: "Embla Carousel for alternative gallery"
    rationale: "Lightweight (800K weekly downloads), great touch/swipe support, minimal API vs Swiper"
    phase: "05-01"
  - name: "oEmbed with YouTube fallback thumbnail"
    rationale: "oEmbed provides title + thumbnail, fallback ensures thumbnails always work even if API fails"
    phase: "05-01"
  - name: "TikTok stores full URL as embedUrl"
    rationale: "TikTok oEmbed unreliable, requires original URL for official embed code"
    phase: "05-01"
metrics:
  duration: "2 minutes"
  completed: "2026-01-27"
---

# Phase 05 Plan 01: Foundation - Media Card Types & Helpers Summary

**One-liner:** Video/Gallery content types with oEmbed parsing (YouTube/Vimeo/TikTok) and Supabase video storage

## What Was Built

This plan established the foundational type system, dependencies, and utility functions needed for Video Card and Gallery Card features.

### Content Type Definitions

**VideoCardContent interface:**
- `videoType`: 'embed' or 'upload'
- Embed fields: `embedUrl`, `embedService`, `embedVideoId`, `embedThumbnailUrl`
- Upload fields: `uploadedVideoUrl`, `uploadedVideoPath`

**GalleryCardContent interface:**
- `galleryStyle`: 'circular' or 'carousel'
- `images`: Array of `GalleryImage` objects
- Optional ReactBits Circular Gallery settings: `scrollEase`, `scrollSpeed`, `borderRadius`, `bend`

**GalleryImage interface:**
- `id`, `url`, `alt`, `storagePath` (for deletion)

Added type guards `isVideoContent()` and `isGalleryContent()` for type-safe content detection.

### Video Embed Helper (src/lib/video-embed.ts)

Created `parseVideoUrl()` function that:
1. Uses `get-video-id` to extract video ID and service from URL
2. Calls platform-specific oEmbed helpers
3. Returns `VideoEmbedInfo` with id, service, thumbnailUrl, embedUrl, and optional title

**Platform implementations:**
- **YouTube:** oEmbed API with fallback to standard thumbnail pattern (`https://img.youtube.com/vi/{id}/hqdefault.jpg`)
- **Vimeo:** oEmbed API (throws error for private videos)
- **TikTok:** URL pattern extraction (no thumbnail, stores full URL for embed)

### Video Storage Functions (src/lib/supabase/storage.ts)

Extended existing storage patterns with:
- `uploadCardVideo()`: Uploads MP4/WebM/OGG up to 100MB to 'card-videos' bucket
- `deleteCardVideo()`: Removes video from storage by path
- File type and size validation before upload
- Follows existing `cardId/uuid.ext` naming pattern

### Dependencies Installed

- **get-video-id** (^4.1.7): Extracts video IDs from YouTube/Vimeo/TikTok URLs
- **embla-carousel-react** (^8.6.0): Lightweight carousel for alternative gallery style

## Technical Implementation

### Video URL Parsing Pattern

```typescript
const info = await parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
// Returns: { id, service: 'youtube', thumbnailUrl, embedUrl, title }
```

**Error handling:**
- Invalid URLs throw descriptive error: "Invalid video URL. Supported platforms: YouTube, Vimeo, TikTok"
- Vimeo private videos throw: "Failed to load Vimeo video. Video may be private or unavailable."
- YouTube oEmbed failures fall back to standard thumbnail pattern (no error thrown)

### Storage Bucket Architecture

- **card-images**: Existing bucket for card images (5MB limit)
- **card-videos**: New bucket for video uploads (100MB limit)
- **profile-images**: Existing bucket for avatars/logos (5MB limit)

Separation allows independent size limits and bucket-level policies.

### Type Safety Integration

Extended `CardContent` union type to include `VideoCardContent` and `GalleryCardContent`:

```typescript
export type CardContent =
  | HeroCardContent
  | HorizontalLinkContent
  | SquareCardContent
  | VideoCardContent
  | GalleryCardContent
  | Record<string, unknown>
```

Type guards enable runtime type checking:
```typescript
if (isVideoContent(card.content)) {
  // TypeScript knows content is VideoCardContent
  console.log(content.videoType)
}
```

## Deviations from Plan

None - plan executed exactly as written.

## Blockers & Issues

None encountered during execution.

## Testing Notes

**Verification performed:**
- ✅ TypeScript compilation: `npx tsc --noEmit` passes without errors
- ✅ Dependencies installed: `npm ls get-video-id embla-carousel-react` shows both installed
- ✅ Exports verified: All expected interfaces and functions exported from respective files

**Manual testing required (deferred to UI implementation phases):**
- Video URL parsing with real YouTube/Vimeo/TikTok URLs
- oEmbed API responses and fallback behavior
- Video file upload with actual files
- Edge cases: Private Vimeo videos, invalid video formats, oversized files

## Next Phase Readiness

**Ready to proceed to next plans:**

**Plan 05-02: Video Card UI** can now:
- Import `VideoCardContent` type
- Use `parseVideoUrl()` to extract embed info from URLs
- Use `uploadCardVideo()` for file uploads
- Render thumbnails with embedded video IDs

**Plan 05-03: Gallery Card UI** can now:
- Import `GalleryCardContent` and `GalleryImage` types
- Use `embla-carousel-react` for carousel gallery style
- Reference ReactBits Circular Gallery settings from type definition

**Plan 05-04: Editor Integration** can now:
- Type-check video and gallery card content
- Use type guards to detect card types
- Implement video upload with storage functions

**Blockers for next plans:**
- User must create `card-videos` bucket in Supabase Dashboard with:
  - Public access enabled
  - 100MB file size limit configured
  - Standard security policies

This is documented in `user_setup` section of plan (already communicated to user).

## Future Considerations

**Video compression:**
- Current implementation: No server-side compression, 100MB hard limit
- Future enhancement: Consider Cloudinary or similar service for automatic video compression
- Alternative: Provide clear error message directing users to HandBrake for manual compression

**TikTok embed reliability:**
- Current implementation: Stores full URL, no thumbnail
- Watch for: TikTok API/embed changes requiring different approach
- Alternative: Allow custom thumbnail upload for TikTok videos

**Gallery image limit:**
- Current implementation: 10-image limit enforced client-side only
- Future enhancement: Add database validation or RLS policy for hard limit
- Note: Client-side enforcement sufficient for MVP

**ReactBits Circular Gallery:**
- Verify licensing allows commercial use before production deployment
- Test performance on low-end mobile devices
- Consider fallback to simpler carousel if performance issues arise

## Commits

| Commit | Message | Files |
|--------|---------|-------|
| a94f77c | feat(05-01): add video and gallery card content types | package.json, package-lock.json, src/types/card.ts |
| fbad49c | feat(05-01): create video URL parsing and oEmbed helper | src/lib/video-embed.ts |
| c5efaae | feat(05-01): add video storage functions | src/lib/supabase/storage.ts |

---

*Phase: 05-media-cards*
*Plan: 01 - Foundation - Media Card Types & Helpers*
*Completed: 2026-01-27*
*Duration: 2 minutes*
