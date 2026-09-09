"use client";

import { FormEvent, useState } from "react";

interface AddChecklistModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (title: string, description: string) => void;
}

export default function AddChecklistModal({ open, onClose, onConfirm }: AddChecklistModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (!open) return null;

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
    <dialog className="modal modal-open" aria-labelledby="add-checklist-title">
      <div className="modal-box">
        <h3 id="add-checklist-title" className="text-lg font-bold">
          Nova checklist
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Nome</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Meu Robô"
              className="input input-bordered w-full"
              autoFocus
              maxLength={80}
              required
            />
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Descrição</span>
              <span className="label-text-alt">opcional</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Do que essa checklist trata?"
              className="textarea textarea-bordered w-full"
              rows={2}
              maxLength={160}
            />
          </label>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
              Criar
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
