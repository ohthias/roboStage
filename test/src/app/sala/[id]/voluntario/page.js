"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FormMission from "@/app/components/form_mission";
import styles from "../../../../../styles/Voluntario.module.css";

export default function VoluntarioPage({ idSala }) {
  const params = useParams();
  const id = params?.id;
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
        const res = await fetch(`/api/sala/${id}`);
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
        setMissions(data.missions);
      } catch (err) {
        console.error("Erro ao carregar missões:", err);
      }
    };

    if (id) fetchSala();
    loadMissions();
  }, [id]);

  const calcularPontuacaoTotal = () => {
    let total = 0;
    if (!equipeSelecionada) return total;

    missions.forEach((mission) => {
      const respostas = equipeSelecionada[mission.id] || [];

      // Missão principal
      if (mission.type?.[0] === "switch" && respostas[0] === "Sim") {
        total += mission.points || 0;
      } else if (mission.type?.[0] === "range") {
        total += Number(respostas[0] || 0);
      }

      // Submissões
      if (Array.isArray(mission["sub-mission"])) {
        mission["sub-mission"].forEach((sub, i) => {
          const respostaSub = respostas[i + 1];
          if (sub.type?.[0] === "switch" && respostaSub === "Sim") {
            total += sub.points || 0;
          } else if (sub.type?.[0] === "range") {
            total += Number(respostaSub || 0);
          }
        });
      }
    });

    return total;
  };

  const handleSubmit = async () => {
    if (!equipeSelecionada || !roundSelecionado) return;

    const pontos = calcularPontuacaoTotal();
    setPontuacaoTotal(pontos);

    const updatedEquipe = {
      ...equipeSelecionada,
      [roundSelecionado]: pontos,
    };

    const res = await fetch(`/api/sala/${idSala}/atualizarEquipe`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedEquipe),
    });

    if (res.ok) {
      alert("Avaliação salva com sucesso!");
    } else {
      alert("Erro ao salvar avaliação.");
    }
  };

  const equipeOptions = equipes.map((eq, index) => (
    <option key={eq._id || index} value={eq._id}>
      {eq.nomeEquipe}
    </option>
  ));

  const equipeAtual = equipes.find((eq) => eq._id === equipeSelecionada?._id);

  return (
    <div className={styles.container}>
      <h2>Avaliar Equipe</h2>

      <div className={styles.selects}>
        <label>Equipe:</label>
        <select
          onChange={(e) => {
            const equipe = equipes.find((eq) => eq._id === e.target.value);
            setEquipeSelecionada(equipe);
            setPontuacaoTotal(null); // Reset ao trocar equipe
          }}
          defaultValue=""
        >
          <option disabled value="">
            Selecione
          </option>
          {equipeOptions}
        </select>

        <label>Round:</label>
        <select
          onChange={(e) => setRoundSelecionado(e.target.value)}
          value={roundSelecionado}
        >
          <option value="round1">Round 1</option>
          <option value="round2">Round 2</option>
          <option value="round3">Round 3</option>
        </select>
      </div>

      {equipeAtual && missions.length > 0 && (
        <>
          <FormMission
            missions={missions}
            responses={equipeSelecionada}
            onSelect={(missionId, index, value) => {
              const updatedEquipe = { ...equipeSelecionada };
              if (!updatedEquipe[missionId]) updatedEquipe[missionId] = {};
              updatedEquipe[missionId][index] = value;
              setEquipeSelecionada(updatedEquipe);
            }}
          />

          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <button
              onClick={handleSubmit}
              className={styles.botaoEnviar}
            >
              Enviar Avaliação
            </button>

            {pontuacaoTotal !== null && (
              <p className={styles.pontuacao}>
                🏆 Pontuação Total: <strong>{pontuacaoTotal} pontos</strong>
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
