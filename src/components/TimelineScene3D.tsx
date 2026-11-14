import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Line, PerspectiveCamera, Sparkles, Stars, Tube } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'
import { ExpressTrain3D, expressTrainCarSpacingDistance } from './ExpressTrain3D'
import { getTimelineRouteProgress, timelineRouteLeadIn, timelineRoutePoints, timelineStationProgress } from '../data/timelineRoute'
import { timelineMilestones } from '../data/timeline'

const stationStops = timelineStationProgress.map(getTimelineRouteProgress)

function JourneyAtmosphere({ progressRef, moonlightRef, hemisphereRef }: { progressRef: MutableRefObject<number>; moonlightRef: RefObject<THREE.DirectionalLight | null>; hemisphereRef: RefObject<THREE.HemisphereLight | null> }) {
  const palette = useMemo(() => ({
    twilight: new THREE.Color('#162038'),
    dusk: new THREE.Color('#1b1429'),
    midnight: new THREE.Color('#060913'),
    twilightLight: new THREE.Color('#d6c48f'),
    midnightLight: new THREE.Color('#90a9d0'),
  }), [])
  const background = useRef<THREE.Color>(null)
  const fog = useRef<THREE.FogExp2>(null)
  const normalized = useRef(0)

  useFrame(() => {
    normalized.current = THREE.MathUtils.clamp((progressRef.current - timelineRouteLeadIn) / (1 - timelineRouteLeadIn), 0, 1)
    const amount = normalized.current
    if (!background.current || !fog.current) return
    if (amount < 0.5) {
      background.current.lerpColors(palette.twilight, palette.dusk, amount * 2)
    } else {
      background.current.lerpColors(palette.dusk, palette.midnight, (amount - 0.5) * 2)
    }
    fog.current.color.copy(background.current)
    fog.current.density = 0.009 + amount * 0.0025
    if (moonlightRef.current) {
      moonlightRef.current.intensity = 2.6 - amount * 0.3
      moonlightRef.current.color.lerpColors(palette.twilightLight, palette.midnightLight, amount)
    }
    if (hemisphereRef.current) hemisphereRef.current.intensity = 1.6 - amount * 0.2
  })

  return <>
    <color ref={background} attach="background" args={['#162038']} />
    <fogExp2 ref={fog} attach="fog" args={['#162038', 0.012]} />
  </>
}

const highlandSkyVertexShader = `
  varying vec3 vDirection;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vDirection = normalize(worldPosition.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const highlandSkyFragmentShader = `
  uniform float uTime;
  uniform float uProgress;
  uniform vec3 uMoonDirection;
  varying vec3 vDirection;
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  void main() {
    vec3 direction = normalize(vDirection);
    float horizon = smoothstep(-0.28, 0.34, direction.y);
    vec3 zenith = mix(vec3(0.055, 0.085, 0.17), vec3(0.025, 0.035, 0.085), uProgress);
    vec3 horizonColor = mix(vec3(0.13, 0.22, 0.34), vec3(0.07, 0.13, 0.21), uProgress);
    vec3 sky = mix(horizonColor, zenith, horizon);
    float amberGlow = exp(-abs(direction.y + 0.065) * 12.0) * exp(-abs(direction.x + 0.18) * 1.8);
    float emeraldGlow = exp(-abs(direction.y + 0.09) * 15.0) * exp(-abs(direction.x - 0.5) * 3.5);
    sky += vec3(0.28, 0.13, 0.045) * amberGlow * (1.0 - uProgress * 0.65);
    sky += vec3(0.025, 0.11, 0.075) * emeraldGlow * (1.0 - uProgress * 0.45);
    vec2 cloudUv = direction.xz / max(0.2, abs(direction.y) + 0.3) * 2.4;
    float cloudField = noise2(cloudUv * 2.5 + vec2(uTime * 0.012, -uTime * 0.007));
    float cloudDetail = noise2(cloudUv * 6.5 - vec2(uTime * 0.018, uTime * 0.011));
    float clouds = smoothstep(0.57, 0.82, cloudField * 0.78 + cloudDetail * 0.22) * (1.0 - smoothstep(0.08, 0.5, direction.y));
    sky = mix(sky, vec3(0.28, 0.34, 0.43), clouds * 0.32);
    vec2 starCell = floor(direction.xz * 380.0 + direction.y * 180.0);
    float starSeed = hash21(starCell);
    float stars = step(0.9974, starSeed) * smoothstep(-0.02, 0.35, direction.y);
    float twinkle = 0.62 + 0.38 * sin(uTime * (1.4 + starSeed * 4.0) + starSeed * 90.0);
    sky += vec3(0.72, 0.78, 0.9) * stars * twinkle;
    float moonDot = dot(direction, normalize(uMoonDirection));
    float moonDisc = smoothstep(0.9990, 0.99965, moonDot);
    float moonHalo = exp(-max(0.0, 1.0 - moonDot) * 95.0);
    sky += vec3(1.0, 0.82, 0.56) * moonHalo * 0.38;
    sky = mix(sky, vec3(1.0, 0.91, 0.72), moonDisc);
    gl_FragColor = vec4(sky, 1.0);
  }
