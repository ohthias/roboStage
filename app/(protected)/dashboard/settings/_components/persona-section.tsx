"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shapes } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { updatePersonaType } from "@/utils/stagebook/actions/account";
import { PERSONA_META, PERSONA_TYPES, personaCanCreateTeam, type PersonaType } from "@/utils/stagebook/persona";
import { SettingsCard } from "./settings-card";

/** Tipo de conta: os quatro perfis do RoboStage. Valida regras de negócio no servidor. */
export function PersonaSection({ current }: { current: PersonaType | null }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [selected, setSelected] = useState<PersonaType | null>(current);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dirty = selected !== null && selected !== current;

  function save() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const result = await updatePersonaType(selected);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      addToast("Tipo de conta atualizado.", "success");
      router.refresh();
    });
  }

  return (
    <SettingsCard icon={Shapes} title="Tipo de conta" description="Seu perfil no universo de robótica. Define, por exemplo, se você pode criar equipes.">
      <div className="space-y-4 p-5">
        <div role="radiogroup" aria-label="Tipo de conta" className="grid gap-3 sm:grid-cols-2">
          {PERSONA_TYPES.map((persona) => {
            const active = selected === persona;
            return (
              <label
                key={persona}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                  active ? "border-primary bg-primary/5" : "border-base-300 hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="persona"
                  className="radio radio-primary radio-sm mt-0.5"
                  checked={active}
                  onChange={() => {
                    setSelected(persona);
                    setError(null);
                  }}
                />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    {PERSONA_META[persona].label}
                    {persona === current && <span className="badge badge-primary badge-soft badge-xs">Atual</span>}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-base-content/55">{PERSONA_META[persona].description}</span>
                  <span className="mt-1.5 block text-[11px] text-base-content/40">
                    {personaCanCreateTeam(persona) ? "Pode criar equipes" : "Não cria equipes"}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        {error && (
          <div role="alert" className="alert alert-error alert-soft py-2 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={!dirty || isPending}>
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Salvar tipo de conta
          </button>
        </div>
      </div>
    </SettingsCard>
  );
}
