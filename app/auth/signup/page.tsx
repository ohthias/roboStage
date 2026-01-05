"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/UI/Logo";

export default function SignupPage() {
  const { signup, loading, error, success } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const router = useRouter();

  const validatePassword = (value: string) => {
    const errors: string[] = [];

    if (value.length < 8)
      errors.push("A senha deve ter pelo menos 8 caracteres.");
    if (!/[A-Z]/.test(value))
      errors.push("A senha deve conter pelo menos uma letra maiúscula.");
    if (!/[a-z]/.test(value))
      errors.push("A senha deve conter pelo menos uma letra minúscula.");
    if (!/[0-9]/.test(value))
      errors.push("A senha deve conter pelo menos um número.");
    if (!/[!@#$%^&*(),.?\":{}|<>_\-+=~]/.test(value))
      errors.push("A senha deve conter pelo menos um caractere especial.");

    setPasswordErrors(errors);
    setPassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordErrors.length > 0) {
      alert("A senha não atende aos requisitos de segurança.");
      return;
    }

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
      <Link href="/" className="absolute top-4 left-4 z-10 md:hidden">
        Voltar para Home
      </Link>

      {/* Lado esquerdo */}
      <aside className="w-2/3 hidden md:flex flex-col justify-between bg-gradient-to-r from-base-300 to-secondary/20 p-8">
        <Logo logoSize="lg" redirectIndex />
      </aside>
      
      {/* Formulário */}
      <div className="w-full md:w-1/3 flex items-center justify-center bg-base-100 p-6">
        <div className="card w-full max-w-md">
          <div className="card-body">
            <h2 className="text-3xl font-bold text-center mb-4">Criar Conta</h2>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {success && (
              <p className="text-green-500 text-sm mb-2">{success}</p>
            )}

            <form className="form-control" onSubmit={handleSubmit}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
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
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
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
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <label className="label mt-4" htmlFor="password">
                  <span className="label-text">Senha</span>
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => validatePassword(e.target.value)}
                  placeholder="••••••••"
                  className={`input input-bordered w-full ${
                    passwordErrors.length > 0 ? "input-error" : ""
                  }`}
                  required
                />
              </motion.div>

              {/* Lista de requisitos animada */}
              <AnimatePresence>
                {password && (
                  <motion.ul
                    className="text-xs mt-2 space-y-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {[
                      "Pelo menos 8 caracteres",
                      "Uma letra maiúscula (A-Z)",
                      "Uma letra minúscula (a-z)",
                      "Um número (0-9)",
                      "Um caractere especial (!@#$...)",
                    ].map((req, i) => {
                      const isMet = !passwordErrors.some((err) =>
                        err
                          .toLowerCase()
                          .includes(req.toLowerCase().split(" ")[1])
                      );
                      return (
                        <motion.li
                          key={i}
                          layout
                          className={`flex items-center gap-2 ${
                            isMet ? "text-green-600" : "text-red-500"
                          }`}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isMet ? "bg-green-500" : "bg-red-400"
                            }`}
                          ></span>
                          {req}
                        </motion.li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: password ? 1 : 0.5, y: 0 }}
                transition={{ duration: 0.4 }}
              >
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
                  disabled={!password || passwordErrors.length > 0}
                />
              </motion.div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary w-full mt-6"
                disabled={loading}
              >
                {loading ? "Cadastrando..." : "Cadastrar"}
              </motion.button>
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
