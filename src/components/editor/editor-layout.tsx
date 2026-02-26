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
import { MobileSelectionBar } from "./mobile-select-mode"
import { MobileQuickSettings } from "./mobile-quick-settings"
import { MobileCardTypeDrawer } from "./mobile-card-type-drawer"
import { useIsMobileLayout } from "@/hooks/use-media-query"
import { useOnline } from "@/hooks/use-online"
import { usePageStore } from "@/stores/page-store"
import { useCards } from "@/hooks/use-cards"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "editor-layout"

export function EditorLayout() {
  const [mounted, setMounted] = useState(false)
  const [defaultLayout, setDefaultLayout] = useState<Layout | undefined>(undefined)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [typeDrawerOpen, setTypeDrawerOpen] = useState(false)
  const [initialTab, setInitialTab] = useState<string | null>(null)
  const [initialDesignTab, setInitialDesignTab] = useState<string | null>(null)
  const isMobileLayout = useIsMobileLayout()
  const isOnline = useOnline()
  const selectedCardId = usePageStore((state) => state.selectedCardId)
  const cards = usePageStore((state) => state.cards)
  const selectedCard = cards.find(c => c.id === selectedCardId) || null
  const { saveCards } = useCards()

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

  // On mobile, open the full card editor sheet when a card is selected
  useEffect(() => {
    if (isMobileLayout && selectedCardId) {
      setMobileSheetOpen(true)
      setTypeDrawerOpen(false)
      setInitialDesignTab(null)
    }
  }, [isMobileLayout, selectedCardId])

  // Listen for OPEN_DESIGN_TAB events from preview iframe (e.g. artifact header click)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      const tab = detail?.tab || 'style'
      setInitialDesignTab(tab)
      if (isMobileLayout) {
        setMobileSheetOpen(true)
        setTypeDrawerOpen(false)
      }
    }
    window.addEventListener('open-design-tab', handler)
    return () => window.removeEventListener('open-design-tab', handler)
  }, [isMobileLayout])

  const handleTemplateApplied = useCallback(() => {
    if (isMobileLayout) {
      setMobileSheetOpen(false)
    }
  }, [isMobileLayout])

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


        {/* Quick access settings bar */}
        <MobileQuickSettings
          onOpenFullSettings={(subTab) => {
            setInitialDesignTab(subTab)
            setMobileSheetOpen(true)
          }}
          onQuickSettingsOpen={() => {
            // Close card type drawer so it doesn't overlap the quick settings drawer
            setTypeDrawerOpen(false)
            if (usePageStore.getState().hasChanges) {
              saveCards()
            }
          }}
        />

        {/* Mobile selection bar (shows when in select mode with selected cards) */}
        <MobileSelectionBar />

        {/* Mobile card type drawer */}
        <MobileCardTypeDrawer
          open={typeDrawerOpen}
          onOpenChange={(open) => {
            setTypeDrawerOpen(open)
            if (!open) {
              // Clear selection so tapping the same card reopens the drawer
              usePageStore.getState().selectCard(null)
              // Flush save immediately when drawer closes so changes persist
              if (usePageStore.getState().hasChanges) {
                saveCards()
              }
            }
          }}
          card={selectedCard}
          onOpenFullEditor={() => {
            setTypeDrawerOpen(false)
            setMobileSheetOpen(true)
          }}
        />

        {/* Full-width preview - min-h-0 prevents flex child from overflowing */}
        <div className="flex-1 min-h-0 bg-muted/30">
          <PreviewPanel />
        </div>

        {/* FAB stack: Presets, Design, Add Card */}
        <MobileFAB
          onOpenFeatured={() => {
            setInitialTab('featured')
            setInitialDesignTab(null)
            setMobileSheetOpen(true)
          }}
          onAddCard={() => {
            setInitialTab('links')
            setInitialDesignTab(null)
            setMobileSheetOpen(true)
          }}
          onOpenDesign={() => {
            setInitialTab(null)
            setInitialDesignTab('colors')
            setMobileSheetOpen(true)
          }}
          onOpenPresets={() => {
            setInitialTab(null)
            setInitialDesignTab('presets')
            setMobileSheetOpen(true)
          }}
        />

        {/* Bottom sheet with editor */}
        <MobileBottomSheet
          open={mobileSheetOpen}
          onOpenChange={(open) => {
            setMobileSheetOpen(open)
            if (!open) {
              setInitialTab(null)
              setInitialDesignTab(null)
              setTypeDrawerOpen(false)
            }
          }}
          title="Editor"
        >
          <EditorPanel
            initialTab={initialTab}
            initialDesignTab={initialDesignTab}
            onTabConsumed={() => setInitialTab(null)}
            onDesignTabConsumed={() => setInitialDesignTab(null)}
            onTemplateApplied={handleTemplateApplied}
            onSettingChanged={() => {
              setMobileSheetOpen(false)
              usePageStore.getState().selectCard(null)
            }}
          />
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
          <EditorPanel
            initialDesignTab={initialDesignTab}
            onDesignTabConsumed={() => setInitialDesignTab(null)}
            onTemplateApplied={handleTemplateApplied}
          />
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
