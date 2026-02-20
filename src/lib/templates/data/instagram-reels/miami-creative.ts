// Auto-generated template — Instagram Reels "Miami Creative"
// Teal-and-pink palette with lush, tropical warmth — smooth jazz energy.
import type { TemplateDefinition } from '../../types'

export const instagramReelsMiamiCreative: TemplateDefinition = {
  id: 'instagram-reels-miami-creative',
  themeId: 'instagram-reels',
  name: 'Miami Creative',
  description: 'Lush teal-and-pink palette with tropical warmth',
  energyLabel: 'smooth',
  thumbnailPath: '/templates/instagram-reels-miami-creative/thumbnail.jpg',

  cards: [
    // Hero card
    {
      card_type: 'hero',
      title: 'YOUR NAME',
      description: 'Composer · Producer',
      url: null,
      content: {
        showButton: true,
        buttonText: 'Explore',
        buttonStyle: 'primary',
      },
      size: 'big',
      position: 'center',
      sortKey: 'a0',
      is_visible: true,
    },

    // Two half-width square cards
    {
      card_type: 'square',
      title: 'Latest Release',
      description: 'Out now',
      url: 'https://open.spotify.com/',
      content: {},
      size: 'small',
      position: 'left',
      sortKey: 'a1',
      is_visible: true,
    },
    {
      card_type: 'square',
      title: 'Visuals',
      description: 'Watch',
      url: 'https://youtube.com/',
      content: {},
      size: 'small',
      position: 'right',
      sortKey: 'a2',
      is_visible: true,
    },

    // Gallery card
    {
      card_type: 'gallery',
      title: 'Recents',
      description: null,
      url: null,
      content: {
        images: [],
        displayMode: 'carousel',
      },
      size: 'big',
      position: 'center',
      sortKey: 'a3',
      is_visible: true,
    },

    // Video card
    {
      card_type: 'video',
      title: 'Live Session',
      description: null,
      url: null,
      content: {
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        platform: 'youtube',
      },
      size: 'big',
      position: 'center',
      sortKey: 'a4',
      is_visible: true,
    },

    // Music embed
    {
      card_type: 'music',
      title: null,
      description: null,
      url: null,
      content: {
        platform: 'spotify',
        embedUrl: 'https://open.spotify.com/track/6IRVovQruBNy9PIqOnAxFf',
        embedIframeUrl: 'https://open.spotify.com/embed/track/6IRVovQruBNy9PIqOnAxFf',
        embedHeight: 152,
        embeddable: true,
      },
      size: 'big',
      position: 'center',
      sortKey: 'a5',
      is_visible: true,
    },

    // Events
    {
      card_type: 'horizontal',
      title: 'Upcoming Shows',
      description: 'Tickets & info',
      url: 'https://example.com/shows',
      content: {
        iconName: 'Calendar',
      },
      size: 'big',
      position: 'center',
      sortKey: 'a6',
      is_visible: true,
    },

    // Social icons at bottom
    {
      card_type: 'social-icons',
      title: null,
      description: null,
      url: null,
      content: {},
      size: 'big',
      position: 'center',
      sortKey: 'a7',
      is_visible: true,
    },
  ],

  theme: {
    themeId: 'instagram-reels',
    paletteId: 'ig-miami-vice',
    colors: {
      background: 'oklch(0.55 0.12 195)',
      cardBg: 'oklch(0.92 0.04 195)',
      text: 'oklch(0.15 0 0)',
      accent: 'oklch(0.7 0.2 350)',
      border: 'oklch(0.92 0.04 195)',
      link: 'oklch(0.15 0 0)',
    },
    fonts: {
      heading: 'var(--font-bebas-neue)',
      body: 'var(--font-sora)',
      headingSize: 1.3,
      bodySize: 1,
      headingWeight: 'bold',
    },
    style: {
      borderRadius: 16,
      shadowEnabled: false,
      blurIntensity: 0,
    },
    background: {
      type: 'solid',
      value: 'oklch(0.55 0.12 195)',
    },
    cardTypeFontSizes: {
      hero: 1.2,
      square: 1.1,
      horizontal: 1,
      link: 1,
      mini: 1,
      text: 1,
      gallery: 1,
      video: 1,
    },
    socialIconSize: 32,
    centerCards: false,
    scatterMode: false,
    visitorDrag: false,
  },

  profile: {
    profileLayout: 'classic',
    displayName: 'YOUR NAME',
    bio: 'Composer · Producer',
    showAvatar: true,
    showTitle: true,
    titleSize: 'large',
    showSocialIcons: true,
    showLogo: false,
    headerTextColor: '#ffffff',
    socialIconColor: '#ffffff',
    socialIcons: [
      { id: 'tpl-1', platform: 'instagram', url: 'https://instagram.com/', sortKey: 'a0' },
      { id: 'tpl-2', platform: 'tiktok', url: 'https://tiktok.com/', sortKey: 'a1' },
      { id: 'tpl-3', platform: 'spotify', url: 'https://open.spotify.com/', sortKey: 'a2' },
      { id: 'tpl-4', platform: 'youtube', url: 'https://youtube.com/', sortKey: 'a3' },
      { id: 'tpl-5', platform: 'soundcloud', url: 'https://soundcloud.com/', sortKey: 'a4' },
    ],
  },

  mediaAssets: [],
} as const satisfies TemplateDefinition
