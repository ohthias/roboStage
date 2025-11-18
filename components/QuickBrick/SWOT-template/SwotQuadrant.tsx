import React, { useState, useRef, useEffect } from 'react';
import type { SwotCategory, SwotItem, SwotQuadrantConfig } from '@/types/SWOTTemplateType';
import { Shield, AlertTriangle, Lightbulb, Swords, X, Edit2, Check, Trash2, GripVertical } from 'lucide-react';

interface SwotQuadrantProps {
  config: SwotQuadrantConfig;
  items: SwotItem[];
  onUpdateItem: (category: SwotCategory, id: string, newText: string) => void;
  onDeleteItem: (category: SwotCategory, id: string) => void;
  onMoveItem: (itemId: string, fromCategory: SwotCategory, toCategory: SwotCategory) => void;
}

const iconMap = {
  Shield,
  AlertTriangle,
  Lightbulb,
  Swords,
};

export const SwotQuadrant: React.FC<SwotQuadrantProps> = ({
  config,
  items,
  onUpdateItem,
  onDeleteItem,
  onMoveItem,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  
  const Icon = iconMap[config.iconName];
  const editInputRef = useRef<HTMLInputElement>(null);

  // Colors mapping based on theme
  const themeStyles = {
    emerald: {
      bg: 'bg-emerald-50',
      activeBg: 'bg-emerald-100',
      border: 'border-emerald-200',
      header: 'text-emerald-800',
      icon: 'text-emerald-600',
      accent: 'bg-emerald-100',
      button: 'hover:bg-emerald-200 text-emerald-700',
      inputBorder: 'focus:ring-emerald-500',
      ring: 'ring-emerald-300',
    },
    rose: {
      bg: 'bg-rose-50',
      activeBg: 'bg-rose-100',
      border: 'border-rose-200',
      header: 'text-rose-800',
      icon: 'text-rose-600',
      accent: 'bg-rose-100',
      button: 'hover:bg-rose-200 text-rose-700',
      inputBorder: 'focus:ring-rose-500',
      ring: 'ring-rose-300',
    },
    sky: {
      bg: 'bg-sky-50',
      activeBg: 'bg-sky-100',
      border: 'border-sky-200',
      header: 'text-sky-800',
      icon: 'text-sky-600',
      accent: 'bg-sky-100',
      button: 'hover:bg-sky-200 text-sky-700',
      inputBorder: 'focus:ring-sky-500',
      ring: 'ring-sky-300',
    },
    amber: {
      bg: 'bg-amber-50',
      activeBg: 'bg-amber-100',
      border: 'border-amber-200',
      header: 'text-amber-800',
      icon: 'text-amber-600',
      accent: 'bg-amber-100',
      button: 'hover:bg-amber-200 text-amber-700',
      inputBorder: 'focus:ring-amber-500',
      ring: 'ring-amber-300',
    },
  };

  const style = themeStyles[config.colorTheme];

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const startEditing = (item: SwotItem) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      onUpdateItem(config.id, editingId, editText.trim());
      setEditingId(null);
      setEditText('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, item: SwotItem) => {
    e.dataTransfer.setData('application/swot-item', JSON.stringify({ 
      id: item.id, 
      fromCategory: config.id 
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only leave if we are actually leaving the container, not entering a child
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/swot-item'));
      if (data && data.id && data.fromCategory) {
        onMoveItem(data.id, data.fromCategory, config.id);
      }
    } catch (err) {
      console.error("Failed to process drop", err);
    }
  };

  return (
    <div 
      className={`flex flex-col h-full rounded-xl border-2 
      ${isDragOver ? 'border-dashed' : 'border-solid'} ${style.border} 
      ${isDragOver ? style.activeBg : style.bg}
      shadow-sm transition-all duration-300 ease-in-out
      ${isDragOver 
        ? `ring-4 ${style.ring} ring-opacity-60 scale-[1.03] -translate-y-2 shadow-xl z-10` 
        : 'hover:shadow-md hover:-translate-y-0.5'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className={`p-4 border-b ${style.border} flex items-center gap-3`}>
        <div className={`p-2 rounded-lg bg-white shadow-sm ${style.icon}`}>
          <Icon size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`font-bold text-lg ${style.header} leading-tight`}>{config.title}</h2>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full bg-white ${style.icon} shadow-sm border ${style.border}`}>
              {items.length}
            </span>
          </div>
          <p className={`text-xs opacity-75 ${style.header}`}>{config.description}</p>
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[200px]">
        {items.length === 0 ? (
          <div className={`h-full flex flex-col items-center justify-center text-sm opacity-60 italic transition-all duration-300 ${isDragOver ? 'text-blue-500 font-medium scale-110' : 'text-gray-400'}`}>
            {isDragOver ? (
              <div className="flex flex-col items-center animate-pulse">
                <span className="text-lg">Solte aqui!</span>
              </div>
            ) : (
              <>
                <span className="mb-1">Nenhum item</span>
                <span className="text-xs">Use o campo acima para adicionar</span>
              </>
            )}
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id}
              draggable={!editingId}
              onDragStart={(e) => handleDragStart(e, item)}
              className={`group flex items-start gap-2 bg-white/60 p-2.5 rounded-lg border border-transparent 
                ${!editingId ? 'cursor-grab active:cursor-grabbing' : ''}
                hover:border-gray-200 hover:bg-white hover:shadow-sm transition-all duration-200`}
            >
              {editingId === item.id ? (
                <div className="flex-1 flex items-center gap-2 animate-in fade-in duration-200">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className={`flex-1 text-sm p-1 bg-white border rounded focus:outline-none focus:ring-2 ${style.inputBorder}`}
                  />
                  <button onClick={saveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={16} /></button>
                  <button onClick={cancelEdit} className="p-1 text-gray-500 hover:bg-gray-100 rounded"><X size={16} /></button>
                </div>
              ) : (
                <>
                  <div className="mt-0.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" title="Arraste para mover">
                    <GripVertical size={16} />
                  </div>
                  <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.icon} bg-current opacity-70`} />
                  <span className="text-sm text-gray-700 flex-1 leading-relaxed break-words select-none">{item.text}</span>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEditing(item)}
                      className={`p-1.5 rounded ${style.button} mr-1`}
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => onDeleteItem(config.id, item.id)}
                      className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Apagar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};