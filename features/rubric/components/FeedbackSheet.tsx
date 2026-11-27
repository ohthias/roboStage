"use client";

import { Check } from "lucide-react";
import { cn } from "@/components/stage";
import { FEEDBACK_SECTIONS, AWARD_OPTIONS } from "@/features/rubric/lib/fll";

interface FeedbackSheetProps {
  feedback: Record<string, { good: string; reflect: string }>;
  onChange: (sectionId: string, field: "good" | "reflect", value: string) => void;
  awards: Record<string, boolean>;
  onToggleAward: (awardId: string) => void;
}

// Faixa de cor de cada frente (mesmos tons das áreas avaliadas na home da FLL).
const sectionAccent: Record<string, string> = {
  "core-values": "border-l-primary",
  projeto: "border-l-accent",
  robo: "border-l-secondary",
};

const areaCls =
  "w-full resize-none border-0 bg-base-100 px-3 py-2 text-[13px] text-base-content transition-colors placeholder:text-base-content/35 focus:bg-base-200/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/20";

export default function FeedbackSheet({ feedback, onChange, awards, onToggleAward }: FeedbackSheetProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-base-300 bg-base-100">
      <header className="border-b border-base-300 px-4 py-3 sm:px-5">
        <p className="font-mono text-[11px] font-semibold tracking-wider text-primary">FB</p>
        <h2 className="text-lg font-black tracking-tight">Feedback da Sessão de Avaliação</h2>
        <p className="mt-1 max-w-3xl text-[13px] leading-6 text-base-content/65">
          Registre feedback escrito após a apresentação do Projeto de Inovação e a explicação do Design do Robô. Os
          Core Values da <em>FIRST</em>® são a lente através da qual os juízes observam as apresentações e avaliam o
          progresso da equipe.
        </p>
      </header>

      <div className="space-y-3 p-4 sm:p-5">
        {FEEDBACK_SECTIONS.map((section) => (
          <div
            key={section.id}
            className={cn("overflow-hidden rounded-md border border-l-4 border-base-300", sectionAccent[section.id])}
          >
            <div className="border-b border-base-300 bg-base-200/50 px-3 py-2 text-[13px]">
              <span className="font-bold">{section.title}</span>
              <span className="text-base-content/65"> — {section.question}</span>
            </div>
            <div className="grid grid-cols-1 divide-y divide-base-300 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <label className="block">
                <span className="block px-3 pt-2 text-[10px] font-semibold uppercase tracking-wider text-success">
                  Muito bom...
                </span>
                <textarea
                  value={feedback[section.id]?.good ?? ""}
                  onChange={(e) => onChange(section.id, "good", e.target.value)}
                  rows={4}
                  placeholder="O que a equipe fez muito bem"
                  className={areaCls}
                />
              </label>
              <label className="block">
                <span className="block px-3 pt-2 text-[10px] font-semibold uppercase tracking-wider text-secondary">
                  Reflitam sobre...
                </span>
                <textarea
                  value={feedback[section.id]?.reflect ?? ""}
                  onChange={(e) => onChange(section.id, "reflect", e.target.value)}
                  rows={4}
                  placeholder="Onde a equipe pode evoluir"
                  className={areaCls}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-base-300 px-4 py-4 sm:px-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-base-content/50">Prêmios opcionais</p>
        <p className="mb-3 max-w-3xl text-xs text-base-content/60">
          Se a equipe for candidata a um destes prêmios, assinale a caixa apropriada. Consulte o organizador para saber
          quais prêmios opcionais serão utilizados no seu evento.
        </p>
        <div className="divide-y divide-base-300 overflow-hidden rounded-md border border-base-300">
          {AWARD_OPTIONS.map((award) => {
            const on = !!awards[award.id];
            return (
              <label
                key={award.id}
                className="flex cursor-pointer items-start gap-3 px-3 py-2.5 transition-colors hover:bg-base-content/[0.03] has-[input:focus-visible]:bg-primary/5"
              >
                <input type="checkbox" checked={on} onChange={() => onToggleAward(award.id)} className="peer sr-only" />
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 grid size-4 shrink-0 place-items-center rounded-tl-[5px] rounded-br-[5px] border",
                    on ? "border-primary bg-primary text-primary-content" : "border-base-content/35",
                  )}
                >
                  {on && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span className="text-[13px]">
                  <span className="font-semibold">{award.name}</span>{" "}
                  <span className="text-base-content/65">{award.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </section>
  );
}
