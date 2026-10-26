"use client";

import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import { Image as ImageIcon, PlusIcon, RotateCcw } from "lucide-react";
import MatrizRisco from "./MatrizRisco";
import RiscoModal from "./MatrizModal";
import RiscoDetalhesModal from "./RiscoDetalhesModal";
import { Impacto, Probabilidade, Risco } from "@/types/MatrizRisco";
import { useToast } from "@/app/context/ToastContext";
import { useChangeNotifier } from "@/hooks/useChangeNotifier";

type MatrizRiscoEditorProps = {
  initialRiscos: Risco[];
  /** Estado usado pelo botão "Resetar". */
  resetRiscos?: Risco[];
  onRiscosChange?: (riscos: Risco[]) => void;
};

/**
 * Editor da Matriz de Risco (botões + matriz + modais), sem cabeçalho.
 * Usado pela página pública (localStorage) e pelo caderno do QuickBrick
 * Studio (banco de dados).
 */
export default function MatrizRiscoEditor({
  initialRiscos,
  resetRiscos = [],
  onRiscosChange,
}: MatrizRiscoEditorProps) {
  const [riscos, setRiscos] = useState<Risco[]>(initialRiscos);
  const { addToast } = useToast();
  useChangeNotifier(riscos, onRiscosChange);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [riscoToEdit, setRiscoToEdit] = useState<Risco | null>(null);
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [riscoToView, setRiscoToView] = useState<Risco | null>(null);
  const matrixRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Devolve o foco para quem abriu o modal.
  useEffect(() => {
    if (!isModalOpen && !isDetalhesModalOpen) triggerRef.current?.focus();
  }, [isModalOpen, isDetalhesModalOpen]);

  const handleDropRisco = (riskId: number, impacto: Impacto, probabilidade: Probabilidade) => {
    setRiscos((prev) => prev.map((r) => (r.id === riskId ? { ...r, impacto, probabilidade } : r)));
  };

  const handleOpenModal = (risco?: Risco) => {
    triggerRef.current = document.activeElement as HTMLElement;
    setRiscoToEdit(risco || null);
    setIsModalOpen(true);
  };

  const handleSaveRisco = (riscoData: Omit<Risco, "id"> & { id?: number }) => {
    if (riscoData.id) {
      setRiscos((prev) => prev.map((r) => (r.id === riscoData.id ? ({ ...r, ...riscoData } as Risco) : r)));
      addToast("Risco atualizado com sucesso!", "success");
    } else {
      setRiscos((prev) => {
        const newId = prev.length > 0 ? Math.max(...prev.map((r) => r.id)) + 1 : 1;
        return [...prev, { ...riscoData, id: newId } as Risco];
      });
      addToast("Risco adicionado com sucesso!", "success");
    }
  };

  const handleRemoveRisco = (riskId: number) => {
    if (window.confirm("Tem certeza que deseja remover este risco?")) {
      setRiscos((prev) => prev.filter((r) => r.id !== riskId));
      addToast("Risco removido com sucesso!", "success");
    }
  };

  const handleOpenDetalhesModal = (risco: Risco) => {
    triggerRef.current = document.activeElement as HTMLElement;
    setRiscoToView(risco);
    setIsDetalhesModalOpen(true);
  };

  const handleExport = async () => {
    if (!matrixRef.current) return;
    addToast("Exportando matriz...", "info");
    const canvas = await html2canvas(matrixRef.current, { useCORS: true, backgroundColor: "#ffffff", scale: 2 });
    const link = document.createElement("a");
    link.download = "matriz-de-risco.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    addToast("Matriz exportada com sucesso!", "success");
  };

  const handleResetRiscos = () => {
    if (window.confirm("Tem certeza que deseja resetar todos os riscos? Esta ação não pode ser desfeita.")) {
      setRiscos(resetRiscos);
    }
  };

  return (
    <>
      <section className="flex flex-wrap items-center justify-end gap-4">
        <button onClick={() => handleOpenModal()} className="btn btn-primary btn-soft gap-2 shadow-sm">
          <PlusIcon className="size-5" />
          Adicionar Risco
        </button>
        <button onClick={handleExport} className="btn btn-outline btn-success gap-2">
          <ImageIcon className="size-5" />
          Exportar
        </button>
        <button onClick={handleResetRiscos} className="btn btn-outline btn-error gap-2">
          <RotateCcw className="size-5" />
          Resetar
        </button>
      </section>

      <section className="mt-8 mb-16 flex w-full justify-center">
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
        onClose={() => {
          setIsModalOpen(false);
          setRiscoToEdit(null);
        }}
        onSave={handleSaveRisco}
        riscoToEdit={riscoToEdit}
      />
      <RiscoDetalhesModal
        isOpen={isDetalhesModalOpen}
        onClose={() => {
          setIsDetalhesModalOpen(false);
          setRiscoToView(null);
        }}
        risco={riscoToView}
      />
    </>
  );
}
