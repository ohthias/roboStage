"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileStack,
  Flag,
  Minus,
  MonitorPlay,
  Plus,
  Radio,
  RefreshCw,
  Sparkles,
  Trophy,
  Users,
  WifiOff,
  X,
} from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { SHOWLIVE_FORMATS } from "@/utils/showlive/input";
import type {
  CreatedShowLiveEvent,
  ShowLiveCatalog,
  ShowLiveEvent,
  ShowLiveFormat,
  ShowLiveOverview,
  ShowLiveSource,
  ShowLiveStatus,
} from "@/utils/showlive/types";
import { createShowLiveEvent } from "./actions";

type Filter = "all" | ShowLiveStatus;

const STATUS_META: Record<ShowLiveStatus, { label: string; badge: string }> = {
  live: { label: "Ao vivo", badge: "badge-error" },
  draft: { label: "Em preparação", badge: "badge-ghost" },
  finished: { label: "Encerrado", badge: "badge-neutral" },
};

const ROLE_LABEL: Record<ShowLiveEvent["role"], string> = {
  owner: "Organizador",
  admin: "Administrador",
  scorer: "Apurador",
  viewer: "Leitura",
};

const FORMAT_ICON: Record<ShowLiveFormat, typeof Trophy> = {
  fll: Trophy,
  fll_fe: Sparkles,
  obr: Flag,
  custom: ClipboardList,
};

const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
function relative(iso: string) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [30, "day"],
    [12, "month"],
  ];
  let value = diff;
  for (const [size, unit] of steps) {
    if (Math.abs(value) < size) return rtf.format(Math.round(value), unit);
    value /= size;
  }
  return rtf.format(Math.round(value), "year");
}

export function ShowLiveView({
  overview,
  error,
  showliveUrl,
}: {
  overview: ShowLiveOverview | null;
  error: string | null;
  showliveUrl: string;
}) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [filter, setFilter] = useState<Filter>("all");
  const [creating, setCreating] = useState(false);

  const events = useMemo(() => overview?.events ?? [], [overview]);
  const counts = useMemo(
    () => ({
      all: events.length,
      live: events.filter((e) => e.status === "live").length,
      draft: events.filter((e) => e.status === "draft").length,
      finished: events.filter((e) => e.status === "finished").length,
      teams: events.reduce((n, e) => n + e.teams, 0),
    }),
    [events],
  );
  const visible = filter === "all" ? events : events.filter((e) => e.status === filter);
  const hubUrl = overview?.hubUrl ?? `${showliveUrl}/hub`;

  return (
    <section className="mx-auto min-h-screen w-full space-y-8 px-4 py-8 text-base-content sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-base-content/50">
            <Radio size={13} className="text-primary" /> Eventos ao vivo
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Show<span className="text-primary">Live</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-base-content/60 sm:text-base">
            Crie torneios e treinos com placar em tempo real, telão e mesas de arbitragem. A organização do
            evento acontece no hub do ShowLive, com a mesma conta RoboStage.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href={hubUrl} target="_blank" rel="noopener" className="btn btn-ghost btn-sm gap-2 rounded-lg">
            Abrir hub <ArrowUpRight size={15} />
          </a>
          <button
            type="button"
            className="btn btn-primary btn-sm gap-2 rounded-lg px-4"
            onClick={() => setCreating(true)}
            disabled={!overview}
          >
            <Plus size={15} /> Novo evento
          </button>
        </div>
      </header>
      <div className="h-px bg-gradient-to-r from-primary/30 via-base-300 to-transparent" />

      {error || !overview ? (
        <div className="flex flex-col items-start gap-4 rounded-tl-2xl rounded-br-2xl border border-dashed border-base-300 bg-base-200/40 p-6 sm:flex-row sm:items-center">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
            <WifiOff size={22} />
          </span>
          <div className="flex-1">
            <p className="font-semibold">Não deu para falar com o ShowLive</p>
            <p className="mt-1 text-sm text-base-content/60">{error}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-sm gap-2 rounded-lg"
              onClick={() => startRefresh(() => router.refresh())}
              disabled={refreshing}
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Tentar de novo
            </button>
            <a href={hubUrl} target="_blank" rel="noopener" className="btn btn-ghost btn-sm gap-2 rounded-lg">
              Ir ao ShowLive <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Ao vivo" value={counts.live} icon={<Radio size={16} />} accent={counts.live > 0} />
            <Stat label="Em preparação" value={counts.draft} icon={<CalendarClock size={16} />} />
            <Stat label="Encerrados" value={counts.finished} icon={<Flag size={16} />} />
            <Stat label="Equipes inscritas" value={counts.teams} icon={<Users size={16} />} />
          </div>

          {events.length > 0 && (
            <div role="tablist" className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "Todos"],
                  ["live", "Ao vivo"],
                  ["draft", "Em preparação"],
                  ["finished", "Encerrados"],
                ] as [Filter, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  type="button"
                  aria-selected={filter === key}
                  onClick={() => setFilter(key)}
                  className={`btn btn-sm rounded-full ${filter === key ? "btn-neutral" : "btn-ghost border-base-300"}`}
                >
                  {label}
                  <span className="font-mono text-xs opacity-60">{counts[key]}</span>
                </button>
              ))}
            </div>
          )}

          {events.length === 0 ? (
            <EmptyState onCreate={() => setCreating(true)} />
          ) : visible.length === 0 ? (
            <p className="rounded-xl border border-dashed border-base-300 p-8 text-center text-sm text-base-content/50">
              Nenhum evento neste filtro.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </>
      )}

      {creating && overview && (
        <CreateDialog
          catalog={overview.catalog}
          onClose={() => setCreating(false)}
          onCreated={() => router.refresh()}
        />
      )}
    </section>
  );
}

