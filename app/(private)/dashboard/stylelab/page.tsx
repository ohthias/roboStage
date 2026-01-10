"use client";

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
import { useRouter, useSearchParams } from "next/navigation";

export interface StyleLabTheme {
  id_theme: number;
  id_user: string;
  created_at: string;
  background_url: string | null;
  colors: string[];
  name: string;
  background_blur: boolean;
}

export default function StyleLab() {
  const { session, loading: userLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showModal, setShowModal] = useState(false);
  const [themes, setThemes] = useState<StyleLabTheme[]>([]);
  const [editingTheme, setEditingTheme] = useState<StyleLabTheme | null>(null);
  const [previewTheme, setPreviewTheme] = useState<StyleLabTheme | null>(null);

  // 🔒 Estados NÃO dependem diretamente da URL
  const [searchText, setSearchText] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(false);

  const modalDeleteRef = useRef<ModalConfirmRef>(null);
  const hasHydrated = useRef(false);

  /* =========================
     URL → Estado (UMA VEZ)
  ========================= */
  useEffect(() => {
    if (hasHydrated.current) return;

    setSearchText(searchParams.get("q") ?? "");
    setOrder((searchParams.get("order") as "asc" | "desc") ?? "desc");

    hasHydrated.current = true;
  }, [searchParams]);

  /* =========================
     Estado → URL (APÓS hidratar)
  ========================= */
  useEffect(() => {
    if (!hasHydrated.current) return;

    const params = new URLSearchParams();

    if (searchText) params.set("q", searchText);
    params.set("order", order);

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchText, order, router]);

  /* =========================
     Fetch themes
  ========================= */
  const fetchThemes = async () => {
    if (!session?.user) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("styleLab")
        .select("*")
        .eq("id_user", session.user.id)
        .order("created_at", { ascending: order === "asc" });

      if (!error && data) {
        setThemes(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLoading) return;
    if (!session?.user) return;

    fetchThemes();
  }, [userLoading, session?.user?.id, order]);

  /* =========================
     Delete
  ========================= */
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

    if (!error) {
      setThemes((prev) => prev.filter((t) => t.id_theme !== id_theme));
    }
  };

  /* =========================
     Filtro local
  ========================= */
  const filteredThemes = useMemo(() => {
    return themes
      .filter(
        (theme) =>
          theme.name.toLowerCase().includes(searchText.toLowerCase()) ||
          `Tema #${theme.id_theme}`.includes(searchText)
      )
      .sort((a, b) => {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return order === "asc" ? aTime - bTime : bTime - aTime;
      });
  }, [themes, searchText, order]);

  const updateThemeLastAccess = async (id_theme: number) => {
    await supabase
      .from("stylelab")
      .update({ last_acess: new Date().toISOString() })
      .eq("id_theme", id_theme);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-base-300 bg-gradient-to-br from-primary/10 via-base-100 to-base-300/10 p-6 flex justify-between gap-4">
        <div className="flex gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">StyleLab</h1>
            <p className="text-sm text-base-content/70">
              Crie, organize e evolua seus temas visuais.
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingTheme(null);
            setShowModal(true);
          }}
        >
          Novo Tema
        </button>
      </div>

      {/* Filtros */}
      <section className="flex flex-col sm:flex-row gap-3 bg-base-100/60 border border-base-300 p-3 rounded-2xl">
        <input
          type="text"
          className="input input-bordered flex-1"
          placeholder="Buscar tema..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <select
          className="select select-bordered sm:w-52 px-3 rounded-lg"
          value={order}
          onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
        >
          <option value="desc">Mais recentes</option>
          <option value="asc">Mais antigos</option>
        </select>
      </section>

      {/* Conteúdo */}
      {loading ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <ThemeCardSkeleton key={i} />
          ))}
        </section>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {themes.length === 0 && (
            <button
              onClick={() => {
                setEditingTheme(null);
                setShowModal(true);
              }}
              className="h-52 rounded-2xl border-2 border-dashed border-base-300 flex flex-col items-center justify-center gap-2 text-base-content/50 hover:border-primary hover:text-primary"
            >
              <span className="text-2xl">＋</span>
              Criar novo tema
            </button>
          )}

          {filteredThemes.map((theme) => (
            <div
              key={theme.id_theme}
              onClick={async () => {
                await updateThemeLastAccess(theme.id_theme);
                setPreviewTheme(theme);
              }}
              className="relative rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition"
              style={{
                backgroundImage: `url(${
                  theme.background_url ||
                  "/images/showLive/banners/banner_default.webp"
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />

              <div
                className="absolute top-3 right-3 z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="dropdown dropdown-end">
                  <button className="btn btn-ghost btn-xs text-white">⋮</button>
                  <ul className="dropdown-content menu p-2 bg-base-100 rounded-xl w-40">
                    <li>
                      <button
                        onClick={async () => {
                          await updateThemeLastAccess(theme.id_theme);
                          setEditingTheme(theme);
                          setShowModal(true);
                        }}
                      >
                        Editar
                      </button>
                    </li>
                    <li className="text-error">
                      <button onClick={() => openDeleteModal(theme)}>
                        Excluir
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="relative z-10 p-4 flex flex-col justify-end h-52">
                <h3 className="text-white font-semibold">{theme.name}</h3>
                <div className="flex gap-1 mt-2">
                  {theme.colors.slice(0, 6).map((c, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded border border-white/30"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Modais */}
      {showModal && (
        <StyleLabModal
          theme={editingTheme}
          onClose={() => {
            setShowModal(false);
            setEditingTheme(null);
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
