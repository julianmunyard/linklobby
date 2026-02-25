"use client"

import { useState } from "react"
import { Copy, Check, ExternalLink, Save, Loader2, Undo2, Redo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"
import { usePageStore } from "@/stores/page-store"
import { useProfileStore } from "@/stores/profile-store"
import { useCards } from "@/hooks/use-cards"
import { useHistory } from "@/hooks/use-history"
import { cn } from "@/lib/utils"
import { DevTemplateSaver, DevTemplateManager, DevQuickResave } from "@/components/editor/dev-template-saver"
import { PlanBadge } from "@/components/billing/plan-badge"
import type { PlanTier } from "@/lib/stripe/plans"

interface DashboardHeaderProps {
  username: string
  planTier?: PlanTier
}

export function DashboardHeader({ username, planTier }: DashboardHeaderProps) {
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const cardHasChanges = usePageStore((state) => state.hasChanges)
  const profileHasChanges = useProfileStore((state) => state.hasChanges)
  const hasChanges = cardHasChanges || profileHasChanges
  const { saveCards } = useCards()
  const { undo, redo, canUndo, canRedo } = useHistory()

  const handleUndo = () => {
    undo()
    toast("Undone", { duration: 2000 })
  }

  const handleRedo = () => {
    redo()
    toast("Redone", { duration: 2000 })
  }

  const publicUrl = `linklobby.com/${username}`
  const fullUrl = `https://${publicUrl}`

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      toast.success("Link copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Save cards if changed
      if (cardHasChanges) {
        await saveCards()
      }

      // Save profile if changed
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
    } catch {
      toast.error("Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex items-center justify-between w-full px-2 sm:px-4 py-2 border-b bg-background gap-2 overflow-x-auto">
      {/* Left side: User info and public URL */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
        <span className="font-medium text-sm truncate">{username}</span>
        {planTier && <PlanBadge tier={planTier} />}
        <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
          <span className="hidden sm:inline">{publicUrl}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleCopyUrl}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span className="sr-only">Copy URL</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy public URL</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                asChild
              >
                <a
                  href={`/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="sr-only">Open public page</span>
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>View public page</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Right side: Dev tools, Undo/Redo, Save status and button */}
      <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
        {/* Dev-only template tools — hidden on mobile */}
        <div className="hidden sm:contents">
          <DevQuickResave />
          <DevTemplateSaver />
          <DevTemplateManager />
        </div>

        {/* Undo/Redo buttons */}
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                onClick={handleUndo}
                disabled={!canUndo}
              >
                <Undo2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="sr-only">Undo</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                onClick={handleRedo}
                disabled={!canRedo}
              >
                <Redo2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="sr-only">Redo</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
          </Tooltip>
        </div>

        {/* Unsaved dot — mobile only shows dot, no text */}
        {hasChanges && (
          <span
            className={cn(
              "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-yellow-500 shrink-0",
              "animate-pulse"
            )}
          />
        )}

        {/* Unsaved text — desktop only */}
        {hasChanges && (
          <span className="hidden sm:inline text-sm text-muted-foreground">
            Unsaved changes
          </span>
        )}

        {/* Save button — icon only on mobile */}
        <Button
          size="sm"
          disabled={!hasChanges || isSaving}
          onClick={handleSave}
          className="h-6 w-6 sm:h-8 sm:w-auto p-0 sm:px-3 sm:gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          ) : (
            <Save className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
          <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
        </Button>
      </div>
    </div>
  )
}
