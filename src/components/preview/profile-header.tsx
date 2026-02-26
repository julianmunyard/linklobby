"use client"

import { User } from "lucide-react"
import { useCallback } from "react"
import { useProfileStore } from "@/stores/profile-store"
import { cn } from "@/lib/utils"
import { InlineEditable } from "@/components/preview/inline-editable"

/**
 * Returns true when rendered inside the editor iframe (not standalone/public page).
 * Used to show click-to-edit affordances only in the editor context.
 */
function useIsInEditorIframe(): boolean {
  if (typeof window === "undefined") return false
  return window.parent !== window
}

/**
 * Posts OPEN_DESIGN_TAB with tab: 'header' to the parent editor.
 * Only fires when inside the editor iframe.
 */
function postOpenHeaderTab() {
  if (typeof window === "undefined") return
  if (window.parent === window) return
  window.parent.postMessage(
    { type: "OPEN_DESIGN_TAB", payload: { tab: "header" } },
    window.location.origin
  )
}

/**
 * Profile header component for the preview iframe.
 * Renders avatar, title, logo, and bio based on profile store state.
 * Social icons are now a separate draggable card.
 * Supports Classic (centered circle) and Hero (banner) layouts.
 */
export function ProfileHeader() {
  const isInEditor = useIsInEditorIframe()
  const handleHeaderClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    postOpenHeaderTab()
  }, [])

  /**
   * Commits an inline edit by posting UPDATE_PROFILE to the parent editor.
   * Only fires when inside the editor iframe.
   */
  const handleInlineCommit = useCallback((field: string, value: string) => {
    if (typeof window === "undefined") return
    if (window.parent === window) return
    window.parent.postMessage(
      { type: "UPDATE_PROFILE", payload: { field, value } },
      window.location.origin
    )
  }, [])

  const handleInlineEditStart = useCallback(() => {
    if (typeof window === "undefined") return
    if (window.parent === window) return
    window.parent.postMessage({ type: "INLINE_EDIT_ACTIVE" }, window.location.origin)
    // Also open Title Edit settings so user can adjust header options while editing
    window.parent.postMessage(
      { type: "OPEN_DESIGN_TAB", payload: { tab: "header" } },
      window.location.origin
    )
  }, [])

  const handleInlineEditEnd = useCallback(() => {
    if (typeof window === "undefined") return
    if (window.parent === window) return
    window.parent.postMessage({ type: "INLINE_EDIT_DONE" }, window.location.origin)
  }, [])

  const displayName = useProfileStore((state) => state.displayName)
  const bio = useProfileStore((state) => state.bio)
  const avatarUrl = useProfileStore((state) => state.avatarUrl)
  const avatarFeather = useProfileStore((state) => state.avatarFeather)
  const avatarSize = useProfileStore((state) => state.avatarSize)
  const showAvatar = useProfileStore((state) => state.showAvatar)
  const showTitle = useProfileStore((state) => state.showTitle)
  const titleSize = useProfileStore((state) => state.titleSize)
  const showLogo = useProfileStore((state) => state.showLogo)
  const logoUrl = useProfileStore((state) => state.logoUrl)
  const logoScale = useProfileStore((state) => state.logoScale)
  const profileLayout = useProfileStore((state) => state.profileLayout)
  const headerTextColor = useProfileStore((state) => state.headerTextColor)

  // Render logo
  const renderLogo = () => {
    if (!showLogo || !logoUrl) return null

    // Scale logo based on logoScale (50-300%)
    const scaledWidth = Math.round(192 * (logoScale / 100))
    const scaledHeight = Math.round(48 * (logoScale / 100))

    return (
      <div
        className="relative max-w-full"
        style={{ width: scaledWidth, height: scaledHeight }}
      >
        {/* Use img instead of Image to avoid Next.js optimization issues with transparent PNGs */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
    )
  }

  // Render title text
  const renderTitle = () => {
    if (!showTitle) return null
    // In editor iframe: use InlineEditable for direct manipulation
    if (isInEditor) {
      return (
        <h1
          className={cn(
            "font-bold text-center break-words w-full max-w-xs text-theme-text",
            titleSize === "large" ? "text-4xl leading-tight" : "text-lg"
          )}
          style={{
            fontFamily: 'var(--font-theme-heading)',
            ...(headerTextColor && { color: headerTextColor })
          }}
        >
          <InlineEditable
            value={displayName || ""}
            onCommit={(text) => handleInlineCommit("displayName", text)}
            multiline={false}
            placeholder="Your Name"
            onEditStart={handleInlineEditStart}
            onEditEnd={handleInlineEditEnd}
            className="focus:outline-none focus:ring-1 focus:ring-blue-400/50 rounded px-0.5"
          />
        </h1>
      )
    }
    // Public page: static text
    if (!displayName) return null
    return (
      <h1
        className={cn(
          "font-bold text-center break-words w-full max-w-xs text-theme-text",
          titleSize === "large" ? "text-4xl leading-tight" : "text-lg"
        )}
        style={{
          fontFamily: 'var(--font-theme-heading)',
          ...(headerTextColor && { color: headerTextColor })
        }}
      >
        {displayName}
      </h1>
    )
  }

  // Render bio
  const renderBio = () => {
    // In editor iframe: always render InlineEditable (even if bio is empty — show placeholder)
    if (isInEditor) {
      return (
        <p
          className="text-sm text-theme-text/70 text-center max-w-xs"
          style={{
            fontFamily: 'var(--font-theme-body)',
            ...(headerTextColor && { color: headerTextColor, opacity: 0.7 })
          }}
        >
          <InlineEditable
            value={bio || ""}
            onCommit={(text) => handleInlineCommit("bio", text)}
            multiline={true}
            placeholder="Add a bio..."
            onEditStart={handleInlineEditStart}
            onEditEnd={handleInlineEditEnd}
            className="focus:outline-none focus:ring-1 focus:ring-blue-400/50 rounded px-0.5"
          />
        </p>
      )
    }
    // Public page: static text, hidden when empty
    if (!bio) return null
    return (
      <p
        className="text-sm text-theme-text/70 text-center max-w-xs"
        style={{
          fontFamily: 'var(--font-theme-body)',
          ...(headerTextColor && { color: headerTextColor, opacity: 0.7 })
        }}
      >
        {bio}
      </p>
    )
  }

  // Calculate feather mask for classic layout avatar (circular)
  // When feather > 0, the mask handles both shape AND soft edge fade
  // The gradient goes from solid center to transparent edge with a gradual transition
  const featherMask = avatarFeather > 0
    ? `radial-gradient(circle, black ${Math.max(0, 70 - avatarFeather * 0.7)}%, transparent ${Math.min(100, 70 + avatarFeather * 0.3)}%)`
    : undefined

  // Hover affordance classes — only shown in editor iframe
  const editorHoverClass = isInEditor
    ? "cursor-pointer hover:ring-2 hover:ring-blue-400/30 rounded transition-all"
    : ""

  // Classic layout: centered circle avatar, title below, social icons row
  if (profileLayout === "classic") {
    return (
      <div className="flex flex-col items-center gap-2 px-6 pt-6 pb-2 transition-opacity duration-200">
        {/* Avatar - small circle (only if showAvatar is true) */}
        {/* When feather > 0, we remove the hard clip and let mask-image handle the soft edge */}
        {showAvatar && (
          <div
            className={cn(
              "relative",
              avatarFeather === 0 && "bg-muted rounded-full overflow-hidden",
              editorHoverClass
            )}
            style={{ width: avatarSize, height: avatarSize }}
            onClick={handleHeaderClick}
          >
            {avatarUrl ? (
              /* Use img instead of Image to avoid Next.js optimization issues with transparent PNGs */
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt=""
                className={cn(
                  "w-full h-full object-cover",
                  avatarFeather === 0 && "rounded-full"
                )}
                style={featherMask ? {
                  WebkitMaskImage: featherMask,
                  maskImage: featherMask,
                } : undefined}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center rounded-full bg-muted">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
          </div>
        )}

        {/* Logo */}
        {renderLogo()}

        {/* Title — inline editable in editor, click-to-navigate fallback */}
        <div
          className={editorHoverClass}
          onClick={isInEditor ? (e) => e.stopPropagation() : handleHeaderClick}
        >
          {renderTitle()}
        </div>

        {/* Bio — inline editable in editor, click-to-navigate fallback */}
        <div
          className={editorHoverClass}
          onClick={isInEditor ? (e) => e.stopPropagation() : handleHeaderClick}
        >
          {renderBio()}
        </div>
      </div>
    )
  }

  // Hero layout: larger banner-style avatar, title + icons below
  return (
    <div className="transition-opacity duration-200">
      {/* Avatar - larger, banner-style (only if showAvatar is true) */}
      {showAvatar && (
        <div
          className={cn(
            "relative w-full aspect-[3/1] bg-muted overflow-hidden",
            editorHoverClass
          )}
          onClick={handleHeaderClick}
        >
          {avatarUrl ? (
            /* Use img instead of Image to avoid Next.js optimization issues with transparent PNGs */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatarUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-20 h-20 text-muted-foreground" />
            </div>
          )}
        </div>
      )}

      {/* Logo, Title, Bio below banner */}
      <div className="flex flex-col items-center gap-2 px-4 pt-3 pb-2">
        {renderLogo()}
        {/* Title — inline editable in editor, click-to-navigate fallback */}
        <div
          className={editorHoverClass}
          onClick={isInEditor ? (e) => e.stopPropagation() : handleHeaderClick}
        >
          {renderTitle()}
        </div>
        {/* Bio — inline editable in editor, click-to-navigate fallback */}
        <div
          className={editorHoverClass}
          onClick={isInEditor ? (e) => e.stopPropagation() : handleHeaderClick}
        >
          {renderBio()}
        </div>
      </div>
    </div>
  )
}
