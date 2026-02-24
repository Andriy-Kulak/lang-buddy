"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { KeyboardControls, Stars } from "@react-three/drei";
import * as THREE from "three";

import { BlockyHumanoid } from "@/components/characters/3d/BlockyHumanoid";
import { VoxBot } from "@/components/characters/3d/VoxBot";
import { VoxelPet } from "@/components/characters/3d/VoxelPet";

import { PlayerController } from "@/components/world/PlayerController";
import { FuturamaEnvironment } from "@/components/world/FuturamaEnvironment";

function OrbitCamera({ targetRef }: { targetRef: React.RefObject<THREE.Group | null> }) {
  const { gl } = useThree();
  const angleRef = useRef(0);
  const pitchRef = useRef(0.4);
  const distanceRef = useRef(10);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback((e: PointerEvent) => {
    if (e.button === 0 || e.button === 2) {
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    angleRef.current -= dx * 0.005;
    pitchRef.current = THREE.MathUtils.clamp(pitchRef.current - dy * 0.005, 0.1, 1.2);
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const onWheel = useCallback((e: WheelEvent) => {
    distanceRef.current = THREE.MathUtils.clamp(distanceRef.current + e.deltaY * 0.01, 4, 25);
  }, []);

  const onContextMenu = useCallback((e: Event) => e.preventDefault(), []);

  useEffect(() => {
    const dom = gl.domElement;
    dom.addEventListener("pointerdown", onPointerDown);
    dom.addEventListener("pointermove", onPointerMove);
    dom.addEventListener("pointerup", onPointerUp);
    dom.addEventListener("pointerleave", onPointerUp);
    dom.addEventListener("wheel", onWheel, { passive: true });
    dom.addEventListener("contextmenu", onContextMenu);
    return () => {
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("pointermove", onPointerMove);
      dom.removeEventListener("pointerup", onPointerUp);
      dom.removeEventListener("pointerleave", onPointerUp);
      dom.removeEventListener("wheel", onWheel);
      dom.removeEventListener("contextmenu", onContextMenu);
    };
  }, [gl, onPointerDown, onPointerMove, onPointerUp, onWheel, onContextMenu]);

  useFrame((state) => {
    if (!targetRef.current) return;

    const target = targetRef.current.position;
    const d = distanceRef.current;
    const pitch = pitchRef.current;
    const angle = angleRef.current;

    const desiredPos = new THREE.Vector3(
      target.x + Math.sin(angle) * Math.cos(pitch) * d,
      target.y + Math.sin(pitch) * d,
      target.z + Math.cos(angle) * Math.cos(pitch) * d
    );

    state.camera.position.lerp(desiredPos, 0.1);
    const lookAt = target.clone().add(new THREE.Vector3(0, 1, 0));
    state.camera.lookAt(lookAt);
  });

  return null;
}

export default function PlaygroundPage() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState("connected");
  const [activeChar, setActiveChar] = useState("humanoid");

  const playerRef = useRef<THREE.Group>(null);

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
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur p-4 rounded-2xl shadow-lg border border-cyan-500/30">
        <h1 className="text-xl font-bold text-cyan-400 mb-2">New New York</h1>
        <p className="text-sm text-slate-400 mb-4">WASD to move. Drag to look around. Scroll to zoom.</p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-300">Control:</span>
            <select 
              value={activeChar}
              onChange={(e) => setActiveChar(e.target.value)}
              className="bg-slate-800 border border-cyan-500/30 text-cyan-300 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-1.5"
            >
              <option value="humanoid">Blocky Humanoid</option>
              <option value="pet">Voxel Pet</option>
              <option value="bot">Vox-Bot</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <input 
              type="checkbox" 
              checked={isSpeaking}
              onChange={(e) => setIsSpeaking(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
            />
            Speaking
          </label>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-300">Status:</span>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-slate-800 border border-cyan-500/30 text-cyan-300 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-1.5"
            >
              <option value="connected">Connected</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 text-cyan-400/50 text-sm pointer-events-none">
        Click characters to interact!
      </div>

      {/* 3D Scene */}
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
          <color attach="background" args={["#0c1220"]} />
          <fog attach="fog" args={["#0c1220", 40, 90]} />
          <Stars radius={100} depth={60} count={4000} factor={4} fade speed={1} />
          <ambientLight intensity={0.8} />
          <directionalLight 
            castShadow 
            position={[10, 30, 10]} 
            intensity={1.8}
            color="#e0d4ff"
            shadow-mapSize={[1024, 1024]}
            shadow-camera-left={-25}
            shadow-camera-right={25}
            shadow-camera-top={25}
            shadow-camera-bottom={-25}
          />
          <hemisphereLight args={["#7c3aed", "#1e293b", 0.6]} />

          {/* World */}
          <FuturamaEnvironment />

          {/* Active character only */}
          <PlayerController key={`player-${activeChar}`} objectRef={playerRef} position={[0, 0, 0]}>
            {activeChar === "humanoid" && <BlockyHumanoid isSpeaking={isSpeaking} status={status} />}
            {activeChar === "pet" && <VoxelPet isSpeaking={isSpeaking} status={status} />}
            {activeChar === "bot" && <VoxBot isSpeaking={isSpeaking} status={status} />}
          </PlayerController>

          {/* Camera - drag to rotate, scroll to zoom */}
          <OrbitCamera targetRef={playerRef} />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}
