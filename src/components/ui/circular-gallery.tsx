'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface CircularGalleryProps {
  images: string[]
  scrollEase?: number
  scrollSpeed?: number
  borderRadius?: number
  bend?: number
  className?: string
}

export function CircularGallery({
  images,
  scrollEase = 0.15,
  scrollSpeed = 4.6,
  borderRadius = 0,
  bend = 10,
  className,
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef(0)
  const targetScrollRef = useRef(0)
  const rafRef = useRef<number | undefined>(undefined)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      targetScrollRef.current += e.deltaY * scrollSpeed * 0.01
    }

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true)
      setStartX(e.clientX)
      setCurrentX(e.clientX)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      setCurrentX(e.clientX)
      const delta = (e.clientX - startX) * scrollSpeed * 0.1
      targetScrollRef.current -= delta
      setStartX(e.clientX)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    const handleTouchStart = (e: TouchEvent) => {
      setIsDragging(true)
      setStartX(e.touches[0].clientX)
      setCurrentX(e.touches[0].clientX)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      setCurrentX(e.touches[0].clientX)
      const delta = (e.touches[0].clientX - startX) * scrollSpeed * 0.1
      targetScrollRef.current -= delta
      setStartX(e.touches[0].clientX)
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
    }

    const animate = () => {
      // Smooth scroll animation
      scrollRef.current += (targetScrollRef.current - scrollRef.current) * scrollEase

      // Apply transform to images with circular bend effect
      const imageElements = container.querySelectorAll('[data-gallery-image]')
      imageElements.forEach((element, index) => {
        const htmlElement = element as HTMLElement
        const offset = scrollRef.current + index * 360 / images.length
        const angle = (offset * Math.PI) / 180

        // Circular positioning with bend effect
        const radius = bend * 10
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius - radius
        const rotateY = -offset

        htmlElement.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${rotateY}deg)`
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd)

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [images.length, scrollEase, scrollSpeed, bend, isDragging, startX])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing',
        className
      )}
      style={{
        perspective: '1000px',
        perspectiveOrigin: '50% 50%',
      }}
    >
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            data-gallery-image
            className="absolute top-0 left-1/2 w-64 h-64 -ml-32"
            style={{
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
          >
            <div
              className="relative w-full h-full overflow-hidden"
              style={{
                borderRadius: `${borderRadius}px`,
              }}
            >
              <Image
                src={image}
                alt={`Gallery image ${index + 1}`}
                fill
                className="object-cover"
                sizes="256px"
                draggable={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