`

function SkyDome({ progressRef, reducedMotion }: { progressRef: MutableRefObject<number>; reducedMotion: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null)

  useFrame(({ clock }) => {
    if (!material.current) return
    material.current.uniforms.uTime.value = reducedMotion ? 0 : clock.elapsedTime
    material.current.uniforms.uProgress.value = THREE.MathUtils.clamp((progressRef.current - timelineRouteLeadIn) / (1 - timelineRouteLeadIn), 0, 1)
  })

  return (
    <mesh renderOrder={-100}>
      <sphereGeometry args={[180, 64, 40]} />
      <shaderMaterial
        ref={material}
        vertexShader={highlandSkyVertexShader}
        fragmentShader={highlandSkyFragmentShader}
        uniforms={{ uTime: { value: 0 }, uProgress: { value: 0 }, uMoonDirection: { value: new THREE.Vector3(-0.18, 0.42, -0.89).normalize() } }}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        toneMapped={false}
      />
    </mesh>
  )
}

const blackLakeVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const blackLakeFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  void main() {
    vec2 uv = vUv;
    float rippleA = sin(uv.x * 420.0 + sin(uv.y * 30.0 + uTime * 0.28) * 2.2 + uTime * 0.5);
    float rippleB = sin(uv.x * 205.0 - uv.y * 88.0 + uTime * 0.32);
    float rippleC = sin(uv.x * 670.0 + uv.y * 140.0 - uTime * 0.22);
    float horizonReflection = exp(-abs(uv.y - 0.55) * 18.0);
    float moonSheen = pow(max(0.0, 1.0 - abs(uv.x - 0.72) * 2.0), 7.0) * horizonReflection;
    float glint = smoothstep(0.72, 1.0, rippleA * 0.42 + rippleB * 0.32 + rippleC * 0.26) * 0.2;
    vec3 water = vec3(0.018, 0.035, 0.064) + vec3(0.025, 0.05, 0.075) * glint;
    water += vec3(0.16, 0.19, 0.23) * moonSheen * (0.28 + glint);
    water += vec3(0.12, 0.065, 0.026) * smoothstep(0.93, 1.0, rippleB) * horizonReflection * 0.12;
    gl_FragColor = vec4(water, 1.0);
  }
`

function BlackLake({ reducedMotion }: { reducedMotion: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime.value = reducedMotion ? 0 : clock.elapsedTime
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -7.6, -8]} receiveShadow>
      <planeGeometry args={[210, 160, 1, 1]} />
      <shaderMaterial ref={material} vertexShader={blackLakeVertexShader} fragmentShader={blackLakeFragmentShader} uniforms={{ uTime: { value: 0 } }} side={THREE.DoubleSide} />
    </mesh>
  )
}

type Station = {
  progress: number
  point: THREE.Vector3
  tangent: THREE.Vector3
  lantern: THREE.Vector3
}

export type TimelineScene3DProps = {
  progressRef: MutableRefObject<number>
}

export function TimelineScene3D({ progressRef }: TimelineScene3DProps) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(timelineRoutePoints.map(([x, y, z]) => new THREE.Vector3(x, y, z))), [])
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const moonlightRef = useRef<THREE.DirectionalLight>(null)
  const hemisphereRef = useRef<THREE.HemisphereLight>(null)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return (
    <Canvas
      className="timeline-canvas"
      aria-hidden="true"
      dpr={[1, 1.5]}
      camera={{ position: [0, 7.5, 11], fov: 55, near: 0.1, far: 180 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
    >
      <JourneyAtmosphere progressRef={progressRef} moonlightRef={moonlightRef} hemisphereRef={hemisphereRef} />
      <SkyDome progressRef={progressRef} reducedMotion={reducedMotion} />
      <ambientLight intensity={0.58} color="#acb9ca" />
      <directionalLight ref={moonlightRef} position={[-18, 24, 14]} intensity={2.6} color="#d6c48f" castShadow shadow-mapSize={[1024, 1024]} />
      <hemisphereLight ref={hemisphereRef} args={['#6b8cce', '#1e293b', 1.6]} />
      <PerspectiveCamera makeDefault position={[0, 7.5, 11]} fov={55} near={0.1} far={180} />
      <Stars radius={90} depth={55} count={420} factor={2.2} saturation={0} fade speed={0.12} />
      <Sparkles count={52} size={2.2} speed={reducedMotion ? 0 : 0.16} opacity={0.5} color="#d6a55d" scale={[54, 7, 15]} position={[0, 2.6, -4]} />
      <Sparkles count={24} size={2.8} speed={reducedMotion ? 0 : 0.1} opacity={0.26} color="#91a9cf" scale={[48, 5, 12]} position={[0, 1.2, 5]} />
      <Suspense fallback={null}><TimelineWorld curve={curve} progressRef={progressRef} reducedMotion={reducedMotion} /></Suspense>
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.46} luminanceThreshold={0.9} luminanceSmoothing={0.08} mipmapBlur />
      </EffectComposer>
    </Canvas>
  )
}

