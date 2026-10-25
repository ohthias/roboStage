"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Trophy } from "lucide-react";
import { Modal } from "@/components/stagebook/modal";
import { useToast } from "@/app/context/ToastContext";
import { createNotebook, updateNotebook } from "@/app/(protected)/dashboard/quickbrick/actions";
import {
  COVER_COLORS,
  NOTEBOOK_SEASONS,
  matchSeason,
  type NotebookDTO,
  type QuickbrickLeague,
} from "@/utils/quickbrick/notebook";

type Values = { leagueId: string; name: string; robotName: string; description: string; season: string; coverColor: string };

/** Criar ou editar os dados do caderno (nome, robô, temporada, capa). */
export function NotebookFormModal({
  open,
  onClose,
  notebook,
  leagues,
  onSaved,
}: {
  /** Competições do usuário (Ligas e Competições). */
  leagues: QuickbrickLeague[];
  open: boolean;
  onClose: () => void;
  /** Ausente = criar um caderno novo. */
  notebook?: NotebookDTO;
  onSaved?: (values: Values) => void;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // A liga atual do caderno sempre aparece, mesmo que o usuário não a acompanhe
  // (ex.: caderno criado por outra pessoa da equipe).
  const current = notebook?.league;
  const options: QuickbrickLeague[] =
    current && !leagues.some((l) => l.id === current.id)
      ? [{ ...current, relation: null, season: null }, ...leagues]
      : leagues;
  const supported = options.filter((l) => l.supported);
  const [values, setValues] = useState<Values>(() => {
    const first = supported[0];
    return {
      leagueId: notebook?.league?.id ?? first?.id ?? "",
      name: notebook?.name ?? "",
      robotName: notebook?.robotName ?? "",
      description: notebook?.description ?? "",
      season: notebook?.season ?? matchSeason(first?.season) ?? "bioglow",
      coverColor: notebook?.coverColor ?? COVER_COLORS[0],
    };
  });
  const set = (patch: Partial<Values>) => setValues((v) => ({ ...v, ...patch }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      if (notebook) {
        const res = await updateNotebook(notebook.id, values);
        if (!res.ok) return setError(res.error);
        onSaved?.(values);
        addToast("Caderno atualizado!", "success");
        onClose();
        router.refresh();
      } else {
        const res = await createNotebook(values);
        if (!res.ok) return setError(res.error);
        router.push(`/dashboard/quickbrick/${res.data.id}`);
      }
    });
  };

  return (
    <Modal
      open={open}
      onClose={pending ? () => {} : onClose}
      title={notebook ? "Editar caderno" : "Novo caderno do robô"}
      description={
        notebook
          ? "Fotos, diagramas e o projeto do Studio continuam no caderno."
          : "Um caderno por robô: registre as versões, o projeto 3D e as estratégias."
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {supported.length === 0 && !current ? (
          <div className="rounded-xl border border-dashed border-base-300 bg-base-200/40 p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold">
              <Trophy className="size-4 text-primary" /> Nenhuma competição com suporte
            </p>
            <p className="mt-1 text-base-content/65">
              Por enquanto o QuickBrick Studio funciona só na <b>FIRST LEGO League Challenge</b>. Adicione a FLL em
              Ligas e Competições para criar cadernos.
            </p>
            <Link href="/dashboard/leagues" className="btn btn-sm btn-primary mt-3">
              Abrir Ligas e Competições
            </Link>
          </div>
        ) : (
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Competição</span>
            <select
              className="select select-bordered w-full"
              value={values.leagueId}
              onChange={(e) => {
                const league = options.find((l) => l.id === e.target.value);
                set({ leagueId: e.target.value, season: matchSeason(league?.season) ?? values.season });
              }}
              required
            >
              {!values.leagueId && <option value="">Escolha a competição</option>}
              {options.map((l) => (
                <option key={l.id} value={l.id} disabled={!l.supported}>
                  {l.code} — {l.name}
                  {l.supported ? "" : " (em breve)"}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-base-content/50">
              Suas competições de Ligas e Competições. Só a FLL tem suporte por enquanto.
            </span>
          </label>
        )}
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Nome do caderno</span>
          <input
            className="input input-bordered w-full"
            value={values.name}
            onChange={(e) => set({ name: e.target.value })}
            maxLength={100}
            required
            autoFocus
            placeholder="Ex.: Caderno do Robô 2026"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Nome do robô</span>
            <input
              className="input input-bordered w-full"
              value={values.robotName}
              onChange={(e) => set({ robotName: e.target.value })}
              maxLength={80}
              placeholder="Ex.: Tatu-bola"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Temporada</span>
            <select
              className="select select-bordered w-full"
              value={values.season}
              onChange={(e) => set({ season: e.target.value })}
            >
              {NOTEBOOK_SEASONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">
            Descrição <span className="font-normal text-base-content/45">(opcional)</span>
          </span>
          <textarea
            className="textarea textarea-bordered min-h-20 w-full"
            value={values.description}
            onChange={(e) => set({ description: e.target.value })}
            maxLength={1000}
            placeholder="Objetivo do robô, base, sensores principais…"
          />
        </label>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Cor da capa</legend>
          <div className="flex flex-wrap gap-2">
            {COVER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set({ coverColor: c })}
                aria-label={`Cor ${c}`}
                aria-pressed={values.coverColor === c}
                className="grid size-9 place-items-center rounded-lg ring-offset-2 ring-offset-base-100 transition aria-pressed:ring-2 aria-pressed:ring-base-content/40"
                style={{ background: c }}
              >
                {values.coverColor === c && <Check className="size-4 text-white" />}
              </button>
            ))}
          </div>
        </fieldset>

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={pending}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={pending || !values.name.trim() || !values.leagueId}>
            {pending && <span className="loading loading-spinner loading-xs" />}
            {notebook ? "Salvar" : "Criar caderno"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
