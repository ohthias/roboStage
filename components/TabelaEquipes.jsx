"use client";
import { useEffect, useState } from "react";
import styles from "@/style/Visitante.module.css";
import Loader from "./loader";

export default function TabelaEquipes({ codigoSala, cor }) {
  const [equipes, setEquipes] = useState([]);
  const [nomeSala, setNomeSala] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId;

    const fetchSala = async (showLoader = false) => {
      if (showLoader) setLoading(true);
      try {
        const res = await fetch(`/rooms/${codigoSala}/get`);
        if (!res.ok) throw new Error("Erro ao buscar sala");
        const data = await res.json();
        setNomeSala(data.nome || "Sala sem nome");

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
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <Loader />
      </div>
    );
  }

  const isVisitante = typeof window !== "undefined" && window.location.pathname.endsWith("/visitante");
  const tableStyle = isVisitante
    ? { backgroundColor: cor || "#d01117" }
    : { backgroundColor: "#d01117"};
  console.log(tableStyle)
  return (
    <div className={styles.container}>
      <table
        className="w-full border-collapse bg-gray-50"
        style={tableStyle}
      >
        <thead className="text-white" style={tableStyle}>
          <tr className="border-b border-gray-300">
            <th className="text-center p-2">Posição</th>
            <th className="text-left p-2">Equipe</th>
            <th className="text-center p-2">Round 1</th>
            <th className="text-center p-2">Round 2</th>
            <th className="text-center p-2">Round 3</th>
          </tr>
        </thead>
        <tbody>
          {equipes.map((eq, idx) => (
            <tr
              key={idx}
              className={
                idx % 2 === 0
                  ? "bg-gray-100 border-b border-gray-300"
                  : "bg-light border-b border-gray-300"
              }
            >
              <td className="text-center p-2">{idx + 1}</td>
              <td className="text-left p-2">{eq.nome_equipe}</td>
              <td className="text-center p-2">{eq.round1}</td>
              <td className="text-center p-2">{eq.round2}</td>
              <td className="text-center p-2">{eq.round3}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