function TimelineWorld({ curve, progressRef, reducedMotion }: { curve: THREE.CatmullRomCurve3; progressRef: MutableRefObject<number>; reducedMotion: boolean }) {
  const engineRef = useRef<THREE.Group>(null)
  const stations = useMemo<Station[]>(() => stationStops.map((progress) => {
    const point = curve.getPointAt(progress)
    const tangent = curve.getTangentAt(progress).setY(0).normalize()
    const side = tangent.clone().cross(new THREE.Vector3(0, 1, 0)).normalize()
    return {
      progress,
      point,
      tangent,
      lantern: point.clone().addScaledVector(side, 3),
    }
  }), [curve])

  return (
    <>
      <NightLandscape reducedMotion={reducedMotion} />
      <ForestAndViaduct curve={curve} reducedMotion={reducedMotion} />
      <RailwayAndStations curve={curve} stations={stations} progressRef={progressRef} reducedMotion={reducedMotion} />
      <ExpressTrain3D curve={curve} progressRef={progressRef} engineRef={engineRef} reducedMotion={reducedMotion} />
      <TrainWarmFill engineRef={engineRef} curve={curve} progressRef={progressRef} />
      <CameraFollow engineRef={engineRef} curve={curve} progressRef={progressRef} reducedMotion={reducedMotion} />
      <DriftingMist reducedMotion={reducedMotion} />
    </>
  )
}

function NightLandscape({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group>
      <BlackLake reducedMotion={reducedMotion} />
      <HighlandTerrain seed={2.4} position={[0, -12, -44]} />
      <HighlandTerrain seed={8.7} position={[0, -15, -72]} />
      <HighlandTerrain seed={15.3} position={[0, -17, -98]} />
      <HighlandCastle />
    </group>
  )
}

function buildHighlandHeightmap(seed: number) {
  const geometry = new THREE.PlaneGeometry(280, 84, 168, 56)
  geometry.rotateX(-Math.PI / 2)
  const positions = geometry.attributes.position
  const colors = new Float32Array(positions.count * 3)
  const heather = new THREE.Color('#18252a')
  const slate = new THREE.Color('#303c47')
  const moonlitStone = new THREE.Color('#78818a')
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index)
    const z = positions.getZ(index)
    const broadRidge = Math.sin(x * 0.019 + seed) * 5.2 + Math.sin(x * 0.046 - seed * 0.7) * 2.1
    const crossRidge = Math.cos(z * 0.072 + seed * 1.8) * 1.8
    const crag = Math.sin((x + z) * 0.12 + seed) * Math.cos(x * 0.083 - z * 0.06) * 1.45
    const height = Math.max(-1.5, 8.2 + broadRidge + crossRidge + crag)
    positions.setY(index, height)
    const elevation = THREE.MathUtils.clamp((height - 2) / 12, 0, 1)
    const color = heather.clone().lerp(slate, elevation)
    if (elevation > 0.64) color.lerp(moonlitStone, (elevation - 0.64) * 1.6)
    const variation = 0.92 + (Math.sin(x * 0.21 + z * 0.17 + seed) * 0.035)
    colors[index * 3] = color.r * variation
    colors[index * 3 + 1] = color.g * variation
    colors[index * 3 + 2] = color.b * variation
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  return geometry
}

function HighlandTerrain({ seed, position }: { seed: number; position: [number, number, number] }) {
  const geometry = useMemo(() => buildHighlandHeightmap(seed), [seed])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh geometry={geometry} position={position} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.94} metalness={0.06} side={THREE.DoubleSide} />
    </mesh>
  )
}

