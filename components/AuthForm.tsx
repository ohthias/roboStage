"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const { login, signup, loginWithProvider, loading, error, success } = useAuth();
  const router = useRouter();

  const passwordRules = [
    { label: "Mínimo 8 caracteres", test: (pw: string) => pw.length >= 8 },
    { label: "Pelo menos 1 número", test: (pw: string) => /\d/.test(pw) },
    { label: "Pelo menos 1 letra maiúscula", test: (pw: string) => /[A-Z]/.test(pw) },
    { label: "Pelo menos 1 caractere especial", test: (pw: string) => /[!@#$%^&*]/.test(pw) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      const ok = await login(email, password);
      if (ok !== null && ok !== undefined) {
        router.refresh();
        router.push("/dashboard");
      }
    } else {
      const ok = await signup(email, password, name);
      if (ok !== null && ok !== undefined) {
        router.refresh();
        router.push("/join");
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-10 p-6 shadow-lg rounded-xl bg-base-200">
      {/* Título */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">{isLogin ? "Entrar" : "Criar Conta"}</h1>
        <p className="text-sm text-base-content/70">
          {isLogin
            ? "Acesse sua conta para continuar."
            : "Preencha os campos abaixo para se cadastrar."}
        </p>
      </div>

      {/* Tabs */}
      <div role="tablist" className="tabs tabs-border mb-6">
        <button
          role="tab"
          className={`tab ${isLogin ? "tab-active" : ""}`}
          onClick={() => setIsLogin(true)}
        >
          Login
        </button>
        <button
          role="tab"
          className={`tab ${!isLogin ? "tab-active" : ""}`}
          onClick={() => setIsLogin(false)}
        >
          Cadastro
        </button>
      </div>

      {/* Mensagens */}
      {error && <div className="alert alert-error text-sm my-4">{error}</div>}
      {success && <div className="alert alert-success text-sm my-4">{success}</div>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isLogin && (
          <label className="floating-label w-full">
            <span>Seu Nome</span>
            <input
              type="text"
              placeholder="João da Silva"
              className="input input-md w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
        )}

        <label className="floating-label w-full">
          <span>Seu Email</span>
          <input
            type="email"
            placeholder="email@exemplo.com"
            className="input input-md w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <div className="relative">
          <label className="floating-label w-full">
            <span>Sua Senha</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="input input-md w-full pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button
            type="button"
            className="absolute right-3 top-3 text-base-content/70"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        </div>

        {!isLogin && (
          <ul className="text-sm space-y-1 mt-2">
            {passwordRules.map((rule, i) => (
              <li
                key={i}
                className={`flex items-center gap-2 ${
                  rule.test(password) ? "text-success" : "text-error"
                }`}
              >
                <span>•</span> {rule.label}
              </li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Carregando..." : isLogin ? "Entrar" : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}
