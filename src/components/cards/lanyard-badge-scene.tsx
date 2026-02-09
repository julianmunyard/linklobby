/* eslint-disable react/no-unknown-property */
'use client'

import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { useGLTF, useTexture, Environment, Lightformer, Html } from '@react-three/drei'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three'
import type { Card } from '@/types/card'
import { LanyardCardViews } from './lanyard-badge-card-views'

// Register meshline components with R3F
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
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768
  )

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position: [0, 0, 13], fov: 20 }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
      >
        <ambientLight intensity={Math.PI} />
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
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  )
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
  maxSpeed?: number
  minSpeed?: number
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
  maxSpeed = 50,
  minSpeed = 0,
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
    colliders: false as const,
    angularDamping: 4,
    linearDamping: 4,
  }

  const { nodes, materials } = useGLTF('/models/card.glb') as any
  const texture = useTexture('/images/lanyard-band.png')

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  )

  const [dragged, drag] = useState<any>(false)
  const [hovered, hover] = useState(false)

  // @ts-ignore - rapier joint API
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  // @ts-ignore
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  // @ts-ignore
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  // @ts-ignore
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.5, 0]])

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab'
      return () => void (document.body.style.cursor = 'auto')
    }
  }, [hovered, dragged])

  useFrame((state, delta) => {
    if (dragged) {
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
      ;[j1, j2].forEach((ref) => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
        )
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        )
      })

      curve.points[0].copy(j3.current.translation())
      curve.points[1].copy(j2.current.lerped)
      curve.points[2].copy(j1.current.lerped)
      curve.points[3].copy(fixed.current.translation())
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32))

      ang.copy(card.current.angvel())
      rot.copy(card.current.rotation())
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
    }
  })

  curve.curveType = 'chordal'
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
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
            onPointerUp={(e: any) => (
              e.target.releasePointerCapture(e.pointerId), drag(false)
            )}
            onPointerDown={(e: any) => (
              e.target.setPointerCapture(e.pointerId),
              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current.translation()))
              )
            )}
          >
            {/* Card mesh - cream paper material */}
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                color="#f5f2eb"
                clearcoat={isMobile ? 0 : 0.4}
                clearcoatRoughness={0.4}
                roughness={0.8}
                metalness={0.05}
              />
            </mesh>

            {/* Clip mesh */}
            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
            />

            {/* Clamp mesh */}
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />

            {/* HTML overlay for card content - positioned on the card face */}
            <Html
              transform
              occlude="blending"
              position={[0, 0.523, 0.01]}
              scale={0.155}
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
        {/* @ts-ignore */}
        <meshLineGeometry />
        {/* @ts-ignore */}
        <meshLineMaterial
          color="white"
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
