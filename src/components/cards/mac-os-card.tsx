'use client'

import { cn } from '@/lib/utils'

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
}

export function MacOSCard({ children, className }: MacOSCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden",
        "bg-theme-card-bg border border-theme-border",
        "shadow-theme-card",
        className
      )}
      style={{ borderRadius: 'var(--theme-border-radius)' }}
    >
      {/* Title bar with traffic lights */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-b from-white/5 to-transparent border-b border-white/10">
        <MacOSTrafficLights />
      </div>
      {/* Content */}
      <div>
        {children}
      </div>
    </div>
  )
}
