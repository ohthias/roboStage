"use client";
import { useEffect, useState } from "react";
import styles from "../../../styles/Visitante.module.css";

export default function TabelaEquipes({ idSala }) {
  const [equipes, setEquipes] = useState([]);
  const [nomeSala, setNomeSala] = useState("");

  useEffect(() => {
    const fetchSala = async () => {
      try {
        const res = await fetch(`/api/sala/${idSala}`);
        if (!res.ok) throw new Error("Erro ao buscar sala");
        const data = await res.json();
        setNomeSala(data.nome || "Sala sem nome");

        // Ordena equipes pela maior nota entre os rounds
        const equipesOrdenadas = (data.equipes || []).sort((a, b) => {
          const maxA = Math.max(a.round1 || 0, a.round2 || 0, a.round3 || 0);
          const maxB = Math.max(b.round1 || 0, b.round2 || 0, b.round3 || 0);
          return maxB - maxA;
        });

        setEquipes(equipesOrdenadas);
      } catch (err) {
        console.error(err);
      }
    };

    if (idSala) fetchSala();
  }, [idSala]);

  return (
    <div className={styles.container}>
      <h2 className={styles.nomeSala}>{nomeSala}</h2>
      <table className={styles.tabela}>
        <thead className={styles.thead}>
          <tr className={styles.tr}>
            <th className={styles.th}>Posição</th>
            <th className={styles.th}>Equipe</th>
            <th className={styles.th}>Round 1</th>
            <th className={styles.th}>Round 2</th>
            <th className={styles.th}>Round 3</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {equipes.map((eq, idx) => (
            <tr key={idx} className={styles.tr}>
              <td className={styles.td}>{idx + 1}</td>
              <td className={styles.td}>{eq.nomeEquipe}</td>
              <td className={styles.td}>{eq.round1}</td>
              <td className={styles.td}>{eq.round2}</td>
              <td className={styles.td}>{eq.round3}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
