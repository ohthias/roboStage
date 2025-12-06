"use client";
import React, {
  useState,
  useEffect,
} from "react";
import { Navbar } from "@/components/Navbar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Footer } from "@/components/ui/Footer";
import RobotTrackCanvas from "@/components/QuickBrick/RobotTrack/RobotTrack";

const RobotTrack: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth <= 720);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  if (isMobile) {
    return (
      <div className="flex flex-col">
        <Navbar />
        <div className="px-4 md:px-8 flex flex-col items-center w-full text-center h-screen justify-center">
          <img src="/progress.svg" alt="Icone do robô" />
          <h1 className="text-2xl font-bold my-4 text-primary">
            Ops! Ferramenta não está disponível no celular
          </h1>
          <p className="text-sm mb-2 text-base-content px-5">
            O QuickBrick Studio é um conjunto de ferramentas que ajuda sua
            equipe a criar estratégias eficientes para o robô durante sua
            jornada no FIRST LEGO League Challenge. Basta selecionar uma das
            ferramentas disponíveis e aproveitá-las.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start justify-center w-full">
      <Navbar />
      <div className="px-4 md:px-8">
        <Breadcrumbs />
      </div>
      <div className="flex flex-col items-center w-full">
        <RobotTrackCanvas />
      </div>
      <Footer />
    </div>
  )
}

export default RobotTrack;
