import { useEffect, useMemo, useRef, type MutableRefObject, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const trainScale = 1.6
export const expressTrainCarSpacingDistance = 7.5

type ExpressTrain3DProps = {
  curve: THREE.CatmullRomCurve3
  progressRef: MutableRefObject<number>
  engineRef: RefObject<THREE.Group | null>
  reducedMotion: boolean
}

export function ExpressTrain3D({ curve, progressRef, engineRef, reducedMotion }: ExpressTrain3DProps) {
  const tenderRef = useRef<THREE.Group>(null)
  const coachOneRef = useRef<THREE.Group>(null)
  const coachTwoRef = useRef<THREE.Group>(null)
  const previousProgress = useRef(0)
  const hasPreviousProgress = useRef(false)
  const wheelRotation = useRef(0)
  const tangent = useMemo(() => new THREE.Vector3(), [])
  const cars = useMemo(() => [
    { ref: engineRef, index: 0 },
    { ref: tenderRef, index: 1 },
    { ref: coachOneRef, index: 2 },
    { ref: coachTwoRef, index: 3 },
  ], [engineRef])

  useFrame(() => {
    const progress = THREE.MathUtils.clamp(progressRef.current, 0, 1)
    if (!hasPreviousProgress.current) {
      previousProgress.current = progress
      hasPreviousProgress.current = true
    }
    const velocity = progress - previousProgress.current
    previousProgress.current = progress
    wheelRotation.current += velocity * 46
    const routeLength = curve.getLength()
    const carSpacing = expressTrainCarSpacingDistance / routeLength

    cars.forEach(({ ref, index }) => {
      const car = ref.current
      if (!car) return

      const positionOnRoute = progress - carSpacing * index
      let point: THREE.Vector3
      if (positionOnRoute < 0) {
        point = curve.getPointAt(0)
        curve.getTangentAt(0, tangent).setY(0).normalize()
        point.addScaledVector(tangent, positionOnRoute * routeLength)
      } else {
        point = curve.getPointAt(positionOnRoute)
        curve.getTangentAt(positionOnRoute, tangent).setY(0).normalize()
      }
      point.y = 0.08
      car.position.copy(point)
      // The locomotive's smokebox faces local +Z; Object3D.lookAt aligns that axis
      // with the route tangent, so do not apply a second 180° correction here.
      car.lookAt(point.clone().add(tangent))
    })
  })

  return (
    <>
      <group ref={engineRef} scale={trainScale}>
        <Locomotive wheelRotation={wheelRotation} reducedMotion={reducedMotion} />
      </group>
      <group ref={tenderRef} scale={trainScale}><CoalTender wheelRotation={wheelRotation} /></group>
      <group ref={coachOneRef} scale={trainScale}><PassengerCoach wheelRotation={wheelRotation} variant={0} /></group>
      <group ref={coachTwoRef} scale={trainScale}><PassengerCoach wheelRotation={wheelRotation} variant={1} /></group>
    </>
  )
}

function Locomotive({ wheelRotation, reducedMotion }: { wheelRotation: MutableRefObject<number>; reducedMotion: boolean }) {
  return (
    <group>
      {/* Crimson boiler, forward smokebox and antique-brass boiler bands. */}
      <mesh position={[0, 1.28, -0.14]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.64, 0.76, 2.2, 24, 1]} />
        <meshStandardMaterial color="#7a1010" metalness={0.58} roughness={0.34} />
      </mesh>
      {/* Matte charcoal front third of the boiler and the raised, beveled smokebox door. */}
      <mesh position={[0, 1.28, 1.34]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.69, 0.72, 1.05, 28, 1]} />
        <meshStandardMaterial color="#161618" metalness={0.62} roughness={0.62} />
      </mesh>
      <mesh position={[0, 1.28, 1.91]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.13, 28, 1]} />
        <meshStandardMaterial color="#242528" metalness={0.58} roughness={0.48} />
      </mesh>
      <mesh position={[0, 1.28, 1.99]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.57, 0.055, 10, 32]} />
        <meshStandardMaterial color="#aaa69c" metalness={0.86} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.28, 2.05]}>
        <boxGeometry args={[0.09, 0.58, 0.08]} />
        <meshStandardMaterial color="#b0a990" metalness={0.85} roughness={0.26} />
      </mesh>
      <mesh position={[0, 1.28, 2.08]}>
        <sphereGeometry args={[0.12, 12, 8]} />
        <meshStandardMaterial color="#d1c5a9" metalness={0.88} roughness={0.2} />
      </mesh>
      {[-1.02, -0.35, 0.34, 0.72].map((z) => (
        <mesh key={z} position={[0, 1.28, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.68, 0.79, 0.1, 24]} />
          <meshStandardMaterial color="#d4af37" metalness={0.88} roughness={0.22} />
        </mesh>
      ))}
      <BoilerRivets />
      {/* Fine brass handrails along the red boiler. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.72, 1.56, -0.2]}>
            <boxGeometry args={[0.055, 0.055, 1.85]} />
            <meshStandardMaterial color="#c59b27" metalness={0.9} roughness={0.22} />
          </mesh>
          {[-0.95, -0.35, 0.3, 0.55].map((z) => (
            <mesh key={z} position={[side * 0.72, 1.49, z]}>
              <boxGeometry args={[0.045, 0.16, 0.045]} />
              <meshStandardMaterial color="#9f7924" metalness={0.86} roughness={0.27} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Brass safety-valve bonnet just aft of the smokebox. */}
      <mesh position={[0, 2.02, 0.48]} castShadow>
        <cylinderGeometry args={[0.32, 0.4, 0.32, 18]} />
        <meshStandardMaterial color="#c59b27" metalness={0.88} roughness={0.24} />
      </mesh>
      <mesh position={[0, 2.22, 0.48]}>
        <sphereGeometry args={[0.26, 16, 10]} />
        <meshStandardMaterial color="#c59b27" metalness={0.86} roughness={0.26} />
      </mesh>

      {/* Cab and glowing firebox windows. */}
      <mesh position={[0, 1.35, -1.45]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 1.62, 1.42]} />
        <meshStandardMaterial color="#57070d" metalness={0.56} roughness={0.38} />
      </mesh>
      <mesh position={[0, 2.2, -1.45]} castShadow>
        <boxGeometry args={[1.88, 0.16, 1.6]} />
        <meshStandardMaterial color="#171a1e" metalness={0.72} roughness={0.3} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.86, 1.58, -1.53]}>
            <boxGeometry args={[0.035, 0.68, 0.72]} />
            <meshStandardMaterial color="#ffb33d" emissive="#ff7a19" emissiveIntensity={2.1} roughness={0.25} toneMapped={false} />
          </mesh>
          <mesh position={[side * 0.87, 1.58, -1.53]}>
            <boxGeometry args={[0.05, 0.78, 0.82]} />
            <meshStandardMaterial color="#d4af37" metalness={0.78} roughness={0.28} wireframe />
          </mesh>
          <pointLight position={[side * 0.88, 1.42, -1.35]} color="#ff7e2e" intensity={1.8} distance={5} decay={2} />
        </group>
      ))}

      {/* Flared black chimney with a fine brass lip and headlamp beam. */}
      <mesh position={[0, 2.02, 1.37]} castShadow>
        <cylinderGeometry args={[0.2, 0.28, 0.74, 16]} />
        <meshStandardMaterial color="#17191d" metalness={0.82} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.39, 1.37]}>
        <cylinderGeometry args={[0.34, 0.2, 0.12, 18]} />
        <meshStandardMaterial color="#b87333" metalness={0.86} roughness={0.24} />
      </mesh>
      <mesh position={[0, 2.49, 1.37]}>
        <cylinderGeometry args={[0.35, 0.34, 0.11, 18]} />
        <meshStandardMaterial color="#14171b" metalness={0.85} roughness={0.27} />
      </mesh>
      <mesh position={[0, 2.02, 1.86]}>
        <cylinderGeometry args={[0.31, 0.36, 0.36, 18]} />
        <meshStandardMaterial color="#b87333" metalness={0.84} roughness={0.24} />
      </mesh>
      <mesh position={[0, 1.28, 2.22]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.065, 10, 24]} />
        <meshStandardMaterial color="#bbc0c3" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.28, 2.27]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.13, 24]} />
        <meshStandardMaterial color="#fff0bd" emissive="#ffaf32" emissiveIntensity={3.8} roughness={0.18} toneMapped={false} />
      </mesh>
      <Headboard />
      <NumberPlate />
      <pointLight position={[0, 1.22, 2.5]} color="#ffb64f" intensity={5.5} distance={10} decay={2} />
      <HeadlightBeam />

      {/* Cowcatcher and bars. */}
      <mesh position={[0, 0.53, 2.34]} castShadow>
        <boxGeometry args={[2.35, 0.34, 0.25]} />
        <meshStandardMaterial color="#a81818" metalness={0.52} roughness={0.34} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 1.2, 0.52, 2.43]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.42, 16]} />
            <meshStandardMaterial color="#4b4b4c" metalness={0.86} roughness={0.25} />
          </mesh>
          <mesh position={[side * 1.2, 0.52, 2.66]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.15, 20]} />
            <meshStandardMaterial color="#99999a" metalness={0.92} roughness={0.22} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.38, 2.62]}>
        <torusGeometry args={[0.19, 0.055, 8, 16]} />
        <meshStandardMaterial color="#252629" metalness={0.78} roughness={0.34} />
      </mesh>
      <mesh position={[0, 0.25, 2.64]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[0.09, 0.32, 0.09]} />
        <meshStandardMaterial color="#1a1b1d" metalness={0.65} roughness={0.4} />
      </mesh>
      <mesh position={[0.97, 0.83, 2.42]}>
        <boxGeometry args={[0.28, 0.29, 0.19]} />
        <meshStandardMaterial color="#1a1b1d" metalness={0.68} roughness={0.34} />
      </mesh>
      <mesh position={[0.97, 0.83, 2.53]}>
        <sphereGeometry args={[0.095, 12, 8]} />
        <meshStandardMaterial color="#ffd98c" emissive="#ff9f35" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      {[-0.55, -0.28, 0, 0.28, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.19, 2.75]} rotation={[0.16, 0, -x * 0.18]}>
          <boxGeometry args={[0.045, 0.5, 0.055]} />
          <meshStandardMaterial color="#a98a4c" metalness={0.8} roughness={0.32} />
        </mesh>
      ))}

      <DrivingWheels wheelRotation={wheelRotation} />
      <Coupler position={[0, 0.32, -2.42]} />
      {!reducedMotion && <SmokeTrail />}
    </group>
  )
}

