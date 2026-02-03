// src/app/api/oembed/bandcamp/route.ts
// Server-side proxy for Bandcamp oEmbed to avoid CORS issues

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  // Validate it's a bandcamp URL
  if (!url.includes('bandcamp.com')) {
    return NextResponse.json({ error: 'Invalid Bandcamp URL' }, { status: 400 })
  }

  try {
    const oembedUrl = `https://bandcamp.com/api/oembed?url=${encodeURIComponent(url)}&format=json`
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'LinkLobby/1.0',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Bandcamp oEmbed request failed' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Extract the embed iframe src from the HTML response
    const srcMatch = data.html?.match(/src="([^"]+)"/)
    const embedUrl = srcMatch?.[1] || null

    return NextResponse.json({
      embedUrl,
      thumbnailUrl: data.thumbnail_url,
      title: data.title,
      width: data.width,
      height: data.height,
    })
  } catch (error) {
    console.error('Bandcamp oEmbed proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Bandcamp oEmbed' },
      { status: 500 }
    )
  }
}
