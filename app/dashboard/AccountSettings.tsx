"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "../context/UserContext/page";

export default function AccountSettings() {
  const router = useRouter();
  const { session, profile, loading: loadingUser } = useUser();

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (profile?.username) setUsername(profile.username);
  }, [profile]);

  if (loadingUser) return <p>Carregando perfil...</p>;
  if (!session) {
    router.push("/join");
    return null;
  }

  const handleUpdateUsername = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    setError("");
    setSuccess("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", session.user.id);

    setLoading(false);

    if (updateError) {
      setError("Erro ao atualizar o nome de usuário");
    } else {
      setSuccess("Nome de usuário atualizado com sucesso!");
      localStorage.setItem("userProfile", JSON.stringify({ username }));
    }

    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) return;
    const confirm = window.confirm(
      "Tem certeza que deseja deletar sua conta? Isso é irreversível!"
    );
    if (!confirm) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao deletar a conta");
      } else {
        alert(data.message);
        router.push("/");
      }
    } catch {
      setError("Erro ao deletar a conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-base-200 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
      {/* Banner de perfil */}
      <div className="bg-secondary p-6 flex flex-col items-center justify-center md:w-1/3">
        <img
          src="/images/icons/UserDefaultPhoto.jpg"
          alt="Foto de perfil"
          className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white mb-4"
        />
        <h2 className="text-white text-xl md:text-2xl font-bold text-center">
          {username || "Usuário"}
        </h2>
      </div>

      {/* Conteúdo */}
      <div className="p-6 space-y-4 md:w-2/3">
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-semibold">Nome de usuário</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        <button
          onClick={handleUpdateUsername}
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? "Atualizando..." : "Atualizar Nome"}
        </button>

        <hr className="my-4 border-base-300" />

        <button
          onClick={handleDeleteAccount}
          disabled={loading}
          className="btn btn-error w-full"
        >
          {loading ? "Processando..." : "Deletar Conta"}
        </button>
      </div>
    </div>
  );
}
