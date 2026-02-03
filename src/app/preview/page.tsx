"use client"

import { useEffect, useState, useCallback } from "react"
import { SelectableFlowGrid } from "@/components/canvas/selectable-flow-grid"
import { MultiSelectProvider, useMultiSelectContext } from "@/contexts/multi-select-context"
import { ProfileHeader } from "@/components/preview/profile-header"
import { PageBackground, FrameOverlay, NoiseOverlay, DimOverlay } from "@/components/preview/page-background"
import { useProfileStore } from "@/stores/profile-store"
import { useThemeStore } from "@/stores/theme-store"
import type { Card } from "@/types/card"
import type { Profile } from "@/types/profile"
import type { ThemeState } from "@/types/theme"

interface Theme {
  id: string
  name: string
}

interface PageState {
  cards: Card[]
  theme: Theme
  selectedCardId: string | null
  profile?: Profile
  themeState?: ThemeState
}

interface StateUpdateMessage {
  type: "STATE_UPDATE"
  payload: PageState
}

type PreviewMessage = StateUpdateMessage

const defaultState: PageState = {
  cards: [],
  theme: { id: "default", name: "Default" },
  selectedCardId: null,
}

export default function PreviewPage() {
  return (
    <MultiSelectProvider>
      <PreviewContent />
    </MultiSelectProvider>
  )
}

// Frame inset config - defines the "screen" area for the AWGE frame (as percentages of viewport)
const FRAME_INSETS: Record<string, { top: number; bottom: number; left: number; right: number }> = {
  '/frames/awge-tv.png': {
    top: 8,      // % from top - padding from frame edge
    bottom: 14,  // % from bottom - account for AWGE text + padding
    left: 7,     // % from left - padding from frame edge
    right: 7,    // % from right - padding from frame edge
  },
}

