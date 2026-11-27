"use client";

import { FormEvent, useId, useState } from "react";
import { ToolButton, ToolDialog, ToolInput } from "@/components/stage";

interface AddItemModalProps {
  open: boolean;
  checklistTitle: string;
  onClose: () => void;
  onConfirm: (text: string) => void;
}

export default function AddItemModal({ open, checklistTitle, onClose, onConfirm }: AddItemModalProps) {
  const [text, setText] = useState("");
  const formId = useId();
  const inputId = useId();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    setText("");
  }

  function handleClose() {
    setText("");
    onClose();
  }

  return (
    <ToolDialog
      open={open}
      onClose={handleClose}
      title="Adicionar item"
      description={`Checklist: ${checklistTitle}`}
      footer={
        <>
          <ToolButton variant="ghost" onClick={handleClose}>
            Cancelar
          </ToolButton>
          <ToolButton type="submit" form={formId} variant="primary" disabled={!text.trim()}>
            Adicionar
          </ToolButton>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-1.5 pb-2">
        <label htmlFor={inputId} className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">
          Nome
        </label>
        <ToolInput
          id={inputId}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ex.: Conferir sensor de cor"
          autoFocus
          maxLength={140}
          required
        />
      </form>
    </ToolDialog>
  );
}
