'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Card, ReleaseCardContent } from '@/types/card'
import { isReleaseContent, isAudioContent } from '@/types/card'
import { AudioCard } from '@/components/cards/audio-card'
import { cn } from '@/lib/utils'
import { sortCardsBySortKey } from '@/lib/ordering'
import { useThemeStore } from '@/stores/theme-store'
import { useProfileStore } from '@/stores/profile-store'
import { SOCIAL_PLATFORMS } from '@/types/profile'
import { InlineEditable } from '@/components/preview/inline-editable'
import * as SiIcons from 'react-icons/si'
import Countdown, { CountdownRenderProps } from 'react-countdown'

interface VcrMenuLayoutProps {
  title: string
  cards: Card[]
  isPreview?: boolean
  isEditable?: boolean
  onCardClick?: (cardId: string) => void
  onHeaderClick?: () => void
  onSocialIconClick?: () => void
  selectedCardId?: string | null
}

/**
 * VCR Menu Layout - Renders cards as a simple retro VCR-style text list
 *
 * Features:
 * - Title with dashes (responsive - hides dashes on mobile if needed)
 * - Simple text list of links
 * - Flashing highlight on focused item (VCR style)
 * - Keyboard navigation (arrow keys + enter)
 * - Touch navigation (swipe/drag up/down)
 */
