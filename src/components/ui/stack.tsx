'use client'

import { motion, useMotionValue, useTransform, type PanInfo } from 'motion/react'
import { useState, useEffect } from 'react'

interface CardRotateProps {
  children: React.ReactNode
  onSendToBack: () => void
  sensitivity: number
}

function CardRotate({ children, onSendToBack, sensitivity }: CardRotateProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Dramatic 3D rotation - card tilts as you drag
  const rotateX = useTransform(y, [-100, 100], [60, -60])
  const rotateY = useTransform(x, [-100, 100], [-60, 60])

  // Scale up slightly when dragging to show it's "lifting" off
  const scale = useTransform(
    [x, y],
    ([latestX, latestY]: number[]) => {
      const distance = Math.sqrt(latestX * latestX + latestY * latestY)
      return 1 + Math.min(distance / 500, 0.1)
    }
  )

  function handleDragEnd(_: unknown, info: PanInfo) {
    // If dragged far enough in any direction, send to back
    if (
      Math.abs(info.offset.x) > sensitivity ||
      Math.abs(info.offset.y) > sensitivity
    ) {
      onSendToBack()
    }
    // Always reset position (spring back)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      className="w-full h-full cursor-grab active:cursor-grabbing"
      style={{ x, y, rotateX, rotateY, scale }}
      drag
      dragConstraints={false}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      {children}
    </motion.div>
  )
}

interface StackProps {
  images: { url: string; caption?: string; link?: string }[]
  randomRotation?: boolean
  sensitivity?: number
  cardDimensions?: { width: number; height: number }
  autoplay?: boolean
  autoplayDelay?: number
  pauseOnHover?: boolean
}

export function Stack({
  images,
  randomRotation = false,
  sensitivity = 50,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = true,
}: StackProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  // Initialize with 0 rotation for SSR consistency, apply random after mount
  const [stack, setStack] = useState(() =>
    images.map((img, index) => ({
      id: index + 1,
      ...img,
      randomRotation: 0, // Always 0 for SSR
    }))
  )

  // Mark as mounted (client-side only)
  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Apply random rotation only after hydration
  useEffect(() => {
    if (hasMounted && randomRotation) {
      setStack(prev =>
        prev.map(card => ({
          ...card,
          randomRotation: Math.random() * 10 - 5,
        }))
      )
    }
  }, [hasMounted, randomRotation])

  // Sync with images prop (only after mounted to avoid hydration issues)
  useEffect(() => {
    if (!hasMounted) return
    setStack(
      images.map((img, index) => ({
        id: index + 1,
        ...img,
        randomRotation: randomRotation ? Math.random() * 10 - 5 : 0,
      }))
    )
  }, [images, hasMounted])

  const sendToBack = (id: number) => {
    setStack((prev) => {
      const newStack = [...prev]
      const index = newStack.findIndex((card) => card.id === id)
      if (index === -1) return prev
      const [card] = newStack.splice(index, 1)
      // Give it a new random rotation when it goes to back
      card.randomRotation = randomRotation ? Math.random() * 10 - 5 : 0
      newStack.unshift(card)
      return newStack
    })
  }

  // Autoplay effect
  useEffect(() => {
    if (autoplay && stack.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        setStack((prev) => {
          const newStack = [...prev]
          const topCard = newStack.pop()
          if (topCard) {
            topCard.randomRotation = randomRotation ? Math.random() * 10 - 5 : 0
            newStack.unshift(topCard)
          }
          return newStack
        })
      }, autoplayDelay)

      return () => clearInterval(interval)
    }
  }, [autoplay, autoplayDelay, stack.length, isPaused, randomRotation])

  if (stack.length === 0) return null

  return (
    <div
      className="relative w-full h-full touch-none overflow-visible"
      style={{ perspective: 600 }}
      data-no-dnd="true"
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {stack.map((card, index) => {
        const isTop = index === stack.length - 1

        return (
          <motion.div
            key={card.id}
            className="absolute"
            animate={{
              rotateZ: (stack.length - index - 1) * 4 + card.randomRotation,
              scale: 1 + index * 0.06 - stack.length * 0.06,
              zIndex: index,
            }}
            initial={false}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            style={{
              transformOrigin: '90% 90%',
              width: '85%',
              height: '85%',
              left: '50%',
              top: '50%',
              marginLeft: '-42.5%',
              marginTop: '-42.5%',
            }}
          >
            {isTop ? (
              <CardRotate
                onSendToBack={() => sendToBack(card.id)}
                sensitivity={sensitivity}
              >
                <div className="rounded-xl overflow-hidden w-full h-full shadow-lg">
                  <img
                    src={card.url}
                    alt={card.caption || `Image ${card.id}`}
                    className="w-full h-full object-cover pointer-events-none select-none"
                    draggable={false}
                  />
                </div>
              </CardRotate>
            ) : (
              <div className="rounded-xl overflow-hidden w-full h-full shadow-lg">
                <img
                  src={card.url}
                  alt={card.caption || `Image ${card.id}`}
                  className="w-full h-full object-cover pointer-events-none select-none"
                  draggable={false}
                />
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
