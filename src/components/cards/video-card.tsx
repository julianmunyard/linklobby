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
  // Check for uploaded video first (handles both explicit 'upload' type and uploaded videos with undefined type)
  if (content.uploadedVideoUrl && (content.videoType === 'upload' || !content.videoType)) {
    return (
      <VideoCardUpload
        videoUrl={content.uploadedVideoUrl as string}
        title={card.title}
        zoom={content.videoZoom as number | undefined}
        positionX={content.videoPositionX as number | undefined}
        positionY={content.videoPositionY as number | undefined}
        textAlign={(content.textAlign as 'left' | 'center' | 'right') ?? 'center'}
        verticalAlign={(content.verticalAlign as 'top' | 'middle' | 'bottom') ?? 'bottom'}
      />
    )
  }

  if (content.embedUrl && (content.videoType === 'embed' || !content.videoType)) {
    return (
      <VideoCardEmbed
        embedUrl={content.embedUrl as string}
        embedService={content.embedService as 'youtube' | 'vimeo' | 'tiktok' | undefined}
        embedVideoId={content.embedVideoId as string | undefined}
        thumbnailUrl={content.embedThumbnailUrl as string | undefined}
        title={card.title}
        textAlign={(content.textAlign as 'left' | 'center' | 'right') ?? 'center'}
        verticalAlign={(content.verticalAlign as 'top' | 'middle' | 'bottom') ?? 'bottom'}
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
  zoom?: number
  positionX?: number
  positionY?: number
  textAlign?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
}

function VideoCardUpload({
  videoUrl,
  title,
  zoom = 1,
  positionX = 50,
  positionY = 50,
  textAlign = 'center',
  verticalAlign = 'bottom',
}: VideoCardUploadProps) {
  // Text alignment classes
  const textAlignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[textAlign]

  // Vertical position classes for the title overlay
  const verticalPositionClass = {
    top: 'top-0 bg-gradient-to-b',
    middle: 'top-1/2 -translate-y-1/2',
    bottom: 'bottom-0 bg-gradient-to-t',
  }[verticalAlign]

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      <video
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full pointer-events-none"
        style={{
          transform: `scale(${zoom})`,
          objectFit: 'cover',
          objectPosition: `${positionX}% ${positionY}%`,
        }}
        aria-label={title || 'Video'}
      />
      {title && (
        <div className={`absolute inset-x-0 ${verticalPositionClass} from-black/70 via-black/20 to-transparent p-4`}>
          <p className={`text-white font-medium drop-shadow-sm line-clamp-2 ${textAlignClass}`}>{title}</p>
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
  textAlign?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
}

function VideoCardEmbed({
  embedUrl,
  embedService,
  embedVideoId,
  thumbnailUrl,
  title,
  textAlign = 'center',
  verticalAlign = 'bottom',
}: VideoCardEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Text alignment classes
  const textAlignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[textAlign]

  // Vertical position classes for the title overlay
  const verticalPositionClass = {
    top: 'top-0 bg-gradient-to-b',
    middle: 'top-1/2 -translate-y-1/2',
    bottom: 'bottom-0 bg-gradient-to-t',
  }[verticalAlign]

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
        <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-transform group-hover:scale-110 border border-white/20">
          <Play className="h-5 w-5 text-white ml-0.5" fill="currentColor" />
        </div>
      </div>

      {/* Title overlay (optional) */}
      {title && (
        <div className={`absolute inset-x-0 ${verticalPositionClass} from-black/70 via-black/20 to-transparent p-4`}>
          <p className={`text-white font-medium drop-shadow-sm line-clamp-2 ${textAlignClass}`}>{title}</p>
        </div>
      )}
    </button>
  )
}
