'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Card, ReleaseCardContent } from '@/types/card'
import { isReleaseContent } from '@/types/card'
import { cn } from '@/lib/utils'
import { sortCardsBySortKey } from '@/lib/ordering'
import { useThemeStore } from '@/stores/theme-store'
import { useProfileStore } from '@/stores/profile-store'
import { PageBackground, DimOverlay, NoiseOverlay } from '@/components/preview/page-background'
import { AudioCard } from '@/components/cards/audio-card'
import { SOCIAL_PLATFORMS } from '@/types/profile'
import Countdown, { CountdownRenderProps } from 'react-countdown'

interface IpodClassicLayoutProps {
  title: string
  cards: Card[]
  isPreview?: boolean
  onCardClick?: (cardId: string) => void
  selectedCardId?: string | null
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
  const [currentScreen, setCurrentScreen] = useState<'main' | 'socials' | 'release' | 'nowplaying'>('main')
  const [activeReleaseIndex, setActiveReleaseIndex] = useState(0)
  const [activeAudioCard, setActiveAudioCard] = useState<Card | null>(null)
  const [draggingSticker, setDraggingSticker] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuListRef = useRef<HTMLDivElement>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const ipodRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<{ x: number; y: number; stickerX: number; stickerY: number } | null>(null)
  const logoUrl = useProfileStore((s) => s.logoUrl)
  const showLogo = useProfileStore((s) => s.showLogo)
  const logoScale = useProfileStore((s) => s.logoScale)
  const getSortedSocialIcons = useProfileStore((s) => s.getSortedSocialIcons)
  const socialIcons = getSortedSocialIcons()
  const ipodStickers = useThemeStore((s) => s.ipodStickers)
  const updateIpodSticker = useThemeStore((s) => s.updateIpodSticker)
  const ipodTexture = useThemeStore((s) => s.ipodTexture)

  // Wheel rotation tracking
  const lastAngleRef = useRef<number | null>(null)
  const accumulatedRotation = useRef(0)
  const DEGREES_PER_ITEM = 30 // Rotate 30 degrees to move one item

  // Filter to only visible cards and sort by sortKey
  const visibleCards = sortCardsBySortKey(cards.filter(c => c.is_visible !== false))

  // Filter release cards - only show unreleased ones (they navigate to release screen)
  const releaseCards = visibleCards.filter(c => {
    if (c.card_type !== 'release' || !isReleaseContent(c.content)) return false
    const content = c.content as ReleaseCardContent
    if (!content.releaseDate) return true // No date = show as release
    const isReleased = new Date(content.releaseDate) <= new Date()
    // If released, don't show in releaseCards (will show as link in main menu if custom action)
    if (isReleased) return false
    return true
  })

  // Completed releases with 'custom' action - show as regular links in main menu
  const completedReleaseLinks = visibleCards.filter(c => {
    if (c.card_type !== 'release' || !isReleaseContent(c.content)) return false
    const content = c.content as ReleaseCardContent
    if (!content.releaseDate) return false
    const isReleased = new Date(content.releaseDate) <= new Date()
    // Only include if released AND has custom action (not hide)
    return isReleased && content.afterCountdownAction !== 'hide'
  })

  // Filter releases from main menu (non-release cards only)
  const menuCards = visibleCards.filter(c => c.card_type !== 'release')

  // Get current menu items based on screen
  const currentMenuItems = currentScreen === 'main' ? menuCards : socialIcons

  // Auto-scroll selected item into view
  useEffect(() => {
    const menuList = menuListRef.current
    if (!menuList) return
    const selectedItem = menuList.children[selectedIndex] as HTMLElement
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedIndex])

  // Navigate to socials screen
  const goToSocials = () => {
    setCurrentScreen('socials')
    setSelectedIndex(0)
  }

  // Navigate to release screen
  const goToRelease = (index: number) => {
    setCurrentScreen('release')
    setActiveReleaseIndex(index)
    setSelectedIndex(0)
  }

  // Navigate to Now Playing screen for audio cards
  const goToNowPlaying = (card: Card) => {
    setCurrentScreen('nowplaying')
    setActiveAudioCard(card)
    setSelectedIndex(0)
  }

