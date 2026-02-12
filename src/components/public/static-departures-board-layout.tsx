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
  instagram: SiInstagram, tiktok: SiTiktok, youtube: SiYoutube, spotify: SiSpotify,
  twitter: SiX, soundcloud: SiSoundcloud, applemusic: SiApplemusic, bandcamp: SiBandcamp,
  deezer: Music, amazonmusic: SiAmazonmusic, facebook: SiFacebook, threads: SiThreads,
  bluesky: SiBluesky, snapchat: SiSnapchat, pinterest: SiPinterest, linkedin: SiLinkedin,
  whatsapp: SiWhatsapp, twitch: SiTwitch, kick: SiKick, discord: SiDiscord,
  website: Globe, email: Mail, patreon: SiPatreon, venmo: SiVenmo,
  cashapp: SiCashapp, paypal: SiPaypal,
}

function genTime(index: number): string {
  const hour = 6 + Math.floor(index * 0.5)
  const min = index % 2 === 0 ? '00' : '30'
  const suffix = hour >= 12 ? 'P' : 'A'
  const display = hour > 12 ? hour - 12 : hour
  return `${String(display).padStart(2, '0')}:${min}${suffix}`
}

// Render text as individual LED character cells
function renderLedCells(text: string): React.ReactNode {
  return (
    <span className="led-text">
      {text.split('').map((char, i) => (
        <span key={i} className="led-cell">{char === ' ' ? '\u00A0' : char}</span>
      ))}
    </span>
  )
}

interface StaticDeparturesBoardLayoutProps {
  username: string
  title: string
  cards: Card[]
  headingSize?: number
  bodySize?: number
  socialIcons?: SocialIcon[]
  showSocialIcons?: boolean
  isLed?: boolean
}

export function StaticDeparturesBoardLayout({
  username,
  title,
  cards,
  socialIcons = [],
  showSocialIcons = true,
  isLed = false,
}: StaticDeparturesBoardLayoutProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0)
  const [completedReleases, setCompletedReleases] = useState<Set<string>>(new Set())
  const [isMounted, setIsMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const t = (text: string) => isLed ? renderLedCells(text) : text

  useEffect(() => { setIsMounted(true) }, [])
  useEffect(() => { containerRef.current?.focus() }, [])

  const releaseCards = cards.filter(c => {
    if (c.is_visible === false || c.card_type !== 'release' || !isReleaseContent(c.content)) return false
    const content = c.content as ReleaseCardContent
    if (completedReleases.has(c.id)) return false
    if (content.releaseDate && content.afterCountdownAction === 'hide') {
      if (new Date(content.releaseDate) <= new Date()) return false
    }
    return true
  })

  const visibleCards = sortCardsBySortKey(
    cards.filter(c =>
      c.is_visible !== false &&
      c.card_type !== 'social-icons' &&
      c.card_type !== 'release'
    )
  )

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
      if (card.url) window.open(card.url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleCardClick = (card: Card, index: number) => {
    setFocusedIndex(index)
    if (card.url) window.open(card.url, '_blank', 'noopener,noreferrer')
  }

  const countdownRenderer = ({ days, hours, minutes, seconds, completed }: CountdownRenderProps) => {
    if (completed) return null
    return (
      <span className="tabular-nums">
        {days > 0 ? `${days}D ` : ''}{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
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
      <div className="flex justify-center items-center px-4 min-h-full">
        <div
          className="departures-board"
          style={{
            color: 'var(--theme-text)',
            fontFamily: 'var(--font-theme-body)',
          }}
        >
          {/* Title row */}
          <div className="departures-board-row departures-board-row-title">
            {t((title || 'DEPARTURES').toUpperCase())}
          </div>

          {/* Gap between title and content */}
          <div className="departures-board-row departures-board-row-blank">&nbsp;</div>

          {/* Column header row */}
          <div className="departures-board-row departures-board-row-header">
            <span className="departures-col-time">{t('TIME')}</span>
            <span className="departures-col-name">{t('TO')}</span>
            <span className="departures-col-info">{t('REMARKS')}</span>
          </div>

          {/* Card rows */}
          {visibleCards.map((card, index) => {
            const displayText = card.title || card.card_type

            if (card.card_type === 'text') {
              return (
                <div key={card.id} className="departures-board-row departures-board-row-section" data-card-id={card.id}>
                  {t(displayText.toUpperCase())}
                </div>
              )
            }

            if (card.card_type === 'audio' && isAudioContent(card.content)) {
              const audioContent = card.content as AudioCardContent
              return (
                <div key={card.id} className="departures-board-row departures-board-row-audio" data-card-id={card.id}>
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

            return (
              <button
                key={card.id}
                className={cn(
                  "departures-board-row departures-board-row-link",
                  ""
                )}
                onClick={() => handleCardClick(card, index)}
                data-card-id={card.id}
              >
                <span className="departures-col-time">{t(genTime(index))}</span>
                <span className="departures-col-name">{t(displayText.toUpperCase())}</span>
                <span className="departures-col-info">{t('ON TIME')}</span>
              </button>
            )
          })}

          {/* Release cards */}
          {releaseCards.map((card) => {
            if (!isReleaseContent(card.content)) return null
            const content = card.content as ReleaseCardContent
            const {
              releaseTitle, artistName, releaseDate, preSaveUrl,
              preSaveButtonText = 'PRE-SAVE', afterCountdownAction = 'custom',
              afterCountdownText = 'OUT NOW', afterCountdownUrl
            } = content
            const isReleased = releaseDate ? new Date(releaseDate) <= new Date() : false

            return (
              <div key={card.id} className="departures-board-row departures-board-row-link" data-card-id={card.id}>
                {!isReleased ? (
                  <>
                    <span className="departures-col-time" style={{ color: 'var(--theme-accent)' }}>
                      {releaseDate && isMounted && (
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
                    </span>
                    <span className="departures-col-name">
                      {t((releaseTitle || artistName || 'NEW RELEASE').toUpperCase())}
                    </span>
                    <span className="departures-col-info">
                      {preSaveUrl ? (
                        <a
                          href={preSaveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline uppercase"
                                                  >
                          {t(preSaveButtonText.toUpperCase())}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--theme-accent)' }}>{t('BOARDING')}</span>
                      )}
                    </span>
                  </>
                ) : afterCountdownAction === 'custom' ? (
                  <>
                    <span className="departures-col-time">&nbsp;</span>
                    <a
                      href={afterCountdownUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="departures-col-name uppercase"
                    >
                      {t((afterCountdownText || 'OUT NOW').toUpperCase())}
                    </a>
                    <span className="departures-col-info" style={{ color: 'var(--theme-accent)' }}>{t('ARRIVED')}</span>
                  </>
                ) : null}
              </div>
            )
          })}

          {/* Single gap before socials */}
          <div className="departures-board-row departures-board-row-blank">&nbsp;</div>

          {/* Social icons */}
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
                    className="opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <IconComponent className="w-4 h-4" />
                  </a>
                )
              })}
            </div>
          )}

          {/* Bottom blank row */}
          <div className="departures-board-row departures-board-row-blank">&nbsp;</div>

          {/* Legal footer */}
          <div className="departures-board-row departures-board-row-footer">
            <Link href={`/privacy?username=${username}`} className="hover:underline opacity-30">Privacy</Link>
            <span className="opacity-30">·</span>
            <Link href="/terms" className="hover:underline opacity-30">Terms</Link>
            <span className="opacity-30">·</span>
            <span className="opacity-30">Powered by LinkLobby</span>
          </div>
        </div>
      </div>
    </div>
  )
}