function HighlandCastle() {
  const towers = useMemo(() => [
    [-3.8, 3.2, 0.4], [-1.7, 4.8, -0.8], [0.4, 3.6, 0.3], [2.5, 5.6, -0.4], [4.5, 3.4, 0.5],
  ] as const, [])
  return (
    <group position={[99, 3.4, -66]} rotation={[0, -0.12, 0]} scale={[1.4, 1.25, 1.4]}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[13, 5.2, 5.2]} />
        <meshStandardMaterial color="#22252e" roughness={0.9} />
      </mesh>
      {towers.map(([x, height, z], index) => (
        <group key={index} position={[x, height / 2 + 2.2, z]}>
          <mesh castShadow><cylinderGeometry args={[0.85, 1.05, height, 8]} /><meshStandardMaterial color="#30303a" roughness={0.84} /></mesh>
          <mesh position={[0, height / 2 + 0.72, 0]}><coneGeometry args={[1.18, 1.6, 8]} /><meshStandardMaterial color="#111722" roughness={0.88} /></mesh>
          {[-0.35, 0.35].map((windowX) => (
            <mesh key={windowX} position={[windowX, -0.15, 0.86]}>
              <boxGeometry args={[0.16, 0.48, 0.06]} />
              <meshStandardMaterial color="#ffce75" emissive="#ff9d31" emissiveIntensity={1.1} />
            </mesh>
          ))}
        </group>
      ))}
      {Array.from({ length: 8 }, (_, index) => (
        <mesh key={index} position={[-5.1 + index * 1.45, 0.1, 2.65]}>
          <boxGeometry args={[0.22, 0.72, 0.08]} />
          <meshStandardMaterial color="#f0b24f" emissive="#df7c25" emissiveIntensity={0.65} />
        </mesh>
      ))}
    </group>
  )
}

