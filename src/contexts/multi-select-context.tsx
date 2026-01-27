"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

interface MultiSelectContextValue {
  // State
  selectedIds: Set<string>
  isSelectMode: boolean  // For mobile checkbox mode

  // Actions
  toggleSelect: (id: string) => void
  setSelected: (ids: Set<string>) => void
  clearSelection: () => void
  enterSelectMode: () => void
  exitSelectMode: () => void

  // Computed
  isSelected: (id: string) => boolean
  selectedCount: number
}

const MultiSelectContext = createContext<MultiSelectContextValue | null>(null)

export function MultiSelectProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelectMode, setIsSelectMode] = useState(false)

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const setSelected = useCallback((ids: Set<string>) => {
    setSelectedIds(ids)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setIsSelectMode(false)
  }, [])

  const enterSelectMode = useCallback(() => {
    setIsSelectMode(true)
  }, [])

  const exitSelectMode = useCallback(() => {
    setIsSelectMode(false)
    setSelectedIds(new Set())
  }, [])

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  )

  const value: MultiSelectContextValue = {
    selectedIds,
    isSelectMode,
    toggleSelect,
    setSelected,
    clearSelection,
    enterSelectMode,
    exitSelectMode,
    isSelected,
    selectedCount: selectedIds.size,
  }

  return (
    <MultiSelectContext.Provider value={value}>
      {children}
    </MultiSelectContext.Provider>
  )
}

export function useMultiSelectContext() {
  const context = useContext(MultiSelectContext)
  if (!context) {
    throw new Error("useMultiSelectContext must be used within MultiSelectProvider")
  }
  return context
}
