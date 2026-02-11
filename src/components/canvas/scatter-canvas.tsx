'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Card } from '@/types/card'
import { useThemeStore } from '@/stores/theme-store'
import { usePageStore } from '@/stores/page-store'
import { ScatterCard } from './scatter-card'

interface ScatterCanvasProps {
  cards: Card[]
}

export function ScatterCanvas({ cards }: ScatterCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasWidth, setCanvasWidth] = useState(0)
  const [canvasHeight, setCanvasHeight] = useState(0)
  const [maxZIndex, setMaxZIndex] = useState(0)
  const [boundsKey, setBoundsKey] = useState(0)

  // Read from stores
  const themeId = useThemeStore((state) => state.themeId)
  const selectedCardId = usePageStore((state) => state.selectedCardId)
  const updateCardScatterPosition = usePageStore((state) => state.updateCardScatterPosition)
  const initializeScatterLayout = usePageStore((state) => state.initializeScatterLayout)
  const selectCard = usePageStore((state) => state.selectCard)

  // Initialize scatter layout on mount and theme change
  useEffect(() => {
    initializeScatterLayout(themeId)
  }, [themeId, initializeScatterLayout])

  // Measure canvas dimensions with ResizeObserver
  useEffect(() => {
    if (!canvasRef.current) return

    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setCanvasWidth(rect.width)
        setCanvasHeight(rect.height)
      }
    }

    // Initial measurement
    updateDimensions()

    // Set up ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions()
      // Increment bounds key to force react-rnd to recalculate bounds
      setBoundsKey((k) => k + 1)
    })

    resizeObserver.observe(canvasRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Calculate max z-index from all cards for current theme
  useEffect(() => {
    let max = 0
    cards.forEach((card) => {
      const scatterLayouts = (card.content.scatterLayouts as Record<string, { zIndex: number }>) || {}
      const pos = scatterLayouts[themeId]
      if (pos && pos.zIndex > max) {
        max = pos.zIndex
      }
    })
    setMaxZIndex(max)
  }, [cards, themeId])

  // Convert pixel position to percentage and update store
  const handleDragStop = useCallback((cardId: string, pixelX: number, pixelY: number) => {
    if (canvasWidth === 0 || canvasHeight === 0) return

    const percentX = (pixelX / canvasWidth) * 100
    const percentY = (pixelY / canvasHeight) * 100

    updateCardScatterPosition(cardId, themeId, { x: percentX, y: percentY })
  }, [canvasWidth, canvasHeight, themeId, updateCardScatterPosition])

  // Convert pixel dimensions to percentage and update store
  const handleResizeStop = useCallback((
    cardId: string,
    pixelW: number,
    pixelH: number,
    pixelX: number,
    pixelY: number
  ) => {
    if (canvasWidth === 0 || canvasHeight === 0) return

    const percentW = (pixelW / canvasWidth) * 100
    const percentH = (pixelH / canvasHeight) * 100
    const percentX = (pixelX / canvasWidth) * 100
    const percentY = (pixelY / canvasHeight) * 100

    updateCardScatterPosition(cardId, themeId, {
      x: percentX,
      y: percentY,
      width: percentW,
      height: percentH,
    })
  }, [canvasWidth, canvasHeight, themeId, updateCardScatterPosition])

  // Bring card to front by incrementing z-index
  const handleBringToFront = useCallback((cardId: string) => {
    const newZ = maxZIndex + 1
    updateCardScatterPosition(cardId, themeId, { zIndex: newZ })
    setMaxZIndex(newZ)
  }, [maxZIndex, themeId, updateCardScatterPosition])

  // Handle canvas background click to deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only deselect if clicking the canvas background (not a card)
    if (e.target === e.currentTarget) {
      selectCard(null)
    }
  }, [selectCard])

  // Filter visible cards only
  const visibleCards = cards.filter((card) => card.is_visible)

  return (
    <div
      ref={canvasRef}
      className="relative w-full min-h-full overflow-hidden"
      style={{ touchAction: 'none' }}
      onClick={handleCanvasClick}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none z-[999]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '8.333% 8.333%',
          }}
        />
      </div>

      {/* Render cards with react-rnd */}
      {canvasWidth > 0 && canvasHeight > 0 && visibleCards.map((card) => (
        <ScatterCard
          key={`${card.id}-${boundsKey}`}
          card={card}
          themeId={themeId}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          maxZIndex={maxZIndex}
          isSelected={selectedCardId === card.id}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          onBringToFront={handleBringToFront}
          onSelect={selectCard}
        />
      ))}
    </div>
  )
}
