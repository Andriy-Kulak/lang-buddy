"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  isSpeaking: boolean;
  status: string;
}

export function VoxBot({ isSpeaking, status }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Group>(null);

  const [isSpinning, setIsSpinning] = useState(false);
  const [isTalkingLocal, setIsTalkingLocal] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!isSpinning && !isTalkingLocal) {
      setIsSpinning(true);
      setIsTalkingLocal(true);
      setTimeout(() => {
        setIsSpinning(false);
        setIsTalkingLocal(false);
      }, 1500);
    }
  };

  const activeSpeaking = isSpeaking || isTalkingLocal;

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (activeSpeaking) {
      // Bob the head slightly
      if (headRef.current) {
        headRef.current.position.y = 1.3 + Math.sin(t * 8) * 0.05;
      }
      // Move mouth grill rapidly
      if (mouthRef.current) {
        mouthRef.current.scale.y = 1 + Math.abs(Math.sin(t * 15)) * 0.3;
      }
    } else {
      // Reset positions smoothly
      if (headRef.current) {
        headRef.current.position.y = THREE.MathUtils.lerp(headRef.current.position.y, 1.3, 0.2);
      }
      if (mouthRef.current) {
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 1, 0.3);
      }
    }

    // Spin animation on click
    if (groupRef.current) {
      if (isSpinning) {
        groupRef.current.rotation.y += 0.15;
        groupRef.current.position.y = Math.sin(t * 10) * 0.2; // slight hop
      } else {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.1);
      }
    }
  });

  const eyeColor = status === "connected" ? "#fef08a" : status === "error" ? "#f87171" : "#e2e8f0";
  const bodyColor = "#94a3b8"; // Silver
  const darkMetal = "#475569";
  const blackMetal = "#1e293b";

  return (
    <group 
      ref={groupRef} 
      position={[0, -0.6, 0]}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Torso */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 1.2, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* Door on Torso */}
      <mesh position={[0, 0.6, 0.49]}>
        <planeGeometry args={[0.6, 0.8]} />
        <meshStandardMaterial color={darkMetal} />
      </mesh>

      {/* Shoulders / Arm sockets */}
      <mesh position={[-0.55, 1.0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.55, 1.0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* Arms (Resting) */}
      <mesh position={[-0.6, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.6, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      
      {/* Feet */}
      <mesh position={[-0.2, -0.25, 0.1]} castShadow>
        <sphereGeometry args={[0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.2, -0.25, 0.1]} castShadow>
        <sphereGeometry args={[0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* Head Group */}
      <group ref={headRef} position={[0, 1.3, 0]}>
        {/* Neck */}
        <mesh position={[0, -0.1, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 0.2, 16]} />
          <meshStandardMaterial color={darkMetal} />
        </mesh>
        
        {/* Head Base (Cylinder) */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.5, 16]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        
        {/* Head Top (Dome) */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        
        {/* Antenna */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.05, 0.4, 8]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        <mesh position={[0, 1.0, 0]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>

        {/* Visor Extrusion */}
        <mesh position={[0, 0.35, 0.25]} castShadow>
          <boxGeometry args={[0.5, 0.25, 0.2]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>

        {/* Visor Black Screen */}
        <mesh position={[0, 0.35, 0.36]} castShadow>
          <boxGeometry args={[0.45, 0.2, 0.02]} />
          <meshStandardMaterial color={blackMetal} />
        </mesh>

        {/* Eyes inside Visor */}
        <mesh position={[-0.1, 0.35, 0.38]}>
          <boxGeometry args={[0.1, 0.1, 0.02]} />
          <meshBasicMaterial color={eyeColor} />
        </mesh>
        <mesh position={[0.1, 0.35, 0.38]}>
          <boxGeometry args={[0.1, 0.1, 0.02]} />
          <meshBasicMaterial color={eyeColor} />
        </mesh>
        {/* Pupils */}
        <mesh position={[-0.1, 0.35, 0.395]}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0.1, 0.35, 0.395]}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Mouth Extrusion */}
        <mesh position={[0, 0.1, 0.25]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.25, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>

        {/* Grill Mouth */}
        <group ref={mouthRef} position={[0, 0.1, 0.36]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.3, 0.15, 0.05]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>
          {/* Grill Lines */}
          <mesh position={[0, 0.04, 0.03]}>
            <boxGeometry args={[0.25, 0.01, 0.01]} />
            <meshStandardMaterial color={blackMetal} />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <boxGeometry args={[0.25, 0.01, 0.01]} />
            <meshStandardMaterial color={blackMetal} />
          </mesh>
          <mesh position={[0, -0.04, 0.03]}>
            <boxGeometry args={[0.25, 0.01, 0.01]} />
            <meshStandardMaterial color={blackMetal} />
          </mesh>
          <mesh position={[-0.04, 0, 0.03]}>
            <boxGeometry args={[0.01, 0.1, 0.01]} />
            <meshStandardMaterial color={blackMetal} />
          </mesh>
          <mesh position={[0.04, 0, 0.03]}>
            <boxGeometry args={[0.01, 0.1, 0.01]} />
            <meshStandardMaterial color={blackMetal} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
