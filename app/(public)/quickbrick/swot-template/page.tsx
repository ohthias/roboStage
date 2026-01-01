"use client";
import React from "react";
import { StrategyBoard } from "@/components/QuickBrick/SWOT-template/StrategyBoard";
import { TeamInfo } from "@/components/QuickBrick/SWOT-template/TeamInfo";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function SWOTPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <div className="px-4 md:px-8">
          <Breadcrumbs />
        </div>
        <section className="w-full flex flex-col items-center text-center px-4 py-8">
          <article className="max-w-3xl">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Matriz SWOT
            </h1>
            <p className="text-base-content/75 text-lg leading-relaxed">
              Analise seu robô usando a ferramenta SWOT para identificar pontos
              de força, fraquezas, oportunidades e ameaças.{" "}
              <strong className="text-base-content">Escreva e organize</strong>{" "}
              suas ideias para uma análise clara e eficaz.
            </p>
          </article>
        </section>

        <div className="mx-auto mt-6 px-4 md:px-8">
          <div role="tablist" className="tabs tabs-border">
            <input
              type="radio"
              name="fll-tabs"
              role="tab"
              className="tab"
              aria-label="Quadro Estratégico"
              defaultChecked
            />
            <div role="tabpanel" className="tab-content p-6">
              <StrategyBoard />
            </div>

            <input
              type="radio"
              name="fll-tabs"
              role="tab"
              className="tab"
              aria-label="Info do Time"
            />
            <div role="tabpanel" className="tab-content p-6">
              <TeamInfo />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
