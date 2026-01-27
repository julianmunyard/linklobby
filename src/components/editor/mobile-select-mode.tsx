"use client"

import { CheckSquare, Square, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMultiSelectContext } from "@/contexts/multi-select-context"
import { cn } from "@/lib/utils"

/**
 * Toggle button to enter/exit select mode on mobile
 */
export function MobileSelectToggle() {
  const { isSelectMode, enterSelectMode, exitSelectMode, selectedCount } = useMultiSelectContext()

  if (isSelectMode) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={exitSelectMode}
        className="h-11"
      >
        <X className="h-4 w-4 mr-2" />
        Exit Select ({selectedCount})
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={enterSelectMode}
      className="h-11"
    >
      <CheckSquare className="h-4 w-4 mr-2" />
      Select
    </Button>
  )
}

/**
 * Checkbox overlay for cards in select mode
 */
interface MobileSelectCheckboxProps {
  cardId: string
  className?: string
}

export function MobileSelectCheckbox({ cardId, className }: MobileSelectCheckboxProps) {
  const { isSelectMode, isSelected, toggleSelect } = useMultiSelectContext()

  if (!isSelectMode) return null

  const checked = isSelected(cardId)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        toggleSelect(cardId)
      }}
      className={cn(
        "absolute top-2 left-2 z-10 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors",
        checked
          ? "bg-primary border-primary text-primary-foreground"
          : "bg-background/80 border-muted-foreground",
        className
      )}
      aria-label={checked ? "Deselect card" : "Select card"}
    >
      {checked && <CheckSquare className="h-4 w-4" />}
      {!checked && <Square className="h-4 w-4 opacity-50" />}
    </button>
  )
}

/**
 * Mobile-optimized selection toolbar
 * Shows at top of screen when cards are selected in select mode
 */
export function MobileSelectionBar() {
  const { isSelectMode, selectedCount, clearSelection, exitSelectMode } = useMultiSelectContext()

  if (!isSelectMode || selectedCount === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b p-2 flex items-center justify-between">
      <span className="text-sm font-medium">
        {selectedCount} selected
      </span>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSelection}
          className="h-9"
        >
          Clear
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={exitSelectMode}
          className="h-9"
        >
          Done
        </Button>
      </div>
    </div>
  )
}
