'use client'

import { useState, useRef, useEffect } from 'react'
import type { Card } from '@/types/card'
import { cn } from '@/lib/utils'

interface StaticVcrMenuLayoutProps {
  title: string
  cards: Card[]
  headingSize?: number
  bodySize?: number
  centerContent?: boolean
}

/**
 * VCR Menu Layout for public pages
 * Client component for interactivity (flashing, touch nav)
 */
export function StaticVcrMenuLayout({
  title,
  cards,
  headingSize = 1.8,
  bodySize = 1.5,
  centerContent = false
}: StaticVcrMenuLayoutProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number>(0)

  // Filter to only visible cards
  const visibleCards = cards.filter(c => c.is_visible !== false)

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
          className="text-center mb-10 tracking-wider w-full px-2"
          style={{
            color: 'var(--theme-text)',
            fontSize: `clamp(1rem, ${parseFloat(titleFontSize) * 0.6}rem, ${titleFontSize})`,
            letterSpacing: '0.1em'
          }}
        >
          <span className="hidden sm:inline select-none">---------- </span>
          <span className="sm:hidden select-none">--- </span>
          <span>{displayTitle}</span>
          <span className="sm:hidden select-none"> ---</span>
          <span className="hidden sm:inline select-none"> ----------</span>
        </div>

        {/* Links list */}
        <div className="flex flex-col items-center gap-2 w-full max-w-full">
          {visibleCards.map((card, index) => {
            const isFocused = focusedIndex === index
            const displayText = (card.title || card.card_type).toUpperCase()

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
                  fontSize: linkSize,
                  letterSpacing: '0.05em',
                  backgroundColor: isFocused ? 'var(--theme-text)' : 'transparent',
                  color: isFocused ? 'var(--theme-background)' : 'var(--theme-text)',
                }}
                onClick={() => handleCardClick(card, index)}
              >
                {displayText}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
