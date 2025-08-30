"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import StyleLabModal from "./StyleLabModal";
import { useUser } from "@/app/context/UserContext";

interface StyleLabTheme {
  id_theme: number;
  id_user: string;
  created_at: string;
  background_url: string | null;
  colors: string[];
  name?: string;
}

export function StyleLab() {
  const [showModal, setShowModal] = useState(false);
  const [themes, setThemes] = useState<StyleLabTheme[]>([]);
  const { session } = useUser();

  const fetchThemes = async () => {
    if (!session?.user) return;

    const { data: themesData, error } = await supabase
      .from("styleLab")
      .select("*")
      .eq("id_user", session.user.id)
      .order("created_at", { ascending: false });

    if (error || !themesData) return;

    setThemes(themesData);
  };

  const deleteTheme = async (id_theme: number) => {
    const confirmed = confirm("Tem certeza que deseja excluir este tema?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("styleLab")
      .delete()
      .eq("id_theme", id_theme);

    if (!error) {
      setThemes((prev) => prev.filter((t) => t.id_theme !== id_theme));
    } else {
      alert("Erro ao excluir tema: " + error.message);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, [session]);

  return (
    <div className="h-full overflow-y-auto">
      <section className="bg-base-200 p-4 rounded-lg flex justify-between items-start shadow-md border border-base-300">
        <div>
          <h2 className="text-base-content font-bold mb-2 text-3xl">
            Style<span className="text-violet-700">Lab</span>
          </h2>
          <p className="text-sm text-base-content">
            Crie temas personalizados para seus eventos no showLive.
          </p>
        </div>
        <button
          className="btn btn-soft btn-accent"
          onClick={() => setShowModal(true)}
        >
          Criar Tema
        </button>
      </section>

      <section className="flex gap-4 flex-wrap mt-4">
        {themes.length === 0 && (
          <div
            className="card w-72 h-52 flex flex-col justify-center items-center bg-base-100 border border-dashed border-base-300 cursor-pointer hover:bg-base-200 transition"
            onClick={() => setShowModal(true)}
          >
            <span className="text-xl font-semibold text-gray-400">
              + Criar Novo Tema
            </span>
          </div>
        )}

        {/* Cards dos temas existentes */}
        {themes.map((theme) => (
          <div
            key={theme.id_theme}
            className="card w-full sm:w-72 bg-base-100 shadow-xl border border-base-300 relative overflow-hidden h-42"
            style={{
              backgroundImage: `url(${
                theme.background_url ||
                "/images/showLive/banners/banner_default.webp"
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Conteúdo */}
            <div className="card-body relative z-1 p-4 sm:p-5 justify-end">
              <h3 className="card-title text-base sm:text-lg text-white drop-shadow line-clamp-2">
                {theme.name || `Tema #${theme.id_theme}`}
              </h3>

              <div className="flex flex-wrap justify-between items-center gap-2 mt-2">
                {/* Cores */}
                <div className="flex gap-1 sm:gap-2 flex-wrap">
                  {theme.colors.map((c, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded border border-base-300"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                {/* Ações */}
                <div className="card-actions">
                  <button
                    className="btn btn-error btn-xs sm:btn-sm"
                    onClick={() => deleteTheme(theme.id_theme)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 🔹 Modal */}
      {showModal && (
        <StyleLabModal
          onClose={() => {
            setShowModal(false);
            fetchThemes();
          }}
        />
      )}
    </div>
  );
}
