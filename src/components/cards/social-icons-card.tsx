// src/components/cards/social-icons-card.tsx
"use client"

import { useProfileStore } from "@/stores/profile-store"
import { PLATFORM_ICONS } from "@/components/editor/social-icon-picker"
import type { Card } from "@/types/card"

interface SocialIconsCardProps {
  card: Card
  isPreview?: boolean
}

export function SocialIconsCard({ isPreview = false }: SocialIconsCardProps) {
  const getSortedSocialIcons = useProfileStore((state) => state.getSortedSocialIcons)
  const showSocialIcons = useProfileStore((state) => state.showSocialIcons)

  const socialIcons = getSortedSocialIcons()

  // If social icons are hidden or empty, show placeholder in editor
  if (!showSocialIcons || socialIcons.length === 0) {
    if (isPreview) return null
    return (
      <div className="w-full p-4 rounded-lg border border-dashed bg-muted/50 text-center">
        <p className="text-sm text-muted-foreground">
          Social Icons
        </p>
        <p className="text-xs text-muted-foreground">
          {!showSocialIcons ? "Hidden (enable in Header settings)" : "Add icons in Header settings"}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full flex gap-4 justify-center py-2">
      {socialIcons.map((icon) => {
        const Icon = PLATFORM_ICONS[icon.platform]
        return (
          <a
            key={icon.id}
            href={isPreview ? icon.url : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="text-theme-text/70 hover:text-theme-link transition-colors"
            onClick={isPreview ? undefined : (e) => e.preventDefault()}
          >
            <Icon className="w-6 h-6" />
          </a>
        )
      })}
    </div>
  )
}
