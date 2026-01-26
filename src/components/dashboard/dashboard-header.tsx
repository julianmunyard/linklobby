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
import { useCards } from "@/hooks/use-cards"
import { useHistory } from "@/hooks/use-history"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  username: string
}

export function DashboardHeader({ username }: DashboardHeaderProps) {
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const hasChanges = usePageStore((state) => state.hasChanges)
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
      await saveCards()
      toast.success("Changes saved")
    } catch {
      toast.error("Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex items-center justify-between w-full px-4 py-2 border-b bg-background">
      {/* Left side: User info and public URL */}
      <div className="flex items-center gap-3">
        <span className="font-medium text-sm">{username}</span>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
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

      {/* Right side: Undo/Redo, Save status and button */}
      <div className="flex items-center gap-3">
        {/* Undo/Redo buttons */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleUndo}
                disabled={!canUndo}
              >
                <Undo2 className="h-3.5 w-3.5" />
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
                className="h-7 w-7 p-0"
                onClick={handleRedo}
                disabled={!canRedo}
              >
                <Redo2 className="h-3.5 w-3.5" />
                <span className="sr-only">Redo</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
          </Tooltip>
        </div>

        {/* Visual separator */}
        <div className="border-r h-4" />

        {/* Unsaved changes indicator */}
        {hasChanges && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className={cn(
                "h-2 w-2 rounded-full bg-yellow-500",
                "animate-pulse"
              )}
            />
            <span className="hidden sm:inline">Unsaved changes</span>
          </div>
        )}

        {/* Save button */}
        <Button
          size="sm"
          disabled={!hasChanges || isSaving}
          onClick={handleSave}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
        </Button>
      </div>
    </div>
  )
}
