'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Move, MousePointer } from 'lucide-react'
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
  const [arrangeMode, setArrangeMode] = useState(true)

  // Read from stores
  const themeId = useThemeStore((state) => state.themeId)
  const selectedCardId = usePageStore((state) => state.selectedCardId)
  const updateCardScatterPosition = usePageStore((state) => state.updateCardScatterPosition)
  const selectCard = usePageStore((state) => state.selectCard)

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

  // Send scatter position update to parent editor via postMessage
  const sendScatterUpdate = useCallback((cardId: string, position: Record<string, number>) => {
    // Update local page store (for immediate re-render in preview)
    updateCardScatterPosition(cardId, themeId, position)
    // Also notify parent editor so editor's page store stays in sync
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'SCATTER_POSITION_UPDATE', payload: { cardId, themeId, position } },
        window.location.origin
      )
    }
  }, [themeId, updateCardScatterPosition])

  // Convert pixel position to percentage and update store
  const handleDragStop = useCallback((cardId: string, pixelX: number, pixelY: number) => {
    if (canvasWidth === 0 || canvasHeight === 0) return

    const percentX = (pixelX / canvasWidth) * 100
    const percentY = (pixelY / canvasHeight) * 100

    sendScatterUpdate(cardId, { x: percentX, y: percentY })
  }, [canvasWidth, canvasHeight, sendScatterUpdate])

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

    sendScatterUpdate(cardId, {
      x: percentX,
      y: percentY,
      width: percentW,
      height: percentH,
    })
  }, [canvasWidth, canvasHeight, sendScatterUpdate])

  // Bring card to front by incrementing z-index
  const handleBringToFront = useCallback((cardId: string) => {
    const newZ = maxZIndex + 1
    sendScatterUpdate(cardId, { zIndex: newZ })
    setMaxZIndex(newZ)
  }, [maxZIndex, sendScatterUpdate])

  // Handle card selection — in edit mode, also notify parent for property editing
  const handleSelect = useCallback((cardId: string) => {
    selectCard(cardId)
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'SELECT_CARD', payload: { cardId } },
        window.location.origin
      )
    }
  }, [selectCard])

  // Handle canvas background click to deselect — only in edit mode
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (arrangeMode) return
    if (e.target === e.currentTarget) {
      selectCard(null)
      if (window.parent !== window) {
        window.parent.postMessage(
          { type: 'SELECT_CARD', payload: { cardId: null } },
          window.location.origin
        )
      }
    }
  }, [selectCard, arrangeMode])

  // Filter visible cards only
  const visibleCards = cards.filter((card) => card.is_visible)

  return (
    <div
      ref={canvasRef}
      className="relative w-full min-h-screen overflow-hidden"
      style={{ touchAction: arrangeMode ? 'none' : 'auto' }}
      onClick={(e) => {
        e.stopPropagation()
        handleCanvasClick(e)
      }}
    >
      {/* Grid overlay — only in arrange mode */}
      {arrangeMode && (
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
      )}

      {/* Mode toggle button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setArrangeMode((prev) => !prev)
        }}
        className="fixed bottom-6 left-6 z-[1000] flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-colors text-sm font-medium"
        style={{
          backgroundColor: arrangeMode ? 'hsl(217 91% 60%)' : 'hsl(0 0% 15%)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        {arrangeMode ? (
          <>
            <Move className="h-4 w-4" />
            Arrange
          </>
        ) : (
          <>
            <MousePointer className="h-4 w-4" />
            Edit
          </>
        )}
      </button>

      {/* Render cards with react-rnd */}
      {canvasWidth > 0 && canvasHeight > 0 && visibleCards.map((card, index) => (
        <ScatterCard
          key={`${card.id}-${boundsKey}`}
          card={card}
          cardIndex={index}
          totalCards={visibleCards.length}
          themeId={themeId}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          maxZIndex={maxZIndex}
          isSelected={selectedCardId === card.id}
          arrangeMode={arrangeMode}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          onBringToFront={handleBringToFront}
          onSelect={handleSelect}
        />
      ))}
    </div>
  )
}
