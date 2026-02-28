'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Lock, Plus, ArrowLeft, Loader2 } from 'lucide-react'
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
import { getTemplate } from '@/lib/templates'
import { getTheme } from '@/lib/themes'
import { usePageStore } from '@/stores/page-store'
import { useThemeStore } from '@/stores/theme-store'
import { useProfileStore } from '@/stores/profile-store'
import { useActiveTemplate } from '@/components/editor/dev-template-saver'
import type { TemplateDefinition } from '@/lib/templates'
import type { ThemeId } from '@/types/theme'
import type { Card } from '@/types/card'
import type { ThemeState } from '@/types/theme'
import type { Profile } from '@/types/profile'
import { cn } from '@/lib/utils'
import { usePlanTier } from '@/contexts/plan-tier-context'
import { PRO_THEMES } from '@/lib/stripe/plans'

// ---------------------------------------------------------------------------
// "Create Your Own" starter themes — each points to a starter template
// ---------------------------------------------------------------------------

const STARTER_THEMES = [
  {
    id: 'mac-os' as const,
    label: 'Mac OS',
    description: 'Clean, modern link page',
    templateId: 'mac-os-my-mac', // TODO: replace with dev template ID
    preview: '/templates/previews/mac-os-my-mac.mp4',
    poster: '/templates/mac-os-my-mac/thumbnail.jpg',
  },
  {
    id: 'instagram-reels' as const,
    label: 'Instagram',
    description: 'Bold, card-based layout',
    templateId: 'instagram-reels-cards', // TODO: replace with dev template ID
    preview: '/templates/previews/instagram-reels-cards.mp4',
    poster: '/templates/instagram-reels-cards/thumbnail.jpg',
  },
  {
    id: 'system-settings' as const,
    label: 'System Settings',
    description: 'Minimal, settings-style page',
    templateId: 'system-settings-quite-beskoke', // TODO: replace with dev template ID
    preview: '/templates/previews/system-settings-quite-beskoke.mp4',
    poster: '/templates/system-settings-quite-beskoke/thumbnail.jpg',
  },
]

// ---------------------------------------------------------------------------
// Curated featured template IDs
// ---------------------------------------------------------------------------

const FEATURED_IDS = [
  'phone-home-burple',
  'mac-os-my-mac',
  'instagram-reels-cards',
  'system-settings-quite-beskoke',
  'blinkies-blink-once',
  'vcr-menu-home-video',
  'ipod-classic-your-ipod',
  'macintosh-84-macintosh',
  'word-art-just-word-art',
  'chaotic-zine-simple-new',
  'artifact-brutal',
  'mac-os-white-light',
]

// Video preview paths keyed by template ID
const PREVIEW_VIDEOS: Record<string, string> = {
  'phone-home-burple': '/templates/previews/phone-home-burple.mp4',
  'mac-os-my-mac': '/templates/previews/mac-os-my-mac.mp4',
  'instagram-reels-cards': '/templates/previews/instagram-reels-cards.mp4',
  'system-settings-quite-beskoke': '/templates/previews/system-settings-quite-beskoke.mp4',
  'blinkies-blink-once': '/templates/previews/blinkies-blink-once.mp4',
  'vcr-menu-home-video': '/templates/previews/vcr-menu-home-video.mp4',
  'ipod-classic-your-ipod': '/templates/previews/ipod-classic-your-ipod.mp4',
  'macintosh-84-macintosh': '/templates/previews/macintosh-84-macintosh.mp4',
  'word-art-just-word-art': '/templates/previews/word-art-just-word-art.mp4',
  'chaotic-zine-simple-new': '/templates/previews/chaotic-zine-simple-new.mp4',
  'artifact-brutal': '/templates/previews/artifact-brutal.mp4',
  'mac-os-white-light': '/templates/previews/mac-os-white-light.mp4',
}

// ---------------------------------------------------------------------------
// LazyVideo — only loads/plays when visible in viewport
// ---------------------------------------------------------------------------

