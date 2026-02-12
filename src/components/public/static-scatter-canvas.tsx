'use client'

import { useEffect, useRef, useState } from 'react'
import { CardRenderer } from '@/components/cards/card-renderer'
import { AudioPlayer } from '@/components/audio/audio-player'
import { SystemSettingsCard } from '@/components/cards/system-settings-card'
import type { Card } from '@/types/card'
import type { ScatterPosition } from '@/types/scatter'
import { isAudioContent } from '@/types/card'
import type { AudioCardContent } from '@/types/audio'
import { cn } from '@/lib/utils'

interface StaticScatterCanvasProps {
  cards: Card[]
  themeId: string
  visitorDrag?: boolean
}

interface DragOffset {
  x: number
  y: number
}

const FIT_CONTENT_TYPES = new Set(['text', 'social-icons'])

/**
 * StaticScatterCanvas - Renders cards in scatter layout on public pages.
 *
 * Uses the same rendering approach as the editor (transform: translate + scale)
 * so positions match exactly between editor preview and public page.
 *
 * Regular cards render at container width, CSS-scaled to their stored width %.
 * Fit-content cards (text, social-icons) render at natural width with scale multiplier.
 */
export function StaticScatterCanvas({ cards, themeId, visitorDrag = false }: StaticScatterCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  // Ephemeral drag offsets (reset on refresh)
  const [dragOffsets, setDragOffsets] = useState<Record<string, DragOffset>>({})
  const [isDragging, setIsDragging] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [dragDistance, setDragDistance] = useState(0)

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerWidth(rect.width)
        setContainerHeight(rect.height)
      }
    }

    updateDimensions()

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions()
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Filter visible cards
  const visibleCards = cards.filter(c => c.is_visible)

  // Handle pointer/touch drag start
  const handleDragStart = (e: React.PointerEvent, cardId: string) => {
    if (!visitorDrag) return

    setIsDragging(cardId)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragDistance(0)
    e.preventDefault()
  }

  // Handle pointer/touch drag move
  const handleDragMove = (e: React.PointerEvent) => {
    if (!visitorDrag || !isDragging || !dragStart) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    setDragDistance(distance)

    if (distance >= 8) {
      const currentOffset = dragOffsets[isDragging] || { x: 0, y: 0 }
      setDragOffsets({
        ...dragOffsets,
        [isDragging]: {
          x: currentOffset.x + deltaX,
          y: currentOffset.y + deltaY,
        },
      })
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  // Handle pointer/touch drag end
  const handleDragEnd = (e: React.PointerEvent) => {
    if (!visitorDrag || !isDragging) return

    if (dragDistance < 8) {
      setIsDragging(null)
      setDragStart(null)
      setDragDistance(0)
      return
    }

    e.preventDefault()
    e.stopPropagation()
    setIsDragging(null)
    setDragStart(null)
    setDragDistance(0)
  }

  // Empty state
  if (visibleCards.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg text-muted-foreground">
        <p>No cards yet.</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onPointerMove={handleDragMove}
      onPointerUp={handleDragEnd}
      onPointerLeave={handleDragEnd}
    >
      {visibleCards.map((card) => {
        // Get scatter position for this theme
        const scatterLayouts = (card.content.scatterLayouts as Record<string, ScatterPosition>) || {}
        const scatterPos = scatterLayouts[themeId]

        // Fall back to stacked vertical layout if no scatter position
        if (!scatterPos) {
          return (
            <div
              key={card.id}
              data-card-id={card.id}
              className="w-full mb-4"
            >
              <CardRenderer card={card} themeId={themeId} />
            </div>
          )
        }

        // Use same rendering as editor: transform translate + scale
        const isFitContent = FIT_CONTENT_TYPES.has(card.card_type)
        const pixelX = containerWidth > 0 ? (scatterPos.x / 100) * containerWidth : 0
        const pixelY = containerHeight > 0 ? (scatterPos.y / 100) * containerHeight : 0
        const scale = scatterPos.width / 100

        // Apply ephemeral drag offset if visitor drag is enabled
        const offset = dragOffsets[card.id] || { x: 0, y: 0 }
        const dragTranslate = visitorDrag ? `translate(${offset.x}px, ${offset.y}px) ` : ''

        // Audio cards: render AudioPlayer directly with correct themeVariant
        if (card.card_type === 'audio' && isAudioContent(card.content)) {
          const audioContent = card.content as AudioCardContent
          const variantMap: Record<string, string> = {
            'system-settings': 'system-settings',
            'mac-os': 'mac-os',
            'macintosh': 'mac-os',
            'instagram-reels': 'instagram-reels',
          }
          const themeVariant = (variantMap[themeId] || 'instagram-reels') as 'instagram-reels' | 'mac-os' | 'system-settings'

          const audioPlayer = (
            <AudioPlayer
              tracks={audioContent.tracks || []}
              albumArtUrl={audioContent.albumArtUrl}
              showWaveform={audioContent.showWaveform ?? true}
              looping={audioContent.looping ?? false}
              reverbConfig={audioContent.reverbConfig}
              playerColors={audioContent.playerColors}
              cardId={card.id}
              pageId={card.page_id}
              themeVariant={themeVariant}
            />
          )

          // System Settings: wrap in SystemSettingsCard
          if (themeId === 'system-settings') {
            return (
              <div
                key={card.id}
                data-card-id={card.id}
                className={cn(
                  'absolute',
                  visitorDrag && 'cursor-move'
                )}
                style={{
                  width: containerWidth || '100%',
                  transform: `${dragTranslate}translate(${pixelX}px, ${pixelY}px) scale(${scale})`,
                  transformOrigin: 'top left',
                  zIndex: scatterPos.zIndex,
                  touchAction: visitorDrag ? 'none' : undefined,
                }}
                onPointerDown={(e) => handleDragStart(e, card.id)}
              >
                <SystemSettingsCard cardType="audio">
                  {audioPlayer}
                </SystemSettingsCard>
              </div>
            )
          }

          // Default wrapper for other themes
          return (
            <div
              key={card.id}
              data-card-id={card.id}
              className={cn(
                'absolute',
                visitorDrag && 'cursor-move'
              )}
              style={{
                width: containerWidth || '100%',
                transform: `${dragTranslate}translate(${pixelX}px, ${pixelY}px) scale(${scale})`,
                transformOrigin: 'top left',
                zIndex: scatterPos.zIndex,
                touchAction: visitorDrag ? 'none' : undefined,
              }}
              onPointerDown={(e) => handleDragStart(e, card.id)}
            >
              <div
                className="w-full overflow-hidden bg-theme-card-bg border border-theme-border"
                style={{ borderRadius: 'var(--theme-border-radius)' }}
              >
                {audioPlayer}
              </div>
            </div>
          )
        }

        // All other card types: use CardRenderer with matching transform approach
        return (
          <div
            key={card.id}
            data-card-id={card.id}
            className={cn(
              'absolute',
              visitorDrag && 'cursor-move'
            )}
            style={{
              width: isFitContent ? 'fit-content' : (containerWidth || '100%'),
              maxWidth: isFitContent ? (containerWidth || '100%') : undefined,
              transform: `${dragTranslate}translate(${pixelX}px, ${pixelY}px) scale(${scale})`,
              transformOrigin: 'top left',
              zIndex: scatterPos.zIndex,
              touchAction: visitorDrag ? 'none' : undefined,
            }}
            onPointerDown={(e) => handleDragStart(e, card.id)}
          >
            <CardRenderer card={card} themeId={themeId} />
          </div>
        )
      })}
    </div>
  )
}
