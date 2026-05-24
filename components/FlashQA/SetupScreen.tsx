import React, { useState } from "react";
import { Category, GameSettings } from "@/types/FlashQATypes";
import { Play, BookOpen, Clock, List } from "lucide-react";

interface SetupScreenProps {
  onStart: (settings: GameSettings) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [category, setCategory] = useState<Category>(Category.ALL);
  const [count, setCount] = useState<number>(5);
  const [timePerCard, setTimePerCard] = useState<number>(60);

  const handleStart = () => {
    onStart({ category, count, timePerCard });
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-base-100 via-base-100 to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold text-secondary uppercase tracking-widest mb-2 bg-secondary/10 px-3 py-1 rounded-full">Flash Q&A</span>
          <h1 className="text-4xl md:text-5xl font-black text-base-content leading-tight mb-3">
            Pronto para <span className="text-secondary">brilhar</span> nos juízes?
          </h1>
          <p className="text-base-content/60 max-w-2xl mx-auto">
            Customize seu treino e comece agora. Rápido, divertido e eficaz.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          
          {/* Category Selection - Large Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-base-200 shadow-sm hover:shadow-md transition-shadow">
            <label className="flex items-center gap-2 text-sm font-bold text-base-content mb-5">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-secondary" />
              </div>
              Área de Avaliação
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(Category).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                    category === cat
                      ? "bg-secondary text-secondary-content border-secondary shadow-md scale-105"
                      : "bg-base-50 border-transparent text-base-content/70 hover:border-secondary/30 hover:bg-base-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-primary/70 uppercase mb-2">Sua Sessão</p>
              <p className="text-2xl font-black text-base-content">{count}</p>
              <p className="text-xs text-base-content/50 mt-1">perguntas</p>
            </div>
            <div className="mt-4 pt-4 border-t border-primary/20">
              <p className="text-xs font-bold text-secondary/70 uppercase mb-2">Tempo</p>
              <p className="text-2xl font-black text-base-content">{timePerCard}s</p>
              <p className="text-xs text-base-content/50 mt-1">por pergunta</p>
            </div>
          </div>

          {/* Question Count - Medium Card */}
          <div className="bg-white rounded-2xl p-6 border border-base-200 shadow-sm hover:shadow-md transition-shadow">
            <label className="flex items-center gap-2 text-sm font-bold text-base-content mb-4">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <List className="w-4 h-4 text-secondary" />
              </div>
              Quantidade
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="1"
                max="20"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full h-2 bg-base-200 rounded-lg appearance-none cursor-pointer accent-secondary"
              />
              <div className="flex justify-between text-xs font-semibold text-base-content/50">
                <span>1</span>
                <span>20</span>
              </div>
            </div>
          </div>

          {/* Timer Setting - Medium Card */}
          <div className="bg-white rounded-2xl p-6 border border-base-200 shadow-sm hover:shadow-md transition-shadow">
            <label className="flex items-center gap-2 text-sm font-bold text-base-content mb-4">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-secondary" />
              </div>
              Tempo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[30, 60, 90, 120].map((time) => (
                <button
                  key={time}
                  onClick={() => setTimePerCard(time)}
                  className={`py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                    timePerCard === time
                      ? "bg-secondary text-secondary-content shadow-md scale-105"
                      : "bg-base-100 text-base-content/60 hover:bg-base-200"
                  }`}
                >
                  {time}s
                </button>
              ))}
            </div>
          </div>

          {/* Start Button - Full Width */}
          <button
            onClick={handleStart}
            className="lg:col-span-3 bg-gradient-to-r from-primary to-secondary text-primary-content font-black py-5 rounded-2xl shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 text-lg group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
            <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform relative z-10" />
            <span className="relative z-10">INICIAR TREINO</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
