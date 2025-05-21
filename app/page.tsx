"use client";
import { useState, useEffect } from "react";
import FormMission from "@/components/FormMission";
import Loader from "@/components/loader";
import style from "@/components/style/Home.module.css";
import { calculateTotalPoints } from "@/utils/calculateTotalPoints";
import Banner from "@/components/Banner";

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
          backgroundColor: "rgba(255, 255, 255, 0.8)",
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

  return (
    <>
      <Banner />
      <main className="flex flex-col items-center justify-center gap-8 px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4 relative w-[calc(100%-164px)] my-8">
          <div className="bg-white flex flex-col items-center justify-center rounded-md shadow-md p-4 absolute top-0 left-0 transform -translate-x-0 -translate-y-1/4">
            <p className="text-sm font-bold text-black">Pontos</p>
            <h3 className="text-2xl font-bold text-primary">{totalPoints}</h3>
          </div>
          <h1 className="text-4xl font-bold text-primary sm:text-5xl">Pontuador</h1>
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
