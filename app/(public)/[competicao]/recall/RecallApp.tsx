"use client";

import SetupScreen from "@/components/FlashQA/SetupScreen";
import FlashcardScreen from "@/components/FlashQA/FlashcardScreen";
import ResultScreen from "@/components/FlashQA/ResultScreen";
import { useFlashQA } from "./useFlashQA";
import { RECALL_MODES, RecallCompetition } from "./modes";

export default function RecallApp({ competicao }: { competicao: RecallCompetition }) {
  const mode = RECALL_MODES[competicao];
  const { gameState, settings, startGame, finishGame, restartGame, goHome } =
    useFlashQA(mode);

  return (
    <div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-primary/5 to-transparent" />
      <main className="relative mx-auto min-h-screen max-w-6xl space-y-8 px-4 pt-8 pb-16">
        {gameState.status === "setup" && <SetupScreen mode={mode} onStart={startGame} />}

        {gameState.status === "playing" && gameState.selectedQuestions.length > 0 && (
          <FlashcardScreen
            questions={gameState.selectedQuestions}
            settings={settings}
            onFinish={finishGame}
            onExit={goHome}
          />
        )}

        {gameState.status === "playing" && gameState.selectedQuestions.length === 0 && (
          <div className="mx-auto max-w-md rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-10 text-center">
            <p className="font-bold text-error">Nenhuma pergunta encontrada.</p>
            <button onClick={goHome} className="btn btn-ghost btn-sm mt-4">
              Voltar
            </button>
          </div>
        )}

        {gameState.status === "finished" && (
          <ResultScreen
            totalQuestions={gameState.selectedQuestions.length}
            flaggedCount={gameState.answers.filter((a) => a.flagged).length}
            onRestart={restartGame}
            onHome={goHome}
          />
        )}
      </main>
    </div>
  );
}