function BoilerRivets() {
  const rivets = useMemo(() => Array.from({ length: 24 }, (_, index) => {
    const angle = (index / 24) * Math.PI * 2
    return { x: Math.cos(angle) * 0.77, y: 1.28 + Math.sin(angle) * 0.66, z: -0.92 + (index % 4) * 0.5 }
  }), [])

  return <>{rivets.map((rivet, index) => (
    <mesh key={index} position={[rivet.x, rivet.y, rivet.z]}>
      <sphereGeometry args={[0.035, 6, 5]} />
      <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
    </mesh>
  ))}</>
}

function Headboard() {
  const texture = useMemo(() => createHeadboardTexture(), [])
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <mesh position={[0, 2.2, 2.03]}>
      <planeGeometry args={[1.72, 0.65]} />
      <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  )
}

function NumberPlate() {
  const texture = useMemo(() => createNumberPlateTexture(), [])
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <mesh position={[0, 1.77, 2.08]}>
      <planeGeometry args={[1.08, 0.3]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}

function createHeadboardTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 384
  const context = canvas.getContext('2d')
  if (!context) return new THREE.CanvasTexture(canvas)

  context.beginPath()
  context.moveTo(72, 356)
  context.lineTo(72, 154)
  context.quadraticCurveTo(512, -5, 952, 154)
  context.lineTo(952, 356)
  context.closePath()
  context.fillStyle = '#7a1010'
  context.fill()
  context.strokeStyle = '#e0b54e'
  context.lineWidth = 20
  context.stroke()
  context.beginPath()
  context.moveTo(99, 337)
  context.lineTo(99, 166)
  context.quadraticCurveTo(512, 25, 925, 166)
  context.lineTo(925, 337)
  context.strokeStyle = '#bd8d32'
  context.lineWidth = 5
  context.stroke()
  context.beginPath()
  context.arc(512, 112, 35, 0, Math.PI * 2)
  context.fillStyle = '#e8cc91'
  context.fill()
  context.beginPath()
  context.moveTo(512, 82)
  context.lineTo(520, 105)
  context.lineTo(545, 112)
  context.lineTo(520, 120)
  context.lineTo(512, 143)
  context.lineTo(504, 120)
  context.lineTo(479, 112)
  context.lineTo(504, 105)
  context.closePath()
  context.fillStyle = '#6f1716'
  context.fill()
  context.fillStyle = '#f2d486'
  context.font = '700 72px Georgia, serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.shadowColor = 'rgba(0,0,0,.65)'
  context.shadowBlur = 8
  context.fillText('HOGWARTS EXPRESS', 512, 258, 790)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function createNumberPlateTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 192
  const context = canvas.getContext('2d')
  if (!context) return new THREE.CanvasTexture(canvas)
  context.fillStyle = '#131416'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = '#c8c4b8'
  context.lineWidth = 12
  context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16)
  context.fillStyle = '#f2eee5'
  context.font = '700 126px Georgia, serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText('5972', canvas.width / 2, canvas.height / 2 + 4)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function HeadlightBeam() {
  const target = useMemo(() => new THREE.Object3D(), [])
  return (
    <>
      <primitive object={target} position={[0, 0.15, 9]} />
      <spotLight target={target} position={[0, 1.4, 2.4]} color="#ffc45b" intensity={26} angle={0.34} penumbra={0.78} distance={13} decay={2} castShadow />
    </>
  )
}

