"use client"

import { useMemo } from "react"
import { Calendar, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getScheduleStatus, type ScheduleStatus } from "@/types/card"
import type { Card } from "@/types/card"

interface ScheduleCardItemProps {
  card: Card
  onUpdate: (content: Record<string, unknown>) => void
}

// Format ISO string to datetime-local input value (in local timezone)
function formatForInput(isoString: string | undefined): string {
  if (!isoString) return ""
  const date = new Date(isoString)
  // Format as YYYY-MM-DDTHH:mm for datetime-local input
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Convert datetime-local input to ISO UTC string
function parseInputToIso(localDatetime: string): string {
  const date = new Date(localDatetime)
  return date.toISOString()
}

// Format date for display using Intl.DateTimeFormat
function formatDateDisplay(isoString: string): string {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

// Get badge variant and text based on schedule status
function getStatusBadge(status: ScheduleStatus, content: Record<string, unknown>): { variant: "default" | "secondary" | "destructive" | "outline"; text: string; className?: string } | null {
  const publishAt = content.publishAt as string | undefined
  const expireAt = content.expireAt as string | undefined

  switch (status) {
    case "scheduled":
      return {
        variant: "default",
        text: `Scheduled for ${formatDateDisplay(publishAt!)}`,
        className: "bg-blue-500 hover:bg-blue-600"
      }
    case "expired":
      return {
        variant: "secondary",
        text: "Expired",
        className: "bg-gray-500 text-white"
      }
    case "active":
      if (expireAt) {
        return {
          variant: "outline",
          text: `Expires ${formatDateDisplay(expireAt)}`,
          className: "border-orange-500 text-orange-500"
        }
      }
      return null
    default:
      return null
  }
}

export function ScheduleCardItem({ card, onUpdate }: ScheduleCardItemProps) {
  const content = card.content as Record<string, unknown>
  const publishAt = content.publishAt as string | undefined
  const expireAt = content.expireAt as string | undefined
  const cardId = card.id // Store stable reference to card ID

  const status = useMemo(() => getScheduleStatus(content), [content])
  const badge = useMemo(() => getStatusBadge(status, content), [status, content])

  // Use stable card ID and content references
  const handlePublishAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Use spread on content from props to ensure we're updating the right card's content
    const currentContent = card.content as Record<string, unknown>
    onUpdate({
      ...currentContent,
      publishAt: value ? parseInputToIso(value) : undefined,
    })
  }

  const handleExpireAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const currentContent = card.content as Record<string, unknown>
    onUpdate({
      ...currentContent,
      expireAt: value ? parseInputToIso(value) : undefined,
    })
  }

  const clearPublishAt = () => {
    const currentContent = card.content as Record<string, unknown>
    onUpdate({
      ...currentContent,
      publishAt: undefined,
    })
  }

  const clearExpireAt = () => {
    const currentContent = card.content as Record<string, unknown>
    onUpdate({
      ...currentContent,
      expireAt: undefined,
    })
  }

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-card">
      {/* Card header with title and status badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{card.title || "Untitled"}</p>
          <p className="text-sm text-muted-foreground capitalize">
            {card.card_type.replace("-", " ")}
          </p>
        </div>
        {badge ? (
          <Badge variant={badge.variant} className={cn("shrink-0", badge.className)}>
            {badge.text}
          </Badge>
        ) : (
          <Badge variant="outline" className="shrink-0 text-muted-foreground">
            Always visible
          </Badge>
        )}
      </div>

      {/* Datetime inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Publish at */}
        <div className="space-y-2">
          <Label htmlFor={`publish-${card.id}`} className="text-sm flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Publish at
          </Label>
          <div className="flex gap-1">
            <Input
              id={`publish-${card.id}`}
              type="datetime-local"
              value={formatForInput(publishAt)}
              onChange={handlePublishAtChange}
              className="flex-1"
            />
            {publishAt && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={clearPublishAt}
                title="Clear publish date"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Expire at */}
        <div className="space-y-2">
          <Label htmlFor={`expire-${card.id}`} className="text-sm flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Expires at
          </Label>
          <div className="flex gap-1">
            <Input
              id={`expire-${card.id}`}
              type="datetime-local"
              value={formatForInput(expireAt)}
              onChange={handleExpireAtChange}
              className="flex-1"
            />
            {expireAt && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={clearExpireAt}
                title="Clear expiry date"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
