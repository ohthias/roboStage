import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Mission, Column } from '@/types/TableAnalytics';
import { Trophy, Timer, Activity, AlertCircle } from 'lucide-react';

interface AnalyticsProps {
  missions: Mission[];
  columns: Column[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ missions, columns }) => {
  // Helpers to find columns for metrics
  const pointsCol = columns.find(c => c.label.toLowerCase().includes('ponto') || c.id === 'points');
  const timeCol = columns.find(c => c.label.toLowerCase().includes('tempo') || c.id === 'time');
  const diffCol = columns.find(c => c.label.toLowerCase().includes('dificuldade') || c.id === 'difficulty');

  const totalPoints = missions.reduce((sum, m) => sum + (parseFloat(m[pointsCol?.id || ''] || '0') || 0), 0);
  const totalTime = missions.reduce((sum, m) => sum + (parseFloat(m[timeCol?.id || ''] || '0') || 0), 0);
  const avgDifficulty = missions.length > 0 
    ? (missions.reduce((sum, m) => sum + (parseFloat(m[diffCol?.id || ''] || '0') || 0), 0) / missions.length).toFixed(1)
    : '0';

  // Prepare data for charts
  const chartData = missions.map(m => ({
    name: m.name.split(':')[0].replace('Missão ', 'M'), // Shorten name
    fullName: m.name,
    points: parseFloat(m[pointsCol?.id || ''] || '0') || 0,
    time: parseFloat(m[timeCol?.id || ''] || '0') || 0,
    difficulty: parseFloat(m[diffCol?.id || ''] || '0') || 0,
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Potencial de Pontos</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalPoints}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Timer size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Tempo Estimado</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalTime}s</h3>
            <p className="text-xs text-slate-400">Meta: 150s</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Dificuldade Média</p>
            <h3 className="text-2xl font-bold text-slate-800">{avgDifficulty}/5</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Missões Totais</p>
            <h3 className="text-2xl font-bold text-slate-800">{missions.length}</h3>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        
        {/* Bar Chart: Points per Mission */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Pontos por Missão</h3>
          <div className="flex-1 min-h-0">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="points" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Pontos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter Chart: Points vs Time (Efficiency) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Eficiência (Pontos vs Tempo)</h3>
          <div className="flex-1 min-h-0">
             <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  dataKey="time" 
                  name="Tempo" 
                  unit="s" 
                  label={{ value: 'Tempo (s)', position: 'bottom', offset: 0, fontSize: 12 }} 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  type="number" 
                  dataKey="points" 
                  name="Pontos" 
                  label={{ value: 'Pontos', angle: -90, position: 'left', offset: 0, fontSize: 12 }} 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ZAxis type="number" dataKey="difficulty" range={[60, 400]} name="Dificuldade" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 shadow-lg rounded-lg border border-slate-100">
                          <p className="font-bold text-slate-800">{data.fullName}</p>
                          <p className="text-sm text-blue-600">Pontos: {data.points}</p>
                          <p className="text-sm text-slate-500">Tempo: {data.time}s</p>
                          <p className="text-sm text-red-500">Dificuldade: {data.difficulty}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Missões" data={chartData} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-slate-400 mt-2">Tamanho da bolha = Dificuldade</p>
        </div>

      </div>
    </div>
  );
};
