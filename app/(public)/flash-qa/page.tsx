"use client";
import React, { useState } from "react";
import {
  GameSettings,
  GameState,
  Category,
} from "@/types/FlashQATypes";
import { FLL_QUESTIONS } from "./constants";
import SetupScreen from "@/components/FlashQA/SetupScreen";
import FlashcardScreen from "@/components/FlashQA/FlashcardScreen";
import ResultScreen from "@/components/FlashQA/ResultScreen";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import "./flashQA.css";

const FlashQA: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: "setup",
    currentQuestionIndex: 0,
    selectedQuestions: [],
    answers: [],
  });

  const [currentSettings, setCurrentSettings] = useState<GameSettings>({
    category: Category.ALL,
    count: 5,
    timePerCard: 60,
  });

  // Helper to shuffle array
  const shuffle = <T,>(array: T[]): T[] => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleStartGame = (settings: GameSettings) => {
    let filtered = FLL_QUESTIONS;
    if (settings.category !== Category.ALL) {
      filtered = FLL_QUESTIONS.filter((q) => q.category === settings.category);
    }

    // Shuffle and slice
    const selected = shuffle([...filtered]).slice(0, settings.count);

    setCurrentSettings(settings);
    setGameState({
      status: "playing",
      currentQuestionIndex: 0,
      selectedQuestions: selected,
      answers: [],
    });
  };

  const handleGameFinish = (
    answers: { questionId: string; flagged: boolean }[]
  ) => {
    setGameState((prev) => ({
      ...prev,
      status: "finished",
      answers,
    }));
  };

  const handleRestart = () => {
    handleStartGame(currentSettings);
  };

  const handleHome = () => {
    setGameState({
      status: "setup",
      currentQuestionIndex: 0,
      selectedQuestions: [],
      answers: [],
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Main Content */}
      <main className="flex-grow p-6 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          {gameState.status === "setup" && (
            <SetupScreen onStart={handleStartGame} />
          )}

          {gameState.status === "playing" &&
            gameState.selectedQuestions.length > 0 && (
              <FlashcardScreen
                questions={gameState.selectedQuestions}
                settings={currentSettings}
                onFinish={handleGameFinish}
                onExit={handleHome}
              />
            )}

          {gameState.status === "playing" &&
            gameState.selectedQuestions.length === 0 && (
              <div className="text-center p-10">
                <p className="text-red-500 font-bold">
                  Nenhuma pergunta encontrada para esta categoria. Tente outra.
                </p>
                <button onClick={handleHome} className="mt-4 underline">
                  Voltar
                </button>
              </div>
            )}

          {gameState.status === "finished" && (
            <ResultScreen
              totalQuestions={gameState.selectedQuestions.length}
              flaggedCount={gameState.answers.filter((a) => a.flagged).length}
              onRestart={handleRestart}
              onHome={handleHome}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FlashQA;
