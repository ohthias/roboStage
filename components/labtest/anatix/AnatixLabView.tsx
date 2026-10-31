"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Cable,
  CircleSlash,
  Cpu,
  Database,
  History,
  Map as MapIcon,
  MemoryStick,
  Pause,
  Play,
  Plug,
  RotateCcw,
  Settings2,
  Table2,
  Trash2,
  Unplug,
  Zap,
} from "lucide-react";
import {
  appendAnatixFrames,
  deleteAnatixLab,
  deleteAnatixSession,
  endAnatixSession,
  getAnatixSessionFrames,
  startAnatixSession,
  updateAnatixLab,
} from "@/app/(protected)/dashboard/labtest/anatix/actions";
import { useAnatixSerial, type AnatixStatus } from "@/hooks/useAnatixSerial";
import { ANATIX_COMMANDS } from "@/utils/labtest/anatix/protocol";
import { AnatixStore } from "@/utils/labtest/anatix/store";
import { fmtMs, fmtNum } from "@/utils/labtest/anatix/analysis";
import { fmtDate } from "@/components/labtest/shared";
import type {
  AnatixFrame,
  AnatixLabConfig,
  AnatixLabRecord,
  AnatixSessionRecord,
  AnatixViewKey,
} from "@/types/anatix.types";
import { AnatixCharts } from "./AnatixCharts";
import { AnatixMaps } from "./AnatixMaps";
import { AnatixTables } from "./AnatixTables";
import { AnatixLabForm } from "./AnatixLabForm";
import { AnatixModal } from "./AnatixLabSlots";

import { unwrapAction } from "@/utils/stagebook/action-result";
const FLUSH_MS = 2000;
const BATCH_SIZE = 1500;
const UI_TICK_MS = 250;

const STATUS_META: Record<AnatixStatus, { label: string; tone: string; dot: string }> = {
  unsupported: { label: "Navegador sem Web Serial", tone: "text-warning", dot: "bg-warning" },
  idle: { label: "Desconectado", tone: "text-base-content/60", dot: "bg-base-content/30" },
  opening: { label: "Abrindo porta…", tone: "text-info", dot: "bg-info animate-pulse" },
  handshake: { label: "Verificando conexão…", tone: "text-info", dot: "bg-info animate-pulse" },
  connected: { label: "Conectado", tone: "text-success", dot: "bg-success" },
  silent: { label: "Sem dados do robô", tone: "text-warning", dot: "bg-warning animate-pulse" },
  error: { label: "Falha na conexão", tone: "text-error", dot: "bg-error" },
};

const VIEW_TABS: { key: AnatixViewKey; label: string; icon: typeof BarChart3 }[] = [
  { key: "charts", label: "Gráficos", icon: BarChart3 },
  { key: "maps", label: "Mapas", icon: MapIcon },
  { key: "tables", label: "Tabelas", icon: Table2 },
];

type Source = { kind: "live" } | { kind: "saved"; session: AnatixSessionRecord; store: AnatixStore };

