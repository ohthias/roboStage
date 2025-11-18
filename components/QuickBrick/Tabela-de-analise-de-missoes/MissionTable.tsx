import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Check, Settings, MoreHorizontal, Type, Hash, List, X, FileDown } from 'lucide-react';
import { Column, Mission, ColumnType } from '@/types/TableAnalytics';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface MissionTableProps {
  missions: Mission[];
  setMissions: React.Dispatch<React.SetStateAction<Mission[] | null>>;
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  season?: string;
}

export const MissionTable: React.FC<MissionTableProps> = ({
  columns,
  missions,
  setMissions,
  setColumns,
    season
}) => {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColData, setNewColData] = useState<{ label: string; type: ColumnType; options: string }>({
    label: '',
    type: 'text',
    options: ''
  });
  
  // State for column menu
  const [activeMenuColId, setActiveMenuColId] = useState<string | null>(null);
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuColId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCellChange = (missionId: string, colId: string, value: any) => {
    setMissions((prev) =>
      prev ? prev.map((m) => (m.id === missionId ? { ...m, [colId]: value } : m)) : prev
    );
  };

  const addMission = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newMission: Mission = { id: newId, name: 'Nova Missão' };
    columns.forEach(c => {
      // Initialize with empty string to avoid uncontrolled inputs
      newMission[c.id] = ''; 
    });
    setMissions([...missions, newMission]);
  };

  const removeMission = (id: string) => {
    setMissions(missions.filter((m) => m.id !== id));
  };

  const addColumn = () => {
    if (!newColData.label.trim()) return;
    
    // Generate a safe ID from the label
    const cleanLabel = newColData.label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const newId = `${cleanLabel}_${Math.random().toString(36).substr(2, 4)}`;
    
    const newCol: Column = {
      id: newId,
      label: newColData.label,
      type: newColData.type,
      options: newColData.type === 'select' ? newColData.options.split(',').map(s => s.trim()).filter(Boolean) : undefined
    };
    
    setColumns([...columns, newCol]);
    
    // Add this field to all existing missions to keep schema consistent
    setMissions(prev => prev ? prev.map(m => ({
        ...m,
        [newId]: ''
    })) : []);

    setIsAddingColumn(false);
    setNewColData({ label: '', type: 'text', options: '' });
  };

  const removeColumn = (colId: string) => {
    if (confirm('Tem certeza que deseja remover esta coluna? Todos os dados desta coluna serão perdidos.')) {
      setColumns(columns.filter(c => c.id !== colId));
      setMissions(prev => prev ? prev.map(m => {
          const newM = { ...m };
          delete newM[colId];
          return newM;
      }) : prev);
    }
    setActiveMenuColId(null);
  };
  
  const startEditing = (col: Column) => {
      setEditingColId(col.id);
      setEditLabel(col.label);
      setActiveMenuColId(null);
  };

  const saveColEdit = () => {
      if (editingColId && editLabel.trim()) {
          setColumns(cols => cols.map(c => c.id === editingColId ? { ...c, label: editLabel } : c));
      }
      setEditingColId(null);
  };

  const getIconForType = (type: ColumnType) => {
      switch (type) {
          case 'number': return <Hash size={14} className="text-blue-500" />;
          case 'select': return <List size={14} className="text-purple-500" />;
          default: return <Type size={14} className="text-slate-500" />;
      }
  };

  const exportToPdf = () => {
    const doc = new jsPDF();
    
    const tableColumn = columns.map(col => col.label);
    const tableRows = missions.map(mission => {
      return columns.map(col => {
        let val = mission[col.id];
        if (val === undefined || val === null) return '';
        return String(val);
      });
    });

    doc.setFontSize(18);
    doc.text(`Tabela de Missões - ${season}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 28);
    
    autoTable(doc, {
        startY: 35,
        head: [tableColumn],
        body: tableRows,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [220, 38, 38], textColor: 255 },
        alternateRowStyles: { fillColor: [254, 226, 226] },
        theme: 'grid'
    });

    doc.save("fll_missoes.pdf");
  };

  return (
    <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-200">
        <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-base-content">Quadro de Missões</h2>
            <span className="badge badge-outline text-sm">{missions.length}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToPdf}
            className="btn btn-ghost btn-sm gap-2"
            title="Exportar como PDF"
          >
            <FileDown size={16} />
            PDF
          </button>
          <button
            onClick={() => setIsAddingColumn(true)}
            className={`btn btn-sm ${isAddingColumn ? 'btn-secondary' : 'btn-ghost'}`}
          >
            <Settings size={16} />
            Gerenciar Colunas
          </button>
          <button
            onClick={addMission}
            className="btn btn-primary btn-sm flex items-center gap-2"
          >
            <Plus size={16} />
            Nova Missão
          </button>
        </div>
      </div>

      {/* Add Column Form */}
      {isAddingColumn && (
        <div className="bg-base-200 p-4 border-b border-base-200 animate-in fade-in slide-in-from-top-2">
            <div className="max-w-4xl">
              <h3 className="text-sm font-semibold text-base-content mb-3 flex items-center gap-2">
                  <Plus size={16} className="text-primary"/>
                  Adicionar Nova Coluna
              </h3>
              <div className="flex flex-wrap gap-4 items-end p-4 bg-base-100 rounded-lg border border-base-200 shadow-sm">
                <div>
                  <label className="block text-xs font-bold text-base-content/70 uppercase tracking-wider mb-1.5">Nome</label>
                  <input
                    type="text"
                    value={newColData.label}
                    onChange={(e) => setNewColData({ ...newColData, label: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && addColumn()}
                    className="input input-bordered input-sm w-48"
                    placeholder="Ex: Prioridade"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-content/70 uppercase tracking-wider mb-1.5">Tipo</label>
                  <select
                    value={newColData.type}
                    onChange={(e) => setNewColData({ ...newColData, type: e.target.value as ColumnType })}
                    className="select select-bordered select-sm w-36"
                  >
                    <option value="text">Texto (Abc)</option>
                    <option value="number">Número (123)</option>
                    <option value="select">Lista (Opções)</option>
                  </select>
                </div>
                {newColData.type === 'select' && (
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-base-content/70 uppercase tracking-wider mb-1.5">Opções <span className="text-base-content/40 font-normal normal-case">(separadas por vírgula)</span></label>
                    <input
                      type="text"
                      value={newColData.options}
                      onChange={(e) => setNewColData({ ...newColData, options: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && addColumn()}
                      className="input input-bordered input-sm w-full"
                      placeholder="Ex: Alta, Média, Baixa"
                    />
                  </div>
                )}
                <div className="flex gap-2 pb-0.5 ml-auto">
                  <button 
                    onClick={() => setIsAddingColumn(false)} 
                    className="btn btn-ghost btn-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={addColumn} 
                    disabled={!newColData.label}
                    className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Check size={16} />
                    Criar
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto flex-1 custom-scrollbar relative bg-base-100/50">
        <table className="table w-full text-sm">
          <thead className="text-xs text-base-content/70 uppercase bg-base-200 sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th key={col.id} className="px-4 py-3 font-semibold min-w-[150px] group">
                  <div className="flex items-center justify-between gap-2">
                    {editingColId === col.id ? (
                        <div className="flex items-center gap-1 flex-1">
                            <input 
                                className="input input-sm w-full"
                                value={editLabel}
                                onChange={e => setEditLabel(e.target.value)}
                                onBlur={saveColEdit}
                                onKeyDown={e => e.key === 'Enter' && saveColEdit()}
                                autoFocus
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-base-content">
                             {getIconForType(col.type)}
                             <span>{col.label}</span>
                        </div>
                    )}
                    
                    {!col.isSystem && (
                       <div className="relative">
                           <button 
                             onClick={() => setActiveMenuColId(activeMenuColId === col.id ? null : col.id)}
                             className={`btn btn-ghost btn-xs p-1 rounded ${activeMenuColId === col.id ? 'bg-base-200' : 'opacity-0 group-hover:opacity-100'}`}
                           >
                             <MoreHorizontal size={14} />
                           </button>
                           {activeMenuColId === col.id && (
                               <div ref={menuRef} className="absolute right-0 top-full mt-1 w-36 bg-base-100 rounded-lg shadow-lg border border-base-200 z-50 py-1 flex flex-col">
                                   <button 
                                     onClick={() => startEditing(col)}
                                     className="px-3 py-2 text-left hover:bg-base-200 text-base-content flex items-center gap-2 text-sm w-full"
                                   >
                                       <Settings size={12} /> Renomear
                                   </button>
                                   <button 
                                     onClick={() => removeColumn(col.id)}
                                     className="px-3 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 text-sm w-full"
                                   >
                                       <Trash2 size={12} /> Excluir
                                   </button>
                               </div>
                           )}
                       </div>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 w-16 text-center"></th>
            </tr>
          </thead>
          <tbody className="bg-base-100">
            {missions.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-base-content/50">
                      <div className="p-4 bg-base-200 rounded-full mb-3">
                        <List size={32} className="text-base-content/30"/>
                      </div>
                      <p className="font-medium text-base-content">Sua tabela está vazia</p>
                      <p className="text-sm mb-4 text-base-content/70">Comece adicionando missões para sua estratégia.</p>
                      <button onClick={addMission} className="btn btn-link text-primary">Adicionar primeira missão</button>
                  </div>
                </td>
              </tr>
            )}
            {missions.map((mission) => (
              <tr key={mission.id} className="group hover:bg-primary/10 transition-colors">
                {columns.map((col) => (
                  <td key={`${mission.id}-${col.id}`} className="px-4 py-2 relative">
                    {col.type === 'select' ? (
                      <select
                        value={mission[col.id] || ''}
                        onChange={(e) => handleCellChange(mission.id, col.id, e.target.value)}
                        className="select select-ghost select-sm w-full"
                      >
                        <option value="" className="text-base-content/40">Selecione...</option>
                        {col.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : col.type === 'number' ? (
                       <input
                        type="number"
                        value={mission[col.id] ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleCellChange(mission.id, col.id, val === '' ? '' : parseFloat(val));
                        }}
                        className="input input-ghost input-sm w-full font-mono"
                        placeholder="-"
                      />
                    ) : (
                      <input
                        type="text"
                        value={mission[col.id] || ''}
                        onChange={(e) => handleCellChange(mission.id, col.id, e.target.value)}
                        className={`input input-ghost input-sm w-full ${col.id === 'name' ? 'font-semibold' : ''}`}
                        placeholder="..."
                      />
                    )}
                  </td>
                ))}
                <td className="px-2 py-2 sticky right-0 bg-base-100 group-hover:bg-primary/10 text-center">
                  <button
                    onClick={() => removeMission(mission.id)}
                    className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                    title="Remover Missão"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};