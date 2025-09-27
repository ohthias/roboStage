"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (password !== confirm) {
      setStatus("As senhas não coincidem!");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Senha redefinida com sucesso! Faça login novamente.");
        router.push("/auth/login");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-2/3 hidden md:flex flex-col justify-between bg-gradient-to-br from-base-100 via-primary/25 to-secondary p-8 ">
        <Link href="/" className="inline-block">
          <img
            src="/images/logos/Icone.png"
            alt="Logo"
            className="h-12 w-auto hover:scale-105 transition-transform bg-base-100/50 rounded-full p-1"
            style={{ backdropFilter: 'blur(10px)' }}
          />
        </Link>
      </div>

      <div className="w-full md:w-1/3 flex items-center justify-center bg-base-100 p-6">
        <div className="card w-full max-w-md shadow-2xl">
          <div className="card-body">
            <h2 className="text-3xl font-bold text-center mb-4">
              Redefinir Senha
            </h2>
            <p className="text-center mb-4 text-sm text-gray-500">
              Digite sua nova senha abaixo.
            </p>

            {status && (
              <p
                className={`text-center text-sm mb-2 ${
                  status.includes("sucesso") ? "text-green-500" : "text-red-500"
                }`}
              >
                {status}
              </p>
            )}

            <form className="form-control" onSubmit={handleSubmit}>
              <label className="label" htmlFor="password">
                <span className="label-text">Nova Senha</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input input-bordered w-full"
                required
              />

              <label className="label mt-4" htmlFor="confirm">
                <span className="label-text">Confirmar Senha</span>
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="input input-bordered w-full"
                required
              />

              <button
                type="submit"
                className="btn btn-primary w-full mt-6"
                disabled={loading}
              >
                {loading ? "Atualizando..." : "Redefinir Senha"}
              </button>
            </form>

            <p className="text-center mt-4">
              <Link href="/auth/login" className="link link-primary">
                Voltar ao Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}