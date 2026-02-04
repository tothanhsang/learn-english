"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense } from "react";
import { OrbitalSystem } from "./orbital-system";
import { PlatformSphere } from "./platform-sphere";
import { StarsBackground } from "./stars-background";
import { ConnectingLine } from "./connecting-line";

function Scene3DContent() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1, 12]} fov={55} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.1}
      />

      {/* Stars background */}
      <StarsBackground />

      {/* Lighting - brighter for better visibility */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <directionalLight position={[-5, 5, -5]} intensity={0.6} color="#ffffff" />
      <pointLight position={[0, 5, 5]} intensity={0.8} color="#ffd700" />
      <pointLight position={[0, -3, 5]} intensity={0.5} color="#ffd700" />

      {/* Connecting lines between platforms - vertical axis */}
      <ConnectingLine start={[0, 4.4, 0]} end={[0, 2.6, 0]} />
      <ConnectingLine start={[0, 2, 0]} end={[0, -0.5, 0]} />

      {/* Top platforms - FAP (most important) and Groove */}
      <PlatformSphere position={[0, 4, 0]} label="FAP" />
      <PlatformSphere position={[0, 2, 0]} label="Groove" />

      {/* Main orbital system - Project AI with DSA, English, Trade branches */}
      <OrbitalSystem position={[0, -1.2, 0]} />
    </>
  );
}

export function Scene3D() {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-950 via-indigo-950/50 to-slate-950">
      <Canvas>
        <Suspense fallback={null}>
          <Scene3DContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
