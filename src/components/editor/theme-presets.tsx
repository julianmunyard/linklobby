'use client'

import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { useThemeStore } from '@/stores/theme-store'
import { usePageStore } from '@/stores/page-store'
import { useProfileStore } from '@/stores/profile-store'
import { THEMES, getThemeDefaults } from '@/lib/themes'
import { migrateToMacintosh, migrateFromMacintosh, migrateToBlinkies, migrateFromBlinkies } from '@/lib/card-migration'
import { getTemplatesByTheme } from '@/lib/templates'
import type { TemplateDefinition } from '@/lib/templates'
import { cn } from '@/lib/utils'
import { Check, ChevronRight, ArrowLeft, Loader2, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import type { ThemeId, ThemeConfig, ThemeState } from '@/types/theme'
import type { Card } from '@/types/card'
import type { Profile } from '@/types/profile'
import { isScatterTheme } from '@/types/scatter'
import { ProBadge } from '@/components/billing/pro-gate'
import { PRO_THEMES } from '@/lib/stripe/plans'
import { usePlanTier } from '@/contexts/plan-tier-context'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// ---------------------------------------------------------------------------
// Category definitions
// ---------------------------------------------------------------------------

const THEME_CATEGORIES = [
  {
    id: 'custom-link-page',
    name: 'Custom Link Page',
    description: 'Card-based layouts with rich visual customisation',
    themeIds: ['mac-os', 'instagram-reels', 'system-settings', 'blinkies'] as ThemeId[],
  },
  {
    id: 'designer',
    name: 'Designer',
    description: 'Unique themed experiences with bespoke layouts',
    themeIds: [
      'vcr-menu',
      'ipod-classic',
      'receipt',
      'macintosh',
      'word-art',
      'phone-home',
      'chaotic-zine',
      'artifact',
    ] as ThemeId[],
  },
] as const

type CategoryId = (typeof THEME_CATEGORIES)[number]['id']

function getCategoryThemes(categoryId: CategoryId): ThemeConfig[] {
  const cat = THEME_CATEGORIES.find((c) => c.id === categoryId)
  if (!cat) return []
  return cat.themeIds
    .map((id) => THEMES.find((t) => t.id === id))
    .filter((t): t is ThemeConfig => t !== undefined)
}

// ---------------------------------------------------------------------------
// ThemeMiniPreview – tiny simulated page using the theme's actual tokens
// ---------------------------------------------------------------------------

function ThemeMiniPreview({ theme }: { theme: ThemeConfig }) {
  const defaults = getThemeDefaults(theme.id)
  if (!defaults) return null

  const { colors, style } = defaults
  const isCardLayout = !theme.isListLayout

  // Phone Home layout — grid of rounded app icons + dock
  if (theme.isPhoneHomeLayout) {
    return (
      <div
        className="w-full h-36 rounded-lg overflow-hidden relative"
        style={{ backgroundColor: colors.background }}
      >
        {/* 3 rows of 4 icon squares */}
        <div className="absolute inset-0 flex flex-col items-center pt-5 px-5 gap-2.5">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex gap-2.5 w-full justify-center">
              {[0, 1, 2, 3].map((col) => (
                <div
                  key={col}
                  className="w-[18px] h-[18px] rounded-[5px]"
                  style={{
                    backgroundColor: col % 2 === 0 ? colors.accent : colors.text,
                    opacity: row === 2 && col > 1 ? 0 : 0.6,
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Dock bar */}
        <div
          className="absolute bottom-2 left-3 right-3 h-7 rounded-[8px] flex items-center justify-center gap-2"
          style={{
            backgroundColor: colors.cardBg,
            backdropFilter: 'blur(4px)',
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-[14px] h-[14px] rounded-[4px]"
              style={{ backgroundColor: colors.accent, opacity: 0.7 }}
            />
          ))}
        </div>

        {/* Theme name */}
        <div
          className="absolute bottom-[38px] left-0 right-0 text-center text-[9px] truncate px-2"
          style={{ color: colors.text, opacity: 0.4 }}
        >
          {theme.name}
        </div>
      </div>
    )
  }

  if (isCardLayout) {
    return (
      <div
        className="w-full h-36 rounded-lg overflow-hidden relative"
        style={{ backgroundColor: colors.background }}
      >
        {/* Two simulated cards */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-5">
          {/* Traffic lights for mac-os */}
          {theme.hasTrafficLights && (
            <div className="flex gap-1 self-start mb-1 ml-1">
              <div className="w-[6px] h-[6px] rounded-full bg-[#ff5f57]" />
              <div className="w-[6px] h-[6px] rounded-full bg-[#febc2e]" />
              <div className="w-[6px] h-[6px] rounded-full bg-[#28c840]" />
            </div>
          )}
          {[0, 1].map((i) => (
            <div
              key={i}
              className="w-full h-9 flex items-center px-2.5"
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: Math.min(style.borderRadius, 8),
                boxShadow: style.shadowEnabled
                  ? `2px 2px 4px rgba(0,0,0,0.15)`
                  : 'none',
              }}
            >
              <div
                className="h-1.5 rounded-full"
                style={{
                  backgroundColor: colors.text,
                  width: i === 0 ? '60%' : '45%',
                  opacity: 0.6,
                }}
              />
            </div>
          ))}
        </div>

        {/* Heading font sample at bottom */}
        <div
          className="absolute bottom-2 left-0 right-0 text-center text-[9px] truncate px-2"
          style={{
            fontFamily: defaults.fonts.heading,
            color: colors.text,
            opacity: 0.5,
          }}
        >
          {theme.name}
        </div>
      </div>
    )
  }

  // List-layout themes
  return (
    <div
      className="w-full h-36 rounded-lg overflow-hidden relative"
      style={{ backgroundColor: colors.background }}
    >
      {/* Title bar */}
      <div
        className="mx-4 mt-3 h-2.5 rounded-sm"
        style={{ backgroundColor: colors.text, opacity: 0.7 }}
      />
      {/* Separator */}
      <div
        className="mx-4 mt-1.5 h-px"
        style={{
          backgroundColor: colors.border,
          borderBottom:
            theme.id === 'receipt'
              ? `1px dashed ${colors.border}`
              : undefined,
        }}
      />

      {/* 4 text-line bars */}
      <div className="flex flex-col gap-1.5 px-4 mt-2.5">
        {[72, 55, 65, 40].map((w, i) => (
          <div
            key={i}
            className="h-[5px] rounded-sm"
            style={{
              backgroundColor: colors.text,
              width: `${w}%`,
              opacity: 0.45,
            }}
          />
        ))}
      </div>

      {/* Scanlines for VCR */}
      {theme.id === 'vcr-menu' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
          }}
        />
      )}

      {/* Dotted border for receipt */}
      {theme.id === 'receipt' && (
        <div
          className="absolute inset-x-3 bottom-3 top-2 pointer-events-none rounded-sm"
          style={{
            border: `1px dashed ${colors.border}`,
            opacity: 0.25,
          }}
        />
      )}

      {/* Accent bar at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: colors.accent, opacity: 0.6 }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// CategorySelectionView – two clickable category blocks
// ---------------------------------------------------------------------------

function CategorySelectionView({
  onSelectCategory,
}: {
  onSelectCategory: (id: CategoryId) => void
}) {
  const { themeId } = useThemeStore()

  return (
    <div className="grid grid-cols-1 gap-3">
      {THEME_CATEGORIES.map((cat) => {
        const themes = getCategoryThemes(cat.id)
        const isActive = cat.themeIds.includes(themeId)

        // Build composite color strip from up to 6 sampled colors across the category's themes
        const stripColors = themes.flatMap((t) => {
          const d = getThemeDefaults(t.id)
          return d ? [d.colors.background, d.colors.accent, d.colors.text] : []
        })
        // Deduplicate and limit to 6
        const uniqueStrip = [...new Set(stripColors)].slice(0, 6)

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              'relative w-full p-4 rounded-lg border-2 text-left transition-all',
              'hover:border-accent',
              isActive ? 'border-accent bg-accent/10' : 'border-border bg-card'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{cat.name}</h4>
                  {isActive && (
                    <span className="text-[10px] uppercase tracking-wider text-accent font-medium">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cat.description}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">
                  {themes.length} themes
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
            </div>

            {/* Color strip */}
            <div className="flex gap-0.5 h-2 rounded-full overflow-hidden mt-3">
              {uniqueStrip.map((color, i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CategoryDetailView – theme list with mini previews
// ---------------------------------------------------------------------------

function CategoryDetailView({
  categoryId,
  onBack,
}: {
  categoryId: CategoryId
  onBack: () => void
}) {
  const { planTier } = usePlanTier()
  const isFree = planTier === 'free'
  const { themeId, paletteId, setTheme, setPalette } = useThemeStore()
  const clearCardColorOverrides = usePageStore(
    (state) => state.clearCardColorOverrides
  )
  const setAllCardsTransparency = usePageStore(
    (state) => state.setAllCardsTransparency
  )

  const [applyingTemplateId, setApplyingTemplateId] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingTemplate, setPendingTemplate] = useState<TemplateDefinition | null>(null)

  async function applyTemplate(template: TemplateDefinition, mode: 'replace' | 'add') {
    setApplyingTemplateId(template.id)
    setShowConfirm(false)

    try {
      const res = await fetch('/api/templates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: template.id, mode }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `HTTP ${res.status}`)
      }

      const data = await res.json() as {
        cards: Card[]
        theme: ThemeState
        profile: Partial<Profile>
        templateName: string
      }

      usePageStore.getState().setCards(data.cards)
      useThemeStore.getState().loadFromDatabase(data.theme)
      useProfileStore.getState().initializeProfile(data.profile)

      useThemeStore.setState({ hasChanges: true })
      useProfileStore.setState({ hasChanges: true })

      toast.success(`Template "${data.templateName}" applied!`)
    } catch (err) {
      console.error('[ThemePresets] apply template error:', err)
      toast.error('Failed to apply template. Please try again.')
    } finally {
      setApplyingTemplateId(null)
      setPendingTemplate(null)
    }
  }

  function handleTemplateClick(template: TemplateDefinition) {
    const existingCardCount = usePageStore.getState().cards.length
    if (existingCardCount > 0) {
      setPendingTemplate(template)
      setShowConfirm(true)
    } else {
      applyTemplate(template, 'replace')
    }
  }

  const category = THEME_CATEGORIES.find((c) => c.id === categoryId)!
  const themes = getCategoryThemes(categoryId)

  const handleThemeSelect = (newThemeId: ThemeId) => {
    const currentThemeId = themeId
    const cards = usePageStore.getState().cards

    // Migrate FROM current theme first (restore original card types)
    let migrated = cards
    if (currentThemeId === 'macintosh' && newThemeId !== 'macintosh') {
      migrated = migrateFromMacintosh(migrated)
    }
    if (currentThemeId === 'blinkies' && newThemeId !== 'blinkies') {
      migrated = migrateFromBlinkies(migrated)
    }

    // Migrate TO new theme
    if (newThemeId === 'macintosh' && currentThemeId !== 'macintosh') {
      migrated = migrateToMacintosh(migrated)
    }
    if (newThemeId === 'blinkies' && currentThemeId !== 'blinkies') {
      migrated = migrateToBlinkies(migrated)
    }

    if (migrated !== cards) {
      usePageStore.getState().setCards(migrated)
    }

    // Preserve scatter layout when switching between scatter-enabled themes
    const { scatterMode } = useThemeStore.getState()
    if (scatterMode && isScatterTheme(currentThemeId) && isScatterTheme(newThemeId)) {
      usePageStore.getState().copyScatterPositions(currentThemeId, newThemeId)
      usePageStore.getState().initializeScatterLayout(newThemeId)
    }

    setTheme(newThemeId)
    clearCardColorOverrides()
  }

  const handleColorwaySelect = (palette: {
    id: string
    transparent?: boolean
  }) => {
    setPalette(palette.id)
    clearCardColorOverrides()
    setAllCardsTransparency(palette.transparent === true)
  }

  return (
    <>
    <div className="flex flex-col gap-3">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors -ml-0.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{category.name}</span>
      </button>

      {/* Theme list */}
      <div className="grid grid-cols-1 gap-3">
        {themes.map((theme) => {
          const isSelected = themeId === theme.id

          return (
            <div key={theme.id}>
              <button
                onClick={() => handleThemeSelect(theme.id)}
                className={cn(
                  'relative w-full rounded-lg border-2 text-left transition-all overflow-hidden',
                  'hover:border-accent',
                  isSelected
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-card'
                )}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                    <Check className="w-3 h-3 text-accent-foreground" />
                  </div>
                )}

                {/* Mini preview */}
                <div className="relative">
                  <ThemeMiniPreview theme={theme} />
                  {isFree && PRO_THEMES.includes(theme.id) && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <div className="flex flex-col items-center gap-1.5">
                        <Lock className="w-5 h-5 text-amber-400" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Pro</span>
                        <span className="text-[10px] text-white/70">Tap to preview</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Name and description */}
                <div className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{theme.name}</h4>
                    {isFree && PRO_THEMES.includes(theme.id) && (
                      <ProBadge feature={`${theme.name} theme`} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {theme.description}
                  </p>
                </div>
              </button>

              {/* Colorway swatches */}
              {isSelected && theme.palettes.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Colorways
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {theme.palettes.map((palette) => {
                      const isActivePalette = paletteId === palette.id
                      return (
                        <button
                          key={palette.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleColorwaySelect(palette)
                          }}
                          className={cn(
                            'relative flex gap-0.5 h-6 rounded overflow-hidden border-2 transition-all',
                            isActivePalette
                              ? 'border-accent ring-1 ring-accent'
                              : 'border-transparent hover:border-muted'
                          )}
                          title={palette.name}
                        >
                          <div
                            className="w-4 h-full"
                            style={{
                              backgroundColor: palette.colors.background,
                            }}
                          />
                          <div
                            className="w-4 h-full"
                            style={{ backgroundColor: palette.colors.cardBg }}
                          />
                          <div
                            className="w-4 h-full"
                            style={{ backgroundColor: palette.colors.text }}
                          />
                          {isActivePalette && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Check className="w-2.5 h-2.5 text-white drop-shadow-sm" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Template thumbnails */}
              {isSelected && (() => {
                const themeTemplates = getTemplatesByTheme(theme.id)
                if (themeTemplates.length === 0) return null
                return (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      Templates
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {themeTemplates.map((template) => {
                        const isApplying = applyingTemplateId === template.id
                        return (
                          <button
                            key={template.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTemplateClick(template)
                            }}
                            disabled={applyingTemplateId !== null}
                            className={cn(
                              'relative h-10 w-7 rounded overflow-hidden border-2 transition-all',
                              'border-transparent hover:border-accent',
                              isApplying && 'border-accent'
                            )}
                            title={template.name}
                          >
                            <Image
                              src={template.thumbnailPath}
                              alt={template.name}
                              fill
                              className="object-cover"
                              sizes="28px"
                            />
                            {isApplying && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <Loader2 className="w-3 h-3 text-white animate-spin" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>
          )
        })}
      </div>
    </div>

    {/* Template apply confirmation dialog */}
    <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apply Template?</AlertDialogTitle>
          <AlertDialogDescription>
            You have {usePageStore.getState().cards.length} existing card
            {usePageStore.getState().cards.length === 1 ? '' : 's'}. What would you like to do?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="outline"
            onClick={() => pendingTemplate && applyTemplate(pendingTemplate, 'add')}
          >
            Add to my page
          </AlertDialogAction>
          <AlertDialogAction
            onClick={() => pendingTemplate && applyTemplate(pendingTemplate, 'replace')}
          >
            Replace my page
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

// ---------------------------------------------------------------------------
// ThemePresets – exported root, manages view state + AnimatePresence
// ---------------------------------------------------------------------------

type View =
  | { type: 'categories' }
  | { type: 'detail'; categoryId: CategoryId }

export function ThemePresets({ initialThemeId }: { initialThemeId?: string | null }) {
  // If an initialThemeId is provided, open the category that contains it
  const initialView = (): View => {
    if (initialThemeId) {
      const cat = THEME_CATEGORIES.find(c => (c.themeIds as readonly string[]).includes(initialThemeId))
      if (cat) return { type: 'detail', categoryId: cat.id as CategoryId }
    }
    return { type: 'categories' }
  }
  const [view, setView] = useState<View>(initialView)
  // Track navigation direction for slide animation
  const [direction, setDirection] = useState<1 | -1>(1)

  const handleSelectCategory = (categoryId: CategoryId) => {
    setDirection(1)
    setView({ type: 'detail', categoryId })
  }

  const handleBack = () => {
    setDirection(-1)
    setView({ type: 'categories' })
  }

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        {view.type === 'categories' ? (
          <motion.div
            key="categories"
            custom={direction}
            initial={{ x: direction === -1 ? '-100%' : '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction === 1 ? '-100%' : '100%', opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
          >
            <CategorySelectionView onSelectCategory={handleSelectCategory} />
          </motion.div>
        ) : (
          <motion.div
            key={view.categoryId}
            custom={direction}
            initial={{ x: direction === 1 ? '100%' : '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction === -1 ? '100%' : '-100%', opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
          >
            <CategoryDetailView
              categoryId={view.categoryId}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
