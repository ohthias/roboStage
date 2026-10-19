"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { analyzePath, analyzeRescue } from "@/utils/quickbrick/ArenaBuilder/analysis";
import { download, svgToPng } from "@/utils/quickbrick/ArenaBuilder/export";
import { defaultProject, sampleProject, sanitizeProject } from "@/utils/quickbrick/ArenaBuilder/project";
import { emptyTile } from "@/utils/quickbrick/ArenaBuilder/tiles";
import type { Project, Tile } from "@/utils/quickbrick/ArenaBuilder/types";
import PathEditor, { type Mode, type Selection } from "./PathEditor";
import RescueEditor from "./RescueEditor";
import StatsPanel from "./StatsPanel";
import { Undo2, Redo2 } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";

const STORAGE_KEY = "obr-arena-builder:v1";

export default function ArenaBuilder() {
  const [project, setProject] = useState<Project>(defaultProject);
  const [tab, setTab] = useState<"path" | "rescue">("path");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [mode, setMode] = useState<Mode>("select");
  const [brush, setBrush] = useState<Tile>({ ...emptyTile(), shape: "straight" });
  const [ready, setReady] = useState(false);
  const { addToast } = useToast();

  const projectRef = useRef(project);
  projectRef.current = project;
  const past = useRef<Project[]>([]);
  const future = useRef<Project[]>([]);
  const [, bump] = useState(0);

  const pathSvg = useRef<SVGSVGElement | null>(null);
  const rescueSvg = useRef<SVGSVGElement | null>(null);

  /* --------------------------- persistência --------------------------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = sanitizeProject(JSON.parse(raw));
        if (p) setProject(p);
      }
    } catch {
      /* armazenamento indisponível */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {
      /* ignora */
    }
  }, [project, ready]);

  /* ------------------------------ histórico ------------------------------ */
  const checkpoint = useCallback(() => {
    past.current.push(projectRef.current);
    if (past.current.length > 100) past.current.shift();
    future.current = [];
    bump((n) => n + 1);
  }, []);

  const live = useCallback((p: Project) => setProject(p), []);

  const commit = useCallback(
    (p: Project) => {
      checkpoint();
      setProject(p);
    },
    [checkpoint],
  );

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(projectRef.current);
    setProject(prev);
    bump((n) => n + 1);
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(projectRef.current);
    setProject(next);
    bump((n) => n + 1);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  /* ------------------------------- ações ------------------------------- */
  const slug = project.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "arena";

  async function exportPng() {
    const svg = tab === "path" ? pathSvg.current : rescueSvg.current;
    if (!svg) return;
    try {
      await svgToPng(svg, `${slug}-${tab === "path" ? "percurso" : "sala-de-resgate"}.png`);
    } catch {
      addToast("Não foi possível gerar o PNG.");
    }
  }

  function loadSample() {
    commit(sampleProject());
    setSelection(null);
    addToast("Exemplo carregado.");
  }

  function reset() {
    if (!window.confirm("Limpar toda a arena (percurso e sala de resgate)?")) return;
    commit(defaultProject());
    setSelection(null);
    addToast("Arena limpa.");
  }

  const pathAnalysis = useMemo(() => analyzePath(project), [project]);
  const rescueChecks = useMemo(() => analyzeRescue(project.rescue), [project.rescue]);

  return (
    <div className="mx-auto flex w-full flex-col gap-4 px-4">
      <header className="navbar min-h-0 flex-wrap gap-3 rounded-box bg-base-100 px-4 py-3 shadow-sm">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <label className="floating-label">
            <span>Nome da arena</span>
            <input
              aria-label="Nome da arena"
              className="input input-sm w-56"
              value={project.name}
              type="text"
              placeholder="Nome da arena"
              onChange={(e) => live({ ...project, name: e.target.value })}
              onFocus={checkpoint}
            />
          </label>
          <div className="tabs tabs-box w-fit bg-base-200 tabs-sm">
            {([1, 2] as const).map((lv) => (
              <button
                key={lv}
                className={`tab ${project.level === lv ? "tab-active font-medium" : ""}`}
                onClick={() => commit({ ...project, level: lv })}
                title={
                  lv === 1
                    ? "Nível 1: gap até 10 cm, barreira de 5 mm"
                    : "Nível 2: gap até 15 cm, barreira de 6 cm"
                }
              >
                Nível {lv}
              </button>
            ))}
          </div>
          <div role="tablist" className="tabs tabs-box w-fit bg-base-200 tabs-sm">
            <button
              role="tab"
              className={`tab ${tab === "path" ? "tab-active" : ""}`}
              onClick={() => setTab("path")}
            >
              Percurso
            </button>
            <button
              role="tab"
              className={`tab ${tab === "rescue" ? "tab-active" : ""}`}
              onClick={() => setTab("rescue")}
            >
              Sala de resgate
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="gap-0.5 join">
            <button
              className="btn btn-sm join-item"
              onClick={undo}
              disabled={!past.current.length}
              title="Desfazer (Ctrl+Z)"
            >
              <Undo2 size={16} />
            </button>
            <button
              className="btn btn-sm join-item"
              onClick={redo}
              disabled={!future.current.length}
              title="Refazer (Ctrl+Shift+Z)"
            >
              <Redo2 size={16} />
            </button>
          </div>
          <button className="btn btn-sm" onClick={loadSample}>
            Exemplo
          </button>
          <button className="btn btn-sm btn-ghost text-error" onClick={reset}>
            Limpar tudo
          </button>
          <button onClick={exportPng} className="btn btn-sm btn-primary">
            Exportar ({tab === "path" ? "percurso" : "sala de resgate"})
          </button>
        </div>
      </header>

      {/* -------------------------------- corpo -------------------------------- */}
      <div className="grid items-start gap-4 2xl:grid-cols-[1fr_340px]">
        <main className="flex min-w-0 flex-col gap-3">
          {tab === "path" ? (
            <PathEditor
              project={project}
              commit={commit}
              live={live}
              checkpoint={checkpoint}
              selection={selection}
              setSelection={setSelection}
              mode={mode}
              setMode={setMode}
              brush={brush}
              setBrush={setBrush}
              svgRef={pathSvg}
              onEditRescue={() => setTab("rescue")}
            />
          ) : (
            <RescueEditor project={project} commit={commit} live={live} checkpoint={checkpoint} svgRef={rescueSvg} />
          )}
        </main>

        <div className="2xl:sticky 2xl:top-4">
          <StatsPanel path={pathAnalysis} rescue={rescueChecks} />
        </div>
      </div>
    </div>
  );
}
