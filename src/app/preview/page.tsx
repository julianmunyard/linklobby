"use client"

import { useEffect, useState } from "react"
import { FlowGrid } from "@/components/canvas/flow-grid"
import type { Card, HorizontalPosition } from "@/types/card"

interface Theme {
  id: string
  name: string
}

interface PageState {
  cards: Card[]
  theme: Theme
}

interface StateUpdateMessage {
  type: "STATE_UPDATE"
  payload: PageState
}

type PreviewMessage = StateUpdateMessage

const defaultState: PageState = {
  cards: [],
  theme: { id: "default", name: "Default" },
}

export default function PreviewPage() {
  const [state, setState] = useState<PageState>(defaultState)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Handle incoming messages from parent editor
    const handleMessage = (event: MessageEvent<PreviewMessage>) => {
      // Security: only accept messages from same origin
      if (event.origin !== window.location.origin) {
        return
      }

      if (event.data?.type === "STATE_UPDATE") {
        setState(event.data.payload)
      }
    }

    window.addEventListener("message", handleMessage)

    // Notify parent that preview is ready to receive state
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: "PREVIEW_READY" },
        window.location.origin
      )
    }
    setIsReady(true)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  const hasCards = state.cards.length > 0

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Debug info - theme name */}
      <div className="fixed bottom-2 right-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
        Theme: {state.theme.name}
      </div>

      {!hasCards ? (
        // Empty state when no cards
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <svg
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2">Your page is empty</h2>
          <p className="text-muted-foreground text-sm max-w-[300px]">
            Add cards in the editor to build your link-in-bio page. Changes will appear here in real-time.
          </p>
        </div>
      ) : (
        // Card rendering using FlowGrid with drag-to-reorder and position changes
        <FlowGrid
          cards={state.cards}
          onReorder={(oldIndex, newIndex) => {
            // Send reorder message to parent editor
            if (window.parent !== window) {
              window.parent.postMessage(
                { type: "REORDER_CARDS", payload: { oldIndex, newIndex } },
                window.location.origin
              )
            }
          }}
          onPositionChange={(cardId, position) => {
            // Send position change message to parent editor
            if (window.parent !== window) {
              window.parent.postMessage(
                { type: "POSITION_CHANGE", payload: { cardId, position } },
                window.location.origin
              )
            }
          }}
        />
      )}
    </div>
  )
}
