import React, { useLayoutEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Voxel } from '../types';

// This component renders ONLY the light-emitting voxels with a highly emissive material
// This allows the Bloom effect to pick them up much better than vertex colors on a standard mesh
export const GlowingVoxelMesh: React.FC<{ voxels: Voxel[] }> = ({ voxels }) => {
  const lightVoxels = useMemo(() => voxels.filter(v => v.isLight), [voxels]);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const colorAttribute = useMemo(() => {
      const array = new Float32Array(lightVoxels.length * 3);
      const col = new THREE.Color();
      lightVoxels.forEach((v, i) => {
          col.set(v.color);
          array[i * 3] = col.r;
          array[i * 3 + 1] = col.g;
          array[i * 3 + 2] = col.b;
      });
      return array;
  }, [lightVoxels]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const temp = new THREE.Object3D();
    lightVoxels.forEach((v, i) => {
      temp.position.set(v.position[0], v.position[1], v.position[2]);
      // Scale slightly smaller to prevent z-fighting with the base mesh if they overlap
      // But here we are separating them. If we separated, we don't render them in the main mesh?
      // Strategy: Render all in Main (for occlusion), Render lights in Glow (superimposed) or split them.
      // Splitting is cleaner.
      temp.updateMatrix();
      meshRef.current!.setMatrixAt(i, temp.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor = new THREE.InstancedBufferAttribute(colorAttribute, 3);
  }, [lightVoxels, colorAttribute]);

  if (lightVoxels.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, lightVoxels.length]}>
      <boxGeometry args={[1.01, 1.01, 1.01]} /> 
      <meshStandardMaterial 
        vertexColors={false}
        color={"white"} // Tinted by instance color? No, standard material doesn't easily mix instance color with emissive.
        // Let's try a trick: Use vertex colors for emissive color? 
        // Three.js doesn't support instanceColor -> emissive out of the box easily without custom shader.
        // Simpler approach: Just use the instance color as the albedo and pump up the emissive intensity globally 
        // and rely on the toneMapping to handle the brightness.
        emissive={"#ffaa00"}
        emissiveIntensity={3}
        toneMapped={false}
      />
    </instancedMesh>
  );
};

// Actually, a better pattern for Voxel art with Bloom is to have ONE mesh, 
// and the material uses the vertex color as emissive for bright blocks. 
// But for simplicity in this prompt, let's stick to the VoxelInstancedMesh handling everything
// and maybe adding a few point lights for real lighting data.
