"use client";
import { useEffect, useState } from "react";

export default function Equipes({ idSala }) {
  const [equipes, setEquipes] = useState([]);
  const [nomeEquipe, setNomeEquipe] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const carregarEquipes = async () => {
      try {
        const res = await fetch(`/api/sala/${idSala}`);
        const data = await res.json();
        setEquipes(data.equipes || []);
      } catch (error) {
        console.error("Erro ao carregar equipes:", error);
      }
    };

    carregarEquipes();
  }, [idSala]);

  const adicionarEquipe = async () => {
    if (!nomeEquipe.trim()) return;

    const novaEquipe = {
      nomeEquipe,
      round1: 0,
      round2: 0,
      round3: 0,
    };

    const novasEquipes = [...equipes, novaEquipe];
    setEquipes(novasEquipes);
    setNomeEquipe("");
    setCarregando(true);

    try {
      const res = await fetch(`/api/sala/${idSala}/equipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipes: novasEquipes }),
      });

      if (!res.ok) throw new Error("Erro ao salvar equipes");
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div>
      <h2>Equipes</h2>
      <div>
        <input
          type="text"
          placeholder="Nome da Equipe"
          value={nomeEquipe}
          onChange={(e) => setNomeEquipe(e.target.value)}
        />
        <button onClick={adicionarEquipe} disabled={carregando}>
          {carregando ? "Salvando..." : "Adicionar Equipe"}
        </button>
      </div>

      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Equipe</th>
            <th>Round 1</th>
            <th>Round 2</th>
            <th>Round 3</th>
          </tr>
        </thead>
        <tbody>
          {equipes.map((eq, idx) => (
            <tr key={idx}>
              <td>{eq.nomeEquipe}</td>
              <td>{eq.round1}</td>
              <td>{eq.round2}</td>
              <td>{eq.round3}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
