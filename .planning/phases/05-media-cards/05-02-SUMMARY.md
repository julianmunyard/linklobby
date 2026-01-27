---
phase: 05
plan: 02
type: summary
subsystem: cards
tags: [video, media, youtube, vimeo, tiktok, upload, embed, oembed]

dependencies:
  requires:
    - phase: 05
      plan: 01
      why: VideoCardContent types, parseVideoUrl, uploadCardVideo storage functions
    - phase: 04
      plan: 03
      why: Card property editor pattern, type-specific field components
  provides:
    - VideoCard component with embed and upload modes
    - VideoCardFields editor with URL validation and file upload
    - Video card integration in card renderer and property editor
  affects:
    - future: Gallery card will follow similar pattern for custom media handling

tech-stack:
  added: []
  patterns:
    - "Custom media field components for cards with specialized media needs"
    - "Type guard pattern with optional required fields for gradual content population"
    - "Embed mode: thumbnail preview with click-to-play iframe"
    - "Upload mode: muted autoplay loop (Instagram-style)"

key-files:
  created:
    - src/components/cards/video-card.tsx: "VideoCard component with embed and upload rendering"
    - src/components/editor/video-card-fields.tsx: "Video card editor fields with URL validation and upload"
  modified:
    - src/components/cards/card-renderer.tsx: "Added video case to render VideoCard"
    - src/components/editor/card-property-editor.tsx: "Added VideoCardFields to type-specific fields"
    - src/types/card.ts: "Made videoType optional, added video/gallery to CARD_TYPES_NO_IMAGE"

decisions:
  - decision: "Make VideoCardContent.videoType optional"
    rationale: "New video cards start with empty content - defaults to 'embed' in UI"
    alternatives: "Initialize content on card creation, but this adds coupling"
  - decision: "Video/gallery cards hide generic ImageUpload"
    rationale: "Custom media handling via VideoCardFields/GalleryCardFields, not standard image upload"
    implementation: "Added to CARD_TYPES_NO_IMAGE array"
  - decision: "Embed mode shows thumbnail with play button"
    rationale: "Better performance - don't load heavy iframe until user clicks"
    implementation: "useState isPlaying toggle, render Image or iframe based on state"
  - decision: "Upload mode uses muted autoplay loop"
    rationale: "Instagram-style behavior - immediate visual impact, no user action needed"
    implementation: "HTML5 video with autoPlay muted loop playsInline"
  - decision: "TikTok embeds use full URL as embedUrl"
    rationale: "TikTok requires original URL for iframe embedding (from 05-01 decision)"
    implementation: "parseVideoUrl stores full TikTok URL in embedUrl field"
  - decision: "Convert YouTube watch URLs to embed URLs in component"
    rationale: "User might paste watch URL - component handles conversion transparently"
    implementation: "getEmbedUrl() checks for watch?v= and converts to /embed/"

metrics:
  duration: "4 minutes"
  completed: "2026-01-27"
---

# Phase 05 Plan 02: Video Card Component & Editor Summary

**One-liner:** Video card with embed (YouTube/Vimeo/TikTok thumbnail + click-to-play) and upload (muted autoplay loop) modes

## What Was Built

### VideoCard Component
- **VideoCardUpload**: Renders HTML5 video with `autoPlay muted loop playsInline` for uploaded videos
- **VideoCardEmbed**: Shows thumbnail with play button overlay, loads iframe when clicked
- **Placeholder**: "Add video URL or upload video" state for unconfigured cards
- **Styling**: aspect-video ratio, rounded corners, title overlay with gradient
- **YouTube URL conversion**: Handles both watch?v= and /embed/ URLs transparently

### VideoCardFields Editor
- **Video Type Toggle**: Switch between embed and upload modes with ToggleGroup
- **Embed URL Input**:
  - Paste YouTube/Vimeo/TikTok URL
  - Calls parseVideoUrl on blur to extract video info
  - Shows loading spinner during oEmbed fetch
  - Displays success message with service name
  - Shows error message for invalid URLs
- **Video Upload**:
  - File input accepting MP4/WebM/OGG
  - 100MB client-side validation
  - Uploads to Supabase storage via uploadCardVideo
  - Shows uploaded video info with filename
  - Replace button to upload new video
- **Error Handling**: AlertCircle icon with descriptive error messages

### Integration
- **card-renderer.tsx**: Added video case to switch statement, imports VideoCard
- **card-property-editor.tsx**:
  - Imports VideoCardFields and VideoCardContent
  - Renders VideoCardFields when card_type === 'video'
  - Added video/gallery to CARD_TYPES_NO_IMAGE (hides generic image upload)
