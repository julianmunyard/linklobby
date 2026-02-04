// src/components/cards/release-card.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import Countdown, { CountdownRenderProps } from 'react-countdown'
import { Calendar, Music, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/stores/theme-store'
import { detectPlatform, isMusicPlatform } from '@/lib/platform-embed'
import type { Card, ReleaseCardContent } from '@/types/card'
import { isReleaseContent } from '@/types/card'

interface ReleaseCardProps {
  card: Card
  isEditing?: boolean
  onConvert?: () => void
}

export function ReleaseCard({ card, isEditing = false, onConvert }: ReleaseCardProps) {
  const themeId = useThemeStore((state) => state.themeId)
  const [hasCompleted, setHasCompleted] = useState(false)

  // Type guard for content
  if (!isReleaseContent(card.content)) {
    return <ReleaseCardPlaceholder />
  }

  const content = card.content as ReleaseCardContent
  const {
    albumArtUrl,
    releaseTitle,
    artistName,
    showCountdown = true,
    releaseDate,
    preSaveUrl,
    preSaveButtonText = 'Pre-save',
    musicUrl,
    textColor,
  } = content

  // Check if release date has passed
  const isReleased = releaseDate ? new Date(releaseDate) <= new Date() : false

  // Handle countdown complete
  const handleCountdownComplete = useCallback(() => {
    setHasCompleted(true)
    // Only attempt conversion if we have a valid music URL
    if (musicUrl && onConvert) {
      const detected = detectPlatform(musicUrl)
      if (detected && isMusicPlatform(detected.platform)) {
        // Trigger conversion after a brief delay for user to see "Out Now!"
        setTimeout(() => {
          onConvert()
        }, 2000)
      }
    }
  }, [musicUrl, onConvert])

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

  // Countdown renderer
  const countdownRenderer = ({ days, hours, minutes, seconds, completed }: CountdownRenderProps) => {
    if (completed || hasCompleted) {
      return (
        <div className="text-center">
          <span className="text-2xl font-bold tracking-wide">Out Now!</span>
          {musicUrl && (
            <a
              href={musicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm hover:underline"
              onClick={(e) => isEditing && e.preventDefault()}
            >
              <Music className="h-4 w-4" />
              Listen Now
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )
    }

    return (
      <div className="flex gap-3 justify-center">
        {days > 0 && (
          <div className="text-center">
            <span className="text-3xl font-bold tabular-nums">{days}</span>
            <span className="text-xs block uppercase tracking-wide opacity-80">days</span>
          </div>
        )}
        <div className="text-center">
          <span className="text-3xl font-bold tabular-nums">{String(hours).padStart(2, '0')}</span>
          <span className="text-xs block uppercase tracking-wide opacity-80">hours</span>
        </div>
        <div className="text-center">
          <span className="text-3xl font-bold tabular-nums">{String(minutes).padStart(2, '0')}</span>
          <span className="text-xs block uppercase tracking-wide opacity-80">min</span>
        </div>
        <div className="text-center">
          <span className="text-3xl font-bold tabular-nums">{String(seconds).padStart(2, '0')}</span>
          <span className="text-xs block uppercase tracking-wide opacity-80">sec</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
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
            className="absolute inset-0 flex flex-col justify-end p-4"
            style={{ color: textColor || '#ffffff' }}
          >
            {/* Coming Soon / Out Now label */}
            <div className="mb-auto pt-2">
              <span className="text-xs uppercase tracking-wider font-medium px-2 py-1 bg-white/20 rounded backdrop-blur-sm">
                {isReleased || hasCompleted ? 'Out Now' : 'Coming Soon'}
              </span>
            </div>

            {/* Release info */}
            <div className="space-y-3">
              {/* Title and artist */}
              <div>
                {releaseTitle && (
                  <h3 className="text-xl font-bold leading-tight">{releaseTitle}</h3>
                )}
                {artistName && (
                  <p className="text-sm opacity-80">{artistName}</p>
                )}
              </div>

              {/* Countdown */}
              {showCountdown && releaseDate && !isReleased && !hasCompleted && (
                <div className="py-2">
                  <Countdown
                    date={new Date(releaseDate)}
                    renderer={countdownRenderer}
                    onComplete={handleCountdownComplete}
                  />
                </div>
              )}

              {/* Out Now state */}
              {(isReleased || hasCompleted) && showCountdown && (
                <div className="py-2">
                  {countdownRenderer({ days: 0, hours: 0, minutes: 0, seconds: 0, completed: true } as CountdownRenderProps)}
                </div>
              )}

              {/* Pre-save button (before release) */}
              {!isReleased && !hasCompleted && preSaveUrl && (
                <Button
                  asChild
                  variant="secondary"
                  className="w-full bg-white/90 text-black hover:bg-white"
                  onClick={(e) => isEditing && e.preventDefault()}
                >
                  <a
                    href={preSaveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {preSaveButtonText}
                  </a>
                </Button>
              )}

              {/* Listen button (after release) */}
              {(isReleased || hasCompleted) && musicUrl && (
                <Button
                  asChild
                  variant="secondary"
                  className="w-full bg-white/90 text-black hover:bg-white"
                  onClick={(e) => isEditing && e.preventDefault()}
                >
                  <a
                    href={musicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Music className="h-4 w-4 mr-2" />
                    Listen Now
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Fallback when no album art - simpler display
        <div
          className="relative aspect-square bg-muted flex flex-col items-center justify-center p-6"
          style={{ color: textColor || 'inherit' }}
        >
          <Music className="h-12 w-12 mb-4 opacity-50" />
          {releaseTitle && (
            <h3 className="text-lg font-bold text-center">{releaseTitle}</h3>
          )}
          {artistName && (
            <p className="text-sm opacity-70 text-center">{artistName}</p>
          )}

          {showCountdown && releaseDate && !isReleased && !hasCompleted && (
            <div className="mt-4">
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
              className="mt-4"
              onClick={(e) => isEditing && e.preventDefault()}
            >
              <a href={preSaveUrl} target="_blank" rel="noopener noreferrer">
                <Calendar className="h-4 w-4 mr-2" />
                {preSaveButtonText}
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Placeholder when no release configured
function ReleaseCardPlaceholder() {
  return (
    <div className="relative w-full aspect-square overflow-hidden bg-muted flex items-center justify-center rounded-lg">
      <div className="text-center text-muted-foreground p-4">
        <Calendar className="h-12 w-12 mx-auto mb-2" />
        <p className="font-medium">Add Release</p>
        <p className="text-xs mt-1">Upload album art and set release date</p>
      </div>
    </div>
  )
}
