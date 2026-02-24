"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Link2, Palette, Calendar, Settings, BarChart3, Sparkles, ChevronLeft, ArrowLeft } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { CardsTab } from "./cards-tab"
import { DesignTab } from "./design-tab"
import { ScheduleTab } from "./schedule-tab"
import { InsightsTab } from "./insights-tab"
import { SettingsTab } from "./settings-tab"
import { CardPropertyEditor } from "./card-property-editor"
import { FeaturedThemesTab } from "./featured-themes-tab"
import { WordArtTitleEditor } from "./word-art-title-editor"
import { SelectionToolbar } from "./selection-toolbar"
import { usePageStore } from "@/stores/page-store"
import { useThemeStore } from "@/stores/theme-store"
import { useCards } from "@/hooks/use-cards"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
}

function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-muted p-4">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-muted-foreground text-sm max-w-[280px]">
          {description}
        </p>
      </div>
    </div>
  )
}

const VALID_TABS = ["featured", "links", "design", "schedule", "insights", "settings"]
const MAIN_TABS = ["featured", "links", "design"]
const SIDEBAR_TABS = ["schedule", "insights", "settings"] as const
type SidebarTab = typeof SIDEBAR_TABS[number]

const SIDEBAR_ITEMS: { id: SidebarTab; icon: typeof Calendar; label: string }[] = [
  { id: "schedule", icon: Calendar, label: "Schedule" },
  { id: "insights", icon: BarChart3, label: "Insights" },
  { id: "settings", icon: Settings, label: "Settings" },
]

// ---------------------------------------------------------------------------
// Navigation history entry
// ---------------------------------------------------------------------------

interface NavEntry {
  tab: string
  designSubTab?: string | null
}

interface EditorPanelProps {
  initialTab?: string | null
  initialDesignTab?: string | null
  onTabConsumed?: () => void
  onDesignTabConsumed?: () => void
  onTemplateApplied?: () => void
}

