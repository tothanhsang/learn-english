"use client";

import { Line } from "@react-three/drei";

interface ConnectingLineProps {
  start: [number, number, number];
  end: [number, number, number];
}

export function ConnectingLine({ start, end }: ConnectingLineProps) {
  return (
    <Line
      points={[start, end]}
      color="#8b5cf6"
      transparent
      opacity={0.6}
      lineWidth={1}
    />
  );
}
