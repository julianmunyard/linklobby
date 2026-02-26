'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

import type { GalleryImage } from '@/types/card'

interface EmblaCarouselGalleryProps {
  images: GalleryImage[]
  className?: string
}

export function EmblaCarouselGallery({ images, className }: EmblaCarouselGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  if (images.length === 0) {
    return null
  }

  return (
    <div className={cn('relative', className)}>
      {/* Carousel viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y touch-pinch-zoom">
          {images.map((image) => {
            const zoom = image.zoom ?? 1
            const posX = image.positionX ?? 50
            const posY = image.positionY ?? 50
            return (
              <div key={image.id} className="flex-[0_0_100%] min-w-0">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    style={{
                      transform: zoom > 1 ? `scale(${zoom})` : undefined,
                      objectPosition: `${posX}% ${posY}%`,
                    }}
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation buttons */}
      {canScrollPrev && (
        <button
          onClick={scrollPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors shadow-md z-10"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canScrollNext && (
        <button
          onClick={scrollNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors shadow-md z-10"
          aria-label="Next image"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
