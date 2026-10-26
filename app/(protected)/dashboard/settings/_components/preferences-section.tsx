"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LayoutPanelLeft, Lock, PanelLeftClose, PanelLeftOpen, Users } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { updatePreferences } from "@/utils/stagebook/actions/preferences";
import type { UserPreferences } from "@/types/preferences";
import { SettingRow, SettingsCard } from "./settings-card";

/** Interface e privacidade. Cada mudança salva na hora (otimista, com desfazer se o servidor recusar). */
export function PreferencesSection({ initial }: { initial: UserPreferences }) {
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

  return (
    <div className="space-y-6">
      <SettingsCard icon={LayoutPanelLeft} title="Interface" description="Posição e comportamento dos menus e painéis.">
        <div className="divide-y divide-base-300">
          <SettingRow
            title="Posição do menu lateral"
            description="Como o menu de navegação aparece ao abrir o RoboStage no computador."
          >
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
          </SettingRow>

          <SettingRow
            title="Travar painéis e menus"
            description="Mantém menus e painéis exatamente na posição escolhida: o menu lateral deixa de expandir/recolher e painéis não podem ser movidos por engano."
          >
            <label className="flex items-center gap-2 text-xs text-base-content/60">
              {prefs.layoutLocked && <Lock size={12} />}
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={prefs.layoutLocked}
                disabled={isPending}
                aria-label="Travar painéis e menus"
                onChange={(e) =>
                  change(
                    { layoutLocked: e.target.checked },
                    e.target.checked ? "Painéis e menus travados." : "Painéis e menus destravados.",
                  )
                }
              />
            </label>
          </SettingRow>
        </div>
      </SettingsCard>

      <SettingsCard icon={Users} title="Equipes e privacidade" description="Quem pode te adicionar a equipes.">
        <SettingRow
          title="Permitir que me adicionem a equipes"
          description="Desativado, ninguém consegue te convidar — nem pelo e-mail — e convites aceitos por outro caminho são desfeitos. Equipes de que você já faz parte não são afetadas."
        >
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={prefs.allowTeamInvites}
            disabled={isPending}
            aria-label="Permitir que me adicionem a equipes"
            onChange={(e) =>
              change(
                { allowTeamInvites: e.target.checked },
                e.target.checked ? "Você pode receber convites de equipe." : "Convites de equipe bloqueados.",
              )
            }
          />
        </SettingRow>
      </SettingsCard>
    </div>
  );
}
