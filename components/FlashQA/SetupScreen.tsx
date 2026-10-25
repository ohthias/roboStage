import React, { useState } from "react";
import { Category, FlashQAMode, GameSettings } from "@/types/FlashQATypes";
import { ArrowRight, BookOpen, Clock, List, RotateCw, Timer, LucideIcon } from "lucide-react";
import Header from "../UI/Header";

interface SetupScreenProps {
  mode: FlashQAMode;
  onStart: (settings: GameSettings) => void;
}

const TIME_OPTIONS = [30, 60, 90, 120];

/** Cabeçalho padrão dos blocos: ícone em canto cortado + número mono + rótulo. */
function BlockHead({
  icon: Icon,
  number,
  tag,
  title,
  hint,
}: {
  icon: LucideIcon;
  number: string;
  tag: string;
  title: string;
  hint: string;
}) {
  return (
    <>
      <div className="relative flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-tl-xl rounded-br-xl bg-primary/10 text-primary">
          <Icon size={19} strokeWidth={1.8} />
        </div>
        <span className="font-mono text-xs text-base-content/35">/{number}</span>
      </div>
      <p className="relative mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
        {tag}
      </p>
      <h3 className="relative mt-1 text-lg font-bold tracking-tight">{title}</h3>
      <p className="relative mt-1 text-sm text-base-content/60">{hint}</p>
    </>
  );
}

const BLOCK =
  "relative overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6";

const SetupScreen: React.FC<SetupScreenProps> = ({ mode, onStart }) => {
  const categories = mode.categories.length ? mode.categories : [Category.ALL];
  const [category, setCategory] = useState<Category>(mode.defaultSettings.category);
  const [count, setCount] = useState<number>(Math.min(mode.defaultSettings.count, 20));
  const [timePerCard, setTimePerCard] = useState<number>(mode.defaultSettings.timePerCard);
  const [demoFlipped, setDemoFlipped] = useState(false);

  const available = mode.questions.filter(
    (q) => category === Category.ALL || q.category === category,
  ).length;
  const effectiveCount = Math.min(count, available);

  const totalSeconds = effectiveCount * timePerCard;
  const totalLabel =
    totalSeconds < 60 ? `${totalSeconds}s` : `~${Math.round(totalSeconds / 60)} min`;

  return (
    <div className="space-y-8">
      <Header
        type="Recall"
        name="RECALL"
        highlight={mode.highlight ?? `Flashcards ${mode.name}`}
        description={mode.description ?? ""}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* ===== TEMA ===== */}
        <section className={`${BLOCK} lg:col-span-2`}>
          <BlockHead
            icon={BookOpen}
            number="01"
            tag="Tema"
            title="Área de avaliação"
            hint="As perguntas virão só desse tema."
          />
          <div className="relative mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {categories.map((cat) => {
              const active = category === cat;
              const total =
                cat === Category.ALL
                  ? mode.questions.length
                  : mode.questions.filter((q) => q.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  aria-pressed={active}
                  className={`flex items-center justify-between gap-2 rounded-tl-lg rounded-br-lg border px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "border-primary bg-primary text-primary-content"
                      : "border-base-300 bg-base-100 text-base-content/70 hover:border-primary/40 hover:bg-primary/[0.03] hover:text-base-content"
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  <span
                    className={`font-mono text-[10px] ${active ? "text-primary-content/70" : "text-base-content/35"}`}
                  >
                    {total}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ===== RESUMO / CTA ===== */}
        <section className={`${BLOCK} flex flex-col lg:row-span-2`}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full border border-base-300"
          />
          <p className="relative text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            Seu desafio
          </p>
          <p className="relative mt-3 text-sm leading-relaxed text-base-content/70">
            <span className="font-mono text-3xl font-bold text-base-content">{effectiveCount}</span>{" "}
            perguntas de <span className="font-bold text-base-content">{category}</span>, com{" "}
            <span className="font-mono text-xl font-bold text-base-content">{timePerCard}s</span>{" "}
            cada.
          </p>
          {available < count && (
            <p className="relative mt-2 text-xs text-warning">
              Esse tema tem só {available} pergunta(s).
            </p>
          )}

          {/* card de exemplo */}
          <button
            type="button"
            onClick={() => setDemoFlipped((v) => !v)}
            className="relative mt-6 min-h-[150px] w-full flex-1 cursor-pointer [perspective:1200px]"
            aria-label="Virar card de exemplo"
          >
            <div
              className="relative h-full min-h-[150px] w-full transition-transform duration-500 [transform-style:preserve-3d]"
              style={{ transform: demoFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
            >
              <div className="absolute inset-0 flex flex-col justify-between rounded-tl-xl rounded-br-xl border border-base-300 bg-base-200/60 p-4 text-left [backface-visibility:hidden]">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-base-content/50">
                  <RotateCw size={11} /> Exemplo · pergunta
                </span>
                <p className="text-sm font-semibold">{mode.sampleQuestion ?? "Toque para virar."}</p>
              </div>
              <div
                className="absolute inset-0 flex flex-col justify-between rounded-tl-xl rounded-br-xl bg-neutral p-4 text-left text-neutral-content [backface-visibility:hidden]"
                style={{ transform: "rotateY(180deg)" }}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-60">
                  Exemplo · dica
                </span>
                <p className="text-xs leading-relaxed opacity-80">
                  No verso fica uma dica, não a resposta. Use o tempo para pensar e responder em voz alta.
                </p>
              </div>
            </div>
          </button>

          <div className="relative mt-5 flex items-center gap-2 border-t border-base-300 pt-4 text-xs font-semibold text-base-content/60">
            <Timer size={14} />
            Duração estimada: {totalLabel}
          </div>

          <button
            type="button"
            onClick={() => onStart({ category, count: effectiveCount, timePerCard })}
            disabled={effectiveCount === 0}
            className="group btn btn-primary relative mt-4 w-full justify-between rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none"
          >
            Iniciar desafio
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </section>

        {/* ===== QUANTIDADE ===== */}
        <section className={BLOCK}>
          <BlockHead
            icon={List}
            number="02"
            tag="Quantidade"
            title={`${count} cards`}
            hint="Quantos cards você vai enfrentar."
          />
          <input
            type="range"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="range range-primary range-sm relative mt-5 w-full"
          />
          <div className="mt-2 flex justify-between font-mono text-[10px] text-base-content/40">
            <span>1</span>
            <span>10</span>
            <span>20</span>
          </div>
        </section>

        {/* ===== TEMPO ===== */}
        <section className={BLOCK}>
          <BlockHead
            icon={Clock}
            number="03"
            tag="Tempo"
            title="Tempo por card"
            hint="Quanto tempo para responder cada uma."
          />
          <div className="relative mt-5 grid grid-cols-4 gap-2">
            {TIME_OPTIONS.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setTimePerCard(time)}
                aria-pressed={timePerCard === time}
                className={`rounded-tl-lg rounded-br-lg border py-2 font-mono text-sm font-bold transition-all ${
                  timePerCard === time
                    ? "border-primary bg-primary text-primary-content"
                    : "border-base-300 text-base-content/60 hover:border-primary/40 hover:text-base-content"
                }`}
              >
                {time}s
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SetupScreen;
