"use client";

import { useEffect, useState } from "react";

import { Shield, Eye, Trophy, Users } from "lucide-react";

import { createClient } from "@/utils/supabase/client";

import { useToast } from "@/app/context/ToastContext";

const supabase = createClient();

interface Props {
  eventId: number;
}

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

export default function EventSettings({ eventId }: Props) {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase
        .from("event_settings")
        .select("*")
        .eq("id_evento", eventId)
        .maybeSingle();

      if (data) {
        setSettings({
          ...defaultSettings,

          ...data,
        });
      }

      setLoading(false);
    };

    loadSettings();
  }, [eventId]);

  const handleToggle = async (key: keyof typeof settings) => {
    const updated = {
      ...settings,

      [key]: !settings[key],
    };

    setSettings(updated);

    const { error } = await supabase.from("event_settings").upsert({
      id_evento: eventId,

      ...updated,

      updated_at: new Date().toISOString(),
    });

    if (error) {
      addToast("Erro ao salvar configuração.", "error");
    } else {
      addToast("Configuração atualizada.", "success");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-md text-primary" />
      </div>
    );
  }

  const sections = [
    {
      title: "Voluntários",

      icon: Users,

      items: [
        {
          key: "allow_volunteers_edit",

          label: "Permitir edição de pontuações",
        },

        {
          key: "show_only_current_round",

          label: "Mostrar apenas rodada atual",
        },

        {
          key: "pre_round_inspection",

          label: "Ativar inspeção pré-rodada",
        },
      ],
    },

    {
      title: "Semifinais e finais",

      icon: Trophy,

      items: [
        {
          key: "enable_playoffs",

          label: "Ativar playoffs",
        },

        {
          key: "auto_semifinals",

          label: "Semifinais automáticas",
        },

        {
          key: "show_brackets",

          label: "Mostrar brackets",
        },
      ],
    }
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
          <div
            key={section.title}
            className="rounded-2xl border border-base-300 bg-base-100 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Icon size={18} className="text-primary" />

              <h3 className="font-semibold">{section.title}</h3>
            </div>

            <div className="space-y-3">
              {section.items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-xl bg-base-200 px-4 py-3"
                >
                  <span className="text-sm">{item.label}</span>

                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={settings[item.key as keyof typeof settings]}
                    onChange={() =>
                      handleToggle(item.key as keyof typeof settings)
                    }
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
