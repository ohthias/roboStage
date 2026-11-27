"use client";

import { FormEvent, useId, useState } from "react";
import { ToolButton, ToolDialog, ToolInput } from "@/components/stage";

interface AddChecklistModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (title: string, description: string) => void;
}

const labelCls = "text-[11px] font-semibold uppercase tracking-wider text-base-content/50";

export default function AddChecklistModal({ open, onClose, onConfirm }: AddChecklistModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const formId = useId();
  const titleId = useId();
  const descId = useId();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onConfirm(trimmedTitle, description.trim());
    setTitle("");
    setDescription("");
  }

  function handleClose() {
    setTitle("");
    setDescription("");
    onClose();
  }

  return (
    <ToolDialog
      open={open}
      onClose={handleClose}
      title="Nova checklist"
      description="Organize algo específico da sua equipe."
      footer={
        <>
          <ToolButton variant="ghost" onClick={handleClose}>
            Cancelar
          </ToolButton>
          <ToolButton type="submit" form={formId} variant="primary" disabled={!title.trim()}>
            Criar
          </ToolButton>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-3 pb-2">
        <div className="space-y-1.5">
          <label htmlFor={titleId} className={labelCls}>
            Nome
          </label>
          <ToolInput
            id={titleId}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Meu Robô"
            autoFocus
            maxLength={80}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor={descId} className={`${labelCls} flex justify-between`}>
            Descrição <span className="normal-case tracking-normal text-base-content/40">opcional</span>
          </label>
          <textarea
            id={descId}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Do que essa checklist trata?"
            rows={2}
            maxLength={160}
            className="w-full resize-none rounded-md border border-base-300 bg-base-100 px-2.5 py-1.5 text-[13px] transition-colors placeholder:text-base-content/40 hover:border-base-content/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </form>
    </ToolDialog>
  );
}
