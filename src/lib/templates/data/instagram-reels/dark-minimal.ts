// src/lib/templates/data/instagram-reels/dark-minimal.ts
// Instagram Reels "Dark Minimal" template — clean dark aesthetic with bold typography.

import type { TemplateDefinition } from '../../types'

export const instagramReelsDarkMinimal: TemplateDefinition = {
  id: 'instagram-reels-dark-minimal',
  themeId: 'instagram-reels',
  name: 'Dark Minimal',
  description: 'Clean dark aesthetic with bold typography',
  energyLabel: 'minimal',
  thumbnailPath: '/templates/instagram-reels-dark-minimal/thumbnail.jpg',

  cards: [
    // Hero card — full-width, artist name + image
    {
      card_type: 'hero',
      title: 'YOUR NAME',
      description: 'Artist / Producer',
      url: 'https://open.spotify.com/artist/',
      content: {
        imageUrl: '/templates/instagram-reels-dark-minimal/hero.jpg',
        imageAlt: 'Artist photo',
        showButton: true,
        buttonText: 'Stream Now',
        buttonStyle: 'primary',
        textColor: '#ffffff',
      },
      size: 'big',
      position: 'center',
      sortKey: 'a0',
      is_visible: true,
    },

    // Latest Release — horizontal link card
    {
      card_type: 'horizontal',
      title: 'Latest Release',
      description: 'Out now on all platforms',
      url: 'https://open.spotify.com/album/',
      content: {
        iconName: 'Music',
        textColor: '#ffffff',
      },
      size: 'big',
      position: 'center',
      sortKey: 'a1',
      is_visible: true,
    },

    // Tour Dates — horizontal link card
    {
      card_type: 'horizontal',
      title: 'Tour Dates',
      description: 'Find tickets near you',
      url: 'https://bandsintown.com/',
      content: {
        iconName: 'MapPin',
        textColor: '#ffffff',
      },
      size: 'big',
      position: 'center',
      sortKey: 'a2',
      is_visible: true,
    },

    // Music embed — Spotify player
    {
      card_type: 'music',
      title: null,
      description: null,
      url: null,
      content: {
        platform: 'spotify',
        embedUrl: 'https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy',
        embedIframeUrl: 'https://open.spotify.com/embed/album/4aawyAB9vmqN3uQ7FjRGTy',
        embedHeight: 352,
        embeddable: true,
      },
      size: 'big',
      position: 'center',
      sortKey: 'a3',
      is_visible: true,
    },

    // Social icons card — links to profiles
    {
      card_type: 'social-icons',
      title: null,
      description: null,
      url: null,
      content: {},
      size: 'big',
      position: 'center',
      sortKey: 'a4',
      is_visible: true,
    },
  ],

  // Theme state matching instagram-reels defaults (dark minimal palette)
  theme: {
    themeId: 'instagram-reels',
    paletteId: 'ig-dark',
    colors: {
      background: 'oklch(0 0 0)',
      cardBg: 'oklch(0 0 0)',
      text: 'oklch(0.95 0 0)',
      accent: 'oklch(0.65 0.28 25)',
      border: 'oklch(0.95 0 0)',
      link: 'oklch(0.95 0 0)',
    },
    fonts: {
      heading: 'var(--font-chikarego)',
      body: 'var(--font-chikarego)',
      headingSize: 1.1,
      bodySize: 1,
      headingWeight: 'bold',
    },
    style: {
      borderRadius: 0,
      shadowEnabled: false,
      blurIntensity: 0,
    },
    background: {
      type: 'solid',
      value: 'oklch(0 0 0)',
    },
    cardTypeFontSizes: {
      hero: 1,
      square: 1,
      horizontal: 1,
      link: 1,
      mini: 1,
      text: 1,
      gallery: 1,
      video: 1,
    },
    socialIconSize: 24,
    centerCards: false,
    scatterMode: false,
    visitorDrag: false,
  },

  // Profile display defaults
  profile: {
    profileLayout: 'classic',
    showAvatar: true,
    showTitle: true,
    showSocialIcons: true,
  },

  // Media assets that need to be uploaded when template is applied
  mediaAssets: ['hero.jpg'],
}
