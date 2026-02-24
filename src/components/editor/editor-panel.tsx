"use client"

import { useState, useEffect } from "react"
import { Link2, Palette, Calendar, Settings, BarChart3, Sparkles } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Watch for initialTab prop to switch top-level tab
  useEffect(() => {
    if (initialTabProp && VALID_TABS.includes(initialTabProp)) {
      setActiveTab(initialTabProp)
      onTabConsumed?.()
    }
  }, [initialTabProp, onTabConsumed])

  // Watch for initialDesignTab changes
  useEffect(() => {
    if (initialDesignTab) {
      setActiveTab('design')
      onDesignTabConsumed?.()
    }
  }, [initialDesignTab, onDesignTabConsumed])

  // State for navigating to Design > Templates subtab from Featured tab
  const [pendingDesignSubTab, setPendingDesignSubTab] = useState<string | null>(null)

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Update URL so reload lands on the correct tab ("featured" is default, no param needed)
    if (tab === "featured") {
      router.replace("/editor", { scroll: false })
    } else {
      router.replace(`/editor?tab=${tab}`, { scroll: false })
    }
  }

  const handleNavigateToTheme = (themeId: string) => {
    // Switch theme so TemplatePicker shows that theme's templates
    useThemeStore.getState().setTheme(themeId as any)
    // Navigate to Design > Templates
    setPendingDesignSubTab('templates')
    setActiveTab('design')
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
        // Show tabs when no card selected
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex h-full flex-col">
          <div className="border-b px-2 py-2 overflow-x-auto scrollbar-none touch-pan-x">
            <TabsList className="w-max min-w-full">
              <TabsTrigger value="featured" className="gap-1.5 px-2.5">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs whitespace-nowrap">Featured</span>
              </TabsTrigger>
              <TabsTrigger value="links" className="gap-1.5 px-2.5">
                <Link2 className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs whitespace-nowrap">Links</span>
              </TabsTrigger>
              <TabsTrigger value="design" className="gap-1.5 px-2.5">
                <Palette className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs whitespace-nowrap">Design</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="gap-1.5 px-2.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs whitespace-nowrap">Schedule</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-1.5 px-2.5">
                <BarChart3 className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs whitespace-nowrap">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1.5 px-2.5">
                <Settings className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs whitespace-nowrap">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="featured"
            className={cn(
              "flex-1 overflow-hidden",
              "data-[state=inactive]:hidden"
            )}
          >
            <FeaturedThemesTab onNavigateToTheme={handleNavigateToTheme} onTemplateApplied={onTemplateApplied} />
          </TabsContent>

          <TabsContent
            value="links"
            className={cn(
              "flex-1 overflow-hidden",
              "data-[state=inactive]:hidden"
            )}
          >
            <CardsTab />
          </TabsContent>

          <TabsContent
            value="design"
            className={cn(
              "flex-1 overflow-hidden",
              "data-[state=inactive]:hidden"
            )}
          >
            <DesignTab initialSubTab={pendingDesignSubTab || initialDesignTab} />
          </TabsContent>

          <TabsContent
            value="schedule"
            className={cn(
              "flex-1 overflow-hidden",
              "data-[state=inactive]:hidden"
            )}
          >
            <ScheduleTab />
          </TabsContent>

          <TabsContent
            value="insights"
            className={cn(
              "flex-1 overflow-hidden",
              "data-[state=inactive]:hidden"
            )}
          >
            <InsightsTab />
          </TabsContent>

          <TabsContent
            value="settings"
            className={cn(
              "flex-1 overflow-hidden",
              "data-[state=inactive]:hidden"
            )}
          >
            <SettingsTab />
          </TabsContent>

        </Tabs>
      )}

      {/* Selection toolbar - auto-hides when no selection */}
      <SelectionToolbar />
    </div>
  )
}
