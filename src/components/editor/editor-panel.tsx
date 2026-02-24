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
          <div className="border-b px-4 py-2">
            <TabsList className="w-full">
              <TabsTrigger value="featured" className="flex-1 gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Featured</span>
              </TabsTrigger>
              <TabsTrigger value="links" className="flex-1 gap-2">
                <Link2 className="h-4 w-4" />
                <span className="hidden sm:inline">Links</span>
              </TabsTrigger>
              <TabsTrigger value="design" className="flex-1 gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Design</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex-1 gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Schedule</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex-1 gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1 gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
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
