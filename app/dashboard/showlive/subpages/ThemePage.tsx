"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/app/context/UserContext";
import { toast } from "sonner";

interface StyleLabTheme {
  id_theme: string;
  id_user: string;
  name?: string;
  background_url: string | null;
  colors: string[];
  created_at: string;
}

export default function ThemeSection({ eventId }: { eventId: string }) {
  const { session } = useUser();
  const [themes, setThemes] = useState<StyleLabTheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchThemes(session.user.id);
    }
  }, [session]);

  const fetchThemes = async (userId: string) => {
    const { data: themesData, error } = await supabase
      .from("styleLab")
      .select("*")
      .eq("id_user", userId)
      .order("created_at", { ascending: false });

    if (error || !themesData) return;
    setThemes(themesData);
  };

  useEffect(() => {
    const fetchSelectedTheme = async () => {
      const { data, error } = await supabase
        .from("typeEvent")
        .select("config")
        .eq("id", parseInt(eventId))
        .single();

      if (error) {
        console.error("Erro ao buscar tema salvo:", error.message);
        return;
      }

      if (data?.config?.preset?.url_background) {
        setSelectedTheme(data.config.preset.url_background);
      }
    };

    fetchSelectedTheme();
  }, []);

  const handleSelectTheme = async (theme: StyleLabTheme) => {
    setLoading(true);

    const { data: eventData, error: fetchError } = await supabase
      .from("typeEvent")
      .select("config")
      .eq("id", parseInt(eventId))
      .single();

    if (fetchError || !eventData) {
      console.error(fetchError);
      toast.error("Erro ao carregar configurações do evento.");
      setLoading(false);
      return;
    }

    const currentConfigs = eventData.config ?? {};

    const updatedConfigs = {
      ...currentConfigs,
      preset: {
        url_background: theme.background_url,
        colors: theme.colors,
      },
    };

    const { error: updateError } = await supabase
      .from("typeEvent")
      .update({ config: updatedConfigs })
      .eq("id", parseInt(eventId));

    if (updateError) {
      console.error(updateError);
      toast.error("Erro ao salvar tema.");
    } else {
      setSelectedThemeId(theme.id_theme);
      toast.success(`Tema "${theme.name || theme.id_theme}" selecionado!`);
    }

    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {themes.map((theme, index) => (
        <div
          key={theme.id_theme || index}
          onClick={() => handleSelectTheme(theme)}
          className={`card w-72 h-52 bg-base-100 shadow-lg border relative overflow-hidden flex flex-col justify-end cursor-pointer transition ${
            selectedThemeId === theme.id_theme
              ? "ring-4 ring-primary scale-105"
              : "hover:scale-105"
          } ${selectedTheme === theme.background_url
            ? "ring-4 ring-primary scale-105"
            : "border-transparent"
          }`}
          style={{
            backgroundImage: `url(${
              theme.background_url ||
              "/images/showLive/banners/banner_default.webp"
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* overlay escura */}
          <div className="absolute inset-0 bg-black/35 pointer-events-none" />

          {/* conteúdo */}
          <div className="relative z-10 p-4">
            <h3 className="font-bold text-lg text-white drop-shadow">
              {theme.name || `Tema #${theme.id_theme}`}
            </h3>
            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-2">
                {theme.colors.map((c, i) => (
                  <div
                    key={`${theme.id_theme}-${i}`}
                    className="w-6 h-6 rounded border border-base-300"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
      {loading && <p className="col-span-full text-center">Salvando tema...</p>}
    </div>
  );
}
