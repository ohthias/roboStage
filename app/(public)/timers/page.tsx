"use client";
import React, { useState } from "react";
import { AppMode } from "@/types/TimersType";
import { MenuCard } from "@/components/Timers/MenuCard";
import { RobotGame } from "./views/RobotGame";
import { JudgingRoom } from "./views/JudgingRoom";
import { CustomTimer } from "./views/CustomTimer";
import { Trophy, BookOpen, Mic } from "lucide-react";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";

const TimersPager: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.MENU);

  const renderContent = () => {
    switch (mode) {
      case AppMode.ROBOT_GAME:
        return <RobotGame setMode={setMode} />;
      case AppMode.JUDGING:
        return <JudgingRoom setMode={setMode} />;
      case AppMode.CUSTOM:
        return <CustomTimer setMode={setMode} />;
      default:
        return (
          <>
            <Navbar />
            <div className="min-h-[100dvh] flex flex-col items-center justify-start p-4 sm:p-6 animate-in fade-in duration-700 overflow-y-auto">
              <div className="text-center mb-8 sm:mb-12 mt-4 sm:mt-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <h1 className="text-3xl sm:text-3xl font-bold text-base-content">
                    TIMERs
                  </h1>
                </div>
                <p className="text-base-content/75 text-sm sm:text-base max-w-lg mx-auto font-medium px-2">
                  Ferramenta de cronometragem para treinos e competições.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-6xl px-2 sm:px-4">
                <MenuCard
                  title="Round do Robô"
                  description="Timer oficial de 2:30 com alertas sonoros para End Game."
                  icon={Trophy}
                  color="primary"
                  onClick={() => setMode(AppMode.ROBOT_GAME)}
                />

                <MenuCard
                  title="Sala de Avaliação"
                  description="Fluxo completo: Entrada, Apresentação, Q&A e Feedback."
                  icon={BookOpen}
                  color="secondary"
                  onClick={() => setMode(AppMode.JUDGING)}
                />

                <MenuCard
                  title="Apresentação"
                  description="Timer simples configurável para treinos de pitch."
                  icon={Mic}
                  color="accent"
                  onClick={() => setMode(AppMode.CUSTOM)}
                />
              </div>
            </div>
            <Footer />
          </>
        );
    }
  };

  return (
    <>
      {mode === AppMode.MENU && renderContent()}

      {mode === AppMode.ROBOT_GAME && (
        <div className="min-h-[100dvh]" style={{backgroundImage: "url('/images/background_uneartherd.png')", backgroundSize: 'cover', backgroundPosition: 'center'}}>
          {renderContent()}
        </div>
      )}

      {mode === AppMode.JUDGING && (
        <div className="min-h-[100dvh] bg-secondary/60 text-base-content">
          {renderContent()}
        </div>
      )}

      {mode === AppMode.CUSTOM && (
        <div className="min-h-[100dvh] bg-gradient-to-b from-purple-900/60 to-white text-base-content">
          {renderContent()}
        </div>
      )}
    </>
  );
};

export default TimersPager;
