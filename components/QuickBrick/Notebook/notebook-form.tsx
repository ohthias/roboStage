"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookPlus, Check, Trophy } from "lucide-react";
import { DialogNote, ChipGroup, Field, FieldGroup, FormDialog, OptionCard } from "@/components/UI/Modal/FormDialog";
import { useToast } from "@/app/context/ToastContext";
import { createNotebook, updateNotebook } from "@/app/(protected)/dashboard/quickbrick/actions";
import {
  COVER_COLORS,
  NOTEBOOK_SEASONS,
  matchSeason,
  seasonName,
  type NotebookDTO,
  type QuickbrickLeague,
} from "@/utils/quickbrick/notebook";

type Values = { leagueId: string; name: string; robotName: string; description: string; season: string; coverColor: string };

/** "Bioglow (2026/27)" → ["Bioglow", "2026/27"] */
const splitSeason = (name: string) => {
  const m = /^(.*?)\s*\((.+)\)$/.exec(name);
  return m ? [m[1], m[2]] : [name, undefined];
};

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
  const noLeague = supported.length === 0 && !current;
  const league = options.find((l) => l.id === values.leagueId);

  const submit = () => {
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
    <FormDialog
      open={open}
      onClose={onClose}
      eyebrow="QuickBrick · Caderno"
      title={notebook ? "Editar caderno" : "Novo caderno do robô"}
      description={
        notebook
          ? "Fotos, diagramas e o projeto do Studio continuam no caderno."
          : "Um caderno por robô: registre as versões, o projeto 3D e as estratégias."
      }
      size="lg"
      busy={pending}
      onSubmit={submit}
      footer={
        <>
          <span />
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost rounded-lg" onClick={onClose} disabled={pending}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary gap-2 rounded-lg"
              disabled={pending || !values.name.trim() || !values.leagueId}
            >
              {pending ? <span className="loading loading-spinner loading-sm" /> : !notebook && <BookPlus size={16} />}
              {notebook ? "Salvar" : "Criar caderno"}
            </button>
          </div>
        </>
      }
    >
      {noLeague ? (
        <DialogNote icon={<Trophy className="size-4 text-primary" />}>
          <p className="font-semibold text-base-content">Nenhuma competição com suporte</p>
          <p className="mt-0.5">
            Por enquanto o QuickBrick Studio funciona só na <b>FIRST LEGO League Challenge</b>. Adicione a FLL em Ligas e
            Competições para criar cadernos.
          </p>
          <Link href="/dashboard/leagues" className="btn btn-sm btn-primary mt-3 rounded-lg">
            Abrir Ligas e Competições
          </Link>
        </DialogNote>
      ) : (
        <FieldGroup legend="Competição" hint="Suas competições de Ligas e Competições. Só a FLL tem suporte por enquanto.">
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Competição">
            {options.map((l) => (
              <OptionCard
                key={l.id}
                active={values.leagueId === l.id}
                disabled={!l.supported}
                onClick={() => set({ leagueId: l.id, season: matchSeason(l.season) ?? values.season })}
                icon={<Trophy size={18} />}
                title={l.code}
                badge={l.supported ? undefined : "Em breve"}
                description={l.name}
              />
            ))}
          </div>
        </FieldGroup>
      )}

      <div className="grid gap-5 sm:grid-cols-[1fr_168px]">
        <div className="space-y-4">
          <Field label="Nome do caderno">
            <input
              className="input input-bordered w-full"
              value={values.name}
              onChange={(e) => set({ name: e.target.value })}
              maxLength={100}
              required
              autoFocus
              placeholder="Ex.: Caderno do Robô 2026"
            />
          </Field>
          <Field label="Nome do robô" optional>
            <input
              className="input input-bordered w-full"
              value={values.robotName}
              onChange={(e) => set({ robotName: e.target.value })}
              maxLength={80}
              placeholder="Ex.: Tatu-bola"
            />
          </Field>
          <FieldGroup legend="Cor da capa">
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cor da capa">
              {COVER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  onClick={() => set({ coverColor: c })}
                  aria-label={`Cor ${c}`}
                  aria-checked={values.coverColor === c}
                  className="grid size-8 place-items-center rounded-tl-lg rounded-br-lg ring-offset-2 ring-offset-base-100 transition hover:scale-105 aria-checked:ring-2 aria-checked:ring-base-content/50"
                  style={{ background: c }}
                >
                  {values.coverColor === c && <Check className="size-4 text-white" />}
                </button>
              ))}
            </div>
          </FieldGroup>
        </div>

        {/* Prévia da capa — o mesmo desenho da estante. */}
        <div className="hidden sm:block" aria-hidden>
          <p className="mb-2 text-sm font-medium">Prévia</p>
          <div
            className="qb-spiral relative aspect-[4/5] overflow-hidden rounded-l-md rounded-r-2xl shadow-[0_14px_30px_-18px_rgba(0,0,0,0.55)] transition-colors"
            style={{ background: `linear-gradient(135deg, ${values.coverColor}, color-mix(in oklab, ${values.coverColor} 70%, black))` }}
          >
            <span
              className="absolute inset-0 opacity-25 mix-blend-overlay"
              style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,.25) 0 1px, transparent 1px 6px)" }}
            />
            {league && (
              <span className="absolute left-5 top-4 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black/70">
                {league.code}
              </span>
            )}
            <span className="absolute bottom-0 right-4 top-0 w-1.5 bg-black/25" />
            <span className="absolute bottom-4 left-5 right-8 rounded-md bg-base-100 px-2.5 py-2 shadow-md">
              <span className="qb-serif block truncate text-base leading-tight text-base-content">
                {values.name.trim() || "Seu caderno"}
              </span>
              <span className="qb-hand block truncate text-sm text-base-content/55">
                {values.robotName.trim() ? `Robô ${values.robotName.trim()}` : (seasonName(values.season) ?? "Caderno do robô")}
              </span>
            </span>
          </div>
        </div>
      </div>

      <FieldGroup legend="Temporada">
        <ChipGroup
          ariaLabel="Temporada"
          value={values.season}
          onChange={(season) => set({ season })}
          options={NOTEBOOK_SEASONS.map((s) => {
            const [label, meta] = splitSeason(s.name);
            return { value: s.id as string, label, meta };
          })}
        />
      </FieldGroup>

      <Field label="Descrição" optional>
        <textarea
          className="textarea textarea-bordered min-h-20 w-full"
          value={values.description}
          onChange={(e) => set({ description: e.target.value })}
          maxLength={1000}
          placeholder="Objetivo do robô, base, sensores principais…"
        />
      </Field>

      {error && <DialogNote tone="error">{error}</DialogNote>}
    </FormDialog>
  );
}
