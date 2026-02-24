'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
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
import type { TemplateDefinition } from '@/lib/templates'
import type { Card } from '@/types/card'
import type { ThemeState, ThemeId } from '@/types/theme'
import type { Profile } from '@/types/profile'
import { cn } from '@/lib/utils'

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
]

// ---------------------------------------------------------------------------
// FeaturedThemesTab
// ---------------------------------------------------------------------------

interface FeaturedThemesTabProps {
  onNavigateToTheme: (themeId: string) => void
  onTemplateApplied?: () => void
}

export function FeaturedThemesTab({ onNavigateToTheme, onTemplateApplied }: FeaturedThemesTabProps) {
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingTemplate, setPendingTemplate] = useState<TemplateDefinition | null>(null)

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
  // Apply flow (same pattern as TemplatePicker)
  // ---------------------------------------------------------------------------

  async function applyTemplate(template: TemplateDefinition, mode: 'replace' | 'add') {
    setApplyingId(template.id)
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

      // Hydrate stores
      usePageStore.getState().setCards(data.cards)
      useThemeStore.getState().loadFromDatabase(data.theme)
      useProfileStore.getState().initializeProfile(data.profile)

      // CRITICAL: loadFromDatabase and initializeProfile both set hasChanges: false,
      // but applying a template IS a new change that must be persisted via autosave.
      useThemeStore.setState({ hasChanges: true })
      useProfileStore.setState({ hasChanges: true })

      toast.success(`Template "${data.templateName}" applied!`)
      onTemplateApplied?.()
    } catch (err) {
      console.error('[FeaturedThemesTab] apply error:', err)
      toast.error('Failed to apply template. Please try again.')
    } finally {
      setApplyingId(null)
      setPendingTemplate(null)
    }
  }

  // ---------------------------------------------------------------------------
  // Card click handler
  // ---------------------------------------------------------------------------

  function handleCardClick(template: TemplateDefinition) {
    if (applyingId) return // Disable while applying

    const existingCardCount = usePageStore.getState().cards.length

    if (existingCardCount > 0) {
      setPendingTemplate(template)
      setShowConfirm(true)
    } else {
      applyTemplate(template, 'replace')
    }
  }

  // ---------------------------------------------------------------------------
  // Confirmation dialog actions
  // ---------------------------------------------------------------------------

  function handleConfirmReplace() {
    if (!pendingTemplate) return
    applyTemplate(pendingTemplate, 'replace')
  }

  function handleConfirmAdd() {
    if (!pendingTemplate) return
    applyTemplate(pendingTemplate, 'add')
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
          {featuredTemplates.map(({ template, themeName }) => (
            <motion.button
              key={template.id}
              onClick={() => handleCardClick(template)}
              disabled={!!applyingId}
              className={cn(
                'flex flex-col rounded-lg border-2 border-border bg-card text-left overflow-hidden',
                'transition-colors hover:border-accent',
                applyingId && applyingId !== template.id && 'opacity-50 pointer-events-none'
              )}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.12 }}
            >
              {/* Thumbnail */}
              <div className="relative w-full aspect-[9/16] bg-muted">
                <Image
                  src={template.thumbnailPath}
                  alt={template.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 150px"
                />
                {/* Loading overlay */}
                {applyingId === template.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Card info */}
              <div className="p-2.5 flex flex-col gap-0.5">
                <span className="text-xs font-medium leading-tight truncate">
                  {template.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {themeName}
                </span>
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
                  className="text-[10px] text-accent hover:underline text-left mt-1 w-fit"
                >
                  Explore theme
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Confirmation dialog */}
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
              onClick={handleConfirmAdd}
            >
              Add to my page
            </AlertDialogAction>
            <AlertDialogAction onClick={handleConfirmReplace}>
              Replace my page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
