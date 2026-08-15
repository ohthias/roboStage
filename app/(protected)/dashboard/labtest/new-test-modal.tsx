"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createLabTest } from "./actions";

const TYPES = [
  {
    value: "run",
    label: "Run",
    desc: "Execuções cronometradas na mesa oficial da FLL.",
    activeClass: "btn-warning",
  },
  {
    value: "calibrabot",
    label: "CalibraBot",
    desc: "Calibração de sensores, motores, PID e giroscópio.",
    activeClass: "btn-info",
  },
  {
    value: "personalizado",
    label: "Personalizado",
    desc: "Parâmetros e métricas livres, sem limite.",
    activeClass: "btn-secondary",
  },
] as const;

type TestType = (typeof TYPES)[number]["value"];

export function NewTestModal({
  teams,
  triggerLabel = "+ Novo teste",
}: {
  teams: { id: string; name: string }[];
  triggerLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TestType>("run");
  const [teamId, setTeamId] = useState("");

  function reset() {
    setName("");
    setDescription("");
    setType("run");
    setTeamId("");
    setError(null);
  }

  function handleClose() {
    if (isPending) return;
    reset();
    dialogRef.current?.close();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Dá um nome pro teste.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const test = await createLabTest({
          name: name.trim(),
          description: description.trim() || undefined,
          type,
          teamId: teamId || undefined,
        });
        reset();
        dialogRef.current?.close();
        // O teste nasce como "rascunho" — a configuração do tipo acontece
        // numa rota própria (ver ADR-001), não dentro deste modal.
        router.push(`/dashboard/labtest/${test.id}/setup`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não deu pra criar o teste. Tenta de novo.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-warning"
        onClick={() => dialogRef.current?.showModal()}
      >
        {triggerLabel}
      </button>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box border border-base-300 bg-base-200">
          <h3 className="text-lg font-bold">Novo teste</h3>
          <p className="mt-1 text-sm text-base-content/60">
            Escolha a modalidade — no próximo passo você configura missões, calibrações ou
            parâmetros específicos.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            <div>
              <div className="join w-full">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`join-item btn flex-1 ${
                      type === t.value ? t.activeClass : "btn-ghost border-base-300"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-base-content/50">
                {TYPES.find((t) => t.value === type)?.desc}
              </p>
            </div>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Nome</span>
              </div>
              <input
                className="input input-bordered"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Estratégia base — tabela de missões"
                autoFocus
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Descrição (opcional)</span>
              </div>
              <textarea
                className="textarea textarea-bordered"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="O que esse teste cobre"
              />
            </label>

            {teams.length > 0 && (
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Equipe (opcional)</span>
                </div>
                <select
                  className="select select-bordered"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                >
                  <option value="">Só eu</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {error && (
              <div className="rounded border border-error/40 bg-error/10 px-3 py-2 font-mono text-xs text-error">
                {error}
              </div>
            )}

            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={handleClose} disabled={isPending}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-warning" disabled={isPending}>
                {isPending ? "Criando…" : "Continuar"}
              </button>
            </div>
          </form>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button aria-label="Fechar">fechar</button>
        </form>
      </dialog>
    </>
  );
}