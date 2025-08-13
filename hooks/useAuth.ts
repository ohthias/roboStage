import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
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

    setError("Falha ao criar sessão");
    return false;
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return false;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: data.user.id, username: name }]);
      if (profileError) {
        setLoading(false);
        setError(profileError.message);
        return false;
      }
    }

    setLoading(false);
    setSuccess("Cadastro realizado! Verifique seu e-mail.");
    return true;
  };

  const loginWithProvider = async (provider: "google" | "github") => {
    setError(null);
    await supabase.auth.signInWithOAuth({ provider });
  };

  return { login, signup, loginWithProvider, loading, error, success };
}
