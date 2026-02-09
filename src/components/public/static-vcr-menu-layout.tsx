'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import type { Card, ReleaseCardContent, AudioCardContent } from '@/types/card'
import { isReleaseContent, isAudioContent } from '@/types/card'
import { AudioPlayer } from '@/components/audio/audio-player'
import type { SocialIcon } from '@/types/profile'
import { cn } from '@/lib/utils'
import { sortCardsBySortKey } from '@/lib/ordering'
import { SOCIAL_PLATFORMS } from '@/types/profile'
import * as SiIcons from 'react-icons/si'
import Countdown, { CountdownRenderProps } from 'react-countdown'

interface StaticVcrMenuLayoutProps {
  username: string
  title: string
  cards: Card[]
  headingSize?: number
  bodySize?: number
  centerContent?: boolean
  socialIcons?: SocialIcon[]
}

/**
 * VCR Menu Layout for public pages
 * Client component for interactivity (flashing, touch nav)
 */
export function StaticVcrMenuLayout({
  username,
  title,
  cards,
  headingSize = 1.8,
  bodySize = 1.5,
  centerContent = false,
  socialIcons = []
}: StaticVcrMenuLayoutProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0)
  const [completedReleases, setCompletedReleases] = useState<Set<string>>(new Set())
  const [isMounted, setIsMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number>(0)

  // Only render countdown after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Filter to only visible cards, excluding social-icons
  // Release cards are included in the normal flow so they can be reordered
  const visibleCards = sortCardsBySortKey(
    cards.filter(c => {
      if (c.is_visible === false || c.card_type === 'social-icons') return false
      if (c.card_type === 'release' && isReleaseContent(c.content)) {
        const content = c.content as ReleaseCardContent
        if (completedReleases.has(c.id)) return false
        if (content.releaseDate && content.afterCountdownAction === 'hide') {
          const isReleased = new Date(content.releaseDate) <= new Date()
          if (isReleased) return false
        }
      }
      return true
    })
  )

  // Font sizes
  const titleFontSize = `${headingSize}rem`
  const linkSize = `${bodySize}rem`

  // Title
  const displayTitle = (title || 'MENU').toUpperCase()

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

  // Touch navigation handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY
    const deltaY = touchStartY.current - touchEndY
    const threshold = 50

    if (Math.abs(deltaY) > threshold) {
      if (deltaY > 0) {
        setFocusedIndex(prev => Math.min(prev + 1, visibleCards.length - 1))
      } else {
        setFocusedIndex(prev => Math.max(prev - 1, 0))
      }
    }
  }

  const handleCardClick = (card: Card, index: number) => {
    if (focusedIndex === index) {
      // Already focused, activate it
      if (card.url) {
        window.open(card.url, '_blank', 'noopener,noreferrer')
      }
    } else {
      // Just focus it
      setFocusedIndex(index)
    }
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full z-10 overflow-x-hidden overflow-y-auto"
      style={{
        fontFamily: 'var(--font-pixter-granular)',
        backgroundColor: 'var(--theme-background)',
      }}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
    >
      {/* Inner wrapper for centering */}
      <div
        className={cn(
          "flex flex-col items-center w-full px-4 py-12",
          centerContent && "min-h-full justify-center"
        )}
      >
        {/* Title with dashes - responsive */}
        <div
          className="text-center mb-6 tracking-wider w-full px-2"
          style={{
            color: 'var(--theme-text)',
            fontSize: `clamp(1.4rem, 5vw, ${titleFontSize})`,
            letterSpacing: '0.1em'
          }}
        >
          <span className="hidden sm:inline select-none">---------- </span>
          <span className="sm:hidden select-none">--- </span>
          <span>{displayTitle}</span>
          <span className="sm:hidden select-none"> ---</span>
          <span className="hidden sm:inline select-none"> ----------</span>
        </div>

        {/* Social icons below title */}
        {socialIcons.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {socialIcons.map((icon) => {
              const platform = SOCIAL_PLATFORMS[icon.platform]
              if (!platform) return null
              const IconComponent = (SiIcons as Record<string, React.ComponentType<{ className?: string }>>)[platform.icon]
              if (!IconComponent) return null

              return (
                <a
                  key={icon.id}
                  href={icon.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--theme-text)' }}
                >
                  <IconComponent className="w-6 h-6" />
                </a>
              )
            })}
          </div>
        )}

        {/* Links list */}
        <div className="flex flex-col items-center gap-2 w-full max-w-full">
          {visibleCards.map((card, index) => {
            const displayText = (card.title || card.card_type).toUpperCase()

            // Text cards render as section dividers (non-interactive)
            if (card.card_type === 'text') {
              return (
                <div
                  key={card.id}
                  className="w-full text-center py-3 opacity-70"
                  style={{
                    fontFamily: 'var(--font-pixter-granular)',
                    fontSize: `clamp(1.1rem, 4vw, ${linkSize})`,
                    letterSpacing: '0.1em',
                    color: 'var(--theme-text)',
                    wordBreak: 'break-word',
                  }}
                >
                  <span className="hidden sm:inline">----- </span>
                  <span className="sm:hidden">-- </span>
                  {displayText}
                  <span className="sm:hidden"> --</span>
                  <span className="hidden sm:inline"> -----</span>
                </div>
              )
            }

            // Audio cards render as inline player
            if (card.card_type === 'audio' && isAudioContent(card.content)) {
              const audioContent = card.content as AudioCardContent
              return (
                <div
                  key={card.id}
                  className="w-full max-w-sm px-2 py-2"
                  style={{ fontFamily: 'var(--font-pixter-granular)' }}
                >
                  <AudioPlayer
                    tracks={audioContent.tracks || []}
                    albumArtUrl={audioContent.albumArtUrl}
                    showWaveform={audioContent.showWaveform ?? true}
                    looping={audioContent.looping ?? false}
                    reverbConfig={audioContent.reverbConfig}
                    playerColors={audioContent.playerColors}
                    cardId={card.id}
                    pageId={card.page_id}
                    themeVariant="vcr-menu"
                  />
                </div>
              )
            }

            // Release cards render as presave box with countdown
            if (card.card_type === 'release' && isReleaseContent(card.content)) {
              const content = card.content as ReleaseCardContent
              const {
                releaseTitle,
                releaseDate,
                preSaveUrl,
                afterCountdownAction = 'custom',
                afterCountdownText = 'OUT NOW',
                afterCountdownUrl
              } = content
              const isReleased = releaseDate ? new Date(releaseDate) <= new Date() : false

              const vcrCountdownRenderer = ({ days, hours, minutes, seconds, completed }: CountdownRenderProps) => {
                if (completed || isReleased) {
                  if (afterCountdownAction === 'hide' && !completedReleases.has(card.id)) {
                    setCompletedReleases(prev => new Set(prev).add(card.id))
                  }
                  return null
                }
                return (
                  <div className="text-lg font-mono tracking-wider tabular-nums text-center" style={{ color: 'var(--theme-text)' }}>
                    DROPS IN {days > 0 ? `${days}D : ` : ''}{String(hours).padStart(2, '0')}H : {String(minutes).padStart(2, '0')}M : {String(seconds).padStart(2, '0')}S
                  </div>
                )
              }

              return (
                <div
                  key={card.id}
                  className="w-full max-w-sm px-2 py-2"
                >
                  {!isReleased ? (
                    <a
                      href={preSaveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-base tracking-wider px-3 py-2 border hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--theme-text)', borderColor: 'var(--theme-text)' }}
                      onClick={(e) => { if (!preSaveUrl) e.preventDefault() }}
                    >
                      <div className="text-center mb-2">
                        <span className="inline-block px-2 py-1 border" style={{ borderColor: 'var(--theme-text)' }}>
                          [PRESAVE {(releaseTitle || 'UPCOMING').toUpperCase()}]
                        </span>
                      </div>
                      {releaseDate && isMounted && (
                        <Countdown
                          date={new Date(releaseDate)}
                          renderer={vcrCountdownRenderer}
                          onComplete={() => {
                            if (afterCountdownAction === 'hide') {
                              setCompletedReleases(prev => new Set(prev).add(card.id))
                            }
                          }}
                        />
                      )}
                    </a>
                  ) : afterCountdownAction === 'custom' && (
                    afterCountdownUrl ? (
                      <a
                        href={afterCountdownUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center text-base tracking-wider px-4 py-2 border hover:opacity-80 transition-opacity"
                        style={{ color: 'var(--theme-text)', borderColor: 'var(--theme-text)' }}
                      >
                        [{(afterCountdownText || 'OUT NOW').toUpperCase()}]
                      </a>
                    ) : (
                      <div className="text-xl font-bold tracking-widest text-center" style={{ color: 'var(--theme-text)' }}>
                        {(afterCountdownText || 'OUT NOW').toUpperCase()}
                      </div>
                    )
                  )}
                </div>
              )
            }

            const isFocused = focusedIndex === index
            return (
              <button
                key={card.id}
                data-card-id={card.id}
                className={cn(
                  "px-4 py-2 text-center uppercase tracking-wider cursor-pointer",
                  "focus:outline-none max-w-full",
                  isFocused && "vcr-blink"
                )}
                style={{
                  fontFamily: 'var(--font-pixter-granular)',
                  fontSize: `clamp(1.1rem, 4vw, ${linkSize})`,
                  letterSpacing: '0.05em',
                  backgroundColor: isFocused ? 'var(--theme-text)' : 'transparent',
                  color: isFocused ? 'var(--theme-background)' : 'var(--theme-text)',
                  wordBreak: 'break-word',
                }}
                onClick={() => handleCardClick(card, index)}
              >
                {displayText}
              </button>
            )
          })}
        </div>

        {/* Legal Footer */}
        <footer className="mt-12 pt-6 text-center text-xs" style={{ opacity: 0.5 }}>
          <div className="flex items-center justify-center gap-4" style={{ color: 'var(--theme-text)' }}>
            <Link
              href={`/privacy?username=${username}`}
              className="hover:opacity-80 transition-opacity"
            >
              Privacy Policy
            </Link>
            <span>•</span>
            <Link
              href="/terms"
              className="hover:opacity-80 transition-opacity"
            >
              Terms of Service
            </Link>
          </div>
          <div className="mt-2" style={{ color: 'var(--theme-text)' }}>
            Powered by LinkLobby
          </div>
        </footer>
      </div>
    </div>
  )
}
