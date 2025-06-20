"use client";
import { useEffect, useState } from "react";
import Loader from "./loader";

export default function TabelaEquipes({ codigoSala, cor }) {
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId;

    const fetchSala = async (showLoader = false) => {
      if (showLoader) setLoading(true);
      try {
        const res = await fetch(`/rooms/${codigoSala}/get`);
        if (!res.ok) throw new Error("Erro ao buscar sala");
        const data = await res.json();

        const equipesOrdenadas = (data.teams || []).sort((a, b) => {
          const maxA = Math.max(a.round1 || 0, a.round2 || 0, a.round3 || 0);
          const maxB = Math.max(b.round1 || 0, b.round2 || 0, b.round3 || 0);
          return maxB - maxA;
        });

        setEquipes(equipesOrdenadas);
      } catch (err) {
        console.error(err);
      } finally {
        if (showLoader) setLoading(false);
      }
    };

    if (codigoSala) {
      fetchSala(true);
      intervalId = setInterval(() => fetchSala(false), 10000);
    }

    return () => clearInterval(intervalId);
  }, [codigoSala]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <Loader />
      </div>
    );
  }

  const tableHeaderStyle = {
    backgroundColor: cor || "#d01117",
  };

  // Função para ajustar as notas
  const formatNota = (nota) => {
    if (nota === -1) return "0";
    if (nota === null || nota === undefined) return "-";
    return nota;
  };

  return (
    <div className="w-full overflow-x-auto px-2 py-4">
      <table
        className="min-w-full border-collapse bg-white shadow-md rounded"
        style={{ width: "100%" }}
      >
        <thead className="text-white" style={tableHeaderStyle}>
          <tr>
            <th className="text-center p-2">Posição</th>
            <th className="text-left p-2">Equipe</th>
            <th className="text-center p-2">Round 1</th>
            <th className="text-center p-2">Round 2</th>
            <th className="text-center p-2">Round 3</th>
          </tr>
        </thead>
        <tbody className="text-gray-800">
          {equipes.map((eq, idx) => (
            <tr
              key={idx}
              className={`border-b ${idx % 2 === 0 ? "bg-gray-100" : "bg-light"}`}
            >
              <td className="text-center p-2">{idx + 1}</td>
              <td className="text-left p-2 truncate">{eq.nome_equipe}</td>
              <td className="text-center p-2">{formatNota(eq.round1)}</td>
              <td className="text-center p-2">{formatNota(eq.round2)}</td>
              <td className="text-center p-2">{formatNota(eq.round3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}