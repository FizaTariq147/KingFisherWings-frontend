import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const PRIMARY = '#0EA5E9'

// ── Network sphere — wireframe icosahedron with orbiting points ───────────
function NetworkSphere() {
  const groupRef = useRef<THREE.Group>(null)
  const innerRef  = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.12
    if (innerRef.current) innerRef.current.rotation.y -= delta * 0.08
  })

  // Generate points distributed on sphere surface (fibonacci sphere)
  const pointCount = 60
  const points: [number, number, number][] = []
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < pointCount; i++) {
    const y = 1 - (i / (pointCount - 1)) * 2
    const radius = Math.sqrt(1 - y * y)
    const theta = goldenAngle * i
    points.push([Math.cos(theta) * radius * 1.8, y * 1.8, Math.sin(theta) * radius * 1.8])
  }

  return (
    <group ref={groupRef}>
      {/* Outer wireframe icosahedron */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[1.8, 1]} />
        <meshBasicMaterial color={PRIMARY} wireframe transparent opacity={0.25} />
      </mesh>

      {/* Inner glass core */}
      <mesh>
        <icosahedronGeometry args={[1.2, 2]} />
        <meshPhysicalMaterial
          color={PRIMARY}
          transmission={0.9}
          thickness={1.5}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          ior={1.4}
        />
      </mesh>

      {/* Orbiting nodes */}
      {points.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color={i % 3 === 0 ? '#38BDF8' : PRIMARY} />
        </mesh>
      ))}
    </group>
  )
}

function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color={PRIMARY} transparent opacity={0.3} />
    </mesh>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color={PRIMARY} />
      <pointLight position={[-10, -5, -10]} intensity={0.4} color="#38BDF8" />

      <Suspense fallback={<Loader />}>
        <NetworkSphere />
        <Environment preset="city" />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.6}
        minPolarAngle={Math.PI / 2.4}
      />
    </Canvas>
  )
}