"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, CalendarClock, Crown, Search, TrendingDown, TrendingUp } from "lucide-react";

import { allianceCountFor, firstRoundPairings } from "@/features/leagues/ftc/lib/biobuzz";
import {
  allTeamStats,
  bestPartners,
  emptyScouting,
  evaluatePair,
  hasData,
  parseScouting,
  qualificationOrder,
  rankPairs,
  simulateSelection,
  winChance,
  type PairEvaluation,
  type ScoutingData,
  type TeamStats,
} from "@/features/leagues/ftc/lib/scouting";
import { ftcscoutTeamUrl, performanceSummary, teamMatches } from "@/features/leagues/ftc/lib/ftcscout";
import { STORAGE_KEYS, usePersistentState } from "@/features/leagues/ftc/lib/storage";
import EventBar, { FtcScoutAttribution, FtcScoutBadge } from "./FtcScoutPanel";
import ScoutRecord from "./ScoutRecord";

type Tab = "equipes" | "aliancas" | "anotar";
type SetData = (fn: (d: ScoutingData) => ScoutingData) => void;

const fmt = (n: number | undefined, d = 0) => (n != null && Number.isFinite(n) ? n.toFixed(d) : "—");
const pct = (n: number) => `${Math.round(n * 100)}%`;
const card = "rounded-2xl border border-base-300 bg-base-100";
const h3 = "text-sm font-semibold";

/* ============================================================ equipes */

type Sort = "rank" | "opr" | "rating";

/** Aviso mostrado antes da primeira partida do evento: a lista é das inscritas, com números da temporada. */
function PreEventBanner({ registered, withOpr }: { registered: number; withOpr: number }) {
  return (
    <div className={`${card} mb-6 flex items-start gap-3 p-4`}>
      <CalendarClock size={18} className="mt-0.5 shrink-0 text-primary" />
      <p className="text-sm leading-6 text-base-content/75">
        <b>O evento ainda não começou.</b> Estas são as {registered} equipes inscritas
        {withOpr > 0 ? (
          <>
            {" "}
            — {withOpr} já jogaram nesta temporada e aparecem com o <b>melhor OPR</b> que fizeram em outros eventos.
          </>
        ) : (
          "; nenhuma jogou ainda nesta temporada."
        )}{" "}
        Os números trocam para os do evento assim que as partidas começarem.
      </p>
    </div>
  );
}

