# Quick Task 030: Expand Social Icons - All Platforms with Brand Icons

**Task:** expand-social-icons-all-platforms-brand-icons
**Type:** feature
**Estimated context:** ~40%

---

## Objective

Expand social icon support to cover all major platforms artists use, replacing generic icons with proper brand SVGs. Currently only 5 platforms are supported (Instagram, TikTok, YouTube, Spotify, Twitter) and TikTok/Spotify use generic music icons.

**Purpose:** Artists "never miss anyone's icons" - comprehensive platform coverage with recognizable brand icons.

**Output:**
- react-icons package installed (includes Simple Icons)
- SocialPlatform type expanded to 25+ platforms
- URL detection patterns for Linktree import
- Proper brand icons throughout UI

---

## Context

@.planning/quick/029-analyze-social-icons-implementation-and-/029-SUMMARY.md

**Files to modify:**
- `src/types/profile.ts` - SocialPlatform type and SOCIAL_PLATFORMS config
- `src/components/editor/social-icon-picker.tsx` - PLATFORM_ICONS mapping and UI
- `src/components/cards/social-icons-card.tsx` - Icon rendering
- `src/lib/import/linktree-mapper.ts` - URL patterns and type mapping

---

## Tasks

### Task 1: Install react-icons and Update Types

**Files:** `package.json`, `src/types/profile.ts`

**Action:**

1. Install react-icons package:
   ```bash
   npm install react-icons
   ```

2. Update `SocialPlatform` type in `src/types/profile.ts` to include all platforms:
   ```typescript
   export type SocialPlatform =
     // Current Big 5
     | 'instagram' | 'tiktok' | 'youtube' | 'spotify' | 'twitter'
     // Music platforms
     | 'soundcloud' | 'applemusic' | 'bandcamp' | 'deezer' | 'amazonmusic'
     // Social platforms
     | 'facebook' | 'threads' | 'bluesky' | 'snapchat' | 'pinterest' | 'linkedin' | 'whatsapp'
     // Streaming
     | 'twitch' | 'kick'
     // Community
     | 'discord'
     // Other
     | 'website' | 'email' | 'patreon' | 'venmo' | 'cashapp' | 'paypal'
   ```

3. Update `SOCIAL_PLATFORMS` config object with all new platforms:
   - Each platform needs: label, placeholder URL
   - All platforms enabled: true
   - Group by category in the config for clarity

**Verify:** `npm run build` succeeds, no TypeScript errors

**Done:** SocialPlatform type includes 25+ platforms, SOCIAL_PLATFORMS has config for all

---

### Task 2: Update Icon Picker with Brand Icons

**Files:** `src/components/editor/social-icon-picker.tsx`, `src/components/cards/social-icons-card.tsx`

**Action:**

1. Replace Lucide imports with react-icons Simple Icons (Si prefix) in `social-icon-picker.tsx`:
   ```typescript
   import {
     SiInstagram, SiTiktok, SiYoutube, SiSpotify,
     SiX, SiSoundcloud, SiApplemusic, SiBandcamp,
     SiDeezer, SiAmazonmusic, SiFacebook, SiThreads,
     SiBluesky, SiSnapchat, SiPinterest, SiLinkedin,
     SiWhatsapp, SiTwitch, SiKick, SiDiscord,
     SiPatreon, SiVenmo, SiCashapp, SiPaypal
   } from 'react-icons/si'
   import { Globe, Mail } from 'lucide-react'  // Keep Lucide for generic icons
   ```

2. Update `PLATFORM_ICONS` to use brand icons:
   - Map each SocialPlatform to its Si icon
   - Use Globe for 'website', Mail for 'email'
   - Twitter maps to SiX (the new X logo)

3. Update icon picker grid to use categories (tabs or sections):
   - Music: SoundCloud, Apple Music, Bandcamp, Deezer, Amazon Music, Spotify
   - Social: Instagram, TikTok, Twitter/X, Facebook, Threads, Bluesky, Snapchat, Pinterest, LinkedIn, WhatsApp
   - Streaming: YouTube, Twitch, Kick
   - Community: Discord
   - Other: Website, Email, Patreon, Venmo, CashApp, PayPal

4. Update `social-icons-card.tsx`:
   - Import PLATFORM_ICONS (already does this)
   - The icon rendering logic works with any component, just ensure className="w-6 h-6" is applied

**Verify:**
- Open Header > Social Icons in editor
- All platform icons show correct brand icons
- TikTok shows TikTok logo (not generic music)
- Spotify shows Spotify logo (not generic music)

**Done:** All platforms have recognizable brand icons in picker and display

---

### Task 3: Add URL Detection Patterns for Import

