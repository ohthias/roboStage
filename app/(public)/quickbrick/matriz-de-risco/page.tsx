"use client";
import React, { useState, useEffect, useRef } from "react";
import MatrizRisco from "@/components/QuickBrick/MatrizRisco/MatrizRisco";
import RiscoModal from "@/components/QuickBrick/MatrizRisco/MatrizModal";
import { Impacto, Probabilidade, Risco } from "@/types/MatrizRisco";
import { INITIAL_RISCOS } from "./constants";
import { Navbar } from "@/components/Navbar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Footer } from "@/components/ui/Footer";

declare const html2canvas: any;

export default function App() {
  const [riscos, setRiscos] = useState<Risco[]>(INITIAL_RISCOS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [riscoToEdit, setRiscoToEdit] = useState<Risco | null>(null);
  const matrixRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth <= 720);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const handleDropRisco = (
    riskId: number,
    newImpacto: Impacto,
    newProbabilidade: Probabilidade
  ) => {
    setRiscos((prevRiscos) =>
      prevRiscos.map((r) =>
        r.id === riskId
          ? { ...r, impacto: newImpacto, probabilidade: newProbabilidade }
          : r
      )
    );
  };

  const handleOpenModal = (risco?: Risco) => {
    setRiscoToEdit(risco || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRiscoToEdit(null);
  };

  const handleSaveRisco = (riscoData: Omit<Risco, "id"> & { id?: number }) => {
    if (riscoData.id) {
      // Editing existing risk
      setRiscos(
        riscos.map((r) =>
          r.id === riscoData.id ? ({ ...r, ...riscoData } as Risco) : r
        )
      );
    } else {
      // Adding new risk
      const newId =
        riscos.length > 0 ? Math.max(...riscos.map((r) => r.id)) + 1 : 1;
      const newRisco: Risco = { ...riscoData, id: newId };
      setRiscos([...riscos, newRisco]);
    }
  };

  const handleRemoveRisco = (riskId: number) => {
    if (window.confirm("Tem certeza que deseja remover este risco?")) {
      setRiscos(riscos.filter((r) => r.id !== riskId));
    }
  };

  const handleExport = () => {
    if (matrixRef.current) {
      html2canvas(matrixRef.current, {
        useCORS: true,
        backgroundColor: "#ffffff", // Ensure background is not transparent
        scale: 2, // Increase resolution
      }).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement("a");
        link.download = "matriz-de-risco.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <Navbar />
        <h1 className="text-2xl font-bold my-4 text-primary">
          Ops! Ferramenta não está disponível no celular
        </h1>
        <p className="text-sm mb-2 text-base-content px-5">
          O QuickBrick Studio é um conjunto de ferramentas que ajuda sua equipe
          a criar estratégias eficientes para o robô durante sua jornada no
          FIRST LEGO League Challenge. Basta selecionar uma das ferramentas
          disponíveis e aproveitá-las.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start justify-center w-full">
      <Navbar />
      <div className="flex flex-col w-full px-4 md:px-8">
        <Breadcrumbs />
        <main className="container mx-auto w-full min-h-screen py-6">
          <section className="hero bg-base-200 rounded-box my-6">
            <div className="hero-content text-center">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                  Matriz de Risco
                </h1>
                <p className="text-base-content/75 text-lg leading-relaxed">
                  Identifique e avalie os riscos potenciais para o sucesso do
                  seu robô.
                  <br />
                  <strong className="text-primary">Arraste e solte</strong> os
                  cartões para reavaliar os riscos.
                </p>
              </div>
            </div>
          </section>

          <section className="w-full flex justify-end items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenModal()}
                className="btn btn-primary"
              >
                Adicionar Risco
              </button>
              <button onClick={handleExport} className="btn btn-success">
                Exportar Matriz
              </button>
            </div>
          </section>

          <section>
            <div className="w-full">
              <MatrizRisco
                ref={matrixRef}
                riscos={riscos}
                onDropRisco={handleDropRisco}
                onEditRisco={handleOpenModal}
                onRemoveRisco={handleRemoveRisco}
              />
            </div>
          </section>
        </main>
      </div>
      <RiscoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveRisco}
        riscoToEdit={riscoToEdit}
      />
      <Footer />
    </div>
  );
}
