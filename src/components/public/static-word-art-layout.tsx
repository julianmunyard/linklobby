'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Card, ReleaseCardContent, AudioCardContent } from '@/types/card'
import { isReleaseContent, isAudioContent } from '@/types/card'
import { AudioPlayer } from '@/components/audio/audio-player'
import type { SocialIcon } from '@/types/profile'
import { cn } from '@/lib/utils'
import { sortCardsBySortKey } from '@/lib/ordering'
import { SOCIAL_PLATFORMS } from '@/types/profile'
import { getWordArtStyle } from '@/lib/word-art-styles'
import type { WordArtStyle } from '@/lib/word-art-styles'
import * as SiIcons from 'react-icons/si'
import Countdown, { CountdownRenderProps } from 'react-countdown'

interface StaticWordArtLayoutProps {
  username: string
  title: string
  cards: Card[]
  headingSize?: number
  bodySize?: number
  socialIcons?: SocialIcon[]
  socialIconColor?: string | null
  wordArtTitleStyle?: string
  centerCards?: boolean
  showSocialIcons?: boolean
  hasProAccess?: boolean
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

/** Wrapper that scales up from small when scrolled into view */
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.6) translateY(30px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export function StaticWordArtLayout({
  username,
  title,
  cards,
  headingSize = 2.5,
  bodySize = 2.0,
  socialIcons = [],
  socialIconColor,
  wordArtTitleStyle = 'style-eleven',
  centerCards,
  showSocialIcons = true,
  hasProAccess = false,
}: StaticWordArtLayoutProps) {
  const [completedReleases, setCompletedReleases] = useState<Set<string>>(new Set())
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  const titleFontSize = `${headingSize}rem`
  const linkFontSize = `${bodySize}rem`
  const displayTitle = title || 'Word Art'
  const titleStyleObj = getWordArtStyle(wordArtTitleStyle)

  return (
    <div
      className="fixed inset-0 w-full z-10 overflow-x-hidden overflow-y-auto min-h-full flex flex-col"
      tabIndex={0}
    >
      <div className={cn("flex flex-col items-center w-full px-4 py-12", centerCards ? "flex-1 justify-center" : "flex-1")}>
        {/* Title */}
        <ScrollReveal>
          <div className="text-center mb-8 w-full px-2">
            <WordArtText
              text={displayTitle}
              style={titleStyleObj}
              fontSize={`clamp(1.6rem, 6vw, ${titleFontSize})`}
            />
          </div>
        </ScrollReveal>

        {/* Social icons */}
        {showSocialIcons !== false && socialIcons.length > 0 && (
          <ScrollReveal delay={100}>
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
                    style={{ color: socialIconColor || 'var(--theme-text)' }}
                  >
                    <IconComponent className="w-6 h-6" />
                  </a>
                )
              })}
            </div>
          </ScrollReveal>
        )}

        {/* Cards as word art text */}
        <div className="flex flex-col items-center gap-6 w-full max-w-full">
          {visibleCards.map((card, index) => {
            const displayText = card.title || card.card_type
            const cardContent = card.content as Record<string, unknown>
            const cardStyleId = (cardContent.wordArtStyle as string) || 'style-one'
            const cardStyle = getWordArtStyle(cardStyleId)

            // Text cards as section dividers
            if (card.card_type === 'text') {
              return (
                <ScrollReveal key={card.id} delay={index * 80}>
                  <div
                    className="w-full text-center py-2 opacity-70"
                    style={{ color: 'var(--theme-text)', fontSize: `clamp(0.9rem, 3vw, ${linkFontSize})` }}
                  >
                    --- {displayText} ---
                  </div>
                </ScrollReveal>
              )
            }

            // Audio cards as inline player
            if (card.card_type === 'audio' && isAudioContent(card.content)) {
              const audioContent = card.content as AudioCardContent
              return (
                <ScrollReveal key={card.id} delay={index * 80}>
                  <div className="w-full max-w-sm px-2 py-2">
                    <AudioPlayer
                      tracks={audioContent.tracks || []}
                      albumArtUrl={audioContent.albumArtUrl}
                      showWaveform={audioContent.showWaveform ?? true}
                      looping={audioContent.looping ?? false}
                      reverbConfig={audioContent.reverbConfig}
                      playerColors={audioContent.playerColors}
                      cardId={card.id}
                      pageId={card.page_id}
                    />
                  </div>
                </ScrollReveal>
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
                <ScrollReveal key={card.id} delay={index * 80}>
                  <div className="text-center" data-card-id={card.id}>
                    {!isReleased ? (
                      <div>
                        {preSaveUrl ? (
                          <a href={preSaveUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                            <WordArtText
                              text={`Pre-save: ${releaseTitle || 'Upcoming'}`}
                              style={cardStyle}
                              fontSize={`clamp(1rem, 4vw, ${linkFontSize})`}
                            />
                          </a>
                        ) : (
                          <WordArtText
                            text={`Pre-save: ${releaseTitle || 'Upcoming'}`}
                            style={cardStyle}
                            fontSize={`clamp(1rem, 4vw, ${linkFontSize})`}
                          />
                        )}
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
                      </div>
                    ) : afterCountdownAction === 'custom' && (
                      afterCountdownUrl ? (
                        <a href={afterCountdownUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                          <WordArtText
                            text={afterCountdownText || 'OUT NOW'}
                            style={cardStyle}
                            fontSize={`clamp(1rem, 4vw, ${linkFontSize})`}
                          />
                        </a>
                      ) : (
                        <WordArtText
                          text={afterCountdownText || 'OUT NOW'}
                          style={cardStyle}
                          fontSize={`clamp(1rem, 4vw, ${linkFontSize})`}
                        />
                      )
                    )}
                  </div>
                </ScrollReveal>
              )
            }

            // Regular cards as clickable word art links
            return (
              <ScrollReveal key={card.id} delay={index * 80}>
                <a
                  href={card.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-card-id={card.id}
                  className="text-center max-w-full block transition-transform duration-300 hover:scale-110"
                  style={{ wordBreak: 'break-word' }}
                  onClick={(e) => { if (!card.url) e.preventDefault() }}
                >
                  <WordArtText
                    text={displayText}
                    style={cardStyle}
                    fontSize={`clamp(1.1rem, 4vw, ${linkFontSize})`}
                  />
                </a>
              </ScrollReveal>
            )
          })}
        </div>

      </div>

      {/* Legal Footer — pinned to bottom */}
      <footer className="mt-auto pt-6 pb-6 text-center text-xs" style={{ opacity: 0.5 }}>
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
        {!hasProAccess && (
          <div className="mt-2" style={{ color: 'var(--theme-text)' }}>
            Powered by LinkLobby
          </div>
        )}
      </footer>
    </div>
  )
}
