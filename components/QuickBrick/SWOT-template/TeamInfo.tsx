import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Trophy, Hash } from 'lucide-react';

interface TeamData {
  name: string;
  number: string;
  members: string[];
}

export const TeamInfo: React.FC = () => {
  const [teamData, setTeamData] = useState<TeamData>({
    name: '',
    number: '',
    members: []
  });
  const [newMember, setNewMember] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('fll_team_info');
    if (saved) {
      try {
        setTeamData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse team info", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fll_team_info', JSON.stringify(teamData));
  }, [teamData]);

  const addMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMember.trim()) {
      setTeamData(prev => ({
        ...prev,
        members: [...prev.members, newMember.trim()]
      }));
      setNewMember('');
    }
  };

  const updateField = (field: keyof TeamData, value: string) => {
    setTeamData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-base-200 rounded-xl shadow-lg border border-base-300 overflow-hidden">
        <div className="bg-primary/50 p-6 text-base-content">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Users className="text-fll-yellow" />
            Informações do Time
          </h2>
          <p className="opacity-90 text-sm mt-1">Gerencie os dados do seu time para identificação nos relatórios.</p>
        </div>
        
        <div className="p-8 space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Trophy size={16} className="text-fll-red" />
                Nome do Time
              </label>
              <input
                type="text"
                value={teamData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Ex: Robô Bricks"
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-fll-blue focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Hash size={16} className="text-fll-red" />
                Número do Time
              </label>
              <input
                type="text"
                value={teamData.number}
                onChange={(e) => updateField('number', e.target.value)}
                placeholder="Ex: 1708"
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-fll-blue focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="h-px bg-slate-100" />
        </div>
        
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-xs text-slate-500">
          As alterações são salvas automaticamente no seu navegador.
        </div>
      </div>
    </div>
  );
};