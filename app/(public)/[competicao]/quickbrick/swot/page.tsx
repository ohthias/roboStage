"use client";
import { StrategyBoard } from "@/components/QuickBrick/SWOT-template/StrategyBoard";
import HeaderTool from "@/components/QuickBrick/HeaderTool";
import { Grid2X2 } from "lucide-react";

export default function SWOTPage() {
  return (
    <>
      <div className="px-4 md:px-8 ">
        <HeaderTool
          NameTool="Matriz SWOT"
          DescriptionTool="Organize estrategicamente as missões da sua equipe distribuindo-as nos quadrantes da matriz Forças, Fraquezas, Oportunidades e Ameaças."
          IconTool={Grid2X2}
        />

        <StrategyBoard />
      </div>
    </>
  );
}
