"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  isSpeaking: boolean;
  status: string;
}

export function SvgHumanoid({ isSpeaking, status }: Props) {
  const [isWaving, setIsWaving] = useState(false);
  const [isTalkingLocal, setIsTalkingLocal] = useState(false);

  const handleClick = () => {
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
  const shirtColor = status === "connected" ? "#34d399" : status === "error" ? "#f87171" : "#38bdf8";

  return (
    <svg 
      viewBox="0 0 200 200" 
      width="100%" 
      height="100%" 
      onClick={handleClick} 
      style={{ cursor: "pointer" }}
    >
      {/* Torso */}
      <rect x="70" y="100" width="60" height="70" rx="10" fill={shirtColor} />
      
      {/* Left Arm */}
      <motion.rect
        x="40" y="100" width="20" height="60" rx="10" fill="#fcdeb3"
        animate={{ 
          rotate: activeSpeaking ? [0, 20, 0] : 0 
        }}
        transition={{ repeat: activeSpeaking ? Infinity : 0, duration: 0.5 }}
        style={{ transformOrigin: "50px 110px" }}
      />
      
      {/* Right Arm (Waving) */}
      <motion.rect
        x="140" y="100" width="20" height="60" rx="10" fill="#fcdeb3"
        animate={{ 
          rotate: isWaving ? [-120, -100, -140, -120] : (activeSpeaking ? [0, -20, 0] : 0)
        }}
        transition={{ repeat: isWaving || activeSpeaking ? Infinity : 0, duration: isWaving ? 0.4 : 0.5 }}
        style={{ transformOrigin: "150px 110px" }}
      />
      
      {/* Head */}
      <motion.g
        animate={{ y: activeSpeaking ? [0, -5, 0] : 0 }}
        transition={{ repeat: activeSpeaking ? Infinity : 0, duration: 0.4 }}
      >
        <rect x="60" y="20" width="80" height="80" rx="20" fill="#fcdeb3" />
        {/* Eyes */}
        <circle cx="85" cy="55" r="5" fill="#333" />
        <circle cx="115" cy="55" r="5" fill="#333" />
        {/* Mouth */}
        <motion.rect
          x="90" y="70" width="20" height="10" rx="5" fill="#333"
          animate={{ scaleY: activeSpeaking ? [1, 2, 1] : 1 }}
          transition={{ repeat: activeSpeaking ? Infinity : 0, duration: 0.3 }}
          style={{ transformOrigin: "100px 75px" }}
        />
      </motion.g>
    </svg>
  );
}