function DrivingWheels({ wheelRotation }: { wheelRotation: MutableRefObject<number> }) {
  const axles = [-1.62, -0.62, 0.46, 1.5]
  return (
    <>
      {[-1, 1].flatMap((side) => axles.map((z) => (
        <SpokedWheel key={`${side}-${z}`} position={[side * 0.93, 0.53, z]} radius={0.48} wheelRotation={wheelRotation} />
      )))}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 1.0, 0.59, -0.08]}>
            <boxGeometry args={[0.08, 0.12, 3.15]} />
            <meshStandardMaterial color="#d4af37" metalness={0.86} roughness={0.28} />
          </mesh>
          {axles.map((z) => (
            <mesh key={z} position={[side * 1.03, 0.59, z]}>
              <sphereGeometry args={[0.13, 10, 8]} />
              <meshStandardMaterial color="#b89450" metalness={0.8} roughness={0.28} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  )
}

function SpokedWheel({ position, radius, wheelRotation }: { position: [number, number, number]; radius: number; wheelRotation: MutableRefObject<number> }) {
  const wheelRef = useRef<THREE.Group>(null)
  useFrame(() => { if (wheelRef.current) wheelRef.current.rotation.z = wheelRotation.current })

  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      <group ref={wheelRef}>
        <mesh>
          <torusGeometry args={[radius * 0.84, radius * 0.12, 8, 24]} />
          <meshStandardMaterial color="#9c2430" metalness={0.76} roughness={0.28} />
        </mesh>
        {Array.from({ length: 10 }, (_, index) => {
          const angle = (index / 10) * Math.PI * 2
          return (
            <mesh key={index} position={[Math.cos(angle) * radius * 0.4, Math.sin(angle) * radius * 0.4, 0]} rotation={[0, 0, angle]}>
              <cylinderGeometry args={[0.027, 0.027, radius * 0.84, 6]} />
              <meshStandardMaterial color="#c6a15e" metalness={0.82} roughness={0.29} />
            </mesh>
          )
        })}
        <mesh>
          <cylinderGeometry args={[radius * 0.18, radius * 0.18, 0.16, 12]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.22} />
        </mesh>
      </group>
    </group>
  )
}

