"use client";

import { useState } from "react";
import { gerarCodigoAleatorio } from "@/utils/gerarCodigoAleatorio";
import Hero from "@/components/hero";
import Loader from "@/components/loader";
import { useRouter } from "next/navigation";

export default function CreateRoomPage() {
  const router = useRouter();
  const codigo_sala = gerarCodigoAleatorio();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    codigo_sala: codigo_sala,
    nome: "",
    email: "",
    codigo_admin: codigo_sala + gerarCodigoAleatorio(),
    codigo_visitante: codigo_sala + gerarCodigoAleatorio(),
    codigo_voluntario: codigo_sala + gerarCodigoAleatorio(),
  });

  const [status, setStatus] = useState({
    loading: false,
    success: "",
    error: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ loading: true, success: "", error: "" });

    const res = await fetch("/rooms/create-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const result = await res.json();

    if (res.ok) {
      await fetch("/rooms/create-room/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setStatus({
        loading: false,
        success: "Sala criada com sucesso!",
        error: "",
      });

      router.push(`/${result.room.codigo_sala}/admin`);
    } else {
      setStatus({
        loading: false,
        success: "",
        error: result.error || "Erro ao criar sala",
      });
    }

    setLoading(false);
  };

  return (
    <>
      <Hero />

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <Loader />
        </div>
      )}

      <div className="min-h-[calc(100vh-60px)] flex items-center justify-center bg-gradient-to-t from-secondary/50 to-light px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-full max-w-md sm:max-w-lg animate-fadein-down">
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-center">
              Crie seu próprio evento!
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Nome do evento:
              </label>
              <input
                id="nome"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-sm sm:text-base"
                placeholder="Insira o nome do evento"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Email:
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-sm sm:text-base"
                placeholder="Insira o email para receber os códigos de acesso"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status.loading}
              className="w-full py-2 bg-secondary text-white rounded shadow hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-all duration-200"
            >
              {status.loading ? "Criando..." : "Criar Sala"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}