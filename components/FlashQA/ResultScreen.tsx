import React from 'react';
import { RotateCcw, Home, Trophy, AlertTriangle } from 'lucide-react';

interface ResultScreenProps {
  totalQuestions: number;
  flaggedCount: number;
  onRestart: () => void;
  onHome: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ totalQuestions, flaggedCount, onRestart, onHome }) => {
  const successRate = Math.round(((totalQuestions - flaggedCount) / totalQuestions) * 100);

  let message = "";
  let colorClass = "";

  if (successRate >= 80) {
    message = "Excelente! Vocês estão prontos.";
    colorClass = "text-green-600";
  } else if (successRate >= 50) {
    message = "Bom trabalho, mas revisem os pontos difíceis.";
    colorClass = "text-yellow-600";
  } else {
    message = "Continuem treinando! A prática leva à perfeição.";
    colorClass = "text-fll-red";
  }

  return (
    <div className="max-w-md mx-auto text-center">
        <div className="card bg-base-100 p-8 rounded-2xl shadow-xl border border-base-200">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-primary" />
            </div>

            <h2 className="text-2xl font-bold text-base-content mb-2">Treino Concluído!</h2>
            <p
                className={`text-lg font-medium mb-6 ${
                    successRate >= 80 ? 'text-success' : successRate >= 50 ? 'text-warning' : 'text-error'
                }`}
            >
                {message}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-base-100 rounded-xl border border-base-200">
                    <div className="text-3xl font-bold text-base-content">{totalQuestions}</div>
                    <div className="text-xs text-base-content/60 uppercase tracking-wide mt-1">Total</div>
                </div>
                <div className="p-4 bg-error/10 rounded-xl border border-error">
                    <div className="text-3xl font-bold text-error flex items-center justify-center gap-2">
                        {flaggedCount}
                        {flaggedCount > 0 && <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <div className="text-xs text-error/80 uppercase tracking-wide mt-1">Para Revisar</div>
                </div>
            </div>

            <div className="space-y-3">
                <button
                    onClick={onRestart}
                    className="btn btn-primary w-full font-bold rounded-lg flex items-center justify-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    Treinar Novamente
                </button>
                <button
                    onClick={onHome}
                    className="btn btn-outline w-full font-bold rounded-lg flex items-center justify-center gap-2"
                >
                    <Home className="w-4 h-4" />
                    Menu Principal
                </button>
            </div>
        </div>
    </div>
  );
};

export default ResultScreen;
