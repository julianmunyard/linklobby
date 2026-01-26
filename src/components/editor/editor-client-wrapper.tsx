"use client"

import { useEffect } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { EditorLayout } from "@/components/editor/editor-layout"
import { UnsavedChangesDialog } from "@/components/dashboard/unsaved-changes-dialog"
import { HistoryHotkeys } from "@/components/editor/history-hotkeys"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import { useAutoSave } from "@/hooks/use-auto-save"
import { usePageStore } from "@/stores/page-store"
import { useProfileStore } from "@/stores/profile-store"
import { toast } from "sonner"

interface EditorClientWrapperProps {
  username: string
}

export function EditorClientWrapper({ username }: EditorClientWrapperProps) {
  const {
    showDialog,
    setShowDialog,
    confirmNavigation,
    cancelNavigation,
  } = useUnsavedChanges()

  // Auto-save changes after 500ms of inactivity
  useAutoSave(500)

  const markSaved = usePageStore((state) => state.markSaved)

  // Load profile from database on mount
  useEffect(() => {
    async function loadProfile() {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        useProfileStore.getState().initializeProfile(data)
      }
    }
    loadProfile()
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
    <TooltipProvider>
      {/* Register undo/redo keyboard shortcuts */}
      <HistoryHotkeys />

      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Editor header */}
        <DashboardHeader username={username} />

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
  )
}