export function EditorPanel({ initialTab: initialTabProp, initialDesignTab, onTabConsumed, onDesignTabConsumed, onTemplateApplied }: EditorPanelProps = {}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get("tab")
  const defaultTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : "featured"
  const [activeTab, setActiveTab] = useState(MAIN_TABS.includes(defaultTab) ? defaultTab : "featured")
  const [sidebarTab, setSidebarTab] = useState<SidebarTab | null>(
    SIDEBAR_TABS.includes(defaultTab as SidebarTab) ? (defaultTab as SidebarTab) : null
  )

  // ---------------------------------------------------------------------------
  // Navigation history
  // ---------------------------------------------------------------------------

  const navHistoryRef = useRef<NavEntry[]>([{ tab: defaultTab }])
  const navIndexRef = useRef(0)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const isNavAction = useRef(false)

  const updateNavFlags = useCallback(() => {
    setCanGoBack(navIndexRef.current > 0)
    setCanGoForward(navIndexRef.current < navHistoryRef.current.length - 1)
  }, [])

  const pushNav = useCallback((entry: NavEntry) => {
    if (isNavAction.current) {
      isNavAction.current = false
      return
    }
    const idx = navIndexRef.current
    const trimmed = navHistoryRef.current.slice(0, idx + 1)
    const last = trimmed[trimmed.length - 1]
    if (last && last.tab === entry.tab && last.designSubTab === entry.designSubTab) {
      navHistoryRef.current = trimmed
      updateNavFlags()
      return
    }
    navHistoryRef.current = [...trimmed, entry]
    navIndexRef.current = idx + 1
    updateNavFlags()
  }, [updateNavFlags])

  const applyNavEntry = useCallback((entry: NavEntry) => {
    if (SIDEBAR_TABS.includes(entry.tab as SidebarTab)) {
      setSidebarTab(entry.tab as SidebarTab)
    } else {
      setSidebarTab(null)
      setActiveTab(entry.tab)
      if (entry.tab === 'design' && entry.designSubTab) {
        setPendingDesignSubTab(entry.designSubTab)
      }
    }
  }, [])

  const goBack = useCallback(() => {
    if (navIndexRef.current <= 0) return
    const newIdx = navIndexRef.current - 1
    const entry = navHistoryRef.current[newIdx]
    if (!entry) return
    isNavAction.current = true
    navIndexRef.current = newIdx
    updateNavFlags()
    applyNavEntry(entry)
  }, [updateNavFlags, applyNavEntry])

  const goForward = useCallback(() => {
    if (navIndexRef.current >= navHistoryRef.current.length - 1) return
    const newIdx = navIndexRef.current + 1
    const entry = navHistoryRef.current[newIdx]
    if (!entry) return
    isNavAction.current = true
    navIndexRef.current = newIdx
    updateNavFlags()
    applyNavEntry(entry)
  }, [updateNavFlags, applyNavEntry])

  // ---------------------------------------------------------------------------
  // Swipe gesture detection
  // ---------------------------------------------------------------------------

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)
    const elapsed = Date.now() - touchStartRef.current.time
    touchStartRef.current = null

    // Must be horizontal swipe (> 60px, more horizontal than vertical, within 300ms)
    if (Math.abs(deltaX) < 60 || deltaY > Math.abs(deltaX) || elapsed > 300) return

    if (deltaX > 0) {
      goBack()
    } else {
      goForward()
    }
  }

  // Watch for initialTab prop to switch top-level tab
  useEffect(() => {
    if (initialTabProp && VALID_TABS.includes(initialTabProp)) {
      if (SIDEBAR_TABS.includes(initialTabProp as SidebarTab)) {
        setSidebarTab(initialTabProp as SidebarTab)
      } else {
        setSidebarTab(null)
        setActiveTab(initialTabProp)
      }
      pushNav({ tab: initialTabProp })
      onTabConsumed?.()
    }
  }, [initialTabProp, onTabConsumed, pushNav])

  // Watch for initialDesignTab changes
  useEffect(() => {
    if (initialDesignTab) {
      setSidebarTab(null)
      setActiveTab('design')
      pushNav({ tab: 'design', designSubTab: initialDesignTab })
      onDesignTabConsumed?.()
    }
  }, [initialDesignTab, onDesignTabConsumed, pushNav])

  // State for navigating to Design > Templates subtab from Featured tab
  const [pendingDesignSubTab, setPendingDesignSubTab] = useState<string | null>(null)

  const handleTabChange = (tab: string) => {
    setSidebarTab(null)
    setActiveTab(tab)
    pushNav({ tab })
    if (tab === "featured") {
      router.replace("/editor", { scroll: false })
    } else {
      router.replace(`/editor?tab=${tab}`, { scroll: false })
    }
  }

  const handleSidebarTabClick = (tab: SidebarTab) => {
    if (sidebarTab === tab) {
      // Toggle off — return to main tabs
      setSidebarTab(null)
      pushNav({ tab: activeTab })
      if (activeTab === "featured") {
        router.replace("/editor", { scroll: false })
      } else {
        router.replace(`/editor?tab=${activeTab}`, { scroll: false })
      }
    } else {
      setSidebarTab(tab)
      pushNav({ tab })
      router.replace(`/editor?tab=${tab}`, { scroll: false })
    }
  }

  const handleNavigateToTheme = (themeId: string) => {
    // Switch theme so TemplatePicker shows that theme's templates
    useThemeStore.getState().setTheme(themeId as any)
    // Navigate to Design > Templates
    setPendingDesignSubTab('templates')
    setSidebarTab(null)
    setActiveTab('design')
    pushNav({ tab: 'design', designSubTab: 'templates' })
    router.replace('/editor?tab=design', { scroll: false })
  }

  // Clear pendingDesignSubTab after DesignTab consumes it
  useEffect(() => {
    if (activeTab === 'design' && pendingDesignSubTab) {
      const timer = setTimeout(() => setPendingDesignSubTab(null), 100)
      return () => clearTimeout(timer)
    }
  }, [activeTab, pendingDesignSubTab])

  const selectedCardId = usePageStore((state) => state.selectedCardId)
  const cards = usePageStore((state) => state.cards)
  const selectCard = usePageStore((state) => state.selectCard)
  const themeId = useThemeStore((state) => state.themeId)
  const { saveCards } = useCards()

  // Check if word-art title is selected (special pseudo-card)
  const isWordArtTitleSelected = selectedCardId === '__word-art-title__' && themeId === 'word-art'

  // Find the selected card
  const selectedCard = selectedCardId && !isWordArtTitleSelected
    ? cards.find((c) => c.id === selectedCardId)
    : null

  // Close editor and save any pending changes
  // IMPORTANT: Save FIRST, before deselecting (which unmounts the editor)
  // Read hasChanges directly from store to avoid stale closure bug
  const handleClose = async () => {
    const currentHasChanges = usePageStore.getState().hasChanges
    if (currentHasChanges) {
      await saveCards()
    }
    selectCard(null)
  }

  // Sidebar icon strip (shared between desktop vertical and mobile horizontal)
  const sidebarIcons = (
    <>
      {SIDEBAR_ITEMS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => handleSidebarTabClick(id)}
          className={cn(
            "flex items-center justify-center h-8 w-8 rounded-md transition-colors",
            "hover:bg-muted",
            sidebarTab === id && "bg-muted text-foreground"
          )}
          aria-label={label}
          title={label}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </>
  )

  // Sidebar content panel (when a sidebar tab is active)
  const sidebarContent = sidebarTab && (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-3 py-2 shrink-0">
        <button
          onClick={() => handleSidebarTabClick(sidebarTab)}
          className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors"
          aria-label="Back to tabs"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium capitalize">{sidebarTab}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sidebarTab === "schedule" && <ScheduleTab />}
        {sidebarTab === "insights" && <InsightsTab />}
        {sidebarTab === "settings" && <SettingsTab />}
      </div>
    </div>
  )

  return (
    <div className="flex h-full flex-col">
      {isWordArtTitleSelected ? (
        // Show word art title style editor
        <WordArtTitleEditor onClose={() => selectCard(null)} />
      ) : selectedCard ? (
        // Show property editor when card is selected
        <CardPropertyEditor
          card={selectedCard}
          onClose={handleClose}
        />
      ) : (
        <div className="flex h-full flex-row">
          {/* Desktop: vertical icon strip on left */}
          <div className="hidden md:flex w-10 border-r flex-col items-center py-2 gap-1 shrink-0">
            {sidebarIcons}
          </div>

          {/* Main content area */}
          <div className="flex-1 min-w-0 flex flex-col h-full">
            {sidebarTab ? (
              sidebarContent
            ) : (
              <Tabs value={activeTab} onValueChange={handleTabChange} className="flex h-full flex-col">
                <div className="border-b px-2 py-2 shrink-0 overflow-x-auto scrollbar-none touch-pan-x">
                  <div className="flex items-center gap-1">
                    {/* Back button — only on desktop, mobile uses swipe */}
                    {canGoBack && (
                      <button
                        onClick={goBack}
                        className="hidden md:flex items-center justify-center h-8 w-8 shrink-0 rounded-md hover:bg-muted transition-colors"
                        aria-label="Go back"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    )}
                    <TabsList className="w-full">
                      <TabsTrigger value="featured" className="gap-1 px-1 sm:px-2.5 flex-1 min-w-0">
                        <Sparkles className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs whitespace-nowrap hidden sm:inline">Featured</span>
                      </TabsTrigger>
                      <TabsTrigger value="links" className="gap-1 px-1 sm:px-2.5 flex-1 min-w-0">
                        <Link2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs whitespace-nowrap hidden sm:inline">Links</span>
                      </TabsTrigger>
                      <TabsTrigger value="design" className="gap-1 px-1 sm:px-2.5 flex-1 min-w-0">
                        <Palette className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs whitespace-nowrap hidden sm:inline">Design</span>
                      </TabsTrigger>
                    </TabsList>
                    {/* Mobile: horizontal sidebar icons inline with tabs */}
                    <div className="flex md:hidden items-center gap-0.5 ml-1 shrink-0">
                      {sidebarIcons}
                    </div>
                  </div>
                </div>

                {/* Swipeable content area */}
                <div
                  ref={contentRef}
                  className="flex-1 overflow-hidden"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <TabsContent
                    value="featured"
                    className={cn(
                      "h-full overflow-hidden",
                      "data-[state=inactive]:hidden"
                    )}
                  >
                    <FeaturedThemesTab onNavigateToTheme={handleNavigateToTheme} onTemplateApplied={onTemplateApplied} />
                  </TabsContent>

                  <TabsContent
                    value="links"
                    className={cn(
                      "h-full overflow-hidden",
                      "data-[state=inactive]:hidden"
                    )}
                  >
                    <CardsTab />
                  </TabsContent>

                  <TabsContent
                    value="design"
                    className={cn(
                      "h-full overflow-hidden",
                      "data-[state=inactive]:hidden"
                    )}
                  >
                    <DesignTab initialSubTab={pendingDesignSubTab || initialDesignTab} />
                  </TabsContent>
                </div>

              </Tabs>
            )}
          </div>
        </div>
      )}

      {/* Selection toolbar - auto-hides when no selection */}
      <SelectionToolbar />
    </div>
  )
}
