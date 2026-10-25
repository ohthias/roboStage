import React, { useState, useEffect } from "react";
import type { Question, GameSettings } from "@/types/FlashQATypes";
import { Clock, CheckCircle, XCircle, RotateCw, X } from "lucide-react";

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
  const [answers, setAnswers] = useState<{ questionId: string; flagged: boolean }[]>([]);
  const [feedbackState, setFeedbackState] = useState<"difficult" | "success" | null>(null);

  const currentQuestion = questions[currentIndex];

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  /* ---------------- FLOW ---------------- */
  const processNextQuestion = (flagged: boolean) => {
    const newAnswers = [...answers, { questionId: currentQuestion.id, flagged }];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      // reseta o card ao trocar de pergunta
      setTimeLeft(settings.timePerCard);
      setIsFlipped(false);
      setFeedbackState(null);
      setCurrentIndex((prev) => prev + 1);
    } else {
      onFinish(newAnswers);
    }
  };

  const handleAnswerInteraction = (flagged: boolean) => {
    if (feedbackState) return;
    setFeedbackState(flagged ? "difficult" : "success");
    setTimeout(() => processNextQuestion(flagged), 500);
  };

  const progress = (currentIndex / questions.length) * 100;
  const timeRatio = settings.timePerCard > 0 ? timeLeft / settings.timePerCard : 0;
  const lowTime = timeLeft < 10;
  const number = String(currentIndex + 1).padStart(2, "0");

  return (
    <div className="mx-auto max-w-2xl">
      {/* HEADER */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            Progresso
          </p>
          <p className="font-mono text-lg font-bold">
            {number}
            <span className="text-base-content/35"> / {String(questions.length).padStart(2, "0")}</span>
          </p>
        </div>

        <div
          className={`flex items-center gap-2 rounded-tl-xl rounded-br-xl border px-4 py-2 font-mono font-bold tabular-nums transition-all ${
            lowTime
              ? "animate-pulse border-error bg-error text-error-content"
              : "border-base-300 bg-base-100"
          }`}
        >
          <Clock className="h-4 w-4" />
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="mb-8 h-1 w-full overflow-hidden bg-base-300/60">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* FLASHCARD */}
      <div className="relative mb-6 h-96 w-full [perspective:1000px]">
        <div
          className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* FRONT */}
          <button
            type="button"
            className="group absolute flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-7 text-left shadow-xl shadow-base-content/[0.04] [backface-visibility:hidden] sm:p-9"
            onClick={() => !feedbackState && setIsFlipped(true)}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-110 group-hover:border-primary/30"
            />
            {/* barra de tempo */}
            <div
              aria-hidden="true"
              className={`absolute left-0 top-0 h-1 transition-all duration-1000 ease-linear ${lowTime ? "bg-error" : "bg-primary"}`}
              style={{ width: `${timeRatio * 100}%` }}
            />

            <div className="relative flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                {currentQuestion.category}
              </span>
              <span className="font-mono text-xs text-base-content/35">/{number}</span>
            </div>

            <h3 className="relative my-auto text-2xl font-bold leading-snug tracking-tight md:text-3xl">
              {currentQuestion.text}
            </h3>

            <span className="relative flex items-center gap-2 border-t border-base-300 pt-4 text-xs font-semibold text-base-content/50">
              <RotateCw size={13} /> Toque para ver a dica
            </span>
          </button>

          {/* BACK */}
          <button
            type="button"
            className="absolute inset-0 flex cursor-pointer flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl bg-neutral p-7 text-left text-neutral-content shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-9"
            onClick={() => !feedbackState && setIsFlipped(false)}
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.05]" />
            <span className="relative text-[10px] font-bold uppercase tracking-[0.18em] opacity-60">
              Dica
            </span>
            <p className="relative my-auto max-w-prose text-lg leading-relaxed">
              {currentQuestion.hint || "Sem dica disponível para esta pergunta."}
            </p>
            <span className="relative flex items-center gap-2 border-t border-neutral-content/15 pt-4 text-xs font-semibold opacity-60">
              <RotateCw size={13} /> Toque para voltar à pergunta
            </span>
          </button>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleAnswerInteraction(true)}
          disabled={!!feedbackState}
          className={`group flex items-center gap-3 rounded-tl-2xl rounded-br-2xl border p-5 text-left transition-all duration-300 ${
            feedbackState === "difficult"
              ? "scale-[0.98] border-error bg-error text-error-content"
              : feedbackState === "success"
                ? "border-base-300 bg-base-200 opacity-50"
                : "border-base-300 bg-base-100 hover:-translate-y-1 hover:border-error/50 hover:bg-error/[0.04]"
          }`}
        >
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors ${
              feedbackState === "difficult"
                ? "bg-error-content/20"
                : "bg-error/10 text-error group-hover:bg-error group-hover:text-error-content"
            }`}
          >
            <XCircle size={20} />
          </span>
          <span>
            <span className="block text-sm font-bold">Foi difícil</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.14em] opacity-60">
              Preciso revisar
            </span>
          </span>
        </button>

        <button
          onClick={() => handleAnswerInteraction(false)}
          disabled={!!feedbackState}
          className={`group flex items-center gap-3 rounded-tl-2xl rounded-br-2xl border p-5 text-left transition-all duration-300 ${
            feedbackState === "success"
              ? "scale-[0.98] border-success bg-success text-success-content"
              : feedbackState === "difficult"
                ? "border-base-300 bg-base-200 opacity-50"
                : "border-base-300 bg-base-100 hover:-translate-y-1 hover:border-success/50 hover:bg-success/[0.04]"
          }`}
        >
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors ${
              feedbackState === "success"
                ? "bg-success-content/20"
                : "bg-success/10 text-success group-hover:bg-success group-hover:text-success-content"
            }`}
          >
            <CheckCircle size={20} />
          </span>
          <span>
            <span className="block text-sm font-bold">Respondi bem</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.14em] opacity-60">
              Próxima carta
            </span>
          </span>
        </button>
      </div>

      {/* EXIT */}
      <div className="mt-8 text-center">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-base-content/50 transition-colors hover:text-error"
        >
          <X size={12} /> Sair do treino
        </button>
      </div>
    </div>
  );
};

export default FlashcardScreen;
