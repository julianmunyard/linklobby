'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { Card } from '@/types/card'
import { useThemeStore } from '@/stores/theme-store'
import { useProfileStore } from '@/stores/profile-store'

// Dynamic import for Three.js scene to avoid SSR issues
const LanyardBadgeScene = dynamic(
  () => import('./lanyard-badge-scene').then(mod => ({ default: mod.LanyardBadgeScene })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-pulse text-sm opacity-50">Loading 3D scene...</div>
      </div>
    ),
  }
)

interface LanyardBadgeLayoutProps {
  title: string
  cards: Card[]
  isPreview?: boolean
  onCardClick?: (cardId: string) => void
  selectedCardId?: string | null
}

/**
 * Lanyard Badge Layout - Renders a 3D physics-based badge on a lanyard
 *
 * Features:
 * - Physics-based lanyard with draggable badge card
 * - Swipeable card views (links, video, photo, audio, presave)
 * - Receipt-paper styled card face
 * - Conference badge aesthetic
 */
export function LanyardBadgeLayout({
  title,
  cards,
  isPreview = false,
  onCardClick,
}: LanyardBadgeLayoutProps) {
  // Theme store
  const lanyardActiveView = useThemeStore((s) => s.lanyardActiveView)
  const setLanyardActiveView = useThemeStore((s) => s.setLanyardActiveView)
  const accentColor = useThemeStore((s) => s.colors.accent)

  // Profile store
  const avatarUrl = useProfileStore((s) => s.avatarUrl)
  const showAvatar = useProfileStore((s) => s.showAvatar)

  // Local state synced with store
  const [activeView, setActiveView] = useState(lanyardActiveView)

  // Sync local state with store
  useEffect(() => {
    setActiveView(lanyardActiveView)
  }, [lanyardActiveView])

  const handleViewChange = (view: number) => {
    setActiveView(view)
    setLanyardActiveView(view)

    // Notify parent editor via postMessage if in preview
    if (isPreview && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'UPDATE_LANYARD_VIEW',
          payload: { view },
        },
        '*'
      )
    }
  }

  return (
    <div className="fixed inset-0 w-full h-full z-10">
      <LanyardBadgeScene
        cards={cards}
        title={title}
        activeView={activeView}
        onViewChange={handleViewChange}
        avatarUrl={showAvatar ? avatarUrl : null}
        isPreview={isPreview}
        onCardClick={onCardClick}
        lanyardColor={accentColor}
      />
    </div>
  )
}
