// src/lib/video-embed.ts
import getVideoId from 'get-video-id'

export interface VideoEmbedInfo {
  id: string
  service: 'youtube' | 'vimeo' | 'tiktok' | 'instagram'
  thumbnailUrl: string
  embedUrl: string
  title?: string
  isVertical?: boolean  // True for TikTok and Instagram Reels (9:16 aspect ratio)
}

export async function parseVideoUrl(url: string): Promise<VideoEmbedInfo> {
  // Check for Instagram URLs first (before get-video-id)
  const instagramMatch = url.match(/instagram\.com\/(p|reel|reels)\/([a-zA-Z0-9_-]+)/)
  if (instagramMatch) {
    const isReel = instagramMatch[1] === 'reel' || instagramMatch[1] === 'reels'
    return getInstagramInfo(instagramMatch[2], isReel)
  }

  const result = getVideoId(url)

  if (!result.id || !result.service) {
    throw new Error('Invalid video URL. Supported platforms: YouTube, Vimeo, TikTok, Instagram')
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
  // Extract video ID from URL pattern: /video/([0-9]+)
  const videoIdMatch = url.match(/\/video\/([0-9]+)/)
  const videoId = videoIdMatch?.[1] || url

  // Try TikTok oEmbed for thumbnail
  let thumbnailUrl = ''
  let title = ''
  try {
    const response = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
    )
    if (response.ok) {
      const data = await response.json()
      thumbnailUrl = data.thumbnail_url || ''
      title = data.title || ''
    }
  } catch {
    // oEmbed failed, continue without thumbnail
  }

  return {
    id: videoId,
    service: 'tiktok',
    thumbnailUrl,
    embedUrl: url,
    title,
    isVertical: true, // TikTok videos are always 9:16
  }
}

function getInstagramInfo(postId: string, isReel: boolean): VideoEmbedInfo {
  // Instagram oEmbed requires access token - use direct embed instead
  return {
    id: postId,
    service: 'instagram',
    thumbnailUrl: '', // No reliable thumbnail without API access
    embedUrl: `https://www.instagram.com/p/${postId}/embed/`,
    isVertical: isReel, // Only reels are vertical (9:16), regular posts can be any aspect
  }
}
