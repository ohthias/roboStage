"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Box, Camera, Layers3, NotebookPen, Plus, Search, Trophy } from "lucide-react";
import { TagChip, TagList } from "@/components/stagebook/labels/tag-chip";
import { MilestoneChip } from "@/components/stagebook/labels/milestone-chip";
import {
  NOTEBOOK_MAX_PHOTOS,
  seasonName,
  type NotebookCardDTO,
  type QuickbrickLeague,
} from "@/utils/quickbrick/notebook";
import { NotebookFormModal } from "./notebook-form";
import { fmtDate } from "./upload";

/** Estante de cadernos: capas, busca e filtro por tag. */
export function NotebookShelf({
  notebooks,
  leagues,
}: {
  notebooks: NotebookCardDTO[];
  /** Competições do usuário, com a marca de suporte ao QuickBrick. */
  leagues: QuickbrickLeague[];
}) {
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [tagId, setTagId] = useState<string | null>(null);
  const [leagueId, setLeagueId] = useState<string | null>(null);

  const supported = leagues.filter((l) => l.supported);
  const soon = leagues.filter((l) => !l.supported);

  // Competições que aparecem nos cadernos (para o filtro).
  const notebookLeagues = useMemo(() => {
    const map = new Map(notebooks.flatMap((n) => (n.league ? [[n.league.id, n.league] as const] : [])));
    return [...map.values()].sort((a, b) => a.code.localeCompare(b.code));
  }, [notebooks]);

  const allTags = useMemo(() => {
    const map = new Map(notebooks.flatMap((n) => n.tags).map((t) => [t.id, t]));
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [notebooks]);

  const visible = notebooks.filter((n) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || [n.name, n.robotName, n.description].some((v) => v?.toLowerCase().includes(q));
    const matchesTag = !tagId || n.tags.some((t) => t.id === tagId);
    const matchesLeague = !leagueId || n.league?.id === leagueId;
    return matchesQuery && matchesTag && matchesLeague;
  });

  return (
    <div className="qb-paper min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="qb-hand text-lg text-base-content/55">Cadernos do robô</p>
            <h1 className="text-5xl font-bold leading-none sm:text-6xl">
              QuickBrick <span className="italic text-primary">Studio</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-base-content/60 sm:text-base">
              Registre cada versão do robô com fotos, data e anotações, guarde o projeto 3D do Studio 2.0 e
              planeje estratégias, riscos e missões no mesmo caderno.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/fll/quickbrick" className="btn btn-ghost border-base-300">
              Ferramentas avulsas
            </Link>
            <button className="btn btn-primary" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Novo caderno
            </button>
          </div>
        </header>

        <CompetitionsStrip supported={supported} soon={soon} />

        {notebooks.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="input input-bordered flex w-full items-center gap-2 bg-base-100 sm:max-w-xs">
              <Search className="size-4 text-base-content/40" />
              <input
                type="search"
                className="grow"
                placeholder="Buscar caderno ou robô"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            {notebookLeagues.length > 1 && (
              <select
                className="select select-bordered bg-base-100 sm:w-48"
                value={leagueId ?? ""}
                onChange={(e) => setLeagueId(e.target.value || null)}
                aria-label="Filtrar por competição"
              >
                <option value="">Todas as competições</option>
                {notebookLeagues.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code}
                  </option>
                ))}
              </select>
            )}
            {allTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrar por tag">
                <button
                  className={`btn btn-xs ${tagId === null ? "btn-neutral" : "btn-ghost border-base-300"}`}
                  onClick={() => setTagId(null)}
                >
                  Todas
                </button>
                {allTags.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTagId(tagId === t.id ? null : t.id)}
                    aria-pressed={tagId === t.id}
                    className={`rounded-full transition ${tagId === t.id ? "ring-2 ring-base-content/30 ring-offset-1" : "opacity-80 hover:opacity-100"}`}
                  >
                    <TagChip tag={t} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {notebooks.length === 0 ? (
          <section className="qb-sheet qb-margin flex min-h-80 flex-col items-center justify-center px-6 py-14 text-center">
            <span className="mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <NotebookPen className="size-7" strokeWidth={1.6} />
            </span>
            <h2 className="qb-serif text-3xl">Seu primeiro caderno</h2>
            <p className="qb-hand mt-2 max-w-md text-lg leading-snug text-base-content/60">
              Um caderno por robô: até {NOTEBOOK_MAX_PHOTOS} fotos de versões, o modelo 3D e os diagramas da equipe.
            </p>
            <button className="btn btn-primary mt-6" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Criar caderno
            </button>
          </section>
        ) : visible.length === 0 ? (
          <p className="qb-hand py-10 text-center text-lg text-base-content/55">Nenhum caderno encontrado com esse filtro.</p>
        ) : (
          <section className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((n) => (
              <NotebookCover key={n.id} notebook={n} />
            ))}
          </section>
        )}
      </div>

      {creating && <NotebookFormModal open leagues={leagues} onClose={() => setCreating(false)} />}
    </div>
  );
}

