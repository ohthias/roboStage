"use client";
import HeaderTool from "@/components/QuickBrick/HeaderTool";
import ViewSection from "@/components/QuickBrick/SharksSimulator/ViewSection";
import { Bot } from "lucide-react";

export default function Page() {
  return (
      <div className="px-4 md:px-8">
        <HeaderTool
          NameTool="Sharks Simulator"
          DescriptionTool="Simule visualmente as trajetórias para robôs da FLL. Defina movimentos retos e giros, visualizando a trajetória resultante sobre o tapete de competição."
          IconTool={Bot}
        />

        <div className="flex justify-center mt-8 mb-16">
          <ViewSection />
        </div>
      </div>
  );
}
