import React, { useState } from "react";
import { Category, GameSettings } from "@/types/FlashQATypes";
import { Play, BookOpen, Clock, List } from "lucide-react";
import Breadcrumbs from "../UI/Breadcrumbs";

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
    <div>
      <Breadcrumbs />
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-full mt-4">
        {/* Header */}
        <div className="w-full lg:w-1/3 h-full">
          <div className="relative overflow-hidden rounded-3xl border border-secondary/20 bg-gradient-to-br from-secondary/10 via-base-100 to-primary/10 p-6 md:p-8 shadow-sm">
            <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-secondary/20 blur-2xl" />
            <div className="absolute -bottom-16 -left-10 w-40 h-40 rounded-full bg-primary/20 blur-2xl" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest mb-4 bg-secondary/15 px-3 py-1.5 rounded-full border border-secondary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                Flash Q&A
              </span>

              <h1 className="text-3xl md:text-5xl font-black text-base-content leading-tight mb-4">
                Pronto para <span className="text-secondary">brilhar</span> nos
                juízes?
              </h1>

              <p className="text-sm md:text-base text-base-content/70 leading-relaxed max-w-xl">
                Customize seu treino e comece agora. Rápido, divertido e eficaz.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-base-200/80 bg-base-200/70 backdrop-blur-sm p-3">
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-wide text-base-content/50">
                    Modo
                  </p>
                  <p className="text-sm md:text-base font-extrabold text-base-content mt-1">
                    Treino rápido
                  </p>
                </div>
                <div className="rounded-xl border border-base-200/80 bg-base-200/70 backdrop-blur-sm p-3">
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-wide text-base-content/50">
                    Foco
                  </p>
                  <p className="text-sm md:text-base font-extrabold text-base-content mt-1">
                    Performance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="w-2/3 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Category Selection - Large Card */}
          <div className="lg:col-span-2 bg-base-200 rounded-2xl p-6 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
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
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20 flex flex-col justify-between h-full relative overflow-hidden row-span-2">
            <div>
              <p className="text-xs font-bold text-base-content/50 uppercase mb-2">
                Sua Sessão
              </p>
              <p className="text-2xl font-black text-base-content">{count}</p>
              <p className="text-xs text-base-content/50 mt-1">perguntas</p>
            </div>
            <div className="mt-4 pt-4 border-t border-base-300">
              <p className="text-xs font-bold text-base-content/50 uppercase mb-2">
                Tempo
              </p>
              <p className="text-2xl font-black text-base-content">
                {timePerCard}s
              </p>
              <p className="text-xs text-base-content/50 mt-1">por pergunta</p>
            </div>
            <div className="absolute -top-5 -right-5 w-12 h-12 rounded-full bg-primary/20 blur-xl" />
            <div className="absolute -bottom-5 -left-5 w-16 h-16 rounded-full bg-secondary/20 blur-xl" />
            <button
              onClick={handleStart}
              className="btn btn-secondary w-full mt-6 flex items-center justify-center gap-2"
            >
              <Play size={16} />
              <p className="">Iniciar</p>
            </button>
          </div>

          {/* Question Count - Medium Card */}
          <div className="bg-base-200 rounded-2xl p-6 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
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
                className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer accent-secondary"
              />
              <div className="flex justify-between text-xs font-semibold text-base-content/50">
                <span>1</span>
                <span>10</span>
                <span>20</span>
              </div>
            </div>
          </div>

          {/* Timer Setting - Medium Card */}
          <div className="bg-base-200 rounded-2xl p-6 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
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
                  className={`py-2 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${
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
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
