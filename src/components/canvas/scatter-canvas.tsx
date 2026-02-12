'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Move, MousePointer } from 'lucide-react'
import type { Card } from '@/types/card'
import type { ScatterPosition } from '@/types/scatter'
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

    updateDimensions()

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions()
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

  // Send scatter position update to local store + parent editor via postMessage
  const sendScatterUpdate = useCallback((cardId: string, position: Partial<ScatterPosition>) => {
    updateCardScatterPosition(cardId, themeId, position)
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'SCATTER_POSITION_UPDATE', payload: { cardId, themeId, position } },
        window.location.origin
      )
    }
  }, [themeId, updateCardScatterPosition])

  // Unified update callback — ScatterCard calls this on drag/scale end
  const handleUpdate = useCallback((cardId: string, position: Partial<ScatterPosition>) => {
    sendScatterUpdate(cardId, position)
  }, [sendScatterUpdate])

  // Handle card selection — notify parent for property editing
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

      {/* Render scatter cards with react-moveable */}
      {canvasWidth > 0 && canvasHeight > 0 && visibleCards.map((card, index) => (
        <ScatterCard
          key={card.id}
          card={card}
          cardIndex={index}
          totalCards={visibleCards.length}
          themeId={themeId}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          maxZIndex={maxZIndex}
          isSelected={selectedCardId === card.id}
          arrangeMode={arrangeMode}
          onUpdate={handleUpdate}
          onSelect={handleSelect}
        />
      ))}
    </div>
  )
}
