// Auto-generated template — Instagram Reels "Terminal"
// Green-on-black terminal aesthetic with monospace fonts — atmospheric, ambient.
import type { TemplateDefinition } from '../../types'

export const instagramReelsTerminalHacker: TemplateDefinition = {
  id: 'instagram-reels-terminal-hacker',
  themeId: 'instagram-reels',
  name: 'Terminal',
  description: 'Green-on-black terminal aesthetic with monospace type',
  energyLabel: 'electronic',
  thumbnailPath: '/templates/instagram-reels-terminal-hacker/thumbnail.jpg',

  cards: [
    // Text block — atmospheric intro
    {
      card_type: 'text',
      title: '> WELCOME',
      description: null,
      url: null,
      content: {
        body: '// producer · composer · sound designer\n// currently accepting commissions\n// type "play" to begin_',
      },
      size: 'big',
      position: 'center',
      sortKey: 'a0',
      is_visible: true,
    },

    // Latest release — horizontal link
    {
      card_type: 'horizontal',
      title: '> LATEST_RELEASE.wav',
      description: 'streaming everywhere',
      url: 'https://soundcloud.com/',
      content: {
        iconName: 'Terminal',
      },
      size: 'big',
      position: 'center',
      sortKey: 'a1',
      is_visible: true,
    },

    // Catalogue
    {
      card_type: 'horizontal',
      title: '> CATALOGUE',
      description: 'full discography',
      url: 'https://example.com/music',
      content: {
        iconName: 'HardDrive',
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

    // Contact
    {
      card_type: 'horizontal',
      title: '> CONTACT',
      description: 'bookings & collabs',
      url: 'mailto:name@example.com',
      content: {
        iconName: 'Mail',
      },
      size: 'big',
      position: 'center',
      sortKey: 'a4',
      is_visible: true,
    },

    // Video
    {
      card_type: 'video',
      title: '> SESSION.mp4',
      description: null,
      url: null,
      content: {
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        platform: 'youtube',
      },
      size: 'big',
      position: 'center',
      sortKey: 'a5',
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
      sortKey: 'a6',
      is_visible: true,
    },
  ],

  theme: {
    themeId: 'instagram-reels',
    paletteId: 'ig-terminal',
    colors: {
      background: 'oklch(0.14 0.03 150)',
      cardBg: 'oklch(0.14 0.03 150)',
      text: 'oklch(0.85 0.2 145)',
      accent: 'oklch(0.75 0.2 145)',
      border: 'oklch(0.14 0.03 150)',
      link: 'oklch(0.85 0.2 145)',
    },
    fonts: {
      heading: 'var(--font-space-mono)',
      body: 'var(--font-space-mono)',
      headingSize: 1,
      bodySize: 0.9,
      headingWeight: 'bold',
    },
    style: {
      borderRadius: 0,
      shadowEnabled: false,
      blurIntensity: 0,
    },
    background: {
      type: 'solid',
      value: 'oklch(0.14 0.03 150)',
      noiseOverlay: true,
      noiseIntensity: 8,
    },
    cardTypeFontSizes: {
      hero: 1,
      square: 1,
      horizontal: 0.95,
      link: 1,
      mini: 1,
      text: 1.05,
      gallery: 1,
      video: 1,
    },
    socialIconSize: 20,
    centerCards: false,
    scatterMode: false,
    visitorDrag: false,
  },

  profile: {
    profileLayout: 'classic',
    displayName: 'PRODUCER_NAME',
    bio: '> ambient · electronic · sound design',
    showAvatar: false,
    showTitle: true,
    titleSize: 'large',
    showSocialIcons: true,
    showLogo: false,
    headerTextColor: null,
    socialIconColor: null,
    socialIcons: [
      { id: 'tpl-1', platform: 'soundcloud', url: 'https://soundcloud.com/', sortKey: 'a0' },
      { id: 'tpl-2', platform: 'youtube', url: 'https://youtube.com/', sortKey: 'a1' },
      { id: 'tpl-3', platform: 'twitter', url: 'https://twitter.com/', sortKey: 'a2' },
      { id: 'tpl-4', platform: 'discord', url: 'https://discord.gg/', sortKey: 'a3' },
    ],
  },

  mediaAssets: [],
} as const satisfies TemplateDefinition
