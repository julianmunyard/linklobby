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
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const getSnapshot = usePageStore((state) => state.getSnapshot)

  // Send state to preview iframe when it loads or state changes
  const sendToPreview = () => {
    const iframe = iframeRef.current
    if (iframe?.contentWindow) {
      const snapshot = getSnapshot()
      iframe.contentWindow.postMessage(
        { type: "STATE_UPDATE", payload: snapshot },
        window.location.origin
      )
    }
  }

  // Subscribe to store changes and send updates to preview
  useEffect(() => {
    const unsubscribe = usePageStore.subscribe(() => {
      sendToPreview()
    })
    return () => unsubscribe()
  }, [])

  const handleIframeLoad = () => {
    // Send initial state when iframe loads
    sendToPreview()
  }

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
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
    </div>
  )
}
