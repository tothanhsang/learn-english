"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface ConnectingLineProps {
  start: [number, number, number];
  end: [number, number, number];
}

export function ConnectingLine({ start, end }: ConnectingLineProps) {
  const points = useMemo(() => {
    return [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  }, [start, end]);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [points]);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="#8b5cf6" transparent opacity={0.6} />
    </line>
  );
}
