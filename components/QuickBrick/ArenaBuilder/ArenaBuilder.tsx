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

const STORAGE_KEY = "obr-arena-builder:v1";

export default function ArenaBuilder() {
  const [project, setProject] = useState<Project>(defaultProject);
  const [tab, setTab] = useState<"path" | "rescue">("path");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [mode, setMode] = useState<Mode>("select");
  const [brush, setBrush] = useState<Tile>({ ...emptyTile(), shape: "straight" });
  const [toast, setToast] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const projectRef = useRef(project);
  projectRef.current = project;
  const past = useRef<Project[]>([]);
  const future = useRef<Project[]>([]);
  const [, bump] = useState(0);

  const pathSvg = useRef<SVGSVGElement | null>(null);
  const rescueSvg = useRef<SVGSVGElement | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  /* ------------------------------- ações ------------------------------- */
  const slug = project.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "arena";

  function exportJson() {
    download(new Blob([JSON.stringify(project, null, 2)], { type: "application/json" }), `${slug}.json`);
  }

  async function exportPng() {
    const svg = tab === "path" ? pathSvg.current : rescueSvg.current;
    if (!svg) return;
    try {
      await svgToPng(svg, `${slug}-${tab === "path" ? "percurso" : "sala-de-resgate"}.png`);
    } catch {
      setToast("Não foi possível gerar o PNG.");
    }
  }

  function importJson(file: File) {
    file
      .text()
      .then((txt) => {
        const p = sanitizeProject(JSON.parse(txt));
        if (!p) throw new Error("formato inválido");
        commit(p);
        setSelection(null);
        setToast("Arena importada.");
      })
      .catch(() => setToast("Arquivo inválido: use um JSON exportado por esta ferramenta."));
  }

  function loadSample() {
    commit(sampleProject());
    setSelection(null);
    setToast("Exemplo carregado.");
  }

  function reset() {
    if (!window.confirm("Limpar toda a arena (percurso e sala de resgate)?")) return;
    commit(defaultProject());
    setSelection(null);
  }

  const pathAnalysis = useMemo(() => analyzePath(project), [project]);
  const rescueChecks = useMemo(() => analyzeRescue(project.rescue), [project.rescue]);

  return (
    <div className="mx-auto flex max-w-[1700px] flex-col gap-4 p-3 md:p-5">
      {/* ------------------------------ cabeçalho ------------------------------ */}
      <header className="navbar min-h-0 flex-wrap gap-3 rounded-box bg-base-100 px-4 py-3 shadow-sm">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div>
            <h1 className="text-lg font-extrabold leading-none tracking-tight">Criador de Arenas</h1>
            <p className="text-xs opacity-60">OBR · Robótica de Resgate · ladrilhos 30 × 30 cm</p>
          </div>
          <input
            aria-label="Nome da arena"
            className="input input-sm w-56"
            value={project.name}
            onChange={(e) => live({ ...project, name: e.target.value })}
            onFocus={checkpoint}
          />
          <div className="join">
            {([1, 2] as const).map((lv) => (
              <button
                key={lv}
                className={`btn btn-sm join-item ${project.level === lv ? "btn-neutral" : ""}`}
                onClick={() => commit({ ...project, level: lv })}
                title={lv === 1 ? "Nível 1: gap até 10 cm, barreira de 5 mm" : "Nível 2: gap até 15 cm, barreira de 6 cm"}
              >
                Nível {lv}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="join">
            <button className="btn btn-sm join-item" onClick={undo} disabled={!past.current.length} title="Desfazer (Ctrl+Z)">
              ↶
            </button>
            <button className="btn btn-sm join-item" onClick={redo} disabled={!future.current.length} title="Refazer (Ctrl+Shift+Z)">
              ↷
            </button>
          </div>
          <button className="btn btn-sm" onClick={loadSample}>Exemplo</button>
          <button className="btn btn-sm btn-ghost text-error" onClick={reset}>Limpar tudo</button>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-sm btn-primary">Exportar ▾</div>
            <ul tabIndex={0} className="menu dropdown-content z-10 mt-1 w-56 rounded-box bg-base-100 p-2 shadow-lg">
              <li><button onClick={exportPng}>PNG ({tab === "path" ? "percurso" : "sala de resgate"})</button></li>
              <li><button onClick={exportJson}>JSON (salvar projeto)</button></li>
              <li><button onClick={() => window.print()}>Imprimir / PDF</button></li>
            </ul>
          </div>
          <button className="btn btn-sm" onClick={() => fileInput.current?.click()}>Importar JSON</button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
              e.target.value = "";
            }}
          />
          <label className="flex cursor-pointer items-center gap-1 text-xs" title="Tema escuro">
            ☀
            <input type="checkbox" value="dark" className="toggle toggle-sm theme-controller" />
            ☾
          </label>
        </div>
      </header>

      {/* -------------------------------- corpo -------------------------------- */}
      <div className="grid items-start gap-4 2xl:grid-cols-[1fr_340px]">
        <main className="flex min-w-0 flex-col gap-3">
          <div role="tablist" className="tabs tabs-box w-fit bg-base-100">
            <button role="tab" className={`tab ${tab === "path" ? "tab-active" : ""}`} onClick={() => setTab("path")}>
              Percurso · 3 tablados 3×3
            </button>
            <button role="tab" className={`tab ${tab === "rescue" ? "tab-active" : ""}`} onClick={() => setTab("rescue")}>
              Sala de resgate
            </button>
          </div>

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

      {toast && (
        <div className="toast toast-end">
          <div className="alert alert-info text-sm">{toast}</div>
        </div>
      )}
    </div>
  );
}
