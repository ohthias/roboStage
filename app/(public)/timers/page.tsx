"use client";

import React, { useState } from "react";
import { AppMode } from "@/types/TimersType";
import { MenuCard } from "@/components/Timers/MenuCard";
import { RobotGame } from "./views/RobotGame";
import { JudgingRoom } from "./views/JudgingRoom";
import { CustomTimer } from "./views/CustomTimer";
import { Trophy, BookOpen, Clock } from "lucide-react";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import Header from "@/components/UI/Header";

const TimersPager: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.MENU);

  if (mode !== AppMode.MENU) {
    return (
      <div className="min-h-[100dvh]">
        {mode === AppMode.ROBOT_GAME && (
          <div
            className="min-h-[100dvh]"
            style={{
              backgroundImage: "url('/images/background_uneartherd.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <RobotGame setMode={setMode} />
          </div>
        )}

        {mode === AppMode.JUDGING && (
          <div className="min-h-[100dvh] bg-base-200/60">
            <JudgingRoom setMode={setMode} />
          </div>
        )}

        {mode === AppMode.CUSTOM && (
          <div className="min-h-[100dvh] bg-base-200/60">
            <CustomTimer setMode={setMode} />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-base-100 text-base-content max-w-6xl mx-auto px-4 py-12">
       <Header
          type="Timers"
          name="Controle o tempo"
          highlight="do treino à competição"
          description="Timers pensados para a realidade das equipes: rodada do robô, apresentação para juízes e treinos de pitch. Simples, direto e no ritmo da FLL."
        />

        {/* FEATURES */}
        <section className="mx-auto px-4 my-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article>
              <MenuCard
                title="Round do Robô"
                description="Timer de rodada oficial para competições FLL, com contagem regressiva, alertas sonoros e visuais."
                icon={Trophy}
                color="primary"
                onClick={() => setMode(AppMode.ROBOT_GAME)}
              />
            </article>

            <article>
              <MenuCard
                title="Sala de Avaliação"
                description="Controle completo do tempo de Entrada, Apresentação, Perguntas e Feedback."
                icon={BookOpen}
                color="secondary"
                onClick={() => setMode(AppMode.JUDGING)}
              />
            </article>

            <article>
              <MenuCard
                title="Timer Ajustável"
                description="Timer personalizável para treinos, apresentações ou qualquer outra necessidade."
                icon={Clock}
                color="success"
                onClick={() => setMode(AppMode.CUSTOM)}
              />
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default TimersPager;
