export interface Voxel {
  position: [number, number, number];
  color: string;
  isLight?: boolean;
}

export enum ArchitecturalStyle {
  ISLAMIC = 'Islamic',
  MODERN = 'Modern',
  GOTHIC = 'Gothic'
}

export interface GeminiResponse {
  text: string;
}
