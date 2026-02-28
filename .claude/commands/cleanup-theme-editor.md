# Theme Editor Cleanup

Clean up the editor UI for a specific theme so only relevant options are shown.

## Input
The user will tell you which theme to clean up and what sections/options to remove or keep. Theme IDs are defined in `src/types/theme.ts`.

## What This Involves

For a given theme, you may need to modify one or more of these areas:

### 1. Add Link Menu (`src/components/editor/cards-tab.tsx`)
- Limit which card types appear in the "Add Link" dropdown for this theme
- Pattern: define a `const THEMENAME_CARD_TYPES` array and add a branch in the `DropdownMenuContent` render (see existing `IPOD_CARD_TYPES`, `PHONE_HOME_CARD_TYPES`, `MAC_CARD_TYPES` for examples)

### 2. Card Property Editor (`src/components/editor/card-property-editor.tsx`)
- Hide fields that don't apply to cards on this theme (Title, Description, Link URL, Image, Link Size, Text Align, Vertical Align, Transparent Background, Font/Size/Color, etc.)
- Pattern: add an early-return simplified editor (see `isIpodSimple` and `isVcrSimple` patterns ~line 370) OR add theme checks to existing conditional blocks
- Key boolean flags at ~line 294: `isMacCard`, `isPhoneHome`, `isAudioCard`, `isEmailCard`, `isReleaseCard`
- Main form sections and their line ranges (approximate):
  - Visibility toggle: ~line 517
  - Title/Description/URL: ~line 539
  - Link Type Picker: ~line 619
  - Card-type-specific fields (audio, music, video, gallery, etc.): ~line 650+
  - Image upload: ~line 796
  - Link Size: ~line 809
  - Text Align + Vertical Align: ~line 840
  - Font Size / Text Color / Font picker: ~line 916
  - Border & Fill (text cards): ~line 988
  - Transparent Background: ~line 1013
  - Type-specific fields (hero, horizontal, square, link): ~line 1051+

### 3. Title Edit / Header Section (`src/components/editor/design-panel.tsx`)
- The "Title Edit" tab in the Design panel (tab id: `'header'`, starts ~line 226)
- Hide profile sections that don't apply (Profile Photo, Layout, Logo, Bio, Text Color, Social Icons, etc.)
- Pattern: add theme to the simplified branch (see VCR/iPod pattern ~line 227) or add `!isThemeName &&` guards around sections
- Sections in the full header editor:
  - Profile Photo (~line 293)
  - Layout toggle (~line 346)
  - Display Name (~line 355)
  - Chaotic Zine title controls (~line 370)
  - Logo (~line 400)
  - Bio (~line 431)
  - Header Text Color (~line 444)
  - Social Icons (~line 463)

### 4. Design Panel Tabs (`src/components/editor/design-panel.tsx`)
- Hide entire design sub-tabs that don't apply (Fonts is already hidden for some themes via `FIXED_FONT_THEMES` ~line 48)
- Filter in `visibleTabs` memo (~line 68)

### 5. Theme-Specific Card Fields
- Audio card: `src/components/editor/audio-card-fields.tsx`
- Release card: `src/components/editor/release-card-fields.tsx`
- Email collection: `src/components/editor/email-collection-fields.tsx`
- Music card: `src/components/editor/music-card-fields.tsx`

### 6. Style Controls (`src/components/editor/style-controls.tsx`)
- Hide style options that don't apply to the theme

### 7. Interactive Elements in Theme Layout
- Make tapping on title/header areas open the Title Edit panel via `postMessage({ type: 'OPEN_DESIGN_TAB', payload: { tab: 'header' } })`
- Make tapping on cards open their editor via `postMessage({ type: 'SELECT_CARD', payload: { cardId: card.id } })`
- Theme layouts are in `src/components/cards/` (e.g., `ipod-classic-layout.tsx`, `phone-home-layout.tsx`)

## Process

1. Ask the user which theme to clean up and what to keep/remove
2. Read the current state of relevant files
3. Make the changes, following existing patterns for theme-specific conditionals
4. Type-check with `npx tsc --noEmit` (ignore pre-existing errors in `next.config.ts` and `supabase/public.ts`)
5. Summarize what was changed

## Available Themes
`mac-os` | `instagram-reels` | `system-settings` | `blinkies` | `vcr-menu` | `ipod-classic` | `receipt` | `macintosh` | `word-art` | `phone-home` | `chaotic-zine` | `artifact`
