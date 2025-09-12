"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/solid";

export default function AccountSettings() {
  const router = useRouter();
  const { session, profile, loading: loadingUser } = useUser();
  const { addToast } = useToast();

  const [username, setUsername] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <section className="pb-8 space-y-8">
      {/* Banner de perfil */}
      <div className="hero bg-gradient-to-r from-base-200 to-primary/50 rounded-xl mb-6 p-0 shadow-md">
        <div className="hero-content w-full flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-4 md:gap-8 text-center md:text-left p-4 md:p-8">
          <div className="relative flex-shrink-0">
            <img
              src="https://static.vecteezy.com/system/resources/previews/055/591/320/non_2x/chatbot-avatar-sending-and-receiving-messages-using-artificial-intelligence-vector.jpg"
              alt="Foto de perfil"
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-accent shadow-lg object-cover"
            />
            <span className="absolute bottom-2 right-2 bg-success rounded-full w-4 h-4"></span>
          </div>
          <div className="mt-3 md:mt-0 flex flex-col items-center md:items-start">
            <h2 className="text-xl md:text-3xl font-bold text-base-content">
              {username || "Usuário"}
            </h2>
            <p className="text-sm md:text-base text-base-content/70 mt-1">
              {createdAt ? `Na plataforma desde ${createdAt}` : "Carregando..."}
            </p>
          </div>
        </div>
      </div>

      {/* Configurações */}
      <div className="collapse collapse-arrow bg-base-200">
        <input type="checkbox" className="peer" />
        <div className="collapse-title text-lg md:text-xl font-bold text-base-content flex items-center gap-2">
          <WrenchScrewdriverIcon className="size-5 md:size-6" /> Configurações
          da Conta
        </div>
        <div className="collapse-content space-y-6">
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

          <hr className="my-6 border-base-300" />

          {/* Danger zone */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-error">Zona de Risco</h3>
            <p className="text-sm text-base-content/70">
              Essa ação não pode ser desfeita. Tenha certeza antes de
              prosseguir.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="btn btn-error w-full"
            >
              {loading ? "Processando..." : "Deletar Conta"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
