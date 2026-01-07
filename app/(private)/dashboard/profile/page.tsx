"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/app/context/UserContext";
import { useToast } from "@/app/context/ToastContext";

import { User, Trash2, Pencil, Calendar, AlertTriangle } from "lucide-react";

import EditProfileModal from "@/components/UI/Modal/ModalEditProfile";

export default function AccountSettings() {
  const router = useRouter();
  const { session, profile, loading: loadingUser } = useUser();
  const { addToast } = useToast();

  const [username, setUsername] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const [avatarUrl, setAvatarUrl] = useState(
    "https://static.vecteezy.com/system/resources/previews/055/591/320/non_2x/chatbot-avatar-sending-and-receiving-messages-using-artificial-intelligence-vector.jpg"
  );
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadProfileExtras = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("created_at, avatar_url, banner_url")
        .eq("id", session.user.id)
        .single();

      if (error || !data) return;

      /* ===== DATA DE CRIAÇÃO ===== */
      if (data.created_at) {
        setCreatedAt(
          new Date(data.created_at).toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })
        );
      }

      /* ===== AVATAR ===== */
      if (data.avatar_url) {
        if (data.avatar_url.startsWith("http")) {
          setAvatarUrl(data.avatar_url);
        } else {
          const { data: signed } = await supabase.storage
            .from("photos")
            .createSignedUrl(data.avatar_url, 300);

          if (signed?.signedUrl) setAvatarUrl(signed.signedUrl);
        }
      }

      /* ===== BANNER ===== */
      if (data.banner_url) {
        if (data.banner_url.startsWith("http")) {
          setBannerUrl(data.banner_url);
        } else {
          const { data: signed } = await supabase.storage
            .from("photos")
            .createSignedUrl(data.banner_url, 300);

          if (signed?.signedUrl) setBannerUrl(signed.signedUrl);
        }
      }
    };

    loadProfileExtras();
  }, [session]);

  useEffect(() => {
    if (profile?.username) setUsername(profile.username);
  }, [profile]);

  /* ================= ACTIONS ================= */
  const handleUpdateUsername = useCallback(async () => {
    if (!session?.user?.id) return;

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", session.user.id);

    setSaving(false);

    if (error) {
      addToast("Erro ao atualizar o nome de usuário", "error");
      return;
    }

    addToast("Perfil atualizado com sucesso", "success");
    router.refresh();
  }, [username, session, router, addToast]);

  const handleDeleteAccount = useCallback(async () => {
    if (!session?.user?.id) return;

    const confirmed = window.confirm(
      "Tem certeza que deseja excluir sua conta? Essa ação é irreversível."
    );
    if (!confirmed) return;

    setDeleting(true);

    try {
      const res = await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || "Erro ao deletar conta", "error");
        return;
      }

      router.push("/");
    } catch {
      addToast("Erro inesperado ao deletar conta", "error");
    } finally {
      setDeleting(false);
    }
  }, [session, router, addToast]);

  /* ================= LOADING ================= */
  if (loadingUser) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-40 rounded-2xl bg-base-300/40" />
        <div className="h-6 w-1/3 bg-base-300/40 rounded" />
      </div>
    );
  }

  return (
    <section className="space-y-12 w-full mx-auto pb-12">
      {/* ================= HEADER / PERFIL ================= */}
      <header>
        <div
          className="relative overflow-hidden rounded-3xl border border-base-300 bg-gradient-to-br from-base-100 to-base-300 text-base-content"
          style={{
            backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-base-100/10 to-base-300/40 z-0 pointer-events-none" />
          {bannerUrl === null && (
            <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:24px_24px] z-[1]" />
          )}

          {/* Conteúdo */}
          <div className="relative z-10 max-w-7xl mx-auto px-8 py-12 flex flex-col xl:flex-row items-center xl:items-end gap-10">
            <figure className="relative">
              <img
                src={avatarUrl || ""}
                alt="Avatar do usuário"
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-base-100 object-cover"
              />
              <button
                onClick={() => setOpenEditModal(true)}
                className="absolute bottom-0 right-0 bg-primary text-primary-content p-2 rounded-full border-2 border-base-100 hover:bg-primary/90 transition"
              >
                <Pencil size={16} />
              </button>
            </figure>

            <div className="text-center xl:text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold">
                {profile?.username || "Usuário"}
              </h1>

              <p className="text-sm md:text-base opacity-90 mt-1 flex items-center gap-2 justify-center xl:justify-start">
                <User size={16} />@{profile?.username || "sem-username"}
              </p>

              {createdAt && (
                <p className="text-sm md:text-base opacity-90 mt-1 flex items-center gap-2 justify-center xl:justify-start">
                  <Calendar size={16} />
                  Membro desde {createdAt}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ================= STATUS ================= */}
      <aside className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-base-100 border border-base-300 rounded-2xl p-6">
          <h3 className="font-semibold text-sm opacity-70">Nível</h3>
          <p className="text-3xl font-bold mt-2">Lv. 1</p>
        </div>

        <div className="card bg-base-100 border border-base-300 rounded-2xl p-6">
          <h3 className="font-semibold text-sm opacity-70">XP acumulado</h3>
          <p className="text-3xl font-bold mt-2">0 XP</p>
        </div>

        <div className="card bg-base-100 border border-base-300 rounded-2xl p-6">
          <h3 className="font-semibold text-sm opacity-70">Conquistas</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </aside>

      {/* ================= ZONA DE RISCO ================= */}
      <footer className="rounded-3xl border border-error/30 bg-error/5 p-8 space-y-5">
        <h3 className="font-semibold text-error flex items-center gap-2">
          <AlertTriangle size={20} />
          Zona de risco
        </h3>

        <p className="text-sm text-base-content/70 max-w-xl">
          A exclusão da conta é permanente. Todos os dados, projetos e robôs
          associados serão removidos definitivamente.
        </p>

        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="btn btn-error btn-outline gap-2"
        >
          <Trash2 size={18} />
          {deleting ? "Excluindo conta..." : "Excluir minha conta"}
        </button>
      </footer>

      {openEditModal && (
        <EditProfileModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          session={session}
          supabase={supabase}
          addToast={addToast}
        />
      )}
    </section>
  );
}
