'use client'

import { useCallback, useMemo } from 'react'
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
  // We need to map the theme font variable to a usable font name
  const resolvedFont = useMemo(() => {
    // Map common theme font variables to their font names
    // These are the fonts defined in the theme system
    const fontMap: Record<string, string> = {
      'var(--font-inter)': 'Inter',
      'var(--font-dm-sans)': 'DM Sans',
      'var(--font-space-grotesk)': 'Space Grotesk',
      'var(--font-outfit)': 'Outfit',
      'var(--font-plus-jakarta)': 'Plus Jakarta Sans',
      'var(--font-geist-sans)': 'Geist Sans',
    }
    return fontMap[themeFont] || 'sans-serif'
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
      <div className="relative w-full aspect-video overflow-hidden bg-muted flex items-center justify-center">
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
    return (
      <div className={`relative w-full overflow-hidden ${isSmall ? 'h-[250px]' : 'h-[400px]'}`}>
        <CircularGallery
          items={items}
          bend={content.bend ?? 1.5}
          borderRadius={content.borderRadius ?? 0.05}
          scrollSpeed={content.scrollSpeed ?? 1.5}
          scrollEase={content.scrollEase ?? 0.03}
          spacing={isSmall ? (content.spacing ?? 2.5) * 0.7 : (content.spacing ?? 2.5)}
          textColor={content.captionColor || "#ffffff"}
          font={`16px ${resolvedFont}, sans-serif`}
          onTap={handleTap}
          showCaptions={content.showCaptions !== false}
        />
      </div>
    )
  }

  // Carousel style — editable in preview (inside editor iframe)
  const isInEditor = typeof window !== 'undefined' && window.parent !== window
  return (
    <div className="w-full overflow-hidden">
      <EmblaCarouselGallery
        images={content.images}
        editable={isPreview && isInEditor}
        cardId={card.id}
      />
    </div>
  )
}