function ForestAndViaduct({ curve, reducedMotion }: { curve: THREE.CatmullRomCurve3; reducedMotion: boolean }) {
  const treeData = useMemo(() => Array.from({ length: 132 }, (_, index) => ({
    x: -98 + (index * 47 % 197),
    z: (index % 2 === 0 ? -1 : 1) * (12 + (index * 19 % 27)),
    height: 5 + (index * 7 % 30) * 0.18,
    width: 0.58 + (index * 3 % 7) * 0.1,
    phase: index * 0.53,
  })), [])
  const trunkMesh = useRef<THREE.InstancedMesh>(null)
  const crownMesh = useRef<THREE.InstancedMesh>(null)
  const branchMesh = useRef<THREE.InstancedMesh>(null)
  const treesTransform = useMemo(() => new THREE.Object3D(), [])
  const treesInitialized = useRef(false)
  const arches = useMemo(() => Array.from({ length: 31 }, (_, index) => {
    const progress = index / 30
    const point = curve.getPointAt(progress)
    const tangent = curve.getTangentAt(progress)
    return { point, rotation: Math.atan2(tangent.x, tangent.z) }
  }), [curve])
  const archGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-4.4, -7.2)
    shape.lineTo(-4.4, 0)
    shape.lineTo(4.4, 0)
    shape.lineTo(4.4, -7.2)
    shape.lineTo(3.2, -7.2)
    shape.lineTo(3.2, -2.1)
    shape.quadraticCurveTo(0, -0.35, -3.2, -2.1)
    shape.lineTo(-3.2, -7.2)
    shape.closePath()
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 4.8, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.12, bevelThickness: 0.12, curveSegments: 16 })
    geometry.translate(0, 0, -2.4)
    return geometry
  }, [])
  const archMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#38363a', roughness: 0.92, metalness: 0.02, flatShading: true }), [])
  const archTransforms = useMemo(() => arches.map(({ point, rotation }) => {
    const transform = new THREE.Object3D()
    transform.position.set(point.x, 0, point.z)
    transform.rotation.set(0, rotation, 0)
    transform.updateMatrix()
    return transform.matrix.clone()
  }), [arches])
  const archMesh = useRef<THREE.InstancedMesh>(null)
  const parapetMesh = useRef<THREE.InstancedMesh>(null)
  const copingMesh = useRef<THREE.InstancedMesh>(null)
  const masonryTransform = useMemo(() => new THREE.Object3D(), [])
  const masonrySegmentsPerSide = 90
  const parapetCount = masonrySegmentsPerSide * 2
  const copingCount = parapetCount
  const masonryColors = useMemo(() => ['#4a4746', '#55504b', '#49464a', '#60574e', '#504c49'].map((color) => new THREE.Color(color)), [])

  useLayoutEffect(() => {
    archTransforms.forEach((matrix, index) => archMesh.current?.setMatrixAt(index, matrix))
    if (archMesh.current) archMesh.current.instanceMatrix.needsUpdate = true
    for (let index = 0; index < masonrySegmentsPerSide; index += 1) {
      const progress = index / (masonrySegmentsPerSide - 1)
      const point = curve.getPointAt(progress)
      const tangent = curve.getTangentAt(progress).setY(0).normalize()
      const side = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize()
      const rotation = Math.atan2(tangent.x, tangent.z)
      for (const sign of [-1, 1]) {
        const instanceIndex = index * 2 + (sign > 0 ? 1 : 0)
        masonryTransform.position.copy(point).addScaledVector(side, sign * 4.25).setY(0.9)
        masonryTransform.rotation.set(0, rotation, 0)
        masonryTransform.scale.set(1, 1, 1)
        masonryTransform.updateMatrix()
        parapetMesh.current?.setMatrixAt(instanceIndex, masonryTransform.matrix)
        parapetMesh.current?.setColorAt(instanceIndex, masonryColors[(index + (sign > 0 ? 2 : 0)) % masonryColors.length])
        masonryTransform.position.copy(point).addScaledVector(side, sign * 4.25).setY(1.63)
        masonryTransform.scale.set(1, 1, 1)
        masonryTransform.updateMatrix()
        copingMesh.current?.setMatrixAt(instanceIndex, masonryTransform.matrix)
        copingMesh.current?.setColorAt(instanceIndex, masonryColors[(index + (sign > 0 ? 1 : 3)) % masonryColors.length])
      }
    }
    if (parapetMesh.current) parapetMesh.current.instanceMatrix.needsUpdate = true
    if (copingMesh.current) copingMesh.current.instanceMatrix.needsUpdate = true
  }, [archTransforms, curve, masonryColors, masonryTransform])

  useFrame(({ clock }) => {
    if (reducedMotion && treesInitialized.current) return
    treeData.forEach((tree, index) => {
      const sway = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.42 + tree.phase) * 0.035
      treesTransform.position.set(tree.x, tree.height / 2 - 0.65, tree.z)
      treesTransform.rotation.set(sway, 0, Math.sin(tree.phase) * 0.06)
      treesTransform.scale.set(tree.width, tree.height / 3.8, tree.width)
      treesTransform.updateMatrix()
      trunkMesh.current?.setMatrixAt(index, treesTransform.matrix)

      treesTransform.position.set(tree.x, tree.height * 0.58 - 0.65, tree.z)
      treesTransform.rotation.set(sway, 0, Math.sin(tree.phase) * 0.06)
      treesTransform.scale.set(tree.width * 1.9, tree.height * 0.64, tree.width * 1.9)
      treesTransform.updateMatrix()
      crownMesh.current?.setMatrixAt(index, treesTransform.matrix)

      treesTransform.position.set(tree.x + Math.sin(tree.phase) * 0.56, tree.height * 0.8 - 0.65, tree.z + 0.15)
      treesTransform.rotation.set(sway + 0.3, 0, Math.cos(tree.phase) * 0.48)
      treesTransform.scale.set(tree.width * 0.58, tree.height * 0.38, tree.width * 0.58)
      treesTransform.updateMatrix()
      branchMesh.current?.setMatrixAt(index, treesTransform.matrix)
    })
    if (trunkMesh.current) trunkMesh.current.instanceMatrix.needsUpdate = true
    if (crownMesh.current) crownMesh.current.instanceMatrix.needsUpdate = true
    if (branchMesh.current) branchMesh.current.instanceMatrix.needsUpdate = true
    treesInitialized.current = true
  })

  return (
    <group>
      <instancedMesh ref={trunkMesh} args={[undefined, undefined, treeData.length]} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.28, 3.8, 5]} />
        <meshStandardMaterial color="#17171d" roughness={1} flatShading />
      </instancedMesh>
      <instancedMesh ref={crownMesh} args={[undefined, undefined, treeData.length]} castShadow>
        <coneGeometry args={[1, 1, 5]} />
        <meshStandardMaterial color="#11151e" roughness={1} flatShading />
      </instancedMesh>
      <instancedMesh ref={branchMesh} args={[undefined, undefined, treeData.length]} castShadow>
        <coneGeometry args={[1, 1, 4]} />
        <meshStandardMaterial color="#19171d" roughness={1} flatShading />
      </instancedMesh>
      <instancedMesh ref={parapetMesh} args={[undefined, undefined, parapetCount]} castShadow receiveShadow>
        <boxGeometry args={[0.54, 1.42, 1.18]} />
        <meshStandardMaterial color="#ffffff" roughness={0.96} flatShading />
      </instancedMesh>
      <instancedMesh ref={copingMesh} args={[undefined, undefined, copingCount]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.22, 1.18]} />
        <meshStandardMaterial color="#ffffff" roughness={0.88} flatShading />
      </instancedMesh>
      <instancedMesh ref={archMesh} args={[archGeometry, archMaterial, arches.length]} castShadow receiveShadow />
    </group>
  )
}

