// src/components/cards/social-icons-card.tsx
"use client"

import { useProfileStore } from "@/stores/profile-store"
import { useThemeStore } from "@/stores/theme-store"
import { PLATFORM_ICONS } from "@/components/editor/social-icon-picker"
import type { Card } from "@/types/card"

interface SocialIconsCardProps {
  card: Card
  isPreview?: boolean
}

export function SocialIconsCard({ isPreview = false }: SocialIconsCardProps) {
  const getSortedSocialIcons = useProfileStore((state) => state.getSortedSocialIcons)
  const showSocialIcons = useProfileStore((state) => state.showSocialIcons)
  const socialIconSize = useThemeStore((state) => state.socialIconSize)
  const themeTextColor = useThemeStore((state) => state.colors.text)
  const headerTextColor = useProfileStore((state) => state.headerTextColor)
  const socialIconColor = useProfileStore((state) => state.socialIconColor)

  const socialIcons = getSortedSocialIcons()

  // If social icons are hidden or empty, show placeholder in editor only
  if (!showSocialIcons || socialIcons.length === 0) {
    // On public page (not preview), hide completely
    if (!isPreview) return null
    // In editor preview, show placeholder
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

  // Priority: socialIconColor > headerTextColor > themeTextColor
  const iconColor = socialIconColor || headerTextColor || themeTextColor

  return (
    <div className="w-full flex flex-wrap gap-4 justify-center py-2">
      {socialIcons.map((icon) => {
        const Icon = PLATFORM_ICONS[icon.platform]
        const iconContent = (
          <div style={{ width: socialIconSize, height: socialIconSize }}>
            <Icon className="w-full h-full" />
          </div>
        )

        if (!icon.url) {
          return (
            <span
              key={icon.id}
              className="inline-block"
              style={{ color: iconColor }}
            >
              {iconContent}
            </span>
          )
        }

        return (
          <a
            key={icon.id}
            href={isPreview ? icon.url : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 transition-opacity inline-block"
            style={{ color: iconColor }}
            onClick={isPreview ? undefined : (e) => e.preventDefault()}
          >
            {iconContent}
          </a>
        )
      })}
    </div>
  )
}
