'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

import type { GalleryImage } from '@/types/card'

interface EmblaCarouselGalleryProps {
  images: GalleryImage[]
  className?: string
  /** When true, enables drag-to-reposition and zoom controls on each slide */
  editable?: boolean
  /** Card ID — required for editable mode to send postMessage updates */
  cardId?: string
}

/** Posts an image update to the parent editor frame */
function postImageUpdate(cardId: string, imageId: string, updates: Partial<GalleryImage>) {
  if (typeof window === 'undefined' || window.parent === window) return
  window.parent.postMessage(
    { type: 'UPDATE_GALLERY_IMAGE', payload: { cardId, imageId, ...updates } },
    window.location.origin
  )
}

/** Clamp position so the zoomed image never shows empty space */
function clampPosition(pos: number, zoom: number): number {
  if (zoom <= 1) return 50
  const maxOffset = ((zoom - 1) / zoom) * 50
  return Math.max(50 - maxOffset, Math.min(50 + maxOffset, pos))
}

export function EmblaCarouselGallery({ images, className, editable = false, cardId }: EmblaCarouselGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

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

  if (images.length === 0) return null

  return (
    <div className={cn('relative', className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y touch-pinch-zoom">
          {images.map((image, idx) => (
            <div key={image.id} className="flex-[0_0_100%] min-w-0">
              {editable && cardId ? (
                <EditableSlide
                  image={image}
                  cardId={cardId}
                  isEditing={editingIndex === idx}
                  onStartEdit={() => { setEditingIndex(idx); emblaApi?.reInit({ watchDrag: false }) }}
                  onStopEdit={() => { setEditingIndex(null); emblaApi?.reInit({ watchDrag: true }) }}
                />
              ) : (
                <StaticSlide image={image} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons — hidden while editing a slide */}
      {editingIndex === null && canScrollPrev && (
        <button
          onClick={scrollPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors shadow-md z-10"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {editingIndex === null && canScrollNext && (
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

/** Static (non-editable) slide — used on public pages */
function StaticSlide({ image }: { image: GalleryImage }) {
  const zoom = image.zoom ?? 1
  const posX = image.positionX ?? 50
  const posY = image.positionY ?? 50

  return (
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
  )
}

/** Editable slide — drag to reposition, zoom controls, crosshair */
function EditableSlide({
  image,
  cardId,
  isEditing,
  onStartEdit,
  onStopEdit,
}: {
  image: GalleryImage
  cardId: string
  isEditing: boolean
  onStartEdit: () => void
  onStopEdit: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null)

  const zoom = image.zoom ?? 1
  const posX = image.positionX ?? 50
  const posY = image.positionY ?? 50

  // Zoom in/out by 0.25 increments
  const handleZoom = useCallback((delta: number) => {
    const newZoom = Math.max(1, Math.min(3, (image.zoom ?? 1) + delta))
    const updates: Partial<GalleryImage> = { zoom: newZoom }
    if (newZoom <= 1) {
      updates.positionX = 50
      updates.positionY = 50
    } else {
      // Re-clamp position for new zoom
      updates.positionX = clampPosition(image.positionX ?? 50, newZoom)
      updates.positionY = clampPosition(image.positionY ?? 50, newZoom)
    }
    postImageUpdate(cardId, image.id, updates)
  }, [cardId, image.id, image.zoom, image.positionX, image.positionY])

  const handleReset = useCallback(() => {
    postImageUpdate(cardId, image.id, { zoom: 1, positionX: 50, positionY: 50 })
  }, [cardId, image.id])

  // Drag to reposition
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (zoom <= 1) return
    e.preventDefault()
    e.stopPropagation()
    isDragging.current = true

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    dragStart.current = { x: clientX, y: clientY, posX, posY }

    const handleMove = (ev: MouseEvent | TouchEvent) => {
      if (!isDragging.current || !dragStart.current || !containerRef.current) return
      ev.preventDefault()

      const mx = 'touches' in ev ? ev.touches[0].clientX : ev.clientX
      const my = 'touches' in ev ? ev.touches[0].clientY : ev.clientY
      const rect = containerRef.current.getBoundingClientRect()

      const dx = ((mx - dragStart.current.x) / rect.width) * 100
      const dy = ((my - dragStart.current.y) / rect.height) * 100

      const newPosX = clampPosition(dragStart.current.posX - dx, zoom)
      const newPosY = clampPosition(dragStart.current.posY - dy, zoom)

      postImageUpdate(cardId, image.id, { positionX: newPosX, positionY: newPosY })
    }

    const handleEnd = () => {
      isDragging.current = false
      dragStart.current = null
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleEnd)
  }, [zoom, posX, posY, cardId, image.id])

  // Scroll to zoom when editing
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!isEditing) return
    e.preventDefault()
    e.stopPropagation()
    const delta = e.deltaY < 0 ? 0.15 : -0.15
    handleZoom(delta)
  }, [isEditing, handleZoom])

  return (
    <div
      ref={containerRef}
      className="relative aspect-square overflow-hidden"
      style={{ cursor: isEditing && zoom > 1 ? 'grab' : isEditing ? 'zoom-in' : 'pointer' }}
      onClick={(e) => {
        if (!isEditing) {
          e.stopPropagation()
          onStartEdit()
        }
      }}
      onMouseDown={isEditing ? handleDragStart : undefined}
      onTouchStart={isEditing ? handleDragStart : undefined}
      onWheel={handleWheel}
    >
      <Image
        src={image.url}
        alt={image.alt}
        fill
        className="object-cover pointer-events-none"
        style={{
          transform: zoom > 1 ? `scale(${zoom})` : undefined,
          objectPosition: `${posX}% ${posY}%`,
        }}
        sizes="(max-width: 768px) 100vw, 600px"
      />

      {/* Crosshair overlay when editing */}
      {isEditing && (
        <>
          {/* Crosshair lines */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/40" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/40" />
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-black/70 rounded-full px-2 py-1">
            <button
              onClick={(e) => { e.stopPropagation(); handleZoom(-0.25) }}
              className="text-white p-1 hover:bg-white/20 rounded-full disabled:opacity-30"
              disabled={zoom <= 1}
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-white text-xs min-w-[32px] text-center">{zoom.toFixed(1)}x</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleZoom(0.25) }}
              className="text-white p-1 hover:bg-white/20 rounded-full disabled:opacity-30"
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            {zoom > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); handleReset() }}
                className="text-white p-1 hover:bg-white/20 rounded-full"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Done button */}
          <button
            onClick={(e) => { e.stopPropagation(); onStopEdit() }}
            className="absolute top-3 right-3 z-30 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/90"
          >
            Done
          </button>
        </>
      )}
    </div>
  )
}
