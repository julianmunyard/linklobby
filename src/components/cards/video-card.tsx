// src/components/cards/video-card.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, Video } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'
import type { Card } from '@/types/card'
import { isVideoContent, type VideoCardContent } from '@/types/card'

// Retro Mac-style video control bar for System Settings theme
function RetroVideoControlBar({ title }: { title?: string | null }) {
  return (
    <div
      className="flex items-center gap-0 bg-theme-text"
      style={{ fontFamily: 'var(--font-pixolde), var(--font-pix-chicago), monospace' }}
    >
      {/* Play/Pause buttons */}
      <button className="px-1.5 py-0.5 border-r border-theme-card-bg/30 hover:opacity-70 text-[10px] text-theme-card-bg">
        ◀▮
      </button>
      <button className="px-1.5 py-0.5 border-r border-theme-card-bg/30 hover:opacity-70 text-[10px] text-theme-card-bg">
        ▶
      </button>

      {/* Filename */}
      <div className="flex-1 px-2 py-0.5 text-[10px] text-theme-card-bg truncate">
        {title || 'video.mp4'}
      </div>

      {/* Dimensions placeholder */}
      <div className="px-2 py-0.5 text-[10px] text-theme-card-bg/70 border-l border-theme-card-bg/30">
        16:9
      </div>

      {/* Expand icon */}
      <button className="px-1.5 py-0.5 border-l border-theme-card-bg/30 hover:opacity-70 text-[10px] text-theme-card-bg">
        ⤢
      </button>
    </div>
  )
}

interface VideoCardProps {
  card: Card
  isPreview?: boolean
}

