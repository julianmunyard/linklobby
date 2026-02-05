'use client'

import { useState, useRef, useEffect } from 'react'
import type { Card, ReleaseCardContent } from '@/types/card'
import { isReleaseContent } from '@/types/card'
import type { SocialPlatform } from '@/types/profile'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/theme-store'
import { useProfileStore } from '@/stores/profile-store'
import { Globe, Mail, Music } from 'lucide-react'
import {
  SiInstagram, SiTiktok, SiYoutube, SiSpotify, SiX,
  SiSoundcloud, SiApplemusic, SiBandcamp, SiAmazonmusic,
  SiFacebook, SiThreads, SiBluesky, SiSnapchat, SiPinterest, SiLinkedin, SiWhatsapp,
  SiTwitch, SiKick, SiDiscord,
  SiPatreon, SiVenmo, SiCashapp, SiPaypal
} from 'react-icons/si'
import type { ComponentType } from 'react'
import Countdown, { CountdownRenderProps } from 'react-countdown'

type IconComponent = ComponentType<{ className?: string }>

const PLATFORM_ICONS: Record<SocialPlatform, IconComponent> = {
  instagram: SiInstagram,
  tiktok: SiTiktok,
  youtube: SiYoutube,
  spotify: SiSpotify,
  twitter: SiX,
  soundcloud: SiSoundcloud,
  applemusic: SiApplemusic,
  bandcamp: SiBandcamp,
  deezer: Music,
  amazonmusic: SiAmazonmusic,
  facebook: SiFacebook,
  threads: SiThreads,
  bluesky: SiBluesky,
  snapchat: SiSnapchat,
  pinterest: SiPinterest,
  linkedin: SiLinkedin,
  whatsapp: SiWhatsapp,
  twitch: SiTwitch,
  kick: SiKick,
  discord: SiDiscord,
  website: Globe,
  email: Mail,
  patreon: SiPatreon,
  venmo: SiVenmo,
  cashapp: SiCashapp,
  paypal: SiPaypal,
}

// Social platform URL patterns to filter from card list
const SOCIAL_URL_PATTERNS = [
  /instagram\.com/i,
  /tiktok\.com/i,
  /youtube\.com\/@/i,
  /youtube\.com\/channel/i,
  /youtube\.com\/c\//i,
  /open\.spotify\.com\/artist/i,
  /twitter\.com/i,
  /x\.com/i,
  /soundcloud\.com/i,
  /music\.apple\.com/i,
  /bandcamp\.com/i,
  /deezer\.com/i,
  /facebook\.com/i,
  /threads\.net/i,
  /bsky\.app/i,
  /snapchat\.com/i,
  /pinterest\.com/i,
  /linkedin\.com/i,
  /wa\.me/i,
  /whatsapp\.com/i,
  /twitch\.tv/i,
  /kick\.com/i,
  /discord\.gg/i,
  /discord\.com\/invite/i,
  /patreon\.com/i,
  /venmo\.com/i,
  /cash\.app/i,
  /paypal\.me/i,
]

function isSocialUrl(url: string | null): boolean {
  if (!url) return false
  return SOCIAL_URL_PATTERNS.some(pattern => pattern.test(url))
}

interface ReceiptLayoutProps {
  title: string
  cards: Card[]
  isPreview?: boolean
  onCardClick?: (cardId: string) => void
  selectedCardId?: string | null
}

/**
 * Receipt Layout - Renders cards as a thermal printer receipt
 *
 * Features:
 * - Dithered black & white photo (thermal print effect)
 * - Receipt-style formatting with dot leaders
 * - Torn paper edges
 * - Barcode at bottom
 * - Date/time stamp
 */
