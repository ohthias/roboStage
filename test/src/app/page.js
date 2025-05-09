"use client";

import { useEffect, useState } from "react";
import FormMission from "./components/form_mission"; 
import Navbar from "./components/navbar"; 
import { calculateTotalPoints } from "./lib/utils"; 
import style from "../../styles/Home.module.css";

export default function HomePage() {
  const [missions, setMissions] = useState([]);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    fetch("/data/missions.json")
      .then((res) => res.json())
      .then((data) => {
        setMissions(data.missions);
      });
  }, []);

  const handleSelect = (missionId, questionIndex, value) => {
    setResponses((prev) => ({
      ...prev,
      [missionId]: {
        ...prev[missionId],
        [questionIndex]: value,
      },
    }));
  };

  const totalPoints = calculateTotalPoints(missions, responses);

  return (
    <>
      <Navbar/>
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
        {/* Passando as missões e as respostas como props para o componente FormMission */}
        <FormMission
          missions={missions}
          responses={responses}
          onSelect={handleSelect}
        />
      </main>
    </>
  );
}
