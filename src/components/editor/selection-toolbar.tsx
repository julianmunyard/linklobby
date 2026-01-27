"use client"

import { X, FolderInput, MoveRight, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { isDropdownContent } from "@/types/card"
import type { DropdownCardContent } from "@/types/card"

export function SelectionToolbar() {
  const { selectedIds, selectedCount, clearSelection } = useMultiSelectContext()
  const cards = usePageStore((state) => state.cards)
  const moveCardToDropdown = usePageStore((state) => state.moveCardToDropdown)
  const addCard = usePageStore((state) => state.addCard)
  const removeCardFromStore = usePageStore((state) => state.removeCard)
  const { removeCard: removeCardFromDb } = useCards()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Hide toolbar when no selection
  if (selectedCount === 0) {
    return null
  }

  // Get existing dropdown cards
  const dropdowns = cards.filter((card) =>
    card.card_type === "dropdown" && !card.parentDropdownId
  )

  // Handle "Group into Dropdown"
  const handleGroupIntoDropdown = () => {
    // Create new dropdown card
    addCard("dropdown")

    // Get the newly created dropdown (last card added)
    const newDropdown = usePageStore.getState().cards.find(
      (card) => card.card_type === "dropdown" && !card.parentDropdownId
    )

    if (!newDropdown) return

    // Move all selected cards into the new dropdown
    selectedIds.forEach((cardId) => {
      moveCardToDropdown(cardId, newDropdown.id)
    })

    // Clear selection
    clearSelection()
  }

  // Handle "Move to Dropdown"
  const handleMoveToDropdown = (dropdownId: string) => {
    // Move all selected cards to the specified dropdown
    selectedIds.forEach((cardId) => {
      moveCardToDropdown(cardId, dropdownId)
    })

    // Clear selection
    clearSelection()
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

        {/* Group into Dropdown */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleGroupIntoDropdown}
          className="gap-2"
        >
          <FolderInput className="h-4 w-4" />
          <span className="hidden sm:inline">Group into Dropdown</span>
        </Button>

        {/* Move to Dropdown */}
        {dropdowns.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="gap-2">
                <MoveRight className="h-4 w-4" />
                <span className="hidden sm:inline">Move to Dropdown</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="max-h-60 overflow-y-auto">
              {dropdowns.map((dropdown) => {
                // Type guard check before casting
                if (!isDropdownContent(dropdown.content)) {
                  return null
                }

                const content = dropdown.content as DropdownCardContent
                const dropdownTitle = dropdown.title || "Untitled Dropdown"

                return (
                  <DropdownMenuItem
                    key={dropdown.id}
                    onClick={() => handleMoveToDropdown(dropdown.id)}
                  >
                    {dropdownTitle}
                    {content.childCardIds && content.childCardIds.length > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({content.childCardIds.length})
                      </span>
                    )}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

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
