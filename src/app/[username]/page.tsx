import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { fetchPublicPageData } from "@/lib/supabase/public"
import { PublicPageRenderer } from "@/components/public/public-page-renderer"
import { ThemeInjector } from "@/components/public/theme-injector"
import { StaticBackground, StaticDimOverlay, StaticNoiseOverlay, StaticFrameOverlay } from "@/components/public/static-overlays"

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
  const vcrCenterContent = themeSettings?.vcrCenterContent ?? false
  const accentColor = themeSettings?.colors?.accent ?? '#2a6eff'
  const receiptPrice = themeSettings?.receiptPrice ?? 'PRICELESS'
  const receiptStickers = themeSettings?.receiptStickers ?? []

  // Background config for overlays
  const background = themeSettings?.background ?? { type: 'solid' as const, value: '#000000' }

  return (
    <>
      {/* Inject theme CSS variables server-side */}
      <ThemeInjector themeSettings={themeSettings} />

      {/* Background (solid, image, or video) */}
      <StaticBackground background={background} />

      {/* Dim overlay (if enabled) */}
      <StaticDimOverlay background={background} />

      {/* Render public page */}
      <PublicPageRenderer
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
        showSocialIcons={profile.show_social_icons}
        socialIconsJson={profile.social_icons}
        fuzzyEnabled={fuzzyEnabled}
        fuzzyIntensity={fuzzyIntensity}
        fuzzySpeed={fuzzySpeed}
        headingSize={headingSize}
        bodySize={bodySize}
        vcrCenterContent={vcrCenterContent}
        accentColor={accentColor}
        receiptPrice={receiptPrice}
        receiptStickers={receiptStickers}
        cards={cards}
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
