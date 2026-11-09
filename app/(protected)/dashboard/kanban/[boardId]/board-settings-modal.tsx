"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, X } from "lucide-react";
import { deleteBoard, renameBoard } from "../actions";
import { BOARD_ICON_PRESET } from "../board-icons";

const NAME_MAX = 120;
const DESCRIPTION_MAX = 4000;

/** Edição do board: nome, descrição, ícone e exclusão. */
export function BoardSettingsModal({
  boardId,
  name: initialName,
  description: initialDescription,
  icon: initialIcon,
  onClose,
  onSaved,
}: {
  boardId: string;
  name: string;
  description: string | null;
  icon: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [icon, setIcon] = useState(initialIcon ?? "LayoutDashboard");
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const trimmedName = name.trim();
  const nameError = !trimmedName ? "Dê um nome ao board." : null;
  const unchanged =
    trimmedName === initialName &&
    description.trim() === (initialDescription ?? "") &&
    icon === (initialIcon ?? "LayoutDashboard");

  function save() {
    if (nameError || unchanged) return;
    setError(null);
    startTransition(async () => {
      const result = await renameBoard(boardId, trimmedName, description.trim(), icon);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved();
      onClose();
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteBoard(boardId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/dashboard/kanban");
    });
  }

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="board-settings-title">
      <div className="modal-box max-w-lg p-0">
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 id="board-settings-title" className="text-base font-semibold">Editar board</h2>
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <form
          className="space-y-5 px-6 pb-6 pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-base-content/60">Nome</span>
            <input
              autoFocus
              className={`input input-sm w-full ${nameError ? "input-error" : ""}`}
              value={name}
              maxLength={NAME_MAX}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(nameError)}
            />
            {nameError && <span className="text-[11px] text-error">{nameError}</span>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="flex justify-between text-xs font-medium text-base-content/60">
              Descrição
              <span className="font-normal text-base-content/40">{description.length}/{DESCRIPTION_MAX}</span>
            </span>
            <textarea
              className="textarea textarea-sm w-full"
              rows={3}
              maxLength={DESCRIPTION_MAX}
              placeholder="Para que serve este board?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <fieldset>
            <legend className="mb-1.5 text-xs font-medium text-base-content/60">Ícone</legend>
            <div className="grid grid-cols-6 gap-1.5">
              {BOARD_ICON_PRESET.map(({ name: iconName, label, icon: Icon }) => {
                const active = icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    title={label}
                    aria-label={label}
                    aria-pressed={active}
                    onClick={() => setIcon(iconName)}
                    className={`flex h-10 items-center justify-center rounded-lg border transition-colors ${
                      active ? "border-primary bg-primary/10 text-primary" : "border-base-300 text-base-content/55 hover:border-base-content/25 hover:text-base-content"
                    }`}
                  >
                    <Icon size={17} strokeWidth={1.8} />
                  </button>
                );
              })}
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-xs text-error">{error}</p>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-base-300 pt-4">
            {confirmingDelete ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-base-content/70">Excluir board e todos os cards?</span>
                <button type="button" className="btn btn-error btn-xs" disabled={isPending} onClick={remove}>Excluir</button>
                <button type="button" className="btn btn-ghost btn-xs" onClick={() => setConfirmingDelete(false)}>Cancelar</button>
              </div>
            ) : (
              <button type="button" className="btn btn-ghost btn-sm gap-1.5 text-error" onClick={() => setConfirmingDelete(true)}>
                <Trash2 size={14} />
                Excluir board
              </button>
            )}
            {!confirmingDelete && (
              <div className="flex gap-2">
                <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn btn-primary btn-sm gap-1.5" disabled={isPending || Boolean(nameError) || unchanged}>
                  <Check size={14} />
                  Salvar
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
      <button type="button" className="modal-backdrop" aria-label="Fechar" onClick={onClose} />
    </div>
  );
}
