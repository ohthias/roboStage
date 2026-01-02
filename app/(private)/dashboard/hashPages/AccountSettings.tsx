"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/app/context/UserContext";
import { useToast } from "@/app/context/ToastContext";
import {
  Settings,
  Trash2,
  User,
} from "lucide-react";
import EditProfileModal from "@/components/ui/Modal/ModalEditProfile";

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

      if (data.created_at) {
        setCreatedAt(
          new Date(data.created_at).toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })
        );
      }

      if (data.avatar_url) {
        const { data: signed } = await supabase.storage
          .from("photos")
          .createSignedUrl(data.avatar_url, 120);
        if (signed?.signedUrl) setAvatarUrl(signed.signedUrl);
      }

      if (data.banner_url) {
        const { data: signed } = await supabase.storage
          .from("photos")
          .createSignedUrl(data.banner_url, 120);
        if (signed?.signedUrl) setBannerUrl(signed.signedUrl);
      }
    };

    loadProfileExtras();
  }, [session]);

  useEffect(() => {
    if (profile?.username) setUsername(profile.username);
  }, [profile]);

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

  if (loadingUser) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 rounded-xl bg-base-300/40" />
        <div className="h-6 w-1/3 bg-base-300/40 rounded" />
      </div>
    );
  }

  return (
    <section className="space-y-10 w-full mx-auto pb-12">
      {/* Banner */}
      <div
        className="relative rounded-xl overflow-hidden border border-base-300"
        style={{
          backgroundImage: bannerUrl
            ? `url(${bannerUrl})`
            : "linear-gradient(to right, hsl(var(--p)/0.3), hsl(var(--s)/0.2))",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="backdrop-blur-sm bg-base-100/70 p-6 flex flex-col md:flex-row items-center gap-6">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-28 h-28 rounded-full border-4 border-primary object-cover shadow"
          />

          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User size={28} className="text-primary" />
              {username || "Usuário"}
            </h1>
            <p className="text-sm text-base-content/70 mt-1">
              {createdAt
                ? `Na plataforma desde ${createdAt}`
                : "Carregando informações..."}
            </p>
          </div>
        </div>
      </div>

      {/* Configurações */}
      <div className="bg-base-100 border border-base-300 rounded-xl p-6 space-y-8">
        <header className="flex items-center gap-3 text-xl font-semibold">
          <Settings size={24} className="text-primary" />
          Configurações da Conta
        </header>

        {/* Username */}
        <div className="space-y-2">
          <label className="font-medium">Nome de usuário</label>
          <input
            className="input input-bordered w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <p className="text-xs text-base-content/60">
            Esse nome será exibido publicamente.
          </p>
        </div>

        <button
          onClick={handleUpdateUsername}
          disabled={saving}
          className="btn btn-primary w-full"
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>

        {/* Zona de risco */}
        <div className="border border-error/40 bg-error/10 rounded-xl p-5 space-y-3">
          <h3 className="font-bold text-error flex items-center gap-2">
            <Trash2 size={20} />
            Zona de risco
          </h3>
          <p className="text-sm text-base-content/70">
            A exclusão da conta é permanente e remove todos os dados associados.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="btn btn-error w-full"
          >
            {deleting ? "Excluindo..." : "Deletar conta"}
          </button>
        </div>
      </div>

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