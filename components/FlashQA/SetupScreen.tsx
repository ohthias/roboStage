import React, { useState } from "react";
import { Category, GameSettings } from "@/types/FlashQATypes";
import {
  Play,
  BookOpen,
  Clock,
  List,
  RotateCw,
  Sparkles,
  Timer,
  Target,
} from "lucide-react";
import Header from "../UI/Header";
import Breadcrumbs from "../UI/Breadcrumbs";

interface SetupScreenProps {
  onStart: (settings: GameSettings) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [category, setCategory] = useState<Category>(Category.ALL);
  const [count, setCount] = useState<number>(5);
  const [timePerCard, setTimePerCard] = useState<number>(60);
  const [demoFlipped, setDemoFlipped] = useState<boolean>(false);

  const handleStart = () => {
    onStart({ category, count, timePerCard });
  };

  const totalMinutes = Math.round((count * timePerCard) / 60);
  const totalLabel =
    totalMinutes < 1 ? `${count * timePerCard}s` : `~${totalMinutes} min`;

  return (
    <div className="flex flex-col gap-4 lg:gap-6 max-w-6xl mx-auto">
      <Breadcrumbs start="fll" />
      <Header
        type="Desafio"
        name="RECALL"
        highlight="Flashcards FLL"
        description="Treine sua equipe para responder perguntas sobre a competição. Escolha o tema, a quantidade de perguntas e o tempo por pergunta."
      />  

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Demo card - shows the flip mechanic */}
        <div className="w-full lg:w-1/3">
          <div className="bg-base-200 rounded-2xl p-6 border border-base-300 shadow-sm h-full flex flex-col">
            <label className="flex items-center gap-2 text-sm font-bold text-base-content mb-4">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <RotateCw className="w-4 h-4 text-secondary" />
              </div>
              Assim é um card
            </label>

            <button
              onClick={() => setDemoFlipped((v) => !v)}
              className="relative flex-1 min-h-[160px] w-full cursor-pointer [perspective:1200px]"
              aria-label="Virar card de exemplo"
            >
              <div
                className="relative w-full h-full min-h-[160px] transition-transform duration-500 [transform-style:preserve-3d]"
                style={{
                  transform: demoFlipped
                    ? "rotateY(180deg)"
                    : "rotateY(0deg)",
                }}
              >
                {/* Front */}
                <div className="absolute inset-0 rounded-xl bg-base-100 border-2 border-secondary/30 flex flex-col items-center justify-center p-4 [backface-visibility:hidden]">
                  <span className="badge badge-secondary badge-outline badge-sm mb-3">
                    Pergunta
                  </span>
                  <p className="text-sm font-semibold text-base-content text-center">
                    Qual é o seu diferencial competitivo?
                  </p>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 rounded-xl bg-secondary/10 border-2 border-secondary flex flex-col items-center justify-center p-4 [backface-visibility:hidden]"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <span className="badge badge-secondary badge-sm mb-3">
                    Dica
                  </span>
                  <p className="text-xs text-base-content/70 text-center">
                    Clique de novo para voltar para a pergunta. Aqui você tem uma dica de como responder, mas não é a resposta completa. Use o tempo para pensar e responder de cabeça.
                  </p>
                </div>
              </div>
            </button>

            <p className="text-xs text-center text-base-content/50 mt-3">
              Toque no card para virar
            </p>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="w-full lg:w-2/3 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-2 bg-base-200 rounded-2xl p-6 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
            <label className="flex items-center gap-2 text-sm font-bold text-base-content mb-1">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-secondary" />
              </div>
              Área de Avaliação
            </label>
            <p className="text-xs text-base-content/50 mb-4 ml-10">
              As perguntas virão só desse tema
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(Category).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2 curser-pointer ${
                    category === cat
                      ? "bg-secondary text-secondary-content border-secondary shadow-md scale-105"
                      : "bg-base-100 text-base-content/60 border-base-300 hover:bg-base-200 cursor-pointer hover:text-base-content hover:border-secondary hover:shadow-md hover:-translate-y-1"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Summary / CTA Card */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20 flex flex-col justify-between h-full relative overflow-hidden row-span-2">
            <div>
              <p className="text-xs font-bold text-base-content/50 uppercase mb-3 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Seu desafio
              </p>
              <p className="text-sm text-base-content/80 leading-relaxed">
                <span className="font-black text-base-content text-lg">
                  {count}
                </span>{" "}
                perguntas de{" "}
                <span className="font-bold text-base-content">
                  {category}
                </span>
                , com{" "}
                <span className="font-black text-base-content text-lg">
                  {timePerCard}s
                </span>{" "}
                cada uma.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-base-300 flex items-center gap-2 text-base-content/60">
              <Timer className="w-3.5 h-3.5" />
              <p className="text-xs font-semibold">
                Duração estimada: {totalLabel}
              </p>
            </div>
            <div className="absolute -top-5 -right-5 w-12 h-12 rounded-full bg-primary/20 blur-xl" />
            <div className="absolute -bottom-5 -left-5 w-16 h-16 rounded-full bg-secondary/20 blur-xl" />
            <button
              onClick={handleStart}
              className="btn btn-secondary w-full mt-6 flex items-center justify-center gap-2"
            >
              <Play size={16} />
              <p>Iniciar desafio</p>
            </button>
          </div>

          {/* Question Count */}
          <div className="bg-base-200 rounded-2xl p-6 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
            <label className="flex items-center gap-2 text-sm font-bold text-base-content mb-1">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <List className="w-4 h-4 text-secondary" />
              </div>
              Quantidade
            </label>
            <p className="text-xs text-base-content/50 mb-4 ml-10">
              Quantos cards você vai enfrentar
            </p>
            <div className="space-y-3">
              <input
                type="range"
                min="1"
                max="20"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="range range-secondary w-full"
              />
              <div className="flex justify-between text-xs font-semibold text-base-content/50">
                <span>1</span>
                <span>10</span>
                <span>20</span>
              </div>
            </div>
          </div>

          {/* Timer Setting */}
          <div className="bg-base-200 rounded-2xl p-6 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
            <label className="flex items-center gap-2 text-sm font-bold text-base-content mb-1">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-secondary" />
              </div>
              Tempo por card
            </label>
            <p className="text-xs text-base-content/50 mb-4 ml-10">
              Quanto tempo pra responder cada uma
            </p>
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