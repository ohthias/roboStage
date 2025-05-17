"use client";
import { useEffect, useState } from "react";
import styles from "./style/Equipes.module.css";

export default function Equipes({ codigoSala }) {
  const [equipes, setEquipes] = useState([]);
  const [nome_equipe, setNomeEquipe] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const carregarEquipes = async () => {
      try {
        const res = await fetch(`/rooms/${codigoSala}/get/`);
        const data = await res.json();
        console.log(data.teams)
        setEquipes(data.teams || []);
      } catch (error) {
        console.error("Erro ao carregar equipes:", error);
      }
    };

    carregarEquipes();
  }, [codigoSala]);

  const adicionarEquipe = async () => {
    if (!nome_equipe.trim()) return;

    const novaEquipe = {
      nome_equipe,
      round1: 0,
      round2: 0,
      round3: 0,
    };

    const novasEquipes = [...equipes, novaEquipe];
    setEquipes(novasEquipes);
    setNomeEquipe("");
    setCarregando(true);

    try {
      const res = await fetch(`/rooms/${codigoSala}/post/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: novasEquipes }),
      });

      if (!res.ok) throw new Error("Erro ao salvar equipes");
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  const removerEquipe = async (index) => {
    const novasEquipes = equipes.filter((_, i) => i !== index);
    setEquipes(novasEquipes);
    setCarregando(true);

    try {
      const res = await fetch(`/rooms/${codigoSala}/post/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: novasEquipes }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar equipes");
    } catch (error) {
      console.error("Erro ao remover equipe:", error);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={styles.container__equipes}>
      <h2>Equipes</h2>
      <div className={styles.input__container}>
        <input
          type="text"
          value={nome_equipe}
          placeholder="Nome da Equipe"
          className={styles.input__equipes}
          onChange={(e) => setNomeEquipe(e.target.value)}
        />
        <button onClick={adicionarEquipe} disabled={carregando} className={styles.btn__equipes}>
          {carregando ? "Salvando..." : "Adicionar Equipe"}
        </button>
      </div>

      <table border="1" cellPadding="8" cellSpacing="0" className={styles.table__equipes}>
        <thead className={styles.thead}>
          <tr className={styles.tr}>
            <th className={styles.th}>Nº</th>
            <th className={styles.th}>Equipe</th>
            <th className={styles.th}>Ações</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {equipes.map((eq, idx) => (
            <tr key={idx} className={styles.tr}>
              <td className={styles.td}>{idx + 1}</td>
              <td className={styles.td}>{eq.nome_equipe}</td>
              <td className={styles.td}>
                <button onClick={() => removerEquipe(idx)} disabled={carregando}>
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
