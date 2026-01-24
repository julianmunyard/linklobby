"use client"

import { useState, useRef, useEffect } from "react"
import { PreviewToggle, type PreviewMode } from "./preview-toggle"
import { usePageStore } from "@/stores/page-store"
import { cn } from "@/lib/utils"

const PREVIEW_SIZES = {
  mobile: { width: 375, height: 667 },
  desktop: { width: "100%", height: "100%" },
} as const

export function PreviewPanel() {
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop")
  const [previewReady, setPreviewReady] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const getSnapshot = usePageStore((state) => state.getSnapshot)
  const reorderCards = usePageStore((state) => state.reorderCards)

  // Send state to preview iframe
  const sendToPreview = () => {
    const iframe = iframeRef.current
    if (iframe?.contentWindow && previewReady) {
      const snapshot = getSnapshot()
      iframe.contentWindow.postMessage(
        { type: "STATE_UPDATE", payload: snapshot },
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
          reorderCards(event.data.payload.oldIndex, event.data.payload.newIndex)
          break
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [reorderCards])

  // Send initial state when preview becomes ready
  useEffect(() => {
    if (previewReady) {
      sendToPreview()
    }
  }, [previewReady])

  // Subscribe to store changes and send updates to preview
  useEffect(() => {
    const unsubscribe = usePageStore.subscribe(() => {
      sendToPreview()
    })
    return () => unsubscribe()
  }, [previewReady])

  const size = PREVIEW_SIZES[previewMode]
  const isMobile = previewMode === "mobile"

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-2 bg-background">
        <span className="text-sm font-medium text-muted-foreground">
          Preview
        </span>
        <PreviewToggle mode={previewMode} onModeChange={setPreviewMode} />
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto p-4">
        <div
          className={cn(
            "mx-auto bg-background rounded-lg shadow-lg overflow-hidden transition-all duration-300",
            isMobile && "border-4 border-foreground/10 rounded-[2rem]"
          )}
          style={{
            width: isMobile ? size.width : "100%",
            height: isMobile ? size.height : "100%",
            maxWidth: "100%",
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
