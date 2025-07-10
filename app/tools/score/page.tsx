"use client";
import { useEffect, useState } from "react";
import FormMission from "@/components/FormMission";
import { calculateTotalPoints } from "@/utils/calculateTotalPoints";
import Hero from "@/components/hero";

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
    if (typeof window !== "undefined") {
      const currentHash = window.location.hash.replace("#", "");
      setHash(currentHash || "submerged");
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const newHash = window.location.hash.replace("#", "");
      setHash(newHash || "submerged");
    };

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

        switch (hash) {
          case "uneartherd":
            setBackground("url('/images/background_uneartherd.png') center/cover");
            break;
          case "submerged":
            setBackground("url('/images/background_submerged.png') center/cover");
            break;
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
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Carregando...</p>
      </main>
    );
  }

  return (
    <>
    <Hero />    
    <main className="flex flex-col items-center justify-center gap-8 px-4 py-16 sm:px-6 lg:px-8" style={{ background:  background }}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative w-full max-w-4xl bg-white px-8 py-4 rounded-md">
        <div className="flex-1 flex justify-center sm:justify-start text-center sm:text-left">
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary"
            id="pontuador"
          >
            FLL Score <span className="capitalize">{hash && `- ${hash}`}</span>
          </h1>
        </div>

        <div className="bg-light-smoke flex flex-col items-center justify-center rounded-md shadow-md p-4 w-full sm:w-auto max-w-[200px]">
          <p className="text-sm font-bold text-black">Pontos</p>
          <h3 className="text-2xl font-bold text-primary">{totalPoints}</h3>
        </div>
      </div>

      <FormMission
        missions={missions}
        responses={responses}
        onSelect={handleSelect}
      />
    </main>
    </>
  );
}
