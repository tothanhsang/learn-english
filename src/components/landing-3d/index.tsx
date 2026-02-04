"use client";

import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Three.js
const Scene3D = dynamic(
  () => import("./scene").then((mod) => mod.Scene3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white/60 text-lg">Loading 3D Scene...</div>
      </div>
    ),
  }
);

export { Scene3D };
