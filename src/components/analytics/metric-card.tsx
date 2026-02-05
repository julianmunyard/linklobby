"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface MetricCardProps {
  label: string
  value?: number | string
  description?: string
  icon?: React.ReactNode
}

export function MetricCard({ label, value, description, icon }: MetricCardProps) {
  const isLoading = value === undefined

  return (
    <Card className="relative">
      <CardContent className="pt-6">
        {icon && (
          <div className="absolute right-6 top-6 text-muted-foreground">
            {icon}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>

          {isLoading ? (
            <Skeleton className="h-10 w-24" />
          ) : (
            <p className="text-3xl font-bold tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          )}

          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
