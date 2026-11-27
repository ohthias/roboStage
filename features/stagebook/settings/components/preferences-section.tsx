"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Lock, PanelLeftClose, PanelLeftOpen, Radio } from "lucide-react";
import { useToast } from "@/components/providers/ToastContext";
import { updatePreferences } from "@/features/stagebook/actions/preferences";
import type { UserPreferences } from "@/features/stagebook/types/preferences";
import { FieldRow, SettingsGroup, ToggleField } from "./settings-card";

/** Salva na hora (otimista, desfaz se o servidor recusar). */
function usePreferences(initial: UserPreferences) {
  const router = useRouter();
  const { addToast } = useToast();
  const [prefs, setPrefs] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function change(patch: Partial<UserPreferences>, message: string) {
    const previous = prefs;
    setPrefs({ ...prefs, ...patch });
    startTransition(async () => {
      const result = await updatePreferences(patch);
      if (!result.ok) {
        setPrefs(previous);
        addToast(result.error, "error");
        return;
      }
      addToast(message, "success");
      router.refresh();
    });
  }

  return { prefs, change, isPending };
}

export function PreferencesSection({ initial }: { initial: UserPreferences }) {
  const { prefs, change, isPending } = usePreferences(initial);

  return (
    <div className="space-y-12">
      <SettingsGroup title="Interface" description="Posição e comportamento dos menus e painéis no computador.">
        <FieldRow title="Menu lateral" description="Como o menu aparece ao abrir o RoboStage.">
          <div className="join" role="radiogroup" aria-label="Posição do menu lateral">
            <button
              type="button"
              role="radio"
              aria-checked={prefs.sidebarExpanded}
              className={`btn btn-sm join-item gap-1.5 ${prefs.sidebarExpanded ? "btn-primary" : ""}`}
              disabled={isPending}
              onClick={() => change({ sidebarExpanded: true }, "Menu lateral expandido.")}
            >
              <PanelLeftOpen size={14} /> Expandido
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={!prefs.sidebarExpanded}
              className={`btn btn-sm join-item gap-1.5 ${!prefs.sidebarExpanded ? "btn-primary" : ""}`}
              disabled={isPending}
              onClick={() => change({ sidebarExpanded: false }, "Menu lateral recolhido.")}
            >
              <PanelLeftClose size={14} /> Só ícones
            </button>
          </div>
        </FieldRow>

        <FieldRow
          title="Travar painéis e menus"
          badge={prefs.layoutLocked && <Lock size={12} className="text-base-content/50" />}
          description="O menu deixa de expandir/recolher e painéis não podem ser movidos por engano."
        >
          <ToggleField
            label="Travar"
            hint="Útil em telas compartilhadas no box da equipe."
            checked={prefs.layoutLocked}
            disabled={isPending}
            onChange={(v) => change({ layoutLocked: v }, v ? "Painéis e menus travados." : "Painéis e menus destravados.")}
          />
        </FieldRow>
      </SettingsGroup>

      <SettingsGroup title="Equipes e privacidade" description="Quem pode te adicionar a equipes.">
        <FieldRow
          title="Convites de equipe"
          description="Desativado, ninguém te convida — nem pelo e-mail. Equipes de que você já faz parte não mudam."
        >
          <ToggleField
            label="Permitir que me adicionem a equipes"
            checked={prefs.allowTeamInvites}
            disabled={isPending}
            onChange={(v) =>
              change({ allowTeamInvites: v }, v ? "Você pode receber convites de equipe." : "Convites de equipe bloqueados.")
            }
          />
        </FieldRow>
      </SettingsGroup>
    </div>
  );
}

/** Integrações: por enquanto o ShowLive (eventos e placares ao vivo). */
export function IntegrationsSection({ initial, showliveUrl }: { initial: UserPreferences; showliveUrl: string }) {
  const { prefs, change, isPending } = usePreferences(initial);
  const on = prefs.showliveEnabled;

  return (
    <SettingsGroup title="Integrações" description="Ferramentas do ecossistema RoboStage que você pode ligar na sua conta.">
      <FieldRow
        title="ShowLive"
        badge={on && <span className="badge badge-success badge-soft badge-sm">Ativo</span>}
        description="Placar ao vivo, telão, mesas de arbitragem e avaliação por rubricas para os seus eventos. Usa a mesma conta do RoboStage."
      >
        <div
          className={`flex flex-col gap-4 rounded-box border p-4 sm:flex-row sm:items-center ${
            on ? "border-primary/40 bg-primary/5" : "border-base-300"
          }`}
        >
          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
              on ? "bg-primary text-primary-content" : "bg-base-200 text-base-content/50"
            }`}
          >
            <Radio size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{on ? "ShowLive ativado" : "Ativar o ShowLive"}</p>
            <p className="mt-0.5 text-xs leading-5 text-base-content/55">
              {on
                ? "O ShowLive aparece no menu do painel. Desligar não apaga seus eventos."
                : "Adiciona o ShowLive ao menu do painel para criar e acompanhar eventos."}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {on && (
              <a href={showliveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm gap-2">
                Abrir <ExternalLink size={13} />
              </a>
            )}
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={on}
              disabled={isPending}
              aria-label="Ativar ShowLive"
              onChange={(e) =>
                change({ showliveEnabled: e.target.checked }, e.target.checked ? "ShowLive ativado." : "ShowLive desativado.")
              }
            />
          </div>
        </div>
      </FieldRow>
    </SettingsGroup>
  );
}
