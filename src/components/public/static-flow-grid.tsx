import { cn } from "@/lib/utils"
import { CardRenderer } from "@/components/cards/card-renderer"
import { AudioPlayer } from "@/components/audio/audio-player"
import { SystemSettingsCard } from "@/components/cards/system-settings-card"
import { StaticSocialIconsInline } from "./static-social-icons-inline"
import type { Card } from "@/types/card"
import { isAudioContent } from "@/types/card"
import type { AudioCardContent } from "@/types/audio"

interface StaticFlowGridProps {
  cards: Card[]
  // Social icons data for inline rendering at card position
  socialIconsJson?: string | null
  socialIconSize?: number
  socialIconColor?: string | null
  headerTextColor?: string | null
  themeId?: string  // Pass through so audio cards know the theme on public pages
}

/**
 * StaticFlowGrid - Non-interactive card grid for public pages
 *
 * Key differences from SelectableFlowGrid:
 * - No "use client" directive - can be Server Component
 * - No dnd-kit, no sensors, no drag handlers
 * - No multi-select state
 * - No mounted/hydration guard (not needed without dnd-kit)
 * - Simpler: just map and render
 *
 * Features:
 * - Filters out hidden cards (is_visible = false)
 * - Relies on database sort order (cards pre-sorted by sort_key)
 * - Flow layout: small cards 50% width, big cards 100% width
 */
export function StaticFlowGrid({ cards, socialIconsJson, socialIconSize, socialIconColor, headerTextColor, themeId }: StaticFlowGridProps) {
  // Filter out hidden cards
  // NOTE: Cards are already sorted by sort_key from the database query
  // We don't re-sort here because the DB ordering matches fractional-indexing expectations
  const visibleCards = cards.filter(c => c.is_visible)

  // Empty state
  if (visibleCards.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg text-muted-foreground">
        <p>No cards yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-4 min-h-[100px] w-full">
      {visibleCards.map((card) => {
        // Mini cards use w-fit with margin positioning
        const isPositionableCard = card.card_type === "mini"

        // Width class: mini = w-fit, link/horizontal = full, else size-based
        const widthClass = isPositionableCard
          ? "w-fit"
          : card.card_type === "link" || card.card_type === "horizontal"
            ? "w-full"
            : card.size !== "small"
              ? "w-full"
              : "w-[calc(50%-0.5rem)]"

        // Position class for mini cards using margins
        const positionClass = isPositionableCard
          ? card.position === "right"
            ? "ml-auto"
            : card.position === "center"
              ? "mx-auto"
              : ""
          : ""

        // Social-icons card: render static version with actual data
        if (card.card_type === 'social-icons' && socialIconsJson) {
          return (
            <div key={card.id} data-card-id={card.id} className="w-full">
              <StaticSocialIconsInline
                socialIconsJson={socialIconsJson}
                socialIconSize={socialIconSize}
                socialIconColor={socialIconColor}
                headerTextColor={headerTextColor}
              />
            </div>
          )
        }

        // Audio cards: render AudioPlayer directly with correct themeVariant
        // (bypasses AudioCard which relies on Zustand store not available on public pages)
        // Wrapped in themed card chrome to match editor appearance
        if (card.card_type === 'audio' && themeId && isAudioContent(card.content)) {
          const audioContent = card.content as AudioCardContent
          const variantMap: Record<string, string> = {
            'system-settings': 'system-settings',
            'vcr-menu': 'vcr-menu',
            'receipt': 'receipt',
            'classified': 'classified',
            'mac-os': 'mac-os',
            'macintosh': 'mac-os',
            'ipod-classic': 'ipod-classic',
            'instagram-reels': 'instagram-reels',
          }
          const themeVariant = (variantMap[themeId] || 'instagram-reels') as 'instagram-reels' | 'mac-os' | 'system-settings' | 'receipt' | 'ipod-classic' | 'vcr-menu' | 'classified'

          const audioPlayer = (
            <AudioPlayer
              tracks={audioContent.tracks || []}
              albumArtUrl={audioContent.albumArtUrl}
              showWaveform={audioContent.showWaveform ?? true}
              looping={audioContent.looping ?? false}
              reverbConfig={audioContent.reverbConfig}
              playerColors={audioContent.playerColors}
              cardId={card.id}
              pageId={card.page_id}
              themeVariant={themeVariant}
            />
          )

          // System Settings: wrap in SystemSettingsCard for System 7 window chrome
          if (themeId === 'system-settings') {
            return (
              <div
                key={card.id}
                data-card-id={card.id}
                className={cn("transition-all", widthClass, positionClass)}
              >
                <SystemSettingsCard cardType="audio">
                  {audioPlayer}
                </SystemSettingsCard>
              </div>
            )
          }

          // Default wrapper for instagram-reels, mac-os, etc.
          return (
            <div
              key={card.id}
              data-card-id={card.id}
              className={cn("transition-all", widthClass, positionClass)}
            >
              <div
                className="overflow-hidden bg-theme-card-bg border border-theme-border"
                style={{ borderRadius: 'var(--theme-border-radius)' }}
              >
                {audioPlayer}
              </div>
            </div>
          )
        }

        return (
          <div
            key={card.id}
            data-card-id={card.id}
            className={cn(
              "transition-all",
              widthClass,
              positionClass,
              // Gallery needs overflow visible for full-bleed effect
              card.card_type === 'gallery' && "overflow-visible"
            )}
          >
            <CardRenderer card={card} themeId={themeId} />
          </div>
        )
      })}
    </div>
  )
}
