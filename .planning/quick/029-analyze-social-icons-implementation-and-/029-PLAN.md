---
quick_task: 029
name: analyze-social-icons-implementation-and-improvements
type: research
autonomous: true
files_analyzed:
  - src/lib/import/linktree-scraper.ts
  - src/lib/import/linktree-mapper.ts
  - src/types/linktree.ts
  - src/types/profile.ts
  - src/stores/profile-store.ts
  - src/components/editor/linktree-import-dialog.tsx
  - src/components/editor/social-icon-picker.tsx
  - src/components/cards/social-icons-card.tsx
---

<objective>
Analyze the social icons implementation across the codebase to understand:
1. How social icons are extracted during Linktree import
2. How they're stored and displayed
3. What improvements could enhance the feature

This is a READ-ONLY analysis task - no code changes.
</objective>

<context>
@.planning/STATE.md
@src/lib/import/linktree-mapper.ts
@src/types/profile.ts
@src/components/cards/social-icons-card.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Document Social Icons Data Flow</name>
  <files>Analysis only - no file modifications</files>
  <action>
Create a comprehensive analysis document covering:

## 1. LINKTREE IMPORT EXTRACTION

### Source 1: Linktree's socialLinks Array
- Location: `__NEXT_DATA__.props.pageProps.socialLinks`
- Schema: `LinktreeSocialLinkSchema` in `src/types/linktree.ts`
- Contains explicit social icons from Linktree's dedicated social section
- Type mapping in `LINKTREE_SOCIAL_TYPE_MAP`:
  - INSTAGRAM -> instagram
  - TIKTOK -> tiktok
  - YOUTUBE -> youtube
  - SPOTIFY -> spotify
  - TWITTER/X -> twitter

### Source 2: URL Pattern Detection in Regular Links
- `SOCIAL_PROFILE_PATTERNS` in `linktree-mapper.ts` detects profile URLs
- Distinguishes profile URLs from content URLs:
  - Instagram: `/username` but NOT `/p/`, `/reel/`, `/stories/`
  - TikTok: `/@username` (profile only, not videos)
  - YouTube: `/@channel`, `/channel/`, `/c/`, `/user/` (not `/watch`, `/shorts`)
  - Spotify: `/artist/` only (not `/track`, `/album`, `/playlist`)
  - Twitter/X: `/username` (not `/status/`, `/i/`)

### Deduplication Logic
- `mapLinktreeToCards()` processes `socialLinks` array first
- Then scans regular links for profile URLs
- Checks `alreadyHave = detectedSocialIcons.some(s => s.platform === platform)`
- Prevents duplicate platforms from appearing twice

## 2. STORAGE MODEL

### Profile Store (`src/stores/profile-store.ts`)
- `socialIcons: SocialIcon[]` - array in profile state
- SocialIcon interface:
  ```typescript
  {
    id: string           // crypto.randomUUID()
    platform: SocialPlatform  // 'instagram' | 'tiktok' | 'youtube' | 'spotify' | 'twitter'
    url: string
    sortKey: string      // Fractional indexing for drag-reorder
  }
  ```
- Persisted via `/api/profile` endpoint with rest of profile data
- Sorted by `sortKey` using `fractional-indexing` library

### Social Icons Card
- Card type: `social-icons`
- Acts as a container/placeholder in the card flow
- Auto-created when first social icon is added
- Uses profile store data, not card content (content is empty `{}`)

## 3. DISPLAY IMPLEMENTATION

### SocialIconsCard Component
- Renders icons from `getSortedSocialIcons()` selector
- Uses `PLATFORM_ICONS` mapping from Lucide:
  - Instagram -> `Instagram`
  - YouTube -> `Youtube`
  - Twitter -> `Twitter`
  - Spotify -> `Music` (closest match)
  - TikTok -> `Music2` (closest match)
- Respects `showSocialIcons` toggle
- Applies `headerTextColor` if set
- Shows placeholder in editor when hidden/empty

### UI Features
- Drag-reorderable via dnd-kit
- Two-step add dialog (platform -> URL)
- URL auto-normalization (adds https://)

## 4. IMPROVEMENT OPPORTUNITIES

### A. Icon Fidelity (HIGH IMPACT)
**Problem:** TikTok and Spotify use generic music icons
**Solution:** Use brand-specific SVG icons
- Options: simple-icons, react-icons, or custom SVGs
- Would require replacing Lucide icons with proper brand icons

### B. More Platforms (MEDIUM IMPACT)
**Current:** Big 5 only (Instagram, TikTok, YouTube, Spotify, Twitter)
**Missing common platforms:**
- SoundCloud (artists)
- Apple Music
- Bandcamp
- Discord
- Twitch
- Facebook
- LinkedIn
- Threads
- Bluesky
- Pinterest
- Snapchat

### C. URL Pattern Coverage (MEDIUM IMPACT)
**Current patterns may miss:**
- Instagram shortlinks (instagr.am variations)
- YouTube Shorts channel URLs
- New Threads URLs
- Regional variants (e.g., TikTok regional domains)

### D. Import UX Improvements (LOW-MEDIUM)
- Show preview of detected social icons before import
- Allow user to select which icons to import
- Better feedback on what was detected vs skipped

### E. Display Customization (LOW-MEDIUM)
- Icon size options (small/medium/large)
- Icon style options (filled/outline/colored)
- Custom ordering beyond drag-drop
- Icon labels option (show platform name)

### F. Validation Improvements (LOW)
- Validate URLs actually resolve
- Check if profile exists (without blocking)
- Handle redirect URLs (e.g., bit.ly -> instagram)
  </action>
  <verify>Analysis document created in summary</verify>
  <done>Complete understanding of social icons implementation documented</done>
</task>

</tasks>

<verification>
- All key files analyzed
- Data flow from import to display understood
- Improvement opportunities identified with impact ratings
</verification>

<success_criteria>
Analysis complete with:
1. Clear documentation of how social icons flow through the system
2. Specific improvement suggestions with impact ratings
3. No code changes (analysis only)
</success_criteria>

<output>
After analysis, output findings directly in response (no SUMMARY file needed for research task).
</output>
