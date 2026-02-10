"use client"

import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { SelectableFlowGrid } from "@/components/canvas/selectable-flow-grid"
import { MultiSelectProvider, useMultiSelectContext } from "@/contexts/multi-select-context"
import { ProfileHeader } from "@/components/preview/profile-header"
import { PageBackground, FrameOverlay, NoiseOverlay, DimOverlay } from "@/components/preview/page-background"
import { VcrMenuLayout } from "@/components/cards/vcr-menu-layout"
import { IpodClassicLayout } from "@/components/cards/ipod-classic-layout"
import { ReceiptLayout } from "@/components/cards/receipt-layout"
import { MacintoshLayout } from "@/components/cards/macintosh-layout"
import { WordArtLayout } from "@/components/cards/word-art-layout"
import { LanyardBadgeLayout } from "@/components/cards/lanyard-badge-layout"
import { ClassifiedLayout } from "@/components/cards/classified-layout"
import { DeparturesBoardLayout } from "@/components/cards/departures-board-layout"
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
  const { background, themeId, centerCards } = useThemeStore()
  const displayName = useProfileStore((s) => s.displayName)

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
            centerCards: ts.centerCards ?? false,
            vcrCenterContent: ts.vcrCenterContent ?? false,
            receiptPrice: ts.receiptPrice ?? 'PRICELESS',
            receiptStickers: ts.receiptStickers ?? [],
            receiptFloatAnimation: ts.receiptFloatAnimation ?? true,
            receiptPaperTexture: ts.receiptPaperTexture ?? false,
            ipodStickers: ts.ipodStickers ?? [],
            ipodTexture: ts.ipodTexture ?? '/images/metal-texture.jpeg',
            macPattern: ts.macPattern ?? '',
            macPatternColor: ts.macPatternColor ?? '#c0c0c0',
            wordArtTitleStyle: ts.wordArtTitleStyle ?? 'style-eleven',
            lanyardActiveView: ts.lanyardActiveView ?? 0,
            classifiedStampText: ts.classifiedStampText ?? 'SECRET',
            classifiedDeptText: ts.classifiedDeptText ?? 'War Department',
            classifiedCenterText: ts.classifiedCenterText ?? 'Classified Message Center',
            classifiedMessageText: ts.classifiedMessageText ?? 'Incoming Message',
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

  // VCR Menu theme uses completely different layout
  if (themeId === 'vcr-menu') {
    return (
      <>
        {/* Page background */}
        <PageBackground />
        {/* Dim overlay */}
        <DimOverlay />

        {/* VCR Menu Layout */}
        <VcrMenuLayout
          title={displayName || 'MENU'}
          cards={state.cards}
          isPreview={true}
          onCardClick={handleCardClick}
          selectedCardId={state.selectedCardId}
        />

        {/* Noise overlay */}
        <NoiseOverlay />
      </>
    )
  }

  // iPod Classic theme uses iPod interface layout
  if (themeId === 'ipod-classic') {
    return (
      <>
        {/* Page background */}
        <PageBackground />
        {/* Dim overlay */}
        <DimOverlay />

        {/* iPod Classic Layout */}
        <IpodClassicLayout
          title={displayName || 'links'}
          cards={state.cards}
          isPreview={true}
          onCardClick={handleCardClick}
          selectedCardId={state.selectedCardId}
        />

        {/* Noise overlay */}
        <NoiseOverlay />
      </>
    )
  }

  // Receipt theme uses receipt paper layout
  if (themeId === 'receipt') {
    return (
      <>
        {/* Page background */}
        <PageBackground />
        {/* Dim overlay */}
        <DimOverlay />

        {/* Receipt Layout */}
        <ReceiptLayout
          title={displayName || 'RECEIPT'}
          cards={state.cards}
          isPreview={true}
          onCardClick={handleCardClick}
          selectedCardId={state.selectedCardId}
        />

        {/* Noise overlay */}
        <NoiseOverlay />
      </>
    )
  }

  // Macintosh theme uses Mac desktop layout
  if (themeId === 'macintosh') {
    const macFrameFitContent = background.frameFitContent ?? true
    const macFrameInsets = background.frameOverlay && macFrameFitContent ? FRAME_INSETS[background.frameOverlay] : null

    return (
      <>
        <MacintoshLayout
          title={displayName || ''}
          cards={state.cards}
          isPreview={true}
          onCardClick={handleCardClick}
          selectedCardId={state.selectedCardId}
          frameInsets={macFrameInsets}
          frameZoom={background.frameZoom ?? 1}
          framePosX={background.framePositionX ?? 0}
          framePosY={background.framePositionY ?? 0}
        />

        {/* Noise overlay */}
        <NoiseOverlay />
        {/* Frame overlay */}
        <FrameOverlay />
      </>
    )
  }

  // Lanyard Badge theme uses 3D lanyard with badge card
  if (themeId === 'lanyard-badge') {
    return (
      <>
        <PageBackground />
        <DimOverlay />
        <LanyardBadgeLayout
          title={displayName || 'BADGE'}
          cards={state.cards}
          isPreview={true}
          onCardClick={handleCardClick}
          selectedCardId={state.selectedCardId}
        />
        <NoiseOverlay />
      </>
    )
  }

  // Classified Document theme uses military document layout
  if (themeId === 'classified') {
    return (
      <>
        <PageBackground />
        <DimOverlay />
        <ClassifiedLayout
          title={displayName || 'SECRET'}
          cards={state.cards}
          isPreview={true}
          onCardClick={handleCardClick}
          selectedCardId={state.selectedCardId}
        />
        <NoiseOverlay />
      </>
    )
  }

  // Departures Board theme uses airport departures display layout
  if (themeId === 'departures-board') {
    return (
      <>
        <PageBackground />
        <DimOverlay />
        <DeparturesBoardLayout
          title={displayName || 'DEPARTURES'}
          cards={state.cards}
          isPreview={true}
          onCardClick={handleCardClick}
          selectedCardId={state.selectedCardId}
        />
        <NoiseOverlay />
      </>
    )
  }

  // Word Art theme uses word art text layout
  if (themeId === 'word-art') {
    const wordArtTitleStyle = useThemeStore.getState().wordArtTitleStyle
    return (
      <>
        <PageBackground />
        <DimOverlay />
        <WordArtLayout
          title={displayName || 'Word Art'}
          cards={state.cards}
          isPreview={true}
          onCardClick={handleCardClick}
          selectedCardId={state.selectedCardId}
          wordArtTitleStyle={wordArtTitleStyle}
        />
        <NoiseOverlay />
      </>
    )
  }

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
          className={cn(
            "fixed overflow-y-auto overflow-x-hidden pointer-events-auto text-theme-text",
            centerCards && "flex flex-col items-center justify-center"
          )}
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
                onReorder={(activeId, overId) => {
                  if (window.parent !== window) {
                    window.parent.postMessage({ type: "REORDER_CARDS", payload: { activeId, overId } }, window.location.origin)
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
        className={cn(
          "min-h-screen text-theme-text overflow-x-hidden",
          centerCards && "flex flex-col items-center justify-center"
        )}
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
            onReorder={(activeId, overId) => {
              // Send reorder message to parent editor
              if (window.parent !== window) {
                window.parent.postMessage(
                  { type: "REORDER_CARDS", payload: { activeId, overId } },
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
