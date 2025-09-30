"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { signup, loading, error, success } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("As senhas não coincidem!");
      return;
    }
    const ok = await signup(email, password, name);
    if (ok) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex h-screen relative">
      {/* Logo no mobile */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-10 md:hidden"
      >
        <img
          src="/images/logos/Icone.png"
          alt="Logo"
          className="h-10 w-auto hover:scale-105 transition-transform bg-base-100/70 rounded-full p-1 shadow-md"
        />
      </Link>

      {/* Lado esquerdo (somente desktop/tablet) */}
      <div
        className="w-2/3 hidden md:flex flex-col justify-between bg-base-300 p-8"
        style={{
          backgroundImage: 'url("/images/background_auth.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backdropFilter: "brightness(0.3)",
        }}
      >
        <Link href="/" className="inline-block">
          <img
            src="/images/logos/Icone.png"
            alt="Logo"
            className="h-12 w-auto hover:scale-105 transition-transform bg-base-100/50 rounded-full p-1"
            style={{ backdropFilter: "blur(10px)" }}
          />
        </Link>
      </div>

      {/* Formulário */}
      <div className="w-full md:w-1/3 flex items-center justify-center bg-base-100 p-6">
        <div className="card w-full max-w-md shadow-2xl">
          <div className="card-body">
            <h2 className="text-3xl font-bold text-center mb-4">Criar Conta</h2>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-2">{success}</p>}

            <form className="form-control" onSubmit={handleSubmit}>
              <label className="label" htmlFor="name">
                <span className="label-text">Nome de Usuário</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome de usuário"
                className="input input-bordered w-full"
                required
              />

              <label className="label mt-4" htmlFor="email">
                <span className="label-text">Email</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="robostage@email.com"
                className="input input-bordered w-full"
                required
              />

              <label className="label mt-4" htmlFor="password">
                <span className="label-text">Senha</span>
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
                {loading ? "Cadastrando..." : "Cadastrar"}
              </button>
            </form>

            <p className="text-center mt-4">
              Já tem conta?{" "}
              <Link href="/auth/login" className="link link-primary">
                Entre aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}