"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { Card, DropdownCardContent } from "@/types/card"
import { isDropdownContent } from "@/types/card"

interface DropdownCardProps {
  card: Card
  isPreview?: boolean
  children?: React.ReactNode  // Child cards rendered by parent
}

export function DropdownCard({ card, isPreview = false, children }: DropdownCardProps) {
  // Start collapsed as per CONTEXT.md
  const [isOpen, setIsOpen] = useState(false)

  const content = isDropdownContent(card.content)
    ? card.content
    : { childCardIds: [] } as DropdownCardContent

  const childCount = content.childCardIds?.length ?? 0
  const headerText = content.headerText || card.title || "Dropdown"
  const expandText = content.expandText || "Show more"
  const collapseText = content.collapseText || "Show less"

  return (
    <div className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-lg",
              "bg-card border hover:bg-accent/50 transition-colors",
              "text-left cursor-pointer"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{headerText}</span>
              {childCount > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {childCount} {childCount === 1 ? "item" : "items"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs">
                {isOpen ? collapseText : expandText}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="dropdown-content overflow-hidden">
          <div className="pt-2 pl-4 space-y-2">
            {children}
            {!children && childCount === 0 && (
              <p className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
                Drag cards here or add from editor
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
