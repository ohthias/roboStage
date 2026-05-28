"use client";

import { useEffect, useMemo, useState } from "react";

import { Paintbrush, Eye, Search, Check } from "lucide-react";

import { createClient } from "@/utils/supabase/client";

import { useToast } from "@/app/context/ToastContext";

import { useUser } from "@/app/context/UserContext";

import { useEvent } from "@/hooks/useEvent";

import PreviewEvent from "../PreviewEvent";

const supabase = createClient();

interface StyleLabTheme {
  id_theme: number;

  id_user: string;

  name?: string;

  background_url: string | null;

  colors: string[];

  created_at: string;
}

interface Props {
  codeEvent: string;
}

export default function ThemeSection({ codeEvent }: Props) {
  const { session } = useUser();

  const { addToast } = useToast();

  const { eventData } = useEvent(codeEvent);

  const [themes, setThemes] = useState<StyleLabTheme[]>([]);

  const [presets, setPresets] = useState<StyleLabTheme[]>([]);

  const [selectedTheme, setSelectedTheme] = useState<StyleLabTheme | null>(
    null,
  );

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [preview, setPreview] = useState(false);

  const filteredThemes = useMemo(() => {
    return themes.filter((theme) =>
      (theme.name || `Tema ${theme.id_theme}`)
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [themes, search]);

  useEffect(() => {
    const loadPresets = async () => {
      const response = await fetch("/api/data/preset");

      const data = await response.json();

      setPresets(data || []);
    };

    loadPresets();
  }, []);

  useEffect(() => {
    const loadThemes = async () => {
      if (!session?.user) return;

      const { data } = await supabase
        .from("styleLab")
        .select("*")
        .eq("id_user", session.user.id)
        .order("created_at", {
          ascending: false,
        });

      setThemes(data || []);
    };

    loadThemes();
  }, [session]);

  useEffect(() => {
    const loadSelectedTheme = async () => {
      if (!eventData) return;

      const { data } = await supabase
        .from("typeEvent")
        .select("config")
        .eq("id_event", eventData.id_evento)
        .single();

      const savedUrl = data?.config?.preset?.url_background;

      const foundTheme = [...presets, ...themes].find(
        (theme) => theme.background_url === savedUrl,
      );

      if (foundTheme) {
        setSelectedTheme(foundTheme);
      }
    };

    loadSelectedTheme();
  }, [eventData, presets, themes]);

  const handleSelectTheme = async (theme: StyleLabTheme) => {
    if (!eventData) return;

    setLoading(true);

    try {
      const { data } = await supabase
        .from("typeEvent")
        .select("*")
        .eq("id_event", eventData.id_evento)
        .single();

      if (!data) return;

      const updatedConfig = {
        ...data.config,

        preset: {
          ...data.config?.preset,

          url_background: theme.background_url,

          colors: theme.colors,
        },
      };

      const { error } = await supabase
        .from("typeEvent")
        .update({
          config: updatedConfig,
        })
        .eq("id", data.id);

      if (error) {
        throw error;
      }

      setSelectedTheme(theme);

      addToast("Tema atualizado.", "success");
    } catch (err) {
      console.error(err);

      addToast("Erro ao atualizar tema.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <section className="space-y-6 px-4 md:px-8 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Paintbrush size={22} className="text-primary" />

            <h1 className="text-2xl md:text-3xl font-bold">Personalização</h1>
          </div>

          <p className="text-sm text-base-content/60 mt-1">
            Escolha o tema visual do evento.
          </p>
        </div>

        <button
          onClick={() => setPreview(!preview)}
          className={`btn btn-sm ${preview ? "btn-primary" : "btn-ghost"}`}
        >
          <Eye size={16} />

          {preview ? "Ocultar Preview" : "Preview"}
        </button>
      </div>

      {/* Search */}
      <label className="input input-bordered flex items-center gap-2">
        <Search size={16} className="text-base-content/50" />

        <input
          type="text"
          className="grow"
          placeholder="Buscar tema"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>

      {/* Presets */}
      {presets.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-base-content/60 uppercase">
            Presets
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((theme) => (
              <ThemeCard
                key={theme.id_theme}
                theme={theme}
                selected={selectedTheme?.id_theme === theme.id_theme}
                onClick={() => handleSelectTheme(theme)}
              />
            ))}
          </div>
        </div>
      )}

      {/* User Themes */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-base-content/60 uppercase">
          Seus Temas
        </h2>

        {filteredThemes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredThemes.map((theme) => (
              <ThemeCard
                key={theme.id_theme}
                theme={theme}
                selected={selectedTheme?.id_theme === theme.id_theme}
                onClick={() => handleSelectTheme(theme)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-base-300 py-10 text-center">
            <Paintbrush
              size={36}
              className="mx-auto mb-3 text-base-content/30"
            />

            <h2 className="font-medium">Nenhum tema encontrado</h2>

            <p className="text-sm text-base-content/60 mt-1">
              Crie temas no StyleLab para personalizar o evento.
            </p>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && selectedTheme && (
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
          <PreviewEvent
            eventId={String(eventData?.id_evento) || ""}
            backgroundUrl={selectedTheme.background_url}
            colors={selectedTheme.colors}
          />
        </div>
      )}
    </section>
  );
}

interface ThemeCardProps {
  theme: StyleLabTheme;

  selected: boolean;

  onClick: () => void;
}

function ThemeCard({ theme, selected, onClick }: ThemeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border transition-all hover:scale-[1.01] ${
        selected ? "border-primary" : "border-base-300"
      }`}
    >
      <div
        className="h-36 bg-cover bg-center"
        style={{
          backgroundImage: `url(${
            theme.background_url ||
            "/images/showLive/banners/banner_default.webp"
          })`,
        }}
      />

      <div className="flex items-center justify-between p-4 bg-base-100">
        <div className="text-left">
          <h3 className="font-medium">
            {theme.name || `Tema ${theme.id_theme}`}
          </h3>

          <div className="flex gap-1 mt-2">
            {theme.colors.map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-base-300"
                style={{
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
        </div>

        {selected && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-content">
            <Check size={16} />
          </div>
        )}
      </div>
    </button>
  );
}
