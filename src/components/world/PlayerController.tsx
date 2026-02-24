"use client";

import { useRef, ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  children: ReactNode;
  position?: [number, number, number];
  objectRef: React.RefObject<THREE.Group | null>;
}

export function PlayerController({ children, position = [0, 0, 0], objectRef }: Props) {
  const [, getKeys] = useKeyboardControls();
  const speed = 4;
  const rotationSpeed = 5;

  const currentVelocity = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const { forward, backward, left, right } = getKeys();
    const group = objectRef.current;
    if (!group) return;

    // Movement direction vector
    const direction = new THREE.Vector3();
    if (forward) direction.z -= 1;
    if (backward) direction.z += 1;
    if (left) direction.x -= 1;
    if (right) direction.x += 1;

    direction.normalize();

    // Apply movement
    if (direction.lengthSq() > 0) {
      // Calculate target rotation based on movement direction
      const targetRotation = Math.atan2(direction.x, direction.z);
      
      // Smoothly rotate character to face movement direction
      // We use shortest path to target rotation
      let currentRotation = group.rotation.y;
      
      // Normalize rotations
      while (currentRotation <= -Math.PI) currentRotation += Math.PI * 2;
      while (currentRotation > Math.PI) currentRotation -= Math.PI * 2;
      
      let diff = targetRotation - currentRotation;
      while (diff <= -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      group.rotation.y = currentRotation + diff * rotationSpeed * delta;

      // Move character forward
      const velocity = direction.multiplyScalar(speed * delta);
      group.position.add(velocity);

      // Simple walking bounce animation
      group.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 15)) * 0.05;
    } else {
      // Idle
      group.position.y = THREE.MathUtils.lerp(group.position.y, 0, 0.1);
    }
  });

  return (
    <group ref={objectRef} position={position}>
      {children}
    </group>
  );
}
