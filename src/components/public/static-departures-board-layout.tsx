'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import type { Card, ReleaseCardContent } from '@/types/card'
import { isReleaseContent, isAudioContent } from '@/types/card'
import type { AudioCardContent } from '@/types/audio'
import { AudioPlayer } from '@/components/audio/audio-player'
import type { SocialIcon, SocialPlatform } from '@/types/profile'
import { cn } from '@/lib/utils'
import { sortCardsBySortKey } from '@/lib/ordering'
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

interface StaticDeparturesBoardLayoutProps {
  username: string
  title: string
  cards: Card[]
  headingSize?: number
  bodySize?: number
  socialIcons?: SocialIcon[]
  showSocialIcons?: boolean
}

/**
 * Static Departures Board Layout for public pages
 * Client component for interactivity (keyboard navigation, countdown)
 */
export function StaticDeparturesBoardLayout({
  username,
  title,
  cards,
  headingSize = 1.6,
  bodySize = 1.0,
  socialIcons = [],
  showSocialIcons = true,
}: StaticDeparturesBoardLayoutProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0)
  const [completedReleases, setCompletedReleases] = useState<Set<string>>(new Set())
  const [isMounted, setIsMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Only render countdown after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

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
  const titleFontSize = `${headingSize}rem`

  // Use stable values to avoid hydration mismatch
  const [boardData, setBoardData] = useState({
    terminalNumber: 'T1',
    currentTime: '00:00'
  })

  // Generate board data on client only
  useEffect(() => {
    const now = new Date()
    setBoardData({
      terminalNumber: `T${Math.floor(Math.random() * 5) + 1}`,
      currentTime: now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
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
      if (card.url) {
        window.open(card.url, '_blank', 'noopener,noreferrer')
      }
    }
  }

  const handleCardClick = (card: Card, index: number) => {
    setFocusedIndex(index)
    if (card.url) {
      window.open(card.url, '_blank', 'noopener,noreferrer')
    }
  }

  // Countdown renderer for release cards
  const departuresCountdownRenderer = ({ days, hours, minutes, seconds, completed }: CountdownRenderProps) => {
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
      style={{ backgroundColor: '#000000' }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Departures board container */}
      <div className="flex justify-center py-6 px-4">
        <div
          className="departures-board-container"
          style={{
            backgroundColor: 'var(--theme-card-bg)',
            color: 'var(--theme-text)',
            fontFamily: 'var(--font-aux-mono)',
          }}
        >
          {/* Board header */}
          <div className="departures-board-header">
            <div className="text-xs tracking-[0.3em] uppercase opacity-60">TERMINAL {boardData.terminalNumber}</div>
            <div className="text-2xl tracking-[0.2em] uppercase font-bold" style={{ fontSize: titleFontSize }}>
              {title || 'DEPARTURES'}
            </div>
            <div className="text-xs tracking-widest uppercase opacity-60">{boardData.currentTime} LOCAL TIME</div>
          </div>

          {/* Column header row */}
          <div className="departures-board-columns">
            <span className="w-16">TIME</span>
            <span className="flex-1">DESTINATION</span>
            <span className="w-20 text-right">GATE</span>
            <span className="w-24 text-right">REMARKS</span>
          </div>

          {/* Card rendering */}
          <div className="departures-board-content">
            {visibleCards.map((card, index) => {
              const displayText = card.title || card.card_type

              // Text cards render as section dividers
              if (card.card_type === 'text') {
                return (
                  <div key={card.id} className="departures-board-section" style={{ color: 'var(--theme-accent)' }}>
                    {displayText.toUpperCase()}
                  </div>
                )
              }

              // Audio cards render the full player inline
              if (card.card_type === 'audio' && isAudioContent(card.content)) {
                const audioContent = card.content as AudioCardContent
                return (
                  <div key={card.id} className="px-4 py-3" data-card-id={card.id}>
                    <AudioPlayer
                      tracks={audioContent.tracks || []}
                      albumArtUrl={audioContent.albumArtUrl}
                      showWaveform={audioContent.showWaveform ?? true}
                      looping={audioContent.looping ?? false}
                      reverbConfig={audioContent.reverbConfig}
                      playerColors={audioContent.playerColors}
                      cardId={card.id}
                      pageId={card.page_id}
                      themeVariant="classified"
                    />
                  </div>
                )
              }

              // Generate flight row data
              const generatedTime = `${String(6 + Math.floor(index * 0.5)).padStart(2, '0')}:${index % 2 === 0 ? '00' : '30'}`
              const generatedGate = `${String.fromCharCode(65 + (index % 4))}${index + 1}`

              return (
                <button
                  key={card.id}
                  className={cn(
                    "departures-board-row",
                    focusedIndex === index && "bg-white/5"
                  )}
                  onClick={() => handleCardClick(card, index)}
                  data-card-id={card.id}
                >
                  <span className="w-16 text-xs opacity-60">{generatedTime}</span>
                  <span className="flex-1 uppercase truncate">{displayText}</span>
                  <span className="w-20 text-right text-xs opacity-60">{generatedGate}</span>
                  <span className="w-24 text-right text-xs" style={{ color: 'var(--theme-accent)' }}>ON TIME</span>
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
                <div className="departures-board-divider" />
                <div className="px-6 py-4 text-center">
                  <div className="text-sm uppercase tracking-widest mb-2" style={{ color: 'var(--theme-accent)' }}>
                    {isReleased && afterCountdownAction === 'custom' ? 'NOW BOARDING' : 'PRE-BOARDING'}
                  </div>

                  {!isReleased && (
                    <>
                      {releaseTitle && <div className="text-xs uppercase">{releaseTitle}</div>}
                      {artistName && <div className="text-xs uppercase">{artistName}</div>}
                    </>
                  )}

                  {!isReleased && releaseDate && isMounted && (
                    <div className="my-2">
                      <div className="text-xs mb-1 uppercase">Departure in:</div>
                      <Countdown
                        date={new Date(releaseDate)}
                        renderer={departuresCountdownRenderer}
                        onComplete={() => {
                          if (afterCountdownAction === 'hide') {
                            setCompletedReleases(prev => new Set(prev).add(card.id))
                          }
                        }}
                      />
                    </div>
                  )}

                  {!isReleased && preSaveUrl && (
                    <a
                      href={preSaveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm mt-2 underline uppercase tracking-wide inline-block"
                    >
                      {preSaveButtonText.toUpperCase()}
                    </a>
                  )}

                  {isReleased && afterCountdownAction === 'custom' && (
                    afterCountdownUrl ? (
                      <a
                        href={afterCountdownUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm mt-2 underline uppercase tracking-wide inline-block"
                      >
                        {(afterCountdownText || 'LISTEN NOW').toUpperCase()}
                      </a>
                    ) : (
                      <div className="text-sm mt-2 uppercase tracking-wide">{(afterCountdownText || 'OUT NOW').toUpperCase()}</div>
                    )
                  )}
                </div>
              </div>
            )
          })}

          {/* Social Icons */}
          {showSocialIcons && socialIcons.length > 0 && (
            <>
              <div className="departures-board-divider" />
              <div className="flex justify-center flex-wrap gap-4 px-6 py-4">
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
                      <IconComponent className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="text-center text-xs uppercase tracking-[0.3em] py-4 opacity-30">
            Information Subject to Change
          </div>

          {/* Legal footer */}
          <div className="text-center text-xs py-4 space-x-3" style={{ color: 'var(--theme-text)', opacity: 0.3 }}>
            <Link href={`/privacy?username=${username}`} className="hover:underline">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <span>•</span>
            <span>Powered by LinkLobby</span>
          </div>
        </div>
      </div>
    </div>
  )
}
