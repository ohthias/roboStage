import {
  Activity,
  AlertTriangle,
  Brain,
  Download,
  Heart,
  MessageSquareQuote,
  MousePointer,
  Palette,
  Sparkles,
  ThumbsUp,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { ToolButton, ToolDialog } from '@/components/stage';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUADRANTS = [
  { icon: Brain, cls: 'text-info', title: 'Pensa', text: 'Crenças, dúvidas e pensamentos não ditos.' },
  { icon: MessageSquareQuote, cls: 'text-success', title: 'Diz', text: 'Frases reais ouvidas em entrevistas.' },
  { icon: Activity, cls: 'text-secondary', title: 'Faz', text: 'Ações práticas e rotinas observadas.' },
  { icon: Heart, cls: 'text-accent', title: 'Sente', text: 'Emoções (medo, alívio, ansiedade).' },
  { icon: AlertTriangle, cls: 'text-error', title: 'Dores', text: 'Barreiras, atritos e frustrações.' },
  { icon: Sparkles, cls: 'text-warning', title: 'Necessidades', text: 'O que ela deseja alcançar.' },
];

const TIPS = [
  { icon: MousePointer, text: <><strong>Clique no texto</strong> para editar na hora.</> },
  { icon: Palette, text: <><strong>Mude a cor</strong> nos pontinhos da nota.</> },
  { icon: ThumbsUp, text: <><strong>Vote com +1</strong> para priorizar com a equipe.</> },
  { icon: Download, text: <><strong>Arraste e solte</strong> para trocar de quadrante.</> },
];

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="relative rounded-lg border border-base-300 bg-base-100 p-3 pl-11">
      <span className="absolute left-3 top-3 grid size-6 place-items-center rounded-tl-md rounded-br-md bg-primary font-mono text-[11px] font-bold text-primary-content">
        {n}
      </span>
      <h3 className="text-[13px] font-bold">{title}</h3>
      <div className="mt-1 text-xs leading-relaxed text-base-content/70">{children}</div>
    </li>
  );
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <ToolDialog
      open={isOpen}
      onClose={onClose}
      title="Como funciona o Mapa de Empatia?"
      description="Uma ferramenta de Design Thinking para entender necessidades, comportamentos e sentimentos de quem o projeto quer ajudar."
      size="lg"
      footer={
        <ToolButton variant="primary" onClick={onClose}>
          Entendi, vamos começar!
        </ToolButton>
      }
    >
      <ol className="space-y-2.5 pb-2">
        <Step n={1} title="Defina a persona">
          Clique no lápis ou na foto, no topo do mural, para dar nome, perfil e uma foto à pessoa que representa seu público.
        </Step>
        <Step n={2} title="Preencha os 6 quadrantes">
          <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {QUADRANTS.map(({ icon: Icon, cls, title, text }) => (
              <div key={title} className="flex items-start gap-1.5">
                <Icon className={`mt-0.5 size-3.5 shrink-0 ${cls}`} />
                <div>
                  <strong className="block text-base-content">{title}</strong>
                  <span className="text-[11px] text-base-content/60">{text}</span>
                </div>
              </div>
            ))}
          </div>
        </Step>
        <Step n={3} title="Dicas nos post-its">
          <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {TIPS.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-2">
                <Icon className="size-3.5 shrink-0 text-primary" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </Step>
        <Step n={4} title="Análise e exportação">
          Na aba <strong>Análise</strong> veja o balanço de dores e necessidades e ideias de oportunidade. Em <strong>Exportar</strong>, baixe um
          PNG para os slides ou um relatório para o caderno da equipe.
        </Step>
      </ol>
    </ToolDialog>
  );
};
