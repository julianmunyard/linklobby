"use client"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import type { HorizontalPosition } from "@/types/card"

interface PositionDropZoneProps {
  position: HorizontalPosition
}

export function PositionDropZone({ position }: PositionDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `position-${position}`,
    data: { type: "position", position },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 flex items-center justify-center border-2 border-dashed transition-colors rounded-lg",
        isOver
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/30 bg-muted/5",
      )}
    >
      <span
        className={cn(
          "text-xs font-medium uppercase tracking-wide",
          isOver ? "text-primary" : "text-muted-foreground/50",
        )}
      >
        {position}
      </span>
    </div>
  )
}
