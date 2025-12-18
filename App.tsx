import React, { useState, useCallback, useEffect } from 'react';
import Scene from './components/Scene';
import Controls from './components/Controls';
import NetGrid from './components/NetGrid';
import { AppMode, GridPoint, CuboidDimensions, ShowcaseConfig, LabelType } from './types';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.SHOWCASE);
  
  // --- Net Mode State ---
  const [netPoints, setNetPoints] = useState<GridPoint[]>([]);
  const [isFolding, setIsFolding] = useState(false);
  const [foldProgress, setFoldProgress] = useState(0);
  const [eraserMode, setEraserMode] = useState(false); // 平板友善：橡皮擦模式
  
  const [dimensions, setDimensions] = useState<CuboidDimensions>({ width: 4, height: 3, depth: 2 });
  const [selectedFaceType, setSelectedFaceType] = useState<number>(0); 

  // --- Showcase Mode State ---
  const [showcaseConfig, setShowcaseConfig] = useState<ShowcaseConfig>({
    labelType: LabelType.NONE,
    showXRay: false,
    showEdges: true
  });

  const clearNet = useCallback(() => {
    setNetPoints([]);
    setIsFolding(false);
    setFoldProgress(0);
  }, []);

  const handleGridClick = (x: number, y: number) => {
    if (isFolding) return;
    const existingIndex = netPoints.findIndex(p => p.x === x && p.y === y);
    
    if (existingIndex >= 0) {
      if (eraserMode) {
        removeNetPoint(x, y);
      } else {
        if (appMode === AppMode.NET_CUBOID) {
          rotateNetPoint(x, y);
        } else {
          removeNetPoint(x, y);
        }
      }
    } else {
      if (eraserMode || netPoints.length >= 6) return;

      if (appMode === AppMode.NET_CUBOID) {
        const typeCount = netPoints.filter(p => p.faceType === selectedFaceType).length;
        if (typeCount >= 2) {
          alert("每一種面只能放兩個喔！(長方體有三組相對的面)");
          return;
        }
      }

      const isAdjacent = netPoints.length === 0 || netPoints.some(p => 
        (Math.abs(p.x - x) === 1 && p.y === y) || (Math.abs(p.y - y) === 1 && p.x === x)
      );
      
      if (isAdjacent) {
         const faceType = appMode === AppMode.NET_CUBOID ? selectedFaceType : 0;
         setNetPoints(prev => [...prev, { x, y, id: uuidv4(), faceType, rotated: false }]);
      }
    }
  };

  const removeNetPoint = (x: number, y: number) => {
    if (isFolding) return;
    setNetPoints(prev => prev.filter(p => !(p.x === x && p.y === y)));
  };

  const rotateNetPoint = (x: number, y: number) => {
    if (isFolding) return;
    setNetPoints(prev => prev.map(p => (p.x === x && p.y === y) ? { ...p, rotated: !p.rotated } : p));
  };

  const toggleFold = () => {
    if (isFolding) {
      setIsFolding(false);
      setFoldProgress(0);
    } else {
      if (netPoints.length !== 6) {
        alert("長方體需要 6 個面才能摺疊喔！");
        return;
      }
      setIsFolding(true);
    }
  };

  const handleSetAppMode = (m: AppMode) => {
    setAppMode(m);
    clearNet();
    setEraserMode(false);
  };

  useEffect(() => {
    let animationFrame: number;
    if (isFolding && foldProgress < 1) {
      const animate = () => {
        setFoldProgress(prev => Math.min(prev + 0.02, 1));
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    } else if (!isFolding && foldProgress > 0) {
       const animate = () => {
        setFoldProgress(prev => Math.max(prev + 0.05, 0));
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isFolding, foldProgress]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-50">
      <Scene 
        appMode={appMode}
        netPoints={netPoints}
        foldProgress={foldProgress}
        cuboidDimensions={appMode === AppMode.NET_CUBE ? {width:1, height:1, depth:1} : dimensions}
        showcaseConfig={showcaseConfig}
      />
      
      <Controls 
        appMode={appMode}
        setAppMode={handleSetAppMode}
        onClear={clearNet}
        netCount={netPoints.length}
        isFolding={isFolding}
        onToggleFold={toggleFold}
        dimensions={dimensions}
        setDimensions={setDimensions}
        showcaseConfig={showcaseConfig}
        setShowcaseConfig={setShowcaseConfig}
        eraserMode={eraserMode}
      />

      {(appMode === AppMode.NET_CUBE || appMode === AppMode.NET_CUBOID) && (
        <NetGrid 
          appMode={appMode}
          selectedPoints={netPoints}
          onTogglePoint={handleGridClick}
          onRemovePoint={removeNetPoint}
          onRotatePoint={rotateNetPoint}
          disabled={isFolding}
          dimensions={appMode === AppMode.NET_CUBE ? {width:1, height:1, depth:1} : dimensions}
          selectedFaceType={selectedFaceType}
          setSelectedFaceType={setSelectedFaceType}
          eraserMode={eraserMode}
          setEraserMode={setEraserMode}
        />
      )}
    </div>
  );
};

export default App;