import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Cloud } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { generateMosqueScene } from '../utils/voxelGenerator';
import { VoxelInstancedMesh } from './VoxelInstancedMesh';
import { PALETTE } from '../constants';

const AutoRotateCamera = () => {
    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        // Slow drift
        const radius = 90;
        state.camera.position.x = Math.sin(time * 0.05) * radius;
        state.camera.position.z = Math.cos(time * 0.05) * radius;
        state.camera.lookAt(0, 10, 0);
    });
    return null;
}

export const Scene: React.FC = () => {
  const voxels = useMemo(() => generateMosqueScene(), []);
  
  // Split voxels into emissive (lights) and non-emissive for better control if needed,
  // but for now we pass all to one mesh and rely on color brightness for Bloom.
  
  return (
    <Canvas shadows dpr={[1, 2]}>
      <PerspectiveCamera makeDefault position={[60, 40, 60]} fov={45} />
      <OrbitControls 
        autoRotate={true} 
        autoRotateSpeed={0.5} 
        maxPolarAngle={Math.PI / 2 - 0.1} 
        minDistance={20}
        maxDistance={150}
      />
      
      {/* Environment Lighting */}
      <color attach="background" args={[PALETTE.SKY]} />
      <fog attach="fog" args={[PALETTE.SKY, 40, 140]} />
      
      <ambientLight intensity={0.2} color="#a5b4fc" /> {/* Cool ambient */}
      <directionalLight 
        position={[-50, 50, -20]} 
        intensity={0.5} 
        color="#e0e7ff" // Moon light
        castShadow 
      />
      
      {/* Warm glow from the city/mosque lights */}
      <pointLight position={[0, 20, 0]} intensity={2} color="#fbbf24" distance={50} decay={2} />
      <pointLight position={[20, 10, 20]} intensity={1} color="#f97316" distance={30} />
      <pointLight position={[-20, 10, -20]} intensity={1} color="#f97316" distance={30} />

      {/* Stars */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Cloud opacity={0.3} speed={0.2} width={50} depth={5} segments={10} position={[0, 40, -50]} color={PALETTE.MOUNTAIN} />

      {/* The Art */}
      <group position={[0, -10, 0]}>
        <VoxelInstancedMesh voxels={voxels} />
      </group>

      {/* Post Processing for that "Dreamy Voxel" look */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.6} // Only glow very bright things
            mipmapBlur 
            intensity={1.5} 
            radius={0.4} 
        />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
        <Noise opacity={0.02} />
      </EffectComposer>
    </Canvas>
  );
};
