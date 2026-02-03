import { fontVariables } from "../fonts"

interface PublicPageLayoutProps {
  children: React.ReactNode
}

/**
 * Layout wrapper for public pages
 *
 * - Provides font variables for theme fonts
 * - Simple passthrough layout (no dashboard chrome)
 * - Full-height container for proper background rendering
 */
export default function PublicPageLayout({ children }: PublicPageLayoutProps) {
  return (
    <div className={`${fontVariables} min-h-screen`}>
      {children}
    </div>
  )
}
