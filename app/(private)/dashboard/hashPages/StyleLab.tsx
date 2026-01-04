'use client";';
import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import StyleLabModal from "@/components/Dashboard/StyleLab/StyleLabModal";
import { useUser } from "@/app/context/UserContext";
import { ThemeCardSkeleton } from "@/components/Dashboard/StyleLab/ThemeCardSkeleton";
import { ThemePreviewModal } from "@/components/Dashboard/StyleLab/ThemePreviewModal";
import ModalConfirm, {
  ModalConfirmRef,
} from "@/components/UI/Modal/ModalConfirm";
import { Palette } from "lucide-react";

export interface StyleLabTheme {
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
  const [previewTheme, setPreviewTheme] = useState<StyleLabTheme | null>(null);
  const { session } = useUser();
  const modalDeleteRef = useRef<ModalConfirmRef>(null);
  let themesCache: StyleLabTheme[] | null = null;

  const fetchThemes = async () => {
    if (!session?.user) return;

    if (themesCache) {
      setThemes(themesCache);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("styleLab")
        .select("*")
        .eq("id_user", session.user.id)
        .order("created_at", { ascending: order === "asc" });

      if (!error && data) {
        setThemes(data);
        themesCache = data;
      }
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (theme: StyleLabTheme) => {
    modalDeleteRef.current?.open(`Deseja deletar o tema "${theme.name}"?`, () =>
      deleteTheme(theme.id_theme)
    );
  };

  const deleteTheme = async (id_theme: number) => {
    const { error } = await supabase
      .from("styleLab")
      .delete()
      .eq("id_theme", id_theme);
    if (!error)
      setThemes((prev) => {
        const updated = prev.filter((t) => t.id_theme !== id_theme);
        themesCache = updated;
        return updated;
      });
    else alert("Erro ao excluir tema: " + error.message);
  };

  useEffect(() => {
    fetchThemes();
  }, [session]);

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
    <div className="px-6 py-4 space-y-6 flex flex-col">
      {/* Header */}
      <div className="rounded-2xl border border-base-300 bg-gradient-to-br from-primary/10 via-base-100 to-base-300/10 p-6 flex flex-col sm:flex-row  items-start sm:items-center justify-between gap-4">
        {/* Info */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Palette className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-xl font-semibold leading-tight">InnoLab</h1>
            <p className="text-sm text-base-content/70 max-w-md">
              Crie, organize e evolua seus diagramas de engenharia e ideação.
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            Novo Tema
          </button>
        </div>
      </div>

      {/* Filtros */}
      <section className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center rounded-2xl bg-base-100/60 backdrop-blur-md border border-base-300 p-3">
        {/* Busca */}
        <div className="flex-1">
          <input
            type="text"
            className="input input-bordered w-full h-10 rounded-xl"
            placeholder="Buscar tema..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* Ordenação */}
        <div className="sm:w-52">
          <select
            className="select select-bordered w-full h-10 rounded-xl px-2"
            value={order}
            onChange={(e) => setOrder(e.target.value as "desc" | "asc")}
          >
            <option value="desc">Mais recentes</option>
            <option value="asc">Mais antigos</option>
          </select>
        </div>
      </section>

      {loading ? (
        Array.from({ length: 8 }).map((_, i) => (
          <section
            key={i}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            <ThemeCardSkeleton key={i} />
          </section>
        ))
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* Card de aviso */}
          {filteredThemes.length === 0 && (
            <div className="col-span-full flex flex-col justify-center items-center rounded-2xl border border-base-300 bg-base-100/60 backdrop-blur-md p-8 text-center">
              <span className="text-base-content/70 text-lg font-semibold">
                Nenhum tema encontrado
              </span>
              {themes.length > 0 && (
                <p className="text-sm text-base-content/50 mt-1">
                  Ajuste o nome ou a ordenação do filtro.
                </p>
              )}
            </div>
          )}

          {/* Card Criar Novo Tema */}
          <button
            onClick={() => setShowModal(true)}
            className="h-52 rounded-2xl border-2 border-dashed border-base-300 flex flex-col justify-center items-center gap-2 text-base-content/50 font-semibold hover:border-primary hover:text-primary hover:bg-base-200/40 transition-all duration-300"
          >
            <span className="text-2xl leading-none">＋</span>
            <span className="text-sm sm:text-base">Criar novo tema</span>
          </button>

          {/* Cards dos temas */}
          {filteredThemes.map((theme) => (
            <div
              key={theme.id_theme}
              className="relative overflow-hidden group cursor-pointer rounded-2xl h-40 sm:h-52 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{
                backgroundImage: `url(${
                  theme.background_url ||
                  "/images/showLive/banners/banner_default.webp"
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              onClick={() => setPreviewTheme(theme)}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

              {/* Menu contextual */}
              <div
                className="absolute top-3 right-3 z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="dropdown dropdown-end">
                  <button className="btn btn-ghost btn-xs text-white/80 hover:text-white hover:bg-black/30">
                    ⋮
                  </button>

                  <ul className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-xl w-40">
                    <li>
                      <button onClick={() => openDeleteModal(theme)}>
                        Excluir
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="relative z-10 h-full p-4 sm:p-5 flex flex-col justify-end">
                <h3 className="text-white font-semibold leading-tight drop-shadow text-sm sm:text-lg line-clamp-2">
                  {theme.name || `Tema #${theme.id_theme}`}
                </h3>

                {/* Paleta */}
                <div className="flex gap-1.5 mt-2 sm:mt-3 flex-wrap">
                  {theme.colors?.slice(0, 6).map((c, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md border border-white/30"
                      style={{ backgroundColor: c }}
                    />
                  ))}

                  {/* Indicador de overflow */}
                  {theme.colors?.length > 6 && (
                    <span className="text-xs text-white/70 ml-1">
                      +{theme.colors.length - 6}
                    </span>
                  )}
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

      {previewTheme && (
        <ThemePreviewModal
          theme={previewTheme}
          onClose={() => setPreviewTheme(null)}
        />
      )}

      <ModalConfirm
        ref={modalDeleteRef}
        title="Confirmar delete"
        confirmLabel="Deletar"
        cancelLabel="Cancelar"
      />
    </div>
  );
}
