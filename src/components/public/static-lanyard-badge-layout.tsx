'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { Card } from '@/types/card'
import type { SocialIcon } from '@/types/profile'

// Dynamic import for Three.js scene
const LanyardBadgeScene = dynamic(
  () => import('@/components/cards/lanyard-badge-scene').then(mod => ({ default: mod.LanyardBadgeScene })),
  {
    ssr: false,
    loading: () => <LoadingState />,
  }
)

interface StaticLanyardBadgeLayoutProps {
  username: string
  title: string
  cards: Card[]
  headingSize?: number
  bodySize?: number
  socialIcons?: SocialIcon[]
  accentColor?: string
  avatarUrl?: string | null
  showAvatar?: boolean
}

/**
 * Static Lanyard Badge Layout - Public page version
 *
 * Client component that dynamically loads the 3D scene
 * (Three.js requires WebGL and cannot be server-rendered)
 */
export function StaticLanyardBadgeLayout({
  username,
  title,
  cards,
  accentColor = '#e94560',
  avatarUrl,
  showAvatar,
}: StaticLanyardBadgeLayoutProps) {
  // Local state for active view (starts at 0)
  const [activeView, setActiveView] = useState(0)

  const handleViewChange = (view: number) => {
    setActiveView(view)
  }

  const handleCardClick = (cardId: string) => {
    // Find card and open its URL
    const card = cards.find(c => c.id === cardId)
    if (card && (card.content as any)?.url) {
      window.open((card.content as any).url, '_blank')
    }
  }

  return (
    <>
      <div className="fixed inset-0 w-full h-full">
        <LanyardBadgeScene
          cards={cards}
          title={title}
          activeView={activeView}
          onViewChange={handleViewChange}
          avatarUrl={showAvatar ? avatarUrl : null}
          isPreview={false}
          onCardClick={handleCardClick}
          lanyardColor={accentColor}
        />
      </div>

      {/* Legal footer floating over 3D scene */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 py-3 text-center text-xs"
        style={{ color: 'var(--theme-card-bg)', opacity: 0.5 }}
      >
        <div className="flex items-center justify-center gap-4">
          <Link href={`/privacy?username=${username}`}>Privacy Policy</Link>
          <span>-</span>
          <Link href="/terms">Terms of Service</Link>
        </div>
        <div className="mt-1">Powered by LinkLobby</div>
      </div>
    </>
  )
}

/**
 * Loading state shown while Three.js loads
 */
function LoadingState() {
  return (
    <div
      className="w-full h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--theme-background)' }}
    >
      <div className="text-center">
        <div
          className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-3"
          style={{ borderColor: 'var(--theme-text)' }}
        />
        <p className="text-sm opacity-50" style={{ color: 'var(--theme-text)' }}>
          Loading...
        </p>
      </div>
    </div>
  )
}
