"use client";

import { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { KeyboardControls, Environment, Sky } from "@react-three/drei";
import * as THREE from "three";

import { BlockyHumanoid } from "@/components/characters/3d/BlockyHumanoid";
import { VoxBot } from "@/components/characters/3d/VoxBot";
import { VoxelPet } from "@/components/characters/3d/VoxelPet";

import { PlayerController } from "@/components/world/PlayerController";
import { FollowerController } from "@/components/world/FollowerController";
import { WorldEnvironment } from "@/components/world/Environment";

function CameraFollow({ targetRef }: { targetRef: React.RefObject<THREE.Group | null> }) {
  useFrame((state) => {
    if (!targetRef.current) return;
    
    // Desired camera position relative to target
    const targetPos = targetRef.current.position;
    
    // We want the camera to look at the player and stay slightly behind and above
    const cameraOffset = new THREE.Vector3(0, 4, 8);
    const desiredPos = targetPos.clone().add(cameraOffset);
    
    // Smoothly interpolate camera position
    state.camera.position.lerp(desiredPos, 0.1);
    
    // Keep camera looking at the target
    const lookAtPos = targetPos.clone().add(new THREE.Vector3(0, 1, 0)); // Look slightly above feet
    state.camera.lookAt(lookAtPos);
  });
  
  return null;
}

export default function PlaygroundPage() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState("connected");

  // References for follow logic
  const playerRef = useRef<THREE.Group>(null);
  const petRef = useRef<THREE.Group>(null);
  const botRef = useRef<THREE.Group>(null);

  // Keyboard mapping
  const keyboardMap = useMemo(() => [
    { name: "forward", keys: ["ArrowUp", "KeyW"] },
    { name: "backward", keys: ["ArrowDown", "KeyS"] },
    { name: "left", keys: ["ArrowLeft", "KeyA"] },
    { name: "right", keys: ["ArrowRight", "KeyD"] },
  ], []);

  return (
    <div className="h-screen w-full relative bg-slate-900 overflow-hidden">
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-lg border border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 mb-2">3D Playground</h1>
        <p className="text-sm text-slate-600 mb-4">Use WASD or Arrows to move.</p>
        
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input 
              type="checkbox" 
              checked={isSpeaking}
              onChange={(e) => setIsSpeaking(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            Global Speaking
          </label>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-slate-100 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5"
            >
              <option value="connected">Connected</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 text-white/50 text-sm pointer-events-none">
        Click characters to interact!
      </div>

      {/* 3D Scene */}
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
          <Sky sunPosition={[100, 20, 100]} />
          <ambientLight intensity={0.4} />
          <directionalLight 
            castShadow 
            position={[10, 20, 10]} 
            intensity={1.5} 
            shadow-mapSize={[1024, 1024]}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <Environment preset="city" />

          {/* World */}
          <WorldEnvironment />

          {/* Characters */}
          <PlayerController objectRef={playerRef} position={[0, 0, 0]}>
            <BlockyHumanoid isSpeaking={isSpeaking} status={status} />
          </PlayerController>

          <FollowerController objectRef={petRef} targetRef={playerRef} followDistance={2} position={[-2, 0, -2]}>
            <VoxelPet isSpeaking={isSpeaking} status={status} />
          </FollowerController>

          <FollowerController objectRef={botRef} targetRef={petRef} followDistance={2.5} position={[2, 0, -4]}>
            <VoxBot isSpeaking={isSpeaking} status={status} />
          </FollowerController>

          {/* Camera Follower */}
          <CameraFollow targetRef={playerRef} />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}