function LazyVideo({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = ref.current
        if (!video) return
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0">
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        className={className}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// FeaturedThemesTab
// ---------------------------------------------------------------------------

interface FeaturedThemesTabProps {
  onNavigateToTheme: (themeId: string) => void
  onNavigateToLinks?: () => void
  onNavigateToDesign?: () => void
  onTemplateApplied?: () => void
}

export function FeaturedThemesTab({ onNavigateToTheme, onNavigateToLinks, onNavigateToDesign }: FeaturedThemesTabProps) {
  const { planTier } = usePlanTier()
  const [showStarterPicker, setShowStarterPicker] = useState(false)
  const [showStarterConfirm, setShowStarterConfirm] = useState(false)
  const [pendingStarter, setPendingStarter] = useState<typeof STARTER_THEMES[number] | null>(null)
  const [applyingStarterId, setApplyingStarterId] = useState<string | null>(null)

  const featuredTemplates = useMemo(() => {
    return FEATURED_IDS
      .map((id) => {
        const template = getTemplate(id)
        if (!template) return null
        const theme = getTheme(template.themeId as ThemeId)
        return {
          template,
          themeName: theme?.name ?? template.themeId,
        }
      })
      .filter(Boolean) as { template: NonNullable<ReturnType<typeof getTemplate>>; themeName: string }[]
  }, [])

  // ---------------------------------------------------------------------------
  // Card click handler — navigates to template picker for that theme
  // ---------------------------------------------------------------------------

  function handleCardClick(template: TemplateDefinition) {
    onNavigateToTheme(template.themeId)
  }

  // ---------------------------------------------------------------------------
  // Create Your Own flow — shows starter theme picker
  // ---------------------------------------------------------------------------

  function handleCreateYourOwn() {
    setShowStarterPicker(true)
  }

  function handleStarterClick(starter: typeof STARTER_THEMES[number]) {
    if (applyingStarterId) return

    const existingCardCount = usePageStore.getState().cards.length
    if (existingCardCount > 0) {
      setPendingStarter(starter)
      setShowStarterConfirm(true)
    } else {
      applyStarterTemplate(starter, 'replace')
    }
  }

  async function applyStarterTemplate(starter: typeof STARTER_THEMES[number], mode: 'replace' | 'add') {
    setApplyingStarterId(starter.id)
    setShowStarterConfirm(false)

    try {
      const res = await fetch('/api/templates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: starter.templateId, mode }),
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

      // Hydrate stores
      usePageStore.getState().setCards(data.cards)
      useThemeStore.getState().loadFromDatabase(data.theme)
      useProfileStore.getState().initializeProfile(data.profile)

      useThemeStore.setState({ hasChanges: true })
      useProfileStore.setState({ hasChanges: true })

      toast.success(`${starter.label} template applied — start customising!`)
      useActiveTemplate.getState().setActiveTemplate(starter.templateId)

      // Navigate to links tab so they can start editing
      onNavigateToLinks?.()
    } catch (err) {
      console.error('[FeaturedThemesTab] starter apply error:', err)
      toast.error('Failed to apply template. Please try again.')
    } finally {
      setApplyingStarterId(null)
      setPendingStarter(null)
    }
  }

  if (showStarterPicker) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-4 pb-20">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => setShowStarterPicker(false)}
              className="p-1 -ml-1 rounded-md hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <h3 className="text-base font-semibold">Choose a look</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4 ml-7">
            Pick a starting style — you can customise everything after
          </p>

          <div className="grid grid-cols-3 gap-3">
            {STARTER_THEMES.map((starter) => (
              <motion.button
                key={starter.id}
                onClick={() => handleStarterClick(starter)}
                disabled={!!applyingStarterId}
                className={cn(
                  'flex flex-col rounded-lg border-2 border-border bg-card text-left overflow-hidden',
                  'transition-colors hover:border-accent',
                  applyingStarterId && applyingStarterId !== starter.id && 'opacity-50 pointer-events-none'
                )}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.12 }}
              >
                <div className="relative w-full aspect-[9/16] bg-muted">
                  <LazyVideo
                    src={starter.preview}
                    poster={starter.poster}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {applyingStarterId === starter.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div className="p-2 flex flex-col gap-0.5">
                  <span className="text-xs font-medium leading-tight truncate">
                    {starter.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-snug">
                    {starter.description}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Starter template confirmation dialog (when user has existing cards) */}
        <AlertDialog open={showStarterConfirm} onOpenChange={setShowStarterConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apply {pendingStarter?.label} template?</AlertDialogTitle>
              <AlertDialogDescription>
                You have {usePageStore.getState().cards.length} existing card
                {usePageStore.getState().cards.length === 1 ? '' : 's'}. What would you like to do?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => pendingStarter && applyStarterTemplate(pendingStarter, 'replace')}>
                Replace my page
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 pb-20">
        {/* Heading */}
        <div className="mb-4">
          <h3 className="text-base font-semibold">Featured Themes</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Curated picks to get you started
          </p>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Create Your Own card — first in grid, same phone-style look */}
          <motion.button
            onClick={handleCreateYourOwn}
            className={cn(
              'flex flex-col rounded-lg border-2 border-dashed border-border bg-card text-left overflow-hidden',
              'transition-colors hover:border-accent hover:bg-muted/30',
            )}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.12 }}
          >
            <div className="relative w-full aspect-[9/16] bg-muted/50 flex flex-col items-center justify-center gap-3">
              <div className="rounded-full bg-muted p-3">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            <div className="p-2.5 flex flex-col gap-0.5">
              <span className="text-xs font-medium leading-tight">
                Create Your Own
              </span>
              <span className="text-[10px] text-muted-foreground">
                Pick a look to start with
              </span>
            </div>
          </motion.button>

          {featuredTemplates.map(({ template, themeName }) => (
            <motion.button
              key={template.id}
              onClick={() => handleCardClick(template)}
              className={cn(
                'flex flex-col rounded-lg border-2 border-border bg-card text-left overflow-hidden',
                'transition-colors hover:border-accent'
              )}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.12 }}
            >
              {/* Preview video / thumbnail */}
              <div className="relative w-full aspect-[9/16] bg-muted">
                {PREVIEW_VIDEOS[template.id] ? (
                  <LazyVideo
                    src={PREVIEW_VIDEOS[template.id]}
                    poster={template.thumbnailPath}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={template.thumbnailPath}
                    alt={template.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 150px"
                  />
                )}
                {/* Pro overlay */}
                {planTier === 'free' && PRO_THEMES.includes(template.themeId) ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <div className="flex flex-col items-center gap-1.5">
                      <Lock className="w-5 h-5 text-amber-400" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Pro</span>
                      <span className="text-[10px] text-white/70">Tap to preview</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Card info */}
              <div className="p-2.5 flex items-center justify-between gap-2">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-medium leading-tight truncate">
                    {template.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {themeName}
                  </span>
                </div>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation()
                    onNavigateToTheme(template.themeId)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation()
                      onNavigateToTheme(template.themeId)
                    }
                  }}
                  className="shrink-0 relative rounded-md overflow-hidden p-[2px]"
                >
                  {/* Static border */}
                  <span className="absolute inset-0 rounded-md bg-white/40" />
                  {/* Chasing light overlay */}
                  <span className="absolute inset-0 animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_70%,white_85%,transparent_100%)]" />
                  {/* Inner background */}
                  <span className="relative block bg-white text-black text-[10px] font-semibold px-2.5 py-1.5 rounded-[4px]">
                    Explore
                  </span>
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
