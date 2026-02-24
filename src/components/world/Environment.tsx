"use client";

import { useMemo } from "react";
import * as THREE from "three";

export function WorldEnvironment() {
  // Generate random tree positions
  const trees = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      // Random position avoiding the center (radius > 5, < 25)
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 20;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      // Random scale for variation
      const scale = 0.5 + Math.random() * 1.5;
      arr.push({ x, z, scale, key: i });
    }
    return arr;
  }, []);

  return (
    <group>
      {/* Grass Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#84cc16" /> {/* Lime 500 */}
      </mesh>

      {/* Trees */}
      {trees.map((t) => (
        <group key={t.key} position={[t.x, 0, t.z]} scale={[t.scale, t.scale, t.scale]}>
          {/* Trunk */}
          <mesh position={[0, -0.5, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 1]} />
            <meshStandardMaterial color="#78350f" /> {/* Amber 900 */}
          </mesh>
          {/* Leaves */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <coneGeometry args={[1.5, 2, 8]} />
            <meshStandardMaterial color="#22c55e" /> {/* Emerald 500 */}
          </mesh>
          <mesh position={[0, 1.2, 0]} castShadow>
            <coneGeometry args={[1.2, 1.5, 8]} />
            <meshStandardMaterial color="#16a34a" /> {/* Emerald 600 */}
          </mesh>
        </group>
      ))}
    </group>
  );
}
