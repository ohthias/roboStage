import type { Metadata } from "next";
import { MissionGuide } from "@/components/competicoes/FLL/mission-guide/MissionGuide";

export const metadata: Metadata = {
  title: "Guia de Missões — BIOGLOW™ | RoboStage",
  description:
    "Explore as missões da BIOGLOW™ Founders Edition da FIRST LEGO League. Veja objetivos, mecanismos, pontuação e informações de cada missão.",
};

export default function MissionGuidePage() {
  return (
    <div className="bg-base-200/40">
      <MissionGuide />
    </div>
  );
}
