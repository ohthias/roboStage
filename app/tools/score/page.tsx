"use client";
import { useEffect, useState, useRef } from "react";
import FormMission from "@/components/FormMission";
import { calculateTotalPoints } from "@/utils/calculateTotalPoints";
import Loader from "@/components/loader";
import { Navbar } from "@/components/Navbar";

type MissionType = {
  id: string;
  name: string;
  mission?: string;
  type: string[];
  points: number[] | number;
  "sub-mission"?: {
    submission: string;
    type: string[];
    points?: number | number[];
  }[];
};

type ResponseType = {
  [missionId: string]: {
    [index: number]: string | number;
  };
};

export default function Page() {
  const [missions, setMissions] = useState<MissionType[]>([]);
  const [responses, setResponses] = useState<ResponseType>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [hash, setHash] = useState<string | null>(null);
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

  let totalPoints = calculateTotalPoints(missions, responses);

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
    const handleHashChange = () => {
      const newHash = window.location.hash.replace("#", "");
      setHash(newHash || "submerged");
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (!hash) return;
    setLoading(true);

    fetch("/data/missions.json")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar as missões");
        return res.json();
      })
      .then((data) => {
        const selected = data[hash] || data.submerged;
        setMissions(selected);
        setResponses({});

        switch (hash) {
          case "unearthed":
            setBackground(
              "https://static.wixstatic.com/media/381ad3_dca9f615988c479ca24a9b0b0e5bc1b0~mv2.gif"
            );
            break;
          case "submerged":
            setBackground(
              "https://static.wixstatic.com/media/3a1650_a7d1c334024840d8b642e62d02ebdaaf~mv2.gif"
            );
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
  }, [hash]);

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

  if (loading || !hash) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      {/* Barra de progresso */}
      <div className="h-3 w-full bg-neutral">
        <div
          className={`h-full transition-all duration-300 ${progressColor}`}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>

      <main className="flex flex-col items-center justify-center px-4 pb-16 pt-8 sm:px-6 lg:px-8 bg-base-300">
        <style jsx global>{`
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: none;
            }
          }
          .animate-fade-in-down {
            animation: fadeInDown 250ms ease-in;
          }
        `}</style>

        {/* Controles do Timer */}
        <div className="animate-fade-in-down gap-2 sm:gap-4 w-full flex flex-wrap sm:flex-nowrap max-w-4xl justify-end mb-2">
          {/* Timer */}
          <span
            className="px-4 py-2 text-primary-content bg-primary/25 rounded-md text-center font-primary-content text-lg w-full sm:w-auto"
            id="timer"
          >
            {formatTime(timeLeft)}
          </span>

          {/* Botões */}
          <button
            className="btn btn-success flex-1 sm:flex-none min-w-[100px] cursor-pointer disabled:cursor-not-allowed"
            onClick={startTimer}
            disabled={timerRunning}
            title="Iniciar o timer"
          >
            <i className="fi fi-bs-play"></i>
            <span className="hidden sm:inline">Iniciar</span>
          </button>

          <button
            className="btn btn-warning flex-1 sm:flex-none min-w-[100px] cursor-pointer disabled:cursor-not-allowed"
            onClick={pauseTimer}
            disabled={!timerRunning}
            title="Pausar o timer"
          >
            <i className="fi fi-bs-pause"></i>
            <span className="hidden sm:inline">Pausar</span>
          </button>

          <button
            className="btn btn-error flex-1 sm:flex-none min-w-[100px]"
            onClick={resetTimer}
            title="Resetar o timer"
          >
            <i className="fi fi-bs-rotate-right"></i>
            <span className="hidden sm:inline">Resetar Tempo</span>
          </button>

          <button
            className="btn btn-info flex-1 sm:flex-none min-w-[100px]"
            onClick={resetScores}
            title="Resetar os pontos"
          >
            <i className="fi fi-bs-trash"></i>
            <span className="hidden sm:inline">Resetar Pontos</span>
          </button>
        </div>

        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative w-full max-w-4xl bg-base-100 px-8 py-4 rounded-md animate-fade-in-down mb-8">
          <div className="flex-1 flex justify-center sm:justify-start text-center sm:text-left items-center gap-4">
            <img src={background} className="w-24 h-24" alt="logo" />
            <div className="flex flex-col">
              <h1 className="text-md font-bold text-base-content">FLL Score</h1>
              <span className="uppercase font-bold text-secondary text-2xl sm:text-3xl lg:text-4xl">
                {hash && `${hash}`}
              </span>
            </div>
          </div>

          <div className="bg-base-100 flex flex-col items-center justify-center rounded-md shadow-md p-4 w-full sm:w-auto max-w-[200px]">
            <p className="text-sm font-bold text-base-content">Pontos</p>
            <h3 className="text-2xl font-bold text-secondary">{totalPoints}</h3>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col sm:flex-row items-center justify-start gap-4 relative w-full max-w-4xl bg-base-100 px-8 py-4 rounded-md animate-fade-in-down mb-8">
          <img
            src="https://www.flltournament.com/images/2025/NoEquip.png"
            className="w-16 h-16 mr-4"
          />
          <p className="text-base-content text-sm">
            <b>Sem restrição de equipamento:</b> Quando este símbolo aparece,
            aplica-se a seguinte regra:{" "}
            <i className="text-secondary">
              “Um modelo de missão não pode ganhar pontos se estiver tocando no
              equipamento no final da partida.”
            </i>
          </p>
        </div>

        {/* Lista de Missões */}
        <FormMission
          missions={missions}
          responses={responses}
          onSelect={handleSelect}
          className="animate-fade-in-down"
        />
      </main>
    </>
  );
}
