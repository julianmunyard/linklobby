import { StaticProfileHeader } from "./static-profile-header"
import { StaticFlowGrid } from "./static-flow-grid"
import { StaticVcrMenuLayout } from "./static-vcr-menu-layout"
import { StaticIpodClassicLayout } from "./static-ipod-classic-layout"
import type { Card } from "@/types/card"
import type { BackgroundConfig, ThemeId } from "@/types/theme"

// Frame inset config - defines the "screen" area for frames (as percentages of viewport)
const FRAME_INSETS: Record<string, { top: number; bottom: number; left: number; right: number }> = {
  '/frames/awge-tv.png': {
    top: 8,      // % from top - padding from frame edge
    bottom: 14,  // % from bottom - account for AWGE text + padding
    left: 7,     // % from left - padding from frame edge
    right: 7,    // % from right - padding from frame edge
  },
}

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
  // Font sizes (for VCR theme)
  headingSize?: number
  bodySize?: number
  vcrCenterContent?: boolean
  // Theme colors
  accentColor?: string
  // Background (for frame positioning)
  background?: BackgroundConfig
  // Theme (for layout selection)
  themeId?: ThemeId
  // Cards
  cards: Card[]
}

/**
 * PublicPageRenderer - Composes the complete public page
 *
 * Features:
 * - Server-rendered (no "use client")
 * - Composes StaticProfileHeader + StaticFlowGrid
 * - Frame-aware: positions content inside frame when frameFitContent is enabled
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
  headingSize,
  bodySize,
  vcrCenterContent,
  accentColor,
  background,
  themeId,
  cards,
}: PublicPageRendererProps) {
  // VCR Menu theme uses completely different layout
  if (themeId === 'vcr-menu') {
    return (
      <StaticVcrMenuLayout
        title={displayName || 'MENU'}
        cards={cards}
        headingSize={headingSize}
        bodySize={bodySize}
        centerContent={vcrCenterContent}
      />
    )
  }

  // iPod Classic theme uses iPod interface layout
  if (themeId === 'ipod-classic') {
    return (
      <StaticIpodClassicLayout
        title={displayName || 'links'}
        cards={cards}
        headingSize={headingSize}
        bodySize={bodySize}
        accentColor={accentColor}
        background={background}
      />
    )
  }

  // Get frame insets if a frame overlay is active with fit content enabled
  const frameOverlay = background?.frameOverlay
  const frameFitContent = background?.frameFitContent ?? true // Default to true
  const frameInsets = frameOverlay && frameFitContent ? FRAME_INSETS[frameOverlay] : null

  // Frame transform values
  const frameZoom = background?.frameZoom ?? 1
  const framePosX = background?.framePositionX ?? 0
  const framePosY = background?.framePositionY ?? 0

  // When frame is active with fit content, position content within frame bounds
  if (frameInsets) {
    return (
      <div
        className="fixed overflow-y-auto overflow-x-hidden text-theme-text"
        style={{
          // Horizontal: sized to frame's screen area and centered
          width: `${100 - frameInsets.left - frameInsets.right}vw`,
          left: `${frameInsets.left}vw`,
          // Vertical: full viewport height so content scrolls within frame
          top: 0,
          bottom: 0,
          // Transform to match frame zoom/position
          transform: `scale(${frameZoom}) translate(${framePosX}%, ${framePosY}%)`,
          transformOrigin: 'center center',
          // Vertical padding positions content in visible area
          paddingTop: `${frameInsets.top}vh`,
          paddingBottom: `${frameInsets.bottom}vh`,
        }}
      >
        <div className="w-full max-w-2xl mx-auto px-4">
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
      </div>
    )
  }

  // Default layout (no frame or frame without fit content)
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
