// /hooks/useFlashQA.ts
import { useState } from "react";
import { Category, GameSettings, GameState } from "@/types/FlashQATypes";

interface FlashQAMode {
  name: string;
  questions: any[];
  categories: string[];
  defaultSettings: GameSettings;
}

export function useFlashQA(mode: FlashQAMode) {
  const [gameState, setGameState] = useState<GameState>({
    status: "setup",
    currentQuestionIndex: 0,
    selectedQuestions: [],
    answers: [],
  });

  const [settings, setSettings] = useState<GameSettings>(mode.defaultSettings);

  // 🔀 Shuffle desacoplado
  const shuffle = <T>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  // ▶️ Iniciar jogo
  const startGame = (newSettings: GameSettings) => {
    // 🔒 1. Filtra só categorias permitidas pelo modo
    let filtered = mode.questions.filter((q) =>
      mode.categories.includes(q.category),
    );

    // 🎯 2. Aplica filtro do usuário
    if (newSettings.category !== Category.ALL) {
      filtered = filtered.filter((q) => q.category === newSettings.category);
    }

    const selected = shuffle(filtered).slice(0, newSettings.count);

    setSettings(newSettings);
    setGameState({
      status: "playing",
      currentQuestionIndex: 0,
      selectedQuestions: selected,
      answers: [],
    });
  };

  // 🏁 Finalizar jogo
  const finishGame = (answers: { questionId: string; flagged: boolean }[]) => {
    setGameState((prev) => ({
      ...prev,
      status: "finished",
      answers,
    }));
  };

  // 🔁 Reiniciar
  const restartGame = () => {
    startGame(settings);
  };

  // 🏠 Voltar ao início
  const goHome = () => {
    setGameState({
      status: "setup",
      currentQuestionIndex: 0,
      selectedQuestions: [],
      answers: [],
    });
  };

  return {
    gameState,
    settings,
    startGame,
    finishGame,
    restartGame,
    goHome,
  };
}