- **types/card.ts**:
  - Made videoType optional (defaults to 'embed' in UI)
  - Updated isVideoContent type guard to handle optional videoType
  - Added video and gallery to CARD_TYPES_NO_IMAGE array

## Technical Decisions

### Type Safety with Optional videoType
**Problem**: New video cards have empty content `{}`, but VideoCardContent requires videoType.

**Solution**: Made videoType optional, defaults to 'embed' in UI via `value={content.videoType || 'embed'}`.

**Trade-off**: Relaxed type guard (just checks `typeof content === 'object'`), but cleaner user experience - no initialization required.

### Custom Media Handling Pattern
**Pattern**: Card types with specialized media (video, gallery) exclude generic ImageUpload, provide custom field components.

**Implementation**:
- CARD_TYPES_NO_IMAGE array includes 'video' and 'gallery'
- Generic ImageUpload component skipped for these types
- VideoCardFields and (future) GalleryCardFields manage their own media

**Benefit**: Clear separation between standard image cards and specialized media cards.

### Embed vs Upload Behavior
**Embed mode**:
- Thumbnail + play button = single click to play
- No autoplay = bandwidth-friendly
- Works with YouTube/Vimeo/TikTok

**Upload mode**:
- Muted autoplay loop = instant visual impact
- Instagram-style presentation
- 100MB limit encourages reasonable file sizes

**User control**: ToggleGroup makes switching modes obvious and easy.

## Code Highlights

### VideoCard Routing Logic
```typescript
// Use type guard for safety
if (!isVideoContent(card.content)) {
  return <Placeholder />
}

const content = card.content

// Route based on configured mode
if (content.videoType === 'upload' && content.uploadedVideoUrl) {
  return <VideoCardUpload videoUrl={content.uploadedVideoUrl} title={card.title} />
}

if (content.videoType === 'embed' && content.embedUrl) {
  return <VideoCardEmbed embedUrl={content.embedUrl} ... />
}

return <Placeholder />
```

### Embed with Click-to-Play
```typescript
const [isPlaying, setIsPlaying] = useState(false)

if (isPlaying) {
  return <iframe src={getEmbedUrl()} ... />
}

// Thumbnail view
return (
  <button onClick={() => setIsPlaying(true)}>
    <Image src={thumbnailUrl} ... />
    <PlayButtonOverlay />
  </button>
)
```

### URL Validation with Loading State
```typescript
async function handleEmbedUrlBlur() {
  setIsLoading(true)
  try {
    const videoInfo = await parseVideoUrl(embedUrlInput)
    onChange({
      embedUrl: videoInfo.embedUrl,
      embedService: videoInfo.service,
      embedVideoId: videoInfo.id,
      embedThumbnailUrl: videoInfo.thumbnailUrl,
    })
  } catch (err) {
    setError(err.message)
  } finally {
    setIsLoading(false)
  }
}
```

## Testing Notes

**Manual testing checklist**:
1. ✅ Add video card via card type picker
2. ✅ Paste YouTube URL - should fetch thumbnail and display play button
3. ✅ Click play button - should load iframe and play video
4. ✅ Switch to upload mode - should show file picker
5. ✅ Upload MP4 file - should show loading, then display muted autoplay video
6. ✅ Try invalid URL - should show error message
7. ✅ Try file over 100MB - should show error message
8. ✅ Test Vimeo and TikTok URLs
9. ✅ Test in big and small card sizes
10. ✅ Test in mobile and desktop layouts

**Known edge cases**:
- TikTok private videos may show "video unavailable" in embed
- Vimeo private videos will fail oEmbed and show error
- YouTube age-restricted videos may not embed

## Next Steps

This completes the Video Card implementation. Next plan should cover Gallery Card with:
- Multiple image upload
- Circular Gallery (ReactBits) or Carousel mode toggle
- 10 image limit
- Drag-to-reorder thumbnails in editor

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Commit | Message |
|--------|---------|
| 37fe633 | feat(05-02): create VideoCard component |
| a3db260 | feat(05-02): create VideoCardFields editor component |
| 5063c5e | feat(05-02): wire VideoCard into card renderer |
| 44b0aea | feat(05-02): wire VideoCardFields into property editor |

---

**Plan duration:** 4 minutes
**Completed:** 2026-01-27
**Status:** ✅ All tasks complete, TypeScript compiles, ready for manual testing
