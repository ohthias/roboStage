"use client";

import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import { Image as ImageIcon, Plus, RotateCcw } from "lucide-react";
import { ToolBadge, ToolButton, ToolScope, Toolbar, ToolbarDivider, ToolbarGroup, ToolbarSpacer, useToolConfirm } from "@/components/stage";
import { getRiskLevel } from "@/features/quickbrick/matriz-risco/lib/constants";
import MatrizRisco from "./MatrizRisco";
import RiscoModal from "./MatrizModal";
import RiscoDetalhesModal from "./RiscoDetalhesModal";
import { Impacto, Probabilidade, Risco } from "@/features/quickbrick/matriz-risco/types";
import { useToast } from "@/components/providers/ToastContext";
import { useChangeNotifier } from "@/lib/hooks/useChangeNotifier";

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
  const { confirm, dialog } = useToolConfirm();

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

  const handleRemoveRisco = async (riskId: number) => {
    const alvo = riscos.find((r) => r.id === riskId);
    if (await confirm({ title: "Remover risco?", message: `“${alvo?.titulo ?? "Risco"}” sai da matriz.`, confirmLabel: "Remover" })) {
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

  const handleResetRiscos = async () => {
    if (await confirm({ title: "Resetar a matriz?", message: "Todos os riscos voltam ao estado inicial. Esta ação não pode ser desfeita.", confirmLabel: "Resetar" })) {
      setRiscos(resetRiscos);
    }
  };

  const counts = riscos.reduce<Record<string, number>>((acc, r) => {
    const k = getRiskLevel(r.impacto, r.probabilidade).key;
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <ToolScope className="mt-6 overflow-hidden rounded-tl-[1.5rem] rounded-br-[1.5rem] border border-base-300">
      <Toolbar label="Ações da matriz de risco" className="px-3">
        <ToolbarGroup>
          <span className="px-1 text-[13px] font-bold">Riscos</span>
          <ToolBadge>{riscos.length}</ToolBadge>
          <ToolBadge tone="success" dot>{counts.baixo ?? 0} baixo</ToolBadge>
          <ToolBadge tone="warning" dot>{counts.moderado ?? 0} moderado</ToolBadge>
          <ToolBadge tone="accent" dot>{counts.alto ?? 0} alto</ToolBadge>
          <ToolBadge tone="primary" dot>{counts.critico ?? 0} crítico</ToolBadge>
        </ToolbarGroup>
        <ToolbarSpacer />
        <ToolbarGroup>
          <ToolButton variant="ghost" icon={<RotateCcw />} onClick={handleResetRiscos}>
            Resetar
          </ToolButton>
          <ToolButton variant="ghost" icon={<ImageIcon />} onClick={handleExport}>
            Exportar PNG
          </ToolButton>
          <ToolbarDivider />
          <ToolButton variant="primary" icon={<Plus />} onClick={() => handleOpenModal()}>
            Adicionar risco
          </ToolButton>
        </ToolbarGroup>
      </Toolbar>

      <div className="flex w-full justify-center p-2">
        <MatrizRisco
          ref={matrixRef}
          riscos={riscos}
          onDropRisco={handleDropRisco}
          onEditRisco={handleOpenModal}
          onRemoveRisco={handleRemoveRisco}
          onViewRisco={handleOpenDetalhesModal}
        />
      </div>

      <footer className="border-t border-base-300 bg-base-100 px-4 py-2 text-xs text-base-content/55">
        Arraste os cartões entre as células para mudar impacto e probabilidade. Clique para ver os detalhes.
      </footer>

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
        onEdit={handleOpenModal}
      />
      {dialog}
    </ToolScope>
  );
}
