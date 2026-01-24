"use client"

import { Monitor, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type PreviewMode = "mobile" | "desktop"

interface PreviewToggleProps {
  mode: PreviewMode
  onModeChange: (mode: PreviewMode) => void
}

export function PreviewToggle({ mode, onModeChange }: PreviewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0",
          mode === "mobile" && "bg-background shadow-sm"
        )}
        onClick={() => onModeChange("mobile")}
        aria-label="Mobile preview"
      >
        <Smartphone className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0",
          mode === "desktop" && "bg-background shadow-sm"
        )}
        onClick={() => onModeChange("desktop")}
        aria-label="Desktop preview"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  )
}
