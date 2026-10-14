import { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Copy,
  ThumbsUp,
} from 'lucide-react';
import { CATEGORIES } from '@/app/(public)/[competicao]/(fll)/empathy-map/initialData';
import { AnalysisData, EmpathyMap } from '@/types/EmpathyMap.types';
import { generateHeuristicAnalysis } from '@/utils/EmpathyMap/analysisHeuristics';
import { exportMapToMarkdown } from '@/utils/EmpathyMap/exportHelpers';

interface AnalysisViewProps {
  map: EmpathyMap;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ map }) => {
  const [analysis, setAnalysis] = useState<AnalysisData>(() =>
    generateHeuristicAnalysis(map)
  );
  const [copied, setCopied] = useState(false);

  const totalNotes = map.notes.length;
  const positiveCount = map.notes.filter((n) => n.sentiment === 'positive').length;
  const negativeCount = map.notes.filter((n) => n.sentiment === 'negative').length;

  const topVotedNotes = [...map.notes]
    .sort((a, b) => b.votes - a.votes)
    .filter((n) => n.votes > 0)
    .slice(0, 3);

  const handleCopy = () => {
    const md = exportMapToMarkdown(map, analysis);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 mx-auto space-y-5">
      <div className="card bg-base-100 border border-base-200 shadow-xs p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-warning badge-sm font-bold uppercase tracking-wider mb-1">
            Resumo de Análise
          </span>
          <h2 className="text-lg font-bold text-base-content">
            {map.persona.name} · {analysis.archetypeTitle}
          </h2>
          <p className="text-xs text-base-content/60 mt-0.5">
            {totalNotes} notas no mapa ({negativeCount} dores, {positiveCount} positivas)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            type="button"
            className="btn btn-outline btn-sm text-xs font-semibold gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {/* 2-Column Core Insights: Dores vs Ganhos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dores */}
        <div className="card border border-error/20 bg-error/5 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-error font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Principais Dores Mapeadas</span>
          </div>

          <div className="space-y-2">
            {analysis.topPains.map((pain, idx) => (
              <div
                key={idx}
                className="card bg-base-100 border border-error/20 p-3 text-xs text-base-content leading-relaxed shadow-2xs"
              >
                {pain}
              </div>
            ))}
          </div>
        </div>

        {/* Ganhos e Motivações */}
        <div className="card border border-warning/20 bg-warning/5 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-warning-content font-bold text-sm">
            <Sparkles className="w-4 h-4 text-warning" />
            <span>Necessidades & Aspirações</span>
          </div>

          <div className="space-y-2">
            {analysis.coreMotivations.map((mot, idx) => (
              <div
                key={idx}
                className="card bg-base-100 border border-warning/20 p-3 text-xs text-base-content leading-relaxed shadow-2xs"
              >
                {mot}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ideias de Solução / How Might We */}
      <div className="card bg-base-100 border border-base-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-base-content font-bold text-sm">
          <Lightbulb className="w-4 h-4 text-warning" />
          <span>Oportunidades de Design (Como Nós Poderíamos...)</span>
        </div>

        <div className="space-y-2">
          {analysis.howMightWe.map((hmw, idx) => (
            <div
              key={idx}
              className="card bg-base-200/50 border border-base-200 p-3 text-xs text-base-content leading-relaxed italic"
            >
              "{hmw}"
            </div>
          ))}
        </div>
      </div>

      {/* Top Voted Notes */}
      {topVotedNotes.length > 0 && (
        <div className="card bg-base-100 border border-base-200 p-5 shadow-xs space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-base-content">
            <ThumbsUp className="w-3.5 h-3.5 text-warning" />
            <span>Notas Mais Votadas pela Equipe</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {topVotedNotes.map((note) => (
              <div
                key={note.id}
                className="card bg-base-200/50 border border-base-200 p-2.5 text-xs flex flex-col justify-between"
              >
                <p className="text-base-content font-medium mb-2">"{note.text}"</p>
                <div className="flex items-center justify-between text-[10px] text-base-content/60 pt-1.5 border-t border-base-200">
                  <span className="font-semibold text-base-content/70">
                    {CATEGORIES[note.category]?.title.replace('O que ', '').replace('?', '')}
                  </span>
                  <span className="badge badge-warning badge-xs font-mono font-bold">
                    {note.votes} votos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
