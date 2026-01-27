// src/stores/profile-store.ts
import { create } from 'zustand'
import { generateKeyBetween } from 'fractional-indexing'
import type {
  Profile,
  SocialIcon,
  SocialPlatform,
  TitleSize,
  ProfileLayout,
} from '@/types/profile'

/**
 * Sort social icons by their sort key
 */
function sortIconsBySortKey(icons: SocialIcon[]): SocialIcon[] {
  return [...icons].sort((a, b) =>
    a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0
  )
}

/**
 * Generate a sort key for a new icon at the end of the list
 */
function generateAppendKey(icons: SocialIcon[]): string {
  if (icons.length === 0) {
    return generateKeyBetween(null, null)
  }
  const sorted = sortIconsBySortKey(icons)
  const lastKey = sorted[sorted.length - 1].sortKey
  return generateKeyBetween(lastKey, null)
}

/**
 * Generate a sort key after moving an icon to a new position
 */
function generateMoveKey(
  icons: SocialIcon[],
  movedIconId: string,
  newIndex: number
): string {
  const otherIcons = icons.filter((i) => i.id !== movedIconId)
  const sorted = sortIconsBySortKey(otherIcons)

  const above = newIndex > 0 ? sorted[newIndex - 1]?.sortKey ?? null : null
  const below = sorted[newIndex]?.sortKey ?? null

  return generateKeyBetween(above, below)
}

interface ProfileState extends Profile {
  // Tracking
  hasChanges: boolean
  lastSavedAt: number | null

  // Actions
  setDisplayName: (name: string | null) => void
  setBio: (bio: string | null) => void
  setAvatarUrl: (url: string | null) => void
  setAvatarFeather: (feather: number) => void
  setShowAvatar: (show: boolean) => void
  setShowTitle: (show: boolean) => void
  setTitleSize: (size: TitleSize) => void
  setShowLogo: (show: boolean) => void
  setLogoUrl: (url: string | null) => void
  setLogoScale: (scale: number) => void
  setProfileLayout: (layout: ProfileLayout) => void
  setShowSocialIcons: (show: boolean) => void
  addSocialIcon: (platform: SocialPlatform, url: string) => void
  updateSocialIcon: (id: string, updates: Partial<Pick<SocialIcon, 'url' | 'platform'>>) => void
  removeSocialIcon: (id: string) => void
  reorderSocialIcons: (oldIndex: number, newIndex: number) => void
  initializeProfile: (profile: Partial<Profile>) => void
  markSaved: () => void
  getSnapshot: () => Profile
  getSortedSocialIcons: () => SocialIcon[]
}

const defaultProfile: Profile = {
  displayName: null,
  bio: null,
  avatarUrl: null,
  avatarFeather: 0,
  showAvatar: true,
  showTitle: true,
  titleSize: 'large',
  showLogo: false,
  logoUrl: null,
  logoScale: 100,
  profileLayout: 'classic',
  showSocialIcons: true,
  socialIcons: [],
}

export const useProfileStore = create<ProfileState>()((set, get) => ({
  // Initial state (defaults)
  ...defaultProfile,
  hasChanges: false,
  lastSavedAt: null,

  setDisplayName: (name) => set({ displayName: name, hasChanges: true }),

  setBio: (bio) => set({ bio: bio, hasChanges: true }),

  setAvatarUrl: (url) => set({ avatarUrl: url, hasChanges: true }),

  setAvatarFeather: (feather) => set({ avatarFeather: feather, hasChanges: true }),

  setShowAvatar: (show) => set({ showAvatar: show, hasChanges: true }),

  setShowTitle: (show) => set({ showTitle: show, hasChanges: true }),

  setTitleSize: (size) => set({ titleSize: size, hasChanges: true }),

  setShowLogo: (show) => set({ showLogo: show, hasChanges: true }),

  setLogoUrl: (url) => set({ logoUrl: url, hasChanges: true }),

  setLogoScale: (scale) => set({ logoScale: scale, hasChanges: true }),

  setProfileLayout: (layout) => set({ profileLayout: layout, hasChanges: true }),

  setShowSocialIcons: (show) => set({ showSocialIcons: show, hasChanges: true }),

  addSocialIcon: (platform, url) =>
    set((state) => {
      const newIcon: SocialIcon = {
        id: crypto.randomUUID(),
        platform,
        url,
        sortKey: generateAppendKey(state.socialIcons),
      }
      return {
        socialIcons: [...state.socialIcons, newIcon],
        hasChanges: true,
      }
    }),

  updateSocialIcon: (id, updates) =>
    set((state) => ({
      socialIcons: state.socialIcons.map((icon) =>
        icon.id === id ? { ...icon, ...updates } : icon
      ),
      hasChanges: true,
    })),

  removeSocialIcon: (id) =>
    set((state) => ({
      socialIcons: state.socialIcons.filter((icon) => icon.id !== id),
      hasChanges: true,
    })),

  reorderSocialIcons: (oldIndex, newIndex) =>
    set((state) => {
      const sorted = sortIconsBySortKey(state.socialIcons)
      const movedIcon = sorted[oldIndex]
      if (!movedIcon) return state

      const newSortKey = generateMoveKey(state.socialIcons, movedIcon.id, newIndex)

      return {
        socialIcons: state.socialIcons.map((icon) =>
          icon.id === movedIcon.id ? { ...icon, sortKey: newSortKey } : icon
        ),
        hasChanges: true,
      }
    }),

  initializeProfile: (profile) =>
    set({
      ...defaultProfile,
      ...profile,
      hasChanges: false,
      lastSavedAt: null,
    }),

  markSaved: () => set({ hasChanges: false, lastSavedAt: Date.now() }),

  getSnapshot: () => {
    const state = get()
    return {
      displayName: state.displayName,
      bio: state.bio,
      avatarUrl: state.avatarUrl,
      avatarFeather: state.avatarFeather,
      showAvatar: state.showAvatar,
      showTitle: state.showTitle,
      titleSize: state.titleSize,
      showLogo: state.showLogo,
      logoUrl: state.logoUrl,
      logoScale: state.logoScale,
      profileLayout: state.profileLayout,
      showSocialIcons: state.showSocialIcons,
      socialIcons: sortIconsBySortKey(state.socialIcons),
    }
  },

  getSortedSocialIcons: () => sortIconsBySortKey(get().socialIcons),
}))
