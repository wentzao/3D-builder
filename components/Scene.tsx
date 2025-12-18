import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, ContactShadows } from '@react-three/drei';
import FoldingScene from './FoldingScene';
import ShowcaseModel from './ShowcaseModel';
import { AppMode, GridPoint, CuboidDimensions, ShowcaseConfig } from '../types';

interface SceneProps {
  appMode: AppMode;
  netPoints: GridPoint[];
  foldProgress: number;
  cuboidDimensions: CuboidDimensions;
  showcaseConfig: ShowcaseConfig;
}

const Scene: React.FC<SceneProps> = ({ 
  appMode,
  netPoints,
  foldProgress,
  cuboidDimensions,
  showcaseConfig
}) => {
  
  const isShowcase = appMode === AppMode.SHOWCASE;

  return (
    <Canvas
      shadows={!isShowcase} // 展示模式下關閉陰影系統
      camera={{ position: [8, 8, 8], fov: 45 }}
      style={{ background: '#f8fafc' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.9} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={0.7} 
        castShadow={!isShowcase}
      />
      <Environment preset="city" />

      <OrbitControls 
        makeDefault 
        enableDamping={true}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
      />

      {/* 展開圖模式下的背景網格與陰影 */}
      {!isShowcase && (
        <>
          <Grid 
            position={[0, -0.01, 0]} 
            args={[20, 20]} 
            cellColor="#cbd5e1" 
            sectionColor="#94a3b8" 
            fadeDistance={25}
            cellSize={1}
            sectionSize={1}
            transparent={true}
            opacity={0.4}
          />
          <ContactShadows position={[0, 0, 0]} opacity={0.3} scale={20} blur={2} far={4} />
        </>
      )}

      {/* --- NET MODE --- */}
      {(appMode === AppMode.NET_CUBE || appMode === AppMode.NET_CUBOID) && (
        <FoldingScene 
            points={netPoints} 
            progress={foldProgress} 
            cuboidDimensions={cuboidDimensions} 
        />
      )}

      {/* --- SHOWCASE MODE --- */}
      {isShowcase && (
        <ShowcaseModel 
            dimensions={cuboidDimensions}
            config={showcaseConfig}
        />
      )}

    </Canvas>
  );
};

export default Scene;