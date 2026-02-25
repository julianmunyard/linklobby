"use client"

import { useMemo } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2, Eye, EyeOff, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { getScheduleStatus } from "@/types/card"
import type { Card } from "@/types/card"
import { usePlanTier } from "@/contexts/plan-tier-context"
import { useThemeStore } from "@/stores/theme-store"
import { PRO_THEMES } from "@/lib/stripe/plans"

// Format date for tooltip display
function formatTooltipDate(isoString: string): string {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

interface SortableCardProps {
  card: Card
  isSelected?: boolean
  onSelect?: (id: string) => void
  onDelete?: (id: string) => void
  onToggleVisibility?: (id: string) => void
}

export function SortableCard({ card, isSelected, onSelect, onDelete, onToggleVisibility }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const { planTier, openUpgradeModal } = usePlanTier()
  const themeId = useThemeStore((state) => state.themeId)
  const showProBadge = planTier === 'free' && (
    card.card_type === 'audio' || PRO_THEMES.includes(themeId)
  )

  // Get schedule status for indicator
  const content = card.content as Record<string, unknown>
  const scheduleStatus = useMemo(() => getScheduleStatus(content), [content])
  const publishAt = content.publishAt as string | undefined
  const expireAt = content.expireAt as string | undefined

  // Build tooltip text
  const scheduleTooltip = useMemo(() => {
    if (!scheduleStatus || scheduleStatus === "active" && !expireAt) return null
    const parts: string[] = []
    if (publishAt) parts.push(`Publish: ${formatTooltipDate(publishAt)}`)
    if (expireAt) parts.push(`Expire: ${formatTooltipDate(expireAt)}`)
    return parts.join("\n")
  }, [scheduleStatus, publishAt, expireAt])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Use fixed minimum height for canvas cards (admin view)
  const minHeight = card.size === 'small' ? 'min-h-20' : 'min-h-24'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex items-stretch gap-3 bg-card border rounded-lg overflow-hidden",
        minHeight,
        isDragging && "opacity-50 shadow-lg z-50",
        isSelected && "ring-2 ring-primary",
        !card.is_visible && "opacity-50"
      )}
      onClick={() => onSelect?.(card.id)}
    >
      {/* Drag handle - touch-action: none for mobile scrolling */}
      <button
        {...attributes}
        {...listeners}
        className={cn(
          "flex items-center justify-center px-2 bg-muted/50",
          "cursor-grab active:cursor-grabbing touch-none",
          "hover:bg-muted focus:bg-muted focus:outline-none"
        )}
        aria-label={`Drag to reorder ${card.title || "card"}`}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Card content area */}
      <div className="flex-1 p-3 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("font-medium truncate", !card.is_visible && "line-through text-muted-foreground")}>
            {card.title || (() => {
              const ms = (card.content as Record<string, unknown>)?.macWindowStyle as string | undefined
              if (ms === 'calculator') return 'Calculator'
              if (ms === 'map') return 'Map'
              return 'Untitled'
            })()}
          </p>
          {/* Schedule indicator */}
          {scheduleStatus && scheduleStatus !== "active" && scheduleTooltip && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="shrink-0">
                    {scheduleStatus === "scheduled" ? (
                      <Clock className="h-4 w-4 text-blue-500" />
                    ) : scheduleStatus === "expired" ? (
                      <AlertTriangle className="h-4 w-4 text-gray-500" />
                    ) : null}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="whitespace-pre-line">
                  {scheduleTooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {/* Expiring soon indicator for active cards */}
          {scheduleStatus === "active" && expireAt && scheduleTooltip && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="shrink-0">
                    <Clock className="h-4 w-4 text-orange-500" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="whitespace-pre-line">
                  {scheduleTooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {/* Pro badge for gated cards/themes */}
          {showProBadge && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                openUpgradeModal(card.card_type === 'audio' ? 'Audio Player' : 'Premium Theme')
              }}
              className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30 hover:bg-amber-400/30 transition-colors cursor-pointer"
              title="Upgrade to Pro"
            >
              Pro
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground capitalize">
          {(() => {
            const macStyle = (card.content as Record<string, unknown>)?.macWindowStyle as string | undefined
            if (macStyle) {
              const labels: Record<string, string> = {
                'notepad': 'Note Pad',
                'small-window': 'Small Window',
                'large-window': 'Large Window',
                'title-link': 'Title Link',
                'map': 'Map',
                'calculator': 'Calculator',
              }
              return labels[macStyle] || macStyle
            }
            return card.card_type.replace("_", " ")
          })()}
        </p>
        {card.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {card.description}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 mr-2">
        {/* Hide toggle button */}
        {onToggleVisibility && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation()
              onToggleVisibility(card.id)
            }}
            title={card.is_visible ? "Hide card" : "Show card"}
          >
            {card.is_visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="sr-only">{card.is_visible ? "Hide card" : "Show card"}</span>
          </Button>
        )}
        {/* Delete button */}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(card.id)
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete card</span>
          </Button>
        )}
      </div>
    </div>
  )
}
