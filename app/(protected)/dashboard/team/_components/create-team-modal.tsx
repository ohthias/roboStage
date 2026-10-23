"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { createTeamAction, switchStagebookScope } from "@/utils/stagebook/actions/teams";
import { useToast } from "@/app/context/ToastContext";
import { Modal } from "@/components/stagebook/modal";

/**
 * Botão + modal "Criar equipe". Quem cria vira Técnico (owner) e a equipe ganha
 * uma Organização no Clerk. Quem pode criar é decidido no servidor
 * (`createTeam`); a UI só deixa de oferecer o botão a quem não pode.
 */
export function CreateTeamButton({
  variant = "primary",
}: {
  variant?: "primary" | "icon";
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setName("");
    setError(null);
  }

  function submit() {
    const clean = name.trim();
    if (!clean) {
      setError("Informe o nome da equipe.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createTeamAction(clean);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await switchStagebookScope(result.data.id);
      addToast("Equipe criada com sucesso.", "success");
      close();
      router.push(`/dashboard/team/${result.data.id}`);
      router.refresh();
    });
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          title="Criar equipe"
          aria-label="Criar equipe"
          onClick={() => setOpen(true)}
        >
          <Plus size={16} />
        </button>
      ) : (
        <button type="button" className="btn btn-primary gap-2" onClick={() => setOpen(true)}>
          <Plus size={16} />
          Criar equipe
        </button>
      )}

      <Modal
        open={open}
        onClose={close}
        title="Criar equipe"
        description="Você será o técnico responsável e poderá convidar mentores e membros."
        size="sm"
      >
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label className="fieldset">
            <span className="fieldset-legend">Nome da equipe</span>
            <input
              autoFocus
              className="input w-full"
              placeholder="Ex.: Robôs do Sertão"
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          {error && (
            <div role="alert" className="alert alert-error alert-soft py-2 text-sm">
              {error}
            </div>
          )}

          <div className="modal-action">
            <button type="button" className="btn btn-ghost btn-sm" onClick={close} disabled={isPending}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isPending || !name.trim()}>
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Criar equipe
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
