import Link from "next/link"
import { StaticProfileHeader } from "./static-profile-header"
import { StaticFlowGrid } from "./static-flow-grid"
import { StaticScatterCanvas } from "./static-scatter-canvas"
import { StaticVcrMenuLayout } from "./static-vcr-menu-layout"
import { StaticIpodClassicLayout } from "./static-ipod-classic-layout"
import { StaticReceiptLayout } from "./static-receipt-layout"
import { StaticMacintoshLayout } from "./static-macintosh-layout"
import { StaticWordArtLayout } from "./static-word-art-layout"
import { StaticLanyardBadgeLayout } from "./static-lanyard-badge-layout"
import { StaticClassifiedLayout } from "./static-classified-layout"
import { StaticDeparturesBoardLayout } from "./static-departures-board-layout"
import type { Card } from "@/types/card"
import type { BackgroundConfig, ThemeId, ReceiptSticker } from "@/types/theme"
import type { SocialIcon } from "@/types/profile"
import { isScatterTheme } from "@/types/scatter"

// Frame inset config - defines the "screen" area for frames (as percentages of viewport)
const FRAME_INSETS: Record<string, { top: number; bottom: number; left: number; right: number }> = {
  '/frames/awge-tv.png': {
    top: 8,      // % from top - padding from frame edge
    bottom: 14,  // % from bottom - account for AWGE text + padding
    left: 7,     // % from left - padding from frame edge
    right: 7,    // % from right - padding from frame edge
  },
}

/**
 * LegalFooter - Footer with privacy policy and terms of service links
 */
function LegalFooter({ username }: { username: string }) {
  return (
    <footer className="py-6 text-center text-xs" style={{ opacity: 0.5 }}>
      <div className="flex items-center justify-center gap-4 text-theme-text">
        <Link
          href={`/privacy?username=${username}`}
          className="hover:opacity-80 transition-opacity"
        >
          Privacy Policy
        </Link>
        <span>•</span>
        <Link
          href="/terms"
          className="hover:opacity-80 transition-opacity"
        >
          Terms of Service
        </Link>
      </div>
      <div className="mt-2 text-theme-text">
        Powered by LinkLobby
      </div>
    </footer>
  )
}

