"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";

import { BlockyHumanoid } from "@/components/characters/3d/BlockyHumanoid";
import { VoxBot } from "@/components/characters/3d/VoxBot";
import { VoxelPet } from "@/components/characters/3d/VoxelPet";

import { SvgHumanoid } from "@/components/characters/2d/SvgHumanoid";
import { SvgRobot } from "@/components/characters/2d/SvgRobot";
import { SvgPet } from "@/components/characters/2d/SvgPet";

export default function BuddyDemoPage() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState("connected"); // connected, error, disconnected

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Character MVPs</h1>
            <p className="text-slate-500">Test how characters react to voice state.</p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input 
                type="checkbox" 
                checked={isSpeaking}
                onChange={(e) => setIsSpeaking(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              Is Speaking
            </label>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-slate-100 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value="disconnected">Disconnected</option>
                <option value="connected">Connected</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 3D Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">3D (React Three Fiber)</h2>
            <div className="grid gap-4">
              
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 h-64 flex flex-col">
                <h3 className="font-medium text-slate-700 mb-2 text-sm text-center">Blocky Humanoid</h3>
                <div className="flex-1 bg-slate-100 rounded-xl overflow-hidden">
                  <Canvas camera={{ position: [0, 1.5, 4], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
                    <Environment preset="city" />
                    <BlockyHumanoid isSpeaking={isSpeaking} status={status} />
                    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
                  </Canvas>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 h-64 flex flex-col">
                <h3 className="font-medium text-slate-700 mb-2 text-sm text-center">Vox-Bot</h3>
                <div className="flex-1 bg-slate-100 rounded-xl overflow-hidden">
                  <Canvas camera={{ position: [0, 1.5, 4], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
                    <Environment preset="city" />
                    <VoxBot isSpeaking={isSpeaking} status={status} />
                    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
                  </Canvas>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 h-64 flex flex-col">
                <h3 className="font-medium text-slate-700 mb-2 text-sm text-center">Voxel Pet</h3>
                <div className="flex-1 bg-slate-100 rounded-xl overflow-hidden">
                  <Canvas camera={{ position: [0, 1.5, 4], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
                    <Environment preset="city" />
                    <VoxelPet isSpeaking={isSpeaking} status={status} />
                    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
                  </Canvas>
                </div>
              </div>

            </div>
          </section>

          {/* 2D Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">2D (SVG + Framer Motion)</h2>
            <div className="grid gap-4">
              
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 h-64 flex flex-col">
                <h3 className="font-medium text-slate-700 mb-2 text-sm text-center">Flat Humanoid</h3>
                <div className="flex-1 bg-slate-100 rounded-xl flex items-center justify-center p-4">
                  <div className="w-full max-w-[200px] aspect-square">
                    <SvgHumanoid isSpeaking={isSpeaking} status={status} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 h-64 flex flex-col">
                <h3 className="font-medium text-slate-700 mb-2 text-sm text-center">Flat Vox-Bot</h3>
                <div className="flex-1 bg-slate-100 rounded-xl flex items-center justify-center p-4">
                  <div className="w-full max-w-[200px] aspect-square">
                    <SvgRobot isSpeaking={isSpeaking} status={status} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 h-64 flex flex-col">
                <h3 className="font-medium text-slate-700 mb-2 text-sm text-center">Flat Pet</h3>
                <div className="flex-1 bg-slate-100 rounded-xl flex items-center justify-center p-4">
                  <div className="w-full max-w-[200px] aspect-square">
                    <SvgPet isSpeaking={isSpeaking} status={status} />
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
