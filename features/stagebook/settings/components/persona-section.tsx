"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, Loader2, Lock, Mail } from "lucide-react";
import { useToast } from "@/components/providers/ToastContext";
import { updatePersonaType } from "@/features/stagebook/actions/account";
import { PERSONA_META, PERSONA_TYPES, personaCanCreateTeam, type PersonaType } from "@/features/stagebook/lib/persona";
import { PERSONA_LOCK_HOURS, PERSONA_SUPPORT_EMAIL, formatLockCountdown } from "@/features/stagebook/lib/persona-lock";
import { FieldRow, SettingsGroup } from "./settings-card";

/**
 * Tipo de conta: os quatro perfis do RoboStage. Livre nas primeiras 48 h;
 * depois fica travado e só a equipe troca. O servidor valida as duas regras.
 */
export function PersonaSection({
  current,
  locked,
  msLeft,
}: {
  current: PersonaType | null;
  locked: boolean;
  msLeft: number;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [selected, setSelected] = useState<PersonaType | null>(current);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Sem tipo ainda (onboarding pendente) a escolha continua livre.
  const frozen = locked && current !== null;
  const dirty = selected !== null && selected !== current;

  function save() {
    if (!selected || frozen) return;
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

  const subject = encodeURIComponent("Trocar tipo de conta no RoboStage");
  const body = encodeURIComponent(
    `Olá! Quero trocar meu tipo de conta de "${current ? PERSONA_META[current].label : "—"}" para: \n\nMotivo: `,
  );

  return (
    <SettingsGroup
      title="Tipo de conta"
      description="Seu perfil no universo de robótica. Define a sua tela inicial e se você pode criar equipes."
    >
      <FieldRow
        title="Perfil"
        badge={
          frozen ? (
            <span className="badge badge-ghost badge-sm gap-1">
              <Lock size={11} /> Travado
            </span>
          ) : current ? (
            <span className="badge badge-warning badge-soft badge-sm gap-1">
              <Clock size={11} /> Trava em {formatLockCountdown(msLeft)}
            </span>
          ) : null
        }
        description={
          frozen
            ? `A troca é livre só nas primeiras ${PERSONA_LOCK_HOURS} horas da conta. Para mudar agora, fale com a equipe.`
            : `Você pode trocar à vontade nas primeiras ${PERSONA_LOCK_HOURS} horas. Depois disso, só pela equipe do RoboStage.`
        }
      >
        <div role="radiogroup" aria-label="Tipo de conta" className="grid gap-2.5 sm:grid-cols-2">
          {PERSONA_TYPES.map((persona) => {
            const active = selected === persona;
            const disabled = frozen && persona !== current;
            return (
              <label
                key={persona}
                className={`flex items-start gap-3 rounded-box border p-3.5 transition-colors ${
                  active ? "border-primary bg-primary/5" : "border-base-300"
                } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-primary/40"}`}
              >
                <input
                  type="radio"
                  name="persona"
                  className="radio radio-primary radio-sm mt-0.5"
                  checked={active}
                  disabled={disabled}
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
          <div role="alert" className="alert alert-error alert-soft mt-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
          {frozen ? (
            <a
              className="btn btn-outline btn-sm gap-2"
              href={`mailto:${PERSONA_SUPPORT_EMAIL}?subject=${subject}&body=${body}`}
            >
              <Mail size={14} /> Pedir troca à equipe
            </a>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={!dirty || isPending}>
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Salvar tipo de conta
            </button>
          )}
        </div>
      </FieldRow>
    </SettingsGroup>
  );
}
