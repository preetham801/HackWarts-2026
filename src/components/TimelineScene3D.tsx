import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, type MutableRefObject, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Stars, Tube } from '@react-three/drei'
import * as THREE from 'three'
import { ExpressTrain3D } from './ExpressTrain3D'
import { getTimelineRouteProgress, timelineStationProgress } from '../data/timelineRoute'

const stationStops = timelineStationProgress.map(getTimelineRouteProgress)

const routePoints = [
  new THREE.Vector3(-24, 0, 1.8),
  new THREE.Vector3(-16, 0, 1.2),
  new THREE.Vector3(-8, 0, 0.3),
  new THREE.Vector3(0, 0, -0.8),
  new THREE.Vector3(8, 0, -1.4),
  new THREE.Vector3(16, 0, -0.4),
  new THREE.Vector3(24, 0, 1.1),
]

export type TimelineScene3DProps = {
  progressRef: MutableRefObject<number>
}

export function TimelineScene3D({ progressRef }: TimelineScene3DProps) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(routePoints), [])

  return (
    <Canvas
      className="timeline-canvas"
      aria-hidden="true"
      dpr={[1, 1.5]}
      camera={{ position: [0, 7, 15], fov: 43, near: 0.1, far: 180 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#102137']} />
      <fog attach="fog" args={['#102137', 38, 125]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[-12, 20, 9]} intensity={1.55} color="#e4e5df" />
      <hemisphereLight args={['#c6d7ed', '#273044', 0.72]} />
      <PerspectiveCamera makeDefault position={[0, 7, 15]} fov={43} near={0.1} far={180} />
      <Stars radius={90} depth={55} count={420} factor={2.2} saturation={0} fade speed={0.15} />
      <Suspense fallback={null}><TimelineWorld curve={curve} progressRef={progressRef} /></Suspense>
    </Canvas>
  )
}

function TimelineWorld({ curve, progressRef }: { curve: THREE.CatmullRomCurve3; progressRef: MutableRefObject<number> }) {
  const engineRef = useRef<THREE.Group>(null)

  return (
    <>
      <NightLandscape />
      <RailwayAndStations curve={curve} progressRef={progressRef} />
      <ExpressTrain3D curve={curve} progressRef={progressRef} engineRef={engineRef} />
      <CameraFollow engineRef={engineRef} />
    </>
  )
}

function NightLandscape() {
  const mountains = useMemo(() => [
    [-35, -5, -31, 18, 28, 5], [-21, -8, -38, 12, 20, 4], [-5, -9, -42, 20, 30, 6],
    [15, -10, -39, 16, 25, 5], [34, -5, -32, 19, 29, 6], [-38, -2, -45, 15, 23, 5],
    [-18, -8, -48, 20, 30, 6], [7, -10, -49, 18, 27, 5], [29, -7, -44, 16, 25, 5],
  ] as const, [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]} receiveShadow>
        <planeGeometry args={[150, 130]} />
        <meshStandardMaterial color="#1b2a3a" roughness={0.96} metalness={0.04} />
      </mesh>
      {mountains.map(([x, y, z, radius, height, sides], index) => (
        <mesh key={index} position={[x, y + height / 2, z]} rotation={[0, index % 2 ? 0.22 : -0.18, 0]}>
          <coneGeometry args={[radius, height, sides]} />
        <meshStandardMaterial color={index % 2 ? '#26394b' : '#1d2d3e'} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  )
}

function RailwayAndStations({ curve, progressRef }: { curve: THREE.CatmullRomCurve3; progressRef: MutableRefObject<number> }) {
  const { railCurves, sleepers, stationPoints } = useMemo(() => {
    const sampleCount = 140
    const centers = Array.from({ length: sampleCount + 1 }, (_, index) => curve.getPointAt(index / sampleCount))
    const sideAt = (progress: number) => {
      const tangent = curve.getTangentAt(progress).setY(0).normalize()
      return new THREE.Vector3(tangent.z, 0, -tangent.x).normalize()
    }
    const rails = [-0.76, 0.76].map((offset) => new THREE.CatmullRomCurve3(
      centers.map((point, index) => point.clone().addScaledVector(sideAt(index / sampleCount), offset).setY(0.12)),
    ))
    const tieSteps = 92
    const ties = Array.from({ length: tieSteps }, (_, index) => {
      const progress = index / (tieSteps - 1)
      const point = curve.getPointAt(progress)
      const tangent = curve.getTangentAt(progress)
      return { position: point, rotation: Math.atan2(tangent.x, tangent.z) }
    })
    const stations = stationStops.map((progress) => ({
      progress,
      position: curve.getPointAt(progress).addScaledVector(sideAt(progress), 2.05),
    }))
    return { railCurves: rails, sleepers: ties, stationPoints: stations }
  }, [curve])
  const sleeperGeometry = useMemo(() => new THREE.BoxGeometry(2.35, 0.16, 0.38), [])
  const sleeperMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#514538', roughness: 0.9 }), [])
  const sleeperMesh = useRef<THREE.InstancedMesh>(null)
  const transform = useMemo(() => new THREE.Object3D(), [])

  useLayoutEffect(() => {
    if (!sleeperMesh.current) return
    sleepers.forEach((tie, index) => {
      transform.position.set(tie.position.x, 0.015, tie.position.z)
      transform.rotation.set(0, tie.rotation, 0)
      transform.updateMatrix()
      sleeperMesh.current?.setMatrixAt(index, transform.matrix)
    })
    sleeperMesh.current.instanceMatrix.needsUpdate = true
  }, [sleepers, transform])

  return (
    <group>
      {railCurves.map((rail, index) => (
        <Tube key={index} args={[rail, 200, 0.085, 10, false]} castShadow receiveShadow>
          <meshStandardMaterial color="#9b8356" metalness={0.72} roughness={0.35} />
        </Tube>
      ))}
      <instancedMesh ref={sleeperMesh} args={[sleeperGeometry, sleeperMaterial, sleepers.length]} castShadow receiveShadow />
      {stationPoints.map((station, index) => (
        <StationBeacon key={index} position={station.position} progressRef={progressRef} stationProgress={station.progress} />
      ))}
    </group>
  )
}

function StationBeacon({ position, progressRef, stationProgress }: { position: THREE.Vector3; progressRef: MutableRefObject<number>; stationProgress: number }) {
  const lampMaterial = useRef<THREE.MeshStandardMaterial>(null)
  const lampLight = useRef<THREE.PointLight>(null)

  useFrame(() => {
    if (!lampMaterial.current || !lampLight.current) return
    const distance = Math.abs(progressRef.current - stationProgress)
    const intensity = distance < 0.025 ? 2.8 : stationProgress < progressRef.current ? 1.05 : 0.5
    lampMaterial.current.emissiveIntensity = intensity
    lampLight.current.intensity = intensity * 1.6
  })

  return (
    <group position={[position.x, 0, position.z]}>
      <pointLight ref={lampLight} position={[0, 1.1, 0]} color="#ffc96f" intensity={0.8} distance={6.5} decay={2} />
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.14, 1.1, 8]} />
        <meshStandardMaterial color="#57432a" metalness={0.55} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.16, 0]}>
        <sphereGeometry args={[0.18, 12, 10]} />
        <meshStandardMaterial ref={lampMaterial} color="#ffe0a0" emissive="#e9a63b" emissiveIntensity={0.08} roughness={0.25} />
      </mesh>
    </group>
  )
}

function CameraFollow({ engineRef }: { engineRef: RefObject<THREE.Group | null> }) {
  const { camera, size } = useThree()
  const reducedMotionRef = useRef(false)
  const desiredPosition = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { reducedMotionRef.current = media.matches }
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useFrame((_, delta) => {
    const engine = engineRef.current
    if (!engine) return

    const isMobile = size.width < 700
    desiredPosition.set(
      engine.position.x,
      engine.position.y + (isMobile ? 12 : 10),
      engine.position.z + (isMobile ? 34 : 31),
    )

    if (reducedMotionRef.current) camera.position.copy(desiredPosition)
    else camera.position.lerp(desiredPosition, 1 - Math.exp(-delta * 3.6))
    camera.lookAt(engine.position.x, engine.position.y + 3.7, engine.position.z)
  })

  return null
}
