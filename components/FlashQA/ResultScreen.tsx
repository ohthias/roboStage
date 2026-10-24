import React from "react";
import { RotateCcw, Home, Trophy, AlertTriangle, ArrowRight } from "lucide-react";

interface ResultScreenProps {
  totalQuestions: number;
  flaggedCount: number;
  onRestart: () => void;
  onHome: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  totalQuestions,
  flaggedCount,
  onRestart,
  onHome,
}) => {
  const successRate =
    totalQuestions > 0 ? Math.round(((totalQuestions - flaggedCount) / totalQuestions) * 100) : 0;

  const tone =
    successRate >= 80
      ? { text: "text-success", bar: "bg-success", msg: "Excelente! Vocês estão prontos." }
      : successRate >= 50
        ? { text: "text-warning", bar: "bg-warning", msg: "Bom trabalho, mas revisem os pontos difíceis." }
        : { text: "text-error", bar: "bg-error", msg: "Continuem treinando! A prática leva à perfeição." };

  return (
    <div className="mx-auto max-w-lg py-6">
      <div className="relative overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-7 shadow-xl shadow-base-content/[0.04] sm:p-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full border border-base-300"
        />

        <div className="relative flex items-center justify-between">
          <div className="flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl bg-primary text-primary-content">
            <Trophy size={23} strokeWidth={1.8} />
          </div>
          <span className="font-mono text-xs text-base-content/35">/fim</span>
        </div>

        <p className="relative mt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          Treino concluído
        </p>
        <h2 className="relative mt-2 text-3xl font-bold tracking-tight">
          <span className={`font-mono ${tone.text}`}>{successRate}%</span> de confiança
        </h2>
        <p className="relative mt-2 text-sm text-base-content/60">{tone.msg}</p>

        <div className="relative mt-5 h-1 w-full bg-base-300/60">
          <div className={`h-full ${tone.bar} transition-all duration-700`} style={{ width: `${successRate}%` }} />
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-tl-xl rounded-br-xl border border-base-300 p-4">
            <p className="font-mono text-3xl font-bold">{totalQuestions}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-base-content/50">
              Total
            </p>
          </div>
          <div className="rounded-tl-xl rounded-br-xl border border-error/40 bg-error/[0.05] p-4">
            <p className="flex items-center gap-2 font-mono text-3xl font-bold text-error">
              {flaggedCount}
              {flaggedCount > 0 && <AlertTriangle size={18} />}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-error/80">
              Para revisar
            </p>
          </div>
        </div>

        <div className="relative mt-7 flex flex-col gap-3 border-t border-base-300 pt-5 sm:flex-row">
          <button
            onClick={onRestart}
            className="group btn btn-primary flex-1 justify-between rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none"
          >
            <span className="flex items-center gap-2">
              <RotateCcw size={16} /> Treinar de novo
            </span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={onHome}
            className="btn btn-ghost flex-1 gap-2 rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none border border-base-300"
          >
            <Home size={16} /> Menu do Recall
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
