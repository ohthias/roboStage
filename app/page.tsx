"use client";
import { useState, useEffect } from "react";
import FormMission from "@/components/FormMission";
import Loader from "@/components/loader";
import { calculateTotalPoints } from "@/utils/calculateTotalPoints";
import Banner from "@/components/Banner";
import Hero from "@/components/hero";
import Footer from "@/components/ui/Footer";

type MissionType = {
  id: string;
  name: string;
  mission?: string;
  type: string[];
  points: number[] | number;
  "sub-mission"?: {
    submission: string;
    type: string[];
  }[];
};

type ResponseType = {
  [missionId: string]: {
    [index: number]: string | number;
  };
};

export default function Home() {
  const [missions, setMissions] = useState<MissionType[]>([]);
  const [responses, setResponses] = useState<ResponseType>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/data/missions.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao buscar as missões");
        }
        return res.json();
      })
      .then((data) => {
        setMissions(data.missions);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro:", error);
        setLoading(false);
      });
  }, []);

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

  if (loading) {
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
          backdropFilter: "blur(5px)",
        }}
      >
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Hero />
      <Banner />
      <main className="flex flex-col items-center justify-center gap-8 px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4 relative my-4 w-full max-w-4xl">
          <div className="flex-1 flex justify-center">
            <h1 className="text-4xl font-bold text-primary sm:text-5xl text-center" id="pontuador">
              Pontuador
            </h1>
          </div>
          <div className="bg-light-smoke flex flex-col items-center justify-center rounded-md shadow-md p-4">
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
      <Footer />
    </>
  );
}
