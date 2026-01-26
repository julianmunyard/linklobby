"use client"

import Image from "next/image"
import { User } from "lucide-react"
import { useProfileStore } from "@/stores/profile-store"
import { PLATFORM_ICONS } from "@/components/editor/social-icon-picker"
import { cn } from "@/lib/utils"

/**
 * Profile header component for the preview iframe.
 * Renders avatar, title, logo, bio, and social icons based on profile store state.
 * Supports Classic (centered circle) and Hero (banner) layouts.
 */
export function ProfileHeader() {
  const displayName = useProfileStore((state) => state.displayName)
  const bio = useProfileStore((state) => state.bio)
  const avatarUrl = useProfileStore((state) => state.avatarUrl)
  const showAvatar = useProfileStore((state) => state.showAvatar)
  const showTitle = useProfileStore((state) => state.showTitle)
  const titleSize = useProfileStore((state) => state.titleSize)
  const showLogo = useProfileStore((state) => state.showLogo)
  const logoUrl = useProfileStore((state) => state.logoUrl)
  const logoScale = useProfileStore((state) => state.logoScale)
  const profileLayout = useProfileStore((state) => state.profileLayout)
  const showSocialIcons = useProfileStore((state) => state.showSocialIcons)
  const getSortedSocialIcons = useProfileStore((state) => state.getSortedSocialIcons)

  const socialIcons = getSortedSocialIcons()

  // Render social icons row (shared between layouts)
  const renderSocialIcons = () => {
    if (!showSocialIcons || socialIcons.length === 0) return null

    return (
      <div className="flex gap-3 justify-center">
        {socialIcons.map((icon) => {
          const Icon = PLATFORM_ICONS[icon.platform]
          return (
            <a
              key={icon.id}
              href={icon.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon className="w-5 h-5" />
            </a>
          )
        })}
      </div>
    )
  }

  // Render logo
  const renderLogo = () => {
    if (!showLogo || !logoUrl) return null

    // Scale logo based on logoScale (50-300%)
    const scaledWidth = Math.round(192 * (logoScale / 100))
    const scaledHeight = Math.round(48 * (logoScale / 100))

    return (
      <div
        className="relative max-w-full"
        style={{ width: scaledWidth, height: scaledHeight }}
      >
        {/* Use img instead of Image to avoid Next.js optimization issues with transparent PNGs */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
    )
  }

  // Render title text
  const renderTitle = () => {
    if (!showTitle || !displayName) return null

    return (
      <h1
        className={cn(
          "font-bold text-center",
          titleSize === "large" ? "text-2xl" : "text-lg"
        )}
      >
        {displayName}
      </h1>
    )
  }

  // Render bio
  const renderBio = () => {
    if (!bio) return null

    return (
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {bio}
      </p>
    )
  }

  // Classic layout: centered circle avatar, title below, social icons row
  if (profileLayout === "classic") {
    return (
      <div className="flex flex-col items-center gap-4 p-6 transition-opacity duration-200">
        {/* Avatar - small circle (only if showAvatar is true) */}
        {showAvatar && (
          <div className="relative w-20 h-20 rounded-full bg-muted overflow-hidden">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
          </div>
        )}

        {/* Logo */}
        {renderLogo()}

        {/* Title */}
        {renderTitle()}

        {/* Bio */}
        {renderBio()}

        {/* Social Icons */}
        {renderSocialIcons()}
      </div>
    )
  }

  // Hero layout: larger banner-style avatar, title + icons below
  return (
    <div className="transition-opacity duration-200">
      {/* Avatar - larger, banner-style (only if showAvatar is true) */}
      {showAvatar && (
        <div className="relative w-full aspect-[3/1] bg-muted overflow-hidden">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-20 h-20 text-muted-foreground" />
            </div>
          )}
        </div>
      )}

      {/* Logo, Title, Bio, Social below banner */}
      <div className="flex flex-col items-center gap-4 p-4">
        {renderLogo()}
        {renderTitle()}
        {renderBio()}
        {renderSocialIcons()}
      </div>
    </div>
  )
}
