"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CloudOff, Loader2, Pencil } from "lucide-react";
import QuickBrickCanvas from "@/components/QuickBrick/Estrategia/QuickBrickCanva";
import MatrizRiscoEditor from "@/components/QuickBrick/MatrizRisco/MatrizRiscoEditor";
import { SWOTCanvasDefault } from "@/components/QuickBrick/Swot/SWOTCanvasDefault";
import { SWOTCanvas } from "@/components/QuickBrick/Swot/SwotCanva";
import { MissionTable } from "@/components/QuickBrick/Tabela-de-analise-de-missoes/MissionTable";
import HeatmapPage from "@/components/QuickBrick/heatmap/HeatmapPage";
import Loader from "@/components/Loader";
import { INITIAL_COLUMNS } from "@/app/(public)/[competicao]/quickbrick/tabela-de-missoes/[season]/constants";
import { missionsFromRaw, type RawMission } from "@/utils/quickbrick/scoring";
import { useChangeNotifier } from "@/hooks/useChangeNotifier";
import { renameDiagram, saveDiagram, type DiagramDetail } from "@/app/(protected)/dashboard/quickbrick/actions";
import { DIAGRAM_META, seasonName, type DiagramData, type SwotMission } from "@/utils/quickbrick/notebook";
import type { Column, Mission } from "@/types/TableAnalytics";
import { DiagramIcon } from "./diagram-icon";

type SaveState = "idle" | "pending" | "saving" | "saved" | "error";

/** Salva com atraso (debounce) e descarrega o pendente ao sair da página. */
function useAutosave(diagramId: string) {
  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<unknown>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const data = pending.current;
    if (data === null) return;
    pending.current = null;
    setState("saving");
    const res = await saveDiagram(diagramId, data);
    if (res.ok) {
      setState(pending.current === null ? "saved" : "pending");
      setError(null);
    } else {
      setState("error");
      setError(res.error);
    }
  }, [diagramId]);

  const queue = useCallback(
    (data: unknown) => {
      pending.current = data;
      setState("pending");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), 1200);
    },
    [flush],
  );

  useEffect(() => {
    const onHide = () => void flush();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      void flush();
    };
  }, [flush]);

  return { state, error, queue, flush };
}

export function DiagramEditor({ diagram }: { diagram: DiagramDetail }) {
  const meta = DIAGRAM_META[diagram.kind];
  const { state, error, queue, flush } = useAutosave(diagram.id);
  const [title, setTitle] = useState(diagram.title);
  const [editingTitle, setEditingTitle] = useState(false);

  const commitTitle = async () => {
    setEditingTitle(false);
    const clean = title.trim();
    if (!clean || clean === diagram.title) {
      setTitle(clean || diagram.title);
      return;
    }
    const res = await renameDiagram(diagram.id, clean);
    if (!res.ok) setTitle(diagram.title);
  };

  return (
    <div className="qb-paper min-h-full px-4 py-6 sm:px-6 lg:px-8">
      <header className="mx-auto mb-6 flex max-w-[1400px] flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Link
            href={`/dashboard/quickbrick/${diagram.notebookId}`}
            onClick={() => void flush()}
            className="qb-hand inline-flex items-center gap-1.5 text-sm text-base-content/55 hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            {diagram.notebookName}
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <span
              className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-sm"
              style={{ background: meta.color }}
            >
              <DiagramIcon kind={diagram.kind} className="size-5" />
            </span>
            {editingTitle ? (
              <input
                autoFocus
                value={title}
                maxLength={80}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void commitTitle();
                  if (e.key === "Escape") {
                    setTitle(diagram.title);
                    setEditingTitle(false);
                  }
                }}
                className="qb-serif input input-ghost h-auto px-1 text-3xl"
                aria-label="Título do diagrama"
              />
            ) : (
              <button
                onClick={() => setEditingTitle(true)}
                className="qb-serif group flex min-w-0 items-center gap-2 text-left text-3xl leading-tight sm:text-4xl"
                title="Renomear diagrama"
              >
                <span className="truncate">{title}</span>
                <Pencil className="size-4 shrink-0 opacity-0 transition group-hover:opacity-40" />
              </button>
            )}
          </div>
          <p className="qb-serif mt-1 text-sm italic text-base-content/50">
            {meta.label}
            {diagram.season ? ` · ${seasonName(diagram.season) ?? diagram.season}` : ""}
          </p>
        </div>
        <SaveBadge state={state} error={error} />
      </header>

      <div className="mx-auto max-w-[1400px]">
        <DiagramBody diagram={diagram} onChange={queue} />
      </div>
    </div>
  );
}

function SaveBadge({ state, error }: { state: SaveState; error: string | null }) {
  const map: Record<SaveState, { icon: React.ReactNode; text: string; cls: string }> = {
    idle: { icon: <Check className="size-3.5" />, text: "Tudo salvo", cls: "text-base-content/45" },
    pending: { icon: <Pencil className="size-3.5" />, text: "Alterações não salvas", cls: "text-base-content/55" },
    saving: { icon: <Loader2 className="size-3.5 animate-spin" />, text: "Salvando…", cls: "text-base-content/55" },
    saved: { icon: <Check className="size-3.5" />, text: "Salvo no caderno", cls: "text-success" },
    error: { icon: <CloudOff className="size-3.5" />, text: error ?? "Falha ao salvar", cls: "text-error" },
  };
  const s = map[state];
  return (
    <span
      role="status"
      aria-live="polite"
      className={`qb-hand inline-flex items-center gap-1.5 rounded-full border border-base-300 bg-base-100/80 px-3 py-1 text-sm ${s.cls}`}
    >
      {s.icon}
      {s.text}
    </span>
  );
}

