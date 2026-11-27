"use client";
import HeaderTool from "@/features/quickbrick/shared/components/HeaderTool";
import { SWOTCanvasDefault } from "@/features/quickbrick/swot/components/SWOTCanvasDefault";
import { Grid2X2 } from "lucide-react";

export default function MatrizSwotPageDefault() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-8">
      <HeaderTool
        NameTool="Matriz Swot"
        DescriptionTool="A Matriz SWOT é uma ferramenta de análise estratégica que permite identificar os pontos fortes, pontos fracos, oportunidades e ameaças de um projeto ou situação específica. Ela ajuda a compreender melhor o ambiente interno e externo, facilitando a tomada de decisões."
        IconTool={Grid2X2}
      />
      <div className="mt-8 mb-16">
        <SWOTCanvasDefault />
      </div>
    </div>
  );
}
