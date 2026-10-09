import {
  X,
  Brain,
  MessageSquareQuote,
  Activity,
  Heart,
  AlertTriangle,
  Sparkles,
  MousePointer,
  Download,
  ThumbsUp,
  Palette,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl relative bg-base-100 p-6 sm:p-8 max-h-[90vh]">
        <button
          onClick={onClose}
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-base-content/60"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="badge badge-primary badge-sm font-bold uppercase tracking-wider mb-2">
          Guia Rápido
        </div>
        <h2 className="text-xl font-bold text-base-content">
          Como Funciona o Mapa de Empatia?
        </h2>
        <p className="text-xs text-base-content/70 mt-1 leading-relaxed">
          O Mapa de Empatia é uma ferramenta de Design Thinking para entender a fundo as necessidades, comportamentos e sentimentos do seu usuário ou cliente.
        </p>

        {/* 4 Steps */}
        <div className="space-y-4 my-5">
          {/* Step 1 */}
          <div className="card bg-base-200/50 border border-base-300 p-3.5 space-y-1.5">
            <h3 className="text-xs font-bold text-base-content flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-content text-[11px] font-bold flex items-center justify-center">
                1
              </span>
              <span>Defina a Persona</span>
            </h3>
            <p className="text-xs text-base-content/70 pl-7 leading-relaxed">
              No topo da tela, clique no ícone de lápis ou na foto para dar um nome, definir o perfil e fazer upload de qualquer foto da pessoa que representa seu público.
            </p>
          </div>

          {/* Step 2 */}
          <div className="card bg-base-200/50 border border-base-300 p-3.5 space-y-2">
            <h3 className="text-xs font-bold text-base-content flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-content text-[11px] font-bold flex items-center justify-center">
                2
              </span>
              <span>Preencha os 6 Quadrantes</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-7 pt-1 text-xs">
              <div className="flex items-start gap-1.5">
                <Brain className="w-3.5 h-3.5 text-info shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-base-content">Pensa:</strong>
                  <span className="text-base-content/60 text-[11px]">Crenças, dúvidas e pensamentos não ditos.</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <MessageSquareQuote className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-base-content">Diz:</strong>
                  <span className="text-base-content/60 text-[11px]">Frases reais ouvidas em entrevistas.</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <Activity className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-base-content">Faz:</strong>
                  <span className="text-base-content/60 text-[11px]">Ações práticas e rotinas observadas.</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <Heart className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-base-content">Sente:</strong>
                  <span className="text-base-content/60 text-[11px]">Emoções (medo, alívio, ansiedade).</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-error shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-base-content">Dores:</strong>
                  <span className="text-base-content/60 text-[11px]">Barreiras, atritos e frustrações.</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-base-content">Necessidades:</strong>
                  <span className="text-base-content/60 text-[11px]">O que ela deseja alcançar e comemora.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="card bg-base-200/50 border border-base-300 p-3.5 space-y-1.5">
            <h3 className="text-xs font-bold text-base-content flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-content text-[11px] font-bold flex items-center justify-center">
                3
              </span>
              <span>Dicas de Interação nos Post-its</span>
            </h3>
            <div className="pl-7 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-base-content/70">
              <div className="flex items-center gap-2">
                <MousePointer className="w-3.5 h-3.5 text-primary" />
                <span><strong>Clique no texto</strong> para editar na hora.</span>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-primary" />
                <span><strong>Mude a cor</strong> clicando nos pontinhos.</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-3.5 h-3.5 text-primary" />
                <span><strong>Vote com +1</strong> para priorizar com a equipe.</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-primary" />
                <span><strong>Arraste e solte</strong> para trocar de quadrante.</span>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="card bg-base-200/50 border border-base-300 p-3.5 space-y-1.5">
            <h3 className="text-xs font-bold text-base-content flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-content text-[11px] font-bold flex items-center justify-center">
                4
              </span>
              <span>Aba Análise & Exportação</span>
            </h3>
            <p className="text-xs text-base-content/70 pl-7 leading-relaxed">
              Clique na aba <strong>Análise</strong> para ver o balanço de dores vs ganhos e ideias de oportunidades. Use o botão <strong>Baixar Imagem</strong> para salvar um PNG em alta qualidade para seus slides e reuniões.
            </p>
          </div>
        </div>

        {/* Modal Action */}
        <div className="modal-action pt-2 border-t border-base-200 flex justify-end">
          <button onClick={onClose} type="button" className="btn btn-primary btn-sm font-bold">
            Entendi, vamos começar!
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
};