function RailwayAndStations({ curve, stations, progressRef, reducedMotion }: { curve: THREE.CatmullRomCurve3; stations: Station[]; progressRef: MutableRefObject<number>; reducedMotion: boolean }) {
  const { railCurves, sleepers, dottedRoute } = useMemo(() => {
    const sampleCount = 140
    const centers = Array.from({ length: sampleCount + 1 }, (_, index) => curve.getPointAt(index / sampleCount))
    const sideAt = (progress: number) => {
      const tangent = curve.getTangentAt(progress).setY(0).normalize()
      return new THREE.Vector3(tangent.z, 0, -tangent.x).normalize()
    }
    const rails = [-1.5, 1.5].map((offset) => new THREE.CatmullRomCurve3(
      centers.map((point, index) => point.clone().addScaledVector(sideAt(index / sampleCount), offset).setY(0.12)),
    ))
    const ties = Array.from({ length: 180 }, (_, index) => {
      const progress = index / 179
      const point = curve.getPointAt(progress)
      const tangent = curve.getTangentAt(progress)
      return { position: point, rotation: Math.atan2(tangent.x, tangent.z) }
    })
    const routeDots = centers.map((point) => point.clone().setY(0.3))
    return { railCurves: rails, sleepers: ties, dottedRoute: routeDots }
  }, [curve])
  const sleeperGeometry = useMemo(() => new THREE.BoxGeometry(4.05, 0.2, 0.42), [])
  const sleeperMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#514538', roughness: 0.9 }), [])
  const sleeperMesh = useRef<THREE.InstancedMesh>(null)
  const transform = useMemo(() => new THREE.Object3D(), [])

  useLayoutEffect(() => {
    sleepers.forEach((tie, index) => {
      transform.position.set(tie.position.x, 0.015, tie.position.z)
      transform.rotation.set(0, tie.rotation, 0)
      transform.updateMatrix()
      sleeperMesh.current?.setMatrixAt(index, transform.matrix)
    })
    if (sleeperMesh.current) sleeperMesh.current.instanceMatrix.needsUpdate = true
  }, [sleepers, transform])

  return (
    <group>
      {railCurves.map((rail, index) => (
        <Tube key={index} args={[rail, 200, 0.085, 10, false]} castShadow receiveShadow>
          <meshStandardMaterial color="#b29a69" metalness={0.72} roughness={0.3} />
        </Tube>
      ))}
      <Line points={dottedRoute} color="#f1d898" lineWidth={1.7} dashed dashSize={0.35} gapSize={0.24} transparent opacity={0.82} />
      <instancedMesh ref={sleeperMesh} args={[sleeperGeometry, sleeperMaterial, sleepers.length]} castShadow receiveShadow />
      {stations.map((station, index) => (
        <group key={timelineMilestones[index].id}>
          <StationGothicLandmark station={station} />
          <StationBeacon position={station.lantern} progressRef={progressRef} stationProgress={station.progress} reducedMotion={reducedMotion} />
          <StationWaypointRing position={station.point} progressRef={progressRef} stationProgress={station.progress} reducedMotion={reducedMotion} />
        </group>
      ))}
    </group>
  )
}

function StationGothicLandmark({ station }: { station: Station }) {
  const rotation = Math.atan2(station.tangent.x, station.tangent.z)

  return (
    <group position={station.lantern} rotation={[0, rotation, 0]}>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.28, 0, 0]}>
          <mesh position={[0, 1.86, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.34, 3.72, 0.48]} />
            <meshStandardMaterial color="#34333a" roughness={0.9} flatShading />
          </mesh>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.84, 0.42, 0.82]} />
            <meshStandardMaterial color="#4b4540" roughness={0.94} flatShading />
          </mesh>
          <mesh position={[0, 2.12, 0.255]}>
            <boxGeometry args={[0.1, 0.7, 0.025]} />
            <meshStandardMaterial color="#d6a45c" emissive="#c17d31" emissiveIntensity={0.55} />
          </mesh>
          <mesh position={[0, 3.76, 0]}>
            <boxGeometry args={[0.62, 0.28, 0.72]} />
            <meshStandardMaterial color="#5a5147" roughness={0.88} flatShading />
          </mesh>
          <mesh position={[side * -0.64, 4.38, 0]} rotation={[0, 0, side * Math.PI / 4]}>
            <boxGeometry args={[0.22, 1.82, 0.34]} />
            <meshStandardMaterial color="#49434a" roughness={0.88} flatShading />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 5.02, 0]}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color="#e9cf96" emissive="#d99b48" emissiveIntensity={0.8} metalness={0.42} roughness={0.3} />
      </mesh>
    </group>
  )
}

