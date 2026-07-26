"use client";
import React, { useState, useRef, useEffect } from "react";
import MatrizRisco from "@/components/QuickBrick/MatrizRisco/MatrizRisco";
import { Impacto, Probabilidade, Risco } from "@/types/MatrizRisco";
import { INITIAL_RISCOS } from "./constants";
import RiscoDetalhesModal from "@/components/QuickBrick/MatrizRisco/RiscoDetalhesModal";
import RiscoModal from "@/components/QuickBrick/MatrizRisco/MatrizModal";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import html2canvas from "html2canvas-pro";
import { useToast } from "@/app/context/ToastContext";
import { PlusIcon, Image, RotateCcw, Grid2X2 } from "lucide-react";
import CardMobileNotUse from "@/components/MobileNotUse";
import HeaderTool from "@/components/QuickBrick/HeaderTool";

export default function MatrizDeRiscoPage() {
  const [riscos, setRiscos] = useState<Risco[]>(INITIAL_RISCOS);
  const { addToast } = useToast();

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
    newProbabilidade: Probabilidade,
  ) => {
    setRiscos((prevRiscos) =>
      prevRiscos.map((r) =>
        r.id === riskId
          ? { ...r, impacto: newImpacto, probabilidade: newProbabilidade }
          : r,
      ),
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
          r.id === riscoData.id ? ({ ...r, ...riscoData } as Risco) : r,
        ),
      );
      addToast("Risco atualizado com sucesso!", "success");
    } else {
      // Adding new risk
      const newId =
        riscos.length > 0 ? Math.max(...riscos.map((r) => r.id)) + 1 : 1;
      const newRisco: Risco = { ...riscoData, id: newId };
      setRiscos([...riscos, newRisco]);
      addToast("Risco adicionado com sucesso!", "success");
    }
  };

  const handleRemoveRisco = (riskId: number) => {
    if (window.confirm("Tem certeza que deseja remover este risco?")) {
      setRiscos(riscos.filter((r) => r.id !== riskId));
      addToast("Risco removido com sucesso!", "success");
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
    addToast("Exportando matriz...", "info");
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
    addToast("Matriz exportada com sucesso!", "success");
  };

  const handleResetRiscos = () => {
    if (
      window.confirm(
        "Tem certeza que deseja resetar todos os riscos para o estado inicial? Esta ação não pode ser desfeita.",
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
    return <CardMobileNotUse />;
  }

  return (
    <div className="px-4 md:px-8">
      <HeaderTool
        NameTool="Matriz de Risco"
        DescriptionTool="A Matriz de Risco ajuda identificar e avaliar os riscos potenciais para o sucesso do seu robô. Ao mapear os riscos em uma matriz de impacto versus probabilidade, pode priorizar quais riscos precisam ser gerenciados ativamente e quais podem ser monitorados passivamente."
        IconTool={Grid2X2}
      />

      <section className="flex flex-wrap items-center justify-end gap-4">
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary btn-soft gap-2 shadow-sm"
        >
          <PlusIcon className="size-5" />
          Adicionar Risco
        </button>

        <button
          onClick={handleExport}
          className="btn btn-outline btn-success gap-2"
        >
          <Image className="size-5" />
          Exportar
        </button>

        <button
          onClick={handleResetRiscos}
          className="btn btn-outline btn-error gap-2"
        >
          <RotateCcw className="size-5" />
          Resetar
        </button>
      </section>

      <section className="w-full flex justify-center mt-8 mb-16">
        <MatrizRisco
          ref={matrixRef}
          riscos={riscos}
          onDropRisco={handleDropRisco}
          onEditRisco={handleOpenModal}
          onRemoveRisco={handleRemoveRisco}
          onViewRisco={handleOpenDetalhesModal}
        />
      </section>
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
    </div>
  );
}
