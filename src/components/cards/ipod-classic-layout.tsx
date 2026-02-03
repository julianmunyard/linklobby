'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Card } from '@/types/card'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/theme-store'

interface IpodClassicLayoutProps {
  title: string
  cards: Card[]
  isPreview?: boolean
  onCardClick?: (cardId: string) => void
  selectedCardId?: string | null
}

// Extract first emoji from string, or return fallback icon based on card type
function getCardIcon(card: Card): string {
  // Try to extract emoji from title
  if (card.title) {
    const emojiMatch = card.title.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u)
    if (emojiMatch) return emojiMatch[0]
  }

  // Fallback icons by card type
  switch (card.card_type) {
    case 'link':
    case 'horizontal':
      return '\u{1F517}' // link icon
    case 'hero':
      return '\u{2B50}' // star
    case 'video':
      return '\u{25B6}' // play
    case 'gallery':
      return '\u{1F5BC}' // image
    case 'music':
      return '\u{1F3B5}' // music note
    case 'social-icons':
      return '\u{1F465}' // people
    default:
      return '\u{2022}' // bullet point
  }
}

/**
 * iPod Classic Layout - Renders cards as menu items in an iPod interface
 *
 * Features:
 * - Classic iPod body with cream housing
 * - Black screen bezel with LCD screen
 * - Menu list with user's cards as items
 * - Click wheel navigation
 * - Keyboard navigation (arrow keys + enter)
 * - Rainbow Apple logo
 */
export function IpodClassicLayout({
  title,
  cards,
  isPreview = false,
  onCardClick,
  selectedCardId
}: IpodClassicLayoutProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const containerRef = useRef<HTMLDivElement>(null)
  const colors = useThemeStore((s) => s.colors)

  // Filter to only visible cards
  const visibleCards = cards.filter(c => c.is_visible !== false)

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Format time as "12:34 pm"
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase()
  }

  // Activate selected link
  const activateLink = useCallback((card: Card) => {
    if (card.url && isPreview) {
      window.open(card.url, '_blank', 'noopener,noreferrer')
    } else if (onCardClick) {
      onCardClick(card.id)
    }
  }, [isPreview, onCardClick])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : visibleCards.length - 1))
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < visibleCards.length - 1 ? prev + 1 : 0))
        break
      case 'Enter':
        e.preventDefault()
        if (visibleCards[selectedIndex]) {
          activateLink(visibleCards[selectedIndex])
        }
        break
    }
  }, [selectedIndex, visibleCards, activateLink])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Click wheel handlers
  const handleWheelClick = (direction: 'up' | 'down' | 'center' | 'menu') => {
    switch (direction) {
      case 'up':
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : visibleCards.length - 1))
        break
      case 'down':
        setSelectedIndex(prev => (prev < visibleCards.length - 1 ? prev + 1 : 0))
        break
      case 'center':
        if (visibleCards[selectedIndex]) {
          activateLink(visibleCards[selectedIndex])
        }
        break
      case 'menu':
        // Menu button - could go back if we had nested menus
        break
    }
  }

  // Handle touch wheel clicks (detect quadrant)
  const handleTouchWheelClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const x = e.clientX - centerX
    const y = e.clientY - centerY
    const angle = Math.atan2(y, x) * (180 / Math.PI)

    // Determine which quadrant was clicked
    if (angle > -135 && angle <= -45) {
      handleWheelClick('up')
    } else if (angle > 45 && angle <= 135) {
      handleWheelClick('down')
    }
    // Left/right quadrants currently unused
  }

  const handleMenuItemClick = (card: Card, index: number) => {
    if (selectedIndex === index) {
      // Already selected, activate
      activateLink(card)
    } else {
      // Select it
      setSelectedIndex(index)
    }
  }

  const displayTitle = title || 'Menu'

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full z-10 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.background}ee 100%)`,
      }}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* iPod Container */}
        <div className="ipod-container">
          {/* Screen Bezel */}
          <div className="ipod-screen-bezel">
            {/* LCD Screen */}
            <div className="ipod-screen">
              {/* Status Bar */}
              <div className="ipod-status-bar">
                <span className="text-[11px] font-semibold lowercase tracking-wide">links</span>
                <span className="text-[10px]">{'\u{1F50B}'}</span>
              </div>

              {/* Menu Header */}
              <div
                className="ipod-menu-header"
                style={{ background: `linear-gradient(180deg, ${colors.accent} 0%, ${colors.accent}dd 100%)` }}
              >
                <span className="font-bold text-[14px] tracking-wide">{displayTitle}</span>
                <span className="text-[12px] font-medium tabular-nums">{formatTime(currentTime)}</span>
              </div>

              {/* Menu List */}
              <div className="ipod-menu-list">
                {visibleCards.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-[13px] text-gray-500">
                    No links
                  </div>
                ) : (
                  visibleCards.map((card, index) => {
                    const isSelected = selectedIndex === index
                    const displayText = card.title || card.card_type

                    return (
                      <div
                        key={card.id}
                        className={cn(
                          'ipod-menu-item',
                          isSelected && 'selected'
                        )}
                        onClick={() => handleMenuItemClick(card, index)}
                      >
                        <span className="w-5 mr-2 text-[12px] text-center">{getCardIcon(card)}</span>
                        <span className="flex-1 text-[13px] tracking-wide truncate">{displayText}</span>
                        {isSelected && <span className="text-[10px] ml-1">{'\u25B6'}</span>}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Screen Footer */}
              <div className="ipod-screen-footer">
                <span>{visibleCards.length} items</span>
              </div>
            </div>
          </div>

          {/* Click Wheel */}
          <div className="ipod-click-wheel">
            {/* Menu Button (Top) */}
            <button
              className="ipod-wheel-button ipod-wheel-menu"
              onClick={() => handleWheelClick('menu')}
            >
              menu
            </button>

            {/* Previous Button (Left) */}
            <button
              className="ipod-wheel-button ipod-wheel-prev"
              onClick={() => {}}
            >
              {'\u25C0\u25C0'}
            </button>

            {/* Next Button (Right) */}
            <button
              className="ipod-wheel-button ipod-wheel-next"
              onClick={() => {}}
            >
              {'\u25B6\u25B6'}
            </button>

            {/* Play/Pause Button (Bottom) */}
            <button
              className="ipod-wheel-button ipod-wheel-play"
              onClick={() => {}}
            >
              {'\u25B6\u275A\u275A'}
            </button>

            {/* Center Button */}
            <button
              className="ipod-center-button"
              onClick={() => handleWheelClick('center')}
            />

            {/* Touch Wheel for scrolling */}
            <div
              className="ipod-touch-wheel"
              onClick={handleTouchWheelClick}
            />
          </div>

          {/* Rainbow Apple Logo */}
          <div className="ipod-apple-logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="url(#ipod-rainbow)"/>
              <defs>
                <linearGradient id="ipod-rainbow" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF6B6B"/>
                  <stop offset="0.2" stopColor="#FFA500"/>
                  <stop offset="0.4" stopColor="#FFD93D"/>
                  <stop offset="0.6" stopColor="#6BCF7F"/>
                  <stop offset="0.8" stopColor="#4D96FF"/>
                  <stop offset="1" stopColor="#9B59B6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Instructions (desktop only) */}
        <div className="ipod-instructions">
          <p>Use {'\u2191'} {'\u2193'} arrow keys or click wheel to navigate</p>
          <p>Press Enter or center button to open link</p>
        </div>
      </div>
    </div>
  )
}
