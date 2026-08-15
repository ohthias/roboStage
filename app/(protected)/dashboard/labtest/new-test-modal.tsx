"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createLabTest } from "./actions";
import {
  FlaskConical,
  X,
  Zap,
  ClipboardCheck,
  FileText,
  Users,
  LoaderCircle,
} from "lucide-react";

const TYPES = [
  {
    value: "run",
    label: "Run",
    desc: "Execuções cronometradas na mesa oficial da FLL.",
    activeClass: "btn-primary",
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
        router.push(`/dashboard/labtest/${test.id}/setup`);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não deu pra criar o teste. Tenta de novo.",
        );
      }
    });
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-primary gap-2"
        onClick={() => dialogRef.current?.showModal()}
      >
        <FlaskConical size={17} />
        {triggerLabel}
      </button>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box max-w-2xl overflow-hidden border border-base-300 bg-base-100 p-0 shadow-2xl">
          <div className="border-b border-base-300 bg-base-200/60 px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <FlaskConical size={23} strokeWidth={2} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold">Novo teste</h3>

                <p className="mt-1 text-sm leading-relaxed text-base-content/60">
                  Escolha uma modalidade e configure seu teste no próximo passo.
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
              <fieldset>
                <div className="mb-3 flex items-center justify-between">
                  <legend className="flex items-center gap-2 text-sm font-semibold">
                    <Zap size={15} className="text-base-content/50" />
                    Modalidade
                  </legend>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {TYPES.map((t) => {
                    const selected = type === t.value;

                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setType(t.value)}
                        disabled={isPending}
                        className={`group flex min-h-24 flex-col items-start justify-between rounded-xl border p-3 text-left transition-all ${
                          selected
                            ? `${t.activeClass} border-current shadow-sm`
                            : "border-base-300 bg-base-100 hover:border-base-content/30 hover:bg-base-200/50"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="font-semibold text-sm">
                            {t.label}
                          </span>

                          <span
                            className={`flex size-5 items-center justify-center rounded-full border ${
                              selected
                                ? "border-current bg-current/10"
                                : "border-base-300"
                            }`}
                          >
                            {selected && (
                              <span className="size-2 rounded-full bg-current" />
                            )}
                          </span>
                        </div>

                        <span
                          className={`mt-2 text-xs leading-relaxed ${
                            selected
                              ? "text-current/70"
                              : "text-base-content/50"
                          }`}
                        >
                          {t.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Nome */}
              <fieldset className="form-control">
                <label htmlFor="test-name" className="label px-0 pb-2">
                  <span className="label-text flex items-center gap-2 font-semibold">
                    <ClipboardCheck
                      size={15}
                      className="text-base-content/50"
                    />
                    Nome
                  </span>
                </label>

                <input
                  id="test-name"
                  type="text"
                  className="input input-bordered w-full transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Estratégia base — tabela de missões"
                  autoFocus
                  disabled={isPending}
                />
              </fieldset>

              {/* Descrição */}
              <fieldset className="form-control">
                <label htmlFor="test-description" className="label px-0 pb-2">
                  <span className="label-text flex items-center gap-2 font-semibold">
                    <FileText size={15} className="text-base-content/50" />
                    Descrição
                  </span>
                </label>

                <textarea
                  id="test-description"
                  className="textarea textarea-bordered min-h-20 w-full resize-none transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Descreva o objetivo ou conteúdo deste teste..."
                  disabled={isPending}
                />
              </fieldset>

              {/* Equipe */}
              {teams.length > 0 && (
                <fieldset className="form-control">
                  <label htmlFor="test-team" className="label px-0 pb-2">
                    <span className="label-text flex items-center gap-2 font-semibold">
                      <Users size={15} className="text-base-content/50" />
                      Equipe
                    </span>

                    <span className="label-text-alt text-base-content/40">
                      Opcional
                    </span>
                  </label>

                  <select
                    id="test-team"
                    className="select select-bordered w-full transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    disabled={isPending}
                  >
                    <option value="">Só eu</option>

                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </fieldset>
              )}

              {/* Informação */}
              <div className="alert border border-base-300 bg-base-200/50 text-sm">
                <FlaskConical
                  size={18}
                  className="shrink-0 text-base-content/50"
                />

                <span className="text-base-content/70">
                  A configuração detalhada do teste será definida na próxima
                  etapa.
                </span>
              </div>

              {/* Erro */}
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

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-base-300 bg-base-200/40 px-6 py-4">
              <button
                type="button"
                className="btn btn-ghost"
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
                    Criando...
                  </>
                ) : (
                  <>
                    Continuar
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
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
            fechar
          </button>
        </form>
      </dialog>
    </>
  );
}
