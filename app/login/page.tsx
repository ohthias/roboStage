"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      router.refresh(); // Next.js App Router
      router.push("/dashboard");
    }
  };

  const handleLoginWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
    });

    if (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="h-screen flex flex-col justify-between">
      <Navbar />
      <div className="w-lg mx-auto my-10 bg-light-smoke p-6 rounded shadow-md">
        <h1 className="text-4xl font-bold text-center">Login</h1>
        <p className="text-center mb-4">
          <a href="/sign" className="text-red-600 underline">
            Não tenho uma conta
          </a>
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded border-gray-300 outline-none focus:border-red-600"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded border-gray-300 outline-none focus:border-red-600 transition pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 p-1 cursor-pointer transform translate-y-[-50%] mt-1"
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <i className="fi fi-rr-eye" style={{ lineHeight: 0 }}></i>
              ) : (
                <i
                  className="fi fi-rr-eye-crossed"
                  style={{ lineHeight: 0 }}
                ></i>
              )}
            </button>
          </div>
          {errorMsg && <p className="text-red-600">{errorMsg}</p>}
          <button
            type="submit"
            className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 cursor-pointer"
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={handleLoginWithGithub}
            className="w-full bg-zinc-800 text-white p-2 rounded flex items-center justify-start hover:bg-zinc-900 transition cursor-pointer gap-2"
          >
            <i className="fi fi-brands-github" style={{ lineHeight: 0 }}></i>
            Entrar com GitHub
          </button>
        </form>
      </div>
    </div>
  );
}
