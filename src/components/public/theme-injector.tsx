import type { ThemeState, ColorPalette, FontConfig, StyleConfig, BackgroundConfig } from "@/types/theme"
import { resolveFontFamily } from "@/app/fonts"

interface ThemeInjectorProps {
  themeSettings: ThemeState | null
}

/**
 * ThemeInjector - Injects theme CSS variables server-side
 *
 * Purpose: Apply theme colors/settings before page renders to prevent flash
 * - Injects CSS variables inline for SSR
 * - Handles solid and image backgrounds
 * - Sets data-theme attribute for theme-specific styling
 * - Falls back to defaults if no theme saved
 */
export function ThemeInjector({ themeSettings }: ThemeInjectorProps) {
  // Default theme values if no theme saved
  const defaultColors: ColorPalette = {
    background: "#000000",
    cardBg: "#1a1a1a",
    text: "#ffffff",
    accent: "#8b5cf6",
    border: "#333333",
    link: "#ffffff",
  }

  const defaultFonts: FontConfig = {
    heading: "var(--font-geist-sans)",
    body: "var(--font-geist-sans)",
    headingSize: 1,
    bodySize: 1,
    headingWeight: "bold",
    fuzzyEnabled: false,
    fuzzyIntensity: 0.19,
    fuzzySpeed: 12,
  }

  const defaultStyle: StyleConfig = {
    borderRadius: 16,
    shadowEnabled: false,
    blurIntensity: 0,
  }

  const defaultBackground: BackgroundConfig = {
    type: "solid",
    value: "#000000",
  }

  // Extract theme values or use defaults
  const colors = themeSettings?.colors ?? defaultColors
  const fonts = themeSettings?.fonts ?? defaultFonts
  const style = themeSettings?.style ?? defaultStyle
  const background = themeSettings?.background ?? defaultBackground

  // Resolve font variable references to actual font-family values server-side
  const resolvedHeading = resolveFontFamily(fonts.heading)
  const resolvedBody = resolveFontFamily(fonts.body)

  // Build CSS variables object (using Record for custom CSS properties)
  const cssVariables: Record<string, string> = {
    "--bg-color": colors.background,
    "--fg-color": colors.text,
    "--card-bg": colors.cardBg,
    "--card-text": colors.text,
    "--link-color": colors.link,
    "--accent-color": colors.accent,
    "--border-color": colors.border,

    "--heading-font": resolvedHeading,
    "--body-font": resolvedBody,

    "--card-radius": `${style.borderRadius}px`,
    "--card-shadow": style.shadowEnabled ? "0 4px 6px rgba(0,0,0,0.1)" : "none",
  }

  // Get theme ID for data-theme attribute
  const themeId = themeSettings?.themeId ?? 'mac-os'

  // Status bar color for mobile safe areas
  const statusBarColor = background.topBarColor || colors.background

  const isMacintosh = themeId === 'macintosh'
  const macPattern = themeSettings?.macPattern || ''
  const macPatternColor = themeSettings?.macPatternColor || '#c0c0c0'

  // Macintosh theme: pattern is rendered by a fixed div in the layout components,
  // NOT by body. Body just gets solid macPatternColor as a safety net for any area
  // not covered by the fixed div (e.g. iOS Safari safe areas).
  // html also gets the solid color as fallback.

  const standardBodyBg = background.type === "solid" || !background.type ? colors.background : "transparent"

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html {
              ${isMacintosh ? `background-color: ${macPatternColor} !important;` : `background-color: ${statusBarColor};`}
              min-height: 100% !important;
            }
            body {
              ${Object.entries(cssVariables)
                .map(([key, value]) => `${key}: ${value};`)
                .join("\n              ")}
              --theme-background: ${colors.background};
              --theme-card-bg: ${colors.cardBg};
              --theme-text: ${colors.text};
              --theme-accent: ${colors.accent};
              --theme-border: ${colors.border};
              --theme-link: ${colors.link};
              --theme-font-heading: ${resolvedHeading};
              --theme-font-body: ${resolvedBody};
              --font-theme-heading: ${resolvedHeading};
              --font-theme-body: ${resolvedBody};
              --font-pixter-granular: 'Pixter Granular', monospace;
              --theme-heading-size: ${fonts.headingSize}rem;
              --theme-body-size: ${fonts.bodySize}rem;
              --theme-heading-weight: ${fonts.headingWeight === 'bold' ? '700' : '400'};
              --theme-border-radius: ${style.borderRadius}px;
              --theme-shadow-enabled: ${style.shadowEnabled ? '1' : '0'};
              --theme-blur-intensity: ${style.blurIntensity}px;
              ${isMacintosh ? `background-color: ${macPatternColor} !important; padding-bottom: env(safe-area-inset-bottom, 0px) !important; overflow-x: hidden !important;` : `background-color: ${standardBodyBg} !important;`}
              color: ${colors.text};
            }
          `,
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.setAttribute('data-theme', '${themeId}');`,
        }}
      />
    </>
  )
}
