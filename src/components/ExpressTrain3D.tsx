import { useCallback, useMemo, type MutableRefObject, type RefObject } from 'react'
import { useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import locomotiveTextureUrl from '../assets/timeline/hackwarts-express-locomotive.png'

type ExpressTrain3DProps = {
  curve: THREE.CatmullRomCurve3
  progressRef: MutableRefObject<number>
  engineRef: RefObject<THREE.Group | null>
}

export function ExpressTrain3D({ curve, progressRef, engineRef }: ExpressTrain3DProps) {
  const { size } = useThree()
  const prepareTexture = useCallback((loadedTexture: THREE.Texture) => {
    loadedTexture.colorSpace = THREE.SRGBColorSpace
    loadedTexture.anisotropy = 8
  }, [])
  const texture = useTexture(locomotiveTextureUrl, prepareTexture)
  const imageWidth = size.width < 700 ? 17 : 26
  const imageHeight = imageWidth / 3
  const tangent = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const train = engineRef.current
    if (!train) return

    const progress = THREE.MathUtils.clamp(progressRef.current, 0, 1)
    const point = curve.getPointAt(progress)
    curve.getTangentAt(progress, tangent).setY(0).normalize()
    point.y = 0.08

    train.position.copy(point)
    train.rotation.set(0, Math.atan2(-tangent.z, tangent.x), 0)
  })

  return (
    <group ref={engineRef}>
      <mesh position={[0, imageHeight / 2, 0]}>
        <planeGeometry args={[imageWidth, imageHeight]} />
        <meshBasicMaterial map={texture} transparent alphaTest={0.015} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
