'use client'

import { useState, useRef, useEffect } from 'react'
import type { Card, ReleaseCardContent } from '@/types/card'
import { isReleaseContent } from '@/types/card'
import type { SocialPlatform } from '@/types/profile'
import { isAudioContent } from '@/types/card'
import type { AudioCardContent } from '@/types/audio'
import { AudioPlayer } from '@/components/audio/audio-player'
import { cn } from '@/lib/utils'
import { sortCardsBySortKey } from '@/lib/ordering'
import { useThemeStore } from '@/stores/theme-store'
import { useProfileStore } from '@/stores/profile-store'
import { Globe, Mail, Music } from 'lucide-react'
import {
  SiInstagram, SiTiktok, SiYoutube, SiSpotify, SiX,
  SiSoundcloud, SiApplemusic, SiBandcamp, SiAmazonmusic,
  SiFacebook, SiThreads, SiBluesky, SiSnapchat, SiPinterest, SiLinkedin, SiWhatsapp,
  SiTwitch, SiKick, SiDiscord,
  SiPatreon, SiVenmo, SiCashapp, SiPaypal
} from 'react-icons/si'
import type { ComponentType } from 'react'
import Countdown, { CountdownRenderProps } from 'react-countdown'

type IconComponent = ComponentType<{ className?: string }>

const PLATFORM_ICONS: Record<SocialPlatform, IconComponent> = {
  instagram: SiInstagram,
  tiktok: SiTiktok,
  youtube: SiYoutube,
  spotify: SiSpotify,
  twitter: SiX,
  soundcloud: SiSoundcloud,
  applemusic: SiApplemusic,
  bandcamp: SiBandcamp,
  deezer: Music,
  amazonmusic: SiAmazonmusic,
  facebook: SiFacebook,
  threads: SiThreads,
  bluesky: SiBluesky,
  snapchat: SiSnapchat,
  pinterest: SiPinterest,
  linkedin: SiLinkedin,
  whatsapp: SiWhatsapp,
  twitch: SiTwitch,
  kick: SiKick,
  discord: SiDiscord,
  website: Globe,
  email: Mail,
  patreon: SiPatreon,
  venmo: SiVenmo,
  cashapp: SiCashapp,
  paypal: SiPaypal,
}

interface DeparturesBoardLayoutProps {
  title: string
  cards: Card[]
  isPreview?: boolean
  onCardClick?: (cardId: string) => void
  selectedCardId?: string | null
}

