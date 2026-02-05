'use client'

import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/theme-store'

export function MacOSTrafficLights({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e14942]" />
      <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#dea123]" />
      <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1dad2b]" />
    </div>
  )
}

interface MacOSCardProps {
  children: React.ReactNode
  className?: string
  transparentBackground?: boolean
}

export function MacOSCard({ children, className, transparentBackground = false }: MacOSCardProps) {
  const titleBarLineColor = useThemeStore((state) => state.colors.titleBarLine) || '#000000'

  return (
    <div
      className={cn(
        "overflow-hidden",
        !transparentBackground && "bg-theme-card-bg",
        "border border-theme-border",
        "shadow-theme-card",
        className
      )}
      style={{ borderRadius: 'var(--theme-border-radius)' }}
    >
      {/* Title bar with traffic lights */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2",
          !transparentBackground && "bg-gradient-to-b from-white/5 to-transparent"
        )}
        style={{ borderBottom: `1px solid ${titleBarLineColor}` }}
      >
        <MacOSTrafficLights />
      </div>
      {/* Content - with rounded bottom corners to match container */}
      <div className="overflow-hidden" style={{ borderRadius: '0 0 calc(var(--theme-border-radius) - 1px) calc(var(--theme-border-radius) - 1px)' }}>
        {children}
      </div>
    </div>
  )
}