export function ReceiptLayout({
  title,
  cards,
  isPreview = false,
  onCardClick,
  selectedCardId
}: ReceiptLayoutProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0)
  const [completedReleases, setCompletedReleases] = useState<Set<string>>(new Set())
  const [ditheredPhoto, setDitheredPhoto] = useState<string | null>(null)
  const headingSize = useThemeStore((s) => s.fonts.headingSize)
  const bodySize = useThemeStore((s) => s.fonts.bodySize)
  const receiptPrice = useThemeStore((s) => s.receiptPrice)
  const receiptStickers = useThemeStore((s) => s.receiptStickers)
  const receiptFloatAnimation = useThemeStore((s) => s.receiptFloatAnimation)
  const updateReceiptSticker = useThemeStore((s) => s.updateReceiptSticker)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const receiptPaperRef = useRef<HTMLDivElement>(null)
  const [draggingSticker, setDraggingSticker] = useState<string | null>(null)
  const dragStartRef = useRef<{ x: number; y: number; stickerX: number; stickerY: number } | null>(null)

  // Profile data
  const avatarUrl = useProfileStore((s) => s.avatarUrl)
  const showAvatar = useProfileStore((s) => s.showAvatar)
  const displayName = useProfileStore((s) => s.displayName)
  const bio = useProfileStore((s) => s.bio)
  const socialIcons = useProfileStore((s) => s.socialIcons)
  const showSocialIcons = useProfileStore((s) => s.showSocialIcons)

  // Filter release cards separately
  const releaseCards = cards.filter(c => {
    if (c.is_visible === false || c.card_type !== 'release' || !isReleaseContent(c.content)) return false
    const content = c.content as ReleaseCardContent
    if (completedReleases.has(c.id)) return false
    if (content.releaseDate && content.afterCountdownAction === 'hide') {
      const isReleased = new Date(content.releaseDate) <= new Date()
      if (isReleased) return false
    }
    return true
  })

  // Filter to only visible cards, exclude social-icons, release cards, and social platform URLs (shown as icons)
  const visibleCards = cards.filter(c =>
    c.is_visible !== false &&
    c.card_type !== 'social-icons' &&
    c.card_type !== 'release' &&
    !isSocialUrl(c.url)
  )

  // Font sizes
  const titleFontSize = `${(headingSize || 2.0)}rem`
  const linkSize = `${(bodySize || 1.2)}rem`

  // Use stable values to avoid hydration mismatch
  const [receiptData, setReceiptData] = useState({
    number: '000000',
    date: '00/00/0000',
    time: '00:00'
  })

  // Generate receipt data on client only
  useEffect(() => {
    const now = new Date()
    setReceiptData({
      number: Math.floor(Math.random() * 900000 + 100000).toString(),
      date: now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      time: now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    })
  }, [])

  // Dither the photo when avatar changes
  useEffect(() => {
    if (!avatarUrl || !showAvatar) {
      setDitheredPhoto(null)
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set canvas size (receipt width)
      const width = 280
      const height = Math.round((img.height / img.width) * width)
      canvas.width = width
      canvas.height = height

      // Draw image
      ctx.drawImage(img, 0, 0, width, height)

      // Get image data
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data

      // Apply Floyd-Steinberg dithering
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4

          // Convert to grayscale
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114

          // Apply threshold
          const newValue = gray < 128 ? 0 : 255
          const error = gray - newValue

          // Set pixel
          data[i] = data[i + 1] = data[i + 2] = newValue

          // Distribute error (Floyd-Steinberg)
          if (x + 1 < width) {
            const ri = (y * width + x + 1) * 4
            data[ri] += error * 7 / 16
            data[ri + 1] += error * 7 / 16
            data[ri + 2] += error * 7 / 16
          }
          if (y + 1 < height) {
            if (x > 0) {
              const li = ((y + 1) * width + x - 1) * 4
              data[li] += error * 3 / 16
              data[li + 1] += error * 3 / 16
              data[li + 2] += error * 3 / 16
            }
            const bi = ((y + 1) * width + x) * 4
            data[bi] += error * 5 / 16
            data[bi + 1] += error * 5 / 16
            data[bi + 2] += error * 5 / 16
            if (x + 1 < width) {
              const bri = ((y + 1) * width + x + 1) * 4
              data[bri] += error * 1 / 16
              data[bri + 1] += error * 1 / 16
              data[bri + 2] += error * 1 / 16
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0)
      setDitheredPhoto(canvas.toDataURL())
    }
    img.src = avatarUrl
  }, [avatarUrl, showAvatar])

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
      if (card.url && !isPreview) {
        window.open(card.url, '_blank', 'noopener,noreferrer')
      } else if (onCardClick) {
        onCardClick(card.id)
      }
    }
  }

  const handleCardClick = (card: Card, index: number) => {
    setFocusedIndex(index)
    if (card.url && !isPreview) {
      window.open(card.url, '_blank', 'noopener,noreferrer')
    } else if (onCardClick) {
      onCardClick(card.id)
    }
  }

  // Sticker drag handlers
  const handleStickerMouseDown = (e: React.MouseEvent, stickerId: string) => {
    if (!isPreview) return // Only allow dragging in editor preview, not public page
    e.preventDefault()
    e.stopPropagation()
    const sticker = receiptStickers.find(s => s.id === stickerId)
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
    if (!draggingSticker || !dragStartRef.current || !receiptPaperRef.current) return
    const rect = receiptPaperRef.current.getBoundingClientRect()
    const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100
    const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100
    const newX = Math.max(0, Math.min(100, dragStartRef.current.stickerX + deltaX))
    const newY = Math.max(0, Math.min(100, dragStartRef.current.stickerY + deltaY))
    updateReceiptSticker(draggingSticker, { x: newX, y: newY })
  }

  const handleStickerMouseUp = () => {
    // Send final position to parent editor so it persists
    if (draggingSticker && isPreview && window.parent !== window) {
      const sticker = receiptStickers.find(s => s.id === draggingSticker)
      if (sticker) {
        window.parent.postMessage(
          { type: "UPDATE_STICKER", payload: { id: sticker.id, x: sticker.x, y: sticker.y } },
          window.location.origin
        )
      }
    }
    setDraggingSticker(null)
    dragStartRef.current = null
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full z-10 overflow-x-hidden overflow-y-auto"
      onKeyDown={handleKeyDown}
      onMouseMove={draggingSticker ? handleStickerMouseMove : undefined}
      onMouseUp={draggingSticker ? handleStickerMouseUp : undefined}
      onMouseLeave={draggingSticker ? handleStickerMouseUp : undefined}
      tabIndex={0}
    >
      {/* Receipt paper */}
      <div className="flex justify-center py-8 px-4">
        <div
          ref={receiptPaperRef}
          className={cn("receipt-paper relative", receiptFloatAnimation && "receipt-float")}
          style={{
            backgroundColor: 'var(--theme-card-bg)',
            color: 'var(--theme-text)',
            fontFamily: 'var(--font-ticket-de-caisse)',
          }}
        >
          {/* Torn top edge */}
          <div className="receipt-torn-edge receipt-torn-top" />

          {/* Receipt content */}
          <div className="receipt-content">
            {/* Store header */}
            <div className="text-center mb-4">
              <div
                className="uppercase tracking-widest mb-1"
                style={{
                  fontFamily: 'var(--font-hypermarket)',
                  fontSize: titleFontSize,
                }}
              >
                {title || 'STORE'}
              </div>
              {bio && (
                <div className="text-xs opacity-70 mb-2">{bio}</div>
              )}
              <div className="receipt-divider">{'='.repeat(60)}</div>
            </div>

            {/* Dithered photo */}
            {showAvatar && ditheredPhoto && (
              <div className="flex justify-center my-4">
                <img
                  src={ditheredPhoto}
                  alt=""
                  className="receipt-photo"
                  style={{ maxWidth: '100%' }}
                />
              </div>
            )}

            {/* Receipt details */}
            <div className="text-xs mb-4 space-y-1">
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{receiptData.date}</span>
              </div>
              <div className="flex justify-between">
                <span>TIME:</span>
                <span>{receiptData.time}</span>
              </div>
              <div className="flex justify-between">
                <span>RECEIPT #:</span>
                <span>{receiptData.number}</span>
              </div>
            </div>

            <div className="receipt-divider">{'-'.repeat(60)}</div>

            {/* Links as items */}
            <div className="my-4 space-y-2">
              {visibleCards.map((card, index) => {
                const isFocused = focusedIndex === index
                const displayText = card.title || card.card_type

                return (
                  <button
                    key={card.id}
                    className="w-full text-left py-1 px-2 cursor-pointer focus:outline-none text-sm font-bold group"
                    onClick={() => handleCardClick(card, index)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="truncate flex-1 group-hover:underline">{displayText}</span>
                      <span className="receipt-dots flex-shrink-0 mx-2">
                        {'.' .repeat(Math.max(3, 20 - displayText.length))}
                      </span>
                      <span className="font-mono">&gt;</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Release section */}
            {releaseCards.map((card) => {
              if (!isReleaseContent(card.content)) return null
              const content = card.content as ReleaseCardContent
              const {
                releaseTitle,
                artistName,
                releaseDate,
                preSaveUrl,
                preSaveButtonText = 'PRE-SAVE',
                afterCountdownAction = 'custom',
                afterCountdownText = 'OUT NOW',
                afterCountdownUrl
              } = content

              const isReleased = releaseDate ? new Date(releaseDate) <= new Date() : false

              // Receipt countdown renderer - compact format with seconds
              const receiptCountdownRenderer = ({ days, hours, minutes, seconds, completed }: CountdownRenderProps) => {
                if (completed || isReleased) {
                  if (afterCountdownAction === 'hide' && !completedReleases.has(card.id)) {
                    setCompletedReleases(prev => new Set(prev).add(card.id))
                  }
                  return null
                }
                return (
                  <div className="text-sm font-bold font-mono tabular-nums">
                    {days > 0 ? `${days}D ` : ''}{String(hours).padStart(2, '0')}H {String(minutes).padStart(2, '0')}M {String(seconds).padStart(2, '0')}S
                  </div>
                )
              }

              return (
                <div key={card.id}>
                  <div className="receipt-divider">{'-'.repeat(60)}</div>
                  <div className="my-4 text-center">
                    {/* Header changes based on release state */}
                    <div className="font-bold mb-2">
                      {isReleased && afterCountdownAction === 'custom' ? '** NEW RELEASE **' : '** UPCOMING RELEASE **'}
                    </div>

                    {/* Title/artist info only before release */}
                    {!isReleased && (
                      <>
                        {releaseTitle && <div className="text-xs">{releaseTitle.toUpperCase()}</div>}
                        {artistName && <div className="text-xs">{artistName.toUpperCase()}</div>}
                      </>
                    )}

                    {/* Countdown (only before release) */}
                    {!isReleased && releaseDate && (
                      <div className="my-2">
                        <div className="text-xs mb-1">DROPS IN:</div>
                        <Countdown
                          date={new Date(releaseDate)}
                          renderer={receiptCountdownRenderer}
                          onComplete={() => {
                            if (afterCountdownAction === 'hide') {
                              setCompletedReleases(prev => new Set(prev).add(card.id))
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* Pre-save button (before release) */}
                    {!isReleased && preSaveUrl && (
                      <button
                        className="w-full text-left py-1 px-2 group"
                        onClick={() => {
                          if (!isPreview) {
                            window.open(preSaveUrl, '_blank', 'noopener,noreferrer')
                          }
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="group-hover:underline">({preSaveButtonText.toUpperCase()}</span>
                          <span className="receipt-dots flex-shrink-0 mx-2">
                            {'.' .repeat(15)}
                          </span>
                          <span>&gt;)</span>
                        </div>
                      </button>
                    )}

                    {/* Custom message link (after release) - simple centered link */}
                    {isReleased && afterCountdownAction === 'custom' && (
                      afterCountdownUrl ? (
                        <button
                          className="font-bold text-sm mt-2 hover:underline"
                          onClick={() => {
                            if (!isPreview) {
                              window.open(afterCountdownUrl, '_blank', 'noopener,noreferrer')
                            }
                          }}
                        >
                          ({(afterCountdownText || 'LISTEN NOW').toUpperCase()})
                        </button>
                      ) : (
                        <div className="font-bold text-sm mt-2">({(afterCountdownText || 'OUT NOW').toUpperCase()})</div>
                      )
                    )}
                  </div>
                </div>
              )
            })}

            <div className="receipt-divider">{'-'.repeat(60)}</div>

            {/* Total */}
            <div className="my-4 space-y-1">
              <div className="flex justify-between text-sm font-bold">
                <span>TOTAL LINKS:</span>
                <span>{visibleCards.length}</span>
              </div>
              {receiptPrice && (
                <div className="flex justify-between text-sm font-bold">
                  <span>PRICE:</span>
                  <span>{receiptPrice}</span>
                </div>
              )}
            </div>

            <div className="receipt-divider">{'='.repeat(60)}</div>

            {/* Social Icons */}
            {showSocialIcons && socialIcons.length > 0 && (
              <>
                <div className="flex justify-center flex-wrap gap-4 my-4">
                  {socialIcons.map((icon) => {
                    const IconComponent = PLATFORM_ICONS[icon.platform]
                    if (!IconComponent) return null
                    return (
                      <a
                        key={icon.id}
                        href={icon.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-80 hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconComponent className="w-5 h-5" />
                      </a>
                    )
                  })}
                </div>
                <div className="receipt-divider">{'-'.repeat(60)}</div>
              </>
            )}

            {/* Barcode */}
            <div className="text-center my-4">
              <img
                src="/images/receipt-barcode.png"
                alt="Barcode"
                className="mx-auto h-14 object-contain"
              />
            </div>

            {/* Footer */}
            <div className="text-center text-xs opacity-70 mt-4">
              <div>THANK YOU FOR VISITING</div>
              <div className="mt-1">PLEASE COME AGAIN</div>
            </div>
          </div>

          {/* Torn bottom edge */}
          <div className="receipt-torn-edge receipt-torn-bottom" />

          {/* Draggable stickers - rendered after content so they appear on top */}
          {receiptStickers.map((sticker) => (
            <img
              key={sticker.id}
              src={sticker.src}
              alt=""
              className={cn(
                "absolute pointer-events-auto",
                sticker.behindText ? "z-[1]" : "z-[9000]",
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
                opacity: 1,
              }}
              onMouseDown={(e) => handleStickerMouseDown(e, sticker.id)}
              draggable={false}
            />
          ))}
        </div>
      </div>

      {/* Hidden canvas for dithering */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
