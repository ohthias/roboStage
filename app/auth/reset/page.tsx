"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/UI/Logo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const code = searchParams.get("code");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!code) {
      console.error("Código de redefinição ausente ou inválido.");
      return;
    }

    try {
      await resetPassword(password);

      router.push("/login");
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>Código de redefinição ausente ou inválido.</span>
              <button className="btn btn-sm" onClick={() => router.push("/auth/forgot-password")}>
                Solicitar novo código
              </button>
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={!code}>
            Redefinir senha
          </button>
        </form>
      </div>
    </main>
  );
}
