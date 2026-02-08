'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import type { Card, ReleaseCardContent } from '@/types/card'
import { isReleaseContent } from '@/types/card'
import { cn } from '@/lib/utils'
import { sortCardsBySortKey } from '@/lib/ordering'
import { useThemeStore } from '@/stores/theme-store'
import { useProfileStore } from '@/stores/profile-store'
import { SOCIAL_PLATFORMS } from '@/types/profile'
import * as SiIcons from 'react-icons/si'
import { ChevronRight, Play, Music, Gamepad2 } from 'lucide-react'
import Countdown, { CountdownRenderProps } from 'react-countdown'

interface LobbyProLayoutProps {
  title: string
  cards: Card[]
  isPreview?: boolean
  onCardClick?: (cardId: string) => void
  selectedCardId?: string | null
}

function AnimatedListItem({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

/**
 * Lobby Pro Layout - Modern animated list with glassmorphism styling
 *
 * Features:
 * - Scroll-triggered card animations (scale + fade + slide)
 * - Gradient overlays at top/bottom of scroll area
 * - Glass-effect card items with backdrop blur
 * - Profile header with avatar, name, bio, social icons
 * - All card types rendered as sleek list items
 */
export function LobbyProLayout({
  title,
  cards,
  isPreview = false,
  onCardClick,
  selectedCardId
}: LobbyProLayoutProps) {
  const [completedReleases, setCompletedReleases] = useState<Set<string>>(new Set())
  const blurIntensity = useThemeStore((s) => s.style.blurIntensity)
  const borderRadius = useThemeStore((s) => s.style.borderRadius)
  const headingSize = useThemeStore((s) => s.fonts.headingSize)
  const bodySize = useThemeStore((s) => s.fonts.bodySize)

  // Profile data
  const displayName = useProfileStore((s) => s.displayName)
  const bio = useProfileStore((s) => s.bio)
  const avatarUrl = useProfileStore((s) => s.avatarUrl)
  const showAvatar = useProfileStore((s) => s.showAvatar)
  const avatarFeather = useProfileStore((s) => s.avatarFeather)
  const showTitle = useProfileStore((s) => s.showTitle)
  const getSortedSocialIcons = useProfileStore((s) => s.getSortedSocialIcons)
  const socialIcons = getSortedSocialIcons()

  // Filter and sort cards
  const visibleCards = sortCardsBySortKey(
    cards.filter(c => c.is_visible !== false && c.card_type !== 'social-icons')
  )

  const glassStyle = {
    backgroundColor: 'var(--theme-card-bg)',
    backdropFilter: `blur(${blurIntensity}px)`,
    WebkitBackdropFilter: `blur(${blurIntensity}px)`,
    border: '1px solid var(--theme-border)',
    borderRadius: `${borderRadius}px`,
  }

  const handleItemClick = (card: Card) => {
    if (card.url && isPreview) {
      window.open(card.url, '_blank', 'noopener,noreferrer')
    } else if (onCardClick) {
      onCardClick(card.id)
    }
  }

  // Render different card types
  const renderCardItem = (card: Card, index: number) => {
    const isSelected = card.id === selectedCardId

    switch (card.card_type) {
      case 'text':
        return (
          <AnimatedListItem key={card.id} index={index}>
            <div
              className="w-full text-center py-4"
              style={{
                fontFamily: 'var(--theme-heading-font)',
                fontSize: `${(headingSize || 1.3) * 0.9}rem`,
                fontWeight: 'bold',
                color: 'var(--theme-text)',
                opacity: 0.7,
                letterSpacing: '0.05em',
              }}
            >
              {card.title || 'Section'}
            </div>
          </AnimatedListItem>
        )

      case 'release': {
        if (!isReleaseContent(card.content)) return null
        const content = card.content as ReleaseCardContent
        const {
          albumArtUrl,
          releaseTitle,
          releaseDate,
          preSaveUrl,
          preSaveButtonText = 'Pre-save',
          afterCountdownAction = 'custom',
          afterCountdownText = 'OUT NOW',
          afterCountdownUrl,
        } = content

        if (completedReleases.has(card.id)) return null

        const isReleased = releaseDate ? new Date(releaseDate) <= new Date() : false

        if (afterCountdownAction === 'hide' && isReleased) return null

        const countdownRenderer = ({ days, hours, minutes, seconds, completed }: CountdownRenderProps) => {
          if (completed || isReleased) {
            if (afterCountdownAction === 'hide' && !completedReleases.has(card.id)) {
              setCompletedReleases(prev => new Set(prev).add(card.id))
            }
            return null
          }
          return (
            <div
              className="text-sm font-mono tracking-wider tabular-nums mt-1"
              style={{ color: 'var(--theme-accent)' }}
            >
              {days > 0 ? `${days}d ` : ''}{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          )
        }

        return (
          <AnimatedListItem key={card.id} index={index}>
            <div
              className={cn(
                'w-full p-4 transition-all duration-200 cursor-pointer',
                isSelected && 'ring-2 ring-blue-500'
              )}
              style={glassStyle}
              onClick={() => handleItemClick(card)}
            >
              <div className="flex items-center gap-4">
                {albumArtUrl && (
                  <div
                    className="w-16 h-16 flex-shrink-0 overflow-hidden"
                    style={{ borderRadius: `${Math.max(borderRadius - 4, 4)}px` }}
                  >
                    <Image
                      src={albumArtUrl}
                      alt={releaseTitle || 'Album art'}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold truncate"
                    style={{
                      color: 'var(--theme-text)',
                      fontFamily: 'var(--theme-heading-font)',
                      fontSize: `${(bodySize || 1) * 1}rem`,
                    }}
                  >
                    {releaseTitle || card.title || 'New Release'}
                  </div>
                  {!isReleased ? (
                    <>
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
                        <a
                          href={preSaveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 px-4 py-1.5 text-xs font-medium rounded-full transition-opacity hover:opacity-80"
                          style={{
                            backgroundColor: 'var(--theme-accent)',
                            color: 'var(--theme-background)',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {preSaveButtonText}
                        </a>
                      )}
                    </>
                  ) : afterCountdownAction === 'custom' && (
                    afterCountdownUrl ? (
                      <a
                        href={afterCountdownUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 px-4 py-1.5 text-xs font-medium rounded-full transition-opacity hover:opacity-80"
                        style={{
                          backgroundColor: 'var(--theme-accent)',
                          color: 'var(--theme-background)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {afterCountdownText}
                      </a>
                    ) : (
                      <div
                        className="text-sm font-semibold mt-1"
                        style={{ color: 'var(--theme-accent)' }}
                      >
                        {afterCountdownText}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </AnimatedListItem>
        )
      }

      case 'music': {
        const content = card.content as { thumbnailUrl?: string; trackTitle?: string; artistName?: string; platform?: string }
        return (
          <AnimatedListItem key={card.id} index={index}>
            <div
              className={cn(
                'w-full p-4 transition-all duration-200 cursor-pointer',
                isSelected && 'ring-2 ring-blue-500'
              )}
              style={glassStyle}
              onClick={() => handleItemClick(card)}
            >
              <div className="flex items-center gap-4">
                {content?.thumbnailUrl ? (
                  <div
                    className="w-12 h-12 flex-shrink-0 overflow-hidden"
                    style={{ borderRadius: `${Math.max(borderRadius - 4, 4)}px` }}
                  >
                    <Image
                      src={content.thumbnailUrl}
                      alt={card.title || 'Music'}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="w-12 h-12 flex-shrink-0 flex items-center justify-center"
                    style={{
                      borderRadius: `${Math.max(borderRadius - 4, 4)}px`,
                      backgroundColor: 'var(--theme-accent)',
                      opacity: 0.2,
                    }}
                  >
                    <Music className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold truncate"
                    style={{
                      color: 'var(--theme-text)',
                      fontFamily: 'var(--theme-body-font)',
                      fontSize: `${(bodySize || 1) * 1}rem`,
                    }}
                  >
                    {content?.trackTitle || card.title || 'Music'}
                  </div>
                  {content?.platform && (
                    <div className="text-xs mt-0.5" style={{ color: 'var(--theme-text)', opacity: 0.5 }}>
                      {content.platform}
                    </div>
                  )}
                </div>
                <Play className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--theme-accent)' }} />
              </div>
            </div>
          </AnimatedListItem>
        )
      }

      case 'video': {
        const content = card.content as { thumbnailUrl?: string; videoType?: string; videoUrl?: string; embedUrl?: string }
        const thumbnail = content?.thumbnailUrl
        return (
          <AnimatedListItem key={card.id} index={index}>
            <div
              className={cn(
                'w-full overflow-hidden transition-all duration-200 cursor-pointer',
                isSelected && 'ring-2 ring-blue-500'
              )}
              style={glassStyle}
              onClick={() => handleItemClick(card)}
            >
              {thumbnail ? (
                <div className="relative aspect-video w-full">
                  <Image
                    src={thumbnail}
                    alt={card.title || 'Video'}
                    fill
                    className="object-cover"
                    style={{ borderRadius: `${borderRadius}px ${borderRadius}px 0 0` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                    >
                      <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="aspect-video w-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
                >
                  <Play className="w-8 h-8" style={{ color: 'var(--theme-text)', opacity: 0.5 }} />
                </div>
              )}
              {card.title && (
                <div
                  className="px-4 py-3"
                  style={{
                    color: 'var(--theme-text)',
                    fontFamily: 'var(--theme-body-font)',
                    fontSize: `${(bodySize || 1) * 0.9}rem`,
                  }}
                >
                  {card.title}
                </div>
              )}
            </div>
          </AnimatedListItem>
        )
      }

      case 'gallery': {
        const content = card.content as { images?: Array<{ url: string; caption?: string }> }
        const images = content?.images || []
        return (
          <AnimatedListItem key={card.id} index={index}>
            <div
              className={cn(
                'w-full overflow-hidden transition-all duration-200 cursor-pointer',
                isSelected && 'ring-2 ring-blue-500'
              )}
              style={glassStyle}
              onClick={() => onCardClick?.(card.id)}
            >
              <div className="flex gap-2 overflow-x-auto p-3 snap-x snap-mandatory scrollbar-hide">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="w-24 h-24 flex-shrink-0 overflow-hidden snap-start"
                    style={{ borderRadius: `${Math.max(borderRadius - 6, 4)}px` }}
                  >
                    <Image
                      src={img.url}
                      alt={img.caption || `Gallery image ${i + 1}`}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {images.length === 0 && (
                  <div
                    className="w-full h-24 flex items-center justify-center text-sm"
                    style={{ color: 'var(--theme-text)', opacity: 0.4 }}
                  >
                    No images
                  </div>
                )}
              </div>
            </div>
          </AnimatedListItem>
        )
      }

      case 'email-collection': {
        const content = card.content as { heading?: string; subheading?: string; buttonText?: string }
        return (
          <AnimatedListItem key={card.id} index={index}>
            <div
              className={cn(
                'w-full p-4 transition-all duration-200',
                isSelected && 'ring-2 ring-blue-500'
              )}
              style={glassStyle}
              onClick={() => onCardClick?.(card.id)}
            >
              <div
                className="font-semibold mb-1"
                style={{
                  color: 'var(--theme-text)',
                  fontFamily: 'var(--theme-heading-font)',
                  fontSize: `${(bodySize || 1) * 1}rem`,
                }}
              >
                {content?.heading || card.title || 'Stay Updated'}
              </div>
              {content?.subheading && (
                <div className="text-sm mb-3" style={{ color: 'var(--theme-text)', opacity: 0.6 }}>
                  {content.subheading}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 text-sm outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--theme-border)',
                    borderRadius: `${Math.max(borderRadius - 4, 4)}px`,
                    color: 'var(--theme-text)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                  readOnly
                />
                <button
                  className="px-4 py-2 text-sm font-medium flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--theme-accent)',
                    color: 'var(--theme-background)',
                    borderRadius: `${Math.max(borderRadius - 4, 4)}px`,
                  }}
                >
                  {content?.buttonText || 'Subscribe'}
                </button>
              </div>
            </div>
          </AnimatedListItem>
        )
      }

      case 'game':
        return (
          <AnimatedListItem key={card.id} index={index}>
            <button
              className={cn(
                'w-full flex items-center gap-4 px-5 py-4 transition-all duration-200 hover:scale-[1.02] cursor-pointer text-left',
                isSelected && 'ring-2 ring-blue-500'
              )}
              style={glassStyle}
              onClick={() => handleItemClick(card)}
            >
              <Gamepad2 className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--theme-accent)' }} />
              <span
                className="flex-1 truncate"
                style={{
                  color: 'var(--theme-text)',
                  fontFamily: 'var(--theme-body-font)',
                  fontSize: `${(bodySize || 1) * 1}rem`,
                }}
              >
                {card.title || 'Game'}
              </span>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--theme-text)', opacity: 0.4 }} />
            </button>
          </AnimatedListItem>
        )

      case 'hero': {
        const heroImage = (card.content as { imageUrl?: string })?.imageUrl
        return (
          <AnimatedListItem key={card.id} index={index}>
            <div
              className={cn(
                'w-full overflow-hidden transition-all duration-200 cursor-pointer',
                isSelected && 'ring-2 ring-blue-500'
              )}
              style={glassStyle}
              onClick={() => handleItemClick(card)}
            >
              {heroImage && (
                <div className="relative aspect-video w-full">
                  <Image
                    src={heroImage}
                    alt={card.title || 'Hero'}
                    fill
                    className="object-cover"
                    style={{ borderRadius: `${borderRadius}px ${borderRadius}px 0 0` }}
                  />
                </div>
              )}
              <div className="flex items-center gap-3 px-5 py-4">
                <span
                  className="flex-1 font-semibold truncate"
                  style={{
                    color: 'var(--theme-text)',
                    fontFamily: 'var(--theme-heading-font)',
                    fontSize: `${(bodySize || 1) * 1.1}rem`,
                  }}
                >
                  {card.title || 'Hero'}
                </span>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--theme-text)', opacity: 0.4 }} />
              </div>
            </div>
          </AnimatedListItem>
        )
      }

      // Default: link, horizontal, square, mini, etc.
      default: {
        const thumbnail = (card.content as { imageUrl?: string })?.imageUrl
        return (
          <AnimatedListItem key={card.id} index={index}>
            <button
              className={cn(
                'w-full flex items-center gap-4 px-5 py-4 transition-all duration-200 hover:scale-[1.02] cursor-pointer text-left',
                isSelected && 'ring-2 ring-blue-500'
              )}
              style={glassStyle}
              onClick={() => handleItemClick(card)}
            >
              {thumbnail && (
                <div
                  className="w-12 h-12 flex-shrink-0 overflow-hidden"
                  style={{ borderRadius: `${Math.max(borderRadius - 4, 4)}px` }}
                >
                  <Image
                    src={thumbnail}
                    alt={card.title || ''}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <span
                className="flex-1 truncate"
                style={{
                  color: 'var(--theme-text)',
                  fontFamily: 'var(--theme-body-font)',
                  fontSize: `${(bodySize || 1) * 1}rem`,
                }}
              >
                {card.title || card.card_type}
              </span>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--theme-text)', opacity: 0.4 }} />
            </button>
          </AnimatedListItem>
        )
      }
    }
  }

  return (
    <div
      className="fixed inset-0 w-full z-10 overflow-x-hidden overflow-y-auto"
      style={{ backgroundColor: 'var(--theme-background)' }}
    >
      {/* Gradient overlays */}
      <div
        className="fixed top-0 left-0 right-0 h-24 z-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, var(--theme-background), transparent)' }}
      />
      <div
        className="fixed bottom-0 left-0 right-0 h-24 z-20 pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--theme-background), transparent)' }}
      />

      {/* Content */}
      <div className="flex flex-col items-center w-full max-w-xl mx-auto px-6 py-16 relative z-10">
        {/* Profile header */}
        <div className="flex flex-col items-center mb-10 w-full">
          {/* Avatar */}
          {showAvatar && avatarUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="mb-4"
            >
              <div
                className="w-20 h-20 rounded-full overflow-hidden"
                style={{
                  WebkitMaskImage: avatarFeather > 0
                    ? `radial-gradient(circle, black ${100 - avatarFeather}%, transparent 100%)`
                    : undefined,
                  maskImage: avatarFeather > 0
                    ? `radial-gradient(circle, black ${100 - avatarFeather}%, transparent 100%)`
                    : undefined,
                }}
              >
                <Image
                  src={avatarUrl}
                  alt={displayName || 'Avatar'}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          )}

          {/* Display name */}
          {showTitle && (displayName || title) && (
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-bold text-center"
              style={{
                color: 'var(--theme-text)',
                fontFamily: 'var(--theme-heading-font)',
                fontSize: `${(headingSize || 1.3) * 1.4}rem`,
              }}
            >
              {displayName || title}
            </motion.h1>
          )}

          {/* Bio */}
          {bio && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-center mt-2 max-w-sm"
              style={{
                color: 'var(--theme-text)',
                opacity: 0.7,
                fontFamily: 'var(--theme-body-font)',
                fontSize: `${(bodySize || 1) * 0.9}rem`,
              }}
            >
              {bio}
            </motion.p>
          )}

          {/* Social icons */}
          {socialIcons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4 mt-4"
            >
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
                    <IconComponent className="w-5 h-5" />
                  </a>
                )
              })}
            </motion.div>
          )}
        </div>

        {/* Card list */}
        <div className="flex flex-col gap-3 w-full">
          {visibleCards.map((card, index) => renderCardItem(card, index))}
        </div>
      </div>
    </div>
  )
}
