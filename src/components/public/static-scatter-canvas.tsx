'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { CardRenderer } from '@/components/cards/card-renderer'
import { AudioPlayer } from '@/components/audio/audio-player'
import { SystemSettingsCard } from '@/components/cards/system-settings-card'
import type { Card } from '@/types/card'
import { isAudioContent } from '@/types/card'
import type { AudioCardContent } from '@/types/audio'
import type { ScatterPosition } from '@/types/scatter'
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
  const [referenceHeight, setReferenceHeight] = useState(0)  // Width-based reference for y-coordinate mapping (matches editor preview)

  // Ephemeral drag offsets (reset on refresh)
  const [dragOffsets, setDragOffsets] = useState<Record<string, DragOffset>>({})
  const [isDragging, setIsDragging] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [dragDistance, setDragDistance] = useState(0)

  // referenceHeight is derived from containerWidth so the coordinate system
  // is purely width-relative — identical to the editor preview.
  useEffect(() => {
    if (containerWidth > 0) {
      setReferenceHeight(containerWidth)
    }
  }, [containerWidth])

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width)
      }
    }

    updateWidth()

    const resizeObserver = new ResizeObserver(updateWidth)
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
    if (!visitorDrag || !isDragging || !dragStart || !containerRef.current) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    setDragDistance(distance)

    if (distance >= 8) {
      const currentOffset = dragOffsets[isDragging] || { x: 0, y: 0 }
      let newX = currentOffset.x + deltaX
      let newY = currentOffset.y + deltaY

      // Clamp so card stays within container boundaries
      const card = visibleCards.find(c => c.id === isDragging)
      if (card) {
        const scatterLayouts = (card.content.scatterLayouts as Record<string, ScatterPosition>) || {}
        const scatterPos = scatterLayouts[themeId]
        if (scatterPos && containerWidth > 0 && referenceHeight > 0) {
          const cardRenderW = containerWidth
          const scale = scatterPos.width / 100
          const storedPxX = (scatterPos.x / 100) * containerWidth
          const storedPxY = (scatterPos.y / 100) * referenceHeight
          const isFit = FIT_CONTENT_TYPES.has(card.card_type)
          const cardEl = containerRef.current.querySelector(`[data-card-id="${isDragging}"]`) as HTMLElement | null
          const elW = cardEl ? cardEl.offsetWidth : (isFit ? 0 : cardRenderW)
          const visualW = elW * scale
          const visualH = cardEl ? cardEl.offsetHeight * scale : 0
          const maxPxX = Math.max(0, containerWidth - visualW)
          const maxPxY = visualH > 0 ? Math.max(0, referenceHeight - visualH) : referenceHeight
          const totalX = storedPxX + newX
          const totalY = storedPxY + newY
          newX = Math.max(0, Math.min(maxPxX, totalX)) - storedPxX
          newY = Math.max(0, Math.min(maxPxY, totalY)) - storedPxY
        }
      }

      setDragOffsets({
        ...dragOffsets,
        [isDragging]: { x: newX, y: newY },
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

  // Dynamic min-height: at least viewport, grows to contain all cards
  const dynamicMinHeight = useMemo(() => {
    if (referenceHeight === 0) return '100vh'
    let maxBottom = 0
    visibleCards.forEach(card => {
      const layouts = (card.content.scatterLayouts as Record<string, ScatterPosition>) || {}
      const pos = layouts[themeId]
      if (pos) {
        const pixelY = (pos.y / 100) * referenceHeight
        maxBottom = Math.max(maxBottom, pixelY + referenceHeight * 0.5)
      }
    })
    // Use CSS max() so canvas is always at least viewport height
    return maxBottom > 0 ? `max(100vh, ${maxBottom}px)` : '100vh'
  }, [visibleCards, themeId, referenceHeight])

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
      className="relative w-full select-none"
      style={{ minHeight: dynamicMinHeight, WebkitUserSelect: 'none' } as React.CSSProperties}
      onPointerMove={handleDragMove}
      onPointerUp={handleDragEnd}
      onPointerLeave={handleDragEnd}
    >
      {containerWidth > 0 && referenceHeight > 0 && (() => {
        // Card content renders at full container width (same as editor preview).
        // Scale is then applied via CSS transform to match the stored width %.
        const CARD_RENDER_WIDTH = containerWidth

        return visibleCards.map((card) => {
        // Get scatter position for this theme
        const scatterLayouts = (card.content.scatterLayouts as Record<string, ScatterPosition>) || {}
        const scatterPos = scatterLayouts[themeId]

        // Audio cards: ALWAYS render AudioPlayer directly, bypassing CardRenderer/AudioCard.
        // AudioCard relies on Zustand store (useThemeStore) not available on public pages.
        // This must happen BEFORE the scatterPos check — cards without saved positions
        // still need direct AudioPlayer rendering to work on public pages.
        // Matches the same pattern used in StaticFlowGrid.
        if (card.card_type === 'audio' && isAudioContent(card.content)) {
          const audioContent = card.content as AudioCardContent
          const variantMap: Record<string, string> = {
            'system-settings': 'system-settings',
            'vcr-menu': 'vcr-menu',
            'receipt': 'receipt',
            'classified': 'classified',
            'departures-board': 'classified',
            'departures-board-led': 'classified',
            'mac-os': 'mac-os',
            'macintosh': 'mac-os',
            'ipod-classic': 'ipod-classic',
            'instagram-reels': 'instagram-reels',
          }
          const themeVariant = (variantMap[themeId] || 'instagram-reels') as 'instagram-reels' | 'mac-os' | 'system-settings' | 'receipt' | 'ipod-classic' | 'vcr-menu' | 'classified'

          const audioPlayer = (
            <AudioPlayer
              tracks={audioContent.tracks || []}
              albumArtUrl={audioContent.albumArtUrl}
              showWaveform={audioContent.showWaveform ?? true}
              looping={audioContent.looping ?? false}
              autoplay={audioContent.autoplay ?? false}
              reverbConfig={audioContent.reverbConfig}
              playerColors={audioContent.playerColors}
              cardId={card.id}
              pageId={card.page_id}
              themeVariant={themeVariant}
            />
          )

          const audioInner = themeId === 'system-settings'
            ? <SystemSettingsCard cardType="audio">{audioPlayer}</SystemSettingsCard>
            : (
              <div
                className="overflow-hidden bg-theme-card-bg border border-theme-border"
                style={{ borderRadius: 'var(--theme-border-radius)' }}
              >
                {audioPlayer}
              </div>
            )

          // If card has a scatter position, render absolutely positioned
          if (scatterPos) {
            const scale = scatterPos.width / 100
            const pixelX = (scatterPos.x / 100) * containerWidth
            const pixelY = (scatterPos.y / 100) * referenceHeight
            const offset = dragOffsets[card.id] || { x: 0, y: 0 }
            const dragTranslate = visitorDrag ? `translate(${offset.x}px, ${offset.y}px) ` : ''

            return (
              <div
                key={card.id}
                data-card-id={card.id}
                className="absolute"
                style={{
                  width: CARD_RENDER_WIDTH,
                  transform: `${dragTranslate}translate(${pixelX}px, ${pixelY}px) scale(${scale})`,
                  transformOrigin: 'top left',
                  zIndex: scatterPos.zIndex,
                }}
              >
                {audioInner}
              </div>
            )
          }

          // No scatter position — stacked fallback (still bypass CardRenderer)
          return (
            <div key={card.id} data-card-id={card.id} className="w-full mb-4" style={{ maxWidth: CARD_RENDER_WIDTH }}>
              {audioInner}
            </div>
          )
        }

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

        // Card content renders at CARD_RENDER_WIDTH (phone-like), then scale
        // is applied on top. Positions use the full viewport.
        const isFitContent = FIT_CONTENT_TYPES.has(card.card_type)
        const scale = scatterPos.width / 100
        const pixelX = (scatterPos.x / 100) * containerWidth
        const pixelY = (scatterPos.y / 100) * referenceHeight

        // Apply ephemeral drag offset if visitor drag is enabled
        const offset = dragOffsets[card.id] || { x: 0, y: 0 }
        const dragTranslate = visitorDrag ? `translate(${offset.x}px, ${offset.y}px) ` : ''

        // All other card types: use CardRenderer
        return (
          <div
            key={card.id}
            data-card-id={card.id}
            className={cn(
              'absolute',
              visitorDrag && 'cursor-move'
            )}
            style={{
              width: isFitContent ? 'fit-content' : CARD_RENDER_WIDTH,
              maxWidth: isFitContent ? CARD_RENDER_WIDTH : undefined,
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
      })
      })()}
    </div>
  )
}
