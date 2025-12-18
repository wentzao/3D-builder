
export enum AppMode {
  NET_CUBE = 'NET_CUBE', 
  NET_CUBOID = 'NET_CUBOID', 
  SHOWCASE = 'SHOWCASE' 
}

export enum LabelType {
  NONE = 'NONE',
  BOPOMOFO = 'BOPOMOFO',
  LATIN = 'LATIN'
}

export type Vector3Array = [number, number, number];

export interface GridPoint {
  x: number;
  y: number;
  id: string;
  faceType?: number; 
  rotated?: boolean; 
}

export interface CuboidDimensions {
  width: number;  
  height: number; 
  depth: number;  
}

export interface ShowcaseConfig {
  labelType: LabelType;
  showXRay: boolean;
  showEdges: boolean;
}

export enum ToolMode {
  ADD = 'ADD',
  REMOVE = 'REMOVE'
}

export interface BlockData {
  id: string;
  position: Vector3Array;
  color: string;
}

// Fix: Added missing Challenge interface used by AI assistant services
export interface Challenge {
  title: string;
  description: string;
  targetVolume: number;
  isActive: boolean;
}
