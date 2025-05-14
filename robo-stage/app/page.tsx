"use client";
import { useState, useEffect } from "react";
import FormMission from "@/components/FormMission";
import Loader from "@/components/loader";
import style from "@/components/style/Home.module.css";
import { calculateTotalPoints } from "@/utils/calculateTotalPoints";

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

  const handleSelect = (missionId: string, questionIndex: number, value: string | number) => {
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
      <div className={style.container__banner}>
        <div className={style.banner}>
          <div className={style.banner__space}>
            <h1 className={style.banner__title}>RoboStage</h1>
            <p className={style.banner__text}>
              Uma plataforma de avaliação de robôs, onde você pode criar e
              avaliar missões para os robôs.
            </p>
          </div>
          <hr className={style.banner__hr} />
          <div>
            <img
              src="https://static.wixstatic.com/media/3a1650_a7d1c334024840d8b642e62d02ebdaaf~mv2.gif"
              alt="Banner"
              className={style.banner__img}
            />
          </div>
        </div>
      </div>
      <main>
        <div className={style.container__title}>
          <div className={style.container__title__contents}>
            <h1 className={style.title}>Score</h1>
            <div className={style.poins__container}>
              <p className={style.poins__text}>Pontos</p>
              <h3 className={style.poins__score}>{totalPoints}</h3>
            </div>
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