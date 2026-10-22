"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Check,
  Eye,
  Info,
  Pencil,
  Search,
  Sparkles,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import {
  ACCESS_META,
  FEATURES,
  GENERAL_FEATURES,
  getLeagueAccess,
  type AccessLevel,
  type FeatureId,
} from "@/utils/stagebook/league-features";
import {
  removeLeagueInterest,
  saveLeagueInterest,
  type LeagueRelation,
} from "./actions";

export type LeagueItem = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  relation: LeagueRelation | null;
  teamName: string | null;
  season: string | null;
};

type Tab = "ligas" | "comparar";
type Filter = "all" | "participante" | "interessado" | "none";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "participante", label: "Participo" },
  { key: "interessado", label: "Acompanhando" },
  { key: "none", label: "Não adicionadas" },
];

const RELATION_LABEL: Record<LeagueRelation, string> = {
  participante: "Participo",
  interessado: "Acompanhando",
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Ranking para escolher o melhor nível de acesso entre várias ligas. */
const LEVEL_RANK: Record<AccessLevel, number> = {
  soon: 0,
  paused: 1,
  simple: 2,
  full: 3,
};

function LevelBadge({ level }: { level: AccessLevel }) {
  const meta = ACCESS_META[level];
  return (
    <span className={`badge badge-sm badge-outline ${meta.badge}`}>{meta.label}</span>
  );
}

export function LeaguesView({ leagues: serverLeagues }: { leagues: LeagueItem[] }) {
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(serverLeagues);
  useEffect(() => setItems(serverLeagues), [serverLeagues]);

  const [tab, setTab] = useState<Tab>("ligas");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  // Edição
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<LeagueItem | null>(null);
  const [draftRelation, setDraftRelation] = useState<LeagueRelation>("participante");
  const [draftTeam, setDraftTeam] = useState("");
  const [draftSeason, setDraftSeason] = useState("");

  const accessById = useMemo(
    () => new Map(items.map((l) => [l.id, getLeagueAccess(l)])),
    [items],
  );

  const counts = useMemo(
    () => ({
      all: items.length,
      participante: items.filter((l) => l.relation === "participante").length,
      interessado: items.filter((l) => l.relation === "interessado").length,
      none: items.filter((l) => !l.relation).length,
    }),
    [items],
  );

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    return items.filter((league) => {
      if (filter === "none" && league.relation) return false;
      if ((filter === "participante" || filter === "interessado") && league.relation !== filter) {
        return false;
      }
      if (!needle) return true;
      return normalize(`${league.code} ${league.name} ${league.description ?? ""}`).includes(needle);
    });
  }, [items, query, filter]);

  // Recursos liberados pelas ligas em que o usuário participa (melhor nível de cada um).
  const unlocked = useMemo(() => {
    const participating = items.filter((l) => l.relation === "participante");
    return FEATURES.map((feature) => {
      let best: AccessLevel | null = null;
      for (const league of participating) {
        const level = accessById.get(league.id)?.features.find((f) => f.id === feature.id)?.level;
        if (level && (best === null || LEVEL_RANK[level] > LEVEL_RANK[best])) best = level;
      }
      return { feature, level: best };
    });
  }, [items, accessById]);

  function patchLocal(id: string, patch: Partial<LeagueItem>) {
    setItems((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function run(action: () => Promise<void>, success: string, rollback: () => void) {
    startTransition(async () => {
      try {
        await action();
        addToast(success, "success");
      } catch (error) {
        rollback();
        addToast(
          error instanceof Error ? error.message : "Não foi possível atualizar a liga.",
          "error",
        );
      }
    });
  }

  function follow(league: LeagueItem) {
    const previous = league;
    patchLocal(league.id, { relation: "interessado", teamName: null, season: null });
    run(
      () => saveLeagueInterest({ leagueId: league.id, relationType: "interessado" }),
      `Acompanhando ${league.code}.`,
      () => patchLocal(league.id, previous),
    );
  }

  function remove(league: LeagueItem) {
    const previous = league;
    patchLocal(league.id, { relation: null, teamName: null, season: null });
    run(
      () => removeLeagueInterest(league.id),
      `${league.code} removida da sua lista.`,
      () => patchLocal(league.id, previous),
    );
  }

  function openEditor(league: LeagueItem, relation?: LeagueRelation) {
    setEditing(league);
    setDraftRelation(relation ?? league.relation ?? "participante");
    setDraftTeam(league.teamName ?? "");
    setDraftSeason(league.season ?? "");
    dialogRef.current?.showModal();
  }

  function saveEditor() {
    if (!editing) return;
    const league = editing;
    const participates = draftRelation === "participante";
    const next = {
      relation: draftRelation,
      teamName: participates ? draftTeam.trim() || null : null,
      season: participates ? draftSeason.trim() || null : null,
    };
    patchLocal(league.id, next);
    dialogRef.current?.close();
    run(
      () =>
        saveLeagueInterest({
          leagueId: league.id,
          relationType: draftRelation,
          teamName: next.teamName,
          season: next.season,
        }),
      "Liga atualizada.",
      () => patchLocal(league.id, league),
    );
  }

  return (
    <section className="min-h-full space-y-6 bg-base-100 px-4 py-8 text-base-content sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Ligas e <span className="text-primary">competições</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-base-content/60 sm:text-base">
            Veja as competições disponíveis, marque em quais você participa ou
            acompanha e confira os recursos que cada uma libera.
          </p>
        </div>

        <div className="join self-start" role="tablist" aria-label="Seções">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "ligas"}
            onClick={() => setTab("ligas")}
            className={`btn btn-sm join-item gap-2 ${tab === "ligas" ? "btn-primary" : "btn-ghost border-base-300"}`}
          >
            <Trophy size={15} />
            Ligas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "comparar"}
            onClick={() => setTab("comparar")}
            className={`btn btn-sm join-item gap-2 ${tab === "comparar" ? "btn-primary" : "btn-ghost border-base-300"}`}
          >
            <Eye size={15} />
            Comparar recursos
          </button>
        </div>
      </header>

      <div className="h-px bg-gradient-to-r from-primary/30 via-base-300 to-transparent" />

      {/* Recursos liberados para o usuário */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles size={15} />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Recursos liberados para você</h2>
            <p className="text-xs text-base-content/50">
              {counts.participante === 0
                ? "Marque as ligas em que você participa para ver o que elas liberam."
                : `Com base em ${counts.participante} ${counts.participante === 1 ? "liga em que você participa" : "ligas em que você participa"}.`}
            </p>
          </div>
        </div>

        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {unlocked.map(({ feature, level }) => (
            <li
              key={feature.id}
              className={`rounded-xl border p-3 ${level ? "border-base-300 bg-base-200/30" : "border-dashed border-base-300 opacity-60"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{feature.label}</p>
                {level ? <LevelBadge level={level} /> : <span className="text-[11px] text-base-content/40">—</span>}
              </div>
              <p className="mt-1 text-xs text-base-content/50">{feature.tool}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-base-content/45">
          Disponíveis em todas as ligas: {GENERAL_FEATURES.join(", ")}.
        </p>
      </div>

      {tab === "ligas" ? (
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-base-300 bg-base-100 p-3 shadow-sm">
            <label className="input input-sm flex w-full items-center gap-2 border-base-300 sm:w-64">
              <Search size={15} className="shrink-0 text-base-content/45" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar liga…"
                aria-label="Buscar liga"
                className="grow"
              />
            </label>

            <div className="join flex-wrap" role="group" aria-label="Filtrar ligas">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  className={`btn btn-sm join-item gap-1.5 ${filter === f.key ? "btn-primary" : "btn-ghost border-base-300"}`}
                >
                  {f.label}
                  <span className={`text-[10px] font-semibold ${filter === f.key ? "opacity-80" : "text-base-content/45"}`}>
                    {counts[f.key]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-base-300 p-12 text-center">
              <Trophy size={36} className="mx-auto mb-3 text-base-content/25" />
              <h2 className="font-medium">Nenhuma liga cadastrada</h2>
              <p className="mt-1 text-sm text-base-content/55">
                O catálogo de ligas ainda está vazio.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-base-300 p-10 text-center">
              <Search size={26} className="mx-auto mb-3 text-base-content/30" />
              <h2 className="font-semibold">Nenhuma liga encontrada</h2>
              <p className="mt-1 text-sm text-base-content/55">Ajuste a busca ou o filtro.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((league) => {
                const access = accessById.get(league.id)!;
                const active = league.relation !== null;
                return (
                  <li
                    key={league.id}
                    className={`flex flex-col rounded-2xl border bg-base-100 p-5 transition-colors ${
                      league.relation === "participante"
                        ? "border-primary/40 bg-primary/[0.03]"
                        : "border-base-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-black tracking-tight text-primary">
                        {league.code.slice(0, 4).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-semibold leading-snug">{league.name}</h2>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="text-xs text-base-content/45">{league.code}</span>
                          {league.relation && (
                            <span
                              className={`badge badge-sm ${league.relation === "participante" ? "badge-primary" : "badge-outline"}`}
                            >
                              {RELATION_LABEL[league.relation]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {league.description && (
                      <p className="mt-3 line-clamp-3 text-xs leading-5 text-base-content/55">
                        {league.description}
                      </p>
                    )}

                    {league.relation === "participante" && (league.teamName || league.season) && (
                      <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-base-content/60">
                        <Users size={13} />
                        {[league.teamName, league.season].filter(Boolean).join(" · ")}
                      </p>
                    )}

                    <div className="mt-4 space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-base-content/45">
                        Recursos
                      </p>
                      <ul className="space-y-1.5">
                        {access.features.map((feature) => (
                          <li
                            key={feature.id}
                            title={feature.detail}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <span className={active || feature.level === "full" ? "" : "text-base-content/60"}>
                              {feature.label}
                            </span>
                            <LevelBadge level={feature.level} />
                          </li>
                        ))}
                      </ul>
                      {access.note && (
                        <p className="flex items-start gap-1.5 pt-1 text-[11px] leading-4 text-base-content/45">
                          <Info size={12} className="mt-px shrink-0" />
                          {access.note}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex flex-1 items-end gap-2">
                      {league.relation ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm flex-1 gap-2 border-base-300"
                            onClick={() => openEditor(league)}
                            disabled={isPending}
                          >
                            <Pencil size={14} />
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-square text-error"
                            title="Remover da minha lista"
                            aria-label={`Remover ${league.code} da minha lista`}
                            onClick={() => remove(league)}
                            disabled={isPending}
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm flex-1"
                            onClick={() => openEditor(league, "participante")}
                            disabled={isPending}
                          >
                            Participo
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm flex-1 border-base-300"
                            onClick={() => follow(league)}
                            disabled={isPending}
                          >
                            Acompanhar
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : (
        <CompareTable items={items} accessById={accessById} />
      )}

      {/* Modal de edição */}
      <dialog ref={dialogRef} className="modal" onClose={() => setEditing(null)}>
        <div className="modal-box max-w-md border border-base-300">
          <h3 className="text-lg font-bold">{editing?.name}</h3>
          <p className="mt-1 text-xs text-base-content/50">{editing?.code}</p>

          <div className="mt-5 space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                Sua relação
              </p>
              <div className="join w-full">
                {(Object.keys(RELATION_LABEL) as LeagueRelation[]).map((relation) => (
                  <button
                    key={relation}
                    type="button"
                    aria-pressed={draftRelation === relation}
                    onClick={() => setDraftRelation(relation)}
                    className={`btn btn-sm join-item flex-1 gap-1.5 ${draftRelation === relation ? "btn-primary" : "btn-ghost border-base-300"}`}
                  >
                    {draftRelation === relation && <Check size={14} />}
                    {RELATION_LABEL[relation]}
                  </button>
                ))}
              </div>
            </div>

            {draftRelation === "participante" ? (
              <>
                <label className="form-control w-full">
                  <span className="label-text mb-1 text-xs font-semibold">Nome da equipe</span>
                  <input
                    className="input input-sm w-full border-base-300"
                    value={draftTeam}
                    maxLength={80}
                    onChange={(e) => setDraftTeam(e.target.value)}
                    placeholder="Opcional"
                  />
                </label>
                <label className="form-control w-full">
                  <span className="label-text mb-1 text-xs font-semibold">Temporada</span>
                  <input
                    className="input input-sm w-full border-base-300"
                    value={draftSeason}
                    maxLength={40}
                    onChange={(e) => setDraftSeason(e.target.value)}
                    placeholder="Ex.: 2026/2027"
                  />
                </label>
              </>
            ) : (
              <p className="rounded-lg bg-base-200/60 p-3 text-xs text-base-content/60">
                Equipe e temporada só são registradas para quem participa da liga.
              </p>
            )}

            {editing && (
              <div className="rounded-xl border border-base-300 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-base-content/45">
                  O que esta liga libera
                </p>
                <ul className="space-y-1.5">
                  {getLeagueAccess(editing).features.map((f) => (
                    <li key={f.id} className="flex items-center justify-between gap-2 text-xs">
                      <span>{f.label}</span>
                      <LevelBadge level={f.level} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => dialogRef.current?.close()}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={saveEditor} disabled={isPending}>
              Salvar
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit" aria-label="Fechar">fechar</button>
        </form>
      </dialog>
    </section>
  );
}

function CompareTable({
  items,
  accessById,
}: {
  items: LeagueItem[];
  accessById: Map<string, ReturnType<typeof getLeagueAccess>>;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
        <table className="table">
          <thead>
            <tr className="border-base-300 bg-base-200/40 text-xs uppercase tracking-wide text-base-content/55">
              <th>Liga</th>
              {FEATURES.map((feature) => (
                <th key={feature.id}>
                  <span className="block font-semibold">{feature.label}</span>
                  <span className="block text-[10px] font-normal normal-case text-base-content/40">
                    {feature.tool}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((league) => {
              const access = accessById.get(league.id)!;
              const byFeature = new Map<FeatureId, (typeof access.features)[number]>(
                access.features.map((f) => [f.id, f]),
              );
              return (
                <tr
                  key={league.id}
                  className={`border-base-300/60 ${league.relation === "participante" ? "bg-primary/[0.04]" : ""}`}
                >
                  <td className="min-w-48">
                    <p className="text-sm font-semibold">{league.name}</p>
                    <p className="text-xs text-base-content/45">
                      {league.code}
                      {league.relation && ` · ${RELATION_LABEL[league.relation]}`}
                    </p>
                  </td>
                  {FEATURES.map((feature) => {
                    const cell = byFeature.get(feature.id)!;
                    return (
                      <td key={feature.id} className="min-w-44 align-top">
                        <LevelBadge level={cell.level} />
                        <p className="mt-1 text-[11px] leading-4 text-base-content/50">
                          {cell.detail}
                        </p>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-base-content/50">
        {(Object.keys(ACCESS_META) as AccessLevel[]).map((level) => (
          <span key={level} className="inline-flex items-center gap-1.5">
            <LevelBadge level={level} />
          </span>
        ))}
        <span>· Em todas as ligas: {GENERAL_FEATURES.join(", ")}.</span>
      </p>
    </div>
  );
}
