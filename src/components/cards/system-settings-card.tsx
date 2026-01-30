'use client'

import { cn } from '@/lib/utils'

interface SystemSettingsCardProps {
  children: React.ReactNode
  className?: string
}

export function SystemSettingsCard({ children, className }: SystemSettingsCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden",
        "bg-theme-card-bg",
        "system7-border",
        className
      )}
      style={{ borderRadius: '4px' }}
    >
      {/* System 7 Title Bar */}
      <div className="flex items-center justify-between px-2 py-1 border-b system7-border bg-theme-accent/20">
        {/* Close box - left side */}
        <div className="w-3 h-3 system7-border bg-theme-card-bg flex items-center justify-center">
          <span className="text-[8px] leading-none font-bold text-theme-text">×</span>
        </div>

        {/* Title - right side (empty placeholder for now) */}
        <div className="text-[10px] font-[var(--font-pix-chicago)] text-theme-text tracking-wide">
          {/* Title goes here if needed */}
        </div>
      </div>

      {/* Content area */}
      <div>
        {children}
      </div>
    </div>
  )
}

// Optional: Beveled button helper for future use
interface SystemSettingsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  pressed?: boolean
}

export function SystemSettingsButton({
  children,
  pressed = false,
  className,
  ...props
}: SystemSettingsButtonProps) {
  return (
    <button
      className={cn(
        "px-3 py-1.5",
        "bg-theme-card-bg",
        "system7-border",
        "text-theme-text",
        "font-[var(--font-pix-chicago)]",
        "text-xs",
        pressed ? "system7-inset-pressed" : "system7-inset",
        "active:system7-inset-pressed",
        "transition-shadow",
        className
      )}
      style={{ borderRadius: '3px' }}
      {...props}
    >
      {children}
    </button>
  )
}
