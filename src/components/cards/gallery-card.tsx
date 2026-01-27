'use client'

import { CircularGallery } from '@/components/ui/circular-gallery'
import { EmblaCarouselGallery } from '@/components/ui/embla-carousel'
import { ImageIcon } from 'lucide-react'
import type { Card, GalleryCardContent } from '@/types/card'

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
    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden">
        <CircularGallery
          images={content.images.map(img => img.url)}
          scrollEase={content.scrollEase}
          scrollSpeed={content.scrollSpeed}
          borderRadius={content.borderRadius}
          bend={content.bend}
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
