import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, MeshDistortMaterial, Sphere, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const CinematicScene = () => {
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const { clock } = state;
    if (sphereRef.current) {
      sphereRef.current.rotation.y = clock.getElapsedTime() * 0.2;
      sphereRef.current.position.y = Math.sin(clock.getElapsedTime()) * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Sphere ref={sphereRef} args={[1, 100, 100]} scale={2}>
          <MeshDistortMaterial
            color="#10b981"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.1}
            metalness={0.8}
          />
        </Sphere>
      </Float>

      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
    </>
  );
};

const VideoHero: React.FC = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows dpr={[1, 2]}>
          <CinematicScene />
        </Canvas>
      </div>

      {/* Video Overlay (Optional - can use a real video if available) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black z-10" />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase leading-[0.85]">
            The Future of <br />
            <span className="text-emerald-500 italic font-serif">Cinema</span> Networking
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 font-medium">
            Connect with directors, showcase your portfolio, and discover your next big break in the film industry.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="px-8 py-4 bg-emerald-500 text-black font-bold rounded-full hover:bg-emerald-400 transition-all transform hover:scale-105">
              Get Started
            </Link>
            <Link to="/connections" className="px-8 py-4 border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-all">
              Explore Talent
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-emerald-500 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
};

import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default VideoHero;
