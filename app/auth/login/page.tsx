"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeClosed } from "lucide-react";

import Logo from "@/components/UI/Logo";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, loading, error, success } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === "" || password.trim() === "") return;
    if (password.length < 8) return;
    const ok = await login(email, password);
    if (ok) router.push("/dashboard");
  };

  return (
    <div className="flex h-screen relative">
      {/* Mobile back */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-10 md:hidden link link-hover"
      >
        Voltar para Home
      </Link>

      {/* Lado institucional */}
      <aside className="w-2/3 hidden md:flex flex-col justify-between bg-gradient-to-r from-base-300 to-primary/10 p-8 ">
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:24px_24px] w-2/3" />
        <Logo logoSize="lg" redirectIndex />
      </aside>

      {/* Formulário */}
      <main className="w-full md:w-1/3 flex items-center justify-center bg-base-100 p-6">
        <div className="card w-full max-w-md">
          <div className="card-body gap-6">
            <header className="text-center">
              <h1 className="text-3xl font-bold">Bem-vindo de volta!</h1>
              <p className="text-base-content/70 text-sm mt-1">
                Entre com sua conta para acessar o RoboStage
              </p>
            </header>

            {/* Feedback */}
            {error && (
              <div className="alert alert-soft alert-error text-sm py-2">
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-soft alert-success text-sm py-2">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
              {/* Email */}
              <div className="form-control mb-4">
                <label className="label mb-1" htmlFor="email">
                  <span className="label-text">Email</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className="input input-bordered w-full"
                  placeholder="robostage@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label mb-1" htmlFor="password">
                  <span className="label-text">Senha</span>
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="input input-bordered w-full pr-12"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-4 flex items-center text-base-content/70 hover:text-base-content transition duration-200"
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <Eye size={16} /> : <EyeClosed size={16} />}
                  </button>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm link link-hover text-base-content/70 absolute right-0 bottom-[-1.5rem]"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>

              {/* Botão */}
              <motion.button
                type="submit"
                className="btn btn-primary w-full mt-4"
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? "Entrando..." : "Entrar"}
              </motion.button>
            </form>

            {/* Cadastro */}
            <footer className="text-center text-sm">
              Não tem uma conta?{" "}
              <Link href="/auth/signup" className="link link-primary">
                Cadastre-se
              </Link>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
