"use client";
import { useEffect, useState } from "react";
import FormMission from "@/components/FormMission/FormMission";
import Loader from "@/components/Loader";
import { sumAllMissions } from "@/utils/scores";
import SubmergedLogo from "@/public/images/logos/fll/seasons/Submerged.webp";
import MasterpieceLogo from "@/public/images/logos/fll/seasons/Masterpiece.png";
import UnearthedLogo from "@/public/images/logos/fll/seasons/Unearthed.webp";
import BioglowLogo from "@/public/images/logos/fll/seasons/bioglow_logo.png";
import { useParams } from "next/navigation";
import Timer from "@/components/FormMission/Timer";

interface SubMission {
  submission: string;
  points: number | number[];
  type: ["switch" | "range", ...(string | number | null)[]];
}

interface MissionType {
  id: string;
  name: string;
  mission: string;
  points: number | number[];
  equipaments: boolean;
  type: ["switch" | "range", ...(string | number | null)[]];
  image?: string;
  ["sub-mission"]?: SubMission[];
}

/** Cada resposta é sempre o ÍNDICE da opção escolhida (0, 1, 2...). */
type ResponseType = {
  [missionId: string]: {
    [questionIndex: number]: number;
  };
};

export default function Page() {
  const [missions, setMissions] = useState<MissionType[]>([]);
  const [responses, setResponses] = useState<ResponseType>({});
  const [loading, setLoading] = useState<boolean>(true);
  const params = useParams();
  const [background, setBackground] = useState<string>("#ffffff");

  const totalPoints = sumAllMissions(
    missions.filter((m) => m.id !== "GP"),
    responses,
  );

  const resetScores = () => {
    setResponses({});
  };

  useEffect(() => {
    if (!params.season) return;
    setLoading(true);

    fetch("/api/data/missions")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar as missões");
        return res.json();
      })
      .then((data) => {
        const seasonKey = Array.isArray(params.season)
          ? params.season[0]
          : params.season;
        const selected = seasonKey
          ? data[seasonKey] || data.submerged
          : data.submerged;
        setMissions(selected);
        setResponses({});

        switch (params.season) {
          case "bioglow":
            setBackground(BioglowLogo.src);
            break;
          case "unearthed":
            setBackground(UnearthedLogo.src);
            break;
          case "submerged":
            setBackground(SubmergedLogo.src);
            break;
          case "masterpiece":
            setBackground(MasterpieceLogo.src);
            break;
          default:
            setBackground("#ffffff");
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro:", error);
        setLoading(false);
      });
  }, [params.season]);

  const handleSelect = (
    missionId: string,
    questionIndex: number,
    value: number,
  ) => {
    setResponses((prev) => ({
      ...prev,
      [missionId]: {
        ...prev[missionId],
        [questionIndex]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <main className="flex flex-col items-center justify-center px-4 pb-16 pt-8 sm:px-6 lg:px-8 space-y-6 min-h-screen">
        <header className="sticky top-4 z-30 w-full max-w-4xl mx-auto animate-fade-in-down">
          <section className="flex flex-row items-center justify-between gap-4 bg-base-100/80 backdrop-blur px-8 py-4 rounded-box shadow-md border border-base-300">
            {/* IDENTIDADE */}
            <div className="flex flex-1 items-center gap-4 text-left">
              <img
                src={background}
                className="w-20 h-20 object-contain hidden sm:block"
                alt="Logo da temporada FLL"
              />

              <div className="flex flex-col">
                <h1 className="text-sm font-semibold text-base-content opacity-70">
                  FLL Score
                </h1>

                <span className="uppercase font-extrabold text-primary text-xl sm:text-3xl lg:text-4xl leading-tight">
                  {params.season}
                </span>
              </div>
            </div>

            {/* PONTUAÇÃO */}
            <aside
              aria-label="Pontuação total"
              className="flex flex-col items-center justify-center rounded-xl bg-base-200 px-6 py-3 min-w-[140px] shadow-inner"
            >
              <span className="text-xs uppercase font-bold tracking-wide opacity-70">
                Pontos
              </span>

              <strong className="text-3xl font-extrabold text-primary">
                {totalPoints}
              </strong>
            </aside>
          </section>
        </header>

        <Timer
          duration={150}
          endSound="/sounds/end.mp3"
          startSound="/sounds/start.mp3"
          showResetScore={true}
          onResetScore={resetScores}
          onFinish={() => {
            console.log("Tempo encerrado!");
          }}
          className="animate-fade-in-down max-w-4xl w-full"
        />

        <section
          aria-labelledby="info-no-equipment"
          className="w-full max-w-4xl mx-auto animate-fade-in-down"
        >
          <div className="flex flex-col sm:flex-row items-start gap-4 bg-info/10 backdrop-blur px-6 py-4 rounded-2xl border border-info/30 shadow-sm">
            <figure className="flex items-center gap-3">
              <img
                src="/images/icons/NoEquip.png"
                alt="Ícone de sem restrição de equipamento"
                className="w-12 h-12 object-contain"
              />

              <figcaption id="info-no-equipment" className="sr-only">
                Regra de missão sem restrição de equipamento
              </figcaption>
            </figure>

            <p className="text-sm text-base-content leading-relaxed">
              <strong className="font-semibold">
                Sem restrição de equipamento:
              </strong>{" "}
              Quando este símbolo aparece, aplica-se a seguinte regra:{" "}
              <em className="text-info font-medium">
                “Um modelo de missão não pode ganhar pontos se estiver tocando
                no equipamento no final da partida.”
              </em>
            </p>
          </div>
        </section>

        {/* Lista de Missões */}
        <FormMission
          missions={missions}
          imagesEnabled
          onSelect={handleSelect}
          responses={responses}
          className="animate-fade-in-down"
        />
      </main>
    </>
  );
}