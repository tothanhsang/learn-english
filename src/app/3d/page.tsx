"use client";

import Link from "next/link";
import { Scene3D } from "@/components/landing-3d";

export default function Scene3DPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D Background - Full Screen */}
      <div className="absolute inset-0">
        <Scene3D />
      </div>

      {/* Overlay content */}
      <div className="relative z-10 min-h-screen flex flex-col pointer-events-none">
        {/* Header */}
        <header className="flex justify-between items-center p-6 pointer-events-auto">
          <Link
            href="/"
            className="text-2xl font-bold"
            style={{
              fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
              background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Learn English
          </Link>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-5 py-2 text-white/80 hover:text-white transition font-grotesk"
            >
              ← Back
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition border border-white/20 font-grotesk"
            >
              Sign Up
            </Link>
          </div>
        </header>

        {/* Main content - bottom section */}
        <div className="flex-1 flex flex-col justify-end pb-16 px-6 pointer-events-auto">
          <div className="max-w-2xl">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
                background: 'linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Project AI Ecosystem
            </h2>
            <p className="text-white/60 text-lg mb-6 font-inter">
              Explore the interconnected learning paths: FAP, Groove, DSA, English, and Trade
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/signup"
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition font-grotesk"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative diamond */}
        <div className="absolute bottom-4 right-4 text-violet-400/30 text-2xl">
          ◆
        </div>
      </div>
    </div>
  );
}
