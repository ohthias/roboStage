"use client";
import { useEffect, useState } from "react";
import styles from "./style/Equipes.module.css";
import Mensage from "./Mensage";

export default function Equipes({ codigoSala }) {
  const [equipes, setEquipes] = useState([]);
  const [nome_equipe, setNomeEquipe] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<"sucesso" | "erro" | "aviso" | "">("");

  useEffect(() => {
    const carregarEquipes = async () => {
      try {
        const res = await fetch(`/rooms/${codigoSala}/get/`);
        const data = await res.json();
        setEquipes(data.teams || []);
      } catch (error) {
        console.error("Erro ao carregar equipes:", error);
        setMensagem("Erro ao carregar as equipes.");
        setTipoMensagem("erro");
      }
    };

    carregarEquipes();
  }, [codigoSala]);

  const adicionarEquipe = async () => {
    if (!nome_equipe.trim()) {
      setMensagem("Digite o nome da equipe!");
      setTipoMensagem("aviso");
      return;
    }

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

      setMensagem("Equipe salva com sucesso!");
      setTipoMensagem("sucesso");
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao salvar equipe!");
      setTipoMensagem("erro");
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

      setMensagem("Equipe removida com sucesso.");
      setTipoMensagem("sucesso");
    } catch (error) {
      console.error("Erro ao remover equipe:", error);
      setMensagem("Erro ao remover equipe.");
      setTipoMensagem("erro");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <>
      <Mensage
        tipo={tipoMensagem}
        mensagem={mensagem}
        onClose={() => {
          setMensagem("");
          setTipoMensagem("");
        }}
      />
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
          <button
            onClick={adicionarEquipe}
            disabled={carregando}
            className={styles.btn__equipes}
          >
            {carregando ? "Salvando..." : "Adicionar Equipe"}
          </button>
        </div>

        <table
          border="1"
          cellPadding="8"
          cellSpacing="0"
          className={styles.table__equipes}
        >
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
                  <button
                    onClick={() => removerEquipe(idx)}
                    disabled={carregando}
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
