import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

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
      <ambientLight intensity={1.5} color="#ffffff" />
      <pointLight position={[10, 10, 10]} intensity={2} color="#10b981" />
      <spotLight position={[-10, 10, 10]} angle={0.25} penumbra={1} intensity={1.5} color="#3b82f6" castShadow />
      
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere ref={sphereRef} args={[1, 100, 100]} scale={2.2}>
          <MeshDistortMaterial
            color="#ecfdf5"
            attach="material"
            distort={0.4}
            speed={1.5}
            roughness={0.05}
            metalness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </Sphere>
      </Float>

      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
    </>
  );
};

const VideoHero: React.FC = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-50 border-b border-slate-200">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows dpr={[1, 2]}>
          <CinematicScene />
        </Canvas>
      </div>

      {/* Video Overlay (Light Theme Adjustments) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-transparent to-slate-50 z-10" />
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] z-10 mix-blend-overlay pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-100/50 backdrop-blur-sm border border-emerald-200 rounded-full text-emerald-800 text-sm font-bold tracking-wide mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>The Platform For Film Professionals</span>
          </div>
          
          <h1 className="text-6xl md:text-[5.5rem] font-black tracking-tight text-slate-900 mb-6 leading-[1.05]">
            The Future of <br className="hidden md:block" />
            <span className="relative">
              <span className="relative z-10 text-emerald-600 italic font-serif pr-2">Cinema</span>
              <span className="absolute bottom-2 left-0 w-full h-4 bg-emerald-200/50 -z-10 -rotate-2 transform" />
            </span>
            Networking
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-600 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Connect with elite directors, showcase your portfolio, and discover your next big break in the film industry.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 hover:-translate-y-1 hover:shadow-xl shadow-lg transition-all text-lg">
              Get Started
            </Link>
            <Link to="/connections" className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-full hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md transition-all text-lg">
              Explore Talent
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-7 h-12 border-2 border-slate-300 rounded-full flex justify-center p-1.5 bg-white/50 backdrop-blur-sm shadow-sm">
          <div className="w-1.5 h-3 bg-emerald-500 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
};

export default VideoHero;
