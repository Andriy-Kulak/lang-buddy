"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  isSpeaking: boolean;
  status: string;
}

export function VoxelPet({ isSpeaking, status }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Group>(null);

  const [isJumping, setIsJumping] = useState(false);
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
    if (!isJumping && !isTalkingLocal) {
      setIsJumping(true);
      setIsTalkingLocal(true);
      setTimeout(() => {
        setIsJumping(false);
        setIsTalkingLocal(false);
      }, 1500);
    }
  };

  const activeSpeaking = isSpeaking || isTalkingLocal;

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (activeSpeaking) {
      // Wag tail fast
      if (tailRef.current) {
        tailRef.current.rotation.z = Math.sin(t * 15) * 0.3;
      }
      // Tilt head
      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(t * 4) * 0.1;
      }
      // Animate jaw (opening and closing)
      if (jawRef.current) {
        jawRef.current.rotation.x = -0.1 - Math.abs(Math.sin(t * 12)) * 0.2;
      }
    } else {
      // Wag tail slowly
      if (tailRef.current) {
        tailRef.current.rotation.z = Math.sin(t * 3) * 0.1;
      }
      if (headRef.current) {
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, 0, 0.1);
      }
      if (jawRef.current) {
        jawRef.current.rotation.x = THREE.MathUtils.lerp(jawRef.current.rotation.x, 0, 0.2);
      }
    }

    // Jump animation
    if (groupRef.current) {
      if (isJumping) {
        // Simple hop
        groupRef.current.position.y = -0.5 + Math.abs(Math.sin(t * 8)) * 0.6;
        if (headRef.current) {
          headRef.current.rotation.x = Math.sin(t * 15) * 0.2; // nod while jumping
        }
      } else {
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -0.5, 0.2);
        if (headRef.current && !activeSpeaking) {
          headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0, 0.1);
        }
      }
    }
  });

  const collarColor = status === "connected" ? "#10b981" : status === "error" ? "#ef4444" : "#f59e0b";
  const petColor = "#fcd34d";

  return (
    <group 
      ref={groupRef} 
      position={[0, -0.5, 0]}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Body */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1, 0.8, 1.4]} />
        <meshStandardMaterial color={petColor} />
      </mesh>

      {/* Head Group */}
      <group ref={headRef} position={[0, 1.2, 0.6]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color={petColor} />
        </mesh>
        
        {/* Upper Snout */}
        <mesh position={[0, -0.05, 0.5]} castShadow>
          <boxGeometry args={[0.4, 0.2, 0.4]} />
          <meshStandardMaterial color="#fef3c7" />
        </mesh>
        
        {/* Nose */}
        <mesh position={[0, 0.1, 0.7]}>
          <boxGeometry args={[0.15, 0.1, 0.1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        
        {/* Lower Jaw (animated) */}
        <group ref={jawRef} position={[0, -0.2, 0.5]}>
          <mesh castShadow>
            <boxGeometry args={[0.35, 0.1, 0.35]} />
            <meshStandardMaterial color="#fef3c7" />
          </mesh>
          {/* Tongue */}
          <mesh position={[0, 0.06, 0.1]}>
            <boxGeometry args={[0.15, 0.05, 0.2]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>

        {/* Eyes */}
        <mesh position={[-0.2, 0.15, 0.41]}>
          <boxGeometry args={[0.1, 0.15, 0.05]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.2, 0.15, 0.41]}>
          <boxGeometry args={[0.1, 0.15, 0.05]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.3, 0.5, 0]} castShadow>
          <boxGeometry args={[0.2, 0.3, 0.2]} />
          <meshStandardMaterial color="#d97706" />
        </mesh>
        <mesh position={[0.3, 0.5, 0]} castShadow>
          <boxGeometry args={[0.2, 0.3, 0.2]} />
          <meshStandardMaterial color="#d97706" />
        </mesh>
      </group>

      {/* Collar */}
      <mesh position={[0, 0.9, 0.5]}>
        <boxGeometry args={[0.85, 0.15, 0.85]} />
        <meshStandardMaterial color={collarColor} />
      </mesh>

      {/* Tail Group */}
      <group ref={tailRef} position={[0, 0.8, -0.7]}>
        <mesh position={[0, 0.3, -0.2]} castShadow>
          <boxGeometry args={[0.15, 0.6, 0.15]} />
          <meshStandardMaterial color="#d97706" />
        </mesh>
      </group>

      {/* Legs */}
      <mesh position={[-0.3, 0.2, 0.5]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color={petColor} />
      </mesh>
      <mesh position={[0.3, 0.2, 0.5]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color={petColor} />
      </mesh>
      <mesh position={[-0.3, 0.2, -0.5]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color={petColor} />
      </mesh>
      <mesh position={[0.3, 0.2, -0.5]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color={petColor} />
      </mesh>
    </group>
  );
}
