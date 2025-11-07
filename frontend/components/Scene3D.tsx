'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Text3D, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Animated Sphere Component
function AnimatedSphere({ position, color }: { position: [number, number, number], color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} position={position} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.6}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

// Floating Cubes
function FloatingCubes() {
  const cubesRef = useRef<THREE.Group>(null);
  
  const cubes = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 20; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        ] as [number, number, number],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
        scale: Math.random() * 0.5 + 0.5,
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (cubesRef.current) {
      cubesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      cubesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  return (
    <group ref={cubesRef}>
      {cubes.map((cube, index) => (
        <Float key={index} speed={1 + Math.random()} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={cube.position} rotation={cube.rotation} scale={cube.scale}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial
              color={`hsl(${index * 20}, 70%, 60%)`}
              transparent
              opacity={0.7}
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Particle System
function ParticleSystem() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const count = 1000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      
      colors[i * 3] = Math.random();
      colors[i * 3 + 1] = Math.random();
      colors[i * 3 + 2] = Math.random();
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      particlesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.2;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} vertexColors transparent opacity={0.8} />
    </points>
  );
}

// Main 3D Scene
export default function Scene3D() {
  return (
    <div className="w-full h-screen absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Environment preset="night" />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#667eea" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#764ba2" />
        <spotLight
          position={[0, 20, 0]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          color="#ffffff"
        />

        {/* 3D Objects */}
        <AnimatedSphere position={[-4, 2, 0]} color="#667eea" />
        <AnimatedSphere position={[4, -2, -2]} color="#764ba2" />
        <AnimatedSphere position={[0, 0, -4]} color="#ff6b6b" />
        
        <FloatingCubes />
        <ParticleSystem />

        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}