"use client";
import { useState } from "react";
import { gerarCodigoAleatorio } from "@/utils/gerarCodigoAleatorio";
import Loader from "@/components/loader";
import { useRouter } from "next/navigation";

export default function CreateRoomPage() {
  const router = useRouter();
  const codigo_sala = gerarCodigoAleatorio();
  const [form, setForm] = useState({
    codigo_sala: codigo_sala,
    nome: "",
    codigo_admin: codigo_sala + gerarCodigoAleatorio(),
    codigo_visitante: codigo_sala + gerarCodigoAleatorio(),
    codigo_voluntario: codigo_sala + gerarCodigoAleatorio(),
  });

  const [status, setStatus] = useState({
    loading: false,
    success: "",
    error: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: "", error: "" });

    const res = await fetch("/rooms/create-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const result = await res.json();
    console.log(result.room);
    if (res.ok) {
      setStatus({
        loading: true,
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
  };

  return (
    <div className="min-h-screen relative">
      {status.loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
          <Loader />
        </div>
      )}

      <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white">
        <h1 className="text-2xl font-bold mb-4">Criar Nova Sala</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Nome:</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={status.loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {status.loading ? "Criando..." : "Criar Sala"}
          </button>

          {status.success && (
            <p className="text-green-600 mt-2">{status.success}</p>
          )}
          {status.error && <p className="text-red-600 mt-2">{status.error}</p>}
        </form>
      </div>
    </div>
  );
}