function TeamsView({
  stats,
  data,
  ours,
  selected,
  started,
  onSelect,
  onPartners,
}: {
  stats: TeamStats[];
  data: ScoutingData;
  ours: string;
  selected: string;
  started: boolean;
  onSelect: (n: string) => void;
  onPartners: () => void;
}) {
  // Antes do evento não há ranking: a ordem padrão passa a ser o OPR da temporada.
  const [sortChoice, setSort] = useState<Sort | null>(null);
  const sort: Sort = sortChoice ?? (started ? "rank" : "opr");
  const [q, setQ] = useState("");
  const maxOpr = Math.max(1, ...stats.map((t) => t.opr ?? 0));

  const rows = useMemo(() => {
    const list =
      sort === "rank"
        ? qualificationOrder(stats)
        : [...stats].sort((a, b) => (sort === "opr" ? (b.opr ?? -1) - (a.opr ?? -1) : b.rating - a.rating));
    const term = q.trim().toLowerCase();
    return term ? list.filter((t) => t.number.includes(term) || t.name.toLowerCase().includes(term)) : list;
  }, [stats, sort, q]);

  const current = stats.find((t) => t.number === selected) ?? rows[0];

  if (!stats.length) {
    return <EmptyState text="Escolha a regional ou etapa na barra acima para ver as equipes inscritas e o desempenho delas na temporada." />;
  }

  const sorts = (
    [
      ["rank", started ? "Ranking" : "Projeção"],
      ["opr", "OPR"],
      ["rating", "Nota"],
    ] as const
  ).filter(([k]) => started || k !== "rating" || stats.some((t) => t.matches > 0));

  return (
    <>
      {!started && <PreEventBanner registered={stats.length} withOpr={stats.filter((t) => t.opr != null).length} />}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="input input-bordered input-sm flex min-w-0 flex-1 items-center gap-2">
              <Search size={14} className="text-base-content/40" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar equipe" className="min-w-0 grow" />
            </label>
            <div className="join" role="radiogroup" aria-label="Ordenar equipes">
              {sorts.map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={sort === k}
                  onClick={() => setSort(k)}
                  className={`btn join-item btn-sm ${sort === k ? "btn-neutral" : "btn-ghost"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <ul className="divide-y divide-base-200 rounded-2xl border border-base-300 bg-base-100">
            {rows.map((t, i) => {
              const active = current?.number === t.number;
              const position = t.officialRank ?? t.rank ?? (sort !== "rating" ? (sort === "rank" ? `~${i + 1}` : `${i + 1}`) : "");
              return (
                <li key={t.number}>
                  <button
                    type="button"
                    onClick={() => onSelect(t.number)}
                    aria-current={active ? "true" : undefined}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${active ? "bg-base-200" : "hover:bg-base-200/50"}`}
                  >
                    <span className="w-7 shrink-0 font-mono text-xs text-base-content/40">{position}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{t.number}</span>
                        {t.number === ours && <span className="rounded bg-primary px-1.5 text-[10px] font-semibold text-primary-content">nós</span>}
                        {t.matches > 0 && <span className="size-1.5 rounded-full bg-secondary" title="Tem anotações dos scouts" />}
                      </span>
                      <span className="block truncate text-xs text-base-content/50">{t.name || "—"}</span>
                    </span>
                    <span className="hidden w-24 shrink-0 sm:block">
                      <span className="block h-1.5 overflow-hidden rounded-full bg-base-200">
                        <span className="block h-full rounded-full bg-primary/70" style={{ width: `${((t.opr ?? 0) / maxOpr) * 100}%` }} />
                      </span>
                    </span>
                    <span className="w-12 shrink-0 text-right font-mono text-sm tabular-nums">
                      {t.opr != null ? fmt(t.opr) : <span className="text-[11px] text-base-content/35">{started ? "—" : "estreia"}</span>}
                      {started && t.oprScope === "temporada" && <span className="text-base-content/40">*</span>}
                    </span>
                    <span className="hidden w-14 shrink-0 text-right font-mono text-xs text-base-content/50 sm:block">
                      {t.wins || t.losses || t.ties ? `${t.wins}-${t.losses}-${t.ties}` : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[11px] leading-4 text-base-content/45">
            OPR = pontos que a equipe soma à aliança, calculado pela FTCScout a partir dos placares.{" "}
            {started ? "* melhor OPR da temporada, enquanto ela não joga neste evento." : "Antes do evento, é o melhor OPR da equipe na temporada; “estreia” = ainda não jogou."}{" "}
            {data.entries.length > 0 && (
              <>
                <span className="inline-block size-1.5 rounded-full bg-secondary align-middle" /> tem anotações dos seus scouts.
              </>
            )}
          </p>
        </div>

        {current && <TeamDetail team={current} stats={stats} data={data} ours={ours} started={started} onPartners={onPartners} />}
      </div>
    </>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-[11px] text-base-content/50">{label}</p>
      <p className="font-mono text-2xl font-semibold tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-base-content/45">{sub}</p>}
    </div>
  );
}

/** Onde a equipe fica entre as inscritas pelo OPR da temporada — útil antes do evento começar. */
function SeasonStanding({ team, stats, ours }: { team: TeamStats; stats: TeamStats[]; ours: string }) {
  const withOpr = [...stats].filter((t) => t.opr != null).sort((a, b) => (b.opr ?? 0) - (a.opr ?? 0));
  const pos = withOpr.findIndex((t) => t.number === team.number);
  const me = stats.find((t) => t.number === ours);
  const isUs = team.number === ours;

  if (team.opr == null) {
    return (
      <section className="mt-6">
        <h3 className={h3}>Antes do evento</h3>
        <p className="mt-2 text-sm text-base-content/65">
          Esta equipe ainda não jogou nesta temporada — vale observá-la nas primeiras partidas. A FTCScout pode ter o histórico de temporadas anteriores.
        </p>
      </section>
    );
  }

  const diff = me?.opr != null && !isUs ? team.opr - me.opr : null;
  const above = withOpr.slice(0, pos);
  const top = withOpr.slice(0, 3).filter((t) => t.number !== team.number);

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className={h3}>Antes do evento</h3>
        <FtcScoutBadge />
      </div>
      <p className="mt-2 text-sm leading-6 text-base-content/75">
        <b>{pos + 1}º maior OPR</b> entre as {withOpr.length} inscritas que já jogaram na temporada.
        {diff != null && (
          <>
            {" "}
            {Math.abs(diff) < 1 ? (
              <>Nível parecido com o da {ours}.</>
            ) : diff > 0 ? (
              <>
                Soma <b>{fmt(diff)}</b> pts a mais que a {ours} por partida.
              </>
            ) : (
              <>
                Soma <b>{fmt(-diff)}</b> pts a menos que a {ours} por partida.
              </>
            )}
          </>
        )}
      </p>
      {isUs && above.length > 0 && (
        <p className="mt-1 text-xs text-base-content/55">
          À frente de vocês: <span className="font-mono">{above.map((t) => t.number).join(", ")}</span>
        </p>
      )}
      {!isUs && top.length > 0 && pos > 2 && (
        <p className="mt-1 text-xs text-base-content/55">
          Favoritas pela temporada: <span className="font-mono">{top.map((t) => t.number).join(", ")}</span>
        </p>
      )}
    </section>
  );
}

