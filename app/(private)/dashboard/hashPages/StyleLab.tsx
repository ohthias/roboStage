import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/utils/supabase/client";
import StyleLabModal from "@/components/StyleLabModal";
import { useUser } from "@/app/context/UserContext";
import Loader from "@/components/loader";
import { PaintBrushIcon } from "@heroicons/react/24/outline";

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
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<"desc" | "asc">("desc");
  const { session } = useUser();

  const fetchThemes = async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const { data: themesData, error } = await supabase
        .from("styleLab")
        .select("*")
        .eq("id_user", session.user.id)
        .order("created_at", { ascending: order === "asc" });
      if (error) setThemes([]);
      else setThemes(themesData || []);
    } catch {
      setThemes([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteTheme = async (id_theme: number) => {
    const confirmed = confirm("Tem certeza que deseja excluir este tema?");
    if (!confirmed) return;
    const { error } = await supabase
      .from("styleLab")
      .delete()
      .eq("id_theme", id_theme);
    if (!error)
      setThemes((prev) => prev.filter((t) => t.id_theme !== id_theme));
    else alert("Erro ao excluir tema: " + error.message);
  };

  useEffect(() => {
    fetchThemes();
  }, [session, order]);

  const filteredThemes = useMemo(() => {
    return themes
      .filter(
        (theme) =>
          theme.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          `Tema #${theme.id_theme}`
            .toLowerCase()
            .includes(searchText.toLowerCase())
      )
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return order === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [themes, searchText, order]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="bg-base-200 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-md border border-base-300 gap-3">
        <div>
          <h2 className="text-base-content font-bold mb-1 text-2xl sm:text-3xl">
            Style<span className="text-violet-800">Lab</span>
          </h2>
          <p className="text-sm text-base-content">
            Crie temas personalizados para seus eventos no showLive.
          </p>
        </div>
        <button
          className="btn btn-accent w-full sm:w-auto"
          onClick={() => setShowModal(true)}
        >
          Criar Tema
        </button>
      </section>

      {/* Filtros */}
      <section className="flex flex-col sm:flex-row gap-3 mt-4 mb-2 items-stretch sm:items-center">
        <input
          type="text"
          className="input input-bordered w-full sm:w-64 flex-1"
          placeholder="Buscar tema por nome..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select
          className="select select-bordered w-full sm:w-52"
          value={order}
          onChange={(e) => setOrder(e.target.value as "desc" | "asc")}
        >
          <option value="desc">Mais recentes primeiro</option>
          <option value="asc">Mais antigos primeiro</option>
        </select>
      </section>

      {loading ? (
        <Loader />
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          {/* Card de aviso */}
          {filteredThemes.length === 0 && (
            <div className="col-span-full flex flex-col justify-center items-center bg-base-100 border border-base-300 rounded-lg shadow-md p-6 text-center">
              <PaintBrushIcon className="w-12 h-12 text-gray-400 mb-2" />
              <span className="text-gray-400 text-lg font-semibold">
                Nenhum tema encontrado
              </span>
              {themes.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Tente ajustar o nome ou a ordem do filtro.
                </p>
              )}
            </div>
          )}

          {/* Card Criar Novo Tema */}
          <div
            className="card h-40 flex flex-col justify-center items-center bg-base-100 border border-dashed border-base-300 cursor-pointer hover:bg-base-200 transition"
            onClick={() => setShowModal(true)}
          >
            <span className="text-lg sm:text-xl font-semibold text-gray-400 text-center">
              + Criar Novo Tema
            </span>
          </div>

          {/* Cards dos temas */}
          {filteredThemes.map((theme) => (
            <div
              key={theme.id_theme}
              className="card h-40 bg-base-100 shadow-md border border-base-300 relative overflow-hidden"
              style={{
                backgroundImage: `url(${
                  theme.background_url ||
                  "/images/showLive/banners/banner_default.webp"
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="card-body relative z-10 p-4 justify-end">
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
      )}

      {/* Modal */}
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
