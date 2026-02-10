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
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const baseScaleRef = useRef(1)
  const scaleRef = useRef(1)
  const lastTapRef = useRef(0)
  const isMobileLayout = useIsMobileLayout()
  const getSnapshot = usePageStore((state) => state.getSnapshot)
  const reorderCards = usePageStore((state) => state.reorderCards)
  const reorderMultipleCards = usePageStore((state) => state.reorderMultipleCards)
  const selectCard = usePageStore((state) => state.selectCard)
  const getProfileSnapshot = useProfileStore((state) => state.getSnapshot)
  const updateReceiptSticker = useThemeStore((state) => state.updateReceiptSticker)
  const updateIpodSticker = useThemeStore((state) => state.updateIpodSticker)
  const { saveCards } = useCards()

  // Keep ref in sync for stale closure access in message handlers
  useEffect(() => { scaleRef.current = scale }, [scale])

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
    setScale(newScale)
  }, [])

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
  // IMPORTANT: Save FIRST, before deselecting (which unmounts the editor)
  // Read hasChanges directly from store to avoid stale closure bug
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
      // Double tap - reset to fit
      setScale(baseScaleRef.current)
      setTranslate({ x: 0, y: 0 })
    }
    lastTapRef.current = now
  }

  // Send state to preview iframe
  const sendToPreview = () => {
    const iframe = iframeRef.current
    if (iframe?.contentWindow && previewReady) {
      const snapshot = getSnapshot()
      const profileSnapshot = getProfileSnapshot()
      // Get theme state snapshot (exclude actions)
      const { themeId, paletteId, colors, fonts, style, background, cardTypeFontSizes, socialIconSize, centerCards, vcrCenterContent, receiptPrice, receiptStickers, receiptFloatAnimation, receiptPaperTexture, ipodStickers, ipodTexture, macPattern, macPatternColor, wordArtTitleStyle, lanyardActiveView, classifiedStampText, classifiedDeptText, classifiedCenterText, classifiedMessageText } = useThemeStore.getState()
      const themeSnapshot = { themeId, paletteId, colors, fonts, style, background, cardTypeFontSizes, socialIconSize, centerCards, vcrCenterContent, receiptPrice, receiptStickers, receiptFloatAnimation, receiptPaperTexture, ipodStickers, ipodTexture, macPattern, macPatternColor, wordArtTitleStyle, lanyardActiveView, classifiedStampText, classifiedDeptText, classifiedCenterText, classifiedMessageText }
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
          // Save immediately after reorder - don't wait for debounce
          saveCards()
          break
        case "REORDER_MULTIPLE_CARDS":
          reorderMultipleCards(event.data.payload.cardIds, event.data.payload.targetIndex)
          // Save immediately after reorder - don't wait for debounce
          saveCards()
          break
        case "SELECT_CARD":
          selectCard(event.data.payload.cardId)
          break
        case "UPDATE_STICKER":
          updateReceiptSticker(event.data.payload.id, { x: event.data.payload.x, y: event.data.payload.y })
          break
        case "UPDATE_IPOD_STICKER":
          updateIpodSticker(event.data.payload.id, { x: event.data.payload.x, y: event.data.payload.y })
          break
        case "PINCH_START":
          baseScaleRef.current = scaleRef.current
          break
        case "PINCH_UPDATE": {
          const newScale = baseScaleRef.current * event.data.payload.scale
          setScale(Math.max(0.1, Math.min(newScale, 3)))
          break
        }
        case "PINCH_END":
          // Pinch finished, scale is already set
          break
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [reorderCards, reorderMultipleCards, selectCard, saveCards, updateReceiptSticker, updateIpodSticker])

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

  // Drag gesture for panning when zoomed (pinch handled via postMessage from iframe)
  const bind = useGesture(
    {
      onDrag: ({ delta: [dx, dy] }) => {
        setTranslate(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      },
    },
    {
      target: containerRef,
      drag: { filterTaps: true },
      eventOptions: { passive: false },
    }
  )

  const isMobilePreviewMode = previewMode === "mobile"

  // On mobile layout: render iframe in phone frame with gestures
  if (isMobileLayout) {
    return (
      <div className="h-full flex flex-col bg-muted/30">
        <div
          ref={containerRef}
          className="flex-1 min-h-0 bg-muted/30 flex items-center justify-center overflow-hidden"
          style={{ touchAction: 'none' }}
          onClick={(e) => {
            handleDoubleTap()
            handleDeselect()
          }}
        >
          <div
            className="bg-background shadow-lg overflow-hidden"
            style={{
              width: MOBILE_WIDTH,
              height: MOBILE_HEIGHT,
              borderRadius: '2rem',
              borderWidth: '4px',
              borderColor: 'hsl(var(--foreground) / 0.1)',
              borderStyle: 'solid',
              transform: `scale(${scale}) translate(${translate.x}px, ${translate.y}px)`,
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
