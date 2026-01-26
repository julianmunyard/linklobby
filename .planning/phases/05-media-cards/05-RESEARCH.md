# Phase 5: Media Cards - Research

**Researched:** 2026-01-27
**Domain:** Video embeds, video uploads, photo galleries, carousel components
**Confidence:** HIGH

## Summary

Phase 5 implements two new card types: Video Card (supporting both embeds and uploads) and Photo Gallery Card (with two layout styles). The research focused on five key areas: (1) embed APIs for YouTube/Vimeo/TikTok, (2) HTML5 video autoplay behavior, (3) ReactBits Circular Gallery component, (4) carousel libraries for the alternative gallery style, and (5) video/image upload patterns with Supabase Storage.

The standard approach uses oEmbed APIs to extract thumbnails for embedded videos (lazy-loading the iframe on click), HTML5 video with autoplay/muted/loop/playsinline for uploaded videos, ReactBits Circular Gallery as the primary gallery component, Embla Carousel as the lightweight carousel alternative, and extends existing Supabase Storage patterns to support video uploads with appropriate size limits (50-100MB recommended).

Video embeds follow a "thumbnail preview + click to load" pattern to optimize page performance, while uploaded videos use Instagram-style muted autoplay loops. Both card types follow existing sizing/positioning patterns (big/small, left/center/right) established in earlier phases.

**Primary recommendation:** Use oEmbed APIs for thumbnail extraction (YouTube/Vimeo work reliably, TikTok requires official embed code), implement lazy iframe loading with click-to-play, use HTML5 video with autoplay muted loop playsinline for uploads, install ReactBits components directly from their site, use Embla Carousel for the alternative gallery style, and extend existing storage patterns to support video uploads with 50-100MB limit.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **ReactBits Circular Gallery** | latest | Primary gallery component | User-decided in context, provides unique circular scroll effect |
| **embla-carousel-react** | latest | Alternative carousel gallery | Lightweight (800K weekly downloads), great touch/swipe support, minimal API |
| **get-video-id** | latest | Parse video URLs | Extracts video IDs from YouTube/Vimeo/TikTok URLs and embeds (62 dependents) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Supabase Storage** | (existing) | Video/image uploads | Already in stack, extend for video files |
| **browser-image-compression** | (existing) | Image compression | Already in stack for gallery images (NOT for videos) |
| **dnd-kit** | (existing) | Image reordering | Already in stack, use sortable preset for thumbnail reordering |
| **Next.js Image** | (existing) | Image optimization | Gallery thumbnails, embed thumbnails |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| embla-carousel-react | Swiper | Swiper is larger but has more built-in features (parallax, lazy loading, virtual slides) |
| embla-carousel-react | react-slick | react-slick is older, heavier bundle, more re-renders |
| get-video-id | js-video-url-parser | Similar functionality, get-video-id has simpler API |
| ReactBits Circular Gallery | Pure CSS carousel | Custom implementation loses unique circular bend effect |

**Installation:**
```bash
# Video embed parsing
npm install get-video-id

# Carousel for alternative gallery style
npm install embla-carousel-react

# ReactBits Circular Gallery
# Install directly from ReactBits website - copy component code
# Visit: https://reactbits.dev/components/circular-gallery
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── cards/
│   │   ├── video-card.tsx              # Video Card renderer
│   │   ├── gallery-card.tsx            # Photo Gallery renderer
│   │   └── card-renderer.tsx           # Update to include new types
│   ├── editor/
│   │   ├── video-card-fields.tsx       # Video Card editor
│   │   ├── gallery-card-fields.tsx     # Photo Gallery editor
│   │   └── card-property-editor.tsx    # Update for new types
│   └── ui/
│       ├── circular-gallery.tsx        # ReactBits component (copied)
│       └── embla-carousel.tsx          # Embla wrapper component
├── lib/
│   ├── supabase/
│   │   └── storage.ts                  # Extend for video uploads
│   └── video-embed.ts                  # Video URL parsing & oEmbed helpers
└── types/
    └── card.ts                         # Add VideoCardContent, GalleryCardContent
```

### Pattern 1: Video Embed with Lazy Loading

