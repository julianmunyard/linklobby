"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useGesture } from "@use-gesture/react"
import { PreviewToggle, type PreviewMode } from "./preview-toggle"
import { usePageStore } from "@/stores/page-store"
import { useProfileStore } from "@/stores/profile-store"
import { useThemeStore } from "@/stores/theme-store"
import { useCards } from "@/hooks/use-cards"
import { useIsMobileLayout } from "@/hooks/use-media-query"

const MOBILE_WIDTH = 375
const MOBILE_HEIGHT = 667

export function PreviewPanel() {
  const [previewMode, setPreviewMode] = useState<PreviewMode>("mobile")
  const [previewReady, setPreviewReady] = useState(false)
  const [mobileScale, setMobileScale] = useState(1)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const phoneFrameRef = useRef<HTMLDivElement>(null)
  const baseScaleRef = useRef(1)
  const scaleRef = useRef(1)
  const translateRef = useRef({ x: 0, y: 0 })
  const lastTapRef = useRef(0)
  const iframePinchingRef = useRef(false) // true when iframe is handling a pinch
  const pinchStartScaleRef = useRef(1)
  const isMobileLayout = useIsMobileLayout()
  const getSnapshot = usePageStore((state) => state.getSnapshot)
  const reorderCards = usePageStore((state) => state.reorderCards)
  const reorderMultipleCards = usePageStore((state) => state.reorderMultipleCards)
  const selectCard = usePageStore((state) => state.selectCard)
  const updateCard = usePageStore((state) => state.updateCard)
  const getProfileSnapshot = useProfileStore((state) => state.getSnapshot)
  const updateReceiptSticker = useThemeStore((state) => state.updateReceiptSticker)
  const updateIpodSticker = useThemeStore((state) => state.updateIpodSticker)
  const { saveCards } = useCards()

  // Direct DOM update for phone frame transform — bypasses React for smooth gestures
  const updateFrameTransform = useCallback(() => {
    if (phoneFrameRef.current) {
      phoneFrameRef.current.style.transform =
        `translate(${translateRef.current.x}px, ${translateRef.current.y}px) scale(${scaleRef.current})`
    }
  }, [])

  // Calculate scale to fit mobile preview in container
  const updateMobileScale = useCallback(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const padding = 32 // p-4 = 16px * 2
    const availableWidth = container.clientWidth - padding
    const availableHeight = container.clientHeight - padding

    const scaleX = availableWidth / MOBILE_WIDTH
    const scaleY = availableHeight / MOBILE_HEIGHT
    const newScale = Math.min(scaleX, scaleY, 1) // Don't scale up, only down
    setMobileScale(newScale)
    baseScaleRef.current = newScale
    scaleRef.current = newScale
    translateRef.current = { x: 0, y: 0 }
    updateFrameTransform()
  }, [updateFrameTransform])

  // Update scale on mount and resize
  useEffect(() => {
    updateMobileScale()
    const resizeObserver = new ResizeObserver(updateMobileScale)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    return () => resizeObserver.disconnect()
  }, [updateMobileScale])

  // Deselect card and save any pending changes
  const handleDeselect = async () => {
    const currentHasChanges = usePageStore.getState().hasChanges
    if (currentHasChanges) {
      await saveCards()
    }
    selectCard(null)
  }

  // Double-tap to reset zoom
  const handleDoubleTap = () => {
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      scaleRef.current = baseScaleRef.current
      translateRef.current = { x: 0, y: 0 }
      updateFrameTransform()
    }
    lastTapRef.current = now
  }

  // Convert screen coordinates to iframe-local coordinates
  const screenToIframeCoords = useCallback((screenX: number, screenY: number) => {
    const iframe = iframeRef.current
    if (!iframe) return null
    const rect = iframe.getBoundingClientRect()
    if (screenX < rect.left || screenX > rect.right || screenY < rect.top || screenY > rect.bottom) {
      return null // Outside iframe
    }
    return {
      x: (screenX - rect.left) / rect.width * MOBILE_WIDTH,
      y: (screenY - rect.top) / rect.height * MOBILE_HEIGHT,
    }
  }, [])

  // Forward scroll to iframe
  const forwardScroll = useCallback((deltaY: number) => {
    const iframe = iframeRef.current
    if (iframe?.contentWindow) {
      // Convert screen delta to iframe scroll delta (account for current zoom)
      const iframeDelta = deltaY / scaleRef.current
      iframe.contentWindow.postMessage(
        { type: "SCROLL", payload: { deltaY: iframeDelta } },
        window.location.origin
      )
    }
  }, [])

  // Forward tap to iframe
  const forwardTap = useCallback((screenX: number, screenY: number) => {
    const coords = screenToIframeCoords(screenX, screenY)
    if (coords) {
      const iframe = iframeRef.current
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: "TAP", payload: coords },
          window.location.origin
        )
      }
    } else {
      // Tapped outside the iframe (on container background) — deselect
      handleDeselect()
    }
  }, [screenToIframeCoords, handleDeselect])

  // Send state to preview iframe
  const sendToPreview = () => {
    const iframe = iframeRef.current
    if (iframe?.contentWindow && previewReady) {
      const snapshot = getSnapshot()
      const profileSnapshot = getProfileSnapshot()
      const { themeId, paletteId, colors, fonts, style, background, cardTypeFontSizes, socialIconSize, centerCards, vcrCenterContent, receiptPrice, receiptStickers, receiptFloatAnimation, receiptPaperTexture, ipodStickers, ipodTexture, macPattern, macPatternColor, wordArtTitleStyle, lanyardActiveView, classifiedStampText, classifiedDeptText, classifiedCenterText, classifiedMessageText, phoneHomeDock, phoneHomeShowDock, phoneHomeVariant, zineBadgeText, zineTitleSize, scatterMode, visitorDrag } = useThemeStore.getState()
      const themeSnapshot = { themeId, paletteId, colors, fonts, style, background, cardTypeFontSizes, socialIconSize, centerCards, vcrCenterContent, receiptPrice, receiptStickers, receiptFloatAnimation, receiptPaperTexture, ipodStickers, ipodTexture, macPattern, macPatternColor, wordArtTitleStyle, lanyardActiveView, classifiedStampText, classifiedDeptText, classifiedCenterText, classifiedMessageText, phoneHomeDock, phoneHomeShowDock, phoneHomeVariant, zineBadgeText, zineTitleSize, scatterMode, visitorDrag }
      iframe.contentWindow.postMessage(
        { type: "STATE_UPDATE", payload: { ...snapshot, profile: profileSnapshot, themeState: themeSnapshot } },
        window.location.origin
      )
    }
  }

  // Listen for messages from preview iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      switch (event.data.type) {
        case "PREVIEW_READY":
          setPreviewReady(true)
          break
        case "REORDER_CARDS":
          reorderCards(event.data.payload.activeId, event.data.payload.overId)
          saveCards()
          break
        case "REORDER_MULTIPLE_CARDS":
          reorderMultipleCards(event.data.payload.cardIds, event.data.payload.targetIndex)
          saveCards()
          break
        case "SELECT_CARD":
          selectCard(event.data.payload.cardId)
          break
        case "SCATTER_POSITION_UPDATE": {
          const { cardId, themeId: scatterThemeId, position } = event.data.payload
          usePageStore.getState().updateCardScatterPosition(cardId, scatterThemeId, position)
          break
        }
        case "MOVE_CARDS": {
          const { moves } = event.data.payload as { moves: Array<{ cardId: string; content: Record<string, unknown> }> }
          for (const { cardId, content } of moves) {
            updateCard(cardId, { content })
          }
          break
        }
        case "UPDATE_STICKER":
          updateReceiptSticker(event.data.payload.id, { x: event.data.payload.x, y: event.data.payload.y })
          break
        case "UPDATE_IPOD_STICKER":
          updateIpodSticker(event.data.payload.id, { x: event.data.payload.x, y: event.data.payload.y })
          break
        case "PINCH_START":
          iframePinchingRef.current = true
          pinchStartScaleRef.current = scaleRef.current
          break
        case "PINCH_UPDATE": {
          const { scale, deltaX, deltaY } = event.data.payload
          scaleRef.current = Math.max(0.1, Math.min(pinchStartScaleRef.current * scale, 3))
          translateRef.current = {
            x: translateRef.current.x + deltaX * scaleRef.current,
            y: translateRef.current.y + deltaY * scaleRef.current,
          }
          updateFrameTransform()
          break
        }
        case "PINCH_END":
          iframePinchingRef.current = false
          break
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [reorderCards, reorderMultipleCards, selectCard, saveCards, updateCard, updateReceiptSticker, updateIpodSticker])

  // Prevent native zoom on the parent page (Safari gesture events)
  useEffect(() => {
    if (!isMobileLayout) return
    const prevent = (e: Event) => e.preventDefault()
    document.addEventListener('gesturestart', prevent, { passive: false } as AddEventListenerOptions)
    document.addEventListener('gesturechange', prevent, { passive: false } as AddEventListenerOptions)
    document.addEventListener('gestureend', prevent, { passive: false } as AddEventListenerOptions)
    return () => {
      document.removeEventListener('gesturestart', prevent)
      document.removeEventListener('gesturechange', prevent)
      document.removeEventListener('gestureend', prevent)
    }
  }, [isMobileLayout])

  // Send initial state when preview becomes ready
  useEffect(() => {
    if (previewReady) {
      sendToPreview()
    }
  }, [previewReady])

  // Subscribe to store changes and send updates to preview
  useEffect(() => {
    const unsubscribePage = usePageStore.subscribe(() => {
      sendToPreview()
    })
    const unsubscribeProfile = useProfileStore.subscribe(() => {
      sendToPreview()
    })
    const unsubscribeTheme = useThemeStore.subscribe(() => {
      sendToPreview()
    })
    return () => {
      unsubscribePage()
      unsubscribeProfile()
      unsubscribeTheme()
    }
  }, [previewReady])

  // Gesture handler for the mobile preview container background
  // iframe has pointer-events: auto — single-finger gestures (scroll, tap, drag) handled natively
  // Two-finger pinch on iframe is intercepted and forwarded via postMessage (PINCH_START/UPDATE/END)
  // This handler covers pinch on the background area + tap-to-deselect + background scroll forwarding
  const bind = useGesture(
    {
      onPinch: ({ first, offset: [s], origin: [ox, oy], memo }) => {
        if (iframePinchingRef.current) return // iframe is handling the pinch
        scaleRef.current = Math.max(0.1, Math.min(s, 3))
        if (first) {
          updateFrameTransform()
          return { ox, oy }
        }
        if (memo) {
          translateRef.current = {
            x: translateRef.current.x + (ox - memo.ox),
            y: translateRef.current.y + (oy - memo.oy),
          }
        }
        updateFrameTransform()
        return { ox, oy }
      },
      onDrag: ({ delta: [, dy], pinching, tap, xy: [x, y], first, event }) => {
        if (pinching) return // Don't scroll while pinching
        if (tap) {
          handleDoubleTap()
          forwardTap(x, y)
          return
        }
        // Single-finger drag → scroll the iframe content
        forwardScroll(-dy)
      },
    },
    {
      target: containerRef,
      drag: { filterTaps: true },
      pinch: {
        from: () => [scaleRef.current, 0],
        scaleBounds: { min: 0.1, max: 3 },
      },
      eventOptions: { passive: false },
    }
  )

  const isMobilePreviewMode = previewMode === "mobile"

  // On mobile layout: render iframe in phone frame with gestures
  // iframe has pointer-events: auto — single-finger gestures work natively (scroll, tap, drag-to-reorder)
  // Two-finger pinch inside iframe is detected and forwarded to parent via postMessage
  if (isMobileLayout) {
    return (
      <div className="h-full flex flex-col bg-muted/30">
        <div
          ref={containerRef}
          className="flex-1 min-h-0 bg-muted/30 flex items-center justify-center overflow-hidden select-none"
          style={{ touchAction: 'none', WebkitTouchCallout: 'none' } as React.CSSProperties}
        >
          <div
            ref={phoneFrameRef}
            className="bg-background shadow-lg overflow-hidden"
            style={{
              width: MOBILE_WIDTH,
              height: MOBILE_HEIGHT,
              borderRadius: '2rem',
              borderWidth: '4px',
              borderColor: 'hsl(var(--foreground) / 0.1)',
              borderStyle: 'solid',
              transform: `translate(${translateRef.current.x}px, ${translateRef.current.y}px) scale(${scaleRef.current})`,
              transformOrigin: 'center center',
              willChange: 'transform',
            }}
          >
            <iframe
              ref={iframeRef}
              src="/preview"
              className="w-full h-full border-0"
              style={{ pointerEvents: 'auto', touchAction: 'pan-y' }}
              title="Page preview"
            />
          </div>
        </div>
      </div>
    )
  }

  // Desktop layout: show phone frame / desktop toggle
  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-2 bg-background">
        <span className="text-sm font-medium text-muted-foreground">
          Preview
        </span>
        <PreviewToggle mode={previewMode} onModeChange={setPreviewMode} />
      </div>

      {/* Preview area - click to deselect card and save */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden p-4 flex items-center justify-center"
        onClick={handleDeselect}
      >
        <div
          className="bg-background shadow-lg overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            width: isMobilePreviewMode ? MOBILE_WIDTH : '100%',
            height: isMobilePreviewMode ? MOBILE_HEIGHT : '100%',
            borderRadius: isMobilePreviewMode ? '2rem' : '0.5rem',
            borderWidth: isMobilePreviewMode ? '4px' : '0px',
            borderColor: 'hsl(var(--foreground) / 0.1)',
            borderStyle: 'solid',
            transform: isMobilePreviewMode ? `scale(${mobileScale})` : 'scale(1)',
            transformOrigin: 'center center',
          }}
        >
          <iframe
            ref={iframeRef}
            src="/preview"
            className="w-full h-full border-0"
            title="Page preview"
          />
        </div>
      </div>
    </div>
  )
}
