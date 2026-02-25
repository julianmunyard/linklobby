'use client'

interface StorageUsageBarProps {
  usedBytes: number
  quotaBytes: number
}

export function StorageUsageBar({ usedBytes, quotaBytes }: StorageUsageBarProps) {
  const usedMB = Math.round(usedBytes / (1024 * 1024))
  const quotaMB = Math.round(quotaBytes / (1024 * 1024))
  const percentage = Math.min(100, Math.round((usedBytes / quotaBytes) * 100))

  // Color: green < 50%, yellow 50-80%, red > 80%
  const barColor =
    percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Storage used</span>
        <span className="font-medium">
          {usedMB} MB / {quotaMB} MB
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {percentage > 80 && (
        <p className="text-xs text-red-500">
          You&apos;re running low on storage. Consider deleting unused audio files.
        </p>
      )}
    </div>
  )
}
