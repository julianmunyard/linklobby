'use client'

import dynamic from 'next/dynamic'
import { EmblaCarouselGallery } from '@/components/ui/embla-carousel'
import { ImageIcon } from 'lucide-react'
import type { Card, GalleryCardContent } from '@/types/card'

// Dynamic import for CircularGallery (uses WebGL - must be client-only)
const CircularGallery = dynamic(
  () => import('@/components/CircularGallery'),
  { ssr: false }
)

interface GalleryCardProps {
  card: Card
  isPreview?: boolean
}

export function GalleryCard({ card, isPreview = false }: GalleryCardProps) {
  const content = card.content as Partial<GalleryCardContent>

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

  // Render based on gallery style
  if (content.galleryStyle === 'circular') {
    // Transform images to CircularGallery format: { image, text }
    const items = content.images.map(img => ({
      image: img.url,
      text: img.alt || ''
    }))

    return (
      <div className="w-full h-[400px]">
        <CircularGallery
          items={items}
          bend={content.bend ?? 2}
          borderRadius={content.borderRadius ?? 0.25}
          scrollSpeed={content.scrollSpeed ?? 0.5}
          scrollEase={content.scrollEase ?? 0.14}
          textColor="#ffffff"
        />
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
