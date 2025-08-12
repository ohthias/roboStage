"use client";
import { useEffect, useState } from "react";
import FormMission from "@/components/FormMission";
import { calculateTotalPoints } from "@/utils/calculateTotalPoints";
import Loader from "@/components/loader";
import { Navbar } from "@/components/Navbar";

// Tipos
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

  const totalPoints = calculateTotalPoints(missions, responses);

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
      <main
        className="flex flex-col items-center justify-center gap-8 px-4 py-16 sm:px-6 lg:px-8 bg-base-300"
      >
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative w-full max-w-4xl bg-base-100 px-8 py-4 rounded-md animate-fade-in-down">
          <div className="flex-1 flex justify-center sm:justify-start text-center sm:text-left items-center gap-4">
            <img src={background} className="w-24 h-24" alt="logo" />
            <div className="flex flex-col">
              <h1
                className="text-md font-bold text-base-content"
                id="pontuador"
              >
                FLL Score{" "}
              </h1>
              <span className="uppercase font-bold text-secondary text-2xl sm:text-3xl lg:text-4xl">{hash && `${hash}`}</span>
            </div>
          </div>

          <div className="bg-base-100 flex flex-col items-center justify-center rounded-md shadow-md p-4 w-full sm:w-auto max-w-[200px]">
            <p className="text-sm font-bold text-base-content">Pontos</p>
            <h3 className="text-2xl font-bold text-secondary">{totalPoints}</h3>
          </div>
        </div>

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
