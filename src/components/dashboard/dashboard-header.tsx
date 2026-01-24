"use client"

import { useState } from "react"
import { Copy, Check, ExternalLink, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"
import { usePageStore } from "@/stores/page-store"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  username: string
}

export function DashboardHeader({ username }: DashboardHeaderProps) {
  const [copied, setCopied] = useState(false)
  const hasChanges = usePageStore((state) => state.hasChanges)
  const markSaved = usePageStore((state) => state.markSaved)

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
    // TODO: Implement actual save to database in future phase
    // For now, just mark as saved in the store
    markSaved()
    toast.success("Changes saved")
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

      {/* Right side: Save status and button */}
      <div className="flex items-center gap-3">
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
          disabled={!hasChanges}
          onClick={handleSave}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">Save</span>
        </Button>
      </div>
    </div>
  )
}