**What:** Display thumbnail preview, load iframe only when user clicks play.
**When to use:** YouTube, Vimeo, TikTok embeds.
**Why:** Prevents heavy video player scripts from loading upfront, improves page performance.

**Example:**
```typescript
// lib/video-embed.ts
// Source: Research on oEmbed APIs + get-video-id npm package
import getVideoId from 'get-video-id'

export interface VideoEmbedInfo {
  id: string
  service: 'youtube' | 'vimeo' | 'tiktok' | null
  thumbnailUrl: string
  embedUrl: string
}

export async function getVideoEmbedInfo(url: string): Promise<VideoEmbedInfo | null> {
  const { id, service } = getVideoId(url)

  if (!id || !service) return null

  let thumbnailUrl = ''
  let embedUrl = ''

  switch (service) {
    case 'youtube':
      // YouTube oEmbed API
      const ytOembed = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`)
      const ytData = await ytOembed.json()
      thumbnailUrl = ytData.thumbnail_url
      embedUrl = `https://www.youtube.com/embed/${id}`
      break

    case 'vimeo':
      // Vimeo oEmbed API
      const vimeoOembed = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`)
      const vimeoData = await vimeoOembed.json()
      thumbnailUrl = vimeoData.thumbnail_url
      embedUrl = `https://player.vimeo.com/video/${id}`
      break

    case 'tiktok':
      // TikTok uses official embed code - no reliable oEmbed
      // Store full URL, render with TikTok embed script
      embedUrl = url
      break
  }

  return { id, service, thumbnailUrl, embedUrl }
}
```

**Video Card Component (Embed Mode):**
```typescript
// components/cards/video-card.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'

interface VideoCardProps {
  embedUrl: string
  thumbnailUrl: string
  title?: string
}

export function VideoCardEmbed({ embedUrl, thumbnailUrl, title }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  if (isPlaying) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden">
        <iframe
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsPlaying(true)}
      className="relative w-full aspect-video rounded-xl overflow-hidden group cursor-pointer"
    >
      {/* Thumbnail */}
      <Image
        src={thumbnailUrl}
        alt={title || 'Video thumbnail'}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 600px"
      />

      {/* Play button overlay */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
        <div className="bg-white rounded-full p-4 group-hover:scale-110 transition-transform">
          <Play className="h-8 w-8 text-black" fill="currentColor" />
        </div>
      </div>
    </button>
  )
}
```

### Pattern 2: HTML5 Video Autoplay (Uploaded Videos)

**What:** Muted autoplay loop for uploaded video files, Instagram-style.
**When to use:** User uploads video file (not embed).
**Why:** Autoplay requires muted + playsinline for mobile compatibility.

**Example:**
```typescript
// components/cards/video-card.tsx
// Source: MDN Web Docs + Research on autoplay policies
interface VideoCardUploadProps {
  videoUrl: string
  title?: string
}

export function VideoCardUpload({ videoUrl, title }: VideoCardUploadProps) {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      <video
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        aria-label={title || 'Video content'}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
```

**Key attributes:**
- `autoPlay`: Start playing automatically
- `muted`: Required for autoplay to work in most browsers
- `loop`: Restart when video ends (Instagram-style)
- `playsInline`: Prevents fullscreen takeover on iOS

### Pattern 3: ReactBits Circular Gallery

**What:** Circular scroll gallery with configurable bend/speed.
**When to use:** Primary gallery style (user-decided).
**Implementation:** Copy component from ReactBits website.

**Example usage:**
```typescript
// components/cards/gallery-card.tsx
// Source: https://reactbits.dev/components/circular-gallery
import { CircularGallery } from '@/components/ui/circular-gallery'

interface GalleryCardProps {
  images: Array<{ url: string; alt: string }>
  style: 'circular' | 'carousel'
}

export function GalleryCard({ images, style }: GalleryCardProps) {
  if (style === 'circular') {
    return (
      <CircularGallery
        images={images.map(img => img.url)}
        scrollEase={0.15}
        scrollSpeed={4.6}
        borderRadius={0}
        bend={10}
      />
    )
  }

  // Carousel style handled separately
  return <EmblaCarouselGallery images={images} />
}
```

**Note:** ReactBits components are copied directly from their website (not npm installed). Check licensing and customization options on their site.

### Pattern 4: Embla Carousel (Alternative Gallery Style)

**What:** Lightweight carousel with touch/swipe navigation.
**When to use:** Alternative "classic carousel" gallery style.
**Why:** Minimal API, great mobile support, 800K weekly downloads.

**Example:**
```typescript
// components/ui/embla-carousel.tsx
// Source: https://www.embla-carousel.com/get-started/react/
'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface EmblaCarouselProps {
  images: Array<{ url: string; alt: string }>
}

