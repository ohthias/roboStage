
import React, { useEffect, useState } from 'react';
import { ArrowUp, RotateCw, Trash2, Plus, RotateCcw } from 'lucide-react';
import { Command } from '@/types/RobotTrackType';
import { parseCode, commandsToCode } from '@/utils/engineRobotTrack';

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
    <div className="flex flex-col h-full bg-base-200">
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {commands.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-base-content/40 gap-4">
            <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center">
               <Plus size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Iniciar Edição</span>
          </div>
        )}
        
        {commands.map((cmd, idx) => (
          <div 
            key={idx} 
            className="card card-compact bg-base-100 shadow-sm border border-base-content/5 group hover:border-primary/50 transition-colors"
          >
            <div className="card-body flex-row items-center p-3 gap-2">
              {/* Minimal Icon */}
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                ${cmd.type === 'reto' ? 'bg-success/10 text-success' : 'bg-info/10 text-info'}
              `}>
                {cmd.type === 'reto' ? <ArrowUp size={16} strokeWidth={2.5} /> : (cmd.val >= 0 ? <RotateCw size={16} strokeWidth={2.5} /> : <RotateCcw size={16} strokeWidth={2.5} />)}
              </div>

              {/* Inputs */}
              <div className="flex-1 flex gap-2">
                  <div className="join w-full">
                     <input 
                        type="number" 
                        value={cmd.val}
                        onChange={(e) => updateCommand(idx, 'val', parseFloat(e.target.value))}
                        className="input input-xs input-bordered join-item w-full font-mono text-right"
                     />
                     <span className="join-item btn btn-xs btn-static text-[10px] w-12">{cmd.type === 'reto' ? 'CM' : 'deg'}</span>
                  </div>
                  <div className="join w-full">
                     <input 
                        type="number" 
                        value={cmd.speed}
                        onChange={(e) => updateCommand(idx, 'speed', parseFloat(e.target.value))}
                        className="input input-xs input-bordered join-item w-full font-mono text-right"
                     />
                     <span className="join-item btn btn-xs btn-static text-[9px]">VEL</span>
                  </div>
              </div>

              {/* Action */}
              <button 
                onClick={() => removeCommand(idx)}
                className="btn btn-ghost btn-xs btn-square text-error opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
            
            {/* Quick Angle Toggles (Only for Giro) */}
            {cmd.type === 'giro' && (
                <div className="absolute -bottom-3 right-12 opacity-0 group-hover:opacity-100 transition-all z-10 join shadow-lg">
                    <button onClick={() => toggleSign(idx)} className="join-item btn btn-xs btn-neutral text-[9px]">INV</button>
                    {PRESET_ANGLES.slice(1, 4).map(angle => (
                         <button key={angle} onClick={() => updateCommand(idx, 'val', cmd.val >= 0 ? angle : -angle)} className="join-item btn btn-xs btn-primary text-primary-content text-[9px] font-mono">{angle}</button>
                    ))}
                </div>
            )}
          </div>
        ))}
      </div>

      {/* Floating Action Bar */}
      <div className="p-2 grid grid-cols-2 gap-2 bg-base-100 border-t border-base-content/10">
        <button 
          onClick={() => addCommand('reto')}
          className="btn btn-sm btn-outline btn-success"
        >
          <ArrowUp size={14} strokeWidth={3} /> Reto
        </button>
        <button 
          onClick={() => addCommand('giro')}
          className="btn btn-sm btn-outline btn-info"
        >
          <RotateCw size={14} strokeWidth={3} /> Giro
        </button>
      </div>
    </div>
  );
};

export default VisualEditor;
