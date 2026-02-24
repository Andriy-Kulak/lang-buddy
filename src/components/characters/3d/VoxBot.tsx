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
  const jawRef = useRef<THREE.Group>(null);

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
      // Jaw opens and closes like Bender - hinges down from the top edge
      if (jawRef.current) {
        const jawAngle = Math.abs(Math.sin(t * 12)) * 0.35;
        jawRef.current.rotation.x = jawAngle;
      }
    } else {
      // Smoothly close jaw
      if (jawRef.current) {
        jawRef.current.rotation.x = THREE.MathUtils.lerp(jawRef.current.rotation.x, 0, 0.2);
      }
    }

    // Spin animation on click
    if (groupRef.current) {
      if (isSpinning) {
        groupRef.current.rotation.y += 0.15;
        groupRef.current.position.y = Math.sin(t * 10) * 0.2;
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

        {/* Upper lip / mouth frame - fixed to head */}
        <mesh position={[0, 0.12, 0.32]} castShadow>
          <boxGeometry args={[0.32, 0.06, 0.1]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        {/* Upper teeth */}
        {[-0.09, -0.03, 0.03, 0.09].map((xOff, i) => (
          <mesh key={`tooth-upper-${i}`} position={[xOff, 0.08, 0.38]}>
            <boxGeometry args={[0.04, 0.04, 0.02]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        ))}

        {/* Jaw group - pivots from top edge (y=0.06) so it swings DOWN */}
        <group ref={jawRef} position={[0, 0.06, 0.25]}>
          {/* Jaw plate */}
          <mesh position={[0, -0.06, 0.07]} castShadow>
            <boxGeometry args={[0.32, 0.1, 0.1]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>
          {/* Lower teeth */}
          {[-0.09, -0.03, 0.03, 0.09].map((xOff, i) => (
            <mesh key={`tooth-lower-${i}`} position={[xOff, -0.005, 0.13]}>
              <boxGeometry args={[0.04, 0.03, 0.02]} />
              <meshStandardMaterial color="#e2e8f0" />
            </mesh>
          ))}
          {/* Jaw grill lines */}
          <mesh position={[0, -0.04, 0.13]}>
            <boxGeometry args={[0.25, 0.01, 0.01]} />
            <meshStandardMaterial color={blackMetal} />
          </mesh>
          <mesh position={[0, -0.08, 0.13]}>
            <boxGeometry args={[0.25, 0.01, 0.01]} />
            <meshStandardMaterial color={blackMetal} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
