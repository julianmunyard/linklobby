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

interface ClassifiedLayoutProps {
  title: string
  cards: Card[]
  isPreview?: boolean
  onCardClick?: (cardId: string) => void
  selectedCardId?: string | null
}

/**
 * Classified Document Layout - Renders cards as a WWII military classified document
 *
 * Features:
 * - Pink/salmon A4-style paper
 * - Red "CLASSIFIED" rubber stamps (top and bottom)
 * - Red WAR DEPARTMENT / CLASSIFIED MESSAGE CENTER header
 * - Purple-blue typewriter text (Special Elite font)
 * - Three punch holes at top
 * - Centered link items
 * - Document metadata (date, time, reference number)
 */
export function ClassifiedLayout({
  title,
  cards,
  isPreview = false,
  onCardClick,
  selectedCardId
}: ClassifiedLayoutProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0)
  const [completedReleases, setCompletedReleases] = useState<Set<string>>(new Set())
  const headingSize = useThemeStore((s) => s.fonts.headingSize)
  const bodySize = useThemeStore((s) => s.fonts.bodySize)
  const classifiedStampText = useThemeStore((s) => s.classifiedStampText)
  const classifiedDeptText = useThemeStore((s) => s.classifiedDeptText)
  const classifiedCenterText = useThemeStore((s) => s.classifiedCenterText)
  const classifiedMessageText = useThemeStore((s) => s.classifiedMessageText)
  const containerRef = useRef<HTMLDivElement>(null)

  // Profile data
  const displayName = useProfileStore((s) => s.displayName)
  const socialIcons = useProfileStore((s) => s.socialIcons)
  const showSocialIcons = useProfileStore((s) => s.showSocialIcons)

  // Filter release cards separately
  const releaseCards = cards.filter(c => {
    if (c.is_visible === false || c.card_type !== 'release' || !isReleaseContent(c.content)) return false
    const content = c.content as ReleaseCardContent
    if (completedReleases.has(c.id)) return false
    if (content.releaseDate && content.afterCountdownAction === 'hide') {
      const isReleased = new Date(content.releaseDate) <= new Date()
      if (isReleased) return false
    }
    return true
  })

  // Filter to only visible cards, exclude social-icons and release cards
  const visibleCards = sortCardsBySortKey(
    cards.filter(c =>
      c.is_visible !== false &&
      c.card_type !== 'social-icons' &&
      c.card_type !== 'release'
    )
  )

  // Font sizes
  const titleFontSize = `${(headingSize || 1.6)}rem`
  const linkSize = `${(bodySize || 1.1)}rem`

  // Use stable values to avoid hydration mismatch
  const [docData, setDocData] = useState({
    refNumber: '000000',
    date: '00/00/0000',
    time: '00:00'
  })

  // Generate document data on client only
  useEffect(() => {
    const now = new Date()
    setDocData({
      refNumber: `CM-IN-${Math.floor(Math.random() * 9000 + 1000)}`,
      date: now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      time: now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    })
  }, [])

  // Focus container on mount for keyboard nav
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

  // Countdown renderer for release cards
  const classifiedCountdownRenderer = ({ days, hours, minutes, seconds, completed }: CountdownRenderProps) => {
    if (completed) return null
    return (
      <div className="text-sm font-mono tabular-nums tracking-wider">
        {days > 0 ? `${days}D ` : ''}{String(hours).padStart(2, '0')}H {String(minutes).padStart(2, '0')}M {String(seconds).padStart(2, '0')}S
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full z-10 overflow-x-hidden overflow-y-auto"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Classified document paper */}
      <div className="flex justify-center py-8 px-4">
        <div
          className="classified-paper relative"
          style={{
            backgroundColor: 'var(--theme-card-bg)',
            color: 'var(--theme-text)',
            fontFamily: 'var(--font-special-elite)',
          }}
        >
          {/* Punch holes - above texture overlay */}
          <div className="flex justify-around px-12 pt-4 pb-2 relative" style={{ zIndex: 10000 }}>
            <div className="classified-punch-hole" />
            <div className="classified-punch-hole" />
            <div className="classified-punch-hole" />
          </div>

          {/* Top stamp */}
          <div className="text-center mt-2 mb-4">
            <span
              className="classified-stamp"
              style={{ transform: 'rotate(-3deg)', display: 'inline-block' }}
            >
              {classifiedStampText || 'SECRET'}
            </span>
          </div>

          {/* Document content */}
          <div className="classified-content">
            {/* Header */}
            <div className="classified-header-text text-center mb-4" style={{ color: 'var(--theme-accent)' }}>
              <div className="text-xs uppercase tracking-[0.3em] mb-1">{classifiedDeptText || 'War Department'}</div>
              <div className="text-sm uppercase tracking-[0.2em] font-bold mb-1">{classifiedCenterText || 'Classified Message Center'}</div>
              <div
                className="uppercase tracking-[0.15em]"
                style={{ fontSize: titleFontSize }}
              >
                {classifiedMessageText || 'Incoming Message'}
              </div>
            </div>

            {/* Horizontal rule */}
            <div className="my-3" style={{ borderTop: '1px solid var(--theme-accent)', opacity: 0.6 }} />

            {/* Document metadata */}
            <div className="text-xs mb-4 space-y-1" style={{ fontSize: `${(bodySize || 1.1) * 0.7}rem` }}>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{docData.date}</span>
              </div>
              <div className="flex justify-between">
                <span>TIME:</span>
                <span>{docData.time}</span>
              </div>
              <div className="flex justify-between">
                <span>REF NO:</span>
                <span>{docData.refNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>CLASSIFICATION:</span>
                <span style={{ color: 'var(--theme-accent)' }}>SECRET</span>
              </div>
            </div>

            {/* Divider */}
            <div className="classified-divider">{'-'.repeat(80)}</div>

            {/* Title / Subject line */}
            <div className="text-center my-4">
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--theme-accent)' }}>Subject:</div>
              <div
                className="uppercase tracking-wide"
                style={{
                  color: 'var(--theme-accent)',
                  fontSize: `${(headingSize || 1.6) * 0.9}rem`,
                }}
              >
                {title || 'SECRET'}
              </div>
            </div>

            {/* Divider */}
            <div className="classified-divider">{'-'.repeat(80)}</div>

            {/* Links as centered items */}
            <div className="my-6 space-y-3">
              {visibleCards.map((card, index) => {
                const displayText = card.title || card.card_type

                // Text cards render as section markers
                if (card.card_type === 'text') {
                  return (
                    <div key={card.id} className="text-center py-2 text-sm uppercase tracking-widest" style={{ color: 'var(--theme-accent)' }}>
                      --- {displayText.toUpperCase()} ---
                    </div>
                  )
                }

                // Audio cards render the full player inline
                if (card.card_type === 'audio' && isAudioContent(card.content)) {
                  const audioContent = card.content as AudioCardContent
                  return (
                    <div key={card.id} onClick={() => onCardClick?.(card.id)}>
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

                return (
                  <button
                    key={card.id}
                    className={cn(
                      "classified-item w-full text-center py-2 px-4 cursor-pointer focus:outline-none uppercase tracking-wide",
                      focusedIndex === index && selectedCardId === card.id && "classified-item-selected"
                    )}
                    style={{ fontSize: linkSize }}
                    onClick={() => handleCardClick(card, index)}
                  >
                    {displayText}
                  </button>
                )
              })}
            </div>

            {/* Release section */}
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
                <div key={card.id}>
                  <div className="classified-divider">{'-'.repeat(80)}</div>
                  <div className="my-4 text-center">
                    <div className="text-sm uppercase tracking-widest mb-2" style={{ color: 'var(--theme-accent)' }}>
                      {isReleased && afterCountdownAction === 'custom' ? '// NEW RELEASE //' : '// UPCOMING RELEASE //'}
                    </div>

                    {!isReleased && (
                      <>
                        {releaseTitle && <div className="text-xs uppercase">{releaseTitle}</div>}
                        {artistName && <div className="text-xs uppercase">{artistName}</div>}
                      </>
                    )}

                    {!isReleased && releaseDate && (
                      <div className="my-2">
                        <div className="text-xs mb-1 uppercase">Drops in:</div>
                        <Countdown
                          date={new Date(releaseDate)}
                          renderer={classifiedCountdownRenderer}
                          onComplete={() => {
                            if (afterCountdownAction === 'hide') {
                              setCompletedReleases(prev => new Set(prev).add(card.id))
                            }
                          }}
                        />
                      </div>
                    )}

                    {!isReleased && preSaveUrl && (
                      <button
                        className="text-sm mt-2 underline uppercase tracking-wide"
                        onClick={() => {
                          if (!isPreview) {
                            window.open(preSaveUrl, '_blank', 'noopener,noreferrer')
                          }
                        }}
                      >
                        [{preSaveButtonText.toUpperCase()}]
                      </button>
                    )}

                    {isReleased && afterCountdownAction === 'custom' && (
                      afterCountdownUrl ? (
                        <button
                          className="text-sm mt-2 underline uppercase tracking-wide"
                          onClick={() => {
                            if (!isPreview) {
                              window.open(afterCountdownUrl, '_blank', 'noopener,noreferrer')
                            }
                          }}
                        >
                          [{(afterCountdownText || 'LISTEN NOW').toUpperCase()}]
                        </button>
                      ) : (
                        <div className="text-sm mt-2 uppercase tracking-wide">[{(afterCountdownText || 'OUT NOW').toUpperCase()}]</div>
                      )
                    )}
                  </div>
                </div>
              )
            })}

            <div className="classified-divider">{'-'.repeat(80)}</div>

            {/* Social Icons */}
            {showSocialIcons && socialIcons.length > 0 && (
              <div className="flex justify-center flex-wrap gap-4 my-4">
                {socialIcons.map((icon) => {
                  const IconComponent = PLATFORM_ICONS[icon.platform]
                  if (!IconComponent) return null
                  return (
                    <a
                      key={icon.id}
                      href={icon.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-80 hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            )}

            {/* Bottom stamp */}
            <div className="text-center mt-6 mb-2">
              <span
                className="classified-stamp"
                style={{ transform: 'rotate(2deg)', display: 'inline-block' }}
              >
                {classifiedStampText || 'SECRET'}
              </span>
            </div>

            {/* Footer */}
            <div className="text-center text-xs uppercase tracking-[0.2em] mt-4 opacity-70" style={{ color: 'var(--theme-accent)' }}>
              End of Message
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
