"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CardStat {
  id: string
  title: string
  cardType: string
  clicks: number
  ctr: number
  gamePlays?: number
  galleryViews?: number
}

interface CardStatsTableProps {
  cards: CardStat[]
  isLoading: boolean
}

export function CardStatsTable({ cards, isLoading }: CardStatsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-8" />
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (cards.length === 0 || cards.every(c => c.clicks === 0)) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-muted-foreground">No clicks recorded yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Filter out cards with no clicks
  const cardsWithClicks = cards.filter(c => c.clicks > 0)

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {cardsWithClicks.map((card, index) => {
            const rank = index + 1
            const isTopThree = rank <= 3

            // Determine border color for top 3
            const borderColor =
              rank === 1 ? 'border-l-yellow-500' :
              rank === 2 ? 'border-l-gray-400' :
              rank === 3 ? 'border-l-orange-600' :
              'border-l-transparent'

            return (
              <div
                key={card.id}
                className={cn(
                  "flex items-center gap-4 rounded-lg border-l-4 bg-muted/30 p-3 transition-colors",
                  borderColor,
                  isTopThree && "bg-muted/50"
                )}
              >
                {/* Rank */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  <span className={cn(
                    "text-sm font-semibold",
                    isTopThree ? "text-foreground" : "text-muted-foreground"
                  )}>
                    #{rank}
                  </span>
                </div>

                {/* Card Info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{card.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {card.cardType.replace('_', ' ')}
                    </Badge>
                    {card.gamePlays !== undefined && card.gamePlays > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {card.gamePlays} plays
                      </span>
                    )}
                    {card.galleryViews !== undefined && card.galleryViews > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {card.galleryViews} views
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold">{card.clicks.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">clicks</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{card.ctr}%</p>
                    <p className="text-xs text-muted-foreground">CTR</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
