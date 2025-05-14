// app/enter/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EnterRoomPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    sucesso: "",
    nivelAcesso: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", sucesso: "", nivelAcesso: "" });

    const res = await fetch("/rooms/enter-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo }),
    });

    const result = await res.json();

    if (res.ok) {
      setStatus({
        loading: false,
        error: "",
        sucesso: "Acesso permitido!",
        nivelAcesso: result.nivelAcesso,
      });
      router.push(`/${result.codigo_sala}/${result.nivelAcesso}`);
    } else {
      setStatus({
        loading: false,
        sucesso: "",
        error: result.error || "Código inválido",
        nivelAcesso: "",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Entrar na Sala</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Código de Acesso:</label>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={status.loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          {status.loading ? "Verificando..." : "Entrar"}
        </button>

        {status.sucesso && (
          <p className="text-green-600 mt-2">
            {status.sucesso} (Acesso: <strong>{status.nivelAcesso}</strong>)
          </p>
        )}
        {status.error && <p className="text-red-600 mt-2">{status.error}</p>}
      </form>
    </div>
  );
}