  // Go back to main screen
  const goBack = () => {
    setCurrentScreen('main')
    setSelectedIndex(0)
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
    let menuLength = 0
    if (currentScreen === 'main') {
      menuLength = menuCards.length + completedReleaseLinks.length + releaseCards.length
    } else if (currentScreen === 'socials') {
      menuLength = socialIcons.length
    } else if (currentScreen === 'release' || currentScreen === 'nowplaying') {
      // On release/nowplaying screen, arrow keys do nothing (just center button to go back)
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault()
        goBack()
      }
      return
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : menuLength - 1))
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < menuLength - 1 ? prev + 1 : 0))
        break
      case 'Enter':
        e.preventDefault()
        if (currentScreen === 'main') {
          if (selectedIndex < menuCards.length) {
            // Regular menu card
            const card = menuCards[selectedIndex]
            if (card?.card_type === 'social-icons') {
              goToSocials()
            } else if (card?.card_type === 'audio') {
              goToNowPlaying(card)
            } else if (card) {
              activateLink(card)
            }
          } else if (selectedIndex < menuCards.length + completedReleaseLinks.length) {
            // Completed release - open URL
            const linkIndex = selectedIndex - menuCards.length
            const card = completedReleaseLinks[linkIndex]
            if (card && isReleaseContent(card.content)) {
              const content = card.content as ReleaseCardContent
              if (content.afterCountdownUrl && isPreview) {
                window.open(content.afterCountdownUrl, '_blank', 'noopener,noreferrer')
              } else if (onCardClick) {
                onCardClick(card.id)
              }
            }
          } else {
            // Unreleased release - navigate to release screen
            const releaseIndex = selectedIndex - menuCards.length - completedReleaseLinks.length
            goToRelease(releaseIndex)
          }
        } else {
          // On socials screen, open the URL
          const icon = socialIcons[selectedIndex]
          if (icon?.url) {
            window.open(icon.url, '_blank', 'noopener,noreferrer')
          }
        }
        break
      case 'Escape':
      case 'Backspace':
        e.preventDefault()
        if (currentScreen !== 'main') {
          goBack()
        }
        break
    }
  }, [selectedIndex, menuCards, completedReleaseLinks, releaseCards, socialIcons, currentScreen, activateLink, isPreview, onCardClick])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Click wheel handlers
  const handleWheelClick = (direction: 'up' | 'down' | 'center' | 'menu') => {
    let menuLength = 0
    if (currentScreen === 'main') {
      menuLength = menuCards.length + completedReleaseLinks.length + releaseCards.length
    } else if (currentScreen === 'socials') {
      menuLength = socialIcons.length
    } else if (currentScreen === 'release' || currentScreen === 'nowplaying') {
      // On release/nowplaying screen, only menu button works (go back)
      if (direction === 'menu' || direction === 'center') {
        goBack()
      }
      return
    }

    switch (direction) {
      case 'up':
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : menuLength - 1))
        break
      case 'down':
        setSelectedIndex(prev => (prev < menuLength - 1 ? prev + 1 : 0))
        break
      case 'center':
        if (currentScreen === 'main') {
          if (selectedIndex < menuCards.length) {
            // Regular menu card
            const card = menuCards[selectedIndex]
            if (card?.card_type === 'social-icons') {
              goToSocials()
            } else if (card?.card_type === 'audio') {
              goToNowPlaying(card)
            } else if (card) {
              activateLink(card)
            }
          } else if (selectedIndex < menuCards.length + completedReleaseLinks.length) {
            // Completed release - open URL
            const linkIndex = selectedIndex - menuCards.length
            const card = completedReleaseLinks[linkIndex]
            if (card && isReleaseContent(card.content)) {
              const content = card.content as ReleaseCardContent
              if (content.afterCountdownUrl && isPreview) {
                window.open(content.afterCountdownUrl, '_blank', 'noopener,noreferrer')
              } else if (onCardClick) {
                onCardClick(card.id)
              }
            }
          } else {
            // Unreleased release - navigate to release screen
            const releaseIndex = selectedIndex - menuCards.length - completedReleaseLinks.length
            goToRelease(releaseIndex)
          }
        } else {
          // On socials screen, open the URL
          const icon = socialIcons[selectedIndex]
          if (icon?.url) {
            window.open(icon.url, '_blank', 'noopener,noreferrer')
          }
        }
        break
      case 'menu':
        // Menu button goes back
        if (currentScreen !== 'main') {
          goBack()
        }
        break
    }
  }

  // Calculate angle from center of wheel
  const getAngleFromCenter = (clientX: number, clientY: number, rect: DOMRect) => {
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const x = clientX - centerX
    const y = clientY - centerY
    return Math.atan2(y, x) * (180 / Math.PI)
  }

  // Handle wheel rotation (circular scrolling)
  const handleWheelMove = useCallback((clientX: number, clientY: number) => {
    const wheel = wheelRef.current
    if (!wheel) return

    // No scrolling on release/nowplaying screen
    if (currentScreen === 'release' || currentScreen === 'nowplaying') return

    let menuLength = 0
    if (currentScreen === 'main') {
      menuLength = menuCards.length + completedReleaseLinks.length + releaseCards.length
    } else if (currentScreen === 'socials') {
      menuLength = socialIcons.length
    }

    const rect = wheel.getBoundingClientRect()
    const currentAngle = getAngleFromCenter(clientX, clientY, rect)

    if (lastAngleRef.current !== null) {
      // Calculate angle difference
      let delta = currentAngle - lastAngleRef.current

      // Handle wrap-around at -180/180 boundary
      if (delta > 180) delta -= 360
      if (delta < -180) delta += 360

      accumulatedRotation.current += delta

      // Check if we've rotated enough to move an item
      if (Math.abs(accumulatedRotation.current) >= DEGREES_PER_ITEM) {
        const direction = accumulatedRotation.current > 0 ? 1 : -1
        const steps = Math.floor(Math.abs(accumulatedRotation.current) / DEGREES_PER_ITEM)

        setSelectedIndex(prev => {
          let newIndex = prev + (direction * steps)
          // Wrap around
          if (newIndex < 0) newIndex = menuLength + (newIndex % menuLength)
          if (newIndex >= menuLength) newIndex = newIndex % menuLength
          return newIndex
        })

        // Keep remainder rotation
        accumulatedRotation.current = accumulatedRotation.current % DEGREES_PER_ITEM
      }
    }

    lastAngleRef.current = currentAngle
  }, [menuCards.length, completedReleaseLinks.length, releaseCards.length, socialIcons.length, currentScreen])

  // Mouse handlers for wheel
  const handleWheelMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    const rect = wheelRef.current?.getBoundingClientRect()
    if (rect) {
      lastAngleRef.current = getAngleFromCenter(e.clientX, e.clientY, rect)
      accumulatedRotation.current = 0
    }

    const handleMouseMove = (e: MouseEvent) => {
      handleWheelMove(e.clientX, e.clientY)
    }

    const handleMouseUp = () => {
      lastAngleRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Touch handlers for wheel
  const handleWheelTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    const rect = wheelRef.current?.getBoundingClientRect()
    if (rect) {
      lastAngleRef.current = getAngleFromCenter(touch.clientX, touch.clientY, rect)
      accumulatedRotation.current = 0
    }
  }

  const handleWheelTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    handleWheelMove(touch.clientX, touch.clientY)
  }

  const handleWheelTouchEnd = () => {
    lastAngleRef.current = null
  }

  // Sticker drag handlers
  const handleStickerMouseDown = (e: React.MouseEvent, stickerId: string) => {
    if (!isPreview) return
    e.preventDefault()
    e.stopPropagation()
    const sticker = ipodStickers.find(s => s.id === stickerId)
    if (!sticker) return
    setDraggingSticker(stickerId)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      stickerX: sticker.x,
      stickerY: sticker.y,
    }
  }

  const handleStickerMouseMove = (e: React.MouseEvent) => {
    if (!draggingSticker || !dragStartRef.current || !ipodRef.current) return
    const rect = ipodRef.current.getBoundingClientRect()
    const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100
    const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100
    const newX = Math.max(0, Math.min(100, dragStartRef.current.stickerX + deltaX))
    const newY = Math.max(0, Math.min(100, dragStartRef.current.stickerY + deltaY))
    updateIpodSticker(draggingSticker, { x: newX, y: newY })
  }

  const handleStickerMouseUp = () => {
    if (draggingSticker && isPreview && window.parent !== window) {
      const sticker = ipodStickers.find(s => s.id === draggingSticker)
      if (sticker) {
        window.parent.postMessage(
          { type: "UPDATE_IPOD_STICKER", payload: { id: sticker.id, x: sticker.x, y: sticker.y } },
          window.location.origin
        )
      }
    }
    setDraggingSticker(null)
    dragStartRef.current = null
  }

  let displayTitle = title || 'Menu'
  if (currentScreen === 'socials') {
    displayTitle = 'Socials'
  } else if (currentScreen === 'nowplaying') {
    displayTitle = 'Now Playing'
  } else if (currentScreen === 'release') {
    const releaseCard = releaseCards[activeReleaseIndex]
    if (releaseCard && isReleaseContent(releaseCard.content)) {
      const content = releaseCard.content as ReleaseCardContent
      displayTitle = content.releaseTitle || 'Release'
      // Truncate if too long for title bar
      if (displayTitle.length > 20) {
        displayTitle = displayTitle.substring(0, 17) + '...'
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full z-10 overflow-hidden"
    >
      {/* Background layer (solid/image/video) */}
      <PageBackground />
      <DimOverlay />
      <NoiseOverlay />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        {/* iPod Container */}
        <div
          ref={ipodRef}
          className="ipod-container"
          onMouseMove={handleStickerMouseMove}
          onMouseUp={handleStickerMouseUp}
          onMouseLeave={handleStickerMouseUp}
        >
          {/* Texture overlay */}
          {ipodTexture && (
            <img
              src={ipodTexture}
              alt=""
              className="ipod-texture-overlay"
            />
          )}

          {/* Screen Bezel */}
          <div className="ipod-screen-bezel">
            {/* LCD Screen */}
            <div className="ipod-screen">
              {/* Title Bar - Arrow | Title | Battery */}
              <div className="ipod-title-bar">
                {(currentScreen === 'socials' || currentScreen === 'release' || currentScreen === 'nowplaying') ? (
                  <span className="text-[11px] cursor-pointer" onClick={goBack}>◀</span>
                ) : (
                  <span className="text-[11px]">▶</span>
                )}
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
                {currentScreen === 'main' ? (
                  // Main menu - show cards + releases
                  (menuCards.length === 0 && releaseCards.length === 0) ? (
                    <div className="flex items-center justify-center h-full text-[13px] text-gray-500">
                      No links
                    </div>
                  ) : (
                    <>
                      {menuCards.map((card, index) => {
                        const isSelected = selectedIndex === index
                        const displayText = card.card_type === 'social-icons' ? 'Socials' : (card.title || card.card_type)
                        const isLongText = displayText.length > 25

                        // Text cards render as non-interactive section dividers
                        if (card.card_type === 'text') {
                          return (
                            <div
                              key={card.id}
                              className="ipod-menu-item opacity-60"
                              style={{ cursor: 'default' }}
                            >
                              <span className="flex-1 text-[11px] text-center overflow-hidden whitespace-nowrap">
                                — {displayText} —
                              </span>
                            </div>
                          )
                        }

                        return (
                          <div
                            key={card.id}
                            className={cn(
                              'ipod-menu-item',
                              isSelected && 'selected'
                            )}
                            onClick={() => {
                              if (selectedIndex === index) {
                                // Already selected - activate
                                if (card.card_type === 'social-icons') {
                                  goToSocials()
                                } else if (card.card_type === 'audio') {
                                  goToNowPlaying(card)
                                } else {
                                  activateLink(card)
                                }
                              } else {
                                setSelectedIndex(index)
                              }
                            }}
                          >
                            <span className="flex-1 text-[12px] overflow-hidden whitespace-nowrap">
                              <span className={cn(isSelected && isLongText && 'ipod-marquee')}>
                                {displayText}
                              </span>
                            </span>
                            <span className="text-[11px] ml-2">{card.card_type === 'audio' ? '\u266B' : '>'}</span>
                          </div>
                        )
                      })}
                      {/* Completed releases show as regular links */}
                      {completedReleaseLinks.map((card, linkIndex) => {
                        const index = menuCards.length + linkIndex
                        const isSelected = selectedIndex === index
                        const content = card.content as ReleaseCardContent
                        const displayText = content.afterCountdownText || 'OUT NOW'
                        const isLongText = displayText.length > 25

                        return (
                          <div
                            key={card.id}
                            className={cn(
                              'ipod-menu-item',
                              isSelected && 'selected'
                            )}
                            onClick={() => {
                              if (selectedIndex === index) {
                                // Already selected - open URL
                                const url = content.afterCountdownUrl
                                if (url && isPreview) {
                                  window.open(url, '_blank', 'noopener,noreferrer')
                                } else if (onCardClick) {
                                  onCardClick(card.id)
                                }
                              } else {
                                setSelectedIndex(index)
                              }
                            }}
                          >
                            <span className="flex-1 text-[12px] overflow-hidden whitespace-nowrap">
                              <span className={cn(isSelected && isLongText && 'ipod-marquee')}>
                                {displayText}
                              </span>
                            </span>
                            <span className="text-[11px] ml-2">{'>'}</span>
                          </div>
                        )
                      })}
                      {/* Unreleased releases - navigate to release screen */}
                      {releaseCards.map((card, releaseIndex) => {
                        const index = menuCards.length + completedReleaseLinks.length + releaseIndex
                        const isSelected = selectedIndex === index
                        const content = card.content as ReleaseCardContent
                        const displayText = content.releaseTitle || 'Upcoming Release'
                        const isLongText = displayText.length > 25

                        return (
                          <div
                            key={card.id}
                            className={cn(
                              'ipod-menu-item',
                              isSelected && 'selected'
                            )}
                            onClick={() => {
                              if (selectedIndex === index) {
                                // Already selected - navigate to release screen
                                goToRelease(releaseIndex)
                              } else {
                                setSelectedIndex(index)
                              }
                            }}
                          >
                            <span className="flex-1 text-[12px] overflow-hidden whitespace-nowrap">
                              <span className={cn(isSelected && isLongText && 'ipod-marquee')}>
                                {displayText}
                              </span>
                            </span>
                            <span className="text-[11px] ml-2">{'>'}</span>
                          </div>
                        )
                      })}
                    </>
                  )
                ) : currentScreen === 'socials' ? (
                  // Socials screen - show social icons as menu items
                  socialIcons.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-[13px] text-gray-500">
                      No socials
                    </div>
                  ) : (
                    socialIcons.map((icon, index) => {
                      const isSelected = selectedIndex === index
                      const displayText = SOCIAL_PLATFORMS[icon.platform]?.label || icon.platform
                      const isLongText = displayText.length > 25

                      return (
                        <div
                          key={icon.id}
                          className={cn(
                            'ipod-menu-item',
                            isSelected && 'selected'
                          )}
                          onClick={() => {
                            if (selectedIndex === index) {
                              // Already selected - open URL
                              if (icon.url) {
                                window.open(icon.url, '_blank', 'noopener,noreferrer')
                              }
                            } else {
                              setSelectedIndex(index)
                            }
                          }}
                        >
                          <span className="flex-1 text-[12px] overflow-hidden whitespace-nowrap">
                            <span className={cn(isSelected && isLongText && 'ipod-marquee')}>
                              {displayText}
                            </span>
                          </span>
                          <span className="text-[11px] ml-2">{'>'}</span>
                        </div>
                      )
                    })
                  )
                ) : currentScreen === 'release' ? (
                  // Release screen - show release details with countdown
                  (() => {
                    const releaseCard = releaseCards[activeReleaseIndex]
                    if (!releaseCard || !isReleaseContent(releaseCard.content)) {
                      return (
                        <div className="flex items-center justify-center h-full text-[13px] text-gray-500">
                          No release data
                        </div>
                      )
                    }

                    const content = releaseCard.content as ReleaseCardContent
                    const {
                      albumArtUrl,
                      releaseTitle,
                      artistName,
                      releaseDate,
                      preSaveUrl,
                      preSaveButtonText = 'Pre-save',
                      afterCountdownAction = 'custom',
                      afterCountdownText = 'OUT NOW',
                      afterCountdownUrl
                    } = content

                    const isReleased = releaseDate ? new Date(releaseDate) <= new Date() : false

                    // Countdown renderer for iPod style - uses Pix Chicago for authentic look
                    const ipodCountdownRenderer = ({ days, hours, minutes, seconds, completed }: CountdownRenderProps) => {
                      if (completed || isReleased) return null
                      return (
                        <div className="text-[12px] font-bold text-center tracking-wide" style={{ fontFamily: 'var(--font-chicago), system-ui' }}>
                          {days > 0 ? `${days}D ` : ''}{String(hours).padStart(2, '0')}H {String(minutes).padStart(2, '0')}M {String(seconds).padStart(2, '0')}S
                        </div>
                      )
                    }

                    return (
                      <div className="flex flex-col h-full" style={{ color: 'var(--theme-text, #3d3c39)' }}>
                        {/* Top section - album art and info */}
                        <div className="flex-1 flex flex-col items-center justify-center px-3 py-2">
                          {/* Album art - small dithered image */}
                          {albumArtUrl && (
                            <img
                              src={albumArtUrl}
                              alt={releaseTitle || 'Release'}
                              className="w-16 h-16 object-cover mb-2"
                              style={{ imageRendering: 'pixelated', filter: 'contrast(1.2) grayscale(1)' }}
                            />
                          )}

                          {/* Release title and artist */}
                          {releaseTitle && (
                            <div className="text-[11px] font-bold text-center leading-tight max-w-full">
                              {releaseTitle.length > 25 ? releaseTitle.substring(0, 22) + '...' : releaseTitle}
                            </div>
                          )}
                          {artistName && (
                            <div className="text-[9px] text-center max-w-full opacity-70">
                              {artistName.length > 25 ? artistName.substring(0, 22) + '...' : artistName}
                            </div>
                          )}

                          {/* Countdown with label */}
                          {releaseDate && (
                            <div className="mt-3 text-center">
                              <div className="text-[8px] uppercase tracking-wider mb-1">Drops In</div>
                              <Countdown
                                date={new Date(releaseDate)}
                                renderer={ipodCountdownRenderer}
                              />
                            </div>
                          )}
                        </div>

                        {/* Pre-save button - styled like selected menu item, at bottom */}
                        {preSaveUrl && (
                          <a
                            href={preSaveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ipod-menu-item selected text-[11px] justify-between mt-auto"
                            onClick={(e) => !isPreview && e.preventDefault()}
                          >
                            <span>{preSaveButtonText}</span>
                            <span className="text-[10px] ml-2">{'>'}</span>
                          </a>
                        )}
                      </div>
                    )
                  })()
                ) : currentScreen === 'nowplaying' ? (
                  activeAudioCard ? (
                    <div className="flex flex-col">
                      <AudioCard
                        card={activeAudioCard}
                        isPreview={isPreview}
                        themeIdOverride="ipod-classic"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[13px] text-gray-500">
                      No audio
                    </div>
                  )
                ) : null}
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
              ▶ ❙❙
            </button>

            {/* Center Button */}
            <button
              className="ipod-center-button"
              onClick={() => handleWheelClick('center')}
            />

            {/* Touch Wheel for scrolling - circular drag to scroll */}
            <div
              ref={wheelRef}
              className="ipod-touch-wheel"
              onMouseDown={handleWheelMouseDown}
              onTouchStart={handleWheelTouchStart}
              onTouchMove={handleWheelTouchMove}
              onTouchEnd={handleWheelTouchEnd}
            />
          </div>

          {/* Logo - User's logo (if enabled) or Rainbow Apple, hidden if showLogo is false */}
          <div className="ipod-apple-logo">
            {showLogo && (
              logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{
                    width: `${(logoScale / 100) * 56}px`,
                    height: `${(logoScale / 100) * 56}px`,
                    objectFit: 'contain',
                    background: 'none',
                  }}
                />
              ) : (
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
              )
            )}
          </div>

          {/* Draggable stickers - can overflow edges */}
          {ipodStickers.map((sticker) => (
            <img
              key={sticker.id}
              src={sticker.src}
              alt=""
              className={cn(
                "absolute pointer-events-auto",
                sticker.behindText ? "z-[0]" : "z-[9000]",
                isPreview && "cursor-grab",
                draggingSticker === sticker.id && "cursor-grabbing"
              )}
              style={{
                left: `${sticker.x}%`,
                top: `${sticker.y}%`,
                transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
                width: '80px',
                height: 'auto',
                userSelect: 'none',
                opacity: 0.9,
                mixBlendMode: 'multiply',
              }}
              onMouseDown={(e) => handleStickerMouseDown(e, sticker.id)}
              draggable={false}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