function NotebookCover({ notebook: n }: { notebook: NotebookCardDTO }) {
  const color = n.coverColor ?? "#cf2a2a";
  return (
    <article className="group">
      <Link
        href={`/dashboard/quickbrick/${n.id}`}
        className="qb-spiral relative block aspect-[4/5] overflow-hidden rounded-r-2xl rounded-l-md shadow-[0_14px_30px_-18px_rgba(0,0,0,0.55)] transition duration-200 group-hover:-translate-y-1 group-hover:rotate-[-0.6deg]"
        style={{
          background: `linear-gradient(135deg, ${color}, color-mix(in oklab, ${color} 70%, black))`,
        }}
        aria-label={`Abrir ${n.name}`}
      >
        {/* textura de capa dura */}
        <span
          aria-hidden
          className="absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,.25) 0 1px, transparent 1px 6px)",
          }}
        />
        {n.league && (
          <span
            className={`absolute left-6 top-5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              n.league.supported ? "bg-white/85 text-black/70" : "bg-black/35 text-white/80"
            }`}
            title={n.league.name}
          >
            {n.league.code}
          </span>
        )}
        {/* elástico */}
        <span aria-hidden className="absolute bottom-0 right-6 top-0 w-2 bg-black/25" />

        {n.coverUrl && (
          <span className="qb-polaroid absolute right-9 top-6 w-[46%] rotate-[4deg]">
            <span className="qb-tape" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={n.coverUrl} alt="" className="aspect-square w-full rounded-sm object-cover" />
          </span>
        )}

        {/* etiqueta */}
        <span className="absolute bottom-6 left-6 right-12 rounded-md bg-base-100 px-3 py-2.5 shadow-md">
          <span className="qb-serif block truncate text-xl leading-tight text-base-content">{n.name}</span>
          <span className="qb-hand block truncate text-base text-base-content/55">
            {n.robotName ? `Robô ${n.robotName}` : (seasonName(n.season) ?? "Caderno do robô")}
          </span>
        </span>
      </Link>

      <div className="mt-3 space-y-2 px-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/55">
          <span className="inline-flex items-center gap-1" title="Fotos / versões">
            <Camera className="size-3.5" /> {n.photoCount}/{NOTEBOOK_MAX_PHOTOS}
          </span>
          <span className="inline-flex items-center gap-1" title="Diagramas">
            <Layers3 className="size-3.5" /> {n.diagramCount}
          </span>
          {n.studio && (
            <span className="inline-flex items-center gap-1" title="Projeto do Studio 2.0">
              <Box className="size-3.5" /> 3D
            </span>
          )}
          <span className="ml-auto">{fmtDate(n.updatedAt)}</span>
        </div>
        {(n.tags.length > 0 || n.milestone) && (
          <div className="flex flex-wrap items-center gap-1">
            {n.milestone && <MilestoneChip milestone={n.milestone} size="xs" />}
            <TagList tags={n.tags} />
          </div>
        )}
      </div>
    </article>
  );
}

/** Faixa com as competições do usuário e o suporte de cada uma ao QuickBrick. */
function CompetitionsStrip({ supported, soon }: { supported: QuickbrickLeague[]; soon: QuickbrickLeague[] }) {
  if (supported.length === 0) {
    return (
      <div className="qb-sheet flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-3 text-sm text-base-content/70">
          <Trophy className="mt-0.5 size-5 shrink-0 text-primary" />
          <span>
            O QuickBrick Studio está disponível para a <b>FIRST LEGO League Challenge</b>. Adicione a FLL às suas
            competições para criar cadernos{soon.length ? ` — ${soon.map((l) => l.code).join(", ")} ainda não têm suporte.` : "."}
          </span>
        </p>
        <Link href="/dashboard/leagues" className="btn btn-sm btn-primary shrink-0">
          Ligas e Competições
        </Link>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="qb-label mr-1">Suas competições</span>
      {supported.map((l) => (
        <span key={l.id} className="badge badge-primary badge-soft gap-1" title={l.name}>
          <Trophy className="size-3" /> {l.code}
        </span>
      ))}
      {soon.map((l) => (
        <span key={l.id} className="badge badge-ghost gap-1 text-base-content/50" title={`${l.name} — em breve`}>
          {l.code} · em breve
        </span>
      ))}
    </div>
  );
}
