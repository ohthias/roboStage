"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/app/context/UserContext";
import { useToast } from "@/app/context/ToastContext";
import PreviewEvent from "../PreviewEvent";
import { EyeIcon, PaintBrushIcon } from "@heroicons/react/24/outline";

interface StyleLabTheme {
  id_theme: number;
  id_user: string;
  name?: string;
  background_url: string | null;
  colors: string[];
  created_at: string;
}

export default function ThemeSection({ eventId }: { eventId: string }) {
  const { session } = useUser();
  const { addToast } = useToast();

  const [themes, setThemes] = useState<StyleLabTheme[]>([]);
  const [presets, setPresets] = useState<StyleLabTheme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<StyleLabTheme | null>(null);
  const [typeEventId, setTypeEventId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"themes" | "preview">("themes");

  // Fetch presets locais
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await fetch("/data/presets.json");
        const data = await response.json();
        setPresets(data);
      } catch (err) {
        console.error("Erro ao carregar presets:", err);
      }
    };
    fetchPresets();
  }, []);

  // Fetch temas do usuário
  useEffect(() => {
    if (session?.user) fetchThemes(session.user.id);
  }, [session]);

  const fetchThemes = async (userId: string) => {
    const { data: themesData, error } = await supabase
      .from("styleLab")
      .select("*")
      .eq("id_user", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar temas:", error.message);
      return;
    }

    setThemes(themesData);
  };

  // Fetch tema selecionado do evento
  useEffect(() => {
    if (!themes.length) return;

    const fetchSelectedTheme = async () => {
      const { data, error } = await supabase
        .from("typeEvent")
        .select("*")
        .eq("id_event", parseInt(eventId))
        .single();

      if (error) {
        console.error("Erro ao buscar tema salvo:", error.message);
        return;
      }

      setTypeEventId(data.id);

      const urlSaved = data?.config?.preset?.url_background;
      if (urlSaved) {
        const themeFound =
          themes.find((t) => t.background_url === urlSaved) ||
          presets.find((t) => t.background_url === urlSaved);
        if (themeFound) setSelectedTheme(themeFound);
      }
    };

    fetchSelectedTheme();
  }, [eventId, themes, presets]);

  const handleSelectTheme = async (theme: StyleLabTheme) => {
    if (!typeEventId) return;

    setLoading(true);
    addToast("Salvando tema...", "info");

    try {
      const { data: eventData, error: fetchError } = await supabase
        .from("typeEvent")
        .select("*")
        .eq("id", typeEventId)
        .single();

      if (fetchError || !eventData) throw fetchError;

      const currentConfigs = eventData.config ?? {};
      const updatedConfigs = {
        ...currentConfigs,
        preset: {
          ...currentConfigs.preset,
          url_background: theme.background_url,
          colors: theme.colors,
        },
      };

      const { error: updateError } = await supabase
        .from("typeEvent")
        .update({ config: updatedConfigs })
        .eq("id", typeEventId);

      if (updateError) throw updateError;

      setSelectedTheme(theme);
      addToast("Tema atualizado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      addToast("Erro ao atualizar tema.", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderThemeCard = (theme: StyleLabTheme) => (
    <div
      key={theme.id_theme}
      onClick={() => handleSelectTheme(theme)}
      className={`card relative bg-base-100 shadow-xl cursor-pointer transform transition hover:scale-105 rounded-xl overflow-hidden ${
        selectedTheme?.id_theme === theme.id_theme ? "ring-2 ring-primary" : ""
      }`}
      style={{
        backgroundImage: `url(${
          theme.background_url || "/images/showLive/banners/banner_default.webp"
        })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="card-body relative z-10 justify-end">
        <h3 className="card-title text-white drop-shadow">
          {theme.name || `Tema #${theme.id_theme}`}
        </h3>
        <div className="flex gap-2 mt-2">
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
  );

  return (
    <div className="min-h-screen px-4 md:px-8">
      {/* Tabs */}
      <div className="tabs tabs-lift mb-6">
        <label
          className={`tab flex items-center gap-2 ${
            activeTab === "themes" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("themes")}
        >
          <PaintBrushIcon className="w-5 h-5" />
          Temas
        </label>
        <label
          className={`tab flex items-center gap-2 ${
            activeTab === "preview" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("preview")}
        >
          <EyeIcon className="w-5 h-5" />
          Pré-visualização
        </label>
      </div>

      {/* Temas */}
      {activeTab === "themes" && (
        <>
          <h4 className="text-primary font-bold text-3xl mb-2">Temas</h4>
          <p className="text-base-content/80">
            Selecione um tema para o seu evento. Seja ele criado no{" "}
            <i>StyleLab</i> ou um dos presets disponíveis!
          </p>

          {/* Presets */}
          <h4 className="text-xl font-bold mt-6 mb-6 border-b border-base-content max-w-max text-base-content">Presets</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {presets.map(renderThemeCard)}
          </div>

          {/* Seus temas */}
          <h4 className="text-xl font-bold mt-6 mb-6 border-b border-base-content max-w-max text-base-content">Seus temas</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {themes.map(renderThemeCard)}
          </div>
        </>
      )}

      {/* Pré-visualização */}
      {activeTab === "preview" && (
        <div className="mt-8">
          <h4 className="text-primary font-bold text-3xl">Pré-visualização</h4>
          <p className="text-base-content/80 mb-4">
            Veja como seu evento ficará com o tema selecionado.
          </p>
          <PreviewEvent
            eventId={eventId}
            backgroundUrl={selectedTheme?.background_url}
            colors={selectedTheme?.colors || []}
          />
        </div>
      )}
    </div>
  );
}
