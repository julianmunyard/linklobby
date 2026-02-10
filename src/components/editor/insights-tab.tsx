"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Separator } from "@/components/ui/separator"
import { MetricCard } from "@/components/analytics/metric-card"
import { InsightsChart } from "@/components/analytics/insights-chart"
import { CardStatsTable } from "@/components/analytics/card-stats-table"
import { PixelConfig } from "@/components/analytics/pixel-config"
import { Users, Eye, Loader2, TrendingUp, Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface AnalyticsStats {
  uniqueVisitors: number
  totalViews: number
  cardStats: Array<{
    id: string
    title: string
    cardType: string
    clicks: number
    ctr: number
    gamePlays?: number
    galleryViews?: number
  }>
  timeSeries: Array<{
    date: string
    views: number
    visitors: number
  }>
}

interface PageInfo {
  id: string
  username: string
}

export function InsightsTab() {
  const [days, setDays] = useState<string>("7")
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Fetch page info and stats
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch page info first
        const pageResponse = await fetch("/api/page")
        if (!pageResponse.ok) {
          throw new Error("Failed to fetch page")
        }
        const page = await pageResponse.json()

        // Fetch profile for username
        const profileResponse = await fetch("/api/profile")
        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile")
        }
        const profile = await profileResponse.json()

        setPageInfo({
          id: page.id,
          username: profile.username,
        })

        // Fetch analytics stats
        const statsResponse = await fetch(
          `/api/analytics/stats?pageId=${page.id}&days=${days}`
        )
        if (!statsResponse.ok) {
          throw new Error("Failed to fetch analytics")
        }
        const analyticsData = await statsResponse.json()

        setStats(analyticsData)
      } catch (err) {
        console.error("Error fetching analytics:", err)
        setError(err instanceof Error ? err.message : "Failed to load analytics")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [days])

  const handleCopyUrl = async () => {
    if (!pageInfo) return

    const pageUrl = `${window.location.origin}/${pageInfo.username}`
    await navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    toast.success("Page URL copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRetry = () => {
    setDays("7") // Reset to default and trigger refetch
  }

  // Loading state
  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-4">
        <TrendingUp className="h-12 w-12 text-muted-foreground" />
        <div>
          <h3 className="font-semibold mb-2">Failed to load analytics</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRetry} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Empty state (no analytics data)
  const hasNoData = stats && stats.uniqueVisitors === 0 && stats.totalViews === 0

  if (hasNoData) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-4 pb-20">
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-4">
            <div className="rounded-full bg-muted p-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="font-semibold text-lg">No analytics yet</h3>
              <p className="text-sm text-muted-foreground">
                Share your page to start seeing analytics. As visitors view your page and interact with your cards, you'll see the data here.
              </p>
              {pageInfo && (
                <div className="pt-4">
                  <Button
                    onClick={handleCopyUrl}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Page URL
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    linklobby.com/{pageInfo.username}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 pb-20 space-y-6">
        {/* Time Period Filter */}
        <div className="flex justify-end">
          <ToggleGroup
            type="single"
            value={days}
            onValueChange={(value) => value && setDays(value)}
            variant="outline"
            spacing={0}
          >
            <ToggleGroupItem value="7" aria-label="7 days">
              7 Days
            </ToggleGroupItem>
            <ToggleGroupItem value="30" aria-label="30 days">
              30 Days
            </ToggleGroupItem>
            <ToggleGroupItem value="0" aria-label="All time">
              All Time
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Hero Metrics */}
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard
            label="Unique Visitors"
            value={stats?.uniqueVisitors}
            description="Total unique visitors to your page"
            icon={<Users className="h-5 w-5" />}
          />
          <MetricCard
            label="Total Page Views"
            value={stats?.totalViews}
            description="Total number of page views"
            icon={<Eye className="h-5 w-5" />}
          />
        </div>

        {/* Time-Series Chart */}
        <div>
          <h3 className="text-sm font-medium mb-3">Visitors & Views Over Time</h3>
          <InsightsChart
            data={stats?.timeSeries || []}
            isLoading={isLoading}
          />
        </div>

        {/* Card Leaderboard */}
        <div>
          <h3 className="text-sm font-medium mb-3">Top Performing Cards</h3>
          <CardStatsTable
            cards={stats?.cardStats || []}
            isLoading={isLoading}
          />
        </div>

        {/* Separator */}
        <Separator className="my-6" />

        {/* Pixel Configuration */}
        {pageInfo && <PixelConfig pageId={pageInfo.id} />}
      </div>
    </div>
  )
}
