"use client"

import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Card, DropdownCardContent } from "@/types/card"
import { isDropdownContent } from "@/types/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface DropdownCardProps {
  card: Card
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isPreview?: boolean
  children?: React.ReactNode  // Child cards rendered by parent
}

export function DropdownCard({ card, isOpen, onOpenChange, isPreview = false, children }: DropdownCardProps) {
  const content = isDropdownContent(card.content)
    ? card.content
    : { childCardIds: [] } as DropdownCardContent

  const childCount = content.childCardIds?.length ?? 0
  const headerText = content.headerText || card.title || "Dropdown"

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <div className="w-full">
        {/* Header with trigger - NO stopPropagation */}
        <div className="flex items-center">
          <CollapsibleTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              className={cn(
                "flex-1 flex items-center justify-between px-4 py-3 rounded-lg",
                "bg-card/50 border border-border/50 hover:bg-accent/30 transition-colors",
                "cursor-pointer"
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onOpenChange(!isOpen)
                }
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{headerText}</span>
                {childCount > 0 && (
                  <span className="text-[10px] text-muted-foreground/70">
                    {childCount}
                  </span>
                )}
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground/70 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </CollapsibleTrigger>
          {/* Drag handle will be added by parent (DropdownSortable) */}
        </div>

        <CollapsibleContent className="dropdown-content overflow-hidden">
          <div className="pt-2 pl-3 space-y-2">
            {children}
            {!children && childCount === 0 && (
              <p className="text-xs text-muted-foreground/60 py-2 text-center">
                Add cards from editor
              </p>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
