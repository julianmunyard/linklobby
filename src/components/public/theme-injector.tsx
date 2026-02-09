import type { ThemeState, ColorPalette, FontConfig, StyleConfig, BackgroundConfig } from "@/types/theme"

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

  // Build CSS variables object (using Record for custom CSS properties)
  const cssVariables: Record<string, string> = {
    "--bg-color": colors.background,
    "--fg-color": colors.text,
    "--card-bg": colors.cardBg,
    "--card-text": colors.text,
    "--link-color": colors.link,
    "--accent-color": colors.accent,
    "--border-color": colors.border,

    "--heading-font": fonts.heading,
    "--body-font": fonts.body,

    "--card-radius": `${style.borderRadius}px`,
    "--card-shadow": style.shadowEnabled ? "0 4px 6px rgba(0,0,0,0.1)" : "none",
  }

  // Get theme ID for data-theme attribute
  const themeId = themeSettings?.themeId ?? 'mac-os'

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              ${Object.entries(cssVariables)
                .map(([key, value]) => `${key}: ${value};`)
                .join("\n            ")}
              --theme-background: ${colors.background};
              --theme-card-bg: ${colors.cardBg};
              --theme-text: ${colors.text};
              --theme-accent: ${colors.accent};
              --theme-border: ${colors.border};
              --theme-link: ${colors.link};
              --theme-font-heading: ${fonts.heading};
              --theme-font-body: ${fonts.body};
              --font-theme-heading: ${fonts.heading};
              --font-theme-body: ${fonts.body};
              --font-pixter-granular: 'Pixter Granular', monospace;
            }

            html {
              data-theme: ${themeId};
            }

            body {
              background-color: ${background.type === "solid" || !background.type ? "var(--bg-color)" : "transparent"};
              color: var(--fg-color);
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