function CoalTender({ wheelRotation }: { wheelRotation: MutableRefObject<number> }) {
  const coal = useMemo(() => Array.from({ length: 9 }, (_, index) => ({
    x: ((index * 7) % 5 - 2) * 0.19,
    y: 1.15 + ((index * 3) % 4) * 0.12,
    z: ((index * 11) % 7 - 3) * 0.2,
  })), [])
  return (
    <group>
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.72, 1.15, 3.12]} />
        <meshStandardMaterial color="#63050d" metalness={0.6} roughness={0.38} />
      </mesh>
      <mesh position={[0, 1.48, 0]}>
        <boxGeometry args={[1.8, 0.12, 3.18]} />
        <meshStandardMaterial color="#d4af37" metalness={0.82} roughness={0.28} />
      </mesh>
      {coal.map((lump, index) => (
        <mesh key={index} position={[lump.x, lump.y, lump.z]} scale={[0.45, 0.28, 0.42]}>
          <dodecahedronGeometry args={[0.48, 0]} />
          <meshStandardMaterial color={index % 2 ? '#17191d' : '#29282a'} roughness={0.98} />
        </mesh>
      ))}
      <PassengerWindows length={2.55} />
      <BogieWheels wheelRotation={wheelRotation} centers={[-0.98, 0.98]} radius={0.34} />
      <Coupler position={[0, 0.35, 1.68]} />
      <Coupler position={[0, 0.35, -1.68]} />
    </group>
  )
}

