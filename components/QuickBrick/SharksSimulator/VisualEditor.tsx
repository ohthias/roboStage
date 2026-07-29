
import React, { useEffect, useState } from 'react';
import { ArrowUp, RotateCw, Trash2, Plus, RotateCcw } from 'lucide-react';
import { Command } from '@/types/SharksSimulator.types';
import { parseCode, commandsToCode } from './engine.service';

interface VisualEditorProps {
  code: string;
  onChange: (newCode: string) => void;
}

const PRESET_ANGLES = [30, 45, 60, 90, 180];

const VisualEditor: React.FC<VisualEditorProps> = ({ code, onChange }) => {
  const [commands, setCommands] = useState<Command[]>([]);

  useEffect(() => {
    setCommands(parseCode(code));
  }, [code]);

  const updateCommand = (index: number, field: keyof Command, value: number) => {
    const newCommands = [...commands];
    // @ts-ignore
    newCommands[index][field] = value;
    onChange(commandsToCode(newCommands));
  };

  const removeCommand = (index: number) => {
    const newCommands = commands.filter((_, i) => i !== index);
    onChange(commandsToCode(newCommands));
  };

  const addCommand = (type: 'reto' | 'giro') => {
    const newCmd: Command = {
      type,
      val: type === 'giro' ? 90 : 20,
      speed: 50
    };
    onChange(commandsToCode([...commands, newCmd]));
  };

  const toggleSign = (index: number) => {
    const cmd = commands[index];
    updateCommand(index, 'val', cmd.val * -1);
  };

  return (
    <div className="flex flex-col h-full bg-base-300">
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {commands.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-base-content/40 gap-4">
            <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center">
               <Plus size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Start Editing</span>
          </div>
        )}
        
        {commands.map((cmd, idx) => (
          <div 
            key={idx} 
            className="card card-compact bg-base-100 shadow border border-base-content/10 hover:shadow-md hover:border-primary/40 transition-all group"
          >
            <div className="card-body p-4 gap-3">
              {/* Header with Icon and Type */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                    ${cmd.type === 'reto' ? 'bg-success/20 text-success' : 'bg-info/20 text-info'}
                  `}>
                    {cmd.type === 'reto' ? <ArrowUp size={18} strokeWidth={2.5} /> : (cmd.val >= 0 ? <RotateCw size={18} strokeWidth={2.5} /> : <RotateCcw size={18} strokeWidth={2.5} />)}
                  </div>
                  <div>
                    <p className="text-xs font-bold opacity-60 uppercase tracking-wider">{cmd.type === 'reto' ? 'Movimento' : 'Rotação'}</p>
                    <p className="text-sm font-mono font-bold">{cmd.val} {cmd.type === 'reto' ? 'cm' : '°'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeCommand(idx)}
                  className="btn btn-ghost btn-sm btn-circle text-error opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control gap-1">
                  <label className="label p-0">
                    <span className="label-text text-xs font-semibold opacity-70">{cmd.type === 'reto' ? 'Distância' : 'Ângulo'}</span>
                  </label>
                  <div className="join w-full">
                    <input 
                      type="number" 
                      value={cmd.val}
                      onChange={(e) => updateCommand(idx, 'val', parseFloat(e.target.value) || 0)}
                      className="input input-sm input-bordered join-item w-full font-mono text-center"
                    />
                    <span className="join-item btn btn-sm btn-static">{cmd.type === 'reto' ? 'cm' : '°'}</span>
                  </div>
                </div>
                <div className="form-control gap-1">
                  <label className="label p-0">
                    <span className="label-text text-xs font-semibold opacity-70">Velocidade</span>
                  </label>
                  <div className="join w-full">
                    <input 
                      type="number" 
                      value={cmd.speed}
                      onChange={(e) => updateCommand(idx, 'speed', parseFloat(e.target.value) || 0)}
                      className="input input-sm input-bordered join-item w-full font-mono text-center"
                    />
                    <span className="join-item btn btn-sm btn-static">%</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Angle Toggles (Only for Giro) */}
              {cmd.type === 'giro' && (
                <div className="pt-2 border-t border-base-content/10">
                  <p className="text-xs font-semibold opacity-70 mb-2">Atalhos</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleSign(idx)} 
                      className="btn btn-xs btn-outline btn-neutral flex-1"
                    >
                      Inverter
                    </button>
                    {PRESET_ANGLES.slice(1, 4).map(angle => (
                      <button 
                        key={angle} 
                        onClick={() => updateCommand(idx, 'val', cmd.val >= 0 ? angle : -angle)} 
                        className="btn btn-xs btn-primary text-primary-content font-mono flex-1"
                      >
                        {angle}°
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Bar */}
      <div className="p-2 grid grid-cols-2 gap-2 bg-base-100 border-t border-base-content/10">
        <button 
          onClick={() => addCommand('reto')}
          className="btn btn-sm btn-outline btn-success"
        >
          <ArrowUp size={14} strokeWidth={3} /> Move
        </button>
        <button 
          onClick={() => addCommand('giro')}
          className="btn btn-sm btn-outline btn-info"
        >
          <RotateCw size={14} strokeWidth={3} /> Turn
        </button>
      </div>
    </div>
  );
};

export default VisualEditor;
