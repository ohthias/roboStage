"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/app/hooks/useUserProfile";

export default function SettingsPage() {
  const router = useRouter();
  const { session } = useUserProfile();
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!session) {
    return <p>Você precisa estar logado para acessar esta página.</p>;
  }

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Reautenticar antes de excluir
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: password,
    });

    if (signInError) {
      setError("Senha incorreta. Tente novamente.");
      setSubmitting(false);
      return;
    }

    // Excluir a conta
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      session.user.id
    );

    if (deleteError) {
      setError("Erro ao excluir conta: " + deleteError.message);
      setSubmitting(false);
      return;
    }

    alert("Conta excluída com sucesso.");
    router.push("/"); // Ou página de logout
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-zinc-900">Configurações</h1>

      <div className="bg-red-50 border border-red-200 p-4 rounded shadow flex items-center justify-between">
        <p className="text-red-800 font-medium">Excluir conta permanentemente</p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition"
        >
          Excluir Conta
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-2">Confirmar Exclusão</h2>
            <p className="text-gray-600 mb-4">
              Para excluir sua conta, confirme sua senha:
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-3">
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border p-2 rounded"
              />

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setPassword("");
                    setError("");
                  }}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  {submitting ? "Excluindo..." : "Confirmar Exclusão"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}