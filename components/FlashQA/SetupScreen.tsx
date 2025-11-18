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
    <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-10">
      {/* Vector Illustration Section (Desktop Only) */}
      <div className="hidden lg:flex flex-col justify-center space-y-8 p-4 flex-1">
        <div className="space-y-4">
          <span className="text-sm font-bold text-base-content">Flash Q&A</span>
          <h1 className="text-5xl font-extrabold text-base-content leading-tight">
            Prepare-se para os <span className="text-secondary">juízes.</span>
          </h1>
          <p className="text-lg text-base-content/80 max-w-md leading-relaxed">
            Treine Core Values, Projeto de Inovação e Design do Robô com
            flashcards dinâmicos e cronometrados.
          </p>
        </div>

        {/* Custom SVG Vector Illustration */}
        <div className="relative w-full aspect-square max-w-md">
          <svg
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-2xl"
          >
            {/* Background Elements */}
            <circle cx="200" cy="200" r="180" fill="#F1F5F9" />
            <path
              d="M200 400C310.457 400 400 310.457 400 200C400 89.543 310.457 0 200 0C89.543 0 0 89.543 0 200C0 310.457 89.543 400 200 400Z"
              fill="url(#paint0_radial)"
              fillOpacity="0.5"
            />

            {/* Abstract Gears/Robot Parts */}
            <rect
              x="80"
              y="120"
              width="140"
              height="180"
              rx="20"
              fill="#FFFFFF"
              stroke="#0054A6"
              strokeWidth="4"
            />
            <rect
              x="95"
              y="140"
              width="110"
              height="80"
              rx="10"
              fill="#E2E8F0"
            />
            <circle cx="115" cy="180" r="8" fill="#0054A6" />
            <circle cx="185" cy="180" r="8" fill="#0054A6" />
            <path
              d="M130 200 Q150 220 170 200"
              stroke="#0054A6"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Checklist Card */}
            <rect
              x="180"
              y="80"
              width="140"
              height="160"
              rx="10"
              fill="#FFFFFF"
              stroke="#ED1C24"
              strokeWidth="4"
              transform="rotate(10 180 80)"
            />
            <rect
              x="200"
              y="110"
              width="80"
              height="10"
              rx="5"
              fill="#ED1C24"
              opacity="0.2"
              transform="rotate(10 180 80)"
            />
            <rect
              x="200"
              y="140"
              width="100"
              height="10"
              rx="5"
              fill="#94A3B8"
              opacity="0.5"
              transform="rotate(10 180 80)"
            />
            <rect
              x="200"
              y="170"
              width="90"
              height="10"
              rx="5"
              fill="#94A3B8"
              opacity="0.5"
              transform="rotate(10 180 80)"
            />

            {/* Floating Elements */}
            <circle cx="320" cy="300" r="30" fill="#0054A6" opacity="0.1" />
            <path
              d="M300 280L340 320"
              stroke="#0054A6"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M340 280L300 320"
              stroke="#0054A6"
              strokeWidth="4"
              strokeLinecap="round"
            />

            <circle cx="80" cy="320" r="20" fill="#ED1C24" opacity="0.1" />
            <circle cx="80" cy="320" r="10" fill="#ED1C24" />

            <defs>
              <radialGradient
                id="paint0_radial"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(200 200) rotate(90) scale(200)"
              >
                <stop stopColor="#E2E8F0" stopOpacity="0" />
                <stop offset="1" stopColor="#CBD5E1" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Setup Card (Centered on Mobile, Right on Desktop) */}
      <div className="bg-base-200 rounded-3xl shadow-3xl overflow-hidden border border-base-300 max-w-2xl mx-auto lg:mx-0 w-full flex-1">
        <div className="bg-secondary p-8 text-center">
          <h2 className="text-2xl font-bold text-secondary-content">
            Configurar Treino
          </h2>
          <p className="text-blue-100 text-sm mt-2 opacity-90">
            Personalize sua sessão de estudo
          </p>
        </div>

        <div className="p-8 space-y-8">
          {/* Category Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-base-content mb-4 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-fll-red" />
              Área de Avaliação
            </label>
            <div className="grid grid-cols-1 gap-3">
              {Object.values(Category).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-4 rounded-xl text-left text-sm font-bold transition-all duration-200 border flex items-center justify-between group ${
                    category === cat
                      ? "bg-secondary/50 border-secondary text-secondary-content shadow-sm"
                      : "bg-base-300 border-base-200 text-base-content/50 hover:bg-base-100 hover:border-base-300"
                  }`}
                >
                  {cat}
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      category === cat ? "border-secondary" : "border-base-200"
                    }`}
                  >
                    {category === cat && (
                      <div className="w-2 h-2 bg-secondary rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-secondary mb-4 uppercase tracking-wider">
              <List className="w-4 h-4 text-secondary" />
              Quantidade de Perguntas
            </label>
            <div className="bg-base-200 p-4">
              <input
                type="range"
                min="1"
                max="20"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer accent-fll-secondary mb-4"
              />
              <div className="flex justify-between text-xs text-base-content/50 font-semibold uppercase">
                <span>1 pergunta</span>
                <span className="text-fll-blue text-base font-bold">
                  {count}
                </span>
                <span>20 perguntas</span>
              </div>
            </div>
          </div>

          {/* Timer Setting */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-secondary mb-4 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-secondary" />
              Tempo por Pergunta
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 60, 90, 120].map((time) => (
                <button
                  key={time}
                  onClick={() => setTimePerCard(time)}
                  className={`py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                    timePerCard === time
                      ? "bg-base-100 border-secondary text-secondary shadow-sm"
                      : "bg-base-200 border-transparent text-base-content/50 hover:bg-base-100"
                  }`}
                >
                  {time}s
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full mt-6 bg-primary text-primary-content font-bold py-4 rounded-2xl shadow-lg shadow-red-500/20 transform transition hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 text-md"
          >
            <Play className="w-6 h-6 fill-current" />
            INICIAR TREINO
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
