'use client'

import { useState, useCallback } from 'react'
import type { Card, ReleaseCardContent } from '@/types/card'
import { isReleaseContent, isAudioContent } from '@/types/card'
import { AudioCard } from '@/components/cards/audio-card'
import { cn } from '@/lib/utils'
import { sortCardsBySortKey } from '@/lib/ordering'
import { useThemeStore } from '@/stores/theme-store'
import { useProfileStore } from '@/stores/profile-store'
import { SOCIAL_PLATFORMS } from '@/types/profile'
import { getWordArtStyle } from '@/lib/word-art-styles'
import type { WordArtStyle } from '@/lib/word-art-styles'
import { InlineEditable } from '@/components/preview/inline-editable'
import * as SiIcons from 'react-icons/si'
import Countdown, { CountdownRenderProps } from 'react-countdown'

interface WordArtLayoutProps {
  title: string
  cards: Card[]
  isPreview?: boolean
  isEditable?: boolean
  onCardClick?: (cardId: string) => void
  selectedCardId?: string | null
  wordArtTitleStyle?: string
}

/** Renders a word art styled text with optional shadow layer */
function WordArtText({
  text,
  style,
  fontSize,
  className,
}: {
  text: string
  style: WordArtStyle
  fontSize: string
  className?: string
}) {
  return (
    <span
      className={cn('relative inline-block', className)}
      style={{ ...style.wrapperStyle, fontSize }}
    >
      {style.shadowStyle && (
        <span
          className="absolute inset-0"
          style={{ ...style.textStyle, ...style.shadowStyle, fontSize }}
          aria-hidden="true"
        >
          {text}
        </span>
      )}
      <span style={{ ...style.textStyle, fontSize }}>{text}</span>
    </span>
  )
}

