"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [status, setStatus] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [canReset, setCanReset] = useState(false);

  /* =========================
     Validação da sessão
  ========================= */
  useEffect(() => {
    const handleRecovery = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        setIsError(true);
        setStatus("Link de redefinição inválido.");
        setCheckingSession(false);
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setIsError(true);
        setStatus("Este link de redefinição é inválido ou já expirou.");
        setCanReset(false);
      } else {
        setCanReset(true);
      }

      setCheckingSession(false);
    };

    handleRecovery();
  }, []);

  /* =========================
     Submit
  ========================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canReset) return;

    if (password !== confirm) {
      setIsError(true);
      setStatus("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    setStatus(null);
    setIsError(false);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setIsError(true);
      setStatus(error.message);
      return;
    }

    setStatus("Senha redefinida com sucesso. Redirecionando...");
    setTimeout(() => router.push("/auth/login"), 1500);
  };

  /* =========================
     Loading inicial
  ========================= */
  if (checkingSession) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="flex h-screen relative">
      {/* Lado visual */}
      <aside className="w-2/3 hidden md:flex flex-col justify-between bg-base-300 p-8">
        <Link href="/" className="inline-block">
          <img
            src="/images/logos/Icone.png"
            alt="Logo RoboStage"
            className="h-12 w-auto hover:scale-105 transition-transform bg-base-100/60 rounded-full p-1"
            style={{ backdropFilter: "blur(10px)" }}
          />
        </Link>
      </aside>

      {/* Formulário */}
      <main className="w-full md:w-1/3 flex items-center justify-center bg-base-100 p-6">
        <div className="card w-full max-w-md shadow-xl">
          <div className="card-body gap-6">
            <header className="text-center">
              <h1 className="text-3xl font-bold">Redefinir senha</h1>
              <p className="text-sm text-base-content/70 mt-1">
                Crie uma nova senha para sua conta
              </p>
            </header>

            {status && (
              <div
                className={`alert ${
                  isError ? "alert-error" : "alert-success"
                } text-sm`}
              >
                {status}
              </div>
            )}

            {canReset ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nova senha</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Confirmar senha</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Salvando...
                    </>
                  ) : (
                    "Salvar nova senha"
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center text-sm space-y-4">
                <p>Solicite um novo link para redefinir sua senha.</p>
                <Link href="/auth/forgot-password" className="btn btn-outline">
                  Reenviar link
                </Link>
              </div>
            )}

            <footer className="text-center text-sm">
              <Link href="/auth/login" className="link link-primary">
                Voltar ao login
              </Link>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
