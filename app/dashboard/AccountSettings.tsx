"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

export default function AccountSettings() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Não foi possível carregar o usuário");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (error) {
        setError("Erro ao carregar o perfil");
      } else {
        setUsername(data.username);
      }
    }

    fetchProfile();
  }, []);

  const handleUpdateUsername = async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", userId);

    setLoading(false);

    if (error) {
      setError("Erro ao atualizar o nome de usuário");
    } else {
      setSuccess("Nome de usuário atualizado com sucesso!");
        setTimeout(() => {
            window.location.hash = "hub";
        }, 1000);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;
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
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao deletar a conta");
      } else {
        alert(data.message);
        router.push("/");
      }
    } catch (err) {
      setError("Erro ao deletar a conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-base-200 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
      {/* Banner de perfil */}
      <div className="bg-primary p-6 flex flex-col items-center justify-center md:w-1/3">
        <img
          src="/images/default-avatar.png"
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
