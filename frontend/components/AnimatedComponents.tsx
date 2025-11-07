'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Animated Card with 3D effects
export const AnimatedCard = ({ children, className = '', delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay, type: "spring", stiffness: 100 }}
      whileHover={{ 
        y: -10, 
        rotateX: 5, 
        rotateY: 5,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
      className={`transform-3d ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {children}
    </motion.div>
  );
};

// Morphing Button
export const MorphingButton = ({ children, onClick, className = '' }: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <motion.button
      className={`neon-button ${className}`}
      onClick={onClick}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 0 30px rgba(0, 255, 136, 0.8)",
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.95 }}
      animate={{
        borderRadius: ["50px", "20px", "50px"],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      <motion.span
        animate={{
          textShadow: [
            "0 0 5px #00ff88",
            "0 0 20px #00ff88, 0 0 30px #00ff88",
            "0 0 5px #00ff88"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
};

// Floating Elements
export const FloatingElement = ({ children, className = '', amplitude = 20 }: {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
}) => {
  return (
    <motion.div
      className={`floating-element ${className}`}
      animate={{
        y: [-amplitude, amplitude, -amplitude],
        rotateX: [-5, 5, -5],
        rotateY: [-5, 5, -5],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Glitch Text Effect
export const GlitchText = ({ text, className = '' }: {
  text: string;
  className?: string;
}) => {
  return (
    <motion.div
      className={`glitch-text ${className}`}
      data-text={text}
      animate={{
        textShadow: [
          "2px 0 #ff0000, -2px 0 #00ffff",
          "0 2px #ff0000, 0 -2px #00ffff",
          "-2px 0 #ff0000, 2px 0 #00ffff",
          "0 -2px #ff0000, 0 2px #00ffff"
        ]
      }}
      transition={{ duration: 0.1, repeat: Infinity, repeatType: "reverse" }}
    >
      {text}
    </motion.div>
  );
};

// Holographic Card
export const HolographicCard = ({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      className={`holographic-card ${className}`}
      whileHover={{
        rotateY: 10,
        rotateX: 10,
        scale: 1.05,
        transition: { duration: 0.3 }
      }}
      animate={{
        background: [
          "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)",
          "linear-gradient(45deg, #4ecdc4, #45b7d1, #96ceb4, #ff6b6b)",
          "linear-gradient(45deg, #45b7d1, #96ceb4, #ff6b6b, #4ecdc4)",
          "linear-gradient(45deg, #96ceb4, #ff6b6b, #4ecdc4, #45b7d1)"
        ]
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
    >
      <div className="holographic-content">
        {children}
      </div>
    </motion.div>
  );
};

// Liquid Shape
export const LiquidShape = ({ className = '' }: { className?: string }) => {
  return (
    <motion.div
      className={`liquid-shape ${className}`}
      animate={{
        borderRadius: [
          "60% 40% 30% 70% / 60% 30% 70% 40%",
          "30% 60% 70% 40% / 50% 60% 30% 60%",
          "50% 60% 30% 60% / 30% 60% 70% 40%",
          "60% 40% 60% 30% / 70% 30% 60% 70%",
          "60% 40% 30% 70% / 60% 30% 70% 40%"
        ],
        rotate: [0, 72, 144, 216, 288, 360],
        scale: [1, 1.1, 0.9, 1.05, 0.95, 1]
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
};

// Particle Burst Effect
export const ParticleBurst = ({ trigger }: { trigger: boolean }) => {
  const particles = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={trigger ? {
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200,
            rotate: Math.random() * 360
          } : {}}
          transition={{ duration: 2, delay: particle * 0.1 }}
          style={{
            left: '50%',
            top: '50%'
          }}
        />
      ))}
    </div>
  );
};

// 3D Rotating Cube
export const RotatingCube = ({ className = '' }: { className?: string }) => {
  return (
    <motion.div
      className={`cube-3d ${className}`}
      animate={{ rotateX: 360, rotateY: 360 }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
    >
      <div className="cube-face front" />
      <div className="cube-face back" />
      <div className="cube-face right" />
      <div className="cube-face left" />
      <div className="cube-face top" />
      <div className="cube-face bottom" />
    </motion.div>
  );
};

// Staggered Animation Container
export const StaggerContainer = ({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

// Staggered Item
export const StaggerItem = ({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 50, rotateX: -15 },
        visible: {
          opacity: 1,
          y: 0,
          rotateX: 0,
          transition: { duration: 0.8, type: "spring", stiffness: 100 }
        }
      }}
    >
      {children}
    </motion.div>
  );
};