function TeamDetail({
  team,
  stats,
  data,
  ours,
  started,
  onPartners,
}: {
  team: TeamStats;
  stats: TeamStats[];
  data: ScoutingData;
  ours: string;
  started: boolean;
  onPartners: () => void;
}) {
  const lines = teamMatches(data.official, team.number);
  const perf = performanceSummary(lines);
  const maxScore = Math.max(1, ...lines.map((l) => Math.max(l.score ?? 0, l.oppScore ?? 0)));
  const me = stats.find((t) => t.number === ours);
  const asPartner = me && me.number !== team.number ? evaluatePair(me, team) : null;
  const notes = data.entries.filter((e) => e.team === team.number && e.notes.trim()).sort((a, b) => a.match - b.match);
  const record = perf ? `${perf.wins}-${perf.losses}-${perf.ties}` : team.wins || team.losses ? `${team.wins}-${team.losses}-${team.ties}` : "—";

  return (
    <article className={`${card} p-5 lg:sticky lg:top-16 lg:self-start`}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-base-content/45">
            {team.officialRank ? `${team.officialRank}º no ranking` : team.rank ? `${team.rank}º (informado)` : started ? "sem ranking" : "inscrita no evento"}
          </p>
          <h2 className="truncate text-2xl font-bold">
            {team.number} <span className="font-normal text-base-content/60">{team.name}</span>
          </h2>
        </div>
        <a href={ftcscoutTeamUrl(team.number)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm shrink-0">
          FTCScout <ArrowUpRight size={14} />
        </a>
      </header>

      <div className={`mt-5 grid grid-cols-2 gap-4 ${started ? "sm:grid-cols-4" : ""}`}>
        <Kpi
          label={team.oprScope === "temporada" || !started ? "OPR temporada" : "OPR"}
          value={fmt(team.opr, 1)}
          sub={team.oprAuto != null ? `auto ${fmt(team.oprAuto, 1)}` : team.opr == null ? "ainda não jogou" : undefined}
        />
        {started ? (
          <>
            <Kpi label="Placar médio" value={fmt(perf?.avg)} sub={perf ? `${fmt(perf.worst)}–${fmt(perf.best)}` : "da aliança"} />
            <Kpi label="V-D-E" value={record} />
            <Kpi label="RP médio" value={fmt(team.officialRp, 2)} />
          </>
        ) : (
          <Kpi label="Partidas marcadas" value={String(lines.length || "—")} sub={lines.length ? "na tabela do evento" : "tabela não publicada"} />
        )}
      </div>

      {!started && <SeasonStanding team={team} stats={stats} ours={ours} />}

      {lines.length > 0 && (
        <section className="mt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className={h3}>{started ? "Partidas no evento" : "Partidas programadas"}</h3>
            <span className="flex items-center gap-3 text-[11px] text-base-content/50">
              {perf?.trend != null && (
                <span className={`inline-flex items-center gap-1 ${perf.trend >= 0 ? "text-success" : "text-error"}`}>
                  {perf.trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {perf.trend >= 0 ? "+" : ""}
                  {fmt(perf.trend)} nas 3 últimas
                </span>
              )}
              {perf && <span>variação ±{fmt(perf.stdev)}</span>}
              <FtcScoutBadge />
            </span>
          </div>
          {started && (
            <div className="mt-3 flex h-24 items-end gap-1.5" aria-label="Placar da aliança em cada partida">
              {lines.map((l) => (
                <div key={l.id} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${l.label}: ${l.score ?? "—"} × ${l.oppScore ?? "—"}`}>
                  <div
                    className={`w-full max-w-7 rounded-t ${
                      l.result === "V" ? "bg-success/70" : l.result === "D" ? "bg-error/60" : l.result === "E" ? "bg-warning/70" : "border border-dashed border-base-300"
                    }`}
                    style={{ height: l.score != null ? `${Math.max(6, (l.score / maxScore) * 76)}px` : "12px" }}
                  />
                  <span className="font-mono text-[9px] text-base-content/45">{l.label}</span>
                </div>
              ))}
            </div>
          )}
          <ul className="mt-4 divide-y divide-base-200 text-sm">
            {lines.map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-1.5">
                <span className={`size-2 shrink-0 rounded-full ${l.alliance === "red" ? "bg-error" : "bg-info"}`} />
                <span className="w-12 shrink-0 font-mono text-xs">{l.label}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-base-content/60">
                  com <b className="font-mono text-base-content">{l.partner.join(", ") || "—"}</b> · contra{" "}
                  <span className="font-mono">{l.opponents.join(", ")}</span>
                </span>
                <span className="shrink-0 font-mono text-xs tabular-nums">{l.score != null ? `${l.score} × ${l.oppScore}` : "a jogar"}</span>
                {l.result && (
                  <span className={`w-4 shrink-0 text-center font-mono text-xs font-bold ${l.result === "V" ? "text-success" : l.result === "D" ? "text-error" : "text-warning"}`}>
                    {l.result}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {started && lines.length === 0 && <p className="mt-6 text-sm text-base-content/55">Ainda sem partidas desta equipe no evento.</p>}

      {team.matches > 0 && (
        <section className="mt-6 border-t border-base-300 pt-5">
          <h3 className={h3}>
            Nossos scouts <span className="font-normal text-base-content/45">· {team.matches} partida(s) anotada(s)</span>
          </h3>
          <dl className="mt-3 grid grid-cols-3 gap-3 text-sm sm:grid-cols-5">
            {[
              ["Pontos/partida", fmt(team.avg)],
              ["TIPs", fmt(team.tipsCount, 1)],
              ["Fechamento", fmt(team.endgame)],
              ["Confiável", pct(team.reliability)],
              ["Faltas", fmt(team.fouls)],
            ].map(([l, v]) => (
              <div key={l}>
                <dt className="text-[11px] text-base-content/50">{l}</dt>
                <dd className="font-mono font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          {notes.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-base-content/65">
              {notes.map((e) => (
                <li key={e.id}>
                  <span className="font-mono text-base-content/45">Q{e.match}</span> {e.notes}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {asPartner && (
        <section className="mt-6 border-t border-base-300 pt-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className={h3}>Como parceiro da {ours}</h3>
            <button type="button" onClick={onPartners} className="text-xs font-semibold hover:text-primary">
              Ver todos os parceiros →
            </button>
          </div>
          <p className="mt-2 text-sm">
            <span className="font-mono text-2xl font-semibold">{fmt(asPartner.expected)}</span>
            <span className="ml-1 text-base-content/55">pts esperados juntas · piso {fmt(asPartner.floor)}</span>
          </p>
          {asPartner.reasons.filter((r) => !r.startsWith("OPR")).length > 0 && (
            <p className="mt-1 text-xs text-base-content/55">{asPartner.reasons.filter((r) => !r.startsWith("OPR")).join(" · ")}</p>
          )}
        </section>
      )}
    </article>
  );
}

/* ============================================================ alianças */

function PairRow({ pair, index, ours }: { pair: PairEvaluation; index: number; ours: string }) {
  const other = pair.a.number === ours ? pair.b : pair.b.number === ours ? pair.a : null;
  const why = pair.reasons.filter((r) => !r.startsWith("OPR"))[0];
  return (
    <li className="flex items-center gap-3 px-4 py-2.5">
      <span className="w-5 shrink-0 font-mono text-xs text-base-content/40">{index + 1}</span>
      <span className="min-w-0 flex-1">
        <span className="font-mono font-semibold">{other ? other.number : `${pair.a.number} + ${pair.b.number}`}</span>
        <span className="ml-2 text-xs text-base-content/50">{other ? other.name : [pair.a.name, pair.b.name].filter(Boolean).join(" · ")}</span>
        {why && <span className="block truncate text-[11px] text-base-content/45">{why}</span>}
      </span>
      {other && <span className="hidden w-10 shrink-0 text-right font-mono text-xs text-base-content/50 sm:block">{other.officialRank ? `${other.officialRank}º` : ""}</span>}
      {other && <span className="hidden w-12 shrink-0 text-right font-mono text-xs text-base-content/50 sm:block">{fmt(other.opr)}</span>}
      <span className="w-16 shrink-0 text-right">
        <span className="block font-mono font-semibold tabular-nums">{fmt(pair.expected)}</span>
        <span className="block font-mono text-[10px] text-base-content/40">piso {fmt(pair.floor)}</span>
      </span>
    </li>
  );
}

function AlliancesView({ stats, ours, started }: { stats: TeamStats[]; ours: string; started: boolean }) {
  const [forced, setForced] = useState("");
  const ranked = useMemo(() => qualificationOrder(stats), [stats]);
  const alliances = allianceCountFor(ranked.length);
  const me = ranked.find((t) => t.number === ours);
  const official = stats.some((t) => t.officialRank != null);

  const sim = useMemo(
    () => simulateSelection(ranked, { alliances, forcedPicks: ours && forced ? { [ours]: forced } : undefined }),
    [ranked, alliances, ours, forced],
  );
  const mine = sim.find((a) => a.captain.number === ours || a.pick?.number === ours);
  const captain = sim.some((a) => a.captain.number === ours);
  const partners = useMemo(() => (me ? bestPartners(me, ranked).slice(0, 8) : []), [me, ranked]);
  const others = useMemo(() => rankPairs(ranked.filter((t) => t.number !== ours), 5), [ranked, ours]);

  if (ranked.length < 2) return <EmptyState text="Escolha a regional ou etapa na barra acima para comparar parceiros." />;

  return (
    <div className="space-y-8">
      <div className={`${card} flex flex-wrap items-center gap-x-8 gap-y-3 p-5`}>
        <div>
          <p className="text-[11px] text-base-content/50">{official ? "Ranking oficial" : started ? "Posição estimada" : "Projeção pela temporada"}</p>
          <p className="font-mono text-3xl font-semibold">{me ? `${ranked.indexOf(me) + 1}º` : "—"}</p>
        </div>
        <p className="min-w-0 flex-1 text-sm leading-6 text-base-content/75">
          {!ours ? (
            "Informe o número da sua equipe na barra acima."
          ) : !me ? (
            `A equipe ${ours} não está entre as inscritas neste evento.`
          ) : captain ? (
            <>
              <Crown size={15} className="mr-1 inline text-warning" />
              {started ? "Vocês devem ser" : "Pelo desempenho na temporada, vocês podem ser"} <b>capitães da aliança {mine?.seed}</b>. Os capitães acima
              escolhem antes — tenham 2 ou 3 nomes prontos.
            </>
          ) : mine ? (
            <>
              A simulação indica convite da <b>aliança {mine.seed}</b> (capitã <span className="font-mono">{mine.captain.number}</span>). Vale
              conversar com ela {started ? "antes da seleção" : "durante o evento"}.
            </>
          ) : (
            <>Pela simulação, vocês ficam fora das {alliances} alianças. Mostrem aos capitães com quem vocês somam mais (lista abaixo).</>
          )}
        </p>
        <p className="text-xs leading-5 text-base-content/50">
          {alliances} alianças de 2 · dupla eliminação
          <br />
          capitães {official ? "pelo ranking da FTCScout" : started ? "pela nota (OPR + anotações)" : "pelo OPR da temporada"}
        </p>
      </div>

      {me && (
        <section>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h3 className={h3}>Melhores parceiros para a {ours}</h3>
            <span className="text-[11px] text-base-content/45">rank · OPR · pts juntas</span>
          </div>
          <ul className="divide-y divide-base-200 rounded-2xl border border-base-300 bg-base-100">
            {partners.map((p, i) => (
              <PairRow key={p.b.number} pair={p} index={i} ours={ours} />
            ))}
          </ul>
          <p className="mt-2 text-[11px] leading-4 text-base-content/45">
            Soma da força das duas (OPR da FTCScout{started ? ", ajustada pelas suas anotações" : " na temporada"}), com desconto quando disputam a mesma
            HIVE e pelas faltas. O piso é o resultado num dia ruim.
          </p>
        </section>
      )}

      <section>
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3">
          <h3 className={h3}>Seleção simulada</h3>
          {captain && (
            <label className="flex items-center gap-2 whitespace-nowrap text-xs text-base-content/60">
              Nossa escolha
              <select value={forced} onChange={(e) => setForced(e.target.value)} className="select select-bordered select-xs">
                <option value="">melhor disponível</option>
                {ranked
                  .filter((t) => t.number !== ours)
                  .map((t) => (
                    <option key={t.number} value={t.number}>
                      {t.number}
                    </option>
                  ))}
              </select>
            </label>
          )}
        </div>
        <ol className="divide-y divide-base-200 rounded-2xl border border-base-300 bg-base-100">
          {sim.map((a) => {
            const isOurs = a.captain.number === ours || a.pick?.number === ours;
            return (
              <li key={a.seed} className={`flex items-center gap-3 px-4 py-2.5 ${isOurs ? "bg-primary/5" : ""}`}>
                <span className="w-7 shrink-0 font-mono text-xs text-base-content/45">A{a.seed}</span>
                <span className="min-w-0 flex-1 font-mono text-sm">
                  <Crown size={12} className="mr-1 inline text-warning" />
                  <b className={a.captain.number === ours ? "text-primary" : ""}>{a.captain.number}</b>
                  <span className="mx-1.5 text-base-content/35">+</span>
                  <b className={a.pick?.number === ours ? "text-primary" : ""}>{a.pick?.number ?? "—"}</b>
                  {alliances === 6 && a.seed <= 2 && <span className="ml-2 font-sans text-[11px] text-base-content/45">folga na 1ª rodada</span>}
                </span>
                <span className="shrink-0 font-mono text-sm tabular-nums">{fmt(a.pair?.expected)}</span>
              </li>
            );
          })}
        </ol>
        {firstRoundPairings(sim.length).length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-base-content/60">
            <li className="text-base-content/45">1ª rodada:</li>
            {firstRoundPairings(sim.length).map(({ red, blue }) => {
              const chance = winChance(sim[red - 1]?.pair, sim[blue - 1]?.pair);
              return (
                <li key={`${red}-${blue}`} className="font-mono">
                  A{red} × A{blue}{" "}
                  <span className="text-base-content/45">
                    ({pct(chance)} × {pct(1 - chance)})
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {others.length > 0 && (
        <section>
          <h3 className={`${h3} mb-2`}>Duplas mais fortes entre as outras equipes</h3>
          <ul className="divide-y divide-base-200 rounded-2xl border border-base-300 bg-base-100">
            {others.map((p, i) => (
              <PairRow key={`${p.a.number}-${p.b.number}`} pair={p} index={i} ours={ours} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-base-300 px-6 py-16 text-center text-sm text-base-content/55">{text}</div>;
}

/* ============================================================= página */

function ScoutingContent() {
  const [data, setDataState] = usePersistentState<ScoutingData>(STORAGE_KEYS.scouting, emptyScouting, parseScouting);
  const [tab, setTab] = useState<Tab>("equipes");
  const [selected, setSelected] = useState("");
  const setData: SetData = (fn) => setDataState(fn);
  const ours = data.event.teamNumber;

  // Só equipes inscritas no evento escolhido (ou com dados), mesmo sem nenhuma partida jogada.
  // Marcas antigas de "indisponível" são ignoradas: a página não edita mais a lista de equipes.
  const stats = useMemo(() => {
    const registered = new Set((data.official?.teams ?? []).map((t) => t.number));
    return allTeamStats(data)
      .filter((t) => registered.has(t.number) || hasData(t))
      .map((t) => (t.unavailable ? { ...t, unavailable: false } : t));
  }, [data]);

  // "Dia da competição" = o evento já tem ranking ou alguma partida com placar.
  const started = useMemo(
    () => stats.some((t) => t.officialRank != null || teamMatches(data.official, t.number).some((l) => l.score != null)),
    [stats, data.official],
  );

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "equipes", label: "Equipes", count: stats.length },
    { key: "aliancas", label: started ? "Alianças" : "Alianças (projeção)" },
    { key: "anotar", label: "Anotar", count: data.entries.length },
  ];

  return (
    <div>
      <EventBar data={data} setData={setData} menu={null} />

      <div role="tablist" aria-label="Seções do scouting" className="sticky top-0 z-20 mb-6 mt-6 flex gap-6 border-b border-base-300 bg-base-100/95 backdrop-blur">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 py-3 text-sm font-semibold transition-colors ${
              tab === t.key ? "border-primary text-base-content" : "border-transparent text-base-content/50 hover:text-base-content"
            }`}
          >
            {t.label}
            {t.count ? <span className="ml-1.5 font-mono text-xs font-normal text-base-content/40">{t.count}</span> : null}
          </button>
        ))}
      </div>

      {tab === "equipes" && (
        <TeamsView
          stats={stats}
          data={data}
          ours={ours}
          selected={selected || ours}
          started={started}
          onSelect={setSelected}
          onPartners={() => setTab("aliancas")}
        />
      )}
      {tab === "aliancas" && <AlliancesView stats={stats} ours={ours} started={started} />}
      {tab === "anotar" && <ScoutRecord data={data} setData={setData} />}

      <FtcScoutAttribution />
    </div>
  );
}

function ScoutingPage() {
  return <ScoutingContent />;
}

export default function Scouting() {
  return <ScoutingPage />;
}