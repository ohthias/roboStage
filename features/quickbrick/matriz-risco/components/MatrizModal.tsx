"use client";
import React, { useEffect, useId, useState } from "react";
import { PropertyRow, ToolButton, ToolDialog, ToolInput, ToolSelect, InlineAlert } from "@/components/stage";
import { Risco, Impacto, Probabilidade } from "@/features/quickbrick/matriz-risco/types";
import { IMPACTO_LABELS, PROBABILIDADE_LABELS, getRiskLevel } from "@/features/quickbrick/matriz-risco/lib/constants";

interface RiscoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (risco: Omit<Risco, "id"> & { id?: number }) => void;
  riscoToEdit?: Risco | null;
}

const RiscoModal: React.FC<RiscoModalProps> = ({ isOpen, onClose, onSave, riscoToEdit }) => {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [impacto, setImpacto] = useState<Impacto>(Impacto.Medio);
  const [probabilidade, setProbabilidade] = useState<Probabilidade>(Probabilidade.Media);
  const formId = useId();

  useEffect(() => {
    if (riscoToEdit) {
      setTitulo(riscoToEdit.titulo);
      setDescricao(riscoToEdit.descricao);
      setImpacto(riscoToEdit.impacto);
      setProbabilidade(riscoToEdit.probabilidade);
    } else {
      setTitulo("");
      setDescricao("");
      setImpacto(Impacto.Medio);
      setProbabilidade(Probabilidade.Media);
    }
  }, [riscoToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    onSave({ id: riscoToEdit?.id, titulo: titulo.trim(), descricao, impacto, probabilidade });
    onClose();
  };

  const level = getRiskLevel(impacto, probabilidade);

  return (
    <ToolDialog
      open={isOpen}
      onClose={onClose}
      title={riscoToEdit ? "Editar risco" : "Novo risco"}
      description="Descreva o risco e posicione na matriz de impacto × probabilidade."
      size="md"
      footer={
        <>
          <ToolButton variant="ghost" onClick={onClose}>
            Cancelar
          </ToolButton>
          <ToolButton type="submit" form={formId} variant="primary" disabled={!titulo.trim()}>
            Salvar risco
          </ToolButton>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-2.5 pb-2">
        <PropertyRow label="Título">
          <ToolInput value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Sensor de cor falha" autoFocus required />
        </PropertyRow>
        <PropertyRow label="Descrição" className="items-start">
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={3}
            placeholder="O que pode dar errado e quando acontece?"
            className="w-full resize-none rounded-md border border-base-300 bg-base-100 px-2.5 py-1.5 text-[13px] transition-colors placeholder:text-base-content/40 hover:border-base-content/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </PropertyRow>
        <PropertyRow label="Impacto">
          <ToolSelect value={impacto} onChange={(e) => setImpacto(Number(e.target.value) as Impacto)}>
            {Object.entries(IMPACTO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </ToolSelect>
        </PropertyRow>
        <PropertyRow label="Probabilidade">
          <ToolSelect value={probabilidade} onChange={(e) => setProbabilidade(Number(e.target.value) as Probabilidade)}>
            {Object.entries(PROBABILIDADE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </ToolSelect>
        </PropertyRow>
        <InlineAlert type={level.tone === "error" ? "error" : level.tone === "success" ? "success" : "warning"}>
          Nível do risco: <strong>{level.label}</strong> ({impacto * probabilidade} de 25)
        </InlineAlert>
      </form>
    </ToolDialog>
  );
};

export default RiscoModal;
