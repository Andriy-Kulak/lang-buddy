"use client";

import { useRef, ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  children: ReactNode;
  targetRef: React.RefObject<THREE.Group | null>;
  position?: [number, number, number];
  followDistance?: number;
  objectRef: React.RefObject<THREE.Group | null>;
}

export function FollowerController({ children, targetRef, position = [0, 0, 0], followDistance = 2, objectRef }: Props) {
  
  useFrame((state, delta) => {
    const target = targetRef.current;
    const group = objectRef.current;

    if (!target || !group) return;

    const targetPos = target.position.clone();
    const currentPos = group.position.clone();
    
    // Ignore Y axis for distance calculation
    targetPos.y = 0;
    currentPos.y = 0;

    const distance = currentPos.distanceTo(targetPos);

    if (distance > followDistance) {
      // Direction to target
      const direction = targetPos.clone().sub(currentPos).normalize();
      
      // Desired position is behind target at followDistance
      const desiredPos = targetPos.clone().sub(direction.clone().multiplyScalar(followDistance));
      
      // Lerp position for smooth following
      group.position.x = THREE.MathUtils.lerp(group.position.x, desiredPos.x, 5 * delta);
      group.position.z = THREE.MathUtils.lerp(group.position.z, desiredPos.z, 5 * delta);

      // Rotate to face movement direction
      const targetRotation = Math.atan2(direction.x, direction.z);
      
      let currentRotation = group.rotation.y;
      while (currentRotation <= -Math.PI) currentRotation += Math.PI * 2;
      while (currentRotation > Math.PI) currentRotation -= Math.PI * 2;
      
      let diff = targetRotation - currentRotation;
      while (diff <= -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      group.rotation.y = currentRotation + diff * 8 * delta;

      // Walking bounce animation
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
