'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface CardBgPositionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
  scale: number
  posX: number
  posY: number
  onSave: (scale: number, posX: number, posY: number) => void
}

export function CardBgPositionDialog({
  open,
  onOpenChange,
  imageUrl,
  scale: initialScale,
  posX: initialPosX,
  posY: initialPosY,
  onSave,
}: CardBgPositionDialogProps) {
  const [scale, setScale] = useState(initialScale)
  const [posX, setPosX] = useState(initialPosX)
  const [posY, setPosY] = useState(initialPosY)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef<{ x: number; y: number; startPosX: number; startPosY: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset state when dialog opens with new props
  useEffect(() => {
    if (open) {
      setScale(initialScale)
      setPosX(initialPosX)
      setPosY(initialPosY)
    }
  }, [open, initialScale, initialPosX, initialPosY])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, startPosX: posX, startPosY: posY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [posX, posY])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStart.current || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    // Convert pixel delta to percentage of the container, inversely scaled
    const deltaX = ((e.clientX - dragStart.current.x) / rect.width) * 100 / scale
    const deltaY = ((e.clientY - dragStart.current.y) / rect.height) * 100 / scale

    // Clamp so the image can't be dragged too far off screen
    const maxOffset = 50
    const newPosX = Math.max(-maxOffset, Math.min(maxOffset, dragStart.current.startPosX + deltaX))
    const newPosY = Math.max(-maxOffset, Math.min(maxOffset, dragStart.current.startPosY + deltaY))

    setPosX(newPosX)
    setPosY(newPosY)
  }, [isDragging, scale])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
    dragStart.current = null
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale(prev => Math.max(1, Math.min(5, +(prev + delta).toFixed(1))))
  }, [])

  const handleReset = () => {
    setScale(1)
    setPosX(0)
    setPosY(0)
  }

  const handleDone = () => {
    onSave(scale, posX, posY)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Position Image</DialogTitle>
        </DialogHeader>

        {/* Preview area */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-lg border bg-muted"
          style={{ aspectRatio: '4 / 3', cursor: isDragging ? 'grabbing' : 'grab' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url('${imageUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `scale(${scale}) translate(${posX}%, ${posY}%)`,
              transformOrigin: 'center',
              touchAction: 'none',
            }}
          />
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setScale(prev => Math.max(1, +(prev - 0.1).toFixed(1)))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="flex-1 h-1.5 accent-primary"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setScale(prev => Math.min(5, +(prev + 0.1).toFixed(1)))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
            {scale.toFixed(1)}x
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleReset} className="flex-1">
            <RotateCcw className="h-3 w-3 mr-1.5" />
            Reset
          </Button>
          <Button type="button" size="sm" onClick={handleDone} className="flex-1">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
