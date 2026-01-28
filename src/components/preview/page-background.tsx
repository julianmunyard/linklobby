'use client'

import { useEffect, useRef } from 'react'
import { useThemeStore } from '@/stores/theme-store'

export function PageBackground() {
  const { background } = useThemeStore()
  const videoRef = useRef<HTMLVideoElement>(null)

  // Intersection Observer for video performance
  useEffect(() => {
    const video = videoRef.current
    if (!video || background.type !== 'video') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Autoplay blocked, silently fail
          })
        } else {
          video.pause()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [background.type])

  if (background.type === 'solid') {
    return (
      <div
        className="fixed inset-0 -z-10"
        style={{ backgroundColor: background.value }}
      />
    )
  }

  if (background.type === 'image' && background.value) {
    return (
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${background.value})` }}
      />
    )
  }

  if (background.type === 'video' && background.value) {
    return (
      <video
        ref={videoRef}
        className="fixed inset-0 -z-10 w-full h-full object-cover"
        src={background.value}
        muted
        loop
        playsInline
        autoPlay
      />
    )
  }

  // Fallback to theme background color
  return (
    <div className="fixed inset-0 -z-10 bg-theme-background" />
  )
}
