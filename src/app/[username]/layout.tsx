import { fontVariables } from "../fonts"
import { CookieConsentBanner } from "@/components/legal/cookie-consent-banner"

interface PublicPageLayoutProps {
  children: React.ReactNode
}

/**
 * Layout wrapper for public pages
 *
 * - Provides font variables for theme fonts
 * - Simple passthrough layout (no dashboard chrome)
 * - Full-height container for proper background rendering
 * - Cookie consent banner for GDPR/CCPA compliance
 */
export default function PublicPageLayout({ children }: PublicPageLayoutProps) {
  return (
    <div className={`${fontVariables} min-h-screen`}>
      {children}
      <CookieConsentBanner />
    </div>
  )
}
