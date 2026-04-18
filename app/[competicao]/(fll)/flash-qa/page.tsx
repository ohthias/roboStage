"use client";

import SetupScreen from "@/components/FlashQA/SetupScreen";
import FlashcardScreen from "@/components/FlashQA/FlashcardScreen";
import ResultScreen from "@/components/FlashQA/ResultScreen";
import { Footer } from "@/components/UI/Footer";
import { useFlashQA } from "./useFlashQA";
import { FLL_MODE } from "./modes/FLL";

export default function FlashQA() {
  const {
    gameState,
    settings,
    startGame,
    finishGame,
    restartGame,
    goHome,
  } = useFlashQA(FLL_MODE);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-6 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          {gameState.status === "setup" && (
            <SetupScreen onStart={startGame} />
          )}

          {gameState.status === "playing" &&
            gameState.selectedQuestions.length > 0 && (
              <FlashcardScreen
                questions={gameState.selectedQuestions}
                settings={settings}
                onFinish={finishGame}
                onExit={goHome}
              />
            )}

          {gameState.status === "playing" &&
            gameState.selectedQuestions.length === 0 && (
              <div className="text-center p-10">
                <p className="text-red-500 font-bold">
                  Nenhuma pergunta encontrada.
                </p>
                <button onClick={goHome} className="mt-4 underline">
                  Voltar
                </button>
              </div>
            )}

          {gameState.status === "finished" && (
            <ResultScreen
              totalQuestions={gameState.selectedQuestions.length}
              flaggedCount={
                gameState.answers.filter((a) => a.flagged).length
              }
              onRestart={restartGame}
              onHome={goHome}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}