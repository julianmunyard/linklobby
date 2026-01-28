'use client'

import { useCallback, useMemo, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { EmblaCarouselGallery } from '@/components/ui/embla-carousel'
import { ImageIcon } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'
import type { Card, GalleryCardContent } from '@/types/card'

// Dynamic import for CircularGallery (uses WebGL - must be client-only)
const CircularGallery = dynamic(
  () => import('@/components/CircularGallery'),
  { ssr: false, loading: () => <div className="w-full h-full bg-muted/50 animate-pulse rounded-xl" /> }
)

interface GalleryCardProps {
  card: Card
  isPreview?: boolean
}

export function GalleryCard({ card, isPreview = false }: GalleryCardProps) {
  const content = card.content as Partial<GalleryCardContent>
  const isSmall = card.size === 'small'
  const themeFont = useThemeStore((state) => state.fonts.body)
  const fontSize = useThemeStore((state) => state.cardTypeFontSizes.gallery)

  // Resolve CSS variable to actual font family for WebGL
  const [resolvedFont, setResolvedFont] = useState('sans-serif')
  useEffect(() => {
    if (typeof document !== 'undefined' && themeFont.startsWith('var(')) {
      const match = themeFont.match(/var\((--[^)]+)\)/)
      if (match) {
        const computed = getComputedStyle(document.body).getPropertyValue(match[1]).trim()
        if (computed) setResolvedFont(computed)
      }
    } else if (themeFont) {
      setResolvedFont(themeFont)
    }
  }, [themeFont])

  // Memoize items to prevent unnecessary WebGL recreations
  const items = useMemo(() => {
    if (!content.images) return []
    return content.images.map(img => ({
      image: img.url,
      text: img.caption || '',
      link: img.link || null
    }))
  }, [content.images])

  // Memoize tap handler to prevent unnecessary WebGL recreations
  const handleTap = useCallback((link: string | null) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer')
    }
  }, [])

  // No images yet - show empty state
  if (!content.images || content.images.length === 0) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
          <p>Add images to gallery</p>
          <p className="text-sm mt-1">Up to 10 images</p>
        </div>
      </div>
    )
  }

  // Render based on gallery style (default to circular)
  if (content.galleryStyle !== 'carousel') {

    // For small cards: shorter height, allow overflow with fade edges
    return (
      <div className={`relative w-full ${isSmall ? 'h-[250px]' : 'h-[400px]'}`}>
        <div
          className="w-full h-full"
          style={{
            overflow: isSmall ? 'visible' : 'hidden',
          }}
        >
          <CircularGallery
            items={items}
            bend={content.bend ?? 1.5}
            borderRadius={content.borderRadius ?? 0.05}
            scrollSpeed={content.scrollSpeed ?? 1.5}
            scrollEase={content.scrollEase ?? 0.03}
            spacing={isSmall ? (content.spacing ?? 2.5) * 0.7 : (content.spacing ?? 2.5)}
            textColor={content.captionColor || "#ffffff"}
            font={resolvedFont}
            onTap={handleTap}
            showCaptions={content.showCaptions !== false}
          />
        </div>
        {/* Fade edges for small cards */}
        {isSmall && (
          <>
            <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
            <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
            <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
          </>
        )}
      </div>
    )
  }

  // Carousel style (default)
  return (
    <div className="w-full rounded-xl overflow-hidden">
      <EmblaCarouselGallery images={content.images} />
    </div>
  )
}
