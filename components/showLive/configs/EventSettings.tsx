"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/app/context/ToastContext";

export default function EventSettings({ eventId }: { eventId: number }) {
  const defaultSettings = {
    allow_volunteers_edit: false,
    show_only_current_round: false,
    pre_round_inspection: false,
    enable_playoffs: false,
    auto_semifinals: false,
    show_brackets: false,
    show_scores_after_round: false,
    highlight_winner: false,
    advanced_view: false,
    show_timer: false,
  };

  const [settings, setSettings] = useState(defaultSettings);
  const { addToast } = useToast();

  // Carregar configs
  useEffect(() => {
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from("event_settings")
        .select("*")
        .eq("id_evento", Number(eventId))
        .maybeSingle();

      if (data) {
        setSettings({
          allow_volunteers_edit: data.allow_volunteers_edit,
          show_only_current_round: data.show_only_current_round,
          pre_round_inspection: data.pre_round_inspection,
          enable_playoffs: data.enable_playoffs,
          auto_semifinals: data.auto_semifinals,
          show_brackets: data.show_brackets,
          show_scores_after_round: data.show_scores_after_round,
          highlight_winner: data.highlight_winner,
          advanced_view: data.advanced_view,
          show_timer: data.show_timer,
        });
      } else if (error && error.code !== "PGRST116") {
        console.error(error);
      }
    };

    loadSettings();
  }, [eventId]);

  // Atualizar toggle (agora só faz upsert)
  const handleChange = async (key: keyof typeof settings) => {
    if (key === "auto_semifinals") {
      const { count, error: countError } = await supabase
        .from("team")
        .select("*", { count: "exact", head: true })
        .eq("id_event", Number(eventId));

      if (countError) {
        console.error("Erro ao contar equipes:", countError);
        addToast("Erro ao verificar equipes do evento", "error");
        return;
      }

      if ((count || 0) <= 4) {
        addToast(
          "Não é possível ativar semifinais automáticas: menos de 5 equipes.",
          "warning"
        );
        return; // não altera
      }
    }

    // Atualiza o toggle normalmente
    addToast("Salvando configuração...", "info");
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    const { error } = await supabase.from("event_settings").upsert({
      id_evento: Number(eventId),
      ...newSettings,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(error);
      addToast("Erro ao salvar configuração!", "error");
    } else {
      addToast("Configuração salva com sucesso!", "success");
    }
  };

  return (
    <section>
      <div className="divider">Outras configurações</div>
      <div className="w-full max-w-full space-y-6">
        {/* Voluntários */}
        <fieldset className="fieldset bg-base-100 border border-base-300 rounded-box p-4">
          <legend className="fieldset-legend font-semibold text-lg">
            Voluntários
          </legend>

          <label className="label flex items-center mb-3 break-words">
            <input
              type="checkbox"
              className="toggle mb-1"
              checked={settings.allow_volunteers_edit}
              onChange={() => handleChange("allow_volunteers_edit")}
            />
            Permitir que voluntários editem pontuações após a confirmação do
            administrador do evento.
          </label>

          <label className="label flex items-center mb-3 break-words">
            <input
              type="checkbox"
              className="toggle mb-1"
              checked={settings.show_only_current_round}
              onChange={() => handleChange("show_only_current_round")}
            />
            Exibir apenas a rodada atual para os voluntários. Caso desativado,
            todas as rodadas serão visíveis.
          </label>

          <label className="label flex items-center mb-3 break-words">
            <input
              type="checkbox"
              className="toggle mb-1"
              checked={settings.pre_round_inspection}
              onChange={() => handleChange("pre_round_inspection")}
            />
            Ativar inspeção pré-rodada das equipes, permitindo que voluntários
            verifiquem detalhes e requisitos antes da liberação.
          </label>
        </fieldset>

        {/* Semifinais & Finais */}
        <fieldset className="fieldset bg-base-100 border border-base-300 rounded-box p-4">
          <legend className="fieldset-legend font-semibold text-lg">
            Semifinais & Finais
          </legend>

          <label className="label flex items-center mb-3 break-words">
            <input
              type="checkbox"
              className="toggle mb-1"
              checked={settings.enable_playoffs}
              onChange={() => handleChange("enable_playoffs")}
            />
            Ativar rodadas específicas para semifinais e finais.
          </label>

          <label className="label flex items-center mb-3 break-words">
            <input
              type="checkbox"
              className="toggle mb-1"
              checked={settings.auto_semifinals}
              onChange={() => handleChange("auto_semifinals")}
            />
            Ativar semifinais automaticamente para eventos com mais de 4
            equipes.
          </label>

          <label className="label flex items-center mb-3 break-words">
            <input
              type="checkbox"
              className="toggle mb-1"
              checked={settings.show_brackets}
              onChange={() => handleChange("show_brackets")}
            />
            Exibir brackets no estilo mata-mata.
          </label>
        </fieldset>

        {/* Visualização */}
        <fieldset className="fieldset bg-base-100 border border-base-300 rounded-box p-4">
          <legend className="fieldset-legend font-semibold text-lg">
            Visualização
          </legend>

          <label className="label flex items-center mb-3 break-words">
            <input
              type="checkbox"
              className="toggle mb-1"
              checked={settings.show_scores_after_round}
              onChange={() => handleChange("show_scores_after_round")}
            />
            Mostrar pontuações apenas após todas as equipes serem avaliadas na
            rodada.
          </label>

          <label className="label flex items-center mb-3 break-words">
            <input
              type="checkbox"
              className="toggle mb-1"
              checked={settings.highlight_winner}
              onChange={() => handleChange("highlight_winner")}
            />
            Destacar a equipe vencedora no final do evento.
          </label>

          <label className="label flex items-center mb-3 break-words">
            <input
              type="checkbox"
              className="toggle mb-1"
              checked={settings.advanced_view}
              onChange={() => handleChange("advanced_view")}
            />
            Ativar visualização avançada: layout otimizado para telas grandes,
            exibindo logo, ranqueamento e alertas.
          </label>
        </fieldset>
      </div>
    </section>
  );
}
