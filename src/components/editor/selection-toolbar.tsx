"use client"

import { X, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useMultiSelectContext } from "@/contexts/multi-select-context"
import { usePageStore } from "@/stores/page-store"
import { useCards } from "@/hooks/use-cards"

export function SelectionToolbar() {
  const { selectedIds, selectedCount, clearSelection } = useMultiSelectContext()
  const removeCardFromStore = usePageStore((state) => state.removeCard)
  const { removeCard: removeCardFromDb } = useCards()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Hide toolbar when no selection
  if (selectedCount === 0) {
    return null
  }

  // Handle "Delete All"
  const handleDeleteAll = async () => {
    try {
      // Delete all selected cards
      for (const cardId of selectedIds) {
        // Remove from store first (optimistic)
        removeCardFromStore(cardId)
        // Then remove from database
        await removeCardFromDb(cardId)
      }

      // Clear selection
      clearSelection()
      setDeleteDialogOpen(false)
    } catch (err) {
      console.error("Failed to delete cards:", err)
      // TODO: Could restore cards to store on failure
    }
  }

  return (
    <>
      {/* Floating toolbar at bottom center */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-background border rounded-lg shadow-lg px-4 py-2">
        {/* Selected count */}
        <span className="text-sm font-medium">
          {selectedCount} selected
        </span>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Delete All */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setDeleteDialogOpen(true)}
          className="gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Delete All</span>
        </Button>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Clear selection */}
        <Button
          size="sm"
          variant="ghost"
          onClick={clearSelection}
          className="gap-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} cards?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All selected cards will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteAll}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
