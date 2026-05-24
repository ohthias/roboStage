"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/UI/Logo";

export default function ResetPasswordClient({ code }: { code: string | null }) {
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!code) {
      console.error("Código de redefinição ausente ou inválido.");
      return;
    }

    try {
      await resetPassword(password);
      router.push("/auth/login");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <span className="absolute top-6 left-6">
        <Logo logoSize="lg" redirectIndex />
      </span>

      <div className="card bg-base-100 shadow-2xl w-full max-w-md">
        <form onSubmit={handleSubmit} className="card-body space-y-5">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-primary">Redefinir senha</h1>
            <p className="text-sm text-base-content/70">
              Insira sua nova senha para concluir a recuperação.
            </p>
            {!code && (
              <p className="text-sm text-error">
                Código de redefinição ausente ou inválido.
              </p>
            )}
          </div>

          <div className="form-control">
            <label className="label mb-1">
              <span className="label-text font-medium">Nova senha</span>
            </label>
            <input
              type="password"
              placeholder="********"
              className="input input-bordered input-primary focus:input-primary w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!code}
            />
          </div>

          {!code && (
            <div className="alert alert-error shadow-lg">
              <span>Código de redefinição ausente ou inválido.</span>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => router.push("/auth/forgot-password")}
              >
                Solicitar novo código
              </button>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={!code}
          >
            Redefinir senha
          </button>
        </form>
      </div>
    </main>
  );
}