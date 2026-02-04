"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface OrbitalSystemProps {
  position: [number, number, number];
}

// Connecting arm from center to satellite
function ConnectingArm({ angle, length }: { angle: number; length: number }) {
  const endX = Math.cos(angle) * length;
  const endZ = Math.sin(angle) * length;

  return (
    <mesh position={[endX / 2, 0, endZ / 2]} rotation={[0, -angle + Math.PI / 2, 0]}>
      <boxGeometry args={[0.03, 0.03, length]} />
      <meshStandardMaterial
        color="#a78bfa"
        metalness={0.6}
        roughness={0.3}
        emissive="#7c3aed"
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

// Satellite sphere at end of arm
function AxisSatellite({
  label,
  angle,
  distance,
  labelSide = "right",
}: {
  label: string;
  angle: number;
  distance: number;
  labelSide?: "left" | "right" | "top";
}) {
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;

  const labelPos: [number, number, number] =
    labelSide === "left" ? [-0.6, 0.1, 0] :
    labelSide === "top" ? [0, 0.5, 0] :
    [0.6, 0.1, 0];

  return (
    <group position={[x, 0, z]}>
      <mesh>
        <sphereGeometry args={[0.18, 64, 64]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.85}
          roughness={0.15}
          emissive="#f59e0b"
          emissiveIntensity={0.25}
        />
      </mesh>
      <Html position={labelPos} center>
        <div
          className="whitespace-nowrap select-none pointer-events-none"
          style={{
            fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
            fontSize: '0.9rem',
            fontWeight: 500,
            letterSpacing: '0.12em',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 6px rgba(251, 191, 36, 0.5))',
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

export function OrbitalSystem({ position }: OrbitalSystemProps) {
  const centralRef = useRef<THREE.Mesh>(null);
  const axisGroupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (centralRef.current) {
      centralRef.current.rotation.y += 0.002;
    }
    if (axisGroupRef.current) {
      axisGroupRef.current.rotation.y += 0.002;
    }
  });

  // Larger arm length for more spacing
  const armLength = 2.5;

  // Angles spread wider apart
  const angleDSA = Math.PI + 0.6; // left-back
  const angleEnglish = 0; // right
  const angleTrade = Math.PI / 2 + 0.3; // front-bottom

  return (
    <group position={position}>
      {/* Project AI label - below center */}
      <Html position={[0, -0.8, 0.6]} center>
        <div
          className="whitespace-nowrap select-none pointer-events-none"
          style={{
            fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
            fontSize: '1rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            background: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 50%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.5))',
          }}
        >
          Project AI
        </div>
      </Html>

      {/* Central blue sphere - vibrant indigo */}
      <mesh ref={centralRef}>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshStandardMaterial
          color="#6366f1"
          metalness={0.6}
          roughness={0.25}
          emissive="#4338ca"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Axis group with arms - tilted 45° to look like ellipse from screen */}
      <group ref={axisGroupRef} rotation={[Math.PI / 4, 0, 0]}>
        {/* Orbit ring - larger with glow effect */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[armLength, 0.02, 16, 100]} />
          <meshStandardMaterial
            color="#8b5cf6"
            metalness={0.5}
            roughness={0.4}
            emissive="#7c3aed"
            emissiveIntensity={0.3}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Connecting arms (trục) */}
        <ConnectingArm angle={angleDSA} length={armLength} />
        <ConnectingArm angle={angleEnglish} length={armLength} />
        <ConnectingArm angle={angleTrade} length={armLength} />

        {/* Satellites at end of arms */}
        <AxisSatellite label="DSA" angle={angleDSA} distance={armLength} labelSide="left" />
        <AxisSatellite label="English" angle={angleEnglish} distance={armLength} labelSide="right" />
        <AxisSatellite label="Trade" angle={angleTrade} distance={armLength} labelSide="right" />
      </group>
    </group>
  );
}
