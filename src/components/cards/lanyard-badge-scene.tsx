'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { useGLTF, useTexture, Environment, Lightformer, Html } from '@react-three/drei'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three'
import type { Card } from '@/types/card'
import { LanyardCardViews } from './lanyard-badge-card-views'

// Register meshline components
extend({ MeshLineGeometry, MeshLineMaterial })

interface LanyardBadgeSceneProps {
  cards: Card[]
  title: string
  activeView: number
  onViewChange: (view: number) => void
  avatarUrl?: string | null
  isPreview?: boolean
  onCardClick?: (cardId: string) => void
  lanyardColor?: string
}

interface BandProps {
  cards: Card[]
  title: string
  activeView: number
  onViewChange: (view: number) => void
  avatarUrl?: string | null
  isPreview?: boolean
  onCardClick?: (cardId: string) => void
  lanyardColor?: string
  isMobile: boolean
}

export function LanyardBadgeScene({
  cards,
  title,
  activeView,
  onViewChange,
  avatarUrl,
  isPreview = false,
  onCardClick,
  lanyardColor = '#e94560',
}: LanyardBadgeSceneProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="lanyard-wrapper" style={{ width: '100%', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 0, 37], fov: 25 }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: false }}
      >
        <color attach="background" args={['#1a1a2e']} />
        <ambientLight intensity={0.5} />
        <Physics gravity={[0, -40, 0]} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            cards={cards}
            title={title}
            activeView={activeView}
            onViewChange={onViewChange}
            avatarUrl={avatarUrl}
            isPreview={isPreview}
            onCardClick={onCardClick}
            lanyardColor={lanyardColor}
            isMobile={isMobile}
          />
        </Physics>
        <Environment background={false}>
          <Lightformer intensity={2} position={[0, 5, -5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={2} position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} position={[0, 0, -5]} scale={[10, 100, 1]} />
        </Environment>
      </Canvas>
    </div>
  )
}

function Band({
  cards,
  title,
  activeView,
  onViewChange,
  avatarUrl,
  isPreview,
  onCardClick,
  lanyardColor,
  isMobile,
}: BandProps) {
  const band = useRef<any>(null)
  const fixed = useRef<any>(null)
  const j1 = useRef<any>(null)
  const j2 = useRef<any>(null)
  const j3 = useRef<any>(null)
  const card = useRef<any>(null)

  const vec = new THREE.Vector3()
  const ang = new THREE.Vector3()
  const rot = new THREE.Vector3()
  const dir = new THREE.Vector3()

  const segmentProps = {
    type: 'dynamic' as const,
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  }

  // Load 3D model and texture
  const gltf = useGLTF('/models/card.glb') as any
  const nodes = gltf.nodes || {}
  const materials = gltf.materials || {}
  const texture = useTexture('/images/lanyard-band.png')

  // Catmull-Rom curve for smooth rope
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
      ])
  )

  const [dragged, drag] = useState<THREE.Vector3 | false>(false)
  const [hovered, hover] = useState(false)

  // Physics joints
  // @ts-ignore - rapier joint API
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  // @ts-ignore - rapier joint API
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  // @ts-ignore - rapier joint API
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  // @ts-ignore - rapier joint API
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.5, 0]])

  // Cursor management
  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab'
      return () => {
        document.body.style.cursor = 'auto'
      }
    }
  }, [hovered, dragged])

  // Animation loop
  useFrame((state, delta) => {
    if (dragged && card.current) {
      // Kinematic dragging
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      })
    }

    if (fixed.current) {
      // Lerp joint positions for smooth rope
      const minSpeed = 0
      const maxSpeed = 50
      ;[j1, j2].forEach((ref) => {
        if (!ref.current.lerped) {
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
        }
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
        )
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        )
      })

      // Update rope curve
      curve.points[0].copy(j3.current.translation())
      curve.points[1].copy(j2.current.lerped)
      curve.points[2].copy(j1.current.lerped)
      curve.points[3].copy(fixed.current.translation())

      if (band.current && band.current.geometry) {
        band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32))
      }

      // Apply angular damping to card
      if (card.current) {
        ang.copy(card.current.angvel())
        rot.copy(card.current.rotation())
        card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
      }
    }
  })

  // Curve type and texture settings
  curve.curveType = 'chordal'
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping

  return (
    <>
      <group position={[0, 4, 0]}>
        {/* @ts-ignore - rapier ref types */}
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        {/* @ts-ignore - rapier ref types */}
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        {/* @ts-ignore - rapier ref types */}
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        {/* @ts-ignore - rapier ref types */}
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        {/* @ts-ignore - rapier ref types */}
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: any) => {
              e.target.releasePointerCapture(e.pointerId)
              drag(false)
            }}
            onPointerDown={(e: any) => {
              e.target.setPointerCapture(e.pointerId)
              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current.translation()))
              )
            }}
          >
            {/* Card mesh - use simple white material so HTML content shows through */}
            <mesh geometry={nodes.card?.geometry}>
              <meshStandardMaterial color="#f5f2eb" opacity={0.95} transparent />
            </mesh>

            {/* Clip mesh */}
            {nodes.clip?.geometry && (
              <mesh geometry={nodes.clip.geometry} material={materials.metal} />
            )}

            {/* Clamp mesh */}
            {nodes.clamp?.geometry && (
              <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
            )}

            {/* HTML overlay for card content */}
            <Html
              transform
              occlude="blending"
              position={[0, 0, 0.01]}
              scale={0.035}
              rotation={[0, 0, 0]}
              style={{ pointerEvents: 'auto' }}
            >
              <LanyardCardViews
                cards={cards}
                activeView={activeView}
                onViewChange={onViewChange}
                title={title}
                avatarUrl={avatarUrl}
                isPreview={isPreview}
                onCardClick={onCardClick}
              />
            </Html>
          </group>
        </RigidBody>
      </group>

      {/* Rope/lanyard mesh */}
      <mesh ref={band}>
        {/* @ts-ignore - meshline custom geometry */}
        <meshLineGeometry />
        {/* @ts-ignore - meshline custom material */}
        <meshLineMaterial
          color={lanyardColor}
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  )
}