**Files:** `src/lib/import/linktree-mapper.ts`

**Action:**

1. Expand `SOCIAL_PROFILE_PATTERNS` array to include detection for all new platforms:

   ```typescript
   // SoundCloud
   { platform: 'soundcloud', patterns: [/soundcloud\.com\/[a-zA-Z0-9_-]+\/?$/i] },

   // Apple Music
   { platform: 'applemusic', patterns: [/music\.apple\.com\/.*\/artist\//i] },

   // Bandcamp
   { platform: 'bandcamp', patterns: [/[a-zA-Z0-9_-]+\.bandcamp\.com\/?$/i] },

   // Deezer
   { platform: 'deezer', patterns: [/deezer\.com\/.*\/artist\//i] },

   // Amazon Music
   { platform: 'amazonmusic', patterns: [/music\.amazon\..*\/artists\//i] },

   // Facebook
   { platform: 'facebook', patterns: [
     /facebook\.com\/(?!watch|events|groups)[a-zA-Z0-9.]+\/?$/i,
     /fb\.com\/[a-zA-Z0-9.]+\/?$/i
   ]},

   // Threads
   { platform: 'threads', patterns: [/threads\.net\/@?[a-zA-Z0-9_.]+\/?$/i] },

   // Bluesky
   { platform: 'bluesky', patterns: [/bsky\.app\/profile\/[a-zA-Z0-9._-]+/i] },

   // Snapchat
   { platform: 'snapchat', patterns: [
     /snapchat\.com\/add\/[a-zA-Z0-9_-]+/i,
     /snapchat\.com\/t\/[a-zA-Z0-9_-]+/i
   ]},

   // Pinterest
   { platform: 'pinterest', patterns: [/pinterest\.com\/[a-zA-Z0-9_-]+\/?$/i] },

   // LinkedIn
   { platform: 'linkedin', patterns: [/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i] },

   // WhatsApp
   { platform: 'whatsapp', patterns: [
     /wa\.me\/[0-9]+/i,
     /api\.whatsapp\.com\/send/i
   ]},

   // Twitch
   { platform: 'twitch', patterns: [/twitch\.tv\/[a-zA-Z0-9_]+\/?$/i] },

   // Kick
   { platform: 'kick', patterns: [/kick\.com\/[a-zA-Z0-9_]+\/?$/i] },

   // Discord
   { platform: 'discord', patterns: [
     /discord\.gg\/[a-zA-Z0-9]+/i,
     /discord\.com\/invite\/[a-zA-Z0-9]+/i
   ]},

   // Patreon
   { platform: 'patreon', patterns: [/patreon\.com\/[a-zA-Z0-9_]+\/?$/i] },

   // Venmo
   { platform: 'venmo', patterns: [/venmo\.com\/[a-zA-Z0-9_-]+\/?$/i] },

   // CashApp
   { platform: 'cashapp', patterns: [/cash\.app\/\$[a-zA-Z0-9_]+/i] },

   // PayPal
   { platform: 'paypal', patterns: [/paypal\.me\/[a-zA-Z0-9_]+/i] }
   ```

2. Expand `LINKTREE_SOCIAL_TYPE_MAP` to include any Linktree-specific type strings:
   ```typescript
   'FACEBOOK': 'facebook',
   'DISCORD': 'discord',
   'TWITCH': 'twitch',
   'SNAPCHAT': 'snapchat',
   'LINKEDIN': 'linkedin',
   'WHATSAPP': 'whatsapp',
   'PINTEREST': 'pinterest',
   'SOUNDCLOUD': 'soundcloud',
   'PATREON': 'patreon',
   // etc.
   ```

**Verify:**
- Import a Linktree with various platform links
- Social icons auto-detected for all supported platforms
- Console logs show correct platform detection

**Done:** Linktree import detects all 25+ platforms from URLs

---

## Verification

1. **Visual check:** Open editor, go to Header > Social Icons > Add Icon
   - All platforms visible with correct brand icons
   - TikTok and Spotify show brand logos, not generic music icons

2. **Add test:** Add one icon from each category
   - Icon appears in preview with correct brand icon

3. **Import test:** Import a Linktree with diverse platform links
   - All supported platforms auto-detected as social icons

---

## Success Criteria

- [ ] react-icons package installed
- [ ] SocialPlatform type includes 25+ platforms
- [ ] All platforms have proper brand icons (no generic music icons)
- [ ] Icon picker shows categorized platform selection
- [ ] Linktree import detects all platforms from URLs
- [ ] Existing Instagram/YouTube/Twitter icons still work (backward compatible)
- [ ] npm run build succeeds with no TypeScript errors
