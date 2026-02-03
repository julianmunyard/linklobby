"use client"

import { useState } from "react"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProfileStore } from "@/stores/profile-store"
import { useThemeStore } from "@/stores/theme-store"
import { PLATFORM_ICONS } from "./social-icon-picker"
import { SOCIAL_PLATFORMS, type SocialPlatform, type SocialIcon } from "@/types/profile"

/**
 * Editor fields for social icons card.
 * Shows all icons with their URLs and allows editing.
 */
export function SocialIconsCardFields() {
  const socialIcons = useProfileStore((state) => state.socialIcons)
  const getSortedSocialIcons = useProfileStore((state) => state.getSortedSocialIcons)
  const addSocialIcon = useProfileStore((state) => state.addSocialIcon)
  const updateSocialIcon = useProfileStore((state) => state.updateSocialIcon)
  const removeSocialIcon = useProfileStore((state) => state.removeSocialIcon)
  const socialIconSize = useThemeStore((state) => state.socialIconSize)
  const setSocialIconSize = useThemeStore((state) => state.setSocialIconSize)

  const [newPlatform, setNewPlatform] = useState<SocialPlatform | "">("")
  const [newUrl, setNewUrl] = useState("")

  const sortedIcons = getSortedSocialIcons()
  const platforms = Object.entries(SOCIAL_PLATFORMS) as [SocialPlatform, typeof SOCIAL_PLATFORMS[SocialPlatform]][]
  const enabledPlatforms = platforms.filter(([, meta]) => meta.enabled)

  // Get platforms that haven't been added yet
  const availablePlatforms = enabledPlatforms.filter(
    ([platform]) => !sortedIcons.some((icon) => icon.platform === platform)
  )

  function handleAddIcon() {
    if (!newPlatform || !newUrl.trim()) return

    // Normalize URL
    let url = newUrl.trim()
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`
    }

    addSocialIcon(newPlatform, url)
    setNewPlatform("")
    setNewUrl("")
  }

  function handleUpdateUrl(iconId: string, newUrl: string) {
    // Normalize URL
    let url = newUrl.trim()
    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`
    }
    updateSocialIcon(iconId, { url })
  }

  function handleUpdatePlatform(iconId: string, newPlatform: SocialPlatform) {
    updateSocialIcon(iconId, { platform: newPlatform })
  }

  return (
    <div className="space-y-4">
      {/* Icon Size Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Icon Size</Label>
          <span className="text-xs text-muted-foreground">{socialIconSize}px</span>
        </div>
        <Slider
          value={[socialIconSize]}
          onValueChange={(value) => setSocialIconSize(value[0])}
          min={16}
          max={48}
          step={4}
          className="w-full"
        />
      </div>

      <Label>Social Icons</Label>

      {/* List of existing icons */}
      {sortedIcons.length > 0 ? (
        <div className="space-y-3">
          {sortedIcons.map((icon) => {
            const Icon = PLATFORM_ICONS[icon.platform]
            const meta = SOCIAL_PLATFORMS[icon.platform]

            return (
              <div
                key={icon.id}
                className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30"
              >
                {/* Platform selector */}
                <Select
                  value={icon.platform}
                  onValueChange={(value) => handleUpdatePlatform(icon.id, value as SocialPlatform)}
                >
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{meta.label}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {enabledPlatforms.map(([platform, platformMeta]) => {
                      const PlatformIcon = PLATFORM_ICONS[platform]
                      return (
                        <SelectItem key={platform} value={platform}>
                          <div className="flex items-center gap-2">
                            <PlatformIcon className="h-4 w-4" />
                            <span>{platformMeta.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>

                {/* URL input */}
                <Input
                  type="url"
                  value={icon.url}
                  onChange={(e) => handleUpdateUrl(icon.id, e.target.value)}
                  placeholder={meta.placeholder}
                  className="flex-1 h-9"
                />

                {/* Remove button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSocialIcon(icon.id)}
                  className="h-9 w-9 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-2">
          No social icons added yet.
        </p>
      )}

      {/* Add new icon section */}
      {availablePlatforms.length > 0 && (
        <div className="pt-3 border-t space-y-3">
          <Label className="text-sm text-muted-foreground">Add New Icon</Label>
          <div className="flex items-center gap-2">
            {/* Platform selector */}
            <Select
              value={newPlatform}
              onValueChange={(value) => setNewPlatform(value as SocialPlatform)}
            >
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                {availablePlatforms.map(([platform, platformMeta]) => {
                  const PlatformIcon = PLATFORM_ICONS[platform]
                  return (
                    <SelectItem key={platform} value={platform}>
                      <div className="flex items-center gap-2">
                        <PlatformIcon className="h-4 w-4" />
                        <span>{platformMeta.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            {/* URL input */}
            <Input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder={newPlatform ? SOCIAL_PLATFORMS[newPlatform].placeholder : "Select platform first"}
              disabled={!newPlatform}
              className="flex-1 h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newPlatform && newUrl.trim()) {
                  e.preventDefault()
                  handleAddIcon()
                }
              }}
            />

            {/* Add button */}
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={handleAddIcon}
              disabled={!newPlatform || !newUrl.trim()}
              className="h-9 w-9"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {availablePlatforms.length === 0 && sortedIcons.length > 0 && (
        <p className="text-xs text-muted-foreground pt-2">
          All available platforms have been added.
        </p>
      )}
    </div>
  )
}
