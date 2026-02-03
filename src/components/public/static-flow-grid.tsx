import { cn } from "@/lib/utils"
import { CardRenderer } from "@/components/cards/card-renderer"
import type { Card } from "@/types/card"

interface StaticFlowGridProps {
  cards: Card[]
}

/**
 * StaticFlowGrid - Non-interactive card grid for public pages
 *
 * Key differences from SelectableFlowGrid:
 * - No "use client" directive - can be Server Component
 * - No dnd-kit, no sensors, no drag handlers
 * - No multi-select state
 * - No mounted/hydration guard (not needed without dnd-kit)
 * - Simpler: just map and render
 *
 * Features:
 * - Filters out hidden cards (is_visible = false)
 * - Sorts cards by sortKey
 * - Flow layout: small cards 50% width, big cards 100% width
 */
export function StaticFlowGrid({ cards }: StaticFlowGridProps) {
  // Filter out hidden cards and sort by sortKey
  const visibleCards = cards
    .filter(c => c.is_visible)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))

  // Empty state
  if (visibleCards.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg text-muted-foreground">
        <p>No cards yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-4 min-h-[100px]">
      {visibleCards.map((card) => (
        <div
          key={card.id}
          className={cn(
            "transition-all",
            card.size === "big" ? "w-full" : "w-[calc(50%-0.5rem)]"
          )}
        >
          <CardRenderer card={card} isPreview />
        </div>
      ))}
    </div>
  )
}
