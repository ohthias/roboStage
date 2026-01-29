"use client";
import { useEffect, useState, useRef } from "react";
import FormMission from "@/components/FormMission/FormMission";
import Loader from "@/components/Loader";
import { Navbar } from "@/components/UI/Navbar";
import { sumAllMissions } from "@/utils/scores";
import { Footer } from "@/components/UI/Footer";
import SubmergedLogo from "@/public/images/logos/Submerged.webp";
import MasterpieceLogo from "@/public/images/logos/Masterpiece.png";
import {
  ArrowUturnLeftIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { useParams } from "next/navigation";
import { Pause, Play, TimerReset, Trash } from "lucide-react";

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

type ResponseType = {
  [missionId: string]: {
    [index: number]: string | number;
  };
};

export default function Page() {
  const [missions, setMissions] = useState<MissionType[]>([]);
  const [responses, setResponses] = useState<ResponseType>({});
  const [loading, setLoading] = useState<boolean>(true);
  const params = useParams();
  const [background, setBackground] = useState<string>("#ffffff");

  // Timer states
  const totalTime = 150; // 2 min 30 seg
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [timerRunning, setTimerRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sons
  const startSound = useRef<HTMLAudioElement | null>(null);
  const endSound = useRef<HTMLAudioElement | null>(null);

  const totalPoints = sumAllMissions(
    missions.filter((m) => m.id !== "GP"),
    responses
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      startSound.current = new Audio("/sounds/start.mp3");
      endSound.current = new Audio("/sounds/end.mp3");
    }
  }, []);

  const progress = (timeLeft / totalTime) * 100;
  const progressColor =
    timeLeft <= 10
      ? "bg-red-500"
      : timeLeft <= 30
      ? "bg-yellow-500"
      : "bg-primary";

  const startTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(totalTime);
      setHasStarted(false);
    }

    if (!timerRunning) {
      setTimerRunning(true);

      if (!hasStarted) {
        if (startSound.current) startSound.current.play();
        setHasStarted(true);
      }
    }
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(totalTime);
    setHasStarted(false);
  };
  const resetScores = () => {
    setResponses({});
  };

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
      if (endSound.current) endSound.current.play();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
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
          case "unearthed":
            setBackground(
              "https://static.wixstatic.com/media/381ad3_dca9f615988c479ca24a9b0b0e5bc1b0~mv2.gif"
            );
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
    value: string | number
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
      <Navbar />

      {/* Barra de progresso */}
      <div className="h-3 w-full bg-neutral sticky top-0 z-50">
        <div
          className={`h-full transition-all duration-300 ${progressColor}`}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>

      <main className="flex flex-col items-center justify-center px-4 pb-16 pt-8 sm:px-6 lg:px-8 bg-gradient-to-t from-base-200 to-base-300 space-y-6 min-h-screen">
        <nav className="animate-fade-in-down w-full max-w-4xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-base-200/70 backdrop-blur shadow-md border border-base-300">
          {/* TIMER */}
          <div className="flex items-center gap-3">
            <span
              id="timer"
              className="
                font-mono text-2xl sm:text-4xl
                px-4 py-2
                rounded-xl
                bg-base-200
                shadow-inner
                text-primary
              "
            >
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* CONTROLES */}
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <button
              className="btn btn-success btn-sm sm:btn-md gap-2"
              onClick={startTimer}
              disabled={timerRunning}
              title="Iniciar o timer"
            >
              <Play size={18} />
              <span className="hidden sm:inline">Iniciar</span>
            </button>

            <button
              className="btn btn-warning btn-sm sm:btn-md gap-2"
              onClick={pauseTimer}
              disabled={!timerRunning}
              title="Pausar o timer"
            >
              <Pause size={18} />
              <span className="hidden sm:inline">Pausar</span>
            </button>

            <button
              className="btn btn-outline btn-sm sm:btn-md gap-2"
              onClick={resetTimer}
              title="Resetar o tempo"
            >
              <TimerReset size={18} />
              <span className="hidden sm:inline">Tempo</span>
            </button>

            <div className="divider divider-horizontal mx-1 hidden sm:flex" />

            <button
              className="btn btn-error btn-outline btn-sm sm:btn-md gap-2"
              onClick={resetScores}
              title="Resetar os pontos"
            >
              <Trash size={18} />
              <span className="hidden sm:inline">Pontos</span>
            </button>
          </div>
        </nav>

        <header className="sticky top-4 z-30 w-full max-w-4xl mx-auto animate-fade-in-down">
          <section className="flex flex-row items-center justify-between gap-4 bg-base-100/80 backdrop-blur px-8 py-4 rounded-2xl shadow-md border border-base-300">
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

        <section
          aria-labelledby="info-no-equipment"
          className="w-full max-w-4xl mx-auto animate-fade-in-down"
        >
          <div
            className="flex flex-col sm:flex-row items-start gap-4 bg-info/10 backdrop-blur px-6 py-4 rounded-2xl border border-info/30 shadow-sm"
          >
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
          responses={responses}
          onSelect={handleSelect}
          className="animate-fade-in-down"
        />
      </main>
      <Footer />
    </>
  );
}
