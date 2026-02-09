'use client'

import { useState } from 'react'
import type { Card, ReleaseCardContent } from '@/types/card'
import { isReleaseContent, isAudioContent } from '@/types/card'
import type { AudioCardContent } from '@/types/audio'
import { sortCardsBySortKey } from '@/lib/ordering'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import Countdown, { CountdownRenderProps } from 'react-countdown'

interface LanyardCardViewsProps {
  cards: Card[]
  activeView: number
  onViewChange: (view: number) => void
  title: string
  avatarUrl?: string | null
  isPreview?: boolean
  onCardClick?: (cardId: string) => void
}

/**
 * Swipeable card views rendered on the 3D lanyard badge.
 * 5 views: links list, video card, photo card, audio player, presave card.
 */
export function LanyardCardViews({
  cards,
  activeView,
  onViewChange,
  title,
  avatarUrl,
  isPreview = false,
  onCardClick,
}: LanyardCardViewsProps) {
  // Filter and sort visible cards
  const visibleCards = sortCardsBySortKey(
    cards.filter(c =>
      c.is_visible !== false &&
      c.card_type !== 'social-icons' &&
      c.card_type !== 'release' &&
      c.card_type !== 'text'
    )
  )

  // Find first video card
  const videoCard = cards.find(c => c.card_type === 'video' && c.is_visible !== false)
  const videoUrl = ((videoCard?.content as any)?.url || (videoCard?.content as any)?.embedUrl) as string | undefined

  // Find first image card (hero, square, gallery with images)
  const imageCard = cards.find(c => {
    if (c.is_visible === false) return false
    if (c.card_type === 'hero' || c.card_type === 'square') {
      return !!(c.content as any)?.imageUrl
    }
    if (c.card_type === 'gallery' && (c.content as any)?.images) {
      return ((c.content as any).images as any[]).length > 0
    }
    return false
  })
  const imageUrl = imageCard?.card_type === 'gallery'
    ? ((imageCard.content as any)?.images?.[0] as any)?.url as string | undefined
    : (imageCard?.content as any)?.imageUrl as string | undefined

  // Find first audio card
  const audioCard = cards.find(c => c.card_type === 'audio' && c.is_visible !== false)

  // Find first release card
  const releaseCard = cards.find(c => c.card_type === 'release' && c.is_visible !== false)

  // Take up to 6 links (portrait has more vertical space)
  const linksToShow = visibleCards.slice(0, 6)

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeView > 0) {
      onViewChange(activeView - 1)
    }
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeView < 4) {
      onViewChange(activeView + 1)
    }
  }

  const handleLinkClick = (card: Card) => (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onCardClick) {
      onCardClick(card.id)
    } else if ((card.content as any)?.url && !isPreview) {
      window.open((card.content as any).url, '_blank')
    }
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: '300px',
        height: '420px',
        backgroundColor: 'var(--theme-card-bg)',
        color: 'var(--theme-text)',
        fontFamily: 'var(--font-ticket-de-caisse)',
        borderRadius: '8px',
      }}
    >
      {/* Paper texture pseudo-elements */}
      <div className="lanyard-badge-card absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col" style={{ mixBlendMode: 'multiply', opacity: 0.9 }}>
        {/* View content takes flex-1 */}
        <div className="flex-1 overflow-hidden px-4 pt-4 pb-2">
          {activeView === 0 && (
            <LinksView
              title={title}
              links={linksToShow}
              onLinkClick={handleLinkClick}
            />
          )}
          {activeView === 1 && (
            <VideoView videoUrl={videoUrl} />
          )}
          {activeView === 2 && (
            <PhotoView imageUrl={imageUrl} />
          )}
          {activeView === 3 && (
            <AudioView audioCard={audioCard} />
          )}
          {activeView === 4 && (
            <ReleaseView releaseCard={releaseCard} />
          )}
        </div>

        {/* Navigation - fixed at bottom */}
        <div className="flex items-center justify-center gap-2 pb-3 px-4">
          <button
            onClick={handlePrev}
            disabled={activeView === 0}
            className="lanyard-nav-btn"
          >
            <ChevronLeft size={14} />
          </button>

          {/* 5 dots */}
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i === activeView ? 'bg-current' : 'border border-current opacity-40'
              }`}
            />
          ))}

          <button
            onClick={handleNext}
            disabled={activeView === 4}
            className="lanyard-nav-btn"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// View 0: Links List
function LinksView({
  title,
  links,
  onLinkClick,
}: {
  title: string
  links: Card[]
  onLinkClick: (card: Card) => (e: React.MouseEvent) => void
}) {
  return (
    <div className="h-full flex flex-col">
      <h2
        className="uppercase tracking-wider mb-4 text-center"
        style={{
          fontFamily: 'var(--font-hypermarket)',
          fontSize: '1.3rem',
          fontWeight: 'normal',
        }}
      >
        {title}
      </h2>
      <div className="flex-1 flex flex-col justify-start gap-2.5">
        {links.length === 0 ? (
          <div className="text-center text-sm opacity-50 mt-4">NO LINKS</div>
        ) : (
          links.map(card => (
            <button
              key={card.id}
              onClick={onLinkClick(card)}
              className="text-left hover:opacity-70 transition-opacity w-full"
              style={{ fontSize: '0.95rem' }}
            >
              <div className="flex items-center justify-between border-b border-current/10 pb-2">
                <span className="truncate pr-2">
                  {(card.content as any)?.title || (card.content as any)?.name || 'Link'}
                </span>
                <span className="opacity-50">{'>'}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

// View 1: Video Card
function VideoView({ videoUrl }: { videoUrl?: string }) {
  if (!videoUrl) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-sm opacity-50">NO VIDEO</div>
      </div>
    )
  }

  // Extract video thumbnail (simple approach - would need actual oEmbed data in production)
  const getThumbnail = () => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)?.[1]
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null
    }
    return null
  }

  const thumbnail = getThumbnail()

  return (
    <div className="h-full flex items-center justify-center relative">
      {thumbnail ? (
        <>
          <img
            src={thumbnail}
            alt="Video"
            className="w-full h-full object-cover"
            style={{ borderRadius: '4px' }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
              <Play size={24} className="text-black ml-1" />
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-sm">VIDEO</div>
      )}
    </div>
  )
}

// View 2: Photo Card
function PhotoView({ imageUrl }: { imageUrl?: string }) {
  if (!imageUrl) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-sm opacity-50">NO PHOTO</div>
      </div>
    )
  }

  return (
    <div className="h-full flex items-center justify-center p-2">
      <img
        src={imageUrl}
        alt="Photo"
        className="max-w-full max-h-full object-contain"
        style={{ borderRadius: '4px' }}
      />
    </div>
  )
}

// View 3: Audio Player
function AudioView({ audioCard }: { audioCard?: Card }) {
  if (!audioCard || !isAudioContent(audioCard.content)) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-sm opacity-50">NO AUDIO</div>
      </div>
    )
  }

  const content = audioCard.content as AudioCardContent
  const firstTrack = content.tracks?.[0]
  const albumArt = content.albumArtUrl || (firstTrack as any)?.albumArt

  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 px-3">
      {albumArt && (
        <div className="w-32 h-32 rounded overflow-hidden">
          <img
            src={albumArt}
            alt="Album art"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="text-center">
        <div className="font-bold text-base truncate max-w-full">
          {firstTrack?.title || 'Audio Track'}
        </div>
        {firstTrack?.artist && (
          <div className="text-sm opacity-70 truncate max-w-full">
            {firstTrack.artist}
          </div>
        )}
      </div>
      <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center opacity-70">
        <Play size={16} className="ml-0.5" />
      </div>
    </div>
  )
}

// View 4: Release/Presave Card
function ReleaseView({ releaseCard }: { releaseCard?: Card }) {
  if (!releaseCard || !isReleaseContent(releaseCard.content)) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-sm opacity-50">NO RELEASE</div>
      </div>
    )
  }

  const content = releaseCard.content as ReleaseCardContent

  const countdownRenderer = ({ days, hours, minutes, seconds, completed }: CountdownRenderProps) => {
    if (completed) {
      return <span className="text-lg font-bold">OUT NOW!</span>
    }
    return (
      <div className="text-center text-sm">
        <div className="font-mono">
          {days > 0 && `${days}d `}
          {hours}h {minutes}m {seconds}s
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 px-3">
      {content.albumArtUrl && (
        <div className="w-32 h-32 rounded overflow-hidden">
          <img
            src={content.albumArtUrl}
            alt="Album art"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="text-center">
        <div className="font-bold text-base truncate max-w-full">
          {content.releaseTitle || 'New Release'}
        </div>
        {content.artistName && (
          <div className="text-sm opacity-70 truncate max-w-full">
            {content.artistName}
          </div>
        )}
      </div>
      {content.releaseDate && new Date(content.releaseDate) > new Date() && (
        <Countdown
          date={new Date(content.releaseDate)}
          renderer={countdownRenderer}
        />
      )}
      {content.preSaveButtonText && (
        <div className="px-4 py-1.5 border border-current rounded text-sm">
          {content.preSaveButtonText}
        </div>
      )}
    </div>
  )
}
