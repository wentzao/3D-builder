import React from 'react';
import { AppMode, CuboidDimensions, GridPoint } from '../types';
import { RotateCw, XCircle, Eraser, MousePointer2 } from 'lucide-react';

interface NetGridProps {
  appMode: AppMode;
  selectedPoints: GridPoint[];
  onTogglePoint: (x: number, y: number) => void;
  onRemovePoint: (x: number, y: number) => void;
  onRotatePoint: (x: number, y: number) => void;
  disabled: boolean;
  dimensions: CuboidDimensions;
  selectedFaceType: number;
  setSelectedFaceType: (type: number) => void;
  eraserMode: boolean;
  setEraserMode: (val: boolean) => void;
}

const GRID_SIZE = 8; 

const NetGrid: React.FC<NetGridProps> = ({ 
    appMode, 
    selectedPoints, 
    onTogglePoint, 
    onRemovePoint,
    onRotatePoint,
    disabled,
    dimensions,
    selectedFaceType,
    setSelectedFaceType,
    eraserMode,
    setEraserMode
}) => {
  const getPoint = (x: number, y: number) => {
    return selectedPoints.find(p => p.x === x && p.y === y);
  };

  const getFaceColor = (type: number) => {
      switch(type) {
          case 0: return 'bg-blue-500 border-blue-600'; // WxD
          case 1: return 'bg-green-500 border-green-600'; // WxH
          case 2: return 'bg-red-500 border-red-600'; // DxH
          default: return 'bg-slate-500 border-slate-600';
      }
  }

  const getCount = (type: number) => {
    return selectedPoints.filter(p => p.faceType === type).length;
  }

  const getFaceLabel = (type: number, rotated?: boolean) => {
      let w = 1, h = 1;
      switch(type) {
          case 0: w = dimensions.width; h = dimensions.depth; break;
          case 1: w = dimensions.width; h = dimensions.height; break;
          case 2: w = dimensions.depth; h = dimensions.height; break;
      }
      if (rotated) return `${h}x${w}`;
      return `${w}x${h}`;
  }

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const point = getPoint(x, y);
        const active = !!point;
        
        let cellClass = 'bg-white border-slate-200 hover:bg-slate-50';
        let content = null;

        if (active) {
            const type = appMode === AppMode.NET_CUBE ? 0 : (point.faceType ?? 0);
            cellClass = `${getFaceColor(type)} text-white shadow-inner scale-95 group relative`;
            
            content = (
              <>
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  {appMode === AppMode.NET_CUBOID && (
                    <span className="text-[10px] font-bold leading-tight">{getFaceLabel(type, point.rotated)}</span>
                  )}
                </div>
                
                {/* 懸停或選中提示：根據當前工具模式顯示不同圖示 */}
                {!disabled && (
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity rounded ${eraserMode ? 'bg-red-500/40 opacity-100' : 'bg-black/20 opacity-0 group-hover:opacity-100'}`}>
                    {eraserMode ? (
                      <XCircle size={18} className="text-white drop-shadow-md" />
                    ) : (
                      appMode === AppMode.NET_CUBOID ? <RotateCw size={16} className="text-white drop-shadow-md" /> : <XCircle size={16} className="text-white" />
                    )}
                  </div>
                )}
              </>
            );
        } else if (eraserMode) {
          cellClass = 'bg-slate-100 border-slate-200 cursor-not-allowed';
        }
        
        const cursorClass = disabled ? 'cursor-not-allowed' : 'cursor-pointer';

        cells.push(
          <button
            key={`${x}-${y}`}
            disabled={disabled}
            onClick={() => onTogglePoint(x, y)}
            onContextMenu={(e) => {
              e.preventDefault();
              onRemovePoint(x, y);
            }}
            className={`
              w-10 h-10 border rounded transition-all duration-100
              flex items-center justify-center overflow-hidden
              ${cellClass}
              ${cursorClass}
              ${disabled ? 'opacity-80' : ''}
            `}
          >
            {content}
          </button>
        );
      }
    }
    return cells;
  };

  return (
    <div className="absolute bottom-8 right-8 z-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border-2 border-emerald-100 flex gap-6 items-start">
      
      {/* Side Tool Panel */}
      {(appMode === AppMode.NET_CUBE || appMode === AppMode.NET_CUBOID) && (
        <div className="flex flex-col gap-2 w-36">
          <h3 className="font-bold text-[#02a568] text-sm mb-1">工具箱</h3>
          
          {/* 模式選擇 */}
          <div className="flex bg-slate-100 p-1 rounded-lg mb-2">
            <button 
              onClick={() => setEraserMode(false)}
              className={`flex-1 flex flex-col items-center p-2 rounded-md transition-all ${!eraserMode ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <MousePointer2 size={16} />
              <span className="text-[10px] font-bold">畫筆</span>
            </button>
            <button 
              onClick={() => setEraserMode(true)}
              className={`flex-1 flex flex-col items-center p-2 rounded-md transition-all ${eraserMode ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Eraser size={16} />
              <span className="text-[10px] font-bold">橡皮擦</span>
            </button>
          </div>

          {/* 長方體面選擇區 */}
          {appMode === AppMode.NET_CUBOID && !eraserMode && (
            <div className="space-y-2">
              {[0, 1, 2].map(type => {
                const count = getCount(type);
                const isFull = count >= 2;
                return (
                  <button 
                    key={type}
                    disabled={isFull}
                    onClick={() => setSelectedFaceType(type)} 
                    className={`w-full flex flex-col items-center p-2 rounded-lg text-xs border transition-all 
                      ${selectedFaceType === type ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm' : 'bg-white border-slate-200'} 
                      ${isFull ? 'opacity-40 grayscale cursor-not-allowed bg-slate-100' : 'hover:bg-slate-50'}
                    `}
                  >
                    <div className="flex justify-between w-full px-1">
                      <span className="font-bold text-slate-700">{type === 0 ? "上下" : type === 1 ? "前後" : "左右"}</span>
                      <span className={`font-mono ${isFull ? 'text-red-500' : 'text-emerald-600'}`}>{count}/2</span>
                    </div>
                    <span className="text-[9px] text-slate-500">{getFaceLabel(type)}</span>
                    <div className={`w-full h-1 mt-1 rounded-full ${getFaceColor(type).split(' ')[0]}`}></div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-100 text-[10px] text-blue-600 leading-tight">
            💡 {eraserMode ? "點擊已有的面即可刪除" : (appMode === AppMode.NET_CUBOID ? "點擊已有的面可旋轉，點擊空格放置新面" : "點擊已有的面刪除，點擊空格放置新面")}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="flex flex-col items-center gap-2">
        <h3 className="font-bold text-[#02a568] flex items-center gap-2">
          <span>📍 平面設計圖</span>
          {appMode === AppMode.NET_CUBOID && !eraserMode && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${getCount(selectedFaceType) >= 2 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
              {getCount(selectedFaceType) >= 2 ? '這類面已放滿' : `正在使用：${selectedFaceType === 0 ? "上下" : selectedFaceType === 1 ? "前後" : "左右"}`}
            </span>
          )}
        </h3>
        <div 
          className={`grid gap-1 border-2 p-1 rounded-lg bg-slate-50 transition-colors ${eraserMode ? 'border-red-200 ring-4 ring-red-500/10' : 'border-slate-200'}`}
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {renderGrid()}
        </div>
      </div>
    </div>
  );
};

export default NetGrid;