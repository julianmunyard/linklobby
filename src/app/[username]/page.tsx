import { notFound } from "next/navigation"
import type { Metadata, Viewport } from "next"
import { fetchPublicPageData } from "@/lib/supabase/public"
import { PublicPageRenderer } from "@/components/public/public-page-renderer"
import { ThemeInjector } from "@/components/public/theme-injector"
import { StaticBackground, StaticDimOverlay, StaticNoiseOverlay, StaticFrameOverlay } from "@/components/public/static-overlays"
import { StaticGlitchOverlay } from "@/components/glitch/static-glitch-overlay"
import { ClickTracker } from "@/components/public/click-tracker"
import { PixelLoader } from "@/components/pixels/pixel-loader"
import { getUserPlan, isPro } from "@/lib/stripe/subscription"
import { PRO_THEMES } from "@/lib/stripe/plans"

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

  const { profile, page } = data

  // Determine plan access for public page feature gating
  const planTier = await getUserPlan(page.user_id)
  const hasProAccess = isPro(planTier)

  // Strip Pro-only cards for free users and remove scheduling
  const cards = hasProAccess
    ? data.cards
    : data.cards
        .filter((card) => {
          if (card.card_type === 'email-collection') return false
          if (card.card_type === 'release') return false
          return true
        })
        .map((card) => ({
          ...card,
          schedule_start: null,
          schedule_end: null,
        }))

  // Extract theme settings and fuzzy text configuration
  const themeSettings = page.theme_settings
  const rawThemeId = themeSettings?.themeId ?? 'mac-os'
  // Free users fall back to 'instagram-reels' when a Pro-only theme is active
  const themeId = (!hasProAccess && PRO_THEMES.includes(rawThemeId))
    ? 'instagram-reels'
    : rawThemeId
  const fuzzyEnabled = themeSettings?.fonts?.fuzzyEnabled ?? false
  const fuzzyIntensity = themeSettings?.fonts?.fuzzyIntensity ?? 0.19
  const fuzzySpeed = themeSettings?.fonts?.fuzzySpeed ?? 12
  const headingSize = themeSettings?.fonts?.headingSize ?? 1.8
  const bodySize = themeSettings?.fonts?.bodySize ?? 1.5
  const centerCards = themeSettings?.centerCards ?? false
  const vcrCenterContent = themeSettings?.vcrCenterContent ?? false
  const accentColor = themeSettings?.colors?.accent ?? '#2a6eff'
  const themeColors = themeSettings?.colors ? {
    background: themeSettings.colors.background,
    cardBg: themeSettings.colors.cardBg,
    text: themeSettings.colors.text,
    accent: themeSettings.colors.accent,
    border: themeSettings.colors.border,
    link: themeSettings.colors.link,
  } : undefined
  const receiptPrice = themeSettings?.receiptPrice ?? 'PRICELESS'
  const receiptStickers = themeSettings?.receiptStickers ?? []
  const receiptFloatAnimation = themeSettings?.receiptFloatAnimation ?? true
  const receiptPaperTexture = themeSettings?.receiptPaperTexture ?? false
  const ipodStickers = themeSettings?.ipodStickers ?? []
  const ipodTexture = themeSettings?.ipodTexture ?? '/images/metal-texture.jpeg'
  const macPattern = themeSettings?.macPattern ?? ''
  const macPatternColor = themeSettings?.macPatternColor ?? '#c0c0c0'
  const wordArtTitleStyle = themeSettings?.wordArtTitleStyle ?? 'style-eleven'
  const socialIconSize = themeSettings?.socialIconSize ?? 24
  const phoneHomeDock = themeSettings?.phoneHomeDock ?? []
  const phoneHomeShowDock = themeSettings?.phoneHomeShowDock ?? true
  const phoneHomeDockTranslucent = themeSettings?.phoneHomeDockTranslucent ?? true
  const phoneHomeVariant = (themeSettings?.phoneHomeVariant as 'default' | '8-bit' | undefined) ?? 'default'
  const zineBadgeText = themeSettings?.zineBadgeText ?? 'NEW!'
  const zineTitleSize = themeSettings?.zineTitleSize ?? 1.0
  const zineShowDoodles = themeSettings?.zineShowDoodles ?? true
  const artifactMarqueeText = (themeSettings?.artifactMarqueeText as string | undefined) ?? 'LINKS_DATABASE /// ACCESS_GRANTED >>> CONNECT_NOW /// NET_RUNNER'
  const artifactHeaderTopLeft = (themeSettings?.artifactHeaderTopLeft as string | undefined) ?? 'USER.ID_99'
  const artifactHeaderTopCenter = (themeSettings?.artifactHeaderTopCenter as string | undefined) ?? '[ONLINE]'
  const artifactHeaderTopRight = (themeSettings?.artifactHeaderTopRight as string | undefined) ?? ''
  const artifactHeaderBottomLeft = (themeSettings?.artifactHeaderBottomLeft as string | undefined) ?? 'DIGITAL // PHY'
  const artifactHeaderBottomCenter = (themeSettings?.artifactHeaderBottomCenter as string | undefined) ?? '///'
  const artifactHeaderBottomRight = (themeSettings?.artifactHeaderBottomRight as string | undefined) ?? 'SYS_ADMIN'
  const artifactShowHeaderMeta = (themeSettings?.artifactShowHeaderMeta as boolean | undefined) ?? true
  const artifactHeroOverlay = (themeSettings?.artifactHeroOverlay as boolean | undefined) ?? true
  const artifactHeroMediaType = (themeSettings?.artifactHeroMediaType as 'image' | 'video' | undefined) ?? 'image'
  const artifactHeroImageUrl = (themeSettings?.artifactHeroImageUrl as string | undefined) ?? ''
  const artifactHeroVideoUrl = (themeSettings?.artifactHeroVideoUrl as string | undefined) ?? ''
  const artifactHeroPositionX = (themeSettings?.artifactHeroPositionX as number | undefined) ?? 50
  const artifactHeroPositionY = (themeSettings?.artifactHeroPositionY as number | undefined) ?? 50
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
        socialIconSize={socialIconSize}
        phoneHomeDock={phoneHomeDock}
        phoneHomeShowDock={phoneHomeShowDock}
        phoneHomeDockTranslucent={phoneHomeDockTranslucent}
        phoneHomeVariant={phoneHomeVariant}
        zineBadgeText={zineBadgeText}
        zineTitleSize={zineTitleSize}
        zineShowDoodles={zineShowDoodles}
        artifactMarqueeText={artifactMarqueeText}
        artifactHeaderTopLeft={artifactHeaderTopLeft}
        artifactHeaderTopCenter={artifactHeaderTopCenter}
        artifactHeaderTopRight={artifactHeaderTopRight}
        artifactHeaderBottomLeft={artifactHeaderBottomLeft}
        artifactHeaderBottomCenter={artifactHeaderBottomCenter}
        artifactHeaderBottomRight={artifactHeaderBottomRight}
        artifactShowHeaderMeta={artifactShowHeaderMeta}
        artifactHeroOverlay={artifactHeroOverlay}
        artifactHeroMediaType={artifactHeroMediaType}
        artifactHeroImageUrl={artifactHeroImageUrl}
        artifactHeroVideoUrl={artifactHeroVideoUrl}
        artifactHeroPositionX={artifactHeroPositionX}
        artifactHeroPositionY={artifactHeroPositionY}
        themeColors={themeColors}
        scatterMode={scatterMode}
        visitorDrag={visitorDrag}
        cards={cards}
        hasProAccess={hasProAccess}
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

      {/* Glitch overlay (if enabled) */}
      <StaticGlitchOverlay background={background} />

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