function Stat({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className={`rounded-tl-2xl rounded-br-2xl border p-4 ${
        accent ? "border-error/40 bg-error/5" : "border-base-300/80 bg-base-100"
      }`}
    >
      <p className={`flex items-center gap-2 text-xs font-medium ${accent ? "text-error" : "text-base-content/55"}`}>
        {icon} {label}
      </p>
      <p className="mt-1 font-mono text-2xl font-black tabular-nums">{value}</p>
    </div>
  );
}

function EventCard({ event: e }: { event: ShowLiveEvent }) {
  const Icon = FORMAT_ICON[e.format] ?? Trophy;
  const status = STATUS_META[e.status];
  return (
    <article className="group relative flex min-h-[200px] flex-col rounded-tl-2xl rounded-br-2xl border border-base-300/80 bg-base-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
      <a
        href={e.hubUrl}
        target="_blank"
        rel="noopener"
        className="flex flex-1 flex-col p-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-base-300/70 bg-base-200/60 text-base-content/70 transition-colors group-hover:border-primary/20 group-hover:bg-primary/10 group-hover:text-primary">
            <Icon size={20} strokeWidth={1.8} />
          </div>
          <span className={`badge badge-sm gap-1.5 ${status.badge}`}>
            {e.status === "live" && <span className="size-1.5 animate-pulse rounded-full bg-current" />}
            {status.label}
          </span>
        </div>
        <div className="mt-4 min-w-0">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-base-content/45">
            {e.kind} · {e.detail}
          </p>
          <h3 className="mt-1 truncate text-base font-semibold tracking-tight transition-colors group-hover:text-primary">
            {e.name}
          </h3>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-xs text-base-content/55">
          <span className="inline-flex items-center gap-1">
            <Users size={13} /> {e.teams} {e.teams === 1 ? "equipe" : "equipes"}
          </span>
          <span className="inline-flex items-center gap-1">
            <FileStack size={13} /> {e.scores} {e.scores === 1 ? "nota" : "notas"}
          </span>
          <span>{ROLE_LABEL[e.role]}</span>
          <span className="ml-auto" title={new Date(e.updatedAt).toLocaleString("pt-BR")} suppressHydrationWarning>
            {relative(e.updatedAt)}
          </span>
        </div>
      </a>
      <div className="flex items-center gap-2 border-t border-base-300/70 px-5 py-3">
        <a href={e.hubUrl} target="_blank" rel="noopener" className="btn btn-primary btn-xs gap-1 rounded-md">
          Abrir no hub <ArrowUpRight size={12} />
        </a>
        {e.liveUrl && (
          <a href={e.liveUrl} target="_blank" rel="noopener" className="btn btn-ghost btn-xs gap-1 rounded-md">
            <MonitorPlay size={13} /> Telão
          </a>
        )}
        {e.code && (
          <span className="ml-auto rounded-md bg-base-200 px-2 py-0.5 font-mono text-xs font-bold tracking-widest" title="Código do evento">
            {e.code}
          </span>
        )}
      </div>
    </article>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-tl-3xl rounded-br-3xl border border-dashed border-base-300 bg-base-200/30 p-8 text-center sm:p-12">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Radio size={26} />
      </span>
      <h2 className="mt-4 text-xl font-bold">Seu primeiro evento ao vivo</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-base-content/60">
        Monte um torneio ou um treino valendo nota: o público acompanha no telão, as mesas pontuam pelo celular e
        tudo atualiza na hora.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {SHOWLIVE_FORMATS.map((f) => (
          <span key={f.id} className="badge badge-outline">
            {f.label}
          </span>
        ))}
      </div>
      <button type="button" className="btn btn-primary mt-6 gap-2 rounded-lg" onClick={onCreate}>
        <Plus size={16} /> Criar evento
      </button>
    </div>
  );
}

