// src/components/cards/release-card.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import Countdown, { CountdownRenderProps } from 'react-countdown'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/theme-store'
import type { Card, ReleaseCardContent } from '@/types/card'
import { isReleaseContent } from '@/types/card'

interface ReleaseCardProps {
  card: Card
  isEditing?: boolean
}

export function ReleaseCard({ card, isEditing = false }: ReleaseCardProps) {
  const themeId = useThemeStore((state) => state.themeId)
  const [hasCompleted, setHasCompleted] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Check if card is small size
  const isSmall = card.size === 'small'

  // Only render countdown after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Type guard for content
  if (!isReleaseContent(card.content)) {
    return <ReleaseCardPlaceholder />
  }

  const content = card.content as ReleaseCardContent & { verticalAlign?: string }
  const {
    albumArtUrl,
    releaseTitle,
    artistName,
    showCountdown = true,
    releaseDate,
    preSaveUrl,
    preSaveButtonText = 'Pre-save',
    textColor,
    verticalAlign = 'bottom',
    afterCountdownAction = 'custom',
    afterCountdownText = 'OUT NOW',
    afterCountdownUrl,
  } = content

  // Check if release date has passed
  const isReleased = releaseDate ? new Date(releaseDate) <= new Date() : false

  // Handle countdown complete
  const handleCountdownComplete = useCallback(() => {
    setHasCompleted(true)
  }, [])

  // Check on initial render if already past release date
  useEffect(() => {
    if (isReleased && !hasCompleted) {
      handleCountdownComplete()
    }
  }, [isReleased, hasCompleted, handleCountdownComplete])

  // No album art configured yet
  if (!albumArtUrl && !releaseTitle) {
    return <ReleaseCardPlaceholder />
  }

  // Handle post-release state based on afterCountdownAction
  // Note: Cards with 'hide' action are also filtered server-side in fetchPublicPageData
  if (isReleased || hasCompleted) {
    // Action: Hide - return null in both editor preview and public page
    if (afterCountdownAction === 'hide') {
      return null
    }

    // Action: Custom (show album art with custom text) - this is the default
    // Renders below with the custom text/URL (only hide title/artist on public page)
  }

  // Countdown renderer - sizes adjust based on card size
  const countdownRenderer = ({ days, hours, minutes, seconds, completed }: CountdownRenderProps) => {
    // Don't render anything when completed - handled by afterCountdownAction
    if (completed || hasCompleted) {
      return null
    }

    return (
      <div className={isSmall ? "flex gap-1.5 justify-center" : "flex gap-3 justify-center"} style={{ fontFamily: 'var(--font-theme-heading)' }}>
        {days > 0 && (
          <div className="text-center">
            <span className={isSmall ? "text-lg font-bold tabular-nums" : "text-3xl font-bold tabular-nums"}>{days}</span>
            <span className={isSmall ? "text-[8px] block uppercase tracking-wide opacity-80" : "text-xs block uppercase tracking-wide opacity-80"} style={{ fontFamily: 'var(--font-theme-heading)' }}>days</span>
          </div>
        )}
        <div className="text-center">
          <span className={isSmall ? "text-lg font-bold tabular-nums" : "text-3xl font-bold tabular-nums"}>{String(hours).padStart(2, '0')}</span>
          <span className={isSmall ? "text-[8px] block uppercase tracking-wide opacity-80" : "text-xs block uppercase tracking-wide opacity-80"} style={{ fontFamily: 'var(--font-theme-heading)' }}>hrs</span>
        </div>
        <div className="text-center">
          <span className={isSmall ? "text-lg font-bold tabular-nums" : "text-3xl font-bold tabular-nums"}>{String(minutes).padStart(2, '0')}</span>
          <span className={isSmall ? "text-[8px] block uppercase tracking-wide opacity-80" : "text-xs block uppercase tracking-wide opacity-80"} style={{ fontFamily: 'var(--font-theme-heading)' }}>min</span>
        </div>
        <div className="text-center">
          <span className={isSmall ? "text-lg font-bold tabular-nums" : "text-3xl font-bold tabular-nums"}>{String(seconds).padStart(2, '0')}</span>
          <span className={isSmall ? "text-[8px] block uppercase tracking-wide opacity-80" : "text-xs block uppercase tracking-wide opacity-80"} style={{ fontFamily: 'var(--font-theme-heading)' }}>sec</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-hidden">
      {/* Album Art Background */}
      {albumArtUrl ? (
        <div className="relative aspect-square">
          <img
            src={albumArtUrl}
            alt={releaseTitle || 'Release artwork'}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

          {/* Content overlay */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col",
              isSmall ? "p-2" : "p-4",
              verticalAlign === 'top' && "justify-start",
              verticalAlign === 'middle' && "justify-center",
              verticalAlign === 'bottom' && "justify-end"
            )}
            style={{ color: textColor || '#ffffff' }}
          >
            {/* Release info */}
            <div className={isSmall ? "space-y-1 text-center" : "space-y-3 text-center"}>
              {/* Title and artist - only show before release */}
              {!isReleased && !hasCompleted && (
                <div>
                  {releaseTitle && (
                    <h3
                      className={isSmall ? "text-sm font-bold leading-tight break-words" : "text-xl font-bold leading-tight break-words"}
                      style={{ fontFamily: 'var(--font-theme-heading)' }}
                    >
                      {releaseTitle}
                    </h3>
                  )}
                  {artistName && (
                    <p
                      className={isSmall ? "text-xs opacity-80 break-words" : "text-sm opacity-80 break-words"}
                      style={{ fontFamily: 'var(--font-theme-heading)' }}
                    >
                      {artistName}
                    </p>
                  )}
                </div>
              )}

              {/* Countdown - only require isMounted on public page to avoid hydration mismatch */}
              {showCountdown && releaseDate && !isReleased && !hasCompleted && (isEditing || isMounted) && (
                <div className={isSmall ? "py-1" : "py-2"}>
                  <Countdown
                    date={new Date(releaseDate)}
                    renderer={countdownRenderer}
                    onComplete={handleCountdownComplete}
                  />
                </div>
              )}

              {/* Pre-save button (before release) */}
              {!isReleased && !hasCompleted && preSaveUrl && (
                <Button
                  asChild
                  variant="secondary"
                  size={isSmall ? "sm" : "default"}
                  className={isSmall ? "w-full bg-white/90 text-black hover:bg-white text-xs h-7" : "w-full bg-white/90 text-black hover:bg-white"}
                  style={{ fontFamily: 'var(--font-theme-heading)' }}
                  onClick={(e) => isEditing && e.preventDefault()}
                >
                  <a
                    href={preSaveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Calendar className={isSmall ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />
                    {preSaveButtonText}
                  </a>
                </Button>
              )}

              {/* Custom content (after release with custom action) */}
              {(isReleased || hasCompleted) && afterCountdownAction === 'custom' && (
                afterCountdownUrl ? (
                  <Button
                    asChild
                    variant="secondary"
                    size={isSmall ? "sm" : "default"}
                    className={isSmall ? "w-full bg-white/90 text-black hover:bg-white text-xs h-7" : "w-full bg-white/90 text-black hover:bg-white"}
                    style={{ fontFamily: 'var(--font-theme-heading)' }}
                    onClick={(e) => isEditing && e.preventDefault()}
                  >
                    <a
                      href={afterCountdownUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {afterCountdownText || 'OUT NOW'}
                    </a>
                  </Button>
                ) : (
                  <span
                    className={isSmall ? "text-sm font-bold" : "text-lg font-bold"}
                    style={{ fontFamily: 'var(--font-theme-heading)' }}
                  >
                    {afterCountdownText || 'OUT NOW'}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      ) : (
        // Fallback when no album art - simpler display
        <div
          className={cn(
            "relative aspect-square flex flex-col items-center text-center",
            isSmall ? "p-3" : "p-6",
            verticalAlign === 'top' && "justify-start",
            verticalAlign === 'middle' && "justify-center",
            verticalAlign === 'bottom' && "justify-end"
          )}
          style={{ color: textColor || 'inherit' }}
        >
          {/* Title and artist - only show before release */}
          {!isReleased && !hasCompleted && (
            <>
              {releaseTitle && (
                <h3
                  className={isSmall ? "text-sm font-bold break-words" : "text-lg font-bold break-words"}
                  style={{ fontFamily: 'var(--font-theme-heading)' }}
                >
                  {releaseTitle}
                </h3>
              )}
              {artistName && (
                <p
                  className={isSmall ? "text-xs opacity-70 break-words" : "text-sm opacity-70 break-words"}
                  style={{ fontFamily: 'var(--font-theme-heading)' }}
                >
                  {artistName}
                </p>
              )}
            </>
          )}

          {showCountdown && releaseDate && !isReleased && !hasCompleted && (isEditing || isMounted) && (
            <div className={isSmall ? "mt-2" : "mt-4"}>
              <Countdown
                date={new Date(releaseDate)}
                renderer={countdownRenderer}
                onComplete={handleCountdownComplete}
              />
            </div>
          )}

          {!isReleased && !hasCompleted && preSaveUrl && (
            <Button
              asChild
              variant="outline"
              size={isSmall ? "sm" : "default"}
              className={isSmall ? "mt-2 text-xs" : "mt-4"}
              style={{ fontFamily: 'var(--font-theme-heading)' }}
              onClick={(e) => isEditing && e.preventDefault()}
            >
              <a href={preSaveUrl} target="_blank" rel="noopener noreferrer">
                <Calendar className={isSmall ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />
                {preSaveButtonText}
              </a>
            </Button>
          )}

          {(isReleased || hasCompleted) && afterCountdownAction === 'custom' && (
            afterCountdownUrl ? (
              <Button
                asChild
                variant="outline"
                size={isSmall ? "sm" : "default"}
                className={isSmall ? "mt-2 text-xs" : "mt-4"}
                style={{ fontFamily: 'var(--font-theme-heading)' }}
                onClick={(e) => isEditing && e.preventDefault()}
              >
                <a href={afterCountdownUrl} target="_blank" rel="noopener noreferrer">
                  {afterCountdownText || 'OUT NOW'}
                </a>
              </Button>
            ) : (
              <span
                className={isSmall ? "mt-2 text-sm font-bold" : "mt-4 text-lg font-bold"}
                style={{ fontFamily: 'var(--font-theme-heading)' }}
              >
                {afterCountdownText || 'OUT NOW'}
              </span>
            )
          )}
        </div>
      )}
    </div>
  )
}

// Placeholder when no release configured
function ReleaseCardPlaceholder() {
  return (
    <div className="relative w-full aspect-square overflow-hidden bg-muted flex items-center justify-center">
      <div className="text-center text-muted-foreground p-4">
        <Calendar className="h-12 w-12 mx-auto mb-2" />
        <p className="font-medium">Add Release</p>
        <p className="text-xs mt-1">Upload album art and set release date</p>
      </div>
    </div>
  )
}
