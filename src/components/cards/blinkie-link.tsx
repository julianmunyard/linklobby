// src/components/cards/blinkie-link.tsx
'use client'

import type { Card, LinkCardContent } from '@/types/card'
import { cn } from '@/lib/utils'

interface BlinkieLinkProps {
  card: Card
  isPreview?: boolean
}

// 10 Blinky animation styles with metadata
export const BLINKIE_STYLES = {
  'classic-pink': { name: 'Classic Pink', className: 'blinkie-classic-pink' },
  'rainbow': { name: 'Rainbow', className: 'blinkie-rainbow' },
  'starry': { name: 'Starry', className: 'blinkie-starry' },
  'neon': { name: 'Neon', className: 'blinkie-neon' },
  'hearts': { name: 'Hearts', className: 'blinkie-hearts' },
  'pastel': { name: 'Pastel', className: 'blinkie-pastel' },
  'matrix': { name: 'Matrix', className: 'blinkie-matrix' },
  'glitter': { name: 'Glitter', className: 'blinkie-glitter' },
  'flame': { name: 'Flame', className: 'blinkie-flame' },
  'ocean': { name: 'Ocean', className: 'blinkie-ocean' },
} as const

export type BlinkieStyleId = keyof typeof BLINKIE_STYLES

export function BlinkieLink({ card, isPreview = false }: BlinkieLinkProps) {
  const content = card.content as LinkCardContent
  const blinkieStyle = content.blinkieStyle || 'classic-pink'
  const styleConfig = BLINKIE_STYLES[blinkieStyle as BlinkieStyleId] || BLINKIE_STYLES['classic-pink']

  const Wrapper = card.url && !isPreview ? 'a' : 'div'
  const wrapperProps = card.url && !isPreview
    ? { href: card.url, target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        'blinkie-badge',
        styleConfig.className
      )}
    >
      <div className="blinkie-text">
        <div>{card.title || 'Untitled'}</div>
        {card.description && (
          <div style={{ fontSize: '9px', opacity: 0.8, marginTop: '2px' }}>
            {card.description}
          </div>
        )}
      </div>
    </Wrapper>
  )
}
