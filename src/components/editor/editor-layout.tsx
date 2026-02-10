"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Panel,
  Group,
  Separator,
  type Layout,
} from "react-resizable-panels"

import { EditorPanel } from "./editor-panel"
import { PreviewPanel } from "./preview-panel"
import { MobileBottomSheet } from "./mobile-bottom-sheet"
import { MobileFAB } from "./mobile-fab"
import { MobileSelectToggle, MobileSelectionBar } from "./mobile-select-mode"
import { useIsMobileLayout } from "@/hooks/use-media-query"
import { useOnline } from "@/hooks/use-online"
import { usePageStore } from "@/stores/page-store"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "editor-layout"

export function EditorLayout() {
  const [mounted, setMounted] = useState(false)
  const [defaultLayout, setDefaultLayout] = useState<Layout | undefined>(undefined)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const isMobileLayout = useIsMobileLayout()
  const isOnline = useOnline()
  const selectedCardId = usePageStore((state) => state.selectedCardId)

  // Only access localStorage after mount (client-side)
  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setDefaultLayout(JSON.parse(saved))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // On mobile, open bottom sheet when a card is selected
  useEffect(() => {
    if (isMobileLayout && selectedCardId) {
      setMobileSheetOpen(true)
    }
  }, [isMobileLayout, selectedCardId])

  const onLayoutChanged = useCallback((layout: Layout) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  // Mobile layout: Full-screen preview with bottom sheet
  if (isMobileLayout) {
    return (
      <div className="relative h-full flex flex-col">
        {/* Offline banner */}
        {!isOnline && (
          <div className="bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm font-medium">
            You&rsquo;re offline - changes won&rsquo;t be saved
          </div>
        )}

        {/* Mobile toolbar with Select toggle */}
        <div className="bg-background border-b p-2 flex items-center justify-end gap-2">
          <MobileSelectToggle />
        </div>

        {/* Mobile selection bar (shows when in select mode with selected cards) */}
        <MobileSelectionBar />

        {/* Full-width preview - min-h-0 prevents flex child from overflowing */}
        <div className="flex-1 min-h-0 bg-muted/30">
          <PreviewPanel />
        </div>

        {/* FAB button for adding cards */}
        <MobileFAB onClick={() => setMobileSheetOpen(true)} />

        {/* Bottom sheet with editor */}
        <MobileBottomSheet
          open={mobileSheetOpen}
          onOpenChange={setMobileSheetOpen}
          title="Editor"
        >
          <EditorPanel />
        </MobileBottomSheet>
      </div>
    )
  }

  // Desktop layout: Split-panel view
  return (
    <div className="h-full flex flex-col">
      {/* Offline banner */}
      {!isOnline && (
        <div className="bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm font-medium">
          You&rsquo;re offline - changes won&rsquo;t be saved
        </div>
      )}

      {/* Split panel layout */}
      <Group
        orientation="horizontal"
        defaultLayout={defaultLayout}
        onLayoutChanged={onLayoutChanged}
        className="flex-1"
      >
        {/* Editor panel: 25-60% width, default 40% */}
        <Panel
          id="editor"
          defaultSize="40%"
          minSize="25%"
          maxSize="60%"
          className="bg-background"
        >
          <EditorPanel />
        </Panel>

        {/* Resize handle with extended hit area */}
        <Separator
          className={cn(
            "relative w-1 bg-border transition-colors",
            "hover:bg-primary/50 active:bg-primary",
            // Extended hit area for accessibility
            "before:absolute before:inset-y-0 before:-left-1 before:-right-1",
            "before:content-['']"
          )}
        />

        {/* Preview panel: 40%+ width, default 60% */}
        <Panel
          id="preview"
          defaultSize="60%"
          minSize="40%"
          className="bg-muted/30"
        >
          <PreviewPanel />
        </Panel>
      </Group>
    </div>
  )
}
