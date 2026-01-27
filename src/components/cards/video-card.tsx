// src/components/cards/video-card.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, Video } from 'lucide-react'
import type { Card } from '@/types/card'
import { isVideoContent, type VideoCardContent } from '@/types/card'

interface VideoCardProps {
  card: Card
  isPreview?: boolean
}

export function VideoCard({ card, isPreview = false }: VideoCardProps) {
  // Use type guard to safely cast content
  if (!isVideoContent(card.content)) {
    // Fallback for cards with invalid content
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Video className="h-12 w-12 mx-auto mb-2" />
          <p>Add video URL or upload video</p>
        </div>
      </div>
    )
  }

  const content = card.content

  // Route to appropriate component based on video type
  if (content.videoType === 'upload' && content.uploadedVideoUrl) {
    return <VideoCardUpload videoUrl={content.uploadedVideoUrl as string} title={card.title} />
  }

  if (content.videoType === 'embed' && content.embedUrl) {
    return (
      <VideoCardEmbed
        embedUrl={content.embedUrl as string}
        embedService={content.embedService as 'youtube' | 'vimeo' | 'tiktok' | undefined}
        embedVideoId={content.embedVideoId as string | undefined}
        thumbnailUrl={content.embedThumbnailUrl as string | undefined}
        title={card.title}
      />
    )
  }

  // Placeholder when no video configured
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <Video className="h-12 w-12 mx-auto mb-2" />
        <p>Add video URL or upload video</p>
      </div>
    </div>
  )
}

// ============================================
// VIDEO UPLOAD MODE
// ============================================

interface VideoCardUploadProps {
  videoUrl: string
  title: string | null
}

function VideoCardUpload({ videoUrl, title }: VideoCardUploadProps) {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      <video
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
        aria-label={title || 'Video'}
      />
      {title && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4">
          <p className="text-white font-medium drop-shadow-sm line-clamp-2">{title}</p>
        </div>
      )}
    </div>
  )
}

// ============================================
// VIDEO EMBED MODE
// ============================================

interface VideoCardEmbedProps {
  embedUrl: string
  embedService?: 'youtube' | 'vimeo' | 'tiktok'
  embedVideoId?: string
  thumbnailUrl?: string
  title: string | null
}

function VideoCardEmbed({
  embedUrl,
  embedService,
  embedVideoId,
  thumbnailUrl,
  title,
}: VideoCardEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Convert watch URLs to embed URLs if needed
  const getEmbedUrl = () => {
    // YouTube: convert watch?v= to embed/
    if (embedService === 'youtube' && embedUrl.includes('watch?v=')) {
      return `https://www.youtube.com/embed/${embedVideoId}`
    }
    return embedUrl
  }

  if (isPlaying) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={getEmbedUrl()}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title || 'Video'}
        />
      </div>
    )
  }

  // Thumbnail view with play button
  return (
    <button
      onClick={() => setIsPlaying(true)}
      className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted group cursor-pointer block"
      aria-label={`Play ${title || 'video'}`}
    >
      {/* Thumbnail image or placeholder */}
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={title || 'Video thumbnail'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Play className="h-16 w-16 text-muted-foreground" />
        </div>
      )}

      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg">
          <Play className="h-8 w-8 text-black ml-1" fill="currentColor" />
        </div>
      </div>

      {/* Title overlay (optional) */}
      {title && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4">
          <p className="text-white font-medium drop-shadow-sm line-clamp-2">{title}</p>
        </div>
      )}
    </button>
  )
}
