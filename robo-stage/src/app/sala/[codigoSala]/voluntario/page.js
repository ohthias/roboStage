"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FormMission from "@/app/components/form_mission";
import { calculateTotalPoints } from "@/app/lib/utils";
import styles from "../../../../../styles/Voluntario.module.css";
import Loader from "@/app/components/Loader";
import Navbar from "@/app/components/navbar";

export default function VoluntarioPage() {
  const params = useParams();
  const codigoSala = params?.codigoSala;
  const [equipes, setEquipes] = useState([]);
  const [equipeSelecionada, setEquipeSelecionada] = useState(null);
  const [roundSelecionado, setRoundSelecionado] = useState("round1");
  const [sala, setSala] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [missions, setMissions] = useState([]);
  const [pontuacaoTotal, setPontuacaoTotal] = useState(null);

  useEffect(() => {
    const fetchSala = async () => {
      try {
        const res = await fetch(`/api/sala/${codigoSala}`);
        if (!res.ok) throw new Error("Erro ao buscar sala");
        const data = await res.json();
        setSala(data);
        setEquipes(data.equipes || []);
      } catch (err) {
        console.error("Erro ao carregar sala:", err);
      } finally {
        setCarregando(false);
      }
    };

    const loadMissions = async () => {
      try {
        const res = await fetch("/data/missions.json");
        if (!res.ok) throw new Error("Erro ao carregar missões");
        const data = await res.json();
        setMissions(data.missions || []); // Garantir que seja um array
      } catch (err) {
        console.error("Erro ao carregar missões:", err);
      }
    };

    if (codigoSala) {
      fetchSala();
      loadMissions();
    }
  }, [codigoSala]);

  const handleSubmit = async () => {
    if (!equipeSelecionada || !roundSelecionado) return;

    const pontos = calculateTotalPoints(missions, equipeSelecionada);
    setPontuacaoTotal(pontos);

    const updatedEquipe = {
      ...equipeAtual,
      [roundSelecionado]: pontos,
    };

    setCarregando(true);
    try {
      console.log("Atualizando equipe:", updatedEquipe);
      const res = await fetch(`/api/sala/${codigoSala}/atualizarEquipe`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEquipe),
      });

      if (res.ok) {
        alert("Avaliação salva com sucesso!");
        setCarregando(false);
      } else {
        alert("Erro ao salvar avaliação.");
        setCarregando(false);
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      alert("Erro ao atualizar equipe.");
    }
  };

  if (carregando) {
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

  const equipeOptions = equipes.map((eq, index) => (
    <option key={eq.nomeEquipe || index} value={eq.nomeEquipe}>
      {eq.nomeEquipe}
    </option>
  ));

  const equipeAtual = equipes.find(
    (eq) => eq.nomeEquipe === equipeSelecionada?.nomeEquipe
  );

  return (
    <>
      <Navbar mode="deafult" />
      <div className={styles.container}>
        <h2>Avaliar Equipe</h2>

        <div className={styles.selects}>
          <div className={styles.roundSelector}>
            <label className={styles.label}>Equipe:</label>
            <select
              onChange={(e) => {
                const equipe = equipes.find(
                  (eq) => eq.nomeEquipe === e.target.value
                );
                setEquipeSelecionada(equipe);
                setPontuacaoTotal(null);
              }}
              defaultValue=""
              className={styles.select}
            >
              <option disabled value="">
                Selecione
              </option>
              {equipeOptions}
            </select>
          </div>

          <div className={styles.roundSelector}>
            <label className={styles.label}>Round:</label>
            <select
              onChange={(e) => setRoundSelecionado(e.target.value)}
              value={roundSelecionado}
              className={styles.select}
            >
              <option value="round1">Round 1</option>
              <option value="round2">Round 2</option>
              <option value="round3">Round 3</option>
            </select>
          </div>
          <button onClick={handleSubmit} className={styles.botaoEnviar}>
            Enviar Avaliação
          </button>

          {equipeSelecionada && (
            <p className={styles.pontuacao}>
              <strong>{pontuacaoTotal}</strong>
            </p>
          )}
        </div>

        <div className={styles.formBox}>
          {equipeAtual && missions.length > 0 && (
            <>
              <FormMission
                missions={missions}
                responses={equipeSelecionada}
                onSelect={(missionId, index, value) => {
                  const updatedEquipe = { ...equipeSelecionada };
                  if (!updatedEquipe[missionId]) updatedEquipe[missionId] = [];
                  updatedEquipe[missionId][index] = value;
                  setEquipeSelecionada(updatedEquipe);
                }}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
