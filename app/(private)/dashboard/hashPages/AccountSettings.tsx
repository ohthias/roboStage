"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/app/context/UserContext";
import { useToast } from "@/app/context/ToastContext";
import {
  WrenchScrewdriverIcon,
  TrashIcon,
  UserIcon,
  DocumentChartBarIcon,
  CalendarDaysIcon,
  PuzzlePieceIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import EditProfileModal from "@/components/ui/Modal/ModalEditProfile";

export default function AccountSettings() {
  const router = useRouter();
  const { session, profile, loading: loadingUser } = useUser();
  const { addToast } = useToast();

  const [username, setUsername] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState(
    "https://static.vecteezy.com/system/resources/previews/055/591/320/non_2x/chatbot-avatar-sending-and-receiving-messages-using-artificial-intelligence-vector.jpg"
  );
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  useEffect(() => {
    const fetchUserCreatedAt = async () => {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("created_at")
        .eq("id", session.user.id)
        .single();

      if (!error && data?.created_at) {
        const date = new Date(data.created_at);
        const formatted = date.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        });
        setCreatedAt(formatted);
      }
    };

    const fetchProfileImages = async () => {
      if (!session?.user?.id) return;

      // Pega os paths do banco
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url, banner_url")
        .eq("id", session.user.id)
        .single();

      if (!error && data) {
        // Avatar
        if (data.avatar_url) {
          const { data: avatarSigned, error: avatarError } =
            await supabase.storage
              .from("photos")
              .createSignedUrl(data.avatar_url, 60); // expira em 60s
          if (!avatarError && avatarSigned?.signedUrl)
            setAvatarUrl(avatarSigned.signedUrl);
        }

        // Banner
        if (data.banner_url) {
          const { data: bannerSigned, error: bannerError } =
            await supabase.storage
              .from("photos")
              .createSignedUrl(data.banner_url, 60);
          if (!bannerError && bannerSigned?.signedUrl)
            setBannerUrl(bannerSigned.signedUrl);
        }
      }
    };

    fetchProfileImages();
    fetchUserCreatedAt();

    if (profile?.username) setUsername(profile.username);
  }, [profile, session]);

  if (loadingUser) return <p>Carregando perfil...</p>;

  const handleUpdateUsername = async () => {
    if (!session?.user?.id) return;

    setLoading(true);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", session.user.id);

    setLoading(false);

    if (updateError) {
      addToast("Erro ao atualizar o nome de usuário", "error");
    } else {
      addToast("Nome de usuário atualizado com sucesso!", "success");
      localStorage.setItem("userProfile", JSON.stringify({ username }));
    }
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) return;
    const confirm = window.confirm(
      "Tem certeza que deseja deletar sua conta? Isso é irreversível!"
    );
    if (!confirm) return;

    setLoading(true);

    try {
      const res = await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || "Erro ao deletar a conta", "error");
      } else {
        alert(data.message);
        router.push("/");
      }
    } catch {
      addToast("Erro ao deletar a conta", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pb-12 space-y-8 max-w-5xl mx-auto">
      {/* Banner do Perfil */}
      <div
        className="hero rounded-xl shadow-lg relative bg-base-100"
        style={{
          backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="hero-content w-full flex flex-col md:flex-row items-center gap-6 p-6 md:p-10">
          <div className="relative">
            <img
              src={avatarUrl}
              alt="Foto de perfil"
              className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-primary shadow-md object-cover"
            />
            <span className="absolute bottom-2 right-2 bg-success rounded-full w-5 h-5 border-2 border-white"></span>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-2xl md:text-4xl font-bold text-base-content flex items-center gap-2">
              <UserIcon className="w-7 h-7 text-primary" />
              {username || "Usuário"}
            </h2>
            <p className="text-sm md:text-base text-base-content/70 mt-2">
              {createdAt
                ? `Na plataforma desde ${createdAt}`
                : "Carregando..."}
            </p>
          </div>
        </div>

        {/* Botão editar */}
        <button
          onClick={() => setOpenEditModal(true)}
          className="btn btn-sm btn-outline btn-primary absolute top-4 right-4 flex items-center gap-1"
        >
          <PencilSquareIcon className="w-4 h-4" />
          Editar Perfil
        </button>
      </div>

      {/* Estatísticas */}
      <div className="stats stats-vertical md:stats-horizontal shadow w-full bg-base-100">
        <div className="stat place-items-center">
          <div className="stat-figure text-primary">
            <DocumentChartBarIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Testes</div>
          <div className="stat-value text-primary">12</div>
          <div className="stat-desc">criados</div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-figure text-secondary">
            <CalendarDaysIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Eventos</div>
          <div className="stat-value text-secondary">5</div>
          <div className="stat-desc">registrados</div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-figure text-accent">
            <PuzzlePieceIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Diagramas</div>
          <div className="stat-value text-accent">8</div>
          <div className="stat-desc">documentados</div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-figure text-info">
            <PuzzlePieceIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Temas</div>
          <div className="stat-value text-info">3</div>
          <div className="stat-desc">personalizados</div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-figure text-warning">
            <ClockIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Timer</div>
          <div className="stat-value text-warning">20m</div>
          <div className="stat-desc">de sessões lançadas</div>
        </div>
      </div>

      <hr className="my-4 border-base-300" />

      {/* Configurações */}
      <div className="collapse collapse-arrow bg-base-300 shadow-md rounded-lg">
        <input type="checkbox" className="peer" />
        <div className="collapse-title text-lg md:text-xl font-bold flex items-center gap-2">
          <WrenchScrewdriverIcon className="size-6 text-primary" />
          Configurações da Conta
        </div>
        <div className="collapse-content space-y-6">
          {/* Nome de usuário */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Nome de usuário</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu nome de usuário"
              className="input input-bordered input-primary w-full"
            />
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                Esse é o nome que aparecerá para outros usuários.
              </span>
            </label>
          </div>

          {/* Botão atualizar */}
          <button
            onClick={handleUpdateUsername}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Atualizando..." : "Atualizar Nome"}
          </button>

          {/* Zona de risco */}
          <div className="p-4 border border-error rounded-lg bg-error/10">
            <h3 className="text-lg font-semibold text-error flex items-center gap-2">
              <TrashIcon className="w-5 h-5" />
              Zona de Risco
            </h3>
            <p className="text-sm text-base-content/70 mt-1">
              Essa ação não pode ser desfeita. Tenha certeza antes de prosseguir.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="btn btn-error w-full mt-4"
            >
              {loading ? "Processando..." : "Deletar Conta"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de edição */}
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
