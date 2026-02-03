import { StaticProfileHeader } from "./static-profile-header"
import { StaticFlowGrid } from "./static-flow-grid"
import type { Card } from "@/types/card"

interface PublicPageRendererProps {
  // Profile data
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  avatarFeather: number
  showAvatar: boolean
  showTitle: boolean
  titleSize: "small" | "large"
  showLogo: boolean
  logoUrl: string | null
  logoScale: number
  profileLayout: "classic" | "hero"
  headerTextColor: string | null
  showSocialIcons: boolean
  socialIconsJson?: string | null
  // Theme fonts
  fuzzyEnabled?: boolean
  fuzzyIntensity?: number
  fuzzySpeed?: number
  // Cards
  cards: Card[]
}

/**
 * PublicPageRenderer - Composes the complete public page
 *
 * Features:
 * - Server-rendered (no "use client")
 * - Composes StaticProfileHeader + StaticFlowGrid
 * - Uses max-w-2xl container (same as editor preview width)
 * - No client-side interactivity
 */
export function PublicPageRenderer({
  displayName,
  bio,
  avatarUrl,
  avatarFeather,
  showAvatar,
  showTitle,
  titleSize,
  showLogo,
  logoUrl,
  logoScale,
  profileLayout,
  headerTextColor,
  showSocialIcons,
  socialIconsJson,
  fuzzyEnabled,
  fuzzyIntensity,
  fuzzySpeed,
  cards,
}: PublicPageRendererProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <StaticProfileHeader
        displayName={displayName}
        bio={bio}
        avatarUrl={avatarUrl}
        avatarFeather={avatarFeather}
        showAvatar={showAvatar}
        showTitle={showTitle}
        titleSize={titleSize}
        showLogo={showLogo}
        logoUrl={logoUrl}
        logoScale={logoScale}
        profileLayout={profileLayout}
        headerTextColor={headerTextColor}
        showSocialIcons={showSocialIcons}
        socialIconsJson={socialIconsJson}
        fuzzyEnabled={fuzzyEnabled}
        fuzzyIntensity={fuzzyIntensity}
        fuzzySpeed={fuzzySpeed}
      />

      {/* Card Grid */}
      <div className="mt-6">
        <StaticFlowGrid cards={cards} />
      </div>
    </div>
  )
}
