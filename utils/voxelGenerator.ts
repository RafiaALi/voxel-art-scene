import { Voxel } from '../types';
import { PALETTE, SCENE_CONFIG } from '../constants';

// Simple pseudo-random function for deterministic generation
const seedRandom = (x: number, y: number) => {
  const sin = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return sin - Math.floor(sin);
};

const noise = (x: number, z: number) => {
  return seedRandom(x, z);
};

export const generateMosqueScene = (): Voxel[] => {
  const voxels: Voxel[] = [];
  const { gridSize, mosqueWidth, mosqueDepth, minaretHeight } = SCENE_CONFIG;
  const halfGrid = gridSize / 2;

  // 1. Base Terrain & City (Foreground/Midground)
  for (let x = -halfGrid; x < halfGrid; x++) {
    for (let z = -halfGrid; z < halfGrid; z++) {
      // Mountains in the far back
      if (z < -20) {
        const dist = Math.abs(z + 20) / 40;
        const mHeight = Math.floor(noise(x * 0.05, z * 0.05) * 40 * dist) + 5;
        // Only generate surface voxels for optimization? No, let's just do columns for look
        // Actually optimization: just top voxel? No, need side visibility. 
        // Let's do a simple heightmap
        
        if (Math.random() > 0.8) { // Sparsity for distant stars/lights
             // handled by environment
        }
        
        // Add mountain blocks
        for(let y = 0; y < mHeight; y++) {
             if (y === mHeight - 1 || x === -halfGrid || x === halfGrid - 1) {
                 voxels.push({ position: [x, y, z], color: PALETTE.MOUNTAIN });
             }
        }
        continue;
      }

      // City blocks (Dense foreground)
      const cityNoise = noise(x * 0.2, z * 0.2);
      const isBuilding = cityNoise > 0.6;
      const buildingHeight = Math.floor(cityNoise * 8);
      
      // Ground
      voxels.push({ position: [x, -1, z], color: PALETTE.GROUND_CITY });

      if (isBuilding && z > -20) {
         // Don't build inside mosque area
         if (Math.abs(x) < mosqueWidth / 2 + 2 && Math.abs(z) < mosqueDepth / 2 + 2) {
             // skip
         } else {
             for (let y = 0; y < buildingHeight; y++) {
                 const color = Math.random() > 0.9 && y > 2 ? PALETTE.MINARET_LIGHT : PALETTE.GROUND_CITY_LIGHT; // Occasional window
                 voxels.push({ position: [x, y, z], color: color, isLight: color === PALETTE.MINARET_LIGHT });
             }
         }
      }
    }
  }

  // 2. Mosque Platform
  const platformY = 2;
  for (let x = -mosqueWidth / 2; x < mosqueWidth / 2; x++) {
    for (let z = -mosqueDepth / 2; z < mosqueDepth / 2; z++) {
      for (let y = 0; y <= platformY; y++) {
        voxels.push({ position: [x, y, z], color: PALETTE.MOSQUE_BASE });
      }
    }
  }

  // 3. Main Structure Walls
  const wallHeight = 12;
  for (let x = -mosqueWidth / 2 + 2; x < mosqueWidth / 2 - 2; x++) {
    for (let z = -mosqueDepth / 2 + 2; z < mosqueDepth / 2 - 2; z++) {
        // Hollow inside optimization
        if (Math.abs(x) > mosqueWidth/2 - 4 || Math.abs(z) > mosqueDepth/2 - 4) {
            for (let y = platformY; y < platformY + wallHeight; y++) {
                const isWindow = (y % 4 === 0) && (x % 3 === 0);
                const color = isWindow ? PALETTE.MINARET_LIGHT : PALETTE.MOSQUE_BASE;
                voxels.push({ position: [x, y, z], color, isLight: isWindow });
            }
        } else {
             // Roof
             voxels.push({ position: [x, platformY + wallHeight, z], color: PALETTE.MOSQUE_BASE });
        }
    }
  }

  // 4. Minarets (6 of them)
  const minaretPositions = [
    [-mosqueWidth / 2, -mosqueDepth / 2],
    [mosqueWidth / 2 - 1, -mosqueDepth / 2],
    [-mosqueWidth / 2, mosqueDepth / 2 - 1],
    [mosqueWidth / 2 - 1, mosqueDepth / 2 - 1],
    [-10, -5], // Inner
    [10, -5]   // Inner
  ];

  minaretPositions.forEach(([mx, mz], idx) => {
     const height = idx > 3 ? minaretHeight + 5 : minaretHeight; // Middle ones taller
     for (let y = platformY; y < height; y++) {
         // Shaft
         voxels.push({ position: [mx, y, mz], color: PALETTE.MINARET_SHAFT });
         voxels.push({ position: [mx+1, y, mz], color: PALETTE.MINARET_SHAFT });
         voxels.push({ position: [mx, y, mz+1], color: PALETTE.MINARET_SHAFT });
         voxels.push({ position: [mx+1, y, mz+1], color: PALETTE.MINARET_SHAFT });

         // Balconies / Lights
         if (y > 15 && y % 8 === 0) {
            // Ring of light
            for(let bx = -1; bx <= 2; bx++) {
                for(let bz = -1; bz <= 2; bz++) {
                    if (bx < 0 || bx > 1 || bz < 0 || bz > 1) {
                        voxels.push({ position: [mx + bx, y, mz + bz], color: PALETTE.MINARET_LIGHT, isLight: true });
                    }
                }
            }
         }
     }
     // Top Dome of Minaret
     voxels.push({ position: [mx, height, mz], color: PALETTE.DOME, isLight: true });
     voxels.push({ position: [mx+1, height, mz], color: PALETTE.DOME, isLight: true });
     voxels.push({ position: [mx, height, mz+1], color: PALETTE.DOME, isLight: true });
     voxels.push({ position: [mx+1, height, mz+1], color: PALETTE.DOME, isLight: true });
     voxels.push({ position: [mx, height+1, mz], color: PALETTE.MINARET_LIGHT, isLight: true });
  });

  // 5. Central Dome
  const centerX = 0;
  const centerZ = 0;
  const domeRadius = 9;
  const domeCenterY = platformY + wallHeight;
  
  for (let x = -domeRadius; x <= domeRadius; x++) {
    for (let y = 0; y <= domeRadius; y++) {
        for (let z = -domeRadius; z <= domeRadius; z++) {
            const dist = Math.sqrt(x*x + y*y + z*z);
            if (dist < domeRadius && dist > domeRadius - 1.5) {
                voxels.push({ 
                    position: [centerX + x, domeCenterY + y, centerZ + z], 
                    color: PALETTE.DOME 
                });
            }
        }
    }
  }

  return voxels;
};