export function VcrMenuLayout({
  title,
  cards,
  isPreview = false,
  isEditable = false,
  onCardClick,
  onHeaderClick,
  onSocialIconClick,
  selectedCardId
}: VcrMenuLayoutProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0)
  const [completedReleases, setCompletedReleases] = useState<Set<string>>(new Set())
  const headingSize = useThemeStore((s) => s.fonts.headingSize)
  const bodySize = useThemeStore((s) => s.fonts.bodySize)
  const vcrCenterContent = useThemeStore((s) => s.vcrCenterContent)
  const getSortedSocialIcons = useProfileStore((s) => s.getSortedSocialIcons)
  const socialIcons = getSortedSocialIcons()
  const showLogo = useProfileStore((s) => s.showLogo)
  const logoUrl = useProfileStore((s) => s.logoUrl)
  const logoScale = useProfileStore((s) => s.logoScale)
  const showTitle = useProfileStore((s) => s.showTitle)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number>(0)

  const handleInlineCommit = useCallback((cardId: string, text: string) => {
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'UPDATE_CARD', payload: { cardId, title: text } },
        window.location.origin
      )
    }
  }, [])

  const handleInlineEditStart = useCallback((cardId: string) => {
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'SELECT_CARD', payload: { cardId } },
        window.location.origin
      )
      window.parent.postMessage({ type: 'INLINE_EDIT_ACTIVE' }, window.location.origin)
    }
  }, [])

  const handleInlineEditEnd = useCallback(() => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'INLINE_EDIT_DONE' }, window.location.origin)
    }
  }, [])

  // Filter to only visible cards, excluding social-icons
  // Release cards are included in the normal flow so they can be reordered
  const visibleCards = sortCardsBySortKey(
    cards.filter(c => {
      if (c.is_visible === false || c.card_type === 'social-icons') return false
      // Hide completed release cards with hide action
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

  // Font sizes from Fonts panel
  const titleFontSize = `${(headingSize || 1.8)}rem`
  const linkSize = `${(bodySize || 1.5)}rem`

  // Title
  const displayTitle = (title || 'MENU').toUpperCase()

  // Focus container on mount for keyboard nav
  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't intercept keys when inline editing is active
    if ((e.target as HTMLElement)?.isContentEditable) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex(prev => Math.min(prev + 1, visibleCards.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && visibleCards[focusedIndex]) {
      e.preventDefault()
      const card = visibleCards[focusedIndex]
      if (onCardClick) {
        onCardClick(card.id)
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
    const threshold = 50 // minimum swipe distance

    if (Math.abs(deltaY) > threshold) {
      if (deltaY > 0) {
        // Swipe up = move down in list
        setFocusedIndex(prev => Math.min(prev + 1, visibleCards.length - 1))
      } else {
        // Swipe down = move up in list
        setFocusedIndex(prev => Math.max(prev - 1, 0))
      }
    }
  }

  const handleCardClick = (card: Card, index: number) => {
    if (isEditable) {
      // In editor: single tap opens editor panel immediately
      setFocusedIndex(index)
      onCardClick?.(card.id)
      return
    }
    if (focusedIndex === index) {
      // Already focused, activate it
      if (onCardClick) {
        onCardClick(card.id)
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
        backgroundColor: 'transparent',
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
          vcrCenterContent && "min-h-full justify-center"
        )}
      >
        {/* Logo above title */}
        {showLogo && logoUrl && (
          <div
            className={cn("mb-4", isEditable && onHeaderClick && "cursor-pointer hover:opacity-80 transition-opacity")}
            onClick={isEditable && onHeaderClick ? onHeaderClick : undefined}
          >
            <img
              src={logoUrl}
              alt="Logo"
              className="max-w-[200px] h-auto object-contain mx-auto"
              style={{ transform: `scale(${(logoScale || 100) / 100})`, transformOrigin: 'center' }}
            />
          </div>
        )}

        {/* Title with dashes - responsive */}
        {showTitle !== false && (
          <div
            className={cn(
              "text-center mb-6 tracking-wider w-full px-2",
              isEditable && onHeaderClick && "cursor-pointer hover:opacity-80 transition-opacity"
            )}
            style={{
              color: 'var(--theme-text)',
              fontSize: `clamp(1.4rem, 5vw, ${titleFontSize})`,
              letterSpacing: '0.1em'
            }}
            onClick={isEditable && onHeaderClick ? onHeaderClick : undefined}
          >
            <span className="hidden sm:inline select-none">---------- </span>
            <span className="sm:hidden select-none">--- </span>
            <span>{displayTitle}</span>
            <span className="sm:hidden select-none"> ---</span>
            <span className="hidden sm:inline select-none"> ----------</span>
          </div>
        )}

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
                  href={isPreview ? undefined : icon.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={isPreview ? (e: React.MouseEvent) => { e.preventDefault(); if (isEditable && onSocialIconClick) onSocialIconClick() } : undefined}
                  className={cn("hover:opacity-70 transition-opacity", isEditable && onSocialIconClick && "cursor-pointer")}
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
              return (
                <div
                  key={card.id}
                  className="w-full max-w-sm px-2 py-2"
                  style={{ fontFamily: 'var(--font-pixter-granular)' }}
                  onClick={() => onCardClick?.(card.id)}
                >
                  <AudioCard card={card} isPreview={isPreview} />
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
                  onClick={() => onCardClick?.(card.id)}
                >
                  {!isReleased ? (
                    <a
                      href={isPreview ? undefined : preSaveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-base tracking-wider px-3 py-2 border hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--theme-text)', borderColor: 'var(--theme-text)' }}
                      onClick={(e) => { if (isPreview || !preSaveUrl) e.preventDefault() }}
                    >
                      <div className="text-center mb-2">
                        <span className="inline-block px-2 py-1 border" style={{ borderColor: 'var(--theme-text)' }}>
                          [PRESAVE {(releaseTitle || 'UPCOMING').toUpperCase()}]
                        </span>
                      </div>
                      {releaseDate && (
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
                        href={isPreview ? undefined : afterCountdownUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={isPreview ? (e: React.MouseEvent) => e.preventDefault() : undefined}
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
                {isEditable ? (
                  <InlineEditable
                    value={card.title || ''}
                    onCommit={(text) => handleInlineCommit(card.id, text)}
                    multiline={false}
                    placeholder="Tap to type"
                    onEditStart={() => handleInlineEditStart(card.id)}
                    onEditEnd={handleInlineEditEnd}
                    className="outline-none min-w-[1ch] inline-block uppercase"
                  />
                ) : (
                  displayText
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
