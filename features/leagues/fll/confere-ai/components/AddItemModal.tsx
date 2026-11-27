"use client";

import { FormEvent, useState } from "react";

interface AddItemModalProps {
  open: boolean;
  checklistTitle: string;
  onClose: () => void;
  onConfirm: (text: string) => void;
}

export default function AddItemModal({
  open,
  checklistTitle,
  onClose,
  onConfirm,
}: AddItemModalProps) {
  const [text, setText] = useState("");

  if (!open) return null;

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
    <dialog className="modal modal-open" aria-labelledby="add-item-title">
      <div className="modal-box">
        <h3 id="add-item-title" className="text-lg font-bold">
          Adicionar item
        </h3>
        <p className="mt-1 text-sm text-base-content/60">Checklist: {checklistTitle}</p>

        <form onSubmit={handleSubmit} className="mt-4">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Nome</span>
            </div>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ex.: Conferir sensor de cor"
              className="input input-bordered w-full"
              autoFocus
              maxLength={140}
              required
            />
          </label>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={!text.trim()}>
              Adicionar
            </button>
          </div>
        </form>
      </div>
      <button
        type="button"
        aria-label="Fechar"
        className="modal-backdrop"
        onClick={handleClose}
      >
        close
      </button>
    </dialog>
  );
}
