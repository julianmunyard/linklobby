import { notFound } from "next/navigation"
import type { Metadata, Viewport } from "next"
import { fetchPublicPageData } from "@/lib/supabase/public"
import { PublicPageRenderer } from "@/components/public/public-page-renderer"
import { ThemeInjector } from "@/components/public/theme-injector"
import { StaticBackground, StaticDimOverlay, StaticNoiseOverlay, StaticFrameOverlay } from "@/components/public/static-overlays"
import { ClickTracker } from "@/components/public/click-tracker"
import { PixelLoader } from "@/components/pixels/pixel-loader"

interface PublicPageProps {
  params: Promise<{
    username: string
  }>
}

/**
 * Dynamic public page route: linklobby.com/username
 *
 * Features:
 * - Server-side data fetching (SSR)
 * - Returns 404 for invalid/unpublished usernames
 * - Theme injected server-side (no flash)
 * - SEO-optimized with dynamic metadata
 */
export default async function PublicPage({ params }: PublicPageProps) {
  // Await params per Next.js 16 pattern
  const { username } = await params

  // Fetch complete page data
  const data = await fetchPublicPageData(username)

  // Return 404 if username doesn't exist, page not found, or unpublished
  if (!data) {
    notFound()
  }

  const { profile, page, cards } = data

  // Extract theme settings and fuzzy text configuration
  const themeSettings = page.theme_settings
  const themeId = themeSettings?.themeId ?? 'mac-os'
  const fuzzyEnabled = themeSettings?.fonts?.fuzzyEnabled ?? false
  const fuzzyIntensity = themeSettings?.fonts?.fuzzyIntensity ?? 0.19
  const fuzzySpeed = themeSettings?.fonts?.fuzzySpeed ?? 12
  const headingSize = themeSettings?.fonts?.headingSize ?? 1.8
  const bodySize = themeSettings?.fonts?.bodySize ?? 1.5
  const centerCards = themeSettings?.centerCards ?? false
  const vcrCenterContent = themeSettings?.vcrCenterContent ?? false
  const accentColor = themeSettings?.colors?.accent ?? '#2a6eff'
  const receiptPrice = themeSettings?.receiptPrice ?? 'PRICELESS'
  const receiptStickers = themeSettings?.receiptStickers ?? []
  const receiptFloatAnimation = themeSettings?.receiptFloatAnimation ?? true
  const receiptPaperTexture = themeSettings?.receiptPaperTexture ?? false
  const ipodStickers = themeSettings?.ipodStickers ?? []
  const ipodTexture = themeSettings?.ipodTexture ?? '/images/metal-texture.jpeg'
  const macPattern = themeSettings?.macPattern ?? ''
  const macPatternColor = themeSettings?.macPatternColor ?? '#c0c0c0'
  const wordArtTitleStyle = themeSettings?.wordArtTitleStyle ?? 'style-eleven'
  const classifiedStampText = themeSettings?.classifiedStampText ?? 'SECRET'
  const classifiedDeptText = themeSettings?.classifiedDeptText ?? 'War Department'
  const classifiedCenterText = themeSettings?.classifiedCenterText ?? 'Classified Message Center'
  const classifiedMessageText = themeSettings?.classifiedMessageText ?? 'Incoming Message'
  const socialIconSize = themeSettings?.socialIconSize ?? 24
  const scatterMode = themeSettings?.scatterMode ?? false
  const visitorDrag = themeSettings?.visitorDrag ?? false

  // Pixel configuration
  const pixels = themeSettings?.pixels ?? {}
  const facebookPixelId = pixels.facebookPixelId as string | undefined
  const gaMeasurementId = pixels.gaMeasurementId as string | undefined

  // Background config for overlays
  const background = themeSettings?.background ?? { type: 'solid' as const, value: '#000000' }

  return (
    <>
      {/* Inject theme CSS variables server-side */}
      <ThemeInjector themeSettings={themeSettings} />

      {/* Background (solid, image, or video) — Macintosh uses html bg instead */}
      {themeId !== 'macintosh' && <StaticBackground background={background} />}

      {/* Dim overlay (if enabled) */}
      <StaticDimOverlay background={background} />

      {/* Render public page */}
      <PublicPageRenderer
        username={username}
        background={background}
        themeId={themeId}
        displayName={profile.display_name}
        bio={profile.bio}
        avatarUrl={profile.avatar_url}
        avatarFeather={profile.avatar_feather}
        showAvatar={profile.show_avatar}
        showTitle={profile.show_title}
        titleSize={profile.title_size}
        showLogo={profile.show_logo}
        logoUrl={profile.logo_url}
        logoScale={profile.logo_scale}
        profileLayout={profile.profile_layout}
        headerTextColor={profile.header_text_color}
        socialIconColor={profile.social_icon_color}
        showSocialIcons={profile.show_social_icons}
        socialIconsJson={profile.social_icons}
        fuzzyEnabled={fuzzyEnabled}
        fuzzyIntensity={fuzzyIntensity}
        fuzzySpeed={fuzzySpeed}
        headingSize={headingSize}
        bodySize={bodySize}
        centerCards={centerCards}
        vcrCenterContent={vcrCenterContent}
        accentColor={accentColor}
        receiptPrice={receiptPrice}
        receiptStickers={receiptStickers}
        receiptFloatAnimation={receiptFloatAnimation}
        receiptPaperTexture={receiptPaperTexture}
        ipodStickers={ipodStickers}
        ipodTexture={ipodTexture}
        macPattern={macPattern}
        macPatternColor={macPatternColor}
        wordArtTitleStyle={wordArtTitleStyle}
        classifiedStampText={classifiedStampText}
        classifiedDeptText={classifiedDeptText}
        classifiedCenterText={classifiedCenterText}
        classifiedMessageText={classifiedMessageText}
        socialIconSize={socialIconSize}
        scatterMode={scatterMode}
        visitorDrag={visitorDrag}
        cards={cards}
      />

      {/* Analytics click tracking (client component) */}
      <ClickTracker
        pageId={page.id}
        cards={cards.map(card => ({ id: card.id }))}
      />

      {/* Pixel tracking (loads only after cookie consent) */}
      <PixelLoader
        facebookPixelId={facebookPixelId}
        gaMeasurementId={gaMeasurementId}
        pageId={page.id}
        cards={cards.map(card => ({ id: card.id }))}
      />

      {/* Noise overlay (if enabled) */}
      <StaticNoiseOverlay background={background} />

      {/* Frame overlay (if enabled) */}
      <StaticFrameOverlay background={background} theme={themeId} />
    </>
  )
}

