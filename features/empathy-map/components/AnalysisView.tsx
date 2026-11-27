import { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Copy,
  ThumbsUp,
} from 'lucide-react';
import { Panel, ToolBadge, ToolButton } from '@/components/stage';
import { CATEGORIES } from '@/features/empathy-map/lib/initialData';
import { AnalysisData, EmpathyMap } from '@/features/empathy-map/types';
import { generateHeuristicAnalysis } from '@/features/empathy-map/lib/analysisHeuristics';
import { exportMapToMarkdown } from '@/features/empathy-map/lib/exportHelpers';

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
    <div className="space-y-3">
      <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-base-300 bg-base-100 p-4 sm:flex-row sm:items-center">
        <div>
          <ToolBadge tone="warning">Resumo da análise</ToolBadge>
          <h2 className="mt-1.5 text-lg font-black tracking-tight">
            {map.persona.name} · {analysis.archetypeTitle}
          </h2>
          <p className="mt-0.5 text-xs text-base-content/60">
            {totalNotes} notas no mapa ({negativeCount} dores, {positiveCount} positivas)
          </p>
        </div>
        <ToolButton icon={<Copy />} onClick={handleCopy}>
          {copied ? 'Copiado!' : 'Copiar relatório'}
        </ToolButton>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Panel title="Principais dores mapeadas" icon={<AlertTriangle className="text-error" />} className="border-t-[3px] border-t-error">
          <ul className="space-y-2">
            {analysis.topPains.map((pain, idx) => (
              <li key={idx} className="rounded-md border border-error/20 bg-error/[0.05] px-3 py-2 text-xs leading-relaxed">
                {pain}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Necessidades e aspirações" icon={<Sparkles className="text-warning" />} className="border-t-[3px] border-t-warning">
          <ul className="space-y-2">
            {analysis.coreMotivations.map((mot, idx) => (
              <li key={idx} className="rounded-md border border-warning/30 bg-warning/[0.07] px-3 py-2 text-xs leading-relaxed">
                {mot}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Oportunidades de design (Como nós poderíamos...)" icon={<Lightbulb className="text-warning" />}>
        <ul className="space-y-2">
          {analysis.howMightWe.map((hmw, idx) => (
            <li key={idx} className="rounded-md border-l-[3px] border-l-primary bg-base-200/50 px-3 py-2 text-xs italic leading-relaxed">
              “{hmw}”
            </li>
          ))}
        </ul>
      </Panel>

      {topVotedNotes.length > 0 && (
        <Panel title="Notas mais votadas pela equipe" icon={<ThumbsUp className="text-warning" />}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {topVotedNotes.map((note) => (
              <div key={note.id} className="flex flex-col justify-between rounded-md border border-base-300 bg-base-200/40 p-2.5 text-xs">
                <p className="mb-2 font-medium">“{note.text}”</p>
                <div className="flex items-center justify-between border-t border-base-300 pt-1.5 text-[10px] text-base-content/60">
                  <span className="font-semibold">{CATEGORIES[note.category]?.title.replace('O que ', '').replace('?', '')}</span>
                  <ToolBadge tone="warning" className="font-mono">
                    {note.votes} votos
                  </ToolBadge>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
};
