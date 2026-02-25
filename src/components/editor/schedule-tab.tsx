"use client"

import { useMemo } from "react"
import { Calendar, Clock, CheckCircle } from "lucide-react"
import { usePageStore } from "@/stores/page-store"
import { sortCardsBySortKey } from "@/lib/ordering"
import { getScheduleStatus, isScheduled } from "@/types/card"
import { ScheduleCardItem } from "./schedule-card-item"
import { ProGate } from "@/components/billing/pro-gate"
import type { Card } from "@/types/card"

// Categorize cards by schedule status
function categorizeCards(cards: Card[]) {
  const scheduled: Card[] = []
  const active: Card[] = []
  const expired: Card[] = []

  for (const card of cards) {
    const content = card.content as Record<string, unknown>
    const status = getScheduleStatus(content)

    switch (status) {
      case "scheduled":
        scheduled.push(card)
        break
      case "expired":
        expired.push(card)
        break
      case "active":
      case null:
        active.push(card)
        break
    }
  }

  return { scheduled, active, expired }
}

export function ScheduleTab() {
  const rawCards = usePageStore((state) => state.cards)
  const updateCard = usePageStore((state) => state.updateCard)

  // Sort cards by sortKey
  const cards = useMemo(() => sortCardsBySortKey(rawCards), [rawCards])

  // Categorize cards by schedule status
  const { scheduled, active, expired } = useMemo(
    () => categorizeCards(cards),
    [cards]
  )

  // Check if any cards have scheduling
  const hasScheduledContent = useMemo(
    () => cards.some((card) => isScheduled(card.content as Record<string, unknown>)),
    [cards]
  )

  // Handler to update card content
  const handleUpdateContent = (cardId: string) => (content: Record<string, unknown>) => {
    updateCard(cardId, { content })
  }

  // Empty state
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          No cards yet. Create cards first, then set their schedule here.
        </p>
      </div>
    )
  }

  return (
    <ProGate feature="Link Scheduling">
    <div className="h-full overflow-y-auto">
      <div className="p-4 pb-20 space-y-6">
        {/* Info banner for empty scheduling */}
        {!hasScheduledContent && (
          <div className="p-4 border rounded-lg bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground">
              No scheduled content yet. Set timing on any card below to control when it appears on your public page.
            </p>
          </div>
        )}

        {/* Scheduled section */}
        {scheduled.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Scheduled ({scheduled.length})
            </h3>
            <div className="space-y-3">
              {scheduled.map((card) => (
                <ScheduleCardItem
                  key={card.id}
                  card={card}
                  onUpdate={handleUpdateContent(card.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Active section */}
        {active.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Active ({active.length})
            </h3>
            <div className="space-y-3">
              {active.map((card) => (
                <ScheduleCardItem
                  key={card.id}
                  card={card}
                  onUpdate={handleUpdateContent(card.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Expired section */}
        {expired.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              Expired ({expired.length})
            </h3>
            <div className="space-y-3">
              {expired.map((card) => (
                <ScheduleCardItem
                  key={card.id}
                  card={card}
                  onUpdate={handleUpdateContent(card.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
    </ProGate>
  )
}