/**
 * Generate metadata for SEO
 *
 * Dynamically creates title, description, and Open Graph tags
 * based on profile data
 */
export async function generateViewport({ params }: PublicPageProps): Promise<Viewport> {
  const { username } = await params
  const data = await fetchPublicPageData(username)

  const isMacintosh = data?.page?.theme_settings?.themeId === 'macintosh'

  const themeColor = isMacintosh
    ? '#ffffff'
    : (data?.page?.theme_settings?.background?.topBarColor
      || data?.page?.theme_settings?.colors?.background
      || '#000000')

  return {
    viewportFit: 'cover',
    themeColor,
  }
}

export async function generateMetadata({ params }: PublicPageProps): Promise<Metadata> {
  const { username } = await params
  const data = await fetchPublicPageData(username)

  // Default metadata for 404 pages
  if (!data) {
    return {
      title: "Page Not Found",
      description: "This LinkLobby page does not exist or is not published.",
    }
  }

  const { profile } = data
  const displayName = profile.display_name || profile.username
  const bio = profile.bio || `Check out ${displayName}'s links`

  return {
    title: `${displayName} | LinkLobby`,
    description: bio,
    openGraph: {
      title: `${displayName} | LinkLobby`,
      description: bio,
      type: "profile",
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : undefined,
    },
    twitter: {
      card: "summary",
      title: `${displayName} | LinkLobby`,
      description: bio,
      images: profile.avatar_url ? [profile.avatar_url] : undefined,
    },
  }
}
