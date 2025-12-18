import React from 'react';
import { AppMode, CuboidDimensions, ShowcaseConfig, LabelType } from '../types';
import { Trash2, Box, Layers, Play, RotateCcw, Settings2, Eye, Type, Presentation, Square } from 'lucide-react';

interface ControlsProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  onClear: () => void;
  netCount: number;
  isFolding: boolean;
  onToggleFold: () => void;
  dimensions: CuboidDimensions;
  setDimensions: (dims: CuboidDimensions) => void;
  showcaseConfig: ShowcaseConfig;
  setShowcaseConfig: (config: ShowcaseConfig) => void;
  eraserMode?: boolean;
}

const Controls: React.FC<ControlsProps> = ({ 
  appMode,
  setAppMode,
  onClear,
  netCount,
  isFolding,
  onToggleFold,
  dimensions,
  setDimensions,
  showcaseConfig,
  setShowcaseConfig,
  eraserMode
}) => {
  
  const toggleLabelType = () => {
    const types = [LabelType.NONE, LabelType.BOPOMOFO, LabelType.LATIN];
    const currentIndex = types.indexOf(showcaseConfig.labelType);
    const nextIndex = (currentIndex + 1) % types.length;
    setShowcaseConfig({ ...showcaseConfig, labelType: types[nextIndex] });
  };

  const getLabelIconText = () => {
    if (showcaseConfig.labelType === LabelType.BOPOMOFO) return "ㄅ";
    if (showcaseConfig.labelType === LabelType.LATIN) return "A";
    return "X";
  };

  const showDimensionControls = appMode === AppMode.SHOWCASE || appMode === AppMode.NET_CUBOID;

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-4 w-72 pointer-events-none">
      
      {/* Tab Selector */}
      <div className="bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-slate-200 pointer-events-auto grid grid-cols-3 gap-1 text-[10px]">
        {[
          { mode: AppMode.SHOWCASE, icon: <Presentation size={14} />, label: "展示" },
          { mode: AppMode.NET_CUBE, icon: <Box size={14} />, label: "正方體展開" },
          { mode: AppMode.NET_CUBOID, icon: <Layers size={14} />, label: "長方體展開" }
        ].map(tab => (
          <button
            key={tab.mode}
            onClick={() => setAppMode(tab.mode)}
            className={`py-2 rounded-lg font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              appMode === tab.mode ? 'bg-[#02a568] text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border-2 border-slate-200 pointer-events-auto flex flex-col gap-4">
        
        <div className="flex justify-between items-center border-b pb-2 border-slate-100">
          <h1 className="text-xl font-bold text-slate-700">
            {appMode === AppMode.SHOWCASE && "幾何展示模式"}
            {appMode === AppMode.NET_CUBE && "正方體展開圖"}
            {appMode === AppMode.NET_CUBOID && "長方體展開圖"}
          </h1>
          {(appMode === AppMode.NET_CUBE || appMode === AppMode.NET_CUBOID) && (
             <span className={`text-xs font-bold px-2 py-1 rounded-full ${netCount === 6 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>面數: {netCount}/6</span>
          )}
        </div>

        {showDimensionControls && (
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 space-y-3">
            <div className="flex items-center gap-2 text-[#02a568] font-bold text-sm">
              <Settings2 size={16} /><span>調整尺寸 (長x高x深)</span>
            </div>
            {[
              { label: "長", key: "width" },
              { label: "高", key: "height" },
              { label: "深", key: "depth" }
            ].map(dim => (
              <label key={dim.key} className="flex items-center text-xs gap-3">
                <span className="w-10 font-bold text-slate-600">{dim.label} {dimensions[dim.key as keyof CuboidDimensions]}</span>
                <input 
                  type="range" 
                  min="1" 
                  max="8" 
                  value={dimensions[dim.key as keyof CuboidDimensions]} 
                  onChange={(e) => {
                    const newVal = Number(e.target.value);
                    setDimensions({...dimensions, [dim.key]: newVal});
                  }}
                  className="flex-1 accent-[#02a568]" 
                />
              </label>
            ))}
          </div>
        )}

        {appMode === AppMode.SHOWCASE && (
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={toggleLabelType}
              className={`p-3 rounded-lg border text-sm flex flex-col items-center gap-1 transition-all ${showcaseConfig.labelType !== LabelType.NONE ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <div className="relative">
                <Type size={20} />
                <span className="absolute -top-1 -right-2 text-[10px] bg-blue-500 text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">{getLabelIconText()}</span>
              </div>
              <span>頂點標記</span>
            </button>
            <button 
              onClick={() => setShowcaseConfig({...showcaseConfig, showEdges: !showcaseConfig.showEdges})}
              className={`p-3 rounded-lg border text-sm flex flex-col items-center gap-1 transition-all ${showcaseConfig.showEdges ? 'bg-slate-800 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <Square size={20} />
              <span>顯示邊框</span>
            </button>
            <button 
              onClick={() => setShowcaseConfig({...showcaseConfig, showXRay: !showcaseConfig.showXRay})}
              className={`p-3 rounded-lg border text-sm flex flex-col items-center gap-1 transition-all col-span-2 ${showcaseConfig.showXRay ? 'bg-purple-100 border-purple-400 text-purple-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <Eye size={20} />
              <span>透視 (半透明)</span>
            </button>
          </div>
        )}

        {(appMode === AppMode.NET_CUBE || appMode === AppMode.NET_CUBOID) && (
          <div className="flex flex-col gap-2">
            <button 
              onClick={onToggleFold} 
              disabled={netCount === 0} 
              className={`flex items-center justify-center gap-2 p-4 rounded-xl transition-all font-bold shadow-md ${isFolding ? 'bg-amber-500 text-white' : netCount === 6 ? 'bg-[#02a568] text-white animate-pulse' : 'bg-slate-200 text-slate-400'}`}
            >
              {isFolding ? <RotateCcw size={20} /> : <Play size={20} />}
              {isFolding ? '攤開重來' : '摺疊測試'}
            </button>
            <button 
              onClick={onClear} 
              className="flex items-center justify-center gap-2 p-2 rounded-lg text-slate-500 hover:bg-slate-100 text-sm"
            >
              <Trash2 size={16} />清除重畫
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-slate-500 text-center bg-white/50 backdrop-blur-sm p-2 rounded-lg pointer-events-auto leading-relaxed">
         {appMode === AppMode.SHOWCASE && "拖曳旋轉視角 | 點擊形狀的面可標記顏色"}
         {(appMode === AppMode.NET_CUBE || appMode === AppMode.NET_CUBOID) && (
           <>
             {eraserMode ? "橡皮擦模式：點擊現有的面可刪除" : "畫筆模式：點擊空格放置面，點擊現有的面可旋轉"}
           </>
         )}
      </div>
    </div>
  );
};

export default Controls;