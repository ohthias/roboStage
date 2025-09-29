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
  const [bannerUrl, setBannerUrl] = useState(
    "bg-gradient-to-r from-primary/20 via-base-200 to-accent/20"
  );
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

    fetchUserCreatedAt();
    if (profile?.username) setUsername(profile.username);
  }, [profile, session]);

  if (loadingUser) return <p>Carregando perfil...</p>;
  if (!session) {
    router.push("/join");
    return null;
  }

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

  const handleUpdateImages = async () => {
    if (!session?.user?.id) return;

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl, banner_url: bannerUrl })
      .eq("id", session.user.id);

    if (error) {
      addToast("Erro ao atualizar imagens", "error");
    } else {
      addToast("Imagens atualizadas com sucesso!", "success");
      setOpenEditModal(false);
    }
  };

  return (
    <section className="pb-12 space-y-8 max-w-5xl mx-auto">
      {/* Banner do Perfil */}
      <div
        className={`hero ${bannerUrl} rounded-xl shadow-lg relative`}
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

          {/* Danger zone */}
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
        <div className="modal modal-open">
          <div className="modal-box space-y-6">
            <h3 className="font-bold text-lg">Editar Perfil</h3>

            {/* FOTO DE PERFIL */}
            <div className="space-y-3">
              <h4 className="font-semibold">Foto de Perfil</h4>

              {/* Preview Avatar */}
              <div className="flex flex-col items-center gap-3">
                <img
                  src={avatarUrl}
                  alt="Preview avatar"
                  className="w-28 h-28 rounded-full border-2 border-primary object-cover"
                />
                <span className="text-sm text-base-content/70">
                  Pré-visualização
                </span>
              </div>

              {/* Upload Avatar */}
              <input
                type="file"
                accept="image/*"
                className="file-input file-input-bordered w-full"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !session?.user?.id) return;

                  const fileExt = file.name.split(".").pop();
                  const fileName = `${session.user.id}-avatar-${Date.now()}.${fileExt}`;
                  const { error } = await supabase.storage
                    .from("avatars") // bucket
                    .upload(fileName, file, { upsert: true });

                  if (error) {
                    addToast("Erro ao enviar foto de perfil", "error");
                  } else {
                    const {
                      data: { publicUrl },
                    } = supabase.storage.from("avatars").getPublicUrl(fileName);
                    setAvatarUrl(publicUrl);
                    addToast("Foto de perfil atualizada!", "success");
                  }
                }}
              />

              {/* URL Avatar */}
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="input input-bordered w-full"
                placeholder="https://..."
              />
            </div>

            <hr className="border-base-300" />

            {/* BANNER */}
            <div className="space-y-3">
              <h4 className="font-semibold">Banner do Perfil</h4>

              {/* Preview Banner */}
              <div
                className="h-24 rounded-lg border-2 border-primary flex items-center justify-center text-sm text-base-content/70"
                style={{
                  backgroundImage: bannerUrl.startsWith("http")
                    ? `url(${bannerUrl})`
                    : undefined,
                }}
              >
                {bannerUrl.startsWith("http")
                  ? "Pré-visualização do banner"
                  : `Preview: ${bannerUrl}`}
              </div>

              {/* Upload Banner */}
              <input
                type="file"
                accept="image/*"
                className="file-input file-input-bordered w-full"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !session?.user?.id) return;

                  const fileExt = file.name.split(".").pop();
                  const fileName = `${session.user.id}-banner-${Date.now()}.${fileExt}`;
                  const { error } = await supabase.storage
                    .from("banners") // bucket
                    .upload(fileName, file, { upsert: true });

                  if (error) {
                    addToast("Erro ao enviar banner", "error");
                  } else {
                    const {
                      data: { publicUrl },
                    } = supabase.storage.from("banners").getPublicUrl(fileName);
                    setBannerUrl(publicUrl);
                    addToast("Banner atualizado!", "success");
                  }
                }}
              />

              {/* URL Banner */}
              <input
                type="text"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="input input-bordered w-full"
                placeholder="https://... ou classes Tailwind ex: bg-gradient-to-r from-primary to-accent"
              />
            </div>

            {/* Ações */}
            <div className="modal-action">
              <button
                onClick={() => setOpenEditModal(false)}
                className="btn btn-ghost"
              >
                Cancelar
              </button>
              <button onClick={handleUpdateImages} className="btn btn-primary">
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}