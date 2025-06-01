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

  const handleChange = (e: { target: { name: any; value: any } }) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    setLoading(true);
    e.preventDefault();
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
      setLoading(false);
    } else {
      setStatus({
        loading: false,
        success: "",
        error: result.error || "Erro ao criar sala",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <Hero />
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            backdropFilter: "blur(5px)",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <Loader />
        </div>
      )}
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-t from-secondary/50 to-light">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md animate-fadein-down">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-center">
              Crie seu próprio evento!
            </h1>
          </div>
          <div className="mb-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Nome do evento:</p>

                <input
                  name="nome"
                  value={form.nome}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Insira o nome do evento"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Email:</p>

                <input
                  name="email"
                  value={form.email}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Insira o email para receber os códigos de acesso"
                  onChange={handleChange}
                  type="email"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status.loading}
                className="w-full py-2 bg-secondary text-white rounded shadow hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 active:loading"
              >
                {status.loading ? "Criando..." : "Criar Sala"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