function PreviewContent() {
  const [state, setState] = useState<PageState>(defaultState)
  const [isReady, setIsReady] = useState(false)
  const { clearSelection } = useMultiSelectContext()
  const { background } = useThemeStore()

  // Send SELECT_CARD message to parent editor
  const handleCardClick = useCallback((cardId: string) => {
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: "SELECT_CARD", payload: { cardId } },
        window.location.origin
      )
    }
  }, [])

  // Deselect when clicking empty space in preview
  const handleBackgroundClick = useCallback(() => {
    // Clear multi-select
    clearSelection()
    // Also deselect in editor
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: "SELECT_CARD", payload: { cardId: null } },
        window.location.origin
      )
    }
  }, [clearSelection])

  useEffect(() => {
    // Handle incoming messages from parent editor
    const handleMessage = (event: MessageEvent<PreviewMessage>) => {
      // Security: only accept messages from same origin
      if (event.origin !== window.location.origin) {
        return
      }

      if (event.data?.type === "STATE_UPDATE") {
        setState(event.data.payload)
        // Sync profile to store for ProfileHeader component
        if (event.data.payload.profile) {
          useProfileStore.getState().initializeProfile(event.data.payload.profile)
        }
        // Sync theme state for ThemeApplicator
        if (event.data.payload.themeState) {
          const ts = event.data.payload.themeState
          // Update theme store with received state
          useThemeStore.setState({
            themeId: ts.themeId,
            paletteId: ts.paletteId,
            colors: ts.colors,
            fonts: ts.fonts,
            style: ts.style,
            background: ts.background,
            cardTypeFontSizes: ts.cardTypeFontSizes,
            socialIconSize: ts.socialIconSize,
          })
        }
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

  // Get frame insets if a frame overlay is active
  const frameInsets = background.frameOverlay ? FRAME_INSETS[background.frameOverlay] : null

  // Frame transform values
  const frameZoom = background.frameZoom ?? 1
  const framePosX = background.framePositionX ?? 0
  const framePosY = background.framePositionY ?? 0
  const frameFitContent = background.frameFitContent ?? true

  // Content fine-tuning values
  const contentOffsetX = background.contentOffsetX ?? 0
  const contentOffsetY = background.contentOffsetY ?? 0
  const contentZoom = background.contentZoom ?? 1

  // When frameFitContent is enabled, content stays locked inside the frame
  if (frameInsets && frameFitContent) {
    return (
      <>
        {/* Page background (solid, image, or video) */}
        <PageBackground />
        {/* Dim overlay */}
        <DimOverlay />

        {/* Content container - sized horizontally to frame, full height so content scrolls behind */}
        <div
          className="fixed overflow-y-auto overflow-x-hidden pointer-events-auto text-theme-text"
          onClick={handleBackgroundClick}
          style={{
            // Horizontal: sized to frame's screen area and centered
            width: `${100 - frameInsets.left - frameInsets.right}vw`,
            left: `${frameInsets.left}vw`,
            // Vertical: full viewport height so content scrolls behind frame top/bottom
            top: 0,
            bottom: 0,
            // Transform to match frame zoom/position + content adjustments
            transform: `scale(${frameZoom * contentZoom}) translate(${framePosX + contentOffsetX}%, ${framePosY + contentOffsetY}%)`,
            transformOrigin: 'center center',
            // Vertical padding positions content in visible area
            paddingTop: `${frameInsets.top}vh`,
            paddingBottom: `${frameInsets.bottom}vh`,
            paddingLeft: '1rem',
            paddingRight: '1rem',
            '--page-padding-x': '1rem',
          } as React.CSSProperties}
        >
            <ProfileHeader />
            {!hasCards ? (
              <div className="flex flex-col items-center justify-center min-h-full text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <svg className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold mb-2">Your page is empty</h2>
                <p className="text-muted-foreground text-sm max-w-[300px]">Add cards in the editor to build your link-in-bio page.</p>
              </div>
            ) : (
              <SelectableFlowGrid
                cards={state.cards}
                selectedCardId={state.selectedCardId}
                onReorder={(oldIndex, newIndex) => {
                  if (window.parent !== window) {
                    window.parent.postMessage({ type: "REORDER_CARDS", payload: { oldIndex, newIndex } }, window.location.origin)
                  }
                }}
                onReorderMultiple={(cardIds, targetIndex) => {
                  if (window.parent !== window) {
                    window.parent.postMessage({ type: "REORDER_MULTIPLE_CARDS", payload: { cardIds, targetIndex } }, window.location.origin)
                  }
                }}
                onCardClick={handleCardClick}
              />
            )}
        </div>

        {/* Noise overlay */}
        <NoiseOverlay />
        {/* Frame overlay */}
        <FrameOverlay />
      </>
    )
  }

  // When frame is active but NOT fit content, use padding to inset content
  // Content scrolls behind the fixed frame overlay (no clipping)
  // CSS custom property --page-padding-x allows full-bleed components to break out
  return (
    <>
      <div
        className="min-h-screen text-theme-text overflow-x-hidden"
        onClick={handleBackgroundClick}
        style={frameInsets ? {
          // Padding pushes content into the "screen" area
          // But no overflow clipping - content scrolls behind frame
          paddingTop: `${frameInsets.top}vh`,
          paddingBottom: `${frameInsets.bottom}vh`,
          paddingLeft: `${frameInsets.left}vw`,
          paddingRight: `${frameInsets.right}vw`,
          // CSS variable for full-bleed components to break out
          '--page-padding-x': `${frameInsets.left}vw`,
        } as React.CSSProperties : {
          padding: '1rem',
          '--page-padding-x': '1rem',
        } as React.CSSProperties}
      >
        {/* Page background (solid, image, or video) */}
        <PageBackground />
        {/* Dim overlay */}
        <DimOverlay />

        {/* Profile Header at top */}
        <ProfileHeader />

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
          // Card rendering using SelectableFlowGrid with box selection and shift-click
          <SelectableFlowGrid
            cards={state.cards}
            selectedCardId={state.selectedCardId}
            onReorder={(oldIndex, newIndex) => {
              // Send reorder message to parent editor
              if (window.parent !== window) {
                window.parent.postMessage(
                  { type: "REORDER_CARDS", payload: { oldIndex, newIndex } },
                  window.location.origin
                )
              }
            }}
            onReorderMultiple={(cardIds, targetIndex) => {
              // Send multi-reorder message to parent editor
              if (window.parent !== window) {
                window.parent.postMessage(
                  { type: "REORDER_MULTIPLE_CARDS", payload: { cardIds, targetIndex } },
                  window.location.origin
                )
              }
            }}
            onCardClick={handleCardClick}
          />
        )}
      </div>

      {/* Noise overlay */}
      <NoiseOverlay />
      {/* Frame overlay - sits ON TOP of everything */}
      <FrameOverlay />
    </>
  )
}
