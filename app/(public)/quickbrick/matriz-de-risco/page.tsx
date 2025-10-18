'use client';
import React, { useState, useRef, useEffect } from "react";
import MatrizRisco from "@/components/QuickBrick/MatrizRisco/MatrizRisco";
import { Impacto, Probabilidade, Risco } from "@/types/MatrizRisco";
import { INITIAL_RISCOS } from "./constants";
import RiscoDetalhesModal from "@/components/QuickBrick/MatrizRisco/RiscoDetalhesModal";
import RiscoModal from "@/components/QuickBrick/MatrizRisco/MatrizModal";
import { Navbar } from "@/components/Navbar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Footer } from "@/components/ui/Footer";
import html2canvas from "html2canvas-pro";

export default function App() {
  const [riscos, setRiscos] = useState<Risco[]>(INITIAL_RISCOS);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const savedRiscos = window.localStorage.getItem("riscos");
      if (savedRiscos) {
        setRiscos(JSON.parse(savedRiscos) as Risco[]);
      }
    } catch (error) {
      console.error("Falha ao carregar riscos do localStorage", error);
    }
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [riscoToEdit, setRiscoToEdit] = useState<Risco | null>(null);
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [riscoToView, setRiscoToView] = useState<Risco | null>(null);
  const matrixRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem("riscos", JSON.stringify(riscos));
    } catch (error) {
      console.error("Falha ao salvar riscos no localStorage", error);
    }
  }, [riscos]);

  // Return focus to the trigger element when modals close
  useEffect(() => {
    if (!isModalOpen && !isDetalhesModalOpen) {
      triggerRef.current?.focus();
    }
  }, [isModalOpen, isDetalhesModalOpen]);

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
    triggerRef.current = document.activeElement as HTMLElement;
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

  const handleOpenDetalhesModal = (risco: Risco) => {
    triggerRef.current = document.activeElement as HTMLElement;
    setRiscoToView(risco);
    setIsDetalhesModalOpen(true);
  };

  const handleCloseDetalhesModal = () => {
    setIsDetalhesModalOpen(false);
    setRiscoToView(null);
  };

  const handleExport = () => {
    if (matrixRef.current) {
      html2canvas(matrixRef.current, {
        useCORS: true,
        backgroundColor: "#ffffff",
        scale: 2,
      }).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement("a");
        link.download = "matriz-de-risco.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const handleResetRiscos = () => {
    if (
      window.confirm(
        "Tem certeza que deseja resetar todos os riscos para o estado inicial? Esta ação não pode ser desfeita."
      )
    ) {
      setRiscos(INITIAL_RISCOS);
    }
  };

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth <= 720);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

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
      <Breadcrumbs />
      <div className="flex flex-col items-center w-full min-h-screen py-8">
        <main className="flex flex-col w-full px-4 md:px-8">
          <section className="w-full flex flex-col items-center text-center px-4 py-8">
            <article className="max-w-3xl">
              <h1 className="text-4xl font-bold text-primary mb-4">
                Matriz de Risco Interativa
              </h1>
              <p className="text-base-content/75 text-lg leading-relaxed">
                Identifique e avalie os riscos potenciais para o sucesso do seu
                robô na FIRST LEGO League.
                <br />
                <strong className="text-base-content">Arraste e solte</strong> os cartões para reavaliar os
                riscos.
              </p>
            </article>
          </section>

          <section className="w-full max-w-6xl mx-auto flex justify-end gap-4 mb-4">
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary"
            >
              Adicionar Risco
            </button>
            <button
              onClick={handleExport}
              className="btn btn-success btn-outline"
            >
              Exportar Matriz
            </button>
            <button
              onClick={handleResetRiscos}
              className="btn btn-error btn-outline"
            >
              Resetar
            </button>
          </section>

          <section className="w-full flex justify-center mt-2">
            <MatrizRisco
              ref={matrixRef}
              riscos={riscos}
              onDropRisco={handleDropRisco}
              onEditRisco={handleOpenModal}
              onRemoveRisco={handleRemoveRisco}
              onViewRisco={handleOpenDetalhesModal}
            />
          </section>
        </main>
      </div>
      <RiscoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveRisco}
        riscoToEdit={riscoToEdit}
      />
      <RiscoDetalhesModal
        isOpen={isDetalhesModalOpen}
        onClose={handleCloseDetalhesModal}
        risco={riscoToView}
      />
      <Footer />
    </div>
  );
}
