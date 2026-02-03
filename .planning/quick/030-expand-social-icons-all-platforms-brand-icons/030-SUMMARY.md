# Quick Task 030: Expand Social Icons - All Platforms with Brand Icons

**Task:** expand-social-icons-all-platforms-brand-icons
**Type:** feature
**Date:** 2026-02-03
**Duration:** ~10 minutes

## Summary

Expanded social icon support from 5 platforms to 25+, replacing generic icons with proper brand SVGs from react-icons. Artists can now add icons for all major platforms, and Linktree import automatically detects and extracts social profiles.

---

## Changes Made

### 1. Package Installation

Installed `react-icons` package which includes Simple Icons brand SVGs:
- 25+ brand icons available via `react-icons/si`
- Lightweight imports (tree-shaking supported)

### 2. Type System Updates (`src/types/profile.ts`)

Expanded `SocialPlatform` union type to include 25+ platforms:

**Big 5 (existing):**
- Instagram, TikTok, YouTube, Spotify, Twitter/X

**Music Platforms (new):**
- SoundCloud, Apple Music, Bandcamp, Deezer, Amazon Music

**Social Platforms (new):**
- Facebook, Threads, Bluesky, Snapchat, Pinterest, LinkedIn, WhatsApp

**Streaming (new):**
- Twitch, Kick

**Community (new):**
- Discord

**Other (new):**
- Website, Email, Patreon, Venmo, CashApp, PayPal

Updated `SOCIAL_PLATFORMS` config object with metadata for all platforms.

### 3. Icon Picker Updates (`src/components/editor/social-icon-picker.tsx`)

- Replaced Lucide icons with react-icons brand SVGs
- Added `PLATFORM_CATEGORIES` for organized picker UI
- Changed grid from flat 3-column to categorized sections
- Added scrollable max-height for 25+ platforms
- Smaller icons (size-5) and text (text-[10px]) to fit more options

**Categories:**
- Popular (Big 5)
- Music
- Social
- Streaming
- Community & Support
- Other

**Note:** Deezer uses generic Music icon as no brand icon exists in react-icons.

### 4. Import Detection (`src/lib/import/linktree-mapper.ts`)

Expanded `SOCIAL_PROFILE_PATTERNS` with URL detection for all platforms:

| Platform | Pattern Examples |
|----------|------------------|
| SoundCloud | `soundcloud.com/username` |
| Apple Music | `music.apple.com/*/artist/*` |
| Bandcamp | `username.bandcamp.com` |
| Deezer | `deezer.com/*/artist/*` |
| Amazon Music | `music.amazon.*/artists/*` |
| Facebook | `facebook.com/pagename`, `fb.com/pagename` |
| Threads | `threads.net/@username` |
| Bluesky | `bsky.app/profile/handle` |
| Snapchat | `snapchat.com/add/username`, `snapchat.com/t/*` |
| Pinterest | `pinterest.com/username` |
| LinkedIn | `linkedin.com/in/username` |
| WhatsApp | `wa.me/number`, `api.whatsapp.com/send` |
| Twitch | `twitch.tv/username` |
| Kick | `kick.com/username` |
| Discord | `discord.gg/invite`, `discord.com/invite/*` |
| Patreon | `patreon.com/username` |
| Venmo | `venmo.com/username` |
| CashApp | `cash.app/$username` |
| PayPal | `paypal.me/username` |

Expanded `LINKTREE_SOCIAL_TYPE_MAP` to handle all Linktree social type strings.

---

## Files Modified

| File | Changes |
|------|---------|
| `package.json` | Added react-icons dependency |
| `src/types/profile.ts` | Expanded SocialPlatform type and SOCIAL_PLATFORMS config |
| `src/components/editor/social-icon-picker.tsx` | Brand icons, categorized UI, PLATFORM_ICONS mapping |
| `src/lib/import/linktree-mapper.ts` | URL patterns and type mapping for all platforms |

---

## Commits

| Hash | Message |
|------|---------|
| `f9d31e9` | feat(quick-030): add 25+ social platforms with brand icons |
| `502233e` | feat(quick-030): add URL patterns for 25+ platforms in Linktree import |

---

## Verification

- [x] `npm run build` succeeds with no TypeScript errors
- [x] SocialPlatform type includes 25+ platforms
- [x] All platforms have brand icons (except Deezer)
- [x] Icon picker shows categorized platform selection
- [x] URL patterns cover all major platform formats
- [x] Existing Instagram/YouTube/Twitter icons backward compatible

---

## Technical Notes

### Icon Type Compatibility

Created unified `IconComponent` type that works with both react-icons and Lucide:

```typescript
type IconComponent = ComponentType<{ className?: string }>
```

This allows mixing brand icons from react-icons with generic icons from Lucide (Globe for website, Mail for email, Music for Deezer).

### Deezer Limitation

Deezer has no brand icon in Simple Icons/react-icons. Used generic `Music` icon from Lucide as fallback. If brand icon becomes available in future react-icons versions, easy to swap.

### URL Pattern Design

Patterns exclude content URLs (videos, tracks, etc.) to only match profile/channel URLs:
- Instagram: Excludes `/p/`, `/reel/`, `/stories/`
- YouTube: Excludes `/watch`, `/shorts`, `/playlist`
- Spotify: Only matches `/artist/`, not `/track`, `/album`
- Facebook: Excludes `/watch`, `/events`, `/groups`