function DiagramBody({ diagram, onChange }: { diagram: DiagramDetail; onChange: (data: unknown) => void }) {
  const raw = (diagram.data ?? {}) as Record<string, unknown>;
  switch (diagram.kind) {
    case "estrategia": {
      const data = raw as DiagramData["estrategia"];
      return (
        <DesktopOnly>
          <div className="flex justify-center overflow-x-auto pb-10">
            <QuickBrickCanvas initialLayers={data.layers} onLayersChange={(layers) => onChange({ layers })} />
          </div>
        </DesktopOnly>
      );
    }
    case "matriz-risco": {
      const data = raw as DiagramData["matriz-risco"];
      return (
        <MatrizRiscoEditor
          initialRiscos={data.riscos ?? []}
          resetRiscos={[]}
          onRiscosChange={(riscos) => onChange({ riscos })}
        />
      );
    }
    case "swot": {
      const data = raw as DiagramData["swot"];
      return <SWOTCanvasDefault initialSwot={data.swot} onSwotChange={(swot) => onChange({ swot })} />;
    }
    case "swot-missoes":
      return (
        <MissionSwot
          season={diagram.season ?? "bioglow"}
          initial={(raw as DiagramData["swot-missoes"]).swot}
          onChange={(swot) => onChange({ swot })}
        />
      );
    case "tabela-missoes":
      return (
        <MissionTableDiagram
          season={diagram.season ?? "bioglow"}
          initial={raw as DiagramData["tabela-missoes"]}
          onChange={onChange}
        />
      );
    case "heatmap": {
      const data = raw as DiagramData["heatmap"];
      return (
        <DesktopOnly>
          <HeatmapPage embedded initialData={data} onDataChange={onChange} />
        </DesktopOnly>
      );
    }
  }
}

function DesktopOnly({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="qb-hand rounded-2xl border border-dashed border-base-300 bg-base-100/70 p-6 text-center text-base-content/60 md:hidden">
        Esta ferramenta precisa de uma tela maior. Abra o caderno em um notebook ou desktop para editar.
      </div>
      <div className="hidden md:block">{children}</div>
    </>
  );
}

// ---------------------------------------------------------------------------
// SWOT de missões: carrega as missões da temporada e tira as já posicionadas.
// ---------------------------------------------------------------------------

const MISSIONS_ENDPOINT = "/api/data/missions";

async function fetchSeasonMissions(season: string): Promise<RawMission[]> {
  const res = await fetch(MISSIONS_ENDPOINT);
  if (!res.ok) throw new Error(`Falha ao buscar missões (${res.status})`);
  const data = await res.json();
  return (data?.[season] ?? []) as RawMission[];
}

function MissionSwot({
  season,
  initial,
  onChange,
}: {
  season: string;
  initial?: Record<string, SwotMission[]>;
  onChange: (swot: Record<string, SwotMission[]>) => void;
}) {
  const [missions, setMissions] = useState<SwotMission[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const placed = new Set(Object.values(initial ?? {}).flat().map((m) => m.id));
    fetchSeasonMissions(season)
      .then((list) => {
        if (cancelled) return;
        setMissions(
          list
            .filter((m) => (m as { image?: string }).image && !placed.has(m.id))
            .map((m) => ({ id: m.id, name: m.name, image: (m as { image?: string }).image })),
        );
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
    // Só na montagem: as missões disponíveis passam a ser controladas pelo canvas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season]);

  if (failed) return <p className="text-error">Não foi possível carregar as missões da temporada.</p>;
  if (!missions) return <CenteredLoader />;

  return (
    <SWOTCanvas
      missions={missions}
      setMissions={(m) => setMissions(m as SwotMission[])}
      seasons={[season]}
      selectedSeason={season}
      setSelectedSeason={() => undefined}
      initialSwot={initial}
      onSwotChange={(swot) => onChange(swot as Record<string, SwotMission[]>)}
    />
  );
}

// ---------------------------------------------------------------------------
// Tabela de missões
// ---------------------------------------------------------------------------

function MissionTableDiagram({
  season,
  initial,
  onChange,
}: {
  season: string;
  initial: DiagramData["tabela-missoes"];
  onChange: (data: { missions: Mission[]; columns: Column[] }) => void;
}) {
  const hasSaved = Boolean(initial.missions && initial.missions.length > 0);
  const [missions, setMissions] = useState<Mission[] | null>(hasSaved ? initial.missions! : null);
  const [columns, setColumns] = useState<Column[]>(initial.columns?.length ? initial.columns : INITIAL_COLUMNS);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (hasSaved) return;
    let cancelled = false;
    fetchSeasonMissions(season)
      .then((list) => {
        if (!cancelled) setMissions(missionsFromRaw(list.filter((m) => m.id?.includes("M"))));
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [hasSaved, season]);

  const snapshot = useMemo(() => (missions ? { missions, columns } : null), [missions, columns]);
  useChangeNotifier(snapshot, (s) => s && onChange(s));

  if (failed) return <p className="text-error">Não foi possível carregar as missões da temporada.</p>;
  if (!missions) return <CenteredLoader />;

  return (
    <MissionTable missions={missions} setMissions={setMissions} columns={columns} setColumns={setColumns} season={season} />
  );
}

function CenteredLoader() {
  return (
    <div className="grid min-h-64 place-items-center">
      <Loader />
    </div>
  );
}
