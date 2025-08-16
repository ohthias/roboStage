import { useState } from "react";
import { supabase } from "@/utils/supabase/client";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Função para validar o Turnstile no backend
  const validateTurnstile = async (token: string) => {
    try {
      const res = await fetch("/api/validate-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      return data.success; // true ou false
    } catch {
      return false;
    }
  };

  const login = async (
    email: string,
    password: string,
    turnstileToken?: string
  ) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return false;
    }

    if (data.session) {
      setSuccess("Login realizado com sucesso!");
      return true;
    }

    setError("Falha ao criar sessão.");
    return false;
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    turnstileToken?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([{ id: data.user.id, username: name }]);
        if (profileError) throw profileError;
      }

      setSuccess("Cadastro realizado! Clique em login para entrar.");
      return true;
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as any).message === "string"
      ) {
        setError((err as { message: string }).message);
      } else {
        setError("Ocorreu um erro desconhecido.");
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithProvider = async (provider: "google" | "github") => {
    setError(null);
    await supabase.auth.signInWithOAuth({ provider });
  };

  return { login, signup, loginWithProvider, loading, error, success };
}
