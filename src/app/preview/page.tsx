"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { SelectableFlowGrid } from "@/components/canvas/selectable-flow-grid"
import { ScatterCanvas } from "@/components/canvas/scatter-canvas"
import { MultiSelectProvider, useMultiSelectContext } from "@/contexts/multi-select-context"
import { ProfileHeader } from "@/components/preview/profile-header"
import { PageBackground, FrameOverlay, NoiseOverlay, DimOverlay } from "@/components/preview/page-background"
import { GlitchOverlay } from "@/components/glitch/glitch-overlay"
import { VcrMenuLayout } from "@/components/cards/vcr-menu-layout"
import { IpodClassicLayout } from "@/components/cards/ipod-classic-layout"
import { ReceiptLayout } from "@/components/cards/receipt-layout"
import { MacintoshLayout } from "@/components/cards/macintosh-layout"
import { WordArtLayout } from "@/components/cards/word-art-layout"
import { PhoneHomeLayout } from "@/components/cards/phone-home-layout"
import { ChaoticZineLayout } from "@/components/cards/chaotic-zine-layout"
import { ArtifactLayout } from "@/components/cards/artifact-layout"
import { useProfileStore } from "@/stores/profile-store"
import { useThemeStore } from "@/stores/theme-store"
import { isScatterTheme } from "@/types/scatter"
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
  const { background, themeId, centerCards, scatterMode } = useThemeStore()
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

  // Send batch card updates to parent editor (for DnD layout reflow)
  const handleMoveCards = useCallback((moves: Array<{ cardId: string; content: Record<string, unknown> }>) => {
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: "MOVE_CARDS", payload: { moves } },
        window.location.origin
      )
    }
  }, [])

  // Deselect when clicking empty space in preview (background only, not cards)
  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    // Only fire when clicking directly on the background element, not on cards/content
    if (e.target !== e.currentTarget) return
    // Clear multi-select
    clearSelection()
    if (window.parent !== window) {
      // Deselect card in editor
      window.parent.postMessage(
        { type: "SELECT_CARD", payload: { cardId: null } },
        window.location.origin
      )
      // Navigate editor to Design > Style tab
      window.parent.postMessage(
        { type: "OPEN_DESIGN_TAB", payload: { tab: "style" } },
        window.location.origin
      )
    }
  }, [clearSelection])

  useEffect(() => {
    // Handle incoming messages from parent editor
    const handleMessage = (event: MessageEvent) => {
      // Security: only accept messages from same origin
      if (event.origin !== window.location.origin) {
        return
      }

      // Handle scroll forwarded from parent (iframe has pointer-events: none on mobile)
      if (event.data?.type === "SCROLL") {
        window.scrollBy(0, event.data.payload.deltaY)
        return
      }

      // Scroll to bottom — used after adding a new card
      if (event.data?.type === "SCROLL_TO_BOTTOM") {
        // Delay to allow React to render the new card first
        requestAnimationFrame(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
        })
        return
      }

      // Handle tap forwarded from parent (iframe has pointer-events: none on mobile)
      if (event.data?.type === "TAP") {
        const { x, y } = event.data.payload
        const el = document.elementFromPoint(x, y)
        if (el) {
          ;(el as HTMLElement).click()
        }
        return
      }

      if (event.data?.type === "STATE_UPDATE") {
        const payload = event.data.payload
        // Defer store updates to next microtask so React finishes committing
        // child components before Zustand fires subscription updates.
        // Prevents "Can't perform a React state update on a component that
        // hasn't mounted yet" when the parent sends STATE_UPDATE immediately
        // after PREVIEW_READY (before children finish mounting).
        queueMicrotask(() => {
          setState(payload)
          // Sync profile to store for ProfileHeader component
          if (payload.profile) {
            useProfileStore.getState().initializeProfile(payload.profile)
          }
          // Sync theme state for ThemeApplicator
          if (payload.themeState) {
            const ts = payload.themeState
            useThemeStore.setState({
              themeId: ts.themeId,
              paletteId: ts.paletteId,
              colors: ts.colors,
              fonts: ts.fonts,
              style: ts.style,
              background: ts.background,
              cardTypeFontSizes: ts.cardTypeFontSizes,
              fontFamilyScales: ts.fontFamilyScales ?? {},
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
              phoneHomeDock: ts.phoneHomeDock ?? [],
              phoneHomeShowDock: ts.phoneHomeShowDock ?? true,
              phoneHomeDockTranslucent: ts.phoneHomeDockTranslucent ?? true,
              phoneHomeDockColor: ts.phoneHomeDockColor ?? '',
              phoneHomeVariant: ts.phoneHomeVariant ?? 'default',
              zineBadgeText: ts.zineBadgeText ?? 'NEW!',
              zineTitleSize: ts.zineTitleSize ?? 1.0,
              zineShowDoodles: ts.zineShowDoodles ?? true,
              artifactMarqueeText: ts.artifactMarqueeText ?? 'LINKS_DATABASE /// ACCESS_GRANTED >>> CONNECT_NOW /// NET_RUNNER',
              artifactHeaderTopLeft: ts.artifactHeaderTopLeft ?? 'USER.ID_99',
              artifactHeaderTopCenter: ts.artifactHeaderTopCenter ?? '[ONLINE]',
              artifactHeaderTopRight: ts.artifactHeaderTopRight ?? '',
              artifactHeaderBottomLeft: ts.artifactHeaderBottomLeft ?? 'DIGITAL // PHY',
              artifactHeaderBottomCenter: ts.artifactHeaderBottomCenter ?? '///',
              artifactHeaderBottomRight: ts.artifactHeaderBottomRight ?? 'SYS_ADMIN',
              artifactShowHeaderMeta: ts.artifactShowHeaderMeta ?? true,
              artifactHeroOverlay: ts.artifactHeroOverlay ?? false,
              artifactHeroMediaType: (ts.artifactHeroMediaType as 'image' | 'video') ?? 'image',
              artifactHeroImageUrl: ts.artifactHeroImageUrl ?? '',
              artifactHeroVideoUrl: ts.artifactHeroVideoUrl ?? '',
              artifactHeroPositionX: ts.artifactHeroPositionX ?? 50,
              artifactHeroPositionY: ts.artifactHeroPositionY ?? 50,
              scatterMode: ts.scatterMode ?? false,
              visitorDrag: ts.visitorDrag ?? false,
            })
          }
        }) // end queueMicrotask
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

  // Detect two-finger pinch inside iframe and forward to parent for CSS transform zoom
  // Single-finger gestures (scroll, tap, long-press drag) pass through to dnd-kit natively
  useEffect(() => {
    if (window.parent === window) return // Not in iframe

    // Tell compositor: allow scroll but NOT zoom — prevents native zoom before JS even fires
    document.documentElement.style.touchAction = 'pan-y'

    let initialDistance = 0
    let lastMidpoint = { x: 0, y: 0 }
    let isPinching = false

    function getDistance(t1: Touch, t2: Touch) {
      return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
    }

    function getMidpoint(t1: Touch, t2: Touch) {
      return {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      }
    }

    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length >= 2 && !isPinching) {
        e.preventDefault()
        isPinching = true
        initialDistance = getDistance(e.touches[0], e.touches[1])
        lastMidpoint = getMidpoint(e.touches[0], e.touches[1])
        // Lock ALL native gestures during pinch (prevents scroll jank)
        document.documentElement.style.touchAction = 'none'
        window.parent.postMessage({ type: "PINCH_START" }, window.location.origin)
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (e.touches.length >= 2) {
        e.preventDefault()
        if (!isPinching) {
          // Pinch started mid-move (edge case)
          isPinching = true
          initialDistance = getDistance(e.touches[0], e.touches[1])
          lastMidpoint = getMidpoint(e.touches[0], e.touches[1])
          document.documentElement.style.touchAction = 'none'
          window.parent.postMessage({ type: "PINCH_START" }, window.location.origin)
          return
        }
        const currentDistance = getDistance(e.touches[0], e.touches[1])
        const currentMidpoint = getMidpoint(e.touches[0], e.touches[1])
        const scale = currentDistance / initialDistance
        const deltaX = currentMidpoint.x - lastMidpoint.x
        const deltaY = currentMidpoint.y - lastMidpoint.y
        lastMidpoint = currentMidpoint

        window.parent.postMessage({
          type: "PINCH_UPDATE",
          payload: { scale, deltaX, deltaY }
        }, window.location.origin)
      } else if (isPinching) {
        // Still in pinch mode but only 1 finger left — prevent scroll jank during transition
        e.preventDefault()
      }
    }

    function handleTouchEnd(e: TouchEvent) {
      if (isPinching && e.touches.length < 2) {
        isPinching = false
        // Restore scroll (pan-y) after pinch ends
        document.documentElement.style.touchAction = 'pan-y'
        window.parent.postMessage({ type: "PINCH_END" }, window.location.origin)
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    // Prevent Safari gesture events that cause native zoom glitch
    const preventGesture = (e: Event) => e.preventDefault()
    document.addEventListener('gesturestart', preventGesture, { passive: false } as AddEventListenerOptions)
    document.addEventListener('gesturechange', preventGesture, { passive: false } as AddEventListenerOptions)
    document.addEventListener('gestureend', preventGesture, { passive: false } as AddEventListenerOptions)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('gesturestart', preventGesture)
      document.removeEventListener('gesturechange', preventGesture)
      document.removeEventListener('gestureend', preventGesture)
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
          isEditable={true}
          onCardClick={handleCardClick}
          onHeaderClick={() => {
            if (window.parent !== window) {
              window.parent.postMessage(
                { type: 'OPEN_DESIGN_TAB', payload: { tab: 'header' } },
                window.location.origin
              )
            }
          }}
          onSocialIconClick={() => {
            if (window.parent !== window) {
              window.parent.postMessage(
                { type: 'OPEN_DESIGN_TAB', payload: { tab: 'header' } },
                window.location.origin
              )
            }
          }}
          selectedCardId={state.selectedCardId}
        />

        {/* Noise overlay */}
        <GlitchOverlay />
        <NoiseOverlay />
        {/* Frame overlay */}
        <FrameOverlay />
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
          isEditable={true}
          onCardClick={handleCardClick}
          selectedCardId={state.selectedCardId}
        />

        {/* Noise overlay */}
        <GlitchOverlay />
        <NoiseOverlay />
        {/* Frame overlay */}
        <FrameOverlay />
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
          isEditable={true}
          onCardClick={handleCardClick}
          selectedCardId={state.selectedCardId}
        />

        {/* Noise overlay */}
        <GlitchOverlay />
        <NoiseOverlay />
        {/* Frame overlay */}
        <FrameOverlay />
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
        <GlitchOverlay />
        <NoiseOverlay />
        {/* Frame overlay */}
        <FrameOverlay />
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
          isEditable={true}
          onCardClick={handleCardClick}
          selectedCardId={state.selectedCardId}
          wordArtTitleStyle={wordArtTitleStyle}
        />
        <GlitchOverlay />
        <NoiseOverlay />
        <FrameOverlay />
      </>
    )
  }

  // Phone Home theme uses iOS home screen layout
  if (themeId === 'phone-home') {
    return (
      <>
        <PageBackground />
        <DimOverlay />
        <PhoneHomeLayout
          title={displayName || 'Home'}
          cards={state.cards}
          isPreview={true}
          isEditable={true}
          onCardClick={handleCardClick}
          onMoveCards={handleMoveCards}
          selectedCardId={state.selectedCardId}
        />
        <GlitchOverlay />
        <NoiseOverlay />
        <FrameOverlay />
      </>
    )
  }

  // Chaotic Zine theme uses ransom-note/cut-and-paste layout
  if (themeId === 'chaotic-zine') {
    return (
      <>
        <PageBackground />
        <DimOverlay />
        <ChaoticZineLayout
          title={displayName || 'ZINE'}
          cards={state.cards}
          isPreview={true}
          isEditable={true}
          onCardClick={handleCardClick}
          selectedCardId={state.selectedCardId}
        />
        <GlitchOverlay />
        <NoiseOverlay />
        <FrameOverlay />
      </>
    )
  }

  // Artifact theme uses brutalist grid layout
  if (themeId === 'artifact') {
    return (
      <>
        <ArtifactLayout
          title={displayName || 'ARTIFACT'}
          cards={state.cards}
          isPreview={true}
          isEditable={true}
          onCardClick={handleCardClick}
          selectedCardId={state.selectedCardId}
          onHeaderClick={() => {
            if (window.parent !== window) {
              window.parent.postMessage(
                { type: 'OPEN_DESIGN_TAB', payload: { tab: 'style' } },
                window.location.origin
              )
            }
          }}
          onHeroClick={() => {
            if (window.parent !== window) {
              window.parent.postMessage(
                { type: 'OPEN_DESIGN_TAB', payload: { tab: 'style' } },
                window.location.origin
              )
            }
          }}
          onAddAudioCard={() => {
            if (window.parent !== window) {
              window.parent.postMessage(
                { type: 'ADD_AUDIO_CARD' },
                window.location.origin
              )
            }
          }}
        />
        <GlitchOverlay />
        <NoiseOverlay />
        <FrameOverlay />
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
            <div className="max-w-[500px] mx-auto w-full">
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
              ) : scatterMode && isScatterTheme(themeId) ? (
                <ScatterCanvas cards={state.cards} />
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
                  isEditable={true}
                />
              )}
            </div>
        </div>

        {/* Noise overlay */}
        <GlitchOverlay />
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

        <div className="max-w-[500px] mx-auto w-full">
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
          ) : scatterMode && isScatterTheme(themeId) ? (
            // Scatter mode: freeform card positioning
            <ScatterCanvas cards={state.cards} />
          ) : (
            // Flow mode: card rendering using SelectableFlowGrid with box selection and shift-click
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
              isEditable={true}
            />
          )}
        </div>
      </div>

      {/* Glitch overlay */}
      <GlitchOverlay />
      {/* Noise overlay */}
      <NoiseOverlay />
      {/* Frame overlay - sits ON TOP of everything */}
      <FrameOverlay />
    </>
  )
}
