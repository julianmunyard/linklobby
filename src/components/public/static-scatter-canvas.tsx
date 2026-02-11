'use client'

import { useState } from 'react'
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

/**
 * StaticScatterCanvas - Renders cards in scatter (freeform) layout on public pages
 *
 * Two modes:
 * 1. Static mode (visitorDrag=false): Pure CSS absolute positioning - server-renderable
 * 2. Interactive mode (visitorDrag=true): Client-side drag with ephemeral positioning
 *
 * Features:
 * - Reads scatter positions from card.content.scatterLayouts[themeId]
 * - Percentage-based positioning (0-100% of canvas dimensions)
 * - Visitor drag is ephemeral (resets on refresh)
 * - Click vs drag distinction: < 8px = click (follows link), >= 8px = drag
 * - Cards stay within container bounds during drag
 */
export function StaticScatterCanvas({ cards, themeId, visitorDrag = false }: StaticScatterCanvasProps) {
  // Ephemeral drag offsets (reset on refresh)
  const [dragOffsets, setDragOffsets] = useState<Record<string, DragOffset>>({})
  const [isDragging, setIsDragging] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [dragDistance, setDragDistance] = useState(0)

  // Filter visible cards
  const visibleCards = cards.filter(c => c.is_visible)


  // Handle pointer/touch drag start
  const handleDragStart = (e: React.PointerEvent, cardId: string) => {
    if (!visitorDrag) return

    const clientX = e.clientX
    const clientY = e.clientY

    setIsDragging(cardId)
    setDragStart({ x: clientX, y: clientY })
    setDragDistance(0)

    // Prevent default to avoid text selection
    e.preventDefault()
  }

  // Handle pointer/touch drag move
  const handleDragMove = (e: React.PointerEvent) => {
    if (!visitorDrag || !isDragging || !dragStart) return

    const clientX = e.clientX
    const clientY = e.clientY

    const deltaX = clientX - dragStart.x
    const deltaY = clientY - dragStart.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    setDragDistance(distance)

    // Only update position if we've moved >= 8px (drag threshold)
    if (distance >= 8) {
      const currentOffset = dragOffsets[isDragging] || { x: 0, y: 0 }
      setDragOffsets({
        ...dragOffsets,
        [isDragging]: {
          x: currentOffset.x + deltaX,
          y: currentOffset.y + deltaY,
        },
      })
      setDragStart({ x: clientX, y: clientY })
    }
  }

  // Handle pointer/touch drag end
  const handleDragEnd = (e: React.PointerEvent) => {
    if (!visitorDrag || !isDragging) return

    // If drag distance < 8px, treat as click (don't prevent link navigation)
    if (dragDistance < 8) {
      // Let the click event propagate normally
      setIsDragging(null)
      setDragStart(null)
      setDragDistance(0)
      return
    }

    // Prevent click event after drag
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

        // Clamp positions so cards stay within canvas bounds
        const clampedX = Math.max(0, Math.min(scatterPos.x, 100 - scatterPos.width))
        const clampedY = Math.max(0, Math.min(scatterPos.y, 100 - (scatterPos.height || 0)))

        // Apply ephemeral drag offset if visitor drag is enabled
        const offset = dragOffsets[card.id] || { x: 0, y: 0 }

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
                  left: `${clampedX}%`,
                  top: `${clampedY}%`,
                  width: `${scatterPos.width}%`,
                  height: `${scatterPos.height}%`,
                  zIndex: scatterPos.zIndex,
                  transform: visitorDrag ? `translate(${offset.x}px, ${offset.y}px)` : undefined,
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
                left: `${clampedX}%`,
                top: `${clampedY}%`,
                width: `${scatterPos.width}%`,
                height: `${scatterPos.height}%`,
                zIndex: scatterPos.zIndex,
                transform: visitorDrag ? `translate(${offset.x}px, ${offset.y}px)` : undefined,
                touchAction: visitorDrag ? 'none' : undefined,
              }}
              onPointerDown={(e) => handleDragStart(e, card.id)}
            >
              <div
                className="w-full h-full overflow-hidden bg-theme-card-bg border border-theme-border"
                style={{ borderRadius: 'var(--theme-border-radius)' }}
              >
                {audioPlayer}
              </div>
            </div>
          )
        }

        // All other card types: use CardRenderer
        return (
          <div
            key={card.id}
            data-card-id={card.id}
            className={cn(
              'absolute overflow-hidden',
              visitorDrag && 'cursor-move'
            )}
            style={{
              left: `${clampedX}%`,
              top: `${clampedY}%`,
              width: `${scatterPos.width}%`,
              height: `${scatterPos.height}%`,
              zIndex: scatterPos.zIndex,
              transform: visitorDrag ? `translate(${offset.x}px, ${offset.y}px)` : undefined,
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
