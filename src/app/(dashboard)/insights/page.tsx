import { BarChart3 } from "lucide-react"

export default function InsightsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-muted p-6">
        <BarChart3 className="h-12 w-12 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="font-semibold text-2xl">Insights</h1>
        <p className="text-muted-foreground text-sm max-w-[320px]">
          Track your page views, link clicks, and engagement metrics once your page is live.
        </p>
        <p className="text-muted-foreground text-xs">
          Analytics coming in Phase 10.
        </p>
      </div>
    </div>
  )
}
