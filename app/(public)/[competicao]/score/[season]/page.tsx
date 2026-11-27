"use client";
import { asset } from "@/lib/assets";
import { useEffect, useState } from "react";
import FormMission from "@/features/scoring/components/FormMission";
import Loader from "@/components/stage/core/Loader";
import { sumAllMissions } from "@/features/scoring/lib/scores";
import SubmergedLogo from "@/public/images/seasons/fll/Submerged.webp";
import MasterpieceLogo from "@/public/images/seasons/fll/Masterpiece.png";
import UnearthedLogo from "@/public/images/seasons/fll/Unearthed.webp";
import BioglowLogo from "@/public/images/seasons/fll/bioglow_logo.png";
import { useParams } from "next/navigation";
import Image, { type StaticImageData } from "next/image";
import { loadSeasonMissions } from "@/lib/data/missions-client";
import Timer from "@/features/scoring/components/Timer";
import { Callout, ScoreBar, Starburst } from "@/components/stage";

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

const SEASON_LOGOS: Record<string, StaticImageData> = {
  bioglow: BioglowLogo,
  unearthed: UnearthedLogo,
  submerged: SubmergedLogo,
  masterpiece: MasterpieceLogo,
};

export default function Page() {
  const [missions, setMissions] = useState<MissionType[]>([]);
  const [responses, setResponses] = useState<ResponseType>({});
  const [loading, setLoading] = useState<boolean>(true);
  const params = useParams();

  const totalPoints = sumAllMissions(
    missions.filter((m) => m.id !== "GP"),
    responses,
  );

  const resetScores = () => {
    setResponses({});
  };

  const seasonKey = Array.isArray(params.season) ? params.season[0] : params.season;
  const seasonLogo = seasonKey ? SEASON_LOGOS[seasonKey] : undefined;

  useEffect(() => {
    if (!seasonKey) return;
    setLoading(true);

    loadSeasonMissions<MissionType>(seasonKey)
      .then(async (list) =>
        list.length ? list : loadSeasonMissions<MissionType>("submerged"),
      )
      .then((selected) => {
        setMissions(selected);
        setResponses({});

        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro:", error);
        setLoading(false);
      });
  }, [seasonKey]);

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
      <div className="flex min-h-screen items-center justify-center bg-base-100">
        <Loader />
      </div>
    );
  }

  const seasonName = String(seasonKey ?? "").toUpperCase();

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-10 pt-8">
      <header className="stage-paper relative isolate overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]">
        <Starburst size={64} tone="accent" motion="spin" className="pointer-events-none absolute right-6 top-6 hidden md:inline-grid" />
        <div className="flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:px-10">
          {seasonLogo && (
            <div className="stage-dots grid size-28 shrink-0 place-items-center rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-200/60 [background-size:14px_14px]">
              <Image src={seasonLogo} className="h-20 w-20 object-contain" alt={`Logo da temporada ${seasonName}`} sizes="80px" priority />
            </div>
          )}
          <div className="min-w-0">
            <p className="stage-kicker text-base-content/45">/ PONTUADOR FLL</p>
            <h1 className="stage-display mt-2 text-4xl sm:text-5xl">
              <span className="inline-block -rotate-1 bg-primary px-3 py-1 italic text-primary-content">{seasonName}</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-base-content/65 sm:text-base">
              Marque o estado do tapete ao fim da rodada. A pontuação soma sozinha, missão por missão.
            </p>
          </div>
        </div>
      </header>

      <Timer
        duration={150}
        endSound={asset("/audio/end.mp3")}
        startSound={asset("/audio/start.mp3")}
      />

      <section aria-labelledby="info-no-equipment" className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <Callout type="rule" title="Sem restrição de equipamento">
          <div className="flex items-start gap-3">
            <Image
              src={asset("/images/icons/NoEquip.png")}
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0 object-contain"
            />
            <p id="info-no-equipment">
              Quando este símbolo aparece:{" "}
              <em>“Um modelo de missão não pode ganhar pontos se estiver tocando no equipamento no final da partida.”</em>
            </p>
          </div>
        </Callout>
        <Callout type="warning" title="Vale só para aquela missão">
          Se o mesmo modelo for usado em outra missão sem a restrição, ele pontua como de costume. Cada modelo é avaliado
          dentro da sua missão.
        </Callout>
      </section>

      <FormMission missions={missions} imagesEnabled onSelect={handleSelect} responses={responses} className="px-4" />

      <div className="sticky bottom-4 z-20 pt-4 p">
        <ScoreBar total={totalPoints} onReset={resetScores} className="mx-auto max-w-3xl" />
      </div>
    </main>
  );
}