interface PublicPageRendererProps {
  // Profile data
  username: string
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
  socialIconColor: string | null
  showSocialIcons: boolean
  socialIconsJson?: string | null
  // Theme fonts
  fuzzyEnabled?: boolean
  fuzzyIntensity?: number
  fuzzySpeed?: number
  // Font sizes (for VCR theme)
  headingSize?: number
  bodySize?: number
  centerCards?: boolean
  vcrCenterContent?: boolean
  // Theme colors
  accentColor?: string
  // Background (for frame positioning)
  background?: BackgroundConfig
  // Theme (for layout selection)
  themeId?: ThemeId
  // Receipt theme
  receiptPrice?: string
  receiptStickers?: ReceiptSticker[]
  receiptFloatAnimation?: boolean
  receiptPaperTexture?: boolean
  // iPod theme
  ipodStickers?: ReceiptSticker[]
  ipodTexture?: string
  // Macintosh theme
  macPattern?: string
  macPatternColor?: string
  // Word Art theme
  wordArtTitleStyle?: string
  // Classified theme
  classifiedStampText?: string
  classifiedDeptText?: string
  classifiedCenterText?: string
  classifiedMessageText?: string
  // Social icon size
  socialIconSize?: number
  // Scatter mode
  scatterMode?: boolean
  visitorDrag?: boolean
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
  username,
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
  socialIconColor,
  showSocialIcons,
  socialIconsJson,
  fuzzyEnabled,
  fuzzyIntensity,
  fuzzySpeed,
  headingSize,
  bodySize,
  centerCards,
  vcrCenterContent,
  accentColor,
  background,
  themeId,
  receiptPrice,
  receiptStickers,
  receiptFloatAnimation,
  receiptPaperTexture,
  ipodStickers,
  ipodTexture,
  macPattern,
  macPatternColor,
  wordArtTitleStyle,
  classifiedStampText,
  classifiedDeptText,
  classifiedCenterText,
  classifiedMessageText,
  socialIconSize,
  scatterMode = false,
  visitorDrag = false,
  cards,
}: PublicPageRendererProps) {
  // Check if current theme supports scatter mode
  const isScatterLayout = scatterMode && themeId && isScatterTheme(themeId)
  // VCR Menu theme uses completely different layout
  if (themeId === 'vcr-menu') {
    // Parse social icons from JSON for VCR theme
    const socialIcons: SocialIcon[] = socialIconsJson ? JSON.parse(socialIconsJson) : []

    return (
      <StaticVcrMenuLayout
        username={username}
        title={displayName || 'MENU'}
        cards={cards}
        headingSize={headingSize}
        bodySize={bodySize}
        centerContent={vcrCenterContent}
        socialIcons={socialIcons}
      />
    )
  }

  // iPod Classic theme uses iPod interface layout
  if (themeId === 'ipod-classic') {
    // Parse social icons from JSON for iPod theme
    const socialIcons: SocialIcon[] = socialIconsJson ? JSON.parse(socialIconsJson) : []

    return (
      <StaticIpodClassicLayout
        username={username}
        title={displayName || 'links'}
        cards={cards}
        headingSize={headingSize}
        bodySize={bodySize}
        accentColor={accentColor}
        background={background}
        logoUrl={logoUrl}
        showLogo={showLogo}
        logoScale={logoScale}
        socialIcons={socialIcons}
        ipodStickers={ipodStickers}
        ipodTexture={ipodTexture}
      />
    )
  }

  // Receipt theme uses receipt paper layout
  if (themeId === 'receipt') {
    // Parse social icons from JSON for receipt theme
    const socialIcons: SocialIcon[] = socialIconsJson ? JSON.parse(socialIconsJson) : []

    return (
      <StaticReceiptLayout
        username={username}
        title={displayName || 'RECEIPT'}
        cards={cards}
        headingSize={headingSize}
        bodySize={bodySize}
        avatarUrl={avatarUrl}
        showAvatar={showAvatar}
        bio={bio}
        socialIcons={socialIcons}
        showSocialIcons={showSocialIcons}
        receiptPrice={receiptPrice}
        receiptStickers={receiptStickers}
        receiptFloatAnimation={receiptFloatAnimation}
        receiptPaperTexture={receiptPaperTexture}
      />
    )
  }

  // Macintosh theme uses Mac desktop layout
  if (themeId === 'macintosh') {
    const macFrameOverlay = background?.frameOverlay
    const macFrameFitContent = background?.frameFitContent ?? true
    const macFrameInsets = macFrameOverlay && macFrameFitContent ? FRAME_INSETS[macFrameOverlay] : null

    return (
      <StaticMacintoshLayout
        username={username}
        title={displayName || ''}
        cards={cards}
        headingSize={headingSize}
        bodySize={bodySize}
        macPattern={macPattern}
        macPatternColor={macPatternColor}
        socialIconsJson={socialIconsJson}
        socialIconSize={socialIconSize}
        frameInsets={macFrameInsets}
        frameZoom={background?.frameZoom ?? 1}
        framePosX={background?.framePositionX ?? 0}
        framePosY={background?.framePositionY ?? 0}
      />
    )
  }

  // Lanyard Badge theme uses 3D lanyard with badge card
  if (themeId === 'lanyard-badge') {
    const socialIcons: SocialIcon[] = socialIconsJson ? JSON.parse(socialIconsJson) : []
    return (
      <StaticLanyardBadgeLayout
        username={username}
        title={displayName || 'BADGE'}
        cards={cards}
        headingSize={headingSize}
        bodySize={bodySize}
        socialIcons={socialIcons}
        accentColor={accentColor}
        avatarUrl={avatarUrl}
        showAvatar={showAvatar}
      />
    )
  }

  // Classified Document theme uses military document layout
  if (themeId === 'classified') {
    const socialIcons: SocialIcon[] = socialIconsJson ? JSON.parse(socialIconsJson) : []
    return (
      <StaticClassifiedLayout
        username={username}
        title={displayName || 'SECRET'}
        cards={cards}
        headingSize={headingSize}
        bodySize={bodySize}
        socialIcons={socialIcons}
        showSocialIcons={showSocialIcons}
        classifiedStampText={classifiedStampText}
        classifiedDeptText={classifiedDeptText}
        classifiedCenterText={classifiedCenterText}
        classifiedMessageText={classifiedMessageText}
      />
    )
  }

  // Departures Board themes use airport departures display layout
  if (themeId === 'departures-board' || themeId === 'departures-board-led') {
    const socialIcons: SocialIcon[] = socialIconsJson ? JSON.parse(socialIconsJson) : []
    return (
      <StaticDeparturesBoardLayout
        username={username}
        title={displayName || 'DEPARTURES'}
        cards={cards}
        headingSize={headingSize}
        bodySize={bodySize}
        socialIcons={socialIcons}
        showSocialIcons={showSocialIcons}
        isLed={themeId === 'departures-board-led'}
      />
    )
  }

  // Word Art theme uses word art text layout
  if (themeId === 'word-art') {
    const socialIcons: SocialIcon[] = socialIconsJson ? JSON.parse(socialIconsJson) : []

    return (
      <StaticWordArtLayout
        username={username}
        title={displayName || 'Word Art'}
        cards={cards}
        headingSize={headingSize}
        bodySize={bodySize}
        socialIcons={socialIcons}
        socialIconColor={socialIconColor}
        wordArtTitleStyle={wordArtTitleStyle}
        centerCards={centerCards}
        showSocialIcons={showSocialIcons}
      />
    )
  }

  // If there's a social-icons card, render icons at card position (not in header)
  const hasSocialIconsCard = cards.some(c => c.card_type === 'social-icons')
  const showSocialIconsInHeader = showSocialIcons && !hasSocialIconsCard

  // Scatter mode: viewport-locked layout with footer pinned at bottom (takes priority over frame)
  if (isScatterLayout) {
    return (
      <div className="min-h-screen flex flex-col text-theme-text">
        <div className="w-full px-4 pt-4 shrink-0">
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
            socialIconColor={socialIconColor}
            showSocialIcons={showSocialIconsInHeader}
            socialIconsJson={socialIconsJson}
            socialIconSize={socialIconSize}
            fuzzyEnabled={fuzzyEnabled}
            fuzzyIntensity={fuzzyIntensity}
            fuzzySpeed={fuzzySpeed}
          />
        </div>

        <div className="flex-1 relative w-full px-4">
          <StaticScatterCanvas
            cards={cards}
            themeId={themeId!}
            visitorDrag={visitorDrag}
          />
        </div>

        <LegalFooter username={username} />
      </div>
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
        className={`fixed overflow-y-auto overflow-x-hidden text-theme-text${centerCards ? ' flex flex-col items-center justify-center' : ''}`}
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
            socialIconColor={socialIconColor}
            showSocialIcons={showSocialIconsInHeader}
            socialIconsJson={socialIconsJson}
            socialIconSize={socialIconSize}
            fuzzyEnabled={fuzzyEnabled}
            fuzzyIntensity={fuzzyIntensity}
            fuzzySpeed={fuzzySpeed}
          />

          {/* Card Grid */}
          <div className="mt-2">
            <StaticFlowGrid
              cards={cards}
              socialIconsJson={hasSocialIconsCard ? socialIconsJson : undefined}
              socialIconSize={socialIconSize}
              socialIconColor={socialIconColor}
              headerTextColor={headerTextColor}
              themeId={themeId}
            />
          </div>

          {/* Legal Footer */}
          <LegalFooter username={username} />
        </div>
      </div>
    )
  }

  // Default layout (no frame or frame without fit content)
  return (
    <div className="min-h-screen flex flex-col text-theme-text overflow-x-hidden">
      <div className={`w-full max-w-2xl mx-auto px-4 py-8 flex-1${centerCards ? ' flex flex-col items-center justify-center' : ''}`}>
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
          socialIconColor={socialIconColor}
          showSocialIcons={showSocialIconsInHeader}
          socialIconsJson={socialIconsJson}
          socialIconSize={socialIconSize}
          fuzzyEnabled={fuzzyEnabled}
          fuzzyIntensity={fuzzyIntensity}
          fuzzySpeed={fuzzySpeed}
        />

        {/* Card Grid */}
        <div className="mt-2 w-full">
          <StaticFlowGrid
            cards={cards}
            socialIconsJson={hasSocialIconsCard ? socialIconsJson : undefined}
            socialIconSize={socialIconSize}
            socialIconColor={socialIconColor}
            headerTextColor={headerTextColor}
            themeId={themeId}
          />
        </div>
      </div>

      {/* Legal Footer - always at bottom */}
      <LegalFooter username={username} />
    </div>
  )
}
