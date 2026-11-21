"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Check, MapPin, Users } from "lucide-react";
import { cn, toneFill, type Tone } from "../lib";
import { StatusBadge, type Status } from "../core/Tag";
import { TeamAvatar, SkeletonBlock } from "../core/Data";
import { Bolt, Starburst } from "../decor/Stickers";

/* ============================================================ RUBRICA */

export type LevelKey = 1 | 2 | 3 | 4;
export const LEVEL_LABELS: Record<LevelKey, string> = {
  1: "Fase Inicial",
  2: "Em Desenvolvimento",
  3: "Finalizado",
  4: "Excedente",
};
const levelTone: Record<LevelKey, Tone> = { 1: "warning", 2: "accent", 3: "success", 4: "secondary" };

/** Seletor de nível da rubrica (substitui os botões do IndicatorRow). */
export function RubricLevelPicker({
  title,
  descriptions,
  selected,
  onSelect,
}: {
  title: string;
  /** Textos dos níveis 1–3; o 4 (Excedente) é livre. */
  descriptions: [string, string, string];
  selected?: LevelKey;
  onSelect: (l: LevelKey) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-lg font-bold tracking-tight">{title}</legend>
      <div className="grid gap-2.5 sm:grid-cols-4">
        {([1, 2, 3, 4] as LevelKey[]).map((lvl) => {
          const active = selected === lvl;
          return (
            <button
              key={lvl}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(lvl)}
              className={cn(
                "stage-paper flex flex-col gap-2 rounded-tl-xl rounded-br-xl border p-3 text-left transition-all",
                active ? cn(toneFill[levelTone[lvl]], "stage-shadow-sm -translate-y-0.5 border-transparent") : "border-base-300 bg-base-100 hover:border-secondary/40",
              )}
            >
              <span className="flex items-center justify-between">
                <span className="stage-display text-3xl leading-none">{lvl}</span>
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-sm border border-current/40",
                    active ? "bg-base-100 text-base-content" : "bg-transparent",
                  )}
                >
                  {active && <Check size={13} strokeWidth={4} />}
                </span>
              </span>
              <span className="stage-label opacity-80">{LEVEL_LABELS[lvl]}</span>
              <span className="text-xs leading-snug opacity-90">
                {lvl === 4 ? "A equipe foi além do esperado — descreva no comentário." : descriptions[lvl - 1]}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ========================================================= EVENTOS */

export type EventItem = {
  title: string;
  date: Date;
  location: string;
  modality: string;
  teams: number;
  status: Status;
  href?: string;
  tone?: Tone;
};

/** Card de microevento: canhoto de ingresso com data. */
export function EventCard({ event, className }: { event: EventItem; className?: string }) {
  const tone = event.tone ?? "primary";
  const day = event.date.toLocaleDateString("pt-BR", { day: "2-digit" });
  const month = event.date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  const Wrapper = event.href ? Link : "div";
  return (
    <Wrapper
      href={event.href ?? "#"}
      className={cn(
        "group stage-paper stage-ink flex overflow-hidden rounded-tl-[1.75rem] rounded-br-[1.75rem] bg-base-100 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[6px_6px_0_0_var(--stage-shadow)]",
        className,
      )}
    >
      {/* canhoto */}
      <div className={cn("stage-noise flex w-24 shrink-0 flex-col items-center justify-center border-r-2 border-dashed border-base-100/60 py-4", toneFill[tone])}>
        <span className="stage-display text-5xl leading-none">{day}</span>
        <span className="stage-label mt-1 opacity-90">{month}</span>
        {/* furos do ingresso */}
        <span className="absolute -right-2 -top-2 size-4 rounded-full bg-base-100" />
        <span className="absolute -bottom-2 -right-2 size-4 rounded-full bg-base-100" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={event.status} />
          <span className="stage-kicker text-base-content/55">{event.modality}</span>
        </div>
        <h3 className="text-xl font-black leading-tight tracking-tight">{event.title}</h3>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-base-content/65">
          <span className="flex items-center gap-1"><MapPin size={13} /> {event.location}</span>
          <span className="flex items-center gap-1"><Users size={13} /> {event.teams} equipes</span>
        </div>
      </div>
      <span className="m-4 grid size-9 shrink-0 place-items-center self-start rounded-full border border-base-300 transition-all duration-300 group-hover:-rotate-45 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-content">
        <ArrowUpRight size={18} />
      </span>
    </Wrapper>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="flex overflow-hidden rounded-tl-[1.75rem] rounded-br-[1.75rem] border border-dashed border-base-content/25">
      <SkeletonBlock className="m-3 h-24 w-20 rounded-xl" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-6 w-3/4" />
        <SkeletonBlock className="mt-auto h-3 w-1/2" />
      </div>
    </div>
  );
}

/* ========================================================= TEMPORADA */

/** Card de temporada selecionável (substitui CardSeason). */
export function SeasonCard({
  name,
  year,
  image,
  tone = "secondary",
  selected,
  onSelect,
}: {
  name: string;
  year: string;
  image?: string;
  tone?: Tone;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "stage-paper stage-ink flex w-40 flex-col overflow-visible rounded-tl-[1.5rem] rounded-br-[1.5rem] bg-base-100 text-left transition-all duration-300",
        selected ? "stage-shadow -translate-y-1 border-transparent" : "hover:-translate-y-0.5 hover:border-primary/40",
      )}
    >
      {selected && (
        <span className="absolute -right-3 -top-3 z-10">
          <Starburst size={40} tone="accent" points={10}>
            <Check size={16} strokeWidth={4} />
          </Starburst>
        </span>
      )}
      <div className={cn("stage-noise grid h-28 place-items-center rounded-tl-[1.4rem]", toneFill[tone])}>
        {image ? <img src={image} alt="" className="h-20 w-20 object-contain" /> : <Bolt size={52} tone="accent" />}
      </div>
      <div className="px-3 py-2.5">
        <p className="font-black uppercase tracking-tight">{name}</p>
        <p className="stage-label mt-1 text-base-content/50">{year}</p>
      </div>
    </button>
  );
}

/* ========================================================= RANKING */

export type RankRow = { team: string; city: string; rounds: number[] };

const medal: Tone[] = ["accent", "paper", "warning"];

/** Tabela de ranking com medalhas-sticker para o pódio. */
export function RankingTable({ rows, title = "Ranking geral" }: { rows: RankRow[]; title?: string }) {
  const sorted = [...rows]
    .map((r) => ({ ...r, best: Math.max(...r.rounds) }))
    .sort((a, b) => b.best - a.best);
  const roundCount = Math.max(...rows.map((r) => r.rounds.length));

  return (
    <div className="stage-paper stage-ink overflow-hidden rounded-2xl bg-base-100 shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--stage-line)] stage-night stage-noise px-5 py-3">
        <h3 className="text-lg font-black tracking-tight">{title}</h3>
        <StatusBadge status="live" className="border-white/80" />
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="stage-label border-b border-base-300 text-base-content/50">
              <th className="w-16">#</th>
              <th>Equipe</th>
              {Array.from({ length: roundCount }, (_, i) => (
                <th key={i} className="text-center">R{i + 1}</th>
              ))}
              <th className="text-right">Melhor</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={r.team} className={cn("border-b border-base-content/10 transition-colors hover:bg-base-200/60", i === 0 && "bg-accent/10")}>
                <td>
                  {i < 3 ? (
                    <Starburst size={38} tone={medal[i]} points={10} shadow={false}>
                      <span className="text-base">{i + 1}</span>
                    </Starburst>
                  ) : (
                    <span className="pl-3 text-lg font-black text-base-content/40">{i + 1}</span>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <TeamAvatar name={r.team} size={36} />
                    <div>
                      <p className="font-bold leading-tight">{r.team}</p>
                      <p className="text-xs text-base-content/55">{r.city}</p>
                    </div>
                  </div>
                </td>
                {Array.from({ length: roundCount }, (_, k) => (
                  <td key={k} className={cn("text-center tabular-nums", r.rounds[k] === r.best ? "font-bold" : "text-base-content/55")}>
                    {r.rounds[k] ?? "—"}
                  </td>
                ))}
                <td className="text-right">
                  <span className="text-xl font-black tracking-tight">{r.best}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ====================================================== PLACAR AO VIVO */

/** Placar do ShowLive: duas mesas, round atual e tempo. */
export function LiveScoreboard({
  round,
  clock,
  left,
  right,
  footer,
}: {
  round: string;
  clock: string;
  left: { team: string; score: number; table: string };
  right: { team: string; score: number; table: string };
  footer?: ReactNode;
}) {
  const Side = ({ s, tone, align }: { s: typeof left; tone: Tone; align: "left" | "right" }) => (
    <div className={cn("flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5", align === "right" && "items-end text-right", toneFill[tone])}>
      <span className="stage-label opacity-80">{s.table}</span>
      <div className={cn("flex max-w-full items-center gap-3", align === "right" && "flex-row-reverse")}>
        <TeamAvatar name={s.team} size={40} tone="paper" className="hidden sm:inline-grid" />
        <span className="stage-display truncate text-xl leading-none sm:text-2xl">{s.team}</span>
      </div>
      <span className="stage-display text-5xl leading-none tabular-nums sm:text-7xl">{s.score}</span>
    </div>
  );
  return (
    <div className="stage-texture stage-shadow-lg overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] stage-night">
      <div className="flex items-center justify-between px-5 py-3">
        <StatusBadge status="live" className="border-white/80" />
        <span className="font-mono text-sm font-bold uppercase tracking-[0.15em]">{round}</span>
        <span className="stage-corner-sm bg-accent px-2.5 py-0.5 font-mono text-lg font-bold text-accent-content tabular-nums">{clock}</span>
      </div>
      <div className="grid grid-cols-2">
        <Side s={left} tone="primary" align="left" />
        <Side s={right} tone="secondary" align="right" />
      </div>
      {footer && <div className="px-5 py-3 text-sm text-white/70">{footer}</div>}
    </div>
  );
}

