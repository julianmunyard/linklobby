"use client"

import { useEffect } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { EditorLayout } from "@/components/editor/editor-layout"
import { UnsavedChangesDialog } from "@/components/dashboard/unsaved-changes-dialog"
import { HistoryHotkeys } from "@/components/editor/history-hotkeys"
import { MultiSelectProvider } from "@/contexts/multi-select-context"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import { useAutoSave } from "@/hooks/use-auto-save"
import { usePageStore } from "@/stores/page-store"
import { useProfileStore } from "@/stores/profile-store"
import { useThemeStore } from "@/stores/theme-store"
import { toast } from "sonner"
import type { PlanTier } from "@/lib/stripe/plans"

interface EditorClientWrapperProps {
  username: string
  planTier?: PlanTier
}

export function EditorClientWrapper({ username, planTier }: EditorClientWrapperProps) {
  const {
    showDialog,
    setShowDialog,
    confirmNavigation,
    cancelNavigation,
  } = useUnsavedChanges()

  // Auto-save changes after 500ms of inactivity, plus immediate save on blur
  useAutoSave(500)

  const markSaved = usePageStore((state) => state.markSaved)

  // Load profile and theme from database on mount
  useEffect(() => {
    async function loadProfile() {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        useProfileStore.getState().initializeProfile(data)
      }
    }

    async function loadTheme() {
      const response = await fetch('/api/theme')
      if (response.ok) {
        const data = await response.json()
        // Only load from DB if theme exists, otherwise keep localStorage
        if (data.theme) {
          useThemeStore.getState().loadFromDatabase(data.theme)
        }
      }
    }

    loadProfile()
    loadTheme()
  }, [])

  const handleSave = async () => {
    try {
      // Save cards if changed
      const cardHasChanges = usePageStore.getState().hasChanges
      if (cardHasChanges) {
        // Cards are saved via useAutoSave hook
        markSaved()
      }

      // Save profile if changed
      const profileHasChanges = useProfileStore.getState().hasChanges
      if (profileHasChanges) {
        const profile = useProfileStore.getState().getSnapshot()
        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        })
        if (!response.ok) throw new Error('Failed to save profile')
        useProfileStore.getState().markSaved()
      }

      // Save theme if changed
      const themeHasChanges = useThemeStore.getState().hasChanges
      if (themeHasChanges) {
        const theme = useThemeStore.getState().getSnapshot()
        const response = await fetch('/api/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme }),
        })
        if (!response.ok) throw new Error('Failed to save theme')
        useThemeStore.getState().markSaved()
      }

      toast.success("Changes saved")
      setShowDialog(false)
      // If there was pending navigation, proceed
      confirmNavigation()
    } catch {
      toast.error("Failed to save changes")
    }
  }

  const handleDiscard = () => {
    confirmNavigation()
  }

  return (
    <MultiSelectProvider>
      <TooltipProvider>
        {/* Register undo/redo keyboard shortcuts */}
        <HistoryHotkeys />

        <div className="flex flex-col h-[calc(100dvh-3.5rem)]">
          {/* Editor header */}
          <DashboardHeader username={username} planTier={planTier} />

          {/* Split-screen editor */}
          <div className="flex-1 overflow-hidden">
            <EditorLayout />
          </div>
        </div>

        {/* Unsaved changes dialog */}
        <UnsavedChangesDialog
          open={showDialog}
          onSave={handleSave}
          onDiscard={handleDiscard}
          onCancel={cancelNavigation}
        />
      </TooltipProvider>
    </MultiSelectProvider>
  )
}
