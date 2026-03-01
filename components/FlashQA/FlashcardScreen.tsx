import React, { useState, useEffect } from "react";
import type { Question, GameSettings } from "@/types/FlashQATypes";
import { Clock, CheckCircle, XCircle } from "lucide-react";

interface FlashcardScreenProps {
  questions: Question[];
  settings: GameSettings;
  onFinish: (results: { questionId: string; flagged: boolean }[]) => void;
  onExit: () => void;
}

const FlashcardScreen: React.FC<FlashcardScreenProps> = ({
  questions,
  settings,
  onFinish,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.timePerCard);
  const [answers, setAnswers] = useState<
    { questionId: string; flagged: boolean }[]
  >([]);
  const [feedbackState, setFeedbackState] = useState<
    "difficult" | "success" | null
  >(null);

  const currentQuestion = questions[currentIndex];

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  useEffect(() => {
    setTimeLeft(settings.timePerCard);
    setIsFlipped(false);
    setFeedbackState(null);
  }, [currentIndex, settings.timePerCard]);

  /* ---------------- FLOW ---------------- */
  const processNextQuestion = (flagged: boolean) => {
    const newAnswers = [
      ...answers,
      { questionId: currentQuestion.id, flagged },
    ];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onFinish(newAnswers);
    }
  };

  const handleAnswerInteraction = (flagged: boolean) => {
    if (feedbackState) return;

    setFeedbackState(flagged ? "difficult" : "success");

    setTimeout(() => {
      processNextQuestion(flagged);
    }, 500);
  };

  const progress = (currentIndex / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-xs font-bold uppercase text-primary">
            Progresso
          </span>
          <div className="text-lg font-bold text-primary">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-mono font-bold transition-all ${
            timeLeft < 10
              ? "bg-error text-error-content border-error animate-pulse"
              : "bg-base-100 border-base-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full h-2 bg-base-200 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* FLASHCARD */}
      <div className="relative h-96 w-full perspective-1000 mb-8 group">
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* FRONT */}
          <div className="absolute w-full h-full backface-hidden bg-base-100 rounded-3xl shadow-xl border border-base-200 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:shadow-2xl transition-shadow"
            onClick={() => !feedbackState && setIsFlipped(true)}
          >
            <div className="absolute top-0 left-0 w-full h-4 bg-primary/90 rounded-t-3xl opacity-90"></div>
            <span className="absolute top-8 inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              {currentQuestion.category}
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-base-content leading-snug">
              {currentQuestion.text}
            </h3>
            <span className="absolute bottom-6 text-xs font-medium text-base-content/50">
              Clique para ver a dica
            </span>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 backface-hidden rotate-y-180 bg-neutral text-neutral-content rounded-3xl shadow-xl border border-base-200 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:shadow-2xl transition-shadow"
            onClick={() => !feedbackState && setIsFlipped(false)}
          >
            <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:24px_24px]" />

            <span className="text-xs font-bold uppercase tracking-wider opacity-70 mb-3">
              Dica
            </span>

            <p className="text-lg leading-relaxed max-w-prose">
              {currentQuestion.hint ||
                "Sem dica disponível para esta pergunta."}
            </p>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleAnswerInteraction(true)}
            disabled={!!feedbackState}
            className={`group relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 border shadow-sm
            ${feedbackState === 'difficult' 
                ? 'bg-error border-error text-error-content scale-95 shadow-inner' 
                : feedbackState === 'success'
                    ? 'bg-base-200 border-base-200 text-base-content/40 opacity-60'
                    : 'bg-base-100 text-base-content hover:bg-error/10 hover:text-error border-base-200 hover:border-error hover:shadow-md hover:-translate-y-1'
            }`}
        >
            <div className={`p-3 rounded-full mb-2 transition-colors ${feedbackState === 'difficult' ? 'bg-error/20' : 'bg-error/10 group-hover:bg-error/20'}`}>
                <XCircle className={`w-6 h-6 ${feedbackState === 'difficult' ? 'text-error-content' : 'text-error'}`} />
            </div>
            <span className="font-bold text-sm">Foi Difícil</span>
            <span className="text-[10px] font-medium opacity-60 mt-1 uppercase tracking-wide">Preciso revisar</span>
        </button>

        <button
          onClick={() => handleAnswerInteraction(false)}
            disabled={!!feedbackState}
            className={`group relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 border shadow-sm
            ${feedbackState === 'success' 
                ? 'bg-success border-success text-success-content scale-95 shadow-inner' 
                : feedbackState === 'difficult'
                    ? 'bg-base-200 border-base-200 text-base-content/40 opacity-60'
                    : 'bg-base-100 text-base-content hover:bg-success/10 hover:text-success border-base-200 hover:border-success hover:shadow-md hover:-translate-y-1'
            }`}
        >
             <div className={`p-3 rounded-full mb-2 transition-colors ${feedbackState === 'success' ? 'bg-success/20' : 'bg-success/10 group-hover:bg-success/20'}`}>
                <CheckCircle className={`w-6 h-6 ${feedbackState === 'success' ? 'text-success-content' : 'text-success'}`} />
            </div>
            <span className="font-bold text-sm">Respondi Bem</span>
            <span className="text-[10px] font-medium opacity-60 mt-1 uppercase tracking-wide">Próxima carta</span>
        </button>
      </div>

      {/* EXIT */}
      <div className="mt-8 text-center">
        <button
          onClick={onExit}
          className="text-xs font-bold text-base-content/70 hover:text-error"
        >
          SAIR DO TREINO
        </button>
      </div>
    </div>
  );
};

export default FlashcardScreen;
