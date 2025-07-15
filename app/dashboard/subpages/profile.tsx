"use client";

import { useUserProfile } from "@/app/hooks/useUserProfile";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const { session, profile, loading } = useUserProfile();
  const router = useRouter();

  const [editing, setEditing] = useState(false);

  const [username, setUsername] = useState(profile?.username || "");
  const [avatarUrl, setAvatarUrl] = useState(
    session?.user?.user_metadata?.avatar_url || ""
  );
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setSubmitting(true);
    setError("");

    try {
      // Atualiza username
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", session.user.id);

      if (updateProfileError) throw updateProfileError;

      // Atualiza metadata e senha
      const updates: any = {
        data: { avatar_url: avatarUrl },
      };

      if (password.trim()) {
        updates.password = password;
      }

      const { error: updateAuthError } = await supabase.auth.updateUser(updates);

      if (updateAuthError) throw updateAuthError;

      alert("Perfil atualizado com sucesso!");
      router.refresh();
      setEditing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao atualizar perfil.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-2 text-zinc-900">Perfil</h1>

      <div className="w-full h-full max-h-4xl bg-red-50 p-4 rounded shadow border border-red-200 flex flex-row gap-4 items-center">
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <>
            <div className="flex-shrink-0">
              <img
                src={avatarUrl || "/images/default-avatar.png"}
                alt="Avatar"
                className="w-24 h-24 rounded-full border border-gray-300 object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-zinc-800 mb-2">
                {profile?.username || session?.user?.email}
              </h2>
              <p className="text-gray-600 mb-2">
                Email: {session?.user?.email || "Não disponível"}
              </p>
              <button
                onClick={() => setEditing(!editing)}
                className="text-sm text-blue-600 hover:underline"
              >
                {editing ? "Cancelar" : "Editar"}
              </button>
            </div>
          </>
        )}
      </div>

      {editing && (
        <form
          onSubmit={handleSave}
          className="mt-4 bg-white p-4 rounded shadow space-y-4 max-w-lg"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              URL da foto de perfil
            </label>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setAvatarUrl(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="mt-1 p-2 w-full border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome de Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 p-2 w-full border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nova Senha (opcional)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Deixe em branco para não alterar"
              className="mt-1 p-2 w-full border rounded"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {submitting ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      )}
    </div>
  );
}