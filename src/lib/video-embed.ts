// src/lib/video-embed.ts
import getVideoId from 'get-video-id'

export interface VideoEmbedInfo {
  id: string
  service: 'youtube' | 'vimeo' | 'tiktok'
  thumbnailUrl: string
  embedUrl: string
  title?: string
}

export async function parseVideoUrl(url: string): Promise<VideoEmbedInfo> {
  const result = getVideoId(url)

  if (!result.id || !result.service) {
    throw new Error('Invalid video URL. Supported platforms: YouTube, Vimeo, TikTok')
  }

  const { id, service } = result

  switch (service) {
    case 'youtube':
      return await getYouTubeInfo(id)
    case 'vimeo':
      return await getVimeoInfo(id)
    case 'tiktok':
      return await getTikTokInfo(url)
    default:
      throw new Error(`Unsupported video service: ${service}`)
  }
}

async function getYouTubeInfo(videoId: string): Promise<VideoEmbedInfo> {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    )

    if (!response.ok) throw new Error('YouTube oEmbed failed')

    const data = await response.json()

    return {
      id: videoId,
      service: 'youtube',
      thumbnailUrl: data.thumbnail_url,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      title: data.title,
    }
  } catch (error) {
    // Fallback: use standard YouTube thumbnail pattern
    return {
      id: videoId,
      service: 'youtube',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
    }
  }
}

async function getVimeoInfo(videoId: string): Promise<VideoEmbedInfo> {
  try {
    const response = await fetch(
      `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`
    )

    if (!response.ok) throw new Error('Vimeo oEmbed failed')

    const data = await response.json()

    return {
      id: videoId,
      service: 'vimeo',
      thumbnailUrl: data.thumbnail_url,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      title: data.title,
    }
  } catch (error) {
    throw new Error('Failed to load Vimeo video. Video may be private or unavailable.')
  }
}

async function getTikTokInfo(url: string): Promise<VideoEmbedInfo> {
  // TikTok oEmbed is unreliable - don't rely on it
  // Extract video ID from URL pattern: /video/([0-9]+)
  const videoIdMatch = url.match(/\/video\/([0-9]+)/)
  const videoId = videoIdMatch?.[1] || url

  return {
    id: videoId,
    service: 'tiktok',
    thumbnailUrl: '', // TikTok embeds are iframe-only, no reliable thumbnail
    embedUrl: url,    // Store full URL (TikTok requires original URL)
  }
}