function PassengerCoach({ wheelRotation, variant }: { wheelRotation: MutableRefObject<number>; variant: number }) {
  const color = variant === 0 ? '#671019' : '#59101a'
  return (
    <group>
      <mesh position={[0, 1.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.82, 1.38, 4.35]} />
        <meshStandardMaterial color={color} metalness={0.52} roughness={0.36} />
      </mesh>
      <mesh position={[0, 1.86, 0]} castShadow>
        <boxGeometry args={[1.95, 0.2, 4.5]} />
        <meshStandardMaterial color="#16191e" metalness={0.65} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[1.88, 0.12, 4.3]} />
        <meshStandardMaterial color="#d4af37" metalness={0.82} roughness={0.3} />
      </mesh>
      <PassengerWindows length={3.6} />
      <BogieWheels wheelRotation={wheelRotation} centers={[-1.46, -1.1, 1.1, 1.46]} radius={0.32} />
      <Coupler position={[0, 0.32, 2.28]} />
      <Coupler position={[0, 0.32, -2.28]} />
    </group>
  )
}

function PassengerWindows({ length }: { length: number }) {
  const windows = useMemo(() => Array.from({ length: 5 }, (_, index) => -length / 2 + 0.38 + index * (length - 0.76) / 4), [length])
  return <>{[-1, 1].map((side) => windows.map((z) => (
    <group key={`${side}-${z}`}>
      <mesh position={[side * 0.925, 1.35, z]}>
        <boxGeometry args={[0.05, 0.64, 0.42]} />
        <meshStandardMaterial color="#ffb34a" emissive="#ff7a18" emissiveIntensity={1.7} roughness={0.22} toneMapped={false} />
      </mesh>
      <mesh position={[side * 0.955, 1.35, z]}>
        <boxGeometry args={[0.06, 0.75, 0.53]} />
        <meshStandardMaterial color="#c69a4a" metalness={0.78} roughness={0.32} wireframe />
      </mesh>
    </group>
  )))}</>
}

function BogieWheels({ wheelRotation, centers, radius }: { wheelRotation: MutableRefObject<number>; centers: number[]; radius: number }) {
  return <>{[-1, 1].flatMap((side) => centers.map((z) => (
    <SpokedWheel key={`${side}-${z}`} position={[side * 0.97, radius, z]} radius={radius} wheelRotation={wheelRotation} />
  )))}</>
}

function Coupler({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh><boxGeometry args={[0.24, 0.16, 0.42]} /><meshStandardMaterial color="#3a3430" metalness={0.72} roughness={0.42} /></mesh>
      <mesh position={[0, -0.08, 0]}><torusGeometry args={[0.17, 0.045, 6, 12]} /><meshStandardMaterial color="#a98a4c" metalness={0.8} roughness={0.3} /></mesh>
    </group>
  )
}

function SmokeTrail() {
  const puffs = useRef<Array<THREE.Mesh | null>>([])
  const seeds = useMemo(() => [0.04, 0.19, 0.31, 0.47, 0.58, 0.7, 0.82, 0.94, 0.27, 0.63], [])
  const materials = useMemo(() => seeds.map((_, index) => new THREE.MeshBasicMaterial({ color: index % 3 === 0 ? '#d8d9dc' : '#aeb6c0', transparent: true, opacity: 0, depthWrite: false })), [seeds])

  useFrame(({ clock }) => {
    puffs.current.forEach((puff, index) => {
      if (!puff) return
      const seed = seeds[index]
      const phase = (clock.elapsedTime * (0.115 + seed * 0.045) + seed) % 1
      const drift = Math.sin(clock.elapsedTime * (0.8 + seed) + seed * 12) * (0.12 + phase * 0.82)
      const crossBreeze = Math.sin(clock.elapsedTime * 0.43 + seed * 18) * phase * 0.28
      puff.position.set(drift + crossBreeze, 2.46 + phase * (2.15 + seed * 0.45), 1.12 - phase * (1.45 + seed * 0.9))
      const scale = (0.12 + phase * (0.68 + seed * 0.18)) * (0.82 + (index % 4) * 0.12)
      puff.scale.set(scale * (1.04 + Math.sin(seed * 13) * 0.16), scale * (0.74 + Math.cos(seed * 9) * 0.12), scale)
      materials[index].opacity = Math.sin(Math.PI * (0.08 + phase * 0.86)) * (1 - phase * 0.48) * 0.24
    })
  })

  return <>{materials.map((material, index) => (
    <mesh key={index} ref={(node) => { puffs.current[index] = node }} material={material}>
      <sphereGeometry args={[0.48, 10, 8]} />
    </mesh>
  ))}</>
}
