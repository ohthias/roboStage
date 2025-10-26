import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // 🔹 Sempre que montar o hook, busca sessão atual
  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
        return;
      }
      setUser(data.session?.user ?? null);
    };

    getSession();

    // 🔹 Listener pra mudar user em tempo real (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Turnstile validate (continua igual)
  const validateTurnstile = async (token: string) => {
    try {
      const res = await fetch("/api/validate-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      return data.success;
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
      const errMsg = ((): string => {
      const e: any = error;
      const msg = (e?.message ?? "").toString().toLowerCase();

      if (e?.status === 400 || e?.status === 401) {
        return "Credenciais inválidas. Verifique seu e-mail e senha.";
      }

      if (/invalid|credentials|password|not found|user not found/.test(msg)) {
        return "Credenciais inválidas. Verifique seu e-mail e senha.";
      }

      if (/confirm|verification|verify/.test(msg)) {
        return "E-mail não confirmado. Verifique sua caixa de entrada para ativar sua conta.";
      }

      if (/network|timeout|fetch|failed to fetch/.test(msg)) {
        return "Erro de rede. Verifique sua conexão e tente novamente.";
      }

      return e?.message
        ? `Falha ao realizar login: ${e.message}`
        : "Falha ao realizar login.";
      })();

      setError(errMsg);
      setLoading(false);
      return false;
    }

    if (data.session) {
      setUser(data.session.user); // 🔹 seta o usuário
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
        setUser(data.user); // 🔹 seta usuário novo
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

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, login, signup, loginWithProvider, logout, loading, error, success };
}
