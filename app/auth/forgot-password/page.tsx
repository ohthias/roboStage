"use client";

import { useState } from "react";
import { authService } from "@/services/auth.service";
import Logo from "@/components/UI/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await authService.forgotPassword(email);

      setSuccess(true);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <span className="absolute top-6 left-6">
        <Logo logoSize="lg" redirectIndex />
      </span>
      <div className="card bg-base-100 shadow-2xl w-full max-w-md">
        <form onSubmit={handleSubmit} className="card-body space-y-5">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-primary">Recuperar senha</h1>
            <p className="text-sm text-base-content/70">
              Insira seu email para receber um link de recuperação de senha.
            </p>
          </div>

          <div className="form-control">
            <label className="label mb-1">
              <span className="label-text font-medium">Email</span>
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="input input-bordered input-primary focus:input-primary w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <button type="submit" className="btn btn-primary btn-block">
              Enviar link de recuperação
            </button>
            <p className="text-center text-sm text-base-content/70 mt-4">
              Lembrou sua senha?{" "}
              <a href="/auth/login" className="link link-primary">
                Faça login
              </a>
            </p>
          </div>

          {success && (
            <div className="alert alert-success shadow-lg">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                Email enviado com sucesso! Verifique sua caixa de entrada.
              </span>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
