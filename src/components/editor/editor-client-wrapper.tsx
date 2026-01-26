"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { EditorLayout } from "@/components/editor/editor-layout"
import { UnsavedChangesDialog } from "@/components/dashboard/unsaved-changes-dialog"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import { useAutoSave } from "@/hooks/use-auto-save"
import { usePageStore } from "@/stores/page-store"
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

  const handleSave = async () => {
    // TODO: Implement actual save to Supabase in later phases
    // For now, just mark as saved
    markSaved()
    toast.success("Changes saved")
    setShowDialog(false)
    // If there was pending navigation, proceed
    confirmNavigation()
  }

  const handleDiscard = () => {
    confirmNavigation()
  }

  return (
    <TooltipProvider>
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
