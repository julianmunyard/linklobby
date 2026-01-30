'use client'

import { cn } from '@/lib/utils'

interface SystemSettingsCardProps {
  children: React.ReactNode
  className?: string
  title?: string
}

export function SystemSettingsCard({ children, className, title }: SystemSettingsCardProps) {
  return (
    // Outer container with thin 1px border
    <div
      className={cn(
        "overflow-hidden",
        "bg-theme-card-bg",
        "border border-theme-text", // Thin 1px solid border
        className
      )}
      style={{ borderRadius: 'var(--theme-border-radius, 24px)' }}
    >
      {/* System 7 Title Bar */}
      <div className="flex items-center justify-between px-2 py-1.5">
        {/* Close box - left side */}
        <button
          className="w-4 h-4 flex items-center justify-center border border-theme-text/60 hover:bg-theme-text/10 transition-colors"
          style={{ borderRadius: '1px' }}
        >
          <span className="text-[10px] leading-none text-theme-text/80">×</span>
        </button>

        {/* Title - right side */}
        {title && (
          <div
            className="text-xs tracking-wider text-theme-text uppercase"
            style={{ fontFamily: 'var(--font-chikarego), var(--font-pix-chicago), monospace' }}
          >
            {title}
          </div>
        )}
      </div>

      {/* Content area - inner box uses accent color */}
      <div className="p-2">
        <div
          className="bg-theme-accent border border-theme-text/40 overflow-hidden"
          style={{ borderRadius: 'calc(var(--theme-border-radius, 24px) - 8px)' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

// Image frame wrapper for photos inside cards - the multi-layer effect
interface SystemSettingsImageFrameProps {
  children: React.ReactNode
  className?: string
}

export function SystemSettingsImageFrame({ children, className }: SystemSettingsImageFrameProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Simple 1px border frame */}
      <div
        className="border border-theme-text/40 overflow-hidden"
        style={{ borderRadius: '2px' }}
      >
        {children}
      </div>
    </div>
  )
}

// Beveled button for System 7 style
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
        "px-4 py-2",
        "bg-theme-card-bg",
        "border border-theme-text/30",
        "text-theme-text",
        "text-sm",
        "transition-all",
        className
      )}
      style={{
        borderRadius: '4px',
        fontFamily: 'var(--font-chikarego), var(--font-pix-chicago), monospace',
        boxShadow: pressed
          ? 'inset 2px 2px 3px oklch(0 0 0 / 0.2), inset -1px -1px 1px oklch(1 0 0 / 0.3)'
          : 'inset -1px -1px 2px oklch(0 0 0 / 0.1), inset 1px 1px 2px oklch(1 0 0 / 0.7), 1px 1px 2px oklch(0 0 0 / 0.1)'
      }}
      {...props}
    >
      {children}
    </button>
  )
}

// Scrollbar track for authentic Mac look (can be used as visual decoration)
export function SystemSettingsScrollbar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-4 bg-[oklch(0.92_0.02_80)] border-l border-theme-text/20 flex flex-col",
        className
      )}
    >
      {/* Up arrow */}
      <button className="h-4 border-b border-theme-text/20 flex items-center justify-center text-[8px] text-theme-text/60 hover:bg-theme-text/10">
        ▲
      </button>

      {/* Track */}
      <div className="flex-1 relative">
        {/* Thumb */}
        <div
          className="absolute top-2 left-1 right-1 h-8 bg-theme-card-bg border border-theme-text/30"
          style={{
            borderRadius: '2px',
            boxShadow: 'inset -1px -1px 1px oklch(0 0 0 / 0.1), inset 1px 1px 1px oklch(1 0 0 / 0.5)'
          }}
        />
      </div>

      {/* Down arrow */}
      <button className="h-4 border-t border-theme-text/20 flex items-center justify-center text-[8px] text-theme-text/60 hover:bg-theme-text/10">
        ▼
      </button>
    </div>
  )
}
