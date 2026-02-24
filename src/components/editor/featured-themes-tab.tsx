'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { getTemplate } from '@/lib/templates'
import { getTheme } from '@/lib/themes'
import type { ThemeId } from '@/types/theme'
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
}

export function FeaturedThemesTab({ onNavigateToTheme }: FeaturedThemesTabProps) {
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
            <motion.div
              key={template.id}
              className={cn(
                'flex flex-col rounded-lg border-2 border-border bg-card overflow-hidden',
                'transition-colors hover:border-accent'
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
              </div>

              {/* Card info */}
              <div className="p-2.5 flex flex-col gap-0.5">
                <span className="text-xs font-medium leading-tight truncate">
                  {template.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {themeName}
                </span>
                <button
                  onClick={() => onNavigateToTheme(template.themeId)}
                  className="text-[10px] text-accent hover:underline text-left mt-1 w-fit"
                >
                  Explore theme
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
