"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronDown, Database, Loader2, RefreshCw, Search, X } from "lucide-react";

import {
  FTCSCOUT,
  PHASE_HINT,
  cleanEventCode,
  eventPhase,
  ftcscoutEventUrl,
  type EventSummary,
  type OfficialEvent,
} from "@/utils/competitions/ftc/ftcscout";
import type { ScoutingData } from "@/utils/competitions/ftc/scouting";

async function api<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `Erro ${res.status}`);
  return body as T;
}

export const fetchOfficial = (code: string) => api<OfficialEvent>(`/api/data/ftcscout/event?code=${encodeURIComponent(code)}`);

/** Selo de fonte. */
export function FtcScoutBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href={FTCSCOUT.site}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 font-mono text-[10px] text-base-content/45 hover:text-primary ${className}`}
      title="Dados oficiais fornecidos pela FTCScout"
    >
      <Database size={10} /> FTCScout
    </a>
  );
}

export function FtcScoutAttribution() {
  return (
    <p className="mt-10 text-xs leading-5 text-base-content/45">
      <Database size={12} className="mr-1 inline align-[-2px]" />
      Equipes, ranking, partidas, placares e OPR vêm da{" "}
      <a href={FTCSCOUT.site} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
        FTCScout
      </a>
      , projeto aberto da comunidade FTC, pela{" "}
      <a href={FTCSCOUT.apiDocs} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
        API pública
      </a>
      . O RoboStage não é afiliado à FTCScout nem à FIRST. Suas anotações ficam só neste aparelho.
    </p>
  );
}

const DAY_STEPS: [string, string][] = [
  ["Véspera", "a FTCScout lista as inscritas com a melhor OPR de cada uma na temporada: dá para saber quem é forte antes da 1ª partida."],
  ["Agenda publicada", "suas partidas aparecem com parceiro e adversários; na aba Anotar o scout só toca na partida e no robô."],
  ["Qualificação", "atualize a cada rodada: ranking, placares e OPR do evento. Na fila, a Estratégia TeleOp puxa a partida da agenda."],
  ["Seleção de alianças", "o ranking final define os capitães e a aba Alianças mostra seus melhores parceiros."],
  ["Playoffs", "compare as alianças pela OPR somada e prepare cada confronto."],
];

/**
 * Barra do evento: equipe, importação da FTCScout e uma frase sobre o que
 * fazer agora. Tudo o que é configuração fica aqui; o resto da tela é análise.
 */
type EventBarProps = {
  data: ScoutingData;
  setData: (fn: (d: ScoutingData) => ScoutingData) => void;
  menu?: React.ReactNode;
};

export default function EventBar(props: EventBarProps) {
  return <EventBarView {...props} />;
}

function EventBarView({
  data,
  setData,
  menu,
}: EventBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EventSummary[] | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [changing, setChanging] = useState(false);
  const official = data.official;
  const ours = data.event.teamNumber;
  const phase = eventPhase(official);

  const run = async <T,>(label: string, fn: () => Promise<T>) => {
    setBusy(label);
    setError("");
    try {
      return await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao consultar a FTCScout.");
      return undefined;
    } finally {
      setBusy("");
    }
  };

  const importEvent = async (code: string) => {
    const ev = await run("import", () => fetchOfficial(code));
    if (!ev) return false;
    setData((d) => ({
      ...d,
      official: ev,
      event: { ...d.event, eventName: ev.name || d.event.eventName, eventDate: (ev.start ?? "").slice(0, 10) || d.event.eventDate },
    }));
    setResults(null);
    setQuery("");
    setChanging(false);
    return true;
  };

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    // Sem espaço e com número (ex.: BRSPQ1): tenta como código primeiro.
    if (/^[a-z0-9]{4,16}$/i.test(q) && /\d/.test(q) && (await importEvent(cleanEventCode(q)))) return;
    const list = await run("search", () => api<EventSummary[]>(`/api/data/ftcscout/search?q=${encodeURIComponent(q)}`));
    if (list) setResults(list);
  };

  const mine = async () => {
    const list = await run("team", () => api<EventSummary[]>(`/api/data/ftcscout/team-events?team=${encodeURIComponent(ours)}`));
    if (list) setResults(list);
  };

  const showSearch = !official || changing;

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100">
      <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
        <label className="flex items-center gap-2">
          <span className="text-xs text-base-content/50">Nossa equipe</span>
          <input
            value={ours}
            onChange={(e) => setData((d) => ({ ...d, event: { ...d.event, teamNumber: e.target.value.replace(/\D/g, "").slice(0, 6) } }))}
            inputMode="numeric"
            placeholder="nº"
            className="input input-bordered input-sm w-24 font-mono"
          />
        </label>

        <span className="hidden h-6 w-px bg-base-300 sm:block" />

        {showSearch ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="join min-w-0 flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void search()}
                placeholder="Evento na FTCScout: código (BRSPQ1) ou nome"
                className="input input-bordered input-sm join-item w-full min-w-0"
                aria-label="Buscar evento na FTCScout"
              />
              <button type="button" onClick={() => void search()} disabled={!query.trim() || !!busy} className="btn btn-primary btn-sm join-item" aria-label="Buscar">
                {busy === "search" || busy === "import" ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              </button>
            </div>
            {ours && (
              <button type="button" onClick={() => void mine()} disabled={!!busy} className="btn btn-ghost btn-sm hidden sm:inline-flex">
                {busy === "team" && <Loader2 size={14} className="animate-spin" />} Eventos da {ours}
              </button>
            )}
            {changing && (
              <button type="button" onClick={() => setChanging(false)} className="btn btn-ghost btn-sm btn-square" aria-label="Cancelar troca de evento">
                <X size={15} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
            <p className="min-w-0 truncate font-semibold">
              {official!.name || official!.code}
              <span className="ml-2 font-mono text-xs font-normal text-base-content/45">{official!.code}</span>
            </p>
            <span className="text-xs text-base-content/45">
              atualizado {new Date(official!.fetchedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <button type="button" onClick={() => void importEvent(official!.code)} disabled={!!busy} className="btn btn-primary btn-sm">
                {busy === "import" ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Atualizar
              </button>
              <a
                href={ftcscoutEventUrl(official!.code, official!.season)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm btn-square"
                aria-label="Ver na FTCScout"
                title="Ver na FTCScout"
              >
                <ArrowUpRight size={15} />
              </a>
              <button type="button" onClick={() => setChanging(true)} className="btn btn-ghost btn-sm">
                Trocar
              </button>
            </div>
          </div>
        )}
        {menu}
      </div>

      {error && <p className="border-t border-base-300 px-4 py-2 text-sm text-error">{error}</p>}

      {results && (
        <ul className="max-h-64 overflow-y-auto border-t border-base-300 p-2">
          {results.length === 0 && <li className="px-2 py-1 text-sm text-base-content/55">Nenhum evento encontrado na temporada BIOBUZZ.</li>}
          {results.map((ev) => (
            <li key={ev.code}>
              <button
                type="button"
                onClick={() => void importEvent(ev.code)}
                disabled={!!busy}
                className="flex w-full items-baseline gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-base-200"
              >
                <span className="w-20 shrink-0 font-mono text-xs text-base-content/55">{ev.code}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{ev.name}</span>
                <span className="hidden shrink-0 text-xs text-base-content/45 sm:block">
                  {[ev.start && new Date(`${ev.start.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR"), ev.location].filter(Boolean).join(" · ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <details className="group border-t border-base-300 px-4 py-2.5">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-base-content/65 [&::-webkit-details-marker]:hidden">
          <Database size={13} className="shrink-0 text-primary" />
          <span className="min-w-0 flex-1">{PHASE_HINT[phase]}</span>
          <span className="hidden shrink-0 text-xs text-base-content/45 group-open:hidden sm:inline">Como a FTCScout ajuda no dia</span>
          <ChevronDown size={14} className="shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <ol className="mt-3 grid gap-x-6 gap-y-2 pb-1 text-xs leading-5 text-base-content/65 sm:grid-cols-2 lg:grid-cols-5">
          {DAY_STEPS.map(([when, text], i) => (
            <li key={when}>
              <span className="font-semibold text-base-content">
                {i + 1}. {when}:
              </span>{" "}
              {text}
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
