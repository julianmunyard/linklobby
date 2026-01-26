"use client"

import { useState, useRef } from "react"
import { Camera, User, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useProfileStore } from "@/stores/profile-store"
import { ImageCropDialog } from "@/components/shared/image-crop-dialog"
import { uploadProfileImage, type ProfileImageType } from "@/lib/supabase/storage"
import { createClient } from "@/lib/supabase/client"
import type { TitleStyle, TitleSize, ProfileLayout } from "@/types/profile"

export function HeaderSection() {
  // Profile store state
  const displayName = useProfileStore((state) => state.displayName)
  const avatarUrl = useProfileStore((state) => state.avatarUrl)
  const titleStyle = useProfileStore((state) => state.titleStyle)
  const titleSize = useProfileStore((state) => state.titleSize)
  const logoUrl = useProfileStore((state) => state.logoUrl)
  const profileLayout = useProfileStore((state) => state.profileLayout)

  // Profile store actions
  const setDisplayName = useProfileStore((state) => state.setDisplayName)
  const setAvatarUrl = useProfileStore((state) => state.setAvatarUrl)
  const setTitleStyle = useProfileStore((state) => state.setTitleStyle)
  const setTitleSize = useProfileStore((state) => state.setTitleSize)
  const setLogoUrl = useProfileStore((state) => state.setLogoUrl)
  const setProfileLayout = useProfileStore((state) => state.setProfileLayout)

  // Local state for crop dialog
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [imageType, setImageType] = useState<ProfileImageType>("avatar")

  // File input refs
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection for avatar
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
      setImageType("avatar")
      setCropDialogOpen(true)
    }
    reader.readAsDataURL(file)

    // Reset input so same file can be selected again
    e.target.value = ""
  }

  // Handle file selection for logo
  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
      setImageType("logo")
      setCropDialogOpen(true)
    }
    reader.readAsDataURL(file)

    // Reset input so same file can be selected again
    e.target.value = ""
  }

  // Handle crop completion
  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploading(true)

    try {
      // Get current user ID
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        console.error("Not authenticated")
        return
      }

      // Upload to Supabase storage
      const result = await uploadProfileImage(croppedBlob, user.id, imageType)

      // Update store with new URL
      if (imageType === "avatar") {
        setAvatarUrl(result.url)
      } else {
        setLogoUrl(result.url)
      }
    } catch (error) {
      console.error("Failed to upload image:", error)
    } finally {
      setIsUploading(false)
      setSelectedImage(null)
    }
  }

  return (
    <section className="space-y-6">
      {/* Section header */}
      <div className="border-b pb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Header
        </h2>
      </div>

      {/* Profile Photo */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Profile Photo</Label>
        <div className="flex items-center gap-4">
          {/* Avatar circle */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            {/* Edit overlay button */}
            <Button
              size="icon"
              variant="secondary"
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploading}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Profile Layout */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Layout</Label>
        <ToggleGroup
          type="single"
          value={profileLayout}
          onValueChange={(value) => {
            if (value) setProfileLayout(value as ProfileLayout)
          }}
          className="justify-start"
        >
          <ToggleGroupItem value="classic" aria-label="Classic layout">
            Classic
          </ToggleGroupItem>
          <ToggleGroupItem value="hero" aria-label="Hero layout">
            Hero
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Title Style */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Title Style</Label>
        <ToggleGroup
          type="single"
          value={titleStyle}
          onValueChange={(value) => {
            if (value) setTitleStyle(value as TitleStyle)
          }}
          className="justify-start"
        >
          <ToggleGroupItem value="text" aria-label="Text title">
            Text
          </ToggleGroupItem>
          <ToggleGroupItem value="logo" aria-label="Logo title">
            Logo
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Conditional fields based on title style */}
      {titleStyle === "text" ? (
        <>
          {/* Display Name */}
          <div className="space-y-3">
            <Label htmlFor="display-name" className="text-sm font-medium">
              Display Name
            </Label>
            <Input
              id="display-name"
              value={displayName || ""}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
            />
          </div>

          {/* Title Size */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Title Size</Label>
            <ToggleGroup
              type="single"
              value={titleSize}
              onValueChange={(value) => {
                if (value) setTitleSize(value as TitleSize)
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="small" aria-label="Small title">
                Small
              </ToggleGroupItem>
              <ToggleGroupItem value="large" aria-label="Large title">
                Large
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </>
      ) : (
        /* Logo Upload */
        <div className="space-y-3">
          <Label className="text-sm font-medium">Logo</Label>
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-16 max-w-[200px] object-contain"
                />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoFileSelect}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Image Crop Dialog */}
      {selectedImage && (
        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          initialAspect={imageType === "avatar" ? 1 : undefined}
        />
      )}
    </section>
  )
}