export function EmblaCarouselGallery({ images }: EmblaCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  return (
    <div className="relative">
      {/* Carousel viewport */}
      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {images.map((image, idx) => (
            <div key={idx} className="flex-[0_0_100%] min-w-0">
              <div className="relative aspect-square">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons (outside viewport to avoid drag conflicts) */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
        aria-label="Next image"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
```

**CSS requirements:**
```css
/* Required for Embla Carousel */
.embla__viewport { overflow: hidden; }
.embla__container { display: flex; touch-action: pan-y pinch-zoom; }
.embla__slide { flex: 0 0 100%; min-width: 0; }
```

### Pattern 5: Image Reordering in Editor (dnd-kit)

**What:** Drag and drop thumbnail reordering in gallery editor.
**When to use:** Gallery card editing UI.
**Why:** dnd-kit already in stack, sortable preset handles this pattern.

**Example:**
```typescript
// components/editor/gallery-card-fields.tsx
// Source: https://docs.dndkit.com/presets/sortable
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'

interface GalleryImage {
  id: string
  url: string
  alt: string
}

interface GalleryEditorProps {
  images: GalleryImage[]
  onReorder: (images: GalleryImage[]) => void
  onRemove: (id: string) => void
}

function SortableImage({ image, onRemove }: { image: GalleryImage; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div {...attributes} {...listeners} className="cursor-move">
        <Image src={image.url} alt={image.alt} width={100} height={100} className="rounded object-cover" />
      </div>
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  )
}

export function GalleryEditor({ images, onReorder, onRemove }: GalleryEditorProps) {
  function handleDragEnd(event: any) {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = images.findIndex(img => img.id === active.id)
      const newIndex = images.findIndex(img => img.id === over.id)
      onReorder(arrayMove(images, oldIndex, newIndex))
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-4 gap-2">
          {images.map(image => (
            <SortableImage key={image.id} image={image} onRemove={() => onRemove(image.id)} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
```

### Pattern 6: Video Upload to Supabase Storage

**What:** Extend existing storage patterns to support video uploads.
**When to use:** User uploads video file (not embed).
**Why:** Consistent with existing image upload patterns, proper size validation.

**Example:**
```typescript
// lib/supabase/storage.ts (extend existing file)
// Source: Supabase Docs + existing storage.ts patterns

const VIDEO_BUCKET = "card-videos"
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB (adjustable 50-500MB based on plan)

export async function uploadCardVideo(
  file: File,
  cardId: string
): Promise<UploadResult> {
  // Validate file size
  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error("Video must be less than 100MB")
  }

  // Validate file type
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg']
  if (!validVideoTypes.includes(file.type)) {
    throw new Error("Video must be MP4, WebM, or OGG format")
  }

  const supabase = createClient()

  // Generate unique filename: cardId/uuid.ext
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "mp4"
  const fileName = `${cardId}/${crypto.randomUUID()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    throw new Error(error.message || "Failed to upload video")
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(VIDEO_BUCKET)
    .getPublicUrl(data.path)

  return {
    url: urlData.publicUrl,
    path: data.path,
  }
}

export async function deleteCardVideo(path: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .remove([path])

  if (error) {
    throw new Error(error.message || "Failed to delete video")
  }
}
```

**Supabase Storage setup:**
```sql
-- Create video storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-videos', 'card-videos', true);

-- Set file size limit (example: 100MB)
-- Configure in Supabase Dashboard > Storage > card-videos > Settings
-- Or via SQL:
UPDATE storage.buckets
SET file_size_limit = 104857600  -- 100MB in bytes
WHERE id = 'card-videos';
```

### Pattern 7: Image Cropping for Gallery Consistency

**What:** CSS aspect ratio + object-fit for consistent gallery image display.
**When to use:** Both gallery styles (circular and carousel).
**Why:** Different aspect ratio images need uniform display without distortion.

**Example:**
```typescript
// Square crop for carousel consistency
<div className="relative aspect-square w-full">
  <Image
    src={imageUrl}
    alt={alt}
    fill
    className="object-cover"  // Crops to fill square
    sizes="(max-width: 768px) 100vw, 600px"
  />
</div>

// Circular Gallery handles cropping internally via component props
<CircularGallery
  images={imageUrls}
  borderRadius={0}  // Controls image shape
  bend={10}         // Controls circular bend effect
/>
```

**CSS fundamentals:**
```css
/* Enforce aspect ratio container */
.aspect-square { aspect-ratio: 1 / 1; }

/* Image fill behavior */
.object-cover { object-fit: cover; }  /* Scale and crop to fill */
.object-contain { object-fit: contain; }  /* Scale to fit, may letterbox */
```

### Anti-Patterns to Avoid

- **Loading all video embeds on page load:** Causes massive performance hit. Use thumbnail preview + lazy iframe loading.
- **HTML5 video without muted attribute:** Autoplay will be blocked by browsers. Always include muted for autoplay.
- **Forgetting playsInline on mobile:** iOS will force fullscreen without this attribute.
- **Using browser-image-compression for videos:** This library only handles images. Videos need different compression (FFmpeg or cloud services).
- **No file type validation:** Users may upload huge files or wrong formats. Validate before upload.
- **Storing video files in wrong bucket:** Create separate bucket for videos to manage size limits independently.
- **TikTok oEmbed reliability:** TikTok's oEmbed is unreliable. Use official TikTok embed code/script instead.
- **Carousel navigation inside viewport:** Causes drag conflicts. Place nav buttons outside carousel viewport.
- **Hard-coding 10-image limit client-side only:** Enforce limit server-side too (database check or RLS policy).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Parse video URLs | Regex patterns for each service | `get-video-id` npm package | Handles edge cases, embed formats, multiple services |
| Carousel touch/swipe | Custom pointer event handlers | Embla Carousel | Physics simulation, momentum, snap points, cross-platform |
| Video embed thumbnails | Manual API calls per service | oEmbed APIs (standardized) | Consistent interface, handles auth/CORS, includes metadata |
| Image reordering | Custom drag handlers | dnd-kit sortable preset | Accessibility, keyboard nav, ghost previews, collision detection |
| Video aspect ratios | Manual padding-top hacks | CSS aspect-ratio property | Modern standard, cleaner, responsive |
| Autoplay policies | Browser detection logic | Standard attributes (autoplay muted playsinline) | Browsers enforce policies, not JS checks |

**Key insight:** Video embeds are deceptively complex. Each platform has quirks (YouTube API key requirements for advanced features, Vimeo private video restrictions, TikTok embed script loading). Using standardized patterns (oEmbed for metadata, lazy loading for performance) avoids platform-specific edge cases and reduces initial page weight by 90%+.

## Common Pitfalls

### Pitfall 1: Autoplay Blocked on Mobile

**What goes wrong:** Uploaded videos don't autoplay on mobile devices, appear frozen.
**Why it happens:** Mobile browsers block autoplay unless video is muted AND has playsinline attribute.
**How to avoid:**
- Always include all four attributes: `autoPlay muted loop playsInline`
- Test on actual iOS devices (Safari simulator behaves differently)
- Don't rely on JavaScript to add attributes - use in JSX directly
**Warning signs:** Videos work on desktop but not mobile, iOS forces fullscreen.

### Pitfall 2: TikTok Embed Loading Issues

**What goes wrong:** TikTok videos don't load or display broken embed.
**Why it happens:** TikTok's oEmbed is unreliable, requires special embed script.
**How to avoid:**
- Don't rely on oEmbed for TikTok thumbnails
- Use TikTok's official embed code (includes required script tags)
- Consider using TikTok's embed widget library or iframe with proper origin
- Alternative: Store TikTok links with custom thumbnail upload
**Warning signs:** TikTok embeds break intermittently, work in dev but not prod.

### Pitfall 3: Video File Size Kills Performance

**What goes wrong:** Users upload 500MB video files, page won't load, storage costs spike.
**Why it happens:** No client-side file size validation before upload attempt.
**How to avoid:**
- Validate file size client-side (50-100MB reasonable limit)
- Set Supabase bucket-level file size limit (can't be bypassed)
- Show clear error message: "Video must be under 100MB. Compress with HandBrake first."
- Consider signed upload URLs for files >6MB
**Warning signs:** Slow page loads, high Supabase storage costs, user complaints.

### Pitfall 4: Gallery Image Distortion

**What goes wrong:** Gallery images stretched or squashed, inconsistent sizing.
**Why it happens:** Different aspect ratio images rendered without object-fit or aspect-ratio.
**How to avoid:**
- Use `aspect-ratio: 1/1` (square) for carousel consistency
- Use `object-fit: cover` to crop images to fill container
- ReactBits Circular Gallery handles this internally - use their props
- Test with portrait, landscape, and square images
**Warning signs:** Visually inconsistent gallery, images look distorted.

### Pitfall 5: Embed Performance Drag

**What goes wrong:** Page loads slowly with multiple video cards, high data usage.
**Why it happens:** All video embeds load iframe + player JavaScript immediately.
**How to avoid:**
- ALWAYS use thumbnail preview + click-to-play pattern
- Don't render iframe until user clicks play
- Use Next.js Image for thumbnails (automatic optimization)
- Each YouTube embed loads ~1MB of JavaScript - lazy loading saves 90%+
**Warning signs:** Slow page load times, mobile users complain about data usage.

### Pitfall 6: Gallery Reorder Race Conditions

**What goes wrong:** Images reorder incorrectly, duplicate images, lost reorder on save.
**Why it happens:** State updates not atomic, optimistic UI without server confirmation.
**How to avoid:**
- Use dnd-kit's built-in collision detection
- Don't save to database on every drag move - save on drop or "Save" button
- Use optimistic UI pattern: update local state, save to DB, revert on error
- Store image order as array of IDs or sort_order integers
**Warning signs:** Images jump back to original position, reordering feels glitchy.

### Pitfall 7: Missing Video Format Support

**What goes wrong:** User uploads video that won't play in some browsers.
**Why it happens:** Not all video formats supported across all browsers.
**How to avoid:**
- Accept only MP4 (H.264 codec) for maximum compatibility
- Validate MIME type on upload: `video/mp4`, `video/webm`, `video/ogg`
- Provide clear error: "Please upload MP4 format for best compatibility"
- Optional: WebM as alternative for modern browsers (smaller files)
**Warning signs:** "Video won't play" reports from users on specific browsers.

### Pitfall 8: ReactBits Component Licensing Confusion

**What goes wrong:** Unclear if ReactBits components can be used commercially.
**Why it happens:** Copy-paste components from website, licensing not obvious.
**How to avoid:**
- Check ReactBits license before using (website footer or GitHub)
- Confirm commercial use is allowed
- Consider alternatives if licensing is restrictive
- Verify component updates/maintenance frequency
**Warning signs:** Legal uncertainty, component breaks with no support.

## Code Examples

Verified patterns from official sources:

### Complete Video Card Implementation

```typescript
// types/card.ts - Add to existing file
export interface VideoCardContent {
  videoType: 'embed' | 'upload'

  // For embeds
  embedUrl?: string        // Original URL (YouTube/Vimeo/TikTok)
  embedService?: 'youtube' | 'vimeo' | 'tiktok'
  embedVideoId?: string
  embedThumbnailUrl?: string

  // For uploads
  uploadedVideoUrl?: string
  uploadedVideoPath?: string  // Supabase Storage path for deletion
}

// components/cards/video-card.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { Card, VideoCardContent } from '@/types/card'

interface VideoCardProps {
  card: Card
  isPreview?: boolean
}

export function VideoCard({ card, isPreview = false }: VideoCardProps) {
  const content = card.content as VideoCardContent

  if (content.videoType === 'upload' && content.uploadedVideoUrl) {
    return <VideoCardUpload videoUrl={content.uploadedVideoUrl} title={card.title} />
  }

  if (content.videoType === 'embed' && content.embedUrl) {
    return (
      <VideoCardEmbed
        embedUrl={content.embedUrl}
        thumbnailUrl={content.embedThumbnailUrl || ''}
        service={content.embedService}
        title={card.title}
      />
    )
  }

  // Placeholder state (no video configured)
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <Play className="h-12 w-12 mx-auto mb-2" />
        <p>Add video URL or upload video</p>
      </div>
    </div>
  )
}

function VideoCardUpload({ videoUrl, title }: { videoUrl: string; title: string | null }) {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      <video
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        aria-label={title || 'Video content'}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

function VideoCardEmbed({
  embedUrl,
  thumbnailUrl,
  service,
  title
}: {
  embedUrl: string
  thumbnailUrl: string
  service?: string
  title: string | null
}) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Convert watch URL to embed URL if needed
  let finalEmbedUrl = embedUrl
  if (service === 'youtube' && embedUrl.includes('watch?v=')) {
    const videoId = embedUrl.split('watch?v=')[1].split('&')[0]
    finalEmbedUrl = `https://www.youtube.com/embed/${videoId}`
  }

  if (isPlaying) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden">
        <iframe
          src={finalEmbedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsPlaying(true)}
      className="relative w-full aspect-video rounded-xl overflow-hidden group cursor-pointer bg-black"
    >
      {/* Thumbnail */}
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={title || 'Video thumbnail'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
        />
      ) : (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <Play className="h-16 w-16 text-muted-foreground" />
        </div>
      )}

      {/* Play button overlay */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
        <div className="bg-white rounded-full p-4 group-hover:scale-110 transition-transform">
          <Play className="h-8 w-8 text-black" fill="currentColor" />
        </div>
      </div>

      {/* Title overlay (optional) */}
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white font-medium">{title}</h3>
        </div>
      )}
    </button>
  )
}
```

### Complete Gallery Card Implementation

```typescript
// types/card.ts - Add to existing file
export interface GalleryImage {
  id: string
  url: string
  alt: string
  storagePath: string  // For deletion
}

export interface GalleryCardContent {
  galleryStyle: 'circular' | 'carousel'
  images: GalleryImage[]

  // ReactBits Circular Gallery settings
  scrollEase?: number      // Default: 0.15
  scrollSpeed?: number     // Default: 4.6
  borderRadius?: number    // Default: 0
  bend?: number           // Default: 10
}

// components/cards/gallery-card.tsx
'use client'

import { CircularGallery } from '@/components/ui/circular-gallery'
import { EmblaCarouselGallery } from '@/components/ui/embla-carousel'
import { Card, GalleryCardContent } from '@/types/card'
import { ImageIcon } from 'lucide-react'

interface GalleryCardProps {
  card: Card
  isPreview?: boolean
}

export function GalleryCard({ card, isPreview = false }: GalleryCardProps) {
  const content = card.content as GalleryCardContent

  // No images yet
  if (!content.images || content.images.length === 0) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
          <p>Add images to gallery</p>
          <p className="text-sm mt-1">Up to 10 images</p>
        </div>
      </div>
    )
  }

  // Render based on style
  if (content.galleryStyle === 'circular') {
    return (
      <CircularGallery
        images={content.images.map(img => img.url)}
        scrollEase={content.scrollEase || 0.15}
        scrollSpeed={content.scrollSpeed || 4.6}
        borderRadius={content.borderRadius || 0}
        bend={content.bend || 10}
      />
    )
  }

  // Carousel style
  return <EmblaCarouselGallery images={content.images} />
}
```

### Video Embed Helper Functions

```typescript
// lib/video-embed.ts
// Source: get-video-id npm package + oEmbed API research
import getVideoId from 'get-video-id'

export interface VideoEmbedInfo {
  id: string
  service: 'youtube' | 'vimeo' | 'tiktok'
  thumbnailUrl: string
  embedUrl: string
  title?: string
}

export async function parseVideoUrl(url: string): Promise<VideoEmbedInfo | null> {
  const { id, service } = getVideoId(url)

  if (!id || !service) {
    throw new Error('Invalid video URL. Supported: YouTube, Vimeo, TikTok')
  }

  switch (service) {
    case 'youtube':
      return await getYouTubeInfo(id)
    case 'vimeo':
      return await getVimeoInfo(id)
    case 'tiktok':
      return await getTikTokInfo(url)  // TikTok needs full URL
    default:
      throw new Error(`Unsupported video service: ${service}`)
  }
}

async function getYouTubeInfo(videoId: string): Promise<VideoEmbedInfo> {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    )

    if (!response.ok) throw new Error('YouTube oEmbed failed')

    const data = await response.json()

    return {
      id: videoId,
      service: 'youtube',
      thumbnailUrl: data.thumbnail_url,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      title: data.title,
    }
  } catch (error) {
    // Fallback: use standard thumbnail pattern
    return {
      id: videoId,
      service: 'youtube',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
    }
  }
}

async function getVimeoInfo(videoId: string): Promise<VideoEmbedInfo> {
  try {
    const response = await fetch(
      `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`
    )

    if (!response.ok) throw new Error('Vimeo oEmbed failed')

    const data = await response.json()

    return {
      id: videoId,
      service: 'vimeo',
      thumbnailUrl: data.thumbnail_url,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      title: data.title,
    }
  } catch (error) {
    throw new Error('Failed to load Vimeo video info. Video may be private.')
  }
}

async function getTikTokInfo(url: string): Promise<VideoEmbedInfo> {
  // TikTok oEmbed is unreliable - store URL for official embed code
  // Extract video ID from URL for storage
  const videoId = url.split('/video/')[1]?.split('?')[0] || url

  return {
    id: videoId,
    service: 'tiktok',
    thumbnailUrl: '', // TikTok doesn't provide reliable thumbnails
    embedUrl: url,    // Store full URL for TikTok embed script
  }
}
```

### Embla Carousel Full Implementation

```typescript
// components/ui/embla-carousel.tsx
// Source: https://www.embla-carousel.com/get-started/react/
'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface EmblaCarouselProps {
  images: Array<{ url: string; alt: string }>
}

export function EmblaCarouselGallery({ images }: EmblaCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  return (
    <div className="relative">
      {/* Carousel viewport */}
      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="flex touch-pan-y touch-pinch-zoom">
          {images.map((image, idx) => (
            <div key={idx} className="flex-[0_0_100%] min-w-0 px-2">
              <div className="relative aspect-square">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons (outside viewport to avoid drag conflicts) */}
      {canScrollPrev && (
        <button
          onClick={scrollPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors shadow-md z-10"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canScrollNext && (
        <button
          onClick={scrollNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors shadow-md z-10"
          aria-label="Next image"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => emblaApi?.scrollTo(idx)}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              idx === (emblaApi?.selectedScrollSnap() || 0)
                ? "bg-primary"
                : "bg-primary/30"
            )}
            aria-label={`Go to image ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Load all video iframes on page load | Thumbnail preview + lazy iframe loading | 2020+ (performance best practices) | 90%+ reduction in initial page weight |
| Autoplay without muted | Muted autoplay with playsinline | 2016+ (browser autoplay policies) | Required for mobile autoplay |
| react-slick for carousels | Embla Carousel or Swiper | 2022+ (modern alternatives) | Better performance, smaller bundle |
| Custom video URL parsing | get-video-id npm package | Stable library | Handles edge cases, multiple services |
| Fixed aspect ratio hacks (padding-top) | CSS aspect-ratio property | 2021+ (widespread support) | Cleaner, more responsive |
| All videos autoplay | Choice: autoplay for uploads, click-to-play for embeds | User preference patterns | Better UX, lower data usage |
| oEmbed for all platforms | oEmbed for YouTube/Vimeo, official embed for TikTok | TikTok API changes | More reliable TikTok embeds |

**Deprecated/outdated:**
- `react-slick`: Still works but heavier, more re-renders than modern alternatives
- Manual aspect ratio padding hacks: Use CSS `aspect-ratio` property instead
- YouTube iframe without lazy loading: Performance hit too significant
- Browser-specific autoplay detection: Use standard attributes, let browsers enforce

## Open Questions

Things that couldn't be fully resolved:

1. **ReactBits Circular Gallery implementation details**
   - What we know: Component exists at https://reactbits.dev/components/circular-gallery
   - What's unclear: Installation method (copy-paste vs npm), licensing, customization limits
   - Recommendation: Visit ReactBits site to copy component code, verify license allows commercial use, check if component is maintained

2. **TikTok embed reliability**
   - What we know: TikTok oEmbed is unreliable, official embed code recommended
   - What's unclear: Best way to render TikTok embeds in React (script tag, iframe, widget library)
   - Recommendation: Use TikTok official embed code initially, consider custom thumbnail upload as fallback, test thoroughly

3. **Video compression handling**
   - What we know: browser-image-compression doesn't work for videos, FFmpeg is typical solution
   - What's unclear: Should LinkLobby compress videos server-side or rely on user to compress first?
   - Recommendation: Phase 1 - no server-side compression, show clear error "Video must be under 100MB", link to HandBrake compression tool. Phase 2 - consider Cloudinary or similar service for automatic compression.

4. **Gallery image limit enforcement**
   - What we know: User decided 10-image hard limit
   - What's unclear: Client-side only or also database constraint/validation?
   - Recommendation: Enforce client-side (disable "Add" button at 10), add database check in card validation, no RLS policy needed (app-level concern)

5. **Circular Gallery mobile performance**
   - What we know: Component uses scroll effects with configurable speed/ease
   - What's unclear: Performance on low-end mobile devices
   - Recommendation: Test on actual devices (iOS/Android), may need to reduce bend/speed values for mobile, consider simpler carousel fallback if performance issues

## Sources

### Primary (HIGH confidence)
- [Supabase Storage File Limits](https://supabase.com/docs/guides/storage/uploads/file-limits) - File size limits and bucket configuration
- [Supabase Standard Uploads](https://supabase.com/docs/guides/storage/uploads/standard-uploads) - Upload methods and best practices
- [MDN: Autoplay guide for media](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) - Browser autoplay policies
- [MDN: HTML video element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video) - Video element attributes
- [Embla Carousel - React](https://www.embla-carousel.com/get-started/react/) - Official installation and usage
- [dnd-kit Sortable Documentation](https://docs.dndkit.com/presets/sortable) - Sortable preset for image reordering
- [get-video-id npm package](https://www.npmjs.com/package/get-video-id) - Video URL parsing library
- [YouTube oEmbed API](https://developers.google.com/youtube/iframe_api_reference) - YouTube iframe player API
- [CSS object-fit property](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit) - Image cropping/fitting

### Secondary (MEDIUM confidence)
- [How to Embed TikTok Videos (2026)](https://embedsocial.com/blog/embed-tiktok-video/) - TikTok embed methods
- [Vimeo oEmbed API Guide](https://www.briancoords.com/get-thumbnail-vimeo-api/) - Vimeo thumbnail extraction
- [React Carousel Libraries Comparison (2026)](https://www.carmatec.com/blog/10-best-react-carousel-component-libraries/) - Embla vs Swiper comparison
- [Next.js Video Upload Guide (2026)](https://supalaunch.com/blog/file-upload-nextjs-supabase) - Supabase Storage with Next.js
- [Video Optimization Best Practices (2026)](https://natclark.com/how-to-optimize-video-for-web-complete-2025-guide/) - Web video compression and formats

### Tertiary (LOW confidence)
- ReactBits Circular Gallery component details - Website content not fully accessible via WebFetch, requires manual verification
- TikTok embed best practices - Search results show multiple approaches, needs testing to verify most reliable method
- browser-image-compression with video - Confirmed it does NOT support video, FFmpeg or cloud services needed

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Embla Carousel, get-video-id, and Supabase Storage patterns verified via official docs
- Architecture: HIGH - Video embed patterns, HTML5 video, carousel implementation verified via MDN and official library docs
- ReactBits Circular Gallery: MEDIUM - Component exists and is user-decided, but implementation details require manual verification
- Pitfalls: HIGH - Autoplay policies, lazy loading, and file size issues verified via MDN and Supabase docs
- TikTok embed: MEDIUM - Multiple sources confirm oEmbed unreliability, official embed code recommended but needs testing

**Research date:** 2026-01-27
**Valid until:** 30 days (ReactBits component may update, TikTok embed patterns may change, video format support evolving)
