import React, { useLayoutEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Voxel } from '../types';
import { PALETTE } from '../constants';

interface VoxelInstancedMeshProps {
  voxels: Voxel[];
}

export const VoxelInstancedMesh: React.FC<VoxelInstancedMeshProps> = ({ voxels }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Separate geometry logic can be added here if needed, using BoxGeometry by default
  
  // Process colors once
  const { count, colorsArray } = useMemo(() => {
    const count = voxels.length;
    const colorsArray = new Float32Array(count * 3);
    const _color = new THREE.Color();

    voxels.forEach((voxel, i) => {
      _color.set(voxel.color);
      // Boost emissivity visually by brightening base color for light sources
      if (voxel.isLight) {
         _color.multiplyScalar(1.5); 
      }
      colorsArray[i * 3] = _color.r;
      colorsArray[i * 3 + 1] = _color.g;
      colorsArray[i * 3 + 2] = _color.b;
    });

    return { count, colorsArray };
  }, [voxels]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    const tempObject = new THREE.Object3D();
    
    voxels.forEach((voxel, i) => {
      tempObject.position.set(voxel.position[0], voxel.position[1], voxel.position[2]);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    // Set colors
    if (meshRef.current.instanceColor) {
        // Re-create attribute if needed or update
        // InstancedMesh creates instanceColor attribute automatically if count > 0? 
        // Actually we need to manually set it if we didn't pass it in constructor args, 
        // but drei/fiber handles args. Let's just use the attribute access.
    }
    
    // Explicitly setting instanceColor attribute data
    meshRef.current.instanceColor = new THREE.InstancedBufferAttribute(colorsArray, 3);

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [voxels, colorsArray]);

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[undefined, undefined, count]} 
      castShadow 
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        roughness={0.8} 
        metalness={0.1} 
        vertexColors={true} // Critical for instanced color
      />
    </instancedMesh>
  );
};
