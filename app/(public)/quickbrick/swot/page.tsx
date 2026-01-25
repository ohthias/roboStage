"use client";
import React from "react";
import { StrategyBoard } from "@/components/QuickBrick/SWOT-template/StrategyBoard";
import { Navbar } from "@/components/UI/Navbar";
import { Footer } from "@/components/UI/Footer";
import Breadcrumbs from "@/components/UI/Breadcrumbs";

export default function SWOTPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4 md:px-8 space-y-4">
        <Breadcrumbs />
        <section className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
            Matriz SWOT
          </h1>
          <p className="text-base md:text-lg text-base-content/80 max-w-3xl leading-relaxed">
            Organize estrategicamente as missões da sua equipe distribuindo-as
            nos quadrantes da matriz{" "}
            <strong>Forças, Fraquezas, Oportunidades</strong> e
            <strong> Ameaças</strong>. Ao final, você pode exportar a análise e
            utilizá-la nos treinos, apresentações ou planejamentos.
          </p>
        </section>

        <StrategyBoard />
      </div>
      <Footer />
    </>
  );
}
