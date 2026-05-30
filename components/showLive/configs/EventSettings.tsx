"use client";
import { useEffect, useState } from "react";
import { Shield, Trophy, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/app/context/ToastContext";

const supabase = createClient();

interface Props { eventId: number }

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

const minimumTeamsBySetting = { enable_playoffs: 4, auto_semifinals: 6, show_brackets: 4 } as const;

export default function EventSettings({ eventId }: Props) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(defaultSettings);
  const [teamCount, setTeamCount] = useState(0);

  useEffect(() => {
    const loadSettings = async () => {
      const [settingsResult, teamsResult] = await Promise.all([
        supabase.from("event_settings").select("*").eq("id_evento", eventId).maybeSingle(),
        supabase.from("event_teams").select("id", { count: "exact", head: true }).eq("id_evento", eventId),
      ]);
      const { data } = settingsResult;
      const { count } = teamsResult;
      setTeamCount(count ?? 0);
      if (data) setSettings({ ...defaultSettings, ...data });
      setLoading(false);
    };
    loadSettings();
  }, [eventId]);

  const handleToggle = async (key: keyof typeof settings) => {
    const requiredTeams = minimumTeamsBySetting[key as keyof typeof minimumTeamsBySetting] ?? 0;
    if (requiredTeams > 0 && teamCount < requiredTeams) {
      addToast(`Esta configuração exige no mínimo ${requiredTeams} equipes.`, "error");
      return;
    }
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    const { error } = await supabase.from("event_settings").upsert({ id_evento: eventId, ...updated, updated_at: new Date().toISOString() });
    if (error) addToast("Erro ao salvar configuração.", "error");
    else addToast("Configuração atualizada.", "success");
  };

  if (loading) return (
    <div className="flex justify-center py-8">
      <span className="loading loading-spinner loading-md text-primary" />
    </div>
  );

  const sections = [
    { title: "Voluntários", icon: Users, items: [{ key: "show_only_current_round", label: "Mostrar apenas rodada atual" }] },
    { title: "Semifinais e finais", icon: Trophy, items: [
      { key: "enable_playoffs", label: "Ativar playoffs" },
      { key: "auto_semifinals", label: "Semifinais automáticas" },
      { key: "show_brackets", label: "Mostrar brackets" },
    ] },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Shield size={18} className="text-primary" />
        <h2 className="text-lg font-semibold">Configurações avançadas</h2>
      </div>
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <div key={section.title} className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Icon size={18} className="text-primary" />
              <h3 className="font-semibold">{section.title}</h3>
            </div>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-xl bg-base-200 px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-sm">{item.label}</span>
                    {section.title === "Semifinais e finais" && minimumTeamsBySetting[item.key as keyof typeof minimumTeamsBySetting] ? (
                      <span className="text-xs text-base-content/60">Requer no mínimo {minimumTeamsBySetting[item.key as keyof typeof minimumTeamsBySetting]} equipes.</span>
                    ) : null}
                  </div>
                  <input type="checkbox" className="toggle toggle-primary"
                    checked={settings[item.key as keyof typeof settings]}
                    disabled={section.title === "Semifinais e finais" && teamCount < (minimumTeamsBySetting[item.key as keyof typeof minimumTeamsBySetting] ?? 0)}
                    onChange={() => handleToggle(item.key as keyof typeof settings)}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
