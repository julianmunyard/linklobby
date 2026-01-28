'use client'

import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/theme-store'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

export function GlassCard({ children, className }: GlassCardProps) {
  const { style } = useThemeStore()

  return (
    <div
      className={cn(
        "overflow-hidden glass-card",
        "bg-theme-card-bg border border-theme-border",
        className
      )}
      style={{
        borderRadius: 'var(--theme-border-radius)',
        backdropFilter: `blur(${style.blurIntensity}px)`,
        WebkitBackdropFilter: `blur(${style.blurIntensity}px)`,
      }}
    >
      {children}
    </div>
  )
}
