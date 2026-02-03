// src/components/cards/music-card.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Music, Play } from 'lucide-react'
import { SiSpotify, SiApplemusic, SiSoundcloud, SiBandcamp, SiAudiomack } from 'react-icons/si'
import { useThemeStore } from '@/stores/theme-store'
import { getEmbedUrl } from '@/lib/platform-embed'
import type { Card, MusicCardContent, MusicPlatform } from '@/types/card'
import { isMusicContent } from '@/types/card'

// Platform icon mapping
const PLATFORM_ICONS: Record<MusicPlatform, React.ComponentType<{ className?: string }>> = {
  spotify: SiSpotify,
  'apple-music': SiApplemusic,
  soundcloud: SiSoundcloud,
  bandcamp: SiBandcamp,
  audiomack: SiAudiomack,
}

// Platform colors for accents
const PLATFORM_COLORS: Record<MusicPlatform, string> = {
  spotify: '#1DB954',
  'apple-music': '#FA243C',
  soundcloud: '#FF5500',
  bandcamp: '#629AA9',
  audiomack: '#FFA500',
}

// Embed heights per platform (Spotify compact=152, full=352, etc)
const EMBED_HEIGHTS: Record<MusicPlatform, number> = {
  spotify: 352,
  'apple-music': 175,  // Apple Music album embed height
  soundcloud: 166,     // Single track height
  bandcamp: 120,       // Slim player
  audiomack: 252,      // Standard height
}

interface MusicCardProps {
  card: Card
  isPreview?: boolean
}

export function MusicCard({ card, isPreview = false }: MusicCardProps) {
  const themeId = useThemeStore((state) => state.themeId)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loadError, setLoadError] = useState(false)

  // Type guard for content
  if (!isMusicContent(card.content)) {
    return <MusicCardPlaceholder />
  }

  const content = card.content as MusicCardContent
  const { platform, embedUrl, embedIframeUrl, thumbnailUrl, title } = content

  // No platform/URL configured yet
  if (!platform || !embedUrl) {
    return <MusicCardPlaceholder />
  }

  const PlatformIcon = PLATFORM_ICONS[platform]
  const platformColor = PLATFORM_COLORS[platform]
  const embedHeight = EMBED_HEIGHTS[platform]

  // Get iframe URL
  const iframeUrl = embedIframeUrl || getEmbedUrl(embedUrl, platform)

  // Error state
  if (loadError) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden bg-muted flex flex-col items-center justify-center p-6 text-center"
           style={{ minHeight: embedHeight }}>
        <span style={{ color: platformColor }}>
          <PlatformIcon className="h-10 w-10 mb-3" />
        </span>
        <p className="text-sm text-muted-foreground mb-2">Content unavailable</p>
        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          Open on {platform.replace('-', ' ')}
        </a>
      </div>
    )
  }

  // Click-to-load pattern (performance optimization)
  if (!isPlaying) {
    return (
      <button
        onClick={() => setIsPlaying(true)}
        className="relative w-full rounded-xl overflow-hidden bg-muted group cursor-pointer block"
        style={{ minHeight: embedHeight }}
        aria-label={`Play ${title || 'music'} on ${platform}`}
      >
        {/* Thumbnail or gradient background */}
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title || 'Music thumbnail'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${platformColor}20 0%, ${platformColor}05 100%)`
            }}
          />
        )}

        {/* Platform icon + play button */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ color: platformColor }} className="opacity-60">
            <PlatformIcon className="h-12 w-12 mb-3" />
          </span>
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-transform group-hover:scale-110 border border-white/20">
            <Play className="h-5 w-5 text-white ml-0.5" fill="currentColor" />
          </div>
          {title && (
            <p className="mt-3 text-sm text-white/80 max-w-[80%] truncate">
              {title}
            </p>
          )}
        </div>
      </button>
    )
  }

  // Active embed
  return (
    <div className="relative w-full rounded-xl overflow-hidden">
      <iframe
        src={iframeUrl}
        width="100%"
        height={embedHeight}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        onError={() => setLoadError(true)}
        title={title || `${platform} embed`}
        style={{ borderRadius: 'inherit' }}
      />
    </div>
  )
}

// Placeholder when no music configured
function MusicCardPlaceholder() {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <Music className="h-12 w-12 mx-auto mb-2" />
        <p>Add music URL</p>
        <p className="text-xs mt-1">Spotify, Apple Music, SoundCloud, Bandcamp, Audiomack</p>
      </div>
    </div>
  )
}
