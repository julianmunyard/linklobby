'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Card } from '@/types/card'
import type { BackgroundConfig } from '@/types/theme'
import { cn } from '@/lib/utils'
import { StaticBackground, StaticNoiseOverlay } from './static-overlays'

interface StaticIpodClassicLayoutProps {
  title: string
  cards: Card[]
  headingSize?: number
  bodySize?: number
  accentColor?: string
  background?: BackgroundConfig
}

/**
 * Static iPod Classic Layout for public pages
 * Client component for interactivity (navigation)
 */
export function StaticIpodClassicLayout({
  title,
  cards,
  headingSize = 1.0,
  bodySize = 1.0,
  background = { type: 'solid', value: '#000000' }
}: StaticIpodClassicLayoutProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuListRef = useRef<HTMLDivElement>(null)

  // Filter to only visible cards
  const visibleCards = cards.filter(c => c.is_visible !== false)

  // Auto-scroll selected item into view
  useEffect(() => {
    const menuList = menuListRef.current
    if (!menuList) return
    const selectedItem = menuList.children[selectedIndex] as HTMLElement
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedIndex])

  // Activate selected link
  const activateLink = useCallback((card: Card) => {
    if (card.url) {
      window.open(card.url, '_blank', 'noopener,noreferrer')
    }
  }, [])

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
    >
      {/* Background layer (solid/image/video) */}
      <StaticBackground background={background} />
      <StaticNoiseOverlay background={background} />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        {/* iPod Container */}
        <div className="ipod-container">
          {/* Screen Bezel */}
          <div className="ipod-screen-bezel">
            {/* LCD Screen */}
            <div className="ipod-screen">
              {/* Title Bar - Arrow | Title | Battery */}
              <div className="ipod-title-bar">
                <span className="text-[11px]">▶</span>
                <span className="font-bold text-[12px] tracking-wide">{displayTitle}</span>
                {/* Old-school battery icon */}
                <svg className="ipod-battery" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0.5" y="0.5" width="20" height="11" rx="1.5" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <rect x="21" y="3" width="3" height="6" rx="1" fill="currentColor"/>
                  <rect x="2" y="2" width="4" height="8" fill="currentColor"/>
                  <rect x="7" y="2" width="4" height="8" fill="currentColor"/>
                  <rect x="12" y="2" width="4" height="8" fill="currentColor"/>
                  <rect x="17" y="2" width="2" height="8" fill="currentColor"/>
                </svg>
              </div>

              {/* Menu List */}
              <div ref={menuListRef} className="ipod-menu-list">
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
                        <span className="flex-1 text-[12px] truncate">{displayText}</span>
                        <span className="text-[11px] ml-2">{'>'}</span>
                      </div>
                    )
                  })
                )}
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
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="url(#ipod-rainbow-static)"/>
              <defs>
                <linearGradient id="ipod-rainbow-static" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
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

      </div>
    </div>
  )
}
