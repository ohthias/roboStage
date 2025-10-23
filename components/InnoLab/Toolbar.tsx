
import React from 'react';
import type { DiagramType, Node } from '@/types/InnoLabType';

interface ToolbarProps {
  diagramType: DiagramType;
  onAddNode: () => void;
  onRemoveNode: () => void;
  font: string;
  onFontChange: (font: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  fontColor: string;
  onFontColorChange: (color: string) => void;
  selectedNode: Node | undefined;
  onNodeColorChange: (color: string) => void;
  onNodeTextColorChange: (color: string) => void;
}

const ToolbarButton: React.FC<{ onClick: () => void; children: React.ReactNode; disabled?: boolean }> = ({ onClick, children, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
        {children}
    </button>
);

const ColorInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, onChange }) => (
    <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
            type="color"
            value={value}
            onChange={onChange}
            className="w-8 h-8 p-0 border-0 rounded-md cursor-pointer"
        />
    </div>
);


const Toolbar: React.FC<ToolbarProps> = ({
  diagramType,
  onAddNode,
  onRemoveNode,
  font,
  onFontChange,
  fontSize,
  onFontSizeChange,
  fontColor,
  onFontColorChange,
  selectedNode,
  onNodeColorChange,
  onNodeTextColorChange
}) => {
  const showNodeControls = diagramType === 'Mapa Mental' || diagramType === 'Ishikawa';

  return (
    <nav className="bg-gray-50 p-2 border-r border-gray-200 w-64 flex-shrink-0">
      <div className="space-y-4">
        {showNodeControls && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nodes</h3>
            <div className="flex flex-col gap-2">
              <ToolbarButton onClick={onAddNode}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Adicionar Nó
              </ToolbarButton>
              <ToolbarButton onClick={onRemoveNode} disabled={!selectedNode || selectedNode.id === '1'}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Remover Nó
              </ToolbarButton>
            </div>
          </div>
        )}
        
        {selectedNode && showNodeControls && (
           <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Estilo do Nó</h3>
            <div className="space-y-3 p-2 border border-gray-200 rounded-md bg-white">
              <ColorInput label="Fill:" value={selectedNode?.fillColor || '#ffffff'} onChange={(e) => onNodeColorChange(e.target.value)} />
              <ColorInput label="Text:" value={selectedNode?.textColor || '#333333'} onChange={(e) => onNodeTextColorChange(e.target.value)} />
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Estilo do Texto</h3>
          <div className="space-y-3 p-2 border border-gray-200 rounded-md bg-white">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Fonte</label>
              <select
                value={font}
                onChange={(e) => onFontChange(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
              >
                {["Arial", "Verdana", "Georgia", "Courier New", "Comic Sans MS"].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
             <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Tamanho</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => onFontSizeChange(Math.max(8, Math.min(72, Number(e.target.value))))}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
              />
            </div>
            <ColorInput label="Color:" value={fontColor} onChange={(e) => onFontColorChange(e.target.value)} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Toolbar;