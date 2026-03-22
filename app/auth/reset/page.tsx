"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import Logo from "@/components/UI/Logo";

type FeedbackState = {
  type: "success" | "error" | null;
  message: string | null;
};

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordPage() {
  const router = useRouter();
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [feedback, setFeedback] = useState<FeedbackState>({
    type: null,
    message: null,
  });

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [canReset, setCanReset] = useState(false);

  const passwordTooShort =
    password.length > 0 && password.length < MIN_PASSWORD_LENGTH;

  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const isFormInvalid = useMemo(() => {
    return (
      !password ||
      !confirmPassword ||
      passwordTooShort ||
      passwordMismatch ||
      loading
    );
  }, [password, confirmPassword, passwordTooShort, passwordMismatch, loading]);

  const showFeedback = useCallback(
    (type: FeedbackState["type"], message: string) => {
      setFeedback({ type, message });
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    const checkRecoverySession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          setCanReset(false);
          showFeedback(
            "error",
            "Não foi possível validar a recuperação de senha."
          );
          return;
        }

        if (data.session) {
          setCanReset(true);
          return;
        }

        setCanReset(false);
        showFeedback("error", "Link inválido ou expirado.");
      } catch {
        if (!isMounted) return;
        setCanReset(false);
        showFeedback(
          "error",
          "Ocorreu um erro ao validar o link de recuperação."
        );
      } finally {
        if (isMounted) {
          setCheckingSession(false);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!isMounted) return;

      if (event === "PASSWORD_RECOVERY") {
        setCanReset(true);
        setCheckingSession(false);
        setFeedback({ type: null, message: null });
      }
    });

    checkRecoverySession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();

      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [showFeedback]);

  const validateForm = useCallback(() => {
    if (!password || !confirmPassword) {
      showFeedback("error", "Preencha todos os campos.");
      return false;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      showFeedback(
        "error",
        `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
      );
      return false;
    }

    if (password !== confirmPassword) {
      showFeedback("error", "As senhas não coincidem.");
      return false;
    }

    return true;
  }, [password, confirmPassword, showFeedback]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canReset || loading) return;

    const isValid = validateForm();
    if (!isValid) return;

    try {
      setLoading(true);
      setFeedback({ type: null, message: null });

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        showFeedback(
          "error",
          error.message || "Erro ao redefinir a senha."
        );
        return;
      }

      showFeedback("success", "Senha redefinida com sucesso. Redirecionando...");

      redirectTimeoutRef.current = setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch {
      showFeedback(
        "error",
        "Ocorreu um erro inesperado ao redefinir sua senha."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen">
      <aside className="hidden w-2/3 flex-col justify-between bg-gradient-to-l from-error/10 via-base-100 to-base-200 p-8 md:flex">
        <Logo logoSize="xl" redirectIndex />
      </aside>

      <main className="flex w-full items-center justify-center bg-gradient-to-t from-error/5 via-base-100 to-base-200 p-6 md:w-1/3">
        <span className="absolute left-6 top-6 md:hidden">
          <Logo redirectIndex logoSize="md" />
        </span>

        <section className="card w-full max-w-md">
          <div className="card-body gap-6">
            <header className="text-center">
              <h1 className="text-3xl font-bold">Redefinir senha</h1>
              <p className="mt-1 text-sm text-base-content/70">
                Crie uma nova senha para sua conta
              </p>
            </header>

            {feedback.message && (
              <div
                role="alert"
                className={`alert alert-soft text-sm ${
                  feedback.type === "error" ? "alert-error" : "alert-success"
                }`}
              >
                {feedback.message}
              </div>
            )}

            {canReset ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="form-control">
                  <label htmlFor="password" className="label">
                    <span className="label-text">Nova senha</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    className={`input input-bordered w-full ${
                      passwordTooShort ? "input-error" : ""
                    }`}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {passwordTooShort && (
                    <span className="mt-1 text-xs text-error">
                      A senha deve ter pelo menos {MIN_PASSWORD_LENGTH} caracteres.
                    </span>
                  )}
                </div>

                <div className="form-control">
                  <label htmlFor="confirmPassword" className="label">
                    <span className="label-text">Confirmar senha</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className={`input input-bordered w-full ${
                      passwordMismatch ? "input-error" : ""
                    }`}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {passwordMismatch && (
                    <span className="mt-1 text-xs text-error">
                      As senhas precisam ser iguais.
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isFormInvalid}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar nova senha"
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center text-sm text-base-content/70">
                <p>Solicite um novo link para redefinir sua senha.</p>
                <Link href="/auth/forgot-password" className="btn btn-soft">
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
        </section>
      </main>
    </div>
  );
}