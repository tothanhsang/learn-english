"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface PlatformSphereProps {
  position: [number, number, number];
  label: string;
  showPlatform?: boolean;
  sphereScale?: number;
}

export function PlatformSphere({
  position,
  label,
  showPlatform = true,
  sphereScale = 0.35,
}: PlatformSphereProps) {
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.position.y =
        0.4 + Math.sin(state.clock.elapsedTime * 1.5 + position[1]) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Platform disc - thin ring style with gradient effect */}
      {showPlatform && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <torusGeometry args={[0.6, 0.05, 16, 64]} />
          <meshStandardMaterial
            color="#6366f1"
            metalness={0.7}
            roughness={0.3}
            emissive="#4338ca"
            emissiveIntensity={0.15}
          />
        </mesh>
      )}

      {/* Sphere with vibrant gradient-like effect */}
      <mesh ref={sphereRef} position={[0, 0.3, 0]}>
        <sphereGeometry args={[sphereScale, 64, 64]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.85}
          roughness={0.15}
          emissive="#f59e0b"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Label - positioned further left with better styling */}
      <Html position={[-1.8, 0.3, 0]} center>
        <div
          className="whitespace-nowrap select-none pointer-events-none"
          style={{
            fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
            fontSize: '1.1rem',
            fontWeight: 500,
            letterSpacing: '0.15em',
            background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 50%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            filter: 'drop-shadow(0 2px 8px rgba(99, 102, 241, 0.4))',
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}
