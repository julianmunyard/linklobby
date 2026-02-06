'use client'

import { cn } from '@/lib/utils'
import type { CardType } from '@/types/card'

interface MacintoshCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  cardType?: CardType
  transparentBackground?: boolean
}

// Card types that get slim frames instead of full window chrome
const THIN_CARD_TYPES: CardType[] = ['link', 'horizontal', 'mini']

export function MacintoshCard({
  children,
  className,
  title,
  cardType,
  transparentBackground = false,
}: MacintoshCardProps) {
  // Link, horizontal, mini cards get slim black frame only
  if (cardType && THIN_CARD_TYPES.includes(cardType)) {
    return (
      <div
        className={cn(
          'overflow-hidden',
          !transparentBackground && 'bg-theme-card-bg',
          className
        )}
        style={{
          border: '3px solid var(--theme-text, #000)',
          boxShadow:
            '4px 4px 0px 0px var(--theme-card-bg, #fff), 6px 6px 0px 0px var(--theme-text, #000)',
        }}
      >
        {children}
      </div>
    )
  }

  // Full Mac window chrome for other card types
  return (
    <div
      className={cn(
        'overflow-hidden',
        !transparentBackground && 'bg-theme-card-bg',
        className
      )}
      style={{
        border: '3px solid var(--theme-text, #000)',
        boxShadow:
          '4px 4px 0px 0px var(--theme-card-bg, #fff), 6px 6px 0px 0px var(--theme-text, #000)',
      }}
    >
      {/* Mac title bar with horizontal lines pattern */}
      <MacintoshTitleBar title={title} />

      {/* Content area */}
      <div className={cn(!transparentBackground && 'bg-theme-accent')}>
        {children}
      </div>
    </div>
  )
}

/**
 * Classic Macintosh title bar with horizontal line pattern, close box, and centered title.
 * Matches the authentic 1984 Mac window chrome from reference images.
 */
function MacintoshTitleBar({ title }: { title?: string }) {
  return (
    <div
      className="flex items-center gap-2 px-2 relative"
      style={{
        height: '28px',
        borderBottom: '3px solid var(--theme-text, #000)',
        background: 'var(--theme-card-bg, #fff)',
      }}
    >
      {/* Close box - small square on left */}
      <div
        className="flex-shrink-0 relative z-10"
        style={{
          width: '14px',
          height: '14px',
          border: '2px solid var(--theme-text, #000)',
          background: 'var(--theme-card-bg, #fff)',
        }}
      />

      {/* Horizontal lines pattern - left side */}
      <div
        className="flex-1 h-full"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, var(--theme-text, #000) 0px, var(--theme-text, #000) 2px, var(--theme-card-bg, #fff) 2px, var(--theme-card-bg, #fff) 4px)',
          backgroundPosition: 'center',
        }}
      />

      {/* Title text - centered */}
      {title && (
        <div
          className="flex-shrink-0 px-2 relative z-10 text-theme-text"
          style={{
            fontFamily: 'var(--font-vt323), var(--font-chicago), monospace',
            fontSize: '18px',
            letterSpacing: '2px',
            lineHeight: '1',
            textTransform: 'capitalize',
            background: 'var(--theme-card-bg, #fff)',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
      )}

      {/* Horizontal lines pattern - right side */}
      <div
        className="flex-1 h-full"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, var(--theme-text, #000) 0px, var(--theme-text, #000) 2px, var(--theme-card-bg, #fff) 2px, var(--theme-card-bg, #fff) 4px)',
          backgroundPosition: 'center',
        }}
      />
    </div>
  )
}