export function VideoCard({ card, isPreview = false }: VideoCardProps) {
  const fontSize = useThemeStore((state) => state.cardTypeFontSizes.video)
  const themeId = useThemeStore((state) => state.themeId)
  const isSystemSettings = themeId === 'system-settings'

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
  const textColor = (content.textColor as string) || '#ffffff'

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
        textColor={textColor}
        fontSize={fontSize}
        showRetroControls={isSystemSettings}
      />
    )
  }

  if (content.embedUrl && (content.videoType === 'embed' || !content.videoType)) {
    return (
      <VideoCardEmbed
        embedUrl={content.embedUrl as string}
        embedService={content.embedService as 'youtube' | 'vimeo' | 'tiktok' | 'instagram' | undefined}
        embedVideoId={content.embedVideoId as string | undefined}
        thumbnailUrl={content.embedThumbnailUrl as string | undefined}
        title={card.title}
        textAlign={(content.textAlign as 'left' | 'center' | 'right') ?? 'center'}
        verticalAlign={(content.verticalAlign as 'top' | 'middle' | 'bottom') ?? 'bottom'}
        textColor={textColor}
        fontSize={fontSize}
        showRetroControls={isSystemSettings}
        embedIsVertical={content.embedIsVertical as boolean | undefined}
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
  textColor?: string
  fontSize?: number
  showRetroControls?: boolean
}

function VideoCardUpload({
  videoUrl,
  title,
  zoom = 1,
  positionX = 50,
  positionY = 50,
  textAlign = 'center',
  verticalAlign = 'bottom',
  textColor = '#ffffff',
  fontSize = 1,
  showRetroControls = false,
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
    <div className="relative w-full flex flex-col">
      <div className="relative w-full aspect-video overflow-hidden bg-black">
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
        {title && !showRetroControls && (
          <div className={`absolute inset-x-0 ${verticalPositionClass} from-black/70 via-black/20 to-transparent p-4`}>
            <p
              className={`font-medium drop-shadow-sm line-clamp-2 ${textAlignClass}`}
              style={{ fontFamily: 'var(--font-theme-heading)', color: textColor, fontSize: `${1 * fontSize}rem` }}
            >
              {title}
            </p>
          </div>
        )}
      </div>
      {showRetroControls && <RetroVideoControlBar title={title} />}
    </div>
  )
}

// ============================================
// VIDEO EMBED MODE
// ============================================

interface VideoCardEmbedProps {
  embedUrl: string
  embedService?: 'youtube' | 'vimeo' | 'tiktok' | 'instagram'
  embedVideoId?: string
  thumbnailUrl?: string
  title: string | null
  textAlign?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
  textColor?: string
  fontSize?: number
  showRetroControls?: boolean
  embedIsVertical?: boolean
}

// Container for 9:16 vertical content (TikTok, Instagram Reels)
function VerticalEmbedContainer({ children }: { children: React.ReactNode }) {
  return (
    // Center the container and constrain max width
    <div className="relative w-full flex justify-center">
      {/* Max width matches TikTok's embed max (325px) */}
      <div className="relative w-full max-w-[325px]">
        {/* 9:16 aspect ratio: 16/9 * 100 = 177.78% */}
        <div className="relative w-full pb-[177.78%]">
          <div className="absolute inset-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

function VideoCardEmbed({
  embedUrl,
  embedService,
  embedVideoId,
  thumbnailUrl,
  title,
  textAlign = 'center',
  verticalAlign = 'bottom',
  textColor = '#ffffff',
  fontSize = 1,
  showRetroControls = false,
  embedIsVertical = false,
}: VideoCardEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Check if this is vertical content (9:16 aspect ratio)
  const isVertical = embedIsVertical ||
    embedService === 'tiktok' ||
    (embedService === 'instagram' && embedUrl?.includes('/reel'))

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
    // TikTok: use v2 embed URL
    if (embedService === 'tiktok' && embedVideoId) {
      return `https://www.tiktok.com/embed/v2/${embedVideoId}`
    }
    // Instagram: ensure embed format
    if (embedService === 'instagram') {
      if (embedUrl.includes('/embed/')) return embedUrl
      const postId = embedUrl.match(/\/(p|reel|reels)\/([a-zA-Z0-9_-]+)/)?.[2]
      if (postId) return `https://www.instagram.com/p/${postId}/embed/`
    }
    return embedUrl
  }

  // Vertical content (TikTok, Instagram Reels) - 9:16 aspect ratio
  if (isVertical) {
    if (isPlaying) {
      return (
        <div className="relative w-full flex flex-col">
          <VerticalEmbedContainer>
            <iframe
              src={getEmbedUrl()}
              className="w-full h-full rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title || 'Video'}
            />
          </VerticalEmbedContainer>
          {showRetroControls && <RetroVideoControlBar title={title} />}
        </div>
      )
    }

    // Vertical thumbnail view with play button
    return (
      <div className="relative w-full flex flex-col">
        <VerticalEmbedContainer>
          <button
            onClick={() => setIsPlaying(true)}
            className="relative w-full h-full overflow-hidden bg-muted group cursor-pointer block rounded-xl"
            aria-label={`Play ${title || 'video'}`}
          >
            {/* Thumbnail image or placeholder */}
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={title || 'Video thumbnail'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 325px"
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

            {/* Title overlay (optional) - hide when retro controls shown */}
            {title && !showRetroControls && (
              <div className={`absolute inset-x-0 ${verticalPositionClass} from-black/70 via-black/20 to-transparent p-4`}>
                <p
                  className={`font-medium drop-shadow-sm line-clamp-2 ${textAlignClass}`}
                  style={{ fontFamily: 'var(--font-theme-heading)', color: textColor, fontSize: `${1 * fontSize}rem` }}
                >
                  {title}
                </p>
              </div>
            )}
          </button>
        </VerticalEmbedContainer>
        {showRetroControls && <RetroVideoControlBar title={title} />}
      </div>
    )
  }

  // Standard horizontal content (YouTube, Vimeo) - 16:9 aspect ratio
  if (isPlaying) {
    return (
      <div className="relative w-full flex flex-col">
        <div className="relative w-full aspect-video overflow-hidden bg-black">
          <iframe
            src={getEmbedUrl()}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || 'Video'}
          />
        </div>
        {showRetroControls && <RetroVideoControlBar title={title} />}
      </div>
    )
  }

  // Thumbnail view with play button
  return (
    <div className="relative w-full flex flex-col">
      <button
        onClick={() => setIsPlaying(true)}
        className="relative w-full aspect-video overflow-hidden bg-muted group cursor-pointer block"
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

        {/* Title overlay (optional) - hide when retro controls shown */}
        {title && !showRetroControls && (
          <div className={`absolute inset-x-0 ${verticalPositionClass} from-black/70 via-black/20 to-transparent p-4`}>
            <p
              className={`font-medium drop-shadow-sm line-clamp-2 ${textAlignClass}`}
              style={{ fontFamily: 'var(--font-theme-heading)', color: textColor, fontSize: `${1 * fontSize}rem` }}
            >
              {title}
            </p>
          </div>
        )}
      </button>
      {showRetroControls && <RetroVideoControlBar title={title} />}
    </div>
  )
}
