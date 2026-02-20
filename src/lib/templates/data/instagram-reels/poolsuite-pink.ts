// Auto-generated template — Instagram Reels "Poolsuite Pink"
// Warm blush tones with elegant serif typography — smooth, ambient feel.
import type { TemplateDefinition } from '../../types'

export const instagramReelsPoolsuitePink: TemplateDefinition = {
  id: 'instagram-reels-poolsuite-pink',
  themeId: 'instagram-reels',
  name: 'Poolsuite Pink',
  description: 'Warm blush tones with elegant serif typography',
  energyLabel: 'ambient',
  thumbnailPath: '/templates/instagram-reels-poolsuite-pink/thumbnail.jpg',

  cards: [
    // Hero card
    {
      card_type: 'hero',
      title: 'YOUR NAME',
      description: 'Ambient · Downtempo · Jazz',
      url: null,
      content: {
        showButton: true,
        buttonText: 'Listen Now',
        buttonStyle: 'primary',
      },
      size: 'big',
      position: 'center',
      sortKey: 'a0',
      is_visible: true,
    },

    // Gallery card — photos
    {
      card_type: 'gallery',
      title: 'Gallery',
      description: null,
      url: null,
      content: {
        images: [],
        displayMode: 'carousel',
      },
      size: 'big',
      position: 'center',
      sortKey: 'a1',
      is_visible: true,
    },

    // Latest single — horizontal link
    {
      card_type: 'horizontal',
      title: 'New Single Out Now',
      description: 'Stream on all platforms',
      url: 'https://open.spotify.com/',
      content: {
        iconName: 'Music',
      },
      size: 'big',
      position: 'center',
      sortKey: 'a2',
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
      sortKey: 'a3',
      is_visible: true,
    },

    // Merch link
    {
      card_type: 'horizontal',
      title: 'Shop',
      description: 'Limited edition drops',
      url: 'https://example.com/merch',
      content: {
        iconName: 'ShoppingBag',
      },
      size: 'big',
      position: 'center',
      sortKey: 'a4',
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
      sortKey: 'a5',
      is_visible: true,
    },
  ],

  theme: {
    themeId: 'instagram-reels',
    paletteId: 'ig-poolsuite-pink',
    colors: {
      background: 'oklch(0.88 0.04 20)',
      cardBg: 'oklch(0.95 0.02 80)',
      text: 'oklch(0.15 0 0)',
      accent: 'oklch(0.65 0.18 45)',
      border: 'oklch(0.95 0.02 80)',
      link: 'oklch(0.15 0 0)',
    },
    fonts: {
      heading: 'var(--font-instrument)',
      body: 'var(--font-dm-sans)',
      headingSize: 1.2,
      bodySize: 1,
      headingWeight: 'normal',
    },
    style: {
      borderRadius: 12,
      shadowEnabled: false,
      blurIntensity: 0,
    },
    background: {
      type: 'solid',
      value: 'oklch(0.88 0.04 20)',
    },
    cardTypeFontSizes: {
      hero: 1.1,
      square: 1,
      horizontal: 1,
      link: 1,
      mini: 1,
      text: 1,
      gallery: 1,
      video: 1,
    },
    socialIconSize: 28,
    centerCards: false,
    scatterMode: false,
    visitorDrag: false,
  },

  profile: {
    profileLayout: 'hero',
    displayName: 'YOUR NAME',
    bio: 'Ambient · Downtempo · Jazz',
    showAvatar: true,
    showTitle: true,
    titleSize: 'large',
    showSocialIcons: true,
    showLogo: false,
    headerTextColor: null,
    socialIconColor: null,
    socialIcons: [
      { id: 'tpl-1', platform: 'instagram', url: 'https://instagram.com/', sortKey: 'a0' },
      { id: 'tpl-2', platform: 'spotify', url: 'https://open.spotify.com/', sortKey: 'a1' },
      { id: 'tpl-3', platform: 'tiktok', url: 'https://tiktok.com/', sortKey: 'a2' },
    ],
  },

  mediaAssets: [],
} as const satisfies TemplateDefinition
