
import React from 'react';
import { Plus, Trash2, ZoomIn, ZoomOut, Type, Undo2, Redo2, Hand, Smile, Lasso, Layers, BoxSelect, MousePointer2, Cable, Highlighter } from 'lucide-react';

interface Props {
  onAddNode: () => void;
  onAddText: () => void;
  onAddSticker: () => void;
  onAddZone: () => void;
  onRemoveNode: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  interactionMode: 'pan' | 'select' | 'lasso' | 'connect' | 'highlighter';
  setInteractionMode: (mode: 'pan' | 'select' | 'lasso' | 'connect' | 'highlighter') => void;
  isStickerPickerOpen: boolean;
  onToggleLayers: () => void;
  isLayersOpen: boolean;
  highlighterColor: string;
  setHighlighterColor: (c: string) => void;
  highlighterThickness: number;
  setHighlighterThickness: (t: number) => void;
}

const FloatingToolbar: React.FC<Props> = ({ 
  onAddNode, onAddText, onAddSticker, onAddZone, onRemoveNode, onZoomIn, onZoomOut,
  onUndo, onRedo, canUndo, canRedo, interactionMode, setInteractionMode, isStickerPickerOpen,
  onToggleLayers, isLayersOpen,
  highlighterColor, setHighlighterColor,
  highlighterThickness, setHighlighterThickness
}) => {
  
  const highlightColors = [
      '#fde047', // Yellow
      '#86efac', // Green
      '#f9a8d4', // Pink
      '#93c5fd', // Blue
      '#fdba74', // Orange
  ];

  const highlightSizes = [10, 20, 35];

  return (
    <div className="absolute left-6 top-1/2 transform -translate-y-1/2 flex flex-row gap-4 z-30 items-start h-screen mt-4">
      
      {/* Main Tools */}
      <div className="bg-white p-2 rounded-2xl flex flex-col gap-2">
        <button 
            onClick={() => setInteractionMode('select')}
            className={`p-3 rounded-xl transition-colors group relative ${interactionMode === 'select' ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'hover:bg-slate-100 text-slate-600'}`} 
            title="Select Tool (Rectangle)"
        >
           <MousePointer2 size={20} />
        </button>
        <button 
            onClick={() => setInteractionMode('lasso')}
            className={`p-3 rounded-xl transition-colors group relative ${interactionMode === 'lasso' ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'hover:bg-slate-100 text-slate-600'}`} 
            title="Lasso Tool (Freehand)"
        >
           <Lasso size={20} />
        </button>
        <button 
            onClick={() => setInteractionMode('connect')}
            className={`p-3 rounded-xl transition-colors group relative ${interactionMode === 'connect' ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'hover:bg-slate-100 text-slate-600'}`} 
            title="Connect Tool"
        >
           <Cable size={20} />
        </button>
         <button 
            onClick={() => setInteractionMode('highlighter')}
            className={`p-3 rounded-xl transition-colors group relative ${interactionMode === 'highlighter' ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'hover:bg-slate-100 text-slate-600'}`} 
            title="Highlighter Tool"
        >
           <Highlighter size={20} />
        </button>
        <button 
            onClick={() => setInteractionMode('pan')}
            className={`p-3 rounded-xl transition-colors group relative ${interactionMode === 'pan' ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'hover:bg-slate-100 text-slate-600'}`} 
            title="Pan Tool"
        >
           <Hand size={20} />
        </button>
        <div className="h-px bg-slate-200 w-full my-1"></div>
        <button onClick={onAddNode} className="p-3 hover:bg-brand-50 text-brand-600 hover:text-brand-700 rounded-xl transition-colors" title="Add Node">
           <Plus size={20} />
        </button>
        <button onClick={onAddText} className="p-3 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors" title="Add Text Block">
           <Type size={20} />
        </button>
        <button 
            onClick={onAddSticker} 
            className={`p-3 rounded-xl transition-colors ${isStickerPickerOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-600'}`}
            title="Add Sticker"
        >
           <Smile size={20} />
        </button>
         <button onClick={onAddZone} className="p-3 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors" title="Add Zone">
           <BoxSelect size={20} />
        </button>
        <div className="h-px bg-slate-200 w-full my-1"></div>
         <button 
            onClick={onToggleLayers}
            className={`p-3 rounded-xl transition-colors ${isLayersOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-600'}`}
            title="Layers"
        >
           <Layers size={20} />
        </button>
        <button onClick={onRemoveNode} className="p-3 hover:bg-red-50 text-slate-600 hover:text-red-500 rounded-xl transition-colors" title="Delete">
           <Trash2 size={20} />
        </button>
      </div>

      {/* Highlighter Options Sub-menu (Visible when Highlighter is active) */}
      {interactionMode === 'highlighter' && (
         <div className="glass-panel p-3 rounded-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-200">
            
            {/* Colors */}
            <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Color</span>
                <div className="flex flex-col gap-2">
                    {highlightColors.map(c => (
                        <button 
                            key={c}
                            onClick={() => setHighlighterColor(c)}
                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${highlighterColor === c ? 'border-indigo-500 shadow-md scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>

             {/* Sizes */}
             <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Size</span>
                <div className="flex flex-col items-center gap-3">
                    {highlightSizes.map(s => (
                        <button 
                            key={s}
                            onClick={() => setHighlighterThickness(s)}
                            className={`rounded-full bg-slate-400 transition-all hover:bg-slate-600 ${highlighterThickness === s ? 'bg-indigo-600 ring-2 ring-indigo-200' : ''}`}
                            style={{ width: s/2 + 10, height: s/2 + 10 }}
                        />
                    ))}
                </div>
            </div>

         </div>
      )}
    </div>
  );
};

export default FloatingToolbar;