function StationBeacon({ position, progressRef, stationProgress, reducedMotion }: { position: THREE.Vector3; progressRef: MutableRefObject<number>; stationProgress: number; reducedMotion: boolean }) {
  const beaconMaterial = useRef<THREE.MeshStandardMaterial>(null)
  const beaconLight = useRef<THREE.PointLight>(null)
  const baseIntensity = useMemo(() => 0.85 + Math.sin(stationProgress * 193) * 0.15, [stationProgress])

  useFrame(({ clock }) => {
    const approach = Math.max(0, 1 - Math.abs(progressRef.current - stationProgress) * 18)
    const flicker = reducedMotion ? 1 : 0.88 + Math.sin(clock.elapsedTime * 9 + stationProgress * 100) * 0.08 + Math.sin(clock.elapsedTime * 17) * 0.04
    const intensity = baseIntensity * flicker + approach * 1.9
    if (beaconMaterial.current) beaconMaterial.current.emissiveIntensity = intensity * 1.5
    if (beaconLight.current) beaconLight.current.intensity = intensity * 2.4
  })

  return (
    <group position={[position.x, 0, position.z]}>
      <pointLight ref={beaconLight} position={[0, 1.65, 0]} color="#ffc46a" intensity={2} distance={11} decay={2} />
      {[-0.58, 0.58].map((x) => (
        <mesh key={x} position={[x, 1, 0]} castShadow>
          <boxGeometry args={[0.16, 2, 0.2]} />
          <meshStandardMaterial color="#302a29" metalness={0.54} roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 1.12, 0]}>
        <torusGeometry args={[0.58, 0.08, 8, 20, Math.PI]} />
        <meshStandardMaterial color="#8f754b" metalness={0.82} roughness={0.27} />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial ref={beaconMaterial} color="#ffe2a1" emissive="#ff9b36" emissiveIntensity={1.2} roughness={0.22} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.6, 0.72, 0.28, 8]} />
        <meshStandardMaterial color="#5a5045" roughness={0.86} />
      </mesh>
    </group>
  )
}

function StationWaypointRing({ position, progressRef, stationProgress, reducedMotion }: { position: THREE.Vector3; progressRef: MutableRefObject<number>; stationProgress: number; reducedMotion: boolean }) {
  const ring = useRef<THREE.Mesh>(null)
  const orb = useRef<THREE.MeshStandardMaterial>(null)
  const light = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    const proximity = stationProximity(progressRef.current, stationProgress)
    const pulse = reducedMotion ? 1 : 1 + Math.sin(clock.elapsedTime * 2.2 + stationProgress * 20) * 0.045
    const scale = pulse * (1 + proximity * 0.2)
    if (ring.current) ring.current.scale.setScalar(scale)
    if (orb.current) orb.current.emissiveIntensity = 1.2 + proximity * 3.2
    if (light.current) light.current.intensity = 0.35 + proximity * 2.6
  })

  return (
    <group position={position}>
      <mesh ref={ring} position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.28, 0.075, 10, 48]} />
        <meshStandardMaterial color="#e9c574" emissive="#d78e37" emissiveIntensity={1.6} metalness={0.7} roughness={0.24} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.94, 0.025, 6, 40]} />
        <meshBasicMaterial color="#fff1c5" transparent opacity={0.65} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial ref={orb} color="#fff0bd" emissive="#ffb34f" emissiveIntensity={1.2} roughness={0.18} toneMapped={false} />
      </mesh>
      <pointLight ref={light} position={[0, 1.1, 0]} color="#ffc76c" intensity={0.6} distance={8} decay={2} />
    </group>
  )
}

function stationProximity(progress: number, stationProgress: number) {
  return THREE.MathUtils.clamp(1 - Math.abs(progress - stationProgress) / 0.055, 0, 1)
}

function TrainWarmFill({ engineRef, curve, progressRef }: { engineRef: RefObject<THREE.Group | null>; curve: THREE.CatmullRomCurve3; progressRef: MutableRefObject<number> }) {
  const light = useRef<THREE.PointLight>(null)
  const tangent = useMemo(() => new THREE.Vector3(), [])
  const right = useMemo(() => new THREE.Vector3(), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])

  useFrame(() => {
    const engine = engineRef.current
    if (!engine || !light.current) return
    curve.getTangentAt(progressRef.current, tangent).setY(0).normalize()
    right.copy(tangent).cross(up).normalize()
    light.current.position.copy(engine.position).addScaledVector(tangent, -8).addScaledVector(right, 4).addScaledVector(up, 7)
  })

  return <pointLight ref={light} color="#ffc16d" intensity={34} distance={44} decay={1.4} />
}

const mistRibbonVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const mistRibbonFragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float edgeFade = smoothstep(0.0, 0.18, vUv.x) * (1.0 - smoothstep(0.78, 1.0, vUv.x));
    float verticalFade = smoothstep(0.0, 0.3, vUv.y) * (1.0 - smoothstep(0.55, 1.0, vUv.y));
    float wisps = 0.6 + 0.4 * sin(vUv.x * 24.0 + sin(vUv.y * 12.0 + uTime * 0.18) * 2.0 + uTime * 0.1);
    float alpha = edgeFade * verticalFade * wisps * uOpacity;
    vec3 mist = mix(vec3(0.23, 0.31, 0.42), vec3(0.48, 0.51, 0.55), vUv.y);
    gl_FragColor = vec4(mist, alpha);
  }
`

function DriftingMist({ reducedMotion }: { reducedMotion: boolean }) {
  const ribbons = useMemo(() => [-104, -82, -60, -38, -16, 6, 28, 50, 72, 94].map((x, index) => ({
    x,
    y: -4.1 + (index % 3) * 0.8,
    z: index % 2 ? -5.5 : 5.5,
    speed: [-0.25, 0.18, -0.13, 0.22, -0.19][index % 5],
    opacity: 0.16 + (index % 3) * 0.025,
  })), [])
  return <>{ribbons.map((ribbon, index) => (
    <MistRibbon key={index} {...ribbon} reducedMotion={reducedMotion} />
  ))}</>
}

function MistRibbon({ x, y, z, speed, opacity, reducedMotion }: { x: number; y: number; z: number; speed: number; opacity: number; reducedMotion: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.ShaderMaterial>(null)

  useFrame(({ clock }, delta) => {
    if (material.current) material.current.uniforms.uTime.value = reducedMotion ? 0 : clock.elapsedTime
    if (reducedMotion || !mesh.current) return
    mesh.current.position.x += speed * delta
    if (mesh.current.position.x > 122) mesh.current.position.x = -122
    if (mesh.current.position.x < -122) mesh.current.position.x = 122
  })

  return (
    <mesh ref={mesh} position={[x, y, z]}>
      <planeGeometry args={[34, 7, 1, 1]} />
      <shaderMaterial ref={material} vertexShader={mistRibbonVertexShader} fragmentShader={mistRibbonFragmentShader} uniforms={{ uTime: { value: 0 }, uOpacity: { value: opacity } }} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

function CameraFollow({ engineRef, curve, progressRef, reducedMotion }: { engineRef: RefObject<THREE.Group | null>; curve: THREE.CatmullRomCurve3; progressRef: MutableRefObject<number>; reducedMotion: boolean }) {
  const { camera, size } = useThree()
  const desiredPosition = useRef(new THREE.Vector3())
  const currentLookTarget = useRef(new THREE.Vector3())
  const consistCenter = useRef(new THREE.Vector3())
  const routeTangent = useRef(new THREE.Vector3())
  const rightVector = useRef(new THREE.Vector3())
  const lookTarget = useRef(new THREE.Vector3())
  const worldUp = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const hasCameraTarget = useRef(false)
  const previousMobileMode = useRef<boolean | null>(null)

  useFrame((_, delta) => {
    const engine = engineRef.current
    if (!engine) return
    const isMobile = size.width < 700
    if (camera instanceof THREE.PerspectiveCamera && previousMobileMode.current !== isMobile) {
      camera.fov = isMobile ? 76 : 55
      camera.updateProjectionMatrix()
      previousMobileMode.current = isMobile
    }
    const tangent = routeTangent.current
    curve.getTangentAt(progressRef.current, tangent).setY(0).normalize()
    const center = consistCenter.current.copy(engine.position).addScaledVector(tangent, -expressTrainCarSpacingDistance * 1.5)
    const right = rightVector.current.copy(tangent).cross(worldUp).normalize()
    const sideOffset = isMobile ? 21 : 16.5
    const verticalOffset = isMobile ? 5.5 : 4.2
    desiredPosition.current.set(
      center.x + right.x * sideOffset + tangent.x * 2.5,
      center.y + verticalOffset,
      center.z + right.z * sideOffset + tangent.z * 2.5,
    )
    lookTarget.current.copy(center).addScaledVector(worldUp, 1.4)

    if (!hasCameraTarget.current) {
      currentLookTarget.current.copy(lookTarget.current)
      camera.position.copy(desiredPosition.current)
      hasCameraTarget.current = true
    }
    if (reducedMotion) {
      camera.position.copy(desiredPosition.current)
      currentLookTarget.current.copy(lookTarget.current)
    } else {
      const smoothing = 1 - Math.exp(-delta * 3.6)
      camera.position.lerp(desiredPosition.current, smoothing)
      currentLookTarget.current.lerp(lookTarget.current, smoothing)
    }
    camera.lookAt(currentLookTarget.current)
  })

  return null
}
