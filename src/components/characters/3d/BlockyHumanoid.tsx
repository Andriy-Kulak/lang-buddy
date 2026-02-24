"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  isSpeaking: boolean;
  status: string;
}

export function BlockyHumanoid({ isSpeaking, status }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);

  const [isWaving, setIsWaving] = useState(false);
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
    if (!isWaving && !isTalkingLocal) {
      setIsWaving(true);
      setIsTalkingLocal(true);
      setTimeout(() => {
        setIsWaving(false);
        setIsTalkingLocal(false);
      }, 2500);
    }
  };

  const activeSpeaking = isSpeaking || isTalkingLocal;

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (activeSpeaking) {
      // Bob the head
      if (headRef.current) {
        headRef.current.position.y = 1.6 + Math.sin(t * 8) * 0.05;
      }
      // Animate mouth
      if (mouthRef.current) {
        mouthRef.current.scale.y = 1 + Math.abs(Math.sin(t * 15)) * 2;
      }
    } else {
      // Reset positions smoothly
      if (headRef.current) {
        headRef.current.position.y = THREE.MathUtils.lerp(headRef.current.position.y, 1.6, 0.2);
      }
      if (mouthRef.current) {
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 1, 0.3);
      }
    }

    // Handle Arm Waving vs Idle
    if (isWaving) {
      // Waving right arm
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, Math.PI / 1.2, 0.1);
        rightArmRef.current.rotation.x = Math.sin(t * 15) * 0.3;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.1);
      }
    } else {
      // Idle arm swinging
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0, 0.1);
        const targetX = activeSpeaking ? -Math.sin(t * 8) * 0.2 : 0;
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, targetX, 0.1);
      }
      if (leftArmRef.current) {
        const targetX = activeSpeaking ? Math.sin(t * 8) * 0.2 : 0;
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, targetX, 0.1);
      }
    }
  });

  const skinColor = "#fcdeb3";
  const shirtColor = status === "connected" ? "#34d399" : status === "error" ? "#f87171" : "#38bdf8";

  return (
    <group
      ref={groupRef}
      position={[0, -1, 0]}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color={skinColor} />
        
        {/* Face Features */}
        <group position={[0, 0, 0.41]}>
          {/* Left Eye */}
          <mesh position={[-0.15, 0.1, 0]}>
            <boxGeometry args={[0.1, 0.1, 0.05]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Right Eye */}
          <mesh position={[0.15, 0.1, 0]}>
            <boxGeometry args={[0.1, 0.1, 0.05]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Mouth */}
          <mesh ref={mouthRef} position={[0, -0.15, 0]}>
            <boxGeometry args={[0.2, 0.05, 0.05]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1, 1, 0.5]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.7, 1.1, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.4, 1, 0.4]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.7, 1.1, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.4, 1, 0.4]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      {/* Legs */}
      <mesh position={[-0.25, 0.1, 0]} castShadow>
        <boxGeometry args={[0.4, 0.8, 0.4]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[0.25, 0.1, 0]} castShadow>
        <boxGeometry args={[0.4, 0.8, 0.4]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
    </group>
  );
}
