"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/app/context/UserContext";
import { useToast } from "@/app/context/ToastContext";
import PreviewEvent from "../PreviewEvent";
import { EyeIcon, PaintBrushIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassCircleIcon } from "@heroicons/react/24/solid";

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
  const [searchTerm, setSearchTerm] = useState("");

  /* =========================================================
      FETCHES
  ========================================================= */
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await fetch("/api/data/preset");
        const data = await response.json();
        setPresets(data);
      } catch (err) {
        console.error("Erro ao carregar presets:", err);
      }
    };
    fetchPresets();
  }, []);

  useEffect(() => {
    if (session?.user) fetchThemes(session.user.id);
  }, [session]);

  const fetchThemes = async (userId: string) => {
    const { data: themesData, error } = await supabase
      .from("styleLab")
      .select("*")
      .eq("id_user", userId)
      .order("created_at", { ascending: false });

    if (error) return console.error(error);

    setThemes(themesData);
  };

  useEffect(() => {
    if (!themes.length) return;
    const fetchSelectedTheme = async () => {
      const { data, error } = await supabase
        .from("typeEvent")
        .select("*")
        .eq("id_event", parseInt(eventId))
        .single();

      if (error) return;

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

  /* =========================================================
      UPDATE THEME
  ========================================================= */
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

      const updatedConfigs = {
        ...eventData.config,
        preset: {
          ...eventData.config?.preset,
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
      addToast("Tema atualizado!", "success");
    } catch (err) {
      console.error(err);
      addToast("Erro ao atualizar tema.", "error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
      THEME CARD
  ========================================================= */
  const renderThemeCard = (theme: StyleLabTheme) => (
    <div
      key={theme.id_theme}
      onClick={() => handleSelectTheme(theme)}
      className={`card cursor-pointer transition-all duration-200
      bg-base-100 shadow-xl hover:shadow-2xl hover:scale-[1.02] 
      overflow-hidden rounded-xl border border-base-300/40
      ${
        selectedTheme?.id_theme === theme.id_theme
          ? "ring ring-primary ring-offset-2"
          : ""
      }
    `}
      style={{
        backgroundImage: `url(${
          theme.background_url || "/images/showLive/banners/banner_default.webp"
        })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-black/40 p-4 h-full flex flex-col justify-end">
        <h3 className="text-lg font-bold text-white drop-shadow">
          {theme.name || `Tema #${theme.id_theme}`}
        </h3>

        <div className="flex gap-2 mt-3">
          {theme.colors.map((c, i) => (
            <div
              key={`${theme.id_theme}-${c}-${i}`}
              className="w-6 h-6 rounded border border-white/40 shadow"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  /* =========================================================
      LOADING
  ========================================================= */
  if (loading)
    return (
      <div className="h-64 flex items-center justify-center">
        <span className="loading loading-ring loading-lg text-primary" />
      </div>
    );

  /* =========================================================
      PAGE LAYOUT
  ========================================================= */
  return (
    <div className="min-h-screen px-4 md:px-8 py-4">
      <h1 className="text-4xl font-extrabold mb-6 text-primary">Personalização</h1>
      {/* Tabs */}
      <div className="tabs tabs-box mb-8 w-fit bg-base-200 rounded-xl shadow">
        <button
          className={`tab gap-2 px-6 ${
            activeTab === "themes" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("themes")}
        >
          <PaintBrushIcon className="w-5 h-5" /> Temas
        </button>

        <button
          className={`tab gap-2 px-6 ${
            activeTab === "preview" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("preview")}
        >
          <EyeIcon className="w-5 h-5" /> Pré-visualização
        </button>
      </div>

      {/* TEMA SECTION */}
      {activeTab === "themes" && (
        <>
          <h2 className="text-2xl font-extrabold text-primary mb-2">
            Temas
          </h2>
          <p className="text-base-content/70 mb-8">
            Escolha um tema criado no <b>StyleLab</b> ou use um dos presets!
          </p>

          {/* Presets */}
          <h3 className="text-xl font-bold mb-4 text-base-content border-l-4 border-primary pl-3">
            Presets
          </h3>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {presets.map(renderThemeCard)}
          </div>

          {/* Seus temas */}
          <h3 className="text-xl font-bold mt-10 mb-4 text-base-content border-l-4 border-primary pl-3">
            Seus temas
          </h3>

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Buscar tema..."
              className="input input-bordered w-full pr-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassCircleIcon className="w-7 h-7 absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60" />
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {themes
              .filter((t) =>
                (t.name || `tema #${t.id_theme}`)
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .map(renderThemeCard)}
          </div>
        </>
      )}

      {/* PREVIEW SECTION */}
      {activeTab === "preview" && (
        <div>
          <h2 className="text-3xl font-extrabold text-primary mb-4">
            Pré-visualização
          </h2>
          <p className="text-base-content/70 mb-6">
            Veja como o seu evento ficará com o tema escolhido.
          </p>

          <div className="rounded-xl border border-base-300 p-4 bg-base-100 shadow">
            <PreviewEvent
              eventId={eventId}
              backgroundUrl={selectedTheme?.background_url}
              colors={selectedTheme?.colors || []}
            />
          </div>
        </div>
      )}
    </div>
  );
}