/* ------------------------------------------------------------ criação */

function CreateDialog({
  catalog,
  onClose,
  onCreated,
}: {
  catalog: ShowLiveCatalog;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { addToast } = useToast();
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, start] = useTransition();
  const [created, setCreated] = useState<CreatedShowLiveEvent | null>(null);

  const [name, setName] = useState("");
  const [format, setFormat] = useState<ShowLiveFormat>(catalog.defaults.format ?? "fll");
  const [season, setSeason] = useState(
    catalog.seasons.some((s) => s.id === catalog.defaults.season) ? catalog.defaults.season : (catalog.seasons[0]?.id ?? ""),
  );
  const [rounds, setRounds] = useState(Math.min(8, Math.max(1, catalog.defaults.rounds || 3)));
  const [source, setSource] = useState<ShowLiveSource>(
    catalog.presets[0] ? { kind: "preset", id: catalog.presets[0].id } : { kind: "blank", type: "missions" },
  );
  const [sourceTab, setSourceTab] = useState<ShowLiveSource["kind"]>(catalog.presets.length ? "preset" : "blank");

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  const close = () => {
    if (pending) return;
    dialog.current?.close();
    onClose();
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    start(async () => {
      const r = await createShowLiveEvent({ name, format, season, roundCount: rounds, source });
      if (!r.ok) return addToast(r.error, "error");
      setCreated(r.data);
      addToast("Evento criado no ShowLive.", "success");
      onCreated();
    });
  };

  const typeLabel = (id: string) => catalog.challengeTypes.find((t) => t.id === id)?.label ?? id;

  return (
    <dialog ref={dialog} className="modal modal-bottom sm:modal-middle" onCancel={(e) => (e.preventDefault(), close())}>
      <div className="modal-box max-w-2xl rounded-tl-3xl rounded-br-3xl rounded-tr-none rounded-bl-none p-0">
        <div className="flex items-start justify-between border-b border-base-300 px-6 py-4">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-base-content/50">ShowLive</p>
            <h2 className="text-lg font-bold">{created ? "Evento criado" : "Novo evento"}</h2>
          </div>
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={close} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        {created ? (
          <div className="space-y-5 p-6 text-center">
            <CheckCircle2 size={44} className="mx-auto text-success" />
            <div>
              <p className="text-lg font-semibold">{name.trim()}</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-base-content/60">
                Agora é no hub: cadastre as equipes, ajuste as rodadas e o telão
                {format === "obr" ? ", monte as 3 arenas" : format === "custom" ? ", revise o desafio" : ""} e coloque o
                evento ao vivo quando estiver pronto. Os códigos das mesas são gerados nessa hora.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <a href={created.hubUrl} target="_blank" rel="noopener" className="btn btn-primary gap-2 rounded-lg" onClick={close}>
                Abrir no ShowLive <ArrowUpRight size={16} />
              </a>
              <button type="button" className="btn btn-ghost rounded-lg" onClick={close}>
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-5">
            <label className="block">
              <span className="text-sm font-medium">Nome do evento</span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                placeholder="Ex.: Torneio Regional de Robótica 2026"
                className="input input-bordered mt-1.5 w-full"
                required
                minLength={3}
              />
            </label>

            <fieldset>
              <legend className="mb-2 text-sm font-medium">Liga</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {SHOWLIVE_FORMATS.map((f) => {
                  const Icon = FORMAT_ICON[f.id];
                  const active = format === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFormat(f.id)}
                      className={`flex items-start gap-3 rounded-tl-xl rounded-br-xl border p-3 text-left transition ${
                        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-base-300 hover:border-base-content/30"
                      }`}
                    >
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                          active ? "bg-primary text-primary-content" : "bg-base-200 text-base-content/60"
                        }`}
                      >
                        <Icon size={18} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{f.label}</span>
                        <span className="block text-xs leading-snug text-base-content/55">{f.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {format === "fll" && (
              <fieldset>
                <legend className="mb-2 text-sm font-medium">Temporada</legend>
                <div className="flex flex-wrap gap-2">
                  {catalog.seasons.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={season === s.id}
                      onClick={() => setSeason(s.id)}
                      className={`btn btn-sm rounded-lg ${season === s.id ? "btn-neutral" : "btn-ghost border-base-300"}`}
                    >
                      {s.label}
                      <span className="font-mono text-[11px] opacity-60">{s.year}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {format === "custom" && (
              <fieldset>
                <legend className="mb-2 text-sm font-medium">Desafio</legend>
                <div role="tablist" className="tabs tabs-box tabs-sm mb-3 w-fit">
                  {(
                    [
                      ["preset", "Modelos prontos", catalog.presets.length],
                      ["template", "Meus templates", catalog.templates.length],
                      ["blank", "Em branco", 1],
                    ] as [ShowLiveSource["kind"], string, number][]
                  )
                    .filter(([, , n]) => n > 0)
                    .map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        className={`tab ${sourceTab === key ? "tab-active" : ""}`}
                        onClick={() => {
                          setSourceTab(key);
                          if (key === "preset" && catalog.presets[0]) setSource({ kind: "preset", id: catalog.presets[0].id });
                          if (key === "template" && catalog.templates[0]) setSource({ kind: "template", id: catalog.templates[0].id });
                          if (key === "blank") setSource({ kind: "blank", type: catalog.challengeTypes[0]?.id ?? "missions" });
                        }}
                      >
                        {label}
                      </button>
                    ))}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {sourceTab === "preset" &&
                    catalog.presets.map((p) => (
                      <SourceOption
                        key={p.id}
                        active={source.kind === "preset" && source.id === p.id}
                        onClick={() => setSource({ kind: "preset", id: p.id })}
                        title={p.name}
                        hint={typeLabel(p.type)}
                        text={p.objective}
                      />
                    ))}
                  {sourceTab === "template" &&
                    catalog.templates.map((t) => (
                      <SourceOption
                        key={t.id}
                        active={source.kind === "template" && source.id === t.id}
                        onClick={() => setSource({ kind: "template", id: t.id })}
                        title={t.name}
                        hint={typeLabel(t.type)}
                      />
                    ))}
                  {sourceTab === "blank" &&
                    catalog.challengeTypes.map((t) => (
                      <SourceOption
                        key={t.id}
                        active={source.kind === "blank" && source.type === t.id}
                        onClick={() => setSource({ kind: "blank", type: t.id })}
                        title={t.label}
                        text={t.short}
                      />
                    ))}
                </div>
              </fieldset>
            )}

            {format === "obr" ? (
              <p className="rounded-xl bg-base-200/70 p-3 text-sm text-base-content/70">
                A OBR Resgate começa com <b>3 rodadas, uma por arena</b>, rodadas de 5 minutos e classificação pela soma das
                2 maiores notas. Você monta as arenas (e desafios extras, se quiser) no hub.
              </p>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Rodadas classificatórias</p>
                  <p className="text-xs text-base-content/55">Dá para mudar depois no hub.</p>
                </div>
                <div className="join">
                  <button
                    type="button"
                    className="btn btn-sm join-item"
                    onClick={() => setRounds((r) => Math.max(1, r - 1))}
                    aria-label="Menos rodadas"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="join-item flex w-12 items-center justify-center border-y border-base-300 font-mono font-bold">
                    {rounds}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm join-item"
                    onClick={() => setRounds((r) => Math.min(8, r + 1))}
                    aria-label="Mais rodadas"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-base-300 pt-4">
              <button type="button" className="btn btn-ghost rounded-lg" onClick={close} disabled={pending}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary gap-2 rounded-lg" disabled={pending || name.trim().length < 3}>
                {pending ? <span className="loading loading-spinner loading-sm" /> : <Plus size={16} />}
                Criar evento
              </button>
            </div>
          </form>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={close} aria-label="Fechar">
          fechar
        </button>
      </form>
    </dialog>
  );
}

function SourceOption({
  active,
  onClick,
  title,
  hint,
  text,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  hint?: string;
  text?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-tl-xl rounded-br-xl border p-3 text-left transition ${
        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-base-300 hover:border-base-content/30"
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold">{title}</span>
        {hint && <span className="badge badge-ghost badge-xs shrink-0">{hint}</span>}
      </span>
      {text && <span className="mt-1 line-clamp-2 block text-xs text-base-content/55">{text}</span>}
    </button>
  );
}
