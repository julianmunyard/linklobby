"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProfileStore } from "@/stores/profile-store"
import { PLATFORM_ICONS } from "./social-icon-picker"
import { SOCIAL_PLATFORMS, type SocialIcon } from "@/types/profile"

interface SortableSocialIconProps {
  icon: SocialIcon
  onRemove: (id: string) => void
}

/**
 * Individual sortable social icon with remove button
 */
function SortableSocialIcon({ icon, onRemove }: SortableSocialIconProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: icon.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const Icon = PLATFORM_ICONS[icon.platform]
  const meta = SOCIAL_PLATFORMS[icon.platform]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative flex items-center justify-center
        size-10 rounded-lg border bg-background
        cursor-grab active:cursor-grabbing
        transition-all
        ${isDragging ? "scale-105 shadow-lg z-50 opacity-90" : "hover:bg-accent"}
      `}
      {...attributes}
      {...listeners}
    >
      <Icon className="size-5" />
      <span className="sr-only">{meta.label}</span>

      {/* Remove button - visible on hover */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove(icon.id)
        }}
        className={`
          absolute -top-1.5 -right-1.5
          size-5 rounded-full
          bg-destructive text-destructive-foreground
          flex items-center justify-center
          opacity-0 group-hover:opacity-100
          transition-opacity
          hover:bg-destructive/90
        `}
        aria-label={`Remove ${meta.label}`}
      >
        <X className="size-3" />
      </button>
    </div>
  )
}

/**
 * Sortable horizontal list of social icons
 * Uses dnd-kit with horizontalListSortingStrategy
 */
export function SocialIconsEditor() {
  const [mounted, setMounted] = useState(false)

  const socialIcons = useProfileStore((state) => state.socialIcons)
  const getSortedSocialIcons = useProfileStore((state) => state.getSortedSocialIcons)
  const reorderSocialIcons = useProfileStore((state) => state.reorderSocialIcons)
  const removeSocialIcon = useProfileStore((state) => state.removeSocialIcon)

  // Hydration guard: dnd-kit generates different IDs on server vs client
  useEffect(() => {
    setMounted(true)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4, // Smaller distance for icons
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Long press before drag starts
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const sortedIcons = getSortedSocialIcons()
      const oldIndex = sortedIcons.findIndex((i) => i.id === active.id)
      const newIndex = sortedIcons.findIndex((i) => i.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderSocialIcons(oldIndex, newIndex)
      }
    }
  }

  function handleRemove(id: string) {
    removeSocialIcon(id)
  }

  // Show loading placeholder during SSR
  if (!mounted) {
    return (
      <div className="flex gap-2">
        {socialIcons.map((icon) => (
          <div
            key={icon.id}
            className="size-10 bg-muted rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  // Get sorted icons for display
  const sortedIcons = getSortedSocialIcons()

  // Empty state
  if (sortedIcons.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No social icons added yet
      </p>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedIcons.map((i) => i.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex gap-2 flex-wrap">
          {sortedIcons.map((icon) => (
            <SortableSocialIcon
              key={icon.id}
              icon={icon}
              onRemove={handleRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
