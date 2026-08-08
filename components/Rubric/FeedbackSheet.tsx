"use client";

import { FEEDBACK_SECTIONS, AWARD_OPTIONS } from "@/app/(public)/[competicao]/(fll)/rubric/rubric";

interface FeedbackSheetProps {
  feedback: Record<string, { good: string; reflect: string }>;
  onChange: (sectionId: string, field: "good" | "reflect", value: string) => void;
  awards: Record<string, boolean>;
  onToggleAward: (awardId: string) => void;
}

const sectionAccent: Record<string, string> = {
  "core-values": "bg-[#f4d2c7]",
  projeto: "bg-[#cfe3f5]",
  robo: "bg-[#d3e8d3]",
};

export default function FeedbackSheet({
  feedback,
  onChange,
  awards,
  onToggleAward,
}: FeedbackSheetProps) {
  return (
    <div className="paper-sheet relative rounded-box bg-base-200/50 border border-base-content/15 p-4 sm:p-6 mb-6">
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-primary">Feedback da Sessão de Avaliação</h2>
        <p className="text-sm text-base-content/65 mt-1.5 max-w-2xl">
          Registre feedback escrito após a apresentação do Projeto de Inovação e a explicação do
          Design do Robô. Os Core Values da <em>FIRST</em>® são a lente através da qual os juízes
          observam as apresentações e avaliam o progresso da equipe.
        </p>
      </div>

      <div className="hidden sm:grid grid-cols-2 gap-3 mb-2">
        <span className="font-mono-tech text-[11px] uppercase tracking-wide text-base-content/50 px-1">
          Muito bom...
        </span>
        <span className="font-mono-tech text-[11px] uppercase tracking-wide text-base-content/50 px-1">
          Reflitam sobre...
        </span>
      </div>

      <div className="space-y-4 mb-6">
        {FEEDBACK_SECTIONS.map((section) => (
          <div key={section.id} className="rounded-box overflow-hidden border border-base-content/15">
            <div className={`${sectionAccent[section.id]} px-3 py-2`}>
              <span className="font-display font-semibold text-sm">{section.title}</span>
              <span className="text-[13px] text-base-content/70"> — {section.question}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[var(--ink)]/10">
              <textarea
                value={feedback[section.id]?.good ?? ""}
                onChange={(e) => onChange(section.id, "good", e.target.value)}
                rows={4}
                placeholder="Muito bom..."
                className="textarea rounded-none w-full text-sm bg-base-100 text-base-content border-0 focus:bg-base-200 resize-none transition-colors duration-200 outiline-none focus:outline-none"
              />
              <textarea
                value={feedback[section.id]?.reflect ?? ""}
                onChange={(e) => onChange(section.id, "reflect", e.target.value)}
                rows={4}
                placeholder="Reflitam sobre..."
                className="textarea rounded-none w-full text-sm bg-base-300 text-base-content border-0 focus:bg-base-100 resize-none transition-colors duration-200 outiline-none focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs text-base-content/60 mb-2 max-w-2xl">
          Se a equipe for candidata a um destes prêmios, assinale a caixa apropriada. Consulte o
          organizador para saber quais prêmios opcionais serão utilizados no seu evento.
        </p>
        <div className="border border-base-content/15 rounded-box divide-y divide-base-content/10 overflow-hidden">
          {AWARD_OPTIONS.map((award) => (
            <label
              key={award.id}
              className="flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-black/[0.03]"
            >
              <input
                type="checkbox"
                checked={!!awards[award.id]}
                onChange={() => onToggleAward(award.id)}
                className="checkbox checkbox-sm mt-0.5 bg-base-100 text-primary border-base-content/40"
              />
              <span className="text-sm">
                <span className="font-semibold">{award.name}</span>{" "}
                <span className="text-base-content/70">{award.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
