"use client"

import { useCallback, useRef } from "react"
import { useMultiSelectContext } from "@/contexts/multi-select-context"

interface UseMultiSelectOptions {
  orderedIds: string[]  // Card IDs in display order for range selection
}

export function useMultiSelect({ orderedIds }: UseMultiSelectOptions) {
  const context = useMultiSelectContext()
  const lastSelectedRef = useRef<string | null>(null)

  // Handle click with Shift support for range selection
  const handleClick = useCallback(
    (id: string, event: React.MouseEvent) => {
      if (event.shiftKey && lastSelectedRef.current) {
        // Range selection: select all cards between last selected and current
        const startIndex = orderedIds.indexOf(lastSelectedRef.current)
        const endIndex = orderedIds.indexOf(id)

        if (startIndex !== -1 && endIndex !== -1) {
          const [from, to] = startIndex < endIndex
            ? [startIndex, endIndex]
            : [endIndex, startIndex]

          const rangeIds = orderedIds.slice(from, to + 1)
          const newSelection = new Set(context.selectedIds)
          rangeIds.forEach((rangeId) => newSelection.add(rangeId))
          context.setSelected(newSelection)
        }
      } else {
        // Single toggle
        context.toggleSelect(id)
        lastSelectedRef.current = id
      }
    },
    [context, orderedIds]
  )

  // For mobile checkbox mode - simple toggle without shift
  const handleCheckbox = useCallback(
    (id: string) => {
      context.toggleSelect(id)
    },
    [context]
  )

  return {
    ...context,
    handleClick,
    handleCheckbox,
  }
}
