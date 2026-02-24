"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  isSpeaking: boolean;
  status: string;
}

export function SvgPet({ isSpeaking, status }: Props) {
  const [isJumping, setIsJumping] = useState(false);
  const [isTalkingLocal, setIsTalkingLocal] = useState(false);

  const handleClick = () => {
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
  const collarColor = status === "connected" ? "#10b981" : status === "error" ? "#ef4444" : "#f59e0b";
  const petColor = "#fcd34d";

  return (
    <motion.svg 
      viewBox="0 0 200 200" 
      width="100%" 
      height="100%"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
      animate={{ y: isJumping ? [0, -30, 0, -15, 0] : 0 }}
      transition={{ duration: 1 }}
    >
      {/* Tail */}
      <motion.rect
        x="150" y="110" width="15" height="40" rx="5" fill="#d97706"
        animate={{ rotate: activeSpeaking ? [0, 20, -20, 0] : [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: activeSpeaking ? 0.3 : 2 }}
        style={{ transformOrigin: "157px 150px" }}
      />
      
      {/* Body */}
      <rect x="60" y="100" width="100" height="60" rx="20" fill={petColor} />
      
      {/* Legs */}
      <rect x="70" y="150" width="15" height="30" rx="5" fill={petColor} />
      <rect x="130" y="150" width="15" height="30" rx="5" fill={petColor} />
      
      {/* Head */}
      <motion.g
        animate={{ rotate: activeSpeaking ? [0, 5, -5, 0] : 0 }}
        transition={{ repeat: activeSpeaking ? Infinity : 0, duration: 0.8 }}
        style={{ transformOrigin: "50px 100px" }}
      >
        <rect x="20" y="40" width="70" height="70" rx="15" fill={petColor} />
        {/* Ears */}
        <rect x="25" y="25" width="15" height="25" rx="5" fill="#d97706" />
        <rect x="70" y="25" width="15" height="25" rx="5" fill="#d97706" />
        {/* Snout */}
        <rect x="10" y="70" width="40" height="30" rx="10" fill="#fef3c7" />
        <circle cx="20" cy="80" r="5" fill="#1e293b" />
        {/* Eye */}
        <circle cx="50" cy="65" r="5" fill="#1e293b" />
        
        {/* Jaw */}
        <motion.g
          animate={{ rotate: activeSpeaking ? [0, 15, 0] : 0 }}
          transition={{ repeat: activeSpeaking ? Infinity : 0, duration: 0.3 }}
          style={{ transformOrigin: "50px 90px" }}
        >
          <rect x="10" y="85" width="30" height="10" rx="5" fill="#fef3c7" />
          <rect x="15" y="87" width="15" height="5" rx="2" fill="#ef4444" />
        </motion.g>
      </motion.g>
      
      {/* Collar */}
      <rect x="60" y="95" width="20" height="30" rx="5" fill={collarColor} />
    </motion.svg>
  );
}
