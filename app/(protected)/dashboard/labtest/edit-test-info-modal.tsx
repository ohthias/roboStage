"use client";

import { useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  FileText,
  LoaderCircle,
  Pencil,
  RotateCcw,
  Users,
  X,
} from "lucide-react";
import { updateLabTestInfo } from "./actions";

interface EditTestInfoModalProps {
  testId: string;
  initialName: string;
  initialDescription?: string;
  initialTeamId?: string;
  teams: { id: string; name: string }[];
}

export function EditTestInfoModal({
  testId,
  initialName,
  initialDescription,
  initialTeamId,
  teams,
}: EditTestInfoModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription || "");
  const [teamId, setTeamId] = useState(initialTeamId || "");

  function reset() {
    setName(initialName);
    setDescription(initialDescription || "");
    setTeamId(initialTeamId || "");
    setError(null);
  }

  function openModal() {
    reset();
    dialogRef.current?.showModal();
  }

  function handleClose() {
    if (isPending) return;
    reset();
    dialogRef.current?.close();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Dê um nome para o teste.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await updateLabTestInfo(testId, {
          name: name.trim(),
          description: description.trim() || undefined,
          teamId: teamId || undefined,
        });
        dialogRef.current?.close();
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível atualizar o teste. Tente novamente.",
        );
      }
    });
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-sm btn-outline gap-2"
        onClick={openModal}
      >
        <Pencil size={15} strokeWidth={2} />
        Editar informações
      </button>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box max-w-lg overflow-hidden border border-base-300 bg-base-100 p-0 shadow-2xl">
          <div className="border-b border-base-300 bg-base-200/60 px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Pencil size={22} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold">
                  Editar informações do teste
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-base-content/60">
                  Atualize os dados básicos do teste sem alterar sua
                  configuração.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-circle btn-ghost btn-sm"
                onClick={handleClose}
                disabled={isPending}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-5 px-6 py-6">
              {/* Nome */}
              <fieldset className="form-control">
                <label htmlFor="test-name" className="label px-0 pb-2">
                  <span className="label-text flex items-center gap-2 font-semibold">
                    <FileText size={15} className="text-base-content/50" />
                    Nome
                  </span>
                  <span className="label-text-alt text-base-content/40">
                    Obrigatório
                  </span>
                </label>
                <input
                  id="test-name"
                  type="text"
                  className="input input-bordered w-full transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex.: Estratégia base — tabela de missões"
                  disabled={isPending}
                  autoFocus
                />
              </fieldset>
              <fieldset className="form-control">
                <label htmlFor="test-description" className="label px-0 pb-2">
                  <span className="label-text flex items-center gap-2 font-semibold">
                    <FileText size={15} className="text-base-content/50" />
                    Descrição
                  </span>
                  <span className="label-text-alt text-base-content/40">
                    Opcional
                  </span>
                </label>
                <textarea
                  id="test-description"
                  className="textarea textarea-bordered min-h-24 w-full resize-none transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  placeholder="Descreva o objetivo ou conteúdo deste teste..."
                  disabled={isPending}
                />
              </fieldset>
             
              <div className="alert border border-base-300 bg-base-200/50 text-sm">
                <FileText
                  size={18}
                  className="shrink-0 text-base-content/50"
                />
                <span className="text-base-content/70">
                  Missões, calibrações, parâmetros e demais configurações do
                  teste não serão modificados.
                </span>
              </div>
              {error && (
                <div
                  role="alert"
                  className="alert alert-error items-start text-sm"
                >
                  <X size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-base-300 bg-base-200/40 px-6 py-4">
              <button
                type="button"
                className="btn btn-ghost gap-2"
                onClick={reset}
                disabled={isPending}
              >
                <RotateCcw size={16} />
                Restaurar
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary gap-2"
                  disabled={isPending || !name.trim()}
                >
                  {isPending ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Salvar alterações
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            aria-label="Fechar modal"
          >
            close
          </button>
        </form>
      </dialog>
    </>
  );
}