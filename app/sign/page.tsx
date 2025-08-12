"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: data.user.id, username }]);

      if (profileError) {
        setErrorMsg(profileError.message);
        return;
      }

      alert("Cadastro realizado. Verifique seu e-mail.");
      router.push("/login");
    }
  };

  return (
    <div className="h-screen flex flex-col justify-between">
      <Navbar />
      <div className="max-w-md mx-auto my-10 bg-light-smoke p-6 rounded shadow-md">
        <h1 className="text-4xl font-bold text-center text-red-600">
          Junte-se!
        </h1>
        <p className="text-center mb-4 text-gray-600">
          Crie sua conta agora!{" "}
          <a href="/login" className="text-red-600">
            Já tenho uma conta
          </a>
        </p>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Nome de usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded border-gray-300 outline-none focus:border-red-600 transition"
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded border-gray-300 outline-none focus:border-red-600 transition"
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
            className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 transition cursor-pointer"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}
