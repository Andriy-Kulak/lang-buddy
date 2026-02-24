"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  isSpeaking: boolean;
  status: string;
}

export function SvgRobot({ isSpeaking, status }: Props) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [isTalkingLocal, setIsTalkingLocal] = useState(false);

  const handleClick = () => {
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
  const screenColor = status === "connected" ? "#10b981" : status === "error" ? "#ef4444" : "#0ea5e9";

  return (
    <motion.svg 
      viewBox="0 0 200 200" 
      width="100%" 
      height="100%"
      onClick={handleClick}
      style={{ cursor: "pointer", originX: "100px", originY: "100px" }}
      animate={{ rotate: isSpinning ? 360 : 0, scale: isSpinning ? [1, 1.2, 1] : 1 }}
      transition={{ duration: 1 }}
    >
      {/* Neck */}
      <rect x="90" y="140" width="20" height="40" fill="#94a3b8" />
      
      {/* Head */}
      <motion.g
        animate={{ y: activeSpeaking ? [0, -4, 0] : 0 }}
        transition={{ repeat: activeSpeaking ? Infinity : 0, duration: 2 }}
      >
        <rect x="40" y="40" width="120" height="100" rx="10" fill="#64748b" />
        
        {/* Antenna */}
        <rect x="95" y="20" width="10" height="20" fill="#cbd5e1" />
        <circle cx="100" cy="15" r="8" fill={screenColor} />

        {/* Screen */}
        <rect x="50" y="50" width="100" height="80" rx="5" fill="#0f172a" />
        
        {/* Eyes */}
        <circle cx="80" cy="75" r="8" fill={screenColor} />
        <circle cx="120" cy="75" r="8" fill={screenColor} />
        
        {/* Mouth / Voice Visualizer */}
        <motion.rect
          x="75" y="105" width="10" height="10" rx="5" fill={screenColor}
          animate={{ scaleY: activeSpeaking ? [1, 3, 1] : 1 }}
          transition={{ repeat: activeSpeaking ? Infinity : 0, duration: 0.2 }}
          style={{ transformOrigin: "80px 110px" }}
        />
        <motion.rect
          x="95" y="105" width="10" height="10" rx="5" fill={screenColor}
          animate={{ scaleY: activeSpeaking ? [1, 4, 1] : 1 }}
          transition={{ repeat: activeSpeaking ? Infinity : 0, duration: 0.25 }}
          style={{ transformOrigin: "100px 110px" }}
        />
        <motion.rect
          x="115" y="105" width="10" height="10" rx="5" fill={screenColor}
          animate={{ scaleY: activeSpeaking ? [1, 2.5, 1] : 1 }}
          transition={{ repeat: activeSpeaking ? Infinity : 0, duration: 0.3 }}
          style={{ transformOrigin: "120px 110px" }}
        />
      </motion.g>
    </motion.svg>
  );
}