export function WordArtLayout({
  title,
  cards,
  isPreview = false,
  isEditable = false,
  onCardClick,
  selectedCardId,
  wordArtTitleStyle = 'style-eleven',
}: WordArtLayoutProps) {
  const [completedReleases, setCompletedReleases] = useState<Set<string>>(new Set())

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
  const headingSize = useThemeStore((s) => s.fonts.headingSize)
  const bodySize = useThemeStore((s) => s.fonts.bodySize)
  const centerCards = useThemeStore((s) => s.centerCards)
  const getSortedSocialIcons = useProfileStore((s) => s.getSortedSocialIcons)
  const socialIconColor = useProfileStore((s) => s.socialIconColor)
  const showSocialIcons = useProfileStore((s) => s.showSocialIcons)
  const socialIcons = getSortedSocialIcons()

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

  const titleFontSize = `${headingSize || 2.5}rem`
  const linkFontSize = `${bodySize || 2.0}rem`
  const displayTitle = title || 'Word Art'
  const titleStyle = getWordArtStyle(wordArtTitleStyle)

  return (
    <div
      className="fixed inset-0 w-full z-10 overflow-x-hidden overflow-y-auto"
      tabIndex={0}
    >
      <div className={cn("flex flex-col items-center w-full px-4 py-12", centerCards && "min-h-full justify-center")}>
        {/* Title — clickable to open Title Edit in design panel */}
        <button
          className={cn(
            "text-center mb-8 w-full px-2 cursor-pointer focus:outline-none transition-all",
            "hover:scale-105",
          )}
          onClick={(e) => {
            e.stopPropagation()
            if (window.parent !== window) {
              window.parent.postMessage(
                { type: 'OPEN_DESIGN_TAB', payload: { tab: 'header' } },
                window.location.origin
              )
            }
          }}
        >
          <WordArtText
            text={displayTitle}
            style={titleStyle}
            fontSize={`clamp(1.6rem, 6vw, ${titleFontSize})`}
          />
        </button>

        {/* Social icons — clickable to select social-icons card */}
        {showSocialIcons && socialIcons.length > 0 && (() => {
          const socialIconsCard = cards.find(c => c.card_type === 'social-icons')
          const isIconsSelected = socialIconsCard && selectedCardId === socialIconsCard.id
          return (
            <div
              className={cn(
                "flex flex-wrap justify-center gap-4 mb-10 cursor-pointer px-3 py-2 rounded-md transition-all",
                "hover:opacity-80",
                isIconsSelected && "ring-2 ring-blue-500 ring-offset-4 rounded-sm"
              )}
              onClick={(e) => {
                e.stopPropagation()
                if (socialIconsCard) {
                  onCardClick?.(socialIconsCard.id)
                }
              }}
            >
              {socialIcons.map((icon) => {
                const platform = SOCIAL_PLATFORMS[icon.platform]
                if (!platform) return null
                const IconComponent = (SiIcons as Record<string, React.ComponentType<{ className?: string }>>)[platform.icon]
                if (!IconComponent) return null

                return (
                  <span
                    key={icon.id}
                    className="transition-opacity"
                    style={{ color: socialIconColor || 'var(--theme-text)' }}
                  >
                    <IconComponent className="w-6 h-6" />
                  </span>
                )
              })}
            </div>
          )
        })()}

        {/* Cards as word art text */}
        <div className="flex flex-col items-center gap-6 w-full max-w-full">
          {visibleCards.map((card) => {
            const displayText = card.title || card.card_type
            const cardContent = card.content as Record<string, unknown>
            const cardStyleId = (cardContent.wordArtStyle as string) || 'style-one'
            const cardStyle = getWordArtStyle(cardStyleId)

            // Text cards as section dividers
            if (card.card_type === 'text') {
              return (
                <div
                  key={card.id}
                  className="w-full text-center py-2 opacity-70 cursor-pointer"
                  style={{ color: 'var(--theme-text)', fontSize: `clamp(0.9rem, 3vw, ${linkFontSize})` }}
                  onClick={() => onCardClick?.(card.id)}
                >
                  --- {displayText} ---
                </div>
              )
            }

            // Audio cards as inline player
            if (card.card_type === 'audio' && isAudioContent(card.content)) {
              return (
                <div
                  key={card.id}
                  className="w-full max-w-sm px-2 py-2"
                  onClick={() => onCardClick?.(card.id)}
                >
                  <AudioCard card={card} isPreview={isPreview} />
                </div>
              )
            }

            // Release cards as presave with countdown
            if (card.card_type === 'release' && isReleaseContent(card.content)) {
              const content = card.content as ReleaseCardContent
              const {
                releaseTitle,
                releaseDate,
                preSaveUrl,
                afterCountdownAction = 'custom',
                afterCountdownText = 'OUT NOW',
                afterCountdownUrl,
              } = content
              const isReleased = releaseDate ? new Date(releaseDate) <= new Date() : false

              const countdownRenderer = ({ days, hours, minutes, seconds, completed }: CountdownRenderProps) => {
                if (completed || isReleased) {
                  if (afterCountdownAction === 'hide' && !completedReleases.has(card.id)) {
                    setCompletedReleases(prev => new Set(prev).add(card.id))
                  }
                  return null
                }
                return (
                  <div className="text-sm tracking-wider tabular-nums text-center mt-1" style={{ color: 'var(--theme-text)', fontFamily: cardStyle.textStyle.fontFamily, fontWeight: 'bold' }}>
                    {days > 0 ? `${days}D : ` : ''}{String(hours).padStart(2, '0')}H : {String(minutes).padStart(2, '0')}M : {String(seconds).padStart(2, '0')}S
                  </div>
                )
              }

              return (
                <div
                  key={card.id}
                  className="text-center cursor-pointer"
                  onClick={() => onCardClick?.(card.id)}
                >
                  {!isReleased ? (
                    <div>
                      <WordArtText
                        text={`Pre-save: ${releaseTitle || 'Upcoming'}`}
                        style={cardStyle}
                        fontSize={`clamp(1rem, 4vw, ${linkFontSize})`}
                      />
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
                    </div>
                  ) : afterCountdownAction === 'custom' && (
                    <WordArtText
                      text={afterCountdownText || 'OUT NOW'}
                      style={cardStyle}
                      fontSize={`clamp(1rem, 4vw, ${linkFontSize})`}
                    />
                  )}
                </div>
              )
            }

            // Regular cards as word art text
            const isSelected = selectedCardId === card.id
            return (
              <button
                key={card.id}
                className={cn(
                  'text-center cursor-pointer focus:outline-none max-w-full transition-all',
                  'hover:scale-105',
                  isSelected && 'ring-2 ring-blue-500 ring-offset-4 rounded-sm'
                )}
                style={{ wordBreak: 'break-word' }}
                onClick={() => onCardClick?.(card.id)}
              >
                {isEditable ? (
                  <span
                    style={{ ...cardStyle.wrapperStyle, fontSize: `clamp(1.1rem, 4vw, ${linkFontSize})` }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span style={{ ...cardStyle.textStyle, fontSize: `clamp(1.1rem, 4vw, ${linkFontSize})` }}>
                      <InlineEditable
                        value={card.title || ''}
                        onCommit={(text) => handleInlineCommit(card.id, text)}
                        multiline={false}
                        placeholder="Tap to type"
                        onEditStart={() => handleInlineEditStart(card.id)}
                        onEditEnd={handleInlineEditEnd}
                        className="outline-none min-w-[1ch] inline-block"
                      />
                    </span>
                  </span>
                ) : (
                  <WordArtText
                    text={displayText}
                    style={cardStyle}
                    fontSize={`clamp(1.1rem, 4vw, ${linkFontSize})`}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
