import { cn } from "@/lib/utils"
import { CardRenderer } from "@/components/cards/card-renderer"
import { StaticSocialIconsInline } from "./static-social-icons-inline"
import type { Card } from "@/types/card"

interface StaticFlowGridProps {
  cards: Card[]
  // Social icons data for inline rendering at card position
  socialIconsJson?: string | null
  socialIconSize?: number
  socialIconColor?: string | null
  headerTextColor?: string | null
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
 * - Relies on database sort order (cards pre-sorted by sort_key)
 * - Flow layout: small cards 50% width, big cards 100% width
 */
export function StaticFlowGrid({ cards, socialIconsJson, socialIconSize, socialIconColor, headerTextColor }: StaticFlowGridProps) {
  // Filter out hidden cards
  // NOTE: Cards are already sorted by sort_key from the database query
  // We don't re-sort here because the DB ordering matches fractional-indexing expectations
  const visibleCards = cards.filter(c => c.is_visible)

  // Empty state
  if (visibleCards.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg text-muted-foreground">
        <p>No cards yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-4 min-h-[100px] w-full">
      {visibleCards.map((card) => {
        // Mini cards use w-fit with margin positioning
        const isPositionableCard = card.card_type === "mini"

        // Width class: mini = w-fit, link/horizontal = full, else size-based
        const widthClass = isPositionableCard
          ? "w-fit"
          : card.card_type === "link" || card.card_type === "horizontal"
            ? "w-full"
            : card.size !== "small"
              ? "w-full"
              : "w-[calc(50%-0.5rem)]"

        // Position class for mini cards using margins
        const positionClass = isPositionableCard
          ? card.position === "right"
            ? "ml-auto"
            : card.position === "center"
              ? "mx-auto"
              : ""
          : ""

        // Social-icons card: render static version with actual data
        if (card.card_type === 'social-icons' && socialIconsJson) {
          return (
            <div key={card.id} data-card-id={card.id} className="w-full">
              <StaticSocialIconsInline
                socialIconsJson={socialIconsJson}
                socialIconSize={socialIconSize}
                socialIconColor={socialIconColor}
                headerTextColor={headerTextColor}
              />
            </div>
          )
        }

        return (
          <div
            key={card.id}
            data-card-id={card.id}
            className={cn(
              "transition-all",
              widthClass,
              positionClass,
              // Gallery needs overflow visible for full-bleed effect
              card.card_type === 'gallery' && "overflow-visible"
            )}
          >
            <CardRenderer card={card} />
          </div>
        )
      })}
    </div>
  )
}