export function DeparturesBoardLayout({
  title,
  cards,
  isPreview = false,
  onCardClick,
  selectedCardId
}: DeparturesBoardLayoutProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0)
  const [completedReleases, setCompletedReleases] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  const displayName = useProfileStore((s) => s.displayName)
  const socialIcons = useProfileStore((s) => s.socialIcons)
  const showSocialIcons = useProfileStore((s) => s.showSocialIcons)

  // Release cards
  const releaseCards = cards.filter(c => {
    if (c.is_visible === false || c.card_type !== 'release' || !isReleaseContent(c.content)) return false
    const content = c.content as ReleaseCardContent
    if (completedReleases.has(c.id)) return false
    if (content.releaseDate && content.afterCountdownAction === 'hide') {
      if (new Date(content.releaseDate) <= new Date()) return false
    }
    return true
  })

  // Visible cards (exclude social-icons and release)
  const visibleCards = sortCardsBySortKey(
    cards.filter(c =>
      c.is_visible !== false &&
      c.card_type !== 'social-icons' &&
      c.card_type !== 'release'
    )
  )

  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex(prev => Math.min(prev + 1, visibleCards.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && visibleCards[focusedIndex]) {
      e.preventDefault()
      const card = visibleCards[focusedIndex]
      if (card.url && !isPreview) {
        window.open(card.url, '_blank', 'noopener,noreferrer')
      } else if (onCardClick) {
        onCardClick(card.id)
      }
    }
  }

  const handleCardClick = (card: Card, index: number) => {
    setFocusedIndex(index)
    if (card.url && !isPreview) {
      window.open(card.url, '_blank', 'noopener,noreferrer')
    } else if (onCardClick) {
      onCardClick(card.id)
    }
  }

  const countdownRenderer = ({ days, hours, minutes, seconds, completed }: CountdownRenderProps) => {
    if (completed) return null
    return (
      <span className="tabular-nums tracking-wider">
        {days > 0 ? `${days}D ` : ''}{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    )
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full z-10 overflow-x-hidden overflow-y-auto"
      style={{ backgroundColor: 'var(--theme-background)' }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        className="departures-board-rows"
        style={{
          color: 'var(--theme-text)',
          fontFamily: 'var(--font-aux-mono)',
        }}
      >
        {/* Blank top row */}
        <div className="departures-board-row departures-board-row-blank">&nbsp;</div>

        {/* Artist title row */}
        <div className="departures-board-row departures-board-row-title">
          {displayName || title || 'DEPARTURES'}
        </div>

        {/* Spare blank row */}
        <div className="departures-board-row departures-board-row-blank">&nbsp;</div>

        {/* Link rows */}
        {visibleCards.map((card, index) => {
          const displayText = card.title || card.card_type

          // Text cards as section labels
          if (card.card_type === 'text') {
            return (
              <div
                key={card.id}
                className="departures-board-row departures-board-row-section"
                style={{ color: 'var(--theme-accent)' }}
              >
                {displayText.toUpperCase()}
              </div>
            )
          }

          // Audio cards inline
          if (card.card_type === 'audio' && isAudioContent(card.content)) {
            const audioContent = card.content as AudioCardContent
            return (
              <div key={card.id} className="departures-board-row departures-board-row-audio" onClick={() => onCardClick?.(card.id)}>
                <AudioPlayer
                  tracks={audioContent.tracks || []}
                  albumArtUrl={audioContent.albumArtUrl}
                  showWaveform={audioContent.showWaveform ?? true}
                  looping={audioContent.looping ?? false}
                  reverbConfig={audioContent.reverbConfig}
                  playerColors={audioContent.playerColors}
                  cardId={card.id}
                  pageId={card.page_id}
                  isEditing={isPreview}
                  themeVariant="classified"
                />
              </div>
            )
          }

          // Standard link row
          return (
            <button
              key={card.id}
              className={cn(
                "departures-board-row departures-board-row-link",
                focusedIndex === index && selectedCardId === card.id && "departures-board-row-focused"
              )}
              onClick={() => handleCardClick(card, index)}
            >
              {displayText.toUpperCase()}
            </button>
          )
        })}

        {/* Release cards */}
        {releaseCards.map((card) => {
          if (!isReleaseContent(card.content)) return null
          const content = card.content as ReleaseCardContent
          const {
            releaseTitle,
            artistName,
            releaseDate,
            preSaveUrl,
            preSaveButtonText = 'PRE-SAVE',
            afterCountdownAction = 'custom',
            afterCountdownText = 'OUT NOW',
            afterCountdownUrl
          } = content

          const isReleased = releaseDate ? new Date(releaseDate) <= new Date() : false

          return (
            <div key={card.id} className="departures-board-row departures-board-row-release">
              {!isReleased ? (
                <div className="flex items-center justify-between w-full">
                  <span className="uppercase truncate">
                    {releaseTitle || artistName || 'NEW RELEASE'}
                  </span>
                  <span className="flex items-center gap-4 shrink-0">
                    {releaseDate && (
                      <Countdown
                        date={new Date(releaseDate)}
                        renderer={countdownRenderer}
                        onComplete={() => {
                          if (afterCountdownAction === 'hide') {
                            setCompletedReleases(prev => new Set(prev).add(card.id))
                          }
                        }}
                      />
                    )}
                    {preSaveUrl && (
                      <button
                        className="underline uppercase text-sm shrink-0"
                        style={{ color: 'var(--theme-accent)' }}
                        onClick={() => {
                          if (!isPreview) window.open(preSaveUrl, '_blank', 'noopener,noreferrer')
                        }}
                      >
                        {preSaveButtonText.toUpperCase()}
                      </button>
                    )}
                  </span>
                </div>
              ) : afterCountdownAction === 'custom' ? (
                <button
                  className="uppercase w-full text-left"
                  onClick={() => {
                    if (!isPreview && afterCountdownUrl) window.open(afterCountdownUrl, '_blank', 'noopener,noreferrer')
                  }}
                >
                  {(afterCountdownText || 'OUT NOW').toUpperCase()}
                </button>
              ) : null}
            </div>
          )
        })}

        {/* Social icons row */}
        {showSocialIcons && socialIcons.length > 0 && (
          <div className="departures-board-row departures-board-row-socials">
            {socialIcons.map((icon) => {
              const IconComponent = PLATFORM_ICONS[icon.platform]
              if (!IconComponent) return null
              return (
                <a
                  key={icon.id}
                  href={icon.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-60 hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconComponent className="w-4 h-4" />
                </a>
              )
            })}
          </div>
        )}

        {/* Fill remaining space with blank rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`blank-${i}`} className="departures-board-row departures-board-row-blank">&nbsp;</div>
        ))}
      </div>
    </div>
  )
}
