"use client"

import { useMemo } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { CardRenderer } from "@/components/cards/card-renderer"
import { MobileSelectCheckbox } from "@/components/editor/mobile-select-mode"
import { Badge } from "@/components/ui/badge"
import { getScheduleStatus, type ScheduleStatus, type ReleaseCardContent } from "@/types/card"
import type { Card } from "@/types/card"

// Check if a release card should be hidden (countdown ended + hide action)
function shouldHideReleaseCard(card: Card): boolean {
  if (card.card_type !== 'release') return false
  const content = card.content as ReleaseCardContent
  const releaseDate = content.releaseDate
  const afterCountdownAction = content.afterCountdownAction
  if (!releaseDate || afterCountdownAction !== 'hide') return false
  return new Date(releaseDate) <= new Date()
}

// Format date for badge display using Intl.DateTimeFormat
function formatBadgeDate(isoString: string): string {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

// Get badge info based on schedule status
function getScheduleBadgeInfo(status: ScheduleStatus, content: Record<string, unknown>): { icon: React.ReactNode; text: string; className: string } | null {
  const publishAt = content.publishAt as string | undefined
  const expireAt = content.expireAt as string | undefined

  switch (status) {
    case "scheduled":
      return {
        icon: <Calendar className="h-3 w-3" />,
        text: `Scheduled ${formatBadgeDate(publishAt!)}`,
        className: "bg-blue-500/90 text-white border-blue-600"
      }
    case "expired":
      return {
        icon: <Clock className="h-3 w-3" />,
        text: "Expired",
        className: "bg-gray-500/90 text-white border-gray-600"
      }
    case "active":
      if (expireAt) {
        return {
          icon: <Clock className="h-3 w-3" />,
          text: `Expires ${formatBadgeDate(expireAt)}`,
          className: "bg-orange-500/90 text-white border-orange-600"
        }
      }
      return null
    default:
      return null
  }
}

interface PreviewSortableCardProps {
  card: Card
  isSelected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

// Card types that need full interactivity (touch/mouse events pass through)
const INTERACTIVE_CARD_TYPES = ['gallery', 'video', 'game', 'social-icons']

/**
 * Preview-specific sortable card that intercepts link clicks and calls onClick instead.
 * Used in the preview iframe to enable click-to-select functionality.
 * Shows a white border highlight when selected.
 * Includes data-selectable-id for box selection integration.
 */
export function PreviewSortableCard({ card, isSelected, onClick }: PreviewSortableCardProps) {
  // Check if release card should be hidden (countdown ended + hide action)
  if (shouldHideReleaseCard(card)) {
    return null
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  // Get schedule status and badge info
  const content = card.content as Record<string, unknown>
  const scheduleStatus = useMemo(() => getScheduleStatus(content), [content])
  const scheduleBadge = useMemo(
    () => getScheduleBadgeInfo(scheduleStatus, content),
    [scheduleStatus, content]
  )

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: transition ?? 'transform 200ms ease',
    // Prevent sub-pixel rendering artifacts (white lines)
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
  }

  // Mini cards use w-fit with margin positioning
  // left: normal flow, center: mx-auto (own row), right: ml-auto (pushes to right)
  const isPositionableCard = card.card_type === "mini"

  // Link and horizontal cards are always full width
  const widthClass = isPositionableCard
    ? "w-fit" // Compact width, positioned via margins
    : card.card_type === "link" || card.card_type === "horizontal"
      ? "w-full"
      : card.size !== "small"
        ? "w-full"
        : "w-[calc(50%-0.5rem)]"

  // Position class for mini/text cards using margins
  // - left: no margin (flows to left naturally)
  // - center: mx-auto (centers, takes own row)
  // - right: ml-auto (pushes to right edge of remaining space)
  const positionClass = isPositionableCard
    ? card.position === "right"
      ? "ml-auto"
      : card.position === "center"
        ? "mx-auto"
        : "" // left = normal flow
    : ""

  // Interactive cards (gallery, video, game) need full pointer/touch events
  const isInteractive = INTERACTIVE_CARD_TYPES.includes(card.card_type)

  // Handle click - select the card
  function handleClick(e: React.MouseEvent) {
    // Prevent default link navigation
    e.preventDefault()
    e.stopPropagation()
    onClick?.(e)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-selectable-id={card.id}
      className={cn(
        "relative",
        widthClass,
        isDragging && "opacity-0",
        "cursor-pointer",
        // Positionable cards use margin classes for positioning
        positionClass,
        // Only use touch-none for non-interactive cards (needed for dnd-kit drag)
        // Interactive cards need touch events to pass through for their internal controls
        !isInteractive && "touch-none",
        // Gallery needs overflow visible for full-bleed effect
        card.card_type === 'gallery' && "overflow-visible",
        // Selection highlight - white border with tight ring
        isSelected && "ring-2 ring-white ring-offset-1 ring-offset-background rounded-lg"
      )}
      onClick={handleClick}
      {...(isInteractive ? {} : { ...attributes, ...listeners })}
    >
      {/* Wrapper that intercepts all link clicks for non-interactive cards */}
      {isInteractive ? (
        <div className="relative group/interactive">
          {/* Mobile select checkbox overlay */}
          <MobileSelectCheckbox cardId={card.id} />
          <CardRenderer card={card} isPreview />
          {/* Transparent click overlay for selection - only shows when NOT selected */}
          {/* Skip for gallery cards so Stack can receive pointer events */}
          {!isSelected && card.card_type !== 'gallery' && (
            <div
              className="absolute inset-0 z-[5] cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onClick?.(e)
              }}
            />
          )}
          {/* Control buttons for interactive cards - appear on hover */}
          <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover/interactive:opacity-100 transition-opacity">
            {/* Drag handle */}
            <div
              {...attributes}
              {...listeners}
              className="bg-black/70 hover:bg-black/90 text-white rounded-full p-2 cursor-grab active:cursor-grabbing touch-none"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            {/* Edit button */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClick?.(e)
              }}
              className="bg-black/70 hover:bg-black/90 text-white rounded-full p-2"
              aria-label="Edit card"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative pointer-events-none">
          {/* Mobile select checkbox overlay */}
          <MobileSelectCheckbox cardId={card.id} />
          <div className="pointer-events-auto [&_a]:pointer-events-none">
            <CardRenderer card={card} isPreview />
          </div>
        </div>
      )}

      {/* Schedule badge - only shown in editor mode (this component is editor-only) */}
      {scheduleBadge && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20">
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1 text-xs px-2 py-0.5 shadow-sm",
              scheduleBadge.className
            )}
          >
            {scheduleBadge.icon}
            <span>{scheduleBadge.text}</span>
          </Badge>
        </div>
      )}
    </div>
  )
}
