"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function NeonTube({
  start,
  end,
  color = "#00e5ff",
  radius = 0.15,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  radius?: number;
}) {
  const s = new THREE.Vector3(...start);
  const e = new THREE.Vector3(...end);
  const mid = s.clone().add(e).multiplyScalar(0.5);
  const length = s.distanceTo(e);
  const dir = e.clone().sub(s).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir
  );

  return (
    <group position={mid} quaternion={quat}>
      {/* Transparent outer tube */}
      <mesh>
        <cylinderGeometry args={[radius, radius, length, 12, 1, true]} />
        <meshStandardMaterial
          color="#8ecae6"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Glowing inner core */}
      <mesh>
        <cylinderGeometry args={[radius * 0.3, radius * 0.3, length, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      {/* Ring joints */}
      <mesh position={[0, length / 2, 0]}>
        <torusGeometry args={[radius, 0.03, 8, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, -length / 2, 0]}>
        <torusGeometry args={[radius, 0.03, 8, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Building({
  position,
  width,
  depth,
  height,
  color,
  accentColor = "#00e5ff",
}: {
  position: [number, number, number];
  width: number;
  depth: number;
  height: number;
  color: string;
  accentColor?: string;
}) {
  const windowRows = Math.floor(height / 1.2);
  const windowCols = Math.max(2, Math.floor(width / 1.0));

  return (
    <group position={position}>
      {/* Main structure */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>

      {/* Window grid on front face */}
      {Array.from({ length: windowRows }).map((_, row) =>
        Array.from({ length: windowCols }).map((_, col) => {
          const isLit = Math.random() > 0.35;
          const xStart = -width / 2 + 0.4;
          const xSpacing = (width - 0.8) / Math.max(windowCols - 1, 1);
          return (
            <mesh
              key={`w-${row}-${col}`}
              position={[
                xStart + col * xSpacing,
                1.0 + row * 1.2,
                depth / 2 + 0.01,
              ]}
            >
              <planeGeometry args={[0.4, 0.6]} />
              <meshBasicMaterial
                color={isLit ? accentColor : "#1a1a2e"}
                transparent
                opacity={isLit ? 0.9 : 0.5}
              />
            </mesh>
          );
        })
      )}

      {/* Rooftop antenna / spire */}
      {height > 8 && (
        <group position={[0, height, 0]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 2, 6]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      )}

      {/* Neon accent stripe */}
      <mesh position={[0, height + 0.05, 0]}>
        <boxGeometry args={[width + 0.1, 0.08, depth + 0.1]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function LandingPad({ position }: { position: [number, number, number] }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.1, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Glowing ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <torusGeometry args={[2, 0.06, 8, 32]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.8} />
      </mesh>
      {/* Center H marker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.02, 16]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function FloatingBillboard({
  position,
  text,
  color = "#00e5ff",
}: {
  position: [number, number, number];
  text?: string;
  color?: string;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Billboard frame */}
      <mesh>
        <boxGeometry args={[3, 1.5, 0.1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Screen glow */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2.8, 1.3]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      {/* Support pole */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.5, 6]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function StreetLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 3, 6]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Arm */}
      <mesh position={[0.4, 3, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 6]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Light */}
      <mesh position={[0.7, 3.2, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      <pointLight position={[0.7, 3.2, 0]} color="#fef08a" intensity={5} distance={14} />
    </group>
  );
}

export function FuturamaEnvironment() {
  const buildings = useMemo(() => {
    const palette = ["#334155", "#1e293b", "#2d3250", "#1e3a5f", "#1e293b"];
    const accents = ["#00e5ff", "#e040fb", "#76ff03", "#ffab00", "#00e676"];
    const arr: {
      x: number;
      z: number;
      w: number;
      d: number;
      h: number;
      color: string;
      accent: string;
      key: number;
    }[] = [];

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 12 + Math.random() * 35;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const w = 2 + Math.random() * 4;
      const d = 2 + Math.random() * 4;
      const h = 4 + Math.random() * 16;

      arr.push({
        x,
        z,
        w,
        d,
        h,
        color: palette[Math.floor(Math.random() * palette.length)],
        accent: accents[Math.floor(Math.random() * accents.length)],
        key: i,
      });
    }
    return arr;
  }, []);

  const streetLights = useMemo(() => {
    const arr: { x: number; z: number; key: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 8 + Math.random() * 4;
      arr.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        key: i,
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {/* Ground - metallic street */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.0, 0]}
        receiveShadow
      >
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial
          color="#2d3748"
          metalness={0.3}
          roughness={0.6}
        />
      </mesh>

      {/* Glowing grid lines on ground */}
      {Array.from({ length: 13 }).map((_, i) => {
        const offset = -30 + i * 5;
        return (
          <group key={`grid-${i}`}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[offset, -0.99, 0]}
            >
              <planeGeometry args={[0.04, 120]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} />
            </mesh>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.99, offset]}
            >
              <planeGeometry args={[120, 0.04]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} />
            </mesh>
          </group>
        );
      })}

      {/* Central plaza - circular platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.98, 0]}>
        <circleGeometry args={[6, 32]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.97, 0]}>
        <torusGeometry args={[6, 0.05, 8, 48]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
      </mesh>

      {/* Buildings */}
      {buildings.map((b) => (
        <Building
          key={b.key}
          position={[b.x, -1, b.z]}
          width={b.w}
          depth={b.d}
          height={b.h}
          color={b.color}
          accentColor={b.accent}
        />
      ))}

      {/* Transport tubes connecting some buildings */}
      <NeonTube start={[-15, 6, -10]} end={[15, 8, -12]} color="#00e5ff" />
      <NeonTube start={[-18, 10, 8]} end={[10, 7, 15]} color="#e040fb" />
      <NeonTube start={[8, 5, -18]} end={[20, 12, 5]} color="#76ff03" />
      <NeonTube start={[-12, 8, 12]} end={[-20, 6, -8]} color="#ffab00" />

      {/* Landing pads */}
      <LandingPad position={[8, -0.95, 5]} />
      <LandingPad position={[-7, -0.95, -6]} />

      {/* Floating billboards */}
      <FloatingBillboard position={[5, 5, -8]} color="#e040fb" />
      <FloatingBillboard position={[-10, 7, 6]} color="#00e5ff" />
      <FloatingBillboard position={[12, 4, 10]} color="#76ff03" />

      {/* Street lights */}
      {streetLights.map((sl) => (
        <StreetLight key={sl.key} position={[sl.x, -1, sl.z]} />
      ))}

      {/* Planet Express-style building near spawn */}
      <group position={[-4, -1, -9]}>
        {/* Main hangar */}
        <mesh position={[0, 2.5, 0]} castShadow>
          <boxGeometry args={[6, 5, 5]} />
          <meshStandardMaterial color="#4a5568" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Dome roof */}
        <mesh position={[0, 5, 0]} castShadow>
          <sphereGeometry args={[3.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#e040fb" metalness={0.3} roughness={0.5} transparent opacity={0.7} />
        </mesh>
        {/* Hangar door */}
        <mesh position={[0, 1.5, 2.51]}>
          <planeGeometry args={[3, 3]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Door accent */}
        <mesh position={[0, 1.5, 2.52]}>
          <planeGeometry args={[3.2, 0.08]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
        {/* Rooftop antenna dish */}
        <group position={[2, 5.5, -1]}>
          <mesh rotation={[Math.PI / 6, 0, 0]}>
            <sphereGeometry args={[0.8, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 2, 6]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* Ambient glow lights around the plaza */}
      <pointLight position={[0, 1, 0]} color="#00e5ff" intensity={8} distance={20} />
      <pointLight position={[10, 1, 10]} color="#e040fb" intensity={5} distance={18} />
      <pointLight position={[-10, 1, -10]} color="#76ff03" intensity={5} distance={18} />
      <pointLight position={[10, 1, -10]} color="#ffab00" intensity={4} distance={16} />
      <pointLight position={[-10, 1, 10]} color="#00e5ff" intensity={4} distance={16} />
    </group>
  );
}