export function AnatixLabView({
  lab,
  sessions,
}: {
  lab: AnatixLabRecord;
  sessions: AnatixSessionRecord[];
}) {
  const router = useRouter();
  const settingsRef = useRef<HTMLDialogElement>(null);
  const [config, setConfig] = useState<AnatixLabConfig>(lab.config);

  // Store ao vivo: objeto mutável, a UI lê com throttle via `version`.
  const [live] = useState(() => new AnatixStore());
  const [version, setVersion] = useState(0);
  const [paused, setPaused] = useState(false);
  const [source, setSource] = useState<Source>({ kind: "live" });
  const [loadingSession, setLoadingSession] = useState<string | null>(null);

  const enabledViews = VIEW_TABS.filter((v) => config.views[v.key]);
  const [view, setView] = useState<AnatixViewKey>(enabledViews[0]?.key ?? "charts");
  const currentView = config.views[view] ? view : (enabledViews[0]?.key ?? "charts");

  // ---- Gravação no banco ----------------------------------------------------
  const [record, setRecord] = useState(true);
  const [saveInfo, setSaveInfo] = useState({ saved: 0, failed: 0, active: false });
  const [saveError, setSaveError] = useState<string | null>(null);
  const sessionIdRef = useRef<Promise<string | null> | null>(null);
  const pendingRef = useRef<AnatixFrame[]>([]);
  const batchRef = useRef(0);
  const flushingRef = useRef<Promise<void> | null>(null);
  const recordRef = useRef(record);
  useEffect(() => {
    recordRef.current = record;
  }, [record]);

  const flush = useCallback(async () => {
    if (flushingRef.current) return flushingRef.current;
    const run = (async () => {
      const sessionId = await sessionIdRef.current;
      if (!sessionId) return;
      while (pendingRef.current.length) {
        const chunk = pendingRef.current.splice(0, BATCH_SIZE);
        try {
          unwrapAction(await appendAnatixFrames({ sessionId, batch: batchRef.current++, frames: chunk }));
          setSaveInfo((s) => ({ ...s, saved: s.saved + chunk.length }));
        } catch (err) {
          setSaveInfo((s) => ({ ...s, failed: s.failed + chunk.length }));
          setSaveError(err instanceof Error ? err.message : "Falha ao gravar frames.");
          break;
        }
      }
    })();
    flushingRef.current = run;
    await run;
    flushingRef.current = null;
  }, []);

  const serial = useAnatixSerial(config.baudRate, {
    onFrame: (frame) => {
      live.add(frame);
      if (recordRef.current && sessionIdRef.current) pendingRef.current.push(frame);
    },
    onConsole: (text) => live.addConsole(text, "serial"),
    onInvalid: () => live.addInvalid(),
    onConnected: (hello) => {
      live.addConsole(
        hello
          ? `Conectado: ${hello.robot} (${hello.board}), protocolo v${hello.version}, relatórios a cada ${hello.periodMs} ms.`
          : "Conectado (o robô não enviou o frame H).",
        "system",
      );
      if (!recordRef.current) return;
      setSaveError(null);
      batchRef.current = 0;
      pendingRef.current = []; // o frame H chega logo em seguida via onFrame
      setSaveInfo({ saved: 0, failed: 0, active: true });
      sessionIdRef.current = startAnatixSession({
        labId: lab.id,
        robotName: hello?.robot ?? null,
        board: hello?.board ?? null,
        protocolVersion: hello?.version ?? null,
        baudRate: config.baudRate,
      })
        .then((r) => unwrapAction(r).sessionId)
        .catch((err) => {
          setSaveError(err instanceof Error ? err.message : "Não foi possível criar a sessão.");
          return null;
        });
    },
    onClosed: async (reason) => {
      live.addConsole(reason ?? "Desconectado.", "system");
      const pendingSession = sessionIdRef.current;
      if (!pendingSession) return;
      await flush();
      const sessionId = await pendingSession;
      sessionIdRef.current = null;
      pendingRef.current = [];
      setSaveInfo((s) => ({ ...s, active: false }));
      if (!sessionId) return;
      try {
        unwrapAction(await endAnatixSession({
          sessionId,
          frameCount: live.frameCount,
          invalidFrames: live.invalidFrames,
          droppedFrames: live.droppedByRobot,
          summary: live.summary(),
        }));
        router.refresh();
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Não foi possível encerrar a sessão.");
      }
    },
  });

  // Gravação periódica em lotes.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (pendingRef.current.length) void flush();
    }, FLUSH_MS);
    return () => window.clearInterval(id);
  }, [flush]);

  // Redesenho com throttle.
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setVersion((v) => (v === live.version ? v : live.version));
    }, UI_TICK_MS);
    return () => window.clearInterval(id);
  }, [live, paused]);

  const connected = serial.status === "connected" || serial.status === "silent";
  const busy = serial.status === "opening" || serial.status === "handshake";

  function startConnection(reuseKnown: boolean) {
    live.reset();
    setVersion(live.version);
    setSource({ kind: "live" });
    void serial.connect({ reuseKnown });
  }

  // ---- Configuração persistida (métricas do gráfico, eixos do mapa) ---------
  const saveTimer = useRef<number | null>(null);
  function patchConfig(patch: Partial<AnatixLabConfig>) {
    const next = { ...config, ...patch };
    setConfig(next);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void updateAnatixLab({ labId: lab.id, config: next }).catch(() => undefined);
    }, 800);
  }

  // ---- Sessões salvas -------------------------------------------------------
  const [, startTransition] = useTransition();
  async function openSession(session: AnatixSessionRecord) {
    setLoadingSession(session.id);
    try {
      const { frames } = await getAnatixSessionFrames(session.id);
      const store = new AnatixStore();
      for (const f of frames) store.add(f);
      setSource({ kind: "saved", session, store });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Não foi possível abrir a sessão.");
    } finally {
      setLoadingSession(null);
    }
  }

  function removeSession(session: AnatixSessionRecord) {
    if (!confirm("Excluir esta sessão gravada?")) return;
    if (source.kind === "saved" && source.session.id === session.id) setSource({ kind: "live" });
    startTransition(async () => {
      unwrapAction(await deleteAnatixSession(session.id));
      router.refresh();
    });
  }

  function removeLab() {
    if (!confirm(`Excluir "${lab.name}" e todas as sessões gravadas?`)) return;
    startTransition(async () => {
      await serial.disconnect();
      unwrapAction(await deleteAnatixLab(lab.id));
      router.push("/dashboard/labtest/anatix");
    });
  }

  const store = source.kind === "saved" ? source.store : live;
  const shownVersion = source.kind === "saved" ? source.store.version : version;
  const loop = store.loop.at(-1);
  const status = STATUS_META[serial.status];
  const hello = live.hello;

  return (
    <div className="min-h-full bg-base-200/40 px-4 py-8 text-base-content sm:px-6 lg:px-8">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link href="/dashboard/labtest/anatix" className="btn btn-ghost btn-xs -ml-2 mb-2 gap-1 text-base-content/60">
            <ArrowLeft size={14} /> Laboratórios Anatix
          </Link>
          <h1 className="truncate text-3xl font-black tracking-tight">{lab.name}</h1>
          {lab.description && (
            <p className="mt-1 max-w-2xl text-sm text-base-content/60">{lab.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost btn-sm border-base-300 bg-base-100" onClick={() => settingsRef.current?.showModal()}>
            <Settings2 size={15} /> Configurar
          </button>
          <button type="button" className="btn btn-ghost btn-sm btn-square border-base-300 bg-base-100 hover:text-error" onClick={removeLab} aria-label="Excluir laboratório">
            <Trash2 size={15} />
          </button>
        </div>
      </header>

      {/* Conexão */}
      <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Cable size={18} />
              </span>
              <div>
                <p className={`flex items-center gap-2 text-sm font-bold ${status.tone}`}>
                  <span className={`size-2.5 rounded-full ${status.dot}`} />
                  {status.label}
                </p>
                <p className="text-xs text-base-content/50">
                  {connected && hello
                    ? `${hello.robot} · ${hello.board} · ${serial.portLabel ?? ""}`
                    : `${config.baudRate.toLocaleString("pt-BR")} baud${serial.knownPorts ? ` · ${serial.knownPorts} porta(s) já autorizada(s)` : ""}`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {connected || busy ? (
                <button type="button" className="btn btn-sm btn-error btn-outline" onClick={() => void serial.disconnect()}>
                  <Unplug size={15} /> Desconectar
                </button>
              ) : (
                <>
                  {serial.knownPorts > 0 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost border-base-300"
                      disabled={serial.status === "unsupported"}
                      onClick={() => startConnection(true)}
                    >
                      <RotateCcw size={15} /> Reconectar
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    disabled={serial.status === "unsupported"}
                    onClick={() => startConnection(false)}
                  >
                    <Plug size={15} /> Conectar robô
                  </button>
                </>
              )}
            </div>
          </div>

          {serial.status === "unsupported" && (
            <div role="alert" className="alert alert-warning alert-soft mt-4 text-sm">
              <AlertTriangle size={16} />
              A conexão USB usa a Web Serial API. Abra o RoboStage no Chrome, Edge ou Opera em um computador.
            </div>
          )}
          {serial.error && (
            <div role="alert" className="alert alert-error alert-soft mt-4 text-sm">
              <CircleSlash size={16} />
              {serial.error}
            </div>
          )}
          {serial.status === "handshake" && (
            <p className="mt-4 text-xs text-base-content/60">
              Porta aberta. Enviando <code>ANX PING</code> e aguardando o robô se apresentar…
              (placas como o Uno reiniciam ao conectar).
            </p>
          )}
          {serial.status === "silent" && (
            <p className="mt-4 text-xs text-warning">
              Conectado, mas o robô parou de enviar. Ele travou, reiniciou ou o <code>ANX_UPDATE()</code> deixou de ser chamado.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-base-200 pt-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={record}
                disabled={connected || busy}
                onChange={(e) => setRecord(e.target.checked)}
              />
              <Database size={14} className="text-base-content/50" />
              Salvar sessão no banco
            </label>
            {saveInfo.active || saveInfo.saved > 0 ? (
              <span className="text-xs text-base-content/60">
                {saveInfo.saved.toLocaleString("pt-BR")} frames gravados
                {saveInfo.failed > 0 && <span className="text-error"> · {saveInfo.failed} falharam</span>}
              </span>
            ) : null}
            {connected && (
              <div className="ml-auto flex items-center gap-1.5">
                <select
                  className="select select-xs select-bordered"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) void serial.send(ANATIX_COMMANDS.rate(Number(e.target.value)));
                    e.target.value = "";
                  }}
                  aria-label="Período dos relatórios"
                >
                  <option value="" disabled>Relatórios a cada…</option>
                  {[100, 250, 500, 1000].map((ms) => (
                    <option key={ms} value={ms}>{ms} ms</option>
                  ))}
                </select>
                <button type="button" className="btn btn-ghost btn-xs border-base-300" onClick={() => void serial.send(ANATIX_COMMANDS.reset)}>
                  Zerar estatísticas
                </button>
              </div>
            )}
          </div>
          {saveError && <p className="mt-2 text-xs text-error">{saveError}</p>}
        </div>

        {/* Indicadores rápidos */}
        <div className="grid grid-cols-2 gap-3">
          <Metric icon={Zap} label="Loops por segundo" value={fmtNum(loop?.lps)} sub={loop ? `pior loop ${fmtNum(loop.maxUs)} µs` : "—"} />
          <Metric icon={MemoryStick} label="RAM livre" value={loop && loop.freeRam >= 0 ? `${fmtNum(loop.freeRam)} B` : "—"} sub={hello?.board ?? "placa desconhecida"} />
          <Metric icon={Cpu} label="Frames recebidos" value={store.frameCount.toLocaleString("pt-BR")} sub={`${store.invalidFrames} inválidos · ${store.droppedByRobot} descartados`} />
          <Metric icon={History} label="Duração" value={fmtMs(store.firstT !== null && store.lastT !== null ? store.lastT - store.firstT : null)} sub={`${store.metrics.size} métricas · ${store.states.size} estados`} />
        </div>
      </section>

      {/* Fonte + abas de análise */}
      <nav className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="tabs tabs-box bg-base-100">
          {enabledViews.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={currentView === key}
              className={`tab gap-1.5 ${currentView === key ? "tab-active" : ""}`}
              onClick={() => setView(key)}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {source.kind === "saved" ? (
            <>
              <span className="badge badge-info badge-soft">
                Sessão de {new Date(source.session.startedAt).toLocaleString("pt-BR")}
              </span>
              <button type="button" className="btn btn-sm btn-ghost border-base-300 bg-base-100" onClick={() => setSource({ kind: "live" })}>
                Voltar ao vivo
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-ghost border-base-300 bg-base-100"
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? <Play size={14} /> : <Pause size={14} />}
              {paused ? "Retomar" : "Pausar tela"}
            </button>
          )}
        </div>
      </nav>

      <main className="mt-4">
        {enabledViews.length === 0 ? (
          <p className="text-sm text-base-content/60">Ative gráficos, mapas ou tabelas em Configurar.</p>
        ) : currentView === "charts" ? (
          <AnatixCharts
            store={store}
            version={shownVersion}
            selected={config.chartMetrics}
            onSelectedChange={(chartMetrics) => patchConfig({ chartMetrics })}
          />
        ) : currentView === "maps" ? (
          <AnatixMaps
            store={store}
            version={shownVersion}
            mapX={config.mapX}
            mapY={config.mapY}
            onAxesChange={(mapX, mapY) => patchConfig({ mapX, mapY })}
          />
        ) : (
          <AnatixTables store={store} version={shownVersion} fileName={`anatix-${lab.name.replace(/\W+/g, "_")}`} />
        )}
      </main>

      {/* Histórico */}
      <section className="mt-8 rounded-2xl border border-base-300 bg-base-100 p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <Database size={15} /> Sessões gravadas
        </h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-base-content/50">
            Nenhuma sessão ainda. Conecte o robô com “Salvar sessão no banco” ligado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Início</th>
                  <th>Robô</th>
                  <th className="text-right">Duração</th>
                  <th className="text-right">Frames</th>
                  <th className="text-right">Métricas</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => {
                  const duration = s.endedAt
                    ? new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()
                    : null;
                  const isOpen = source.kind === "saved" && source.session.id === s.id;
                  return (
                    <tr key={s.id} className={isOpen ? "bg-primary/5" : ""}>
                      <td>
                        {fmtDate(s.startedAt)}{" "}
                        <span className="text-base-content/50">
                          {new Date(s.startedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td>{s.robotName ?? "—"} <span className="text-base-content/50">{s.board ?? ""}</span></td>
                      <td className="text-right">{duration === null ? <span className="badge badge-ghost badge-sm">interrompida</span> : fmtMs(duration)}</td>
                      <td className="text-right font-mono">{s.frameCount.toLocaleString("pt-BR")}</td>
                      <td className="text-right font-mono">{Object.keys(s.summary?.metrics ?? {}).length}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs border-base-300"
                            disabled={loadingSession === s.id}
                            onClick={() => void openSession(s)}
                          >
                            {loadingSession === s.id && <span className="loading loading-spinner loading-xs" />}
                            Analisar
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs btn-square hover:text-error"
                            onClick={() => removeSession(s)}
                            aria-label="Excluir sessão"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AnatixModal dialogRef={settingsRef} title="Configurar laboratório">
        <AnatixLabForm
          lab={{ ...lab, config }}
          onDone={(saved) => {
            setConfig(saved.config);
            settingsRef.current?.close();
          }}
        />
      </AnatixModal>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-base-300 bg-base-100 p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-base-content/60">
        <Icon size={13} /> {label}
      </p>
      <p className="truncate text-2xl font-black tracking-tight">{value}</p>
      <p className="truncate text-[11px] text-base-content/50">{sub}</p>
    </div>
  );
}
