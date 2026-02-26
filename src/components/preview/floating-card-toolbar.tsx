"use client"

import { Copy, Trash2 } from "lucide-react"

interface FloatingCardToolbarProps {
  cardId: string
  onDelete: () => void
  onDuplicate: () => void
}

/**
 * Canva-style floating quick-action toolbar for selected cards.
 * Appears above a selected card with Duplicate and Delete actions.
 * Uses plain HTML buttons (not shadcn/Radix) — safe inside preview iframe.
 * Communicates via window.parent.postMessage for DELETE_CARD and DUPLICATE_CARD.
 */
export function FloatingCardToolbar({ cardId: _cardId, onDelete, onDuplicate }: FloatingCardToolbarProps) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/80 backdrop-blur-sm shadow-lg">
      {/* Duplicate button */}
      <button
        type="button"
        aria-label="Duplicate card"
        className="flex items-center justify-center w-7 h-7 rounded-full text-white hover:text-blue-300 hover:bg-white/10 transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          onDuplicate()
        }}
      >
        <Copy className="h-3.5 w-3.5" />
      </button>

      {/* Divider */}
      <div className="w-px h-4 bg-white/20" />

      {/* Delete button */}
      <button
        type="button"
        aria-label="Delete card"
        className="flex items-center justify-center w-7 h-7 rounded-full text-white hover:text-red-400 hover:bg-white/10 transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
