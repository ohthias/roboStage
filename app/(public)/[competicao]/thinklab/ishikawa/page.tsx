"use client";

import { useId, useMemo, useRef, useState } from "react";
import FishboneDiagram from "@/components/thinklab/FishboneDiagram";
import AccessibleOutline from "@/components/thinklab/AccessibleOutline";
import { parseMarkdown, EXAMPLE_MARKDOWN } from "@/utils/thinklab/parseMarkdown";
import { downloadPNG, downloadSVG } from "@/utils/thinklab/exportDiagram";

type MobileTab = "editor" | "diagram";
type PngScale = 2 | 3 | 4;

export default function Home() {
  const [markdown, setMarkdown] = useState<string>(EXAMPLE_MARKDOWN);
  const [busy, setBusy] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("editor");
  const [fitToScreen, setFitToScreen] = useState(true);
  const [pngScale, setPngScale] = useState<PngScale>(3);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const editorId = useId();
  const helpId = useId();

  const data = useMemo(() => parseMarkdown(markdown), [markdown]);

  const causeCount = data.causes.length;
  const subCount = data.causes.reduce((acc, c) => acc + c.subcauses.length, 0);
  const detailCount = data.causes.reduce(
    (acc, c) => acc + c.subcauses.reduce((a, s) => a + s.details.length, 0),
    0
  );

  function handleDownloadSVG() {
    if (!svgRef.current) return;
    downloadSVG(svgRef.current, `${slug(data.problem)}.svg`);
  }

  async function handleDownloadPNG() {
    if (!svgRef.current) return;
    setExportError(null);
    try {
      setBusy(true);
      await downloadPNG(svgRef.current, {
        filename: `${slug(data.problem)}.png`,
        scale: pngScale,
        padding: 28,
      });
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Não foi possível exportar o PNG.");
    } finally {
      setBusy(false);
    }
  }

  function handleLoadExample() {
    setMarkdown(EXAMPLE_MARKDOWN);
  }

  function handleClear() {
    setMarkdown("# \n\n## \n### \n#### \n");
  }

  return (
    <main id="conteudo-principal" className="min-h-screen bg-base-200 bg-blueprint bg-grid text-base-content">
      <header className="border-b border-white/10 bg-base-300/60 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-1 px-4 py-5 sm:px-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-secondary">
              Espinha de peixe · causa e efeito
            </p>
            <h1 className="font-display text-2xl font-semibold text-primary sm:text-3xl">
              Diagrama de Ishikawa
            </h1>
          </div>
          <p className="max-w-md text-sm text-base-content/70">
            Escreva a estrutura em markdown e o diagrama é desenhado automaticamente ao lado, pronto para exportar.
          </p>
        </div>
      </header>

      {/* Tabs — visíveis apenas em telas pequenas, para alternar entre editor e diagrama */}
      <div
        role="tablist"
        aria-label="Alternar entre editor e diagrama"
        className="tabs tabs-boxed sticky top-0 z-10 mx-4 mt-4 flex bg-base-300/90 backdrop-blur lg:hidden"
      >
        <button
          role="tab"
          id="tab-editor"
          aria-selected={mobileTab === "editor"}
          aria-controls="panel-editor"
          tabIndex={mobileTab === "editor" ? 0 : -1}
          className={`tab flex-1 min-h-11 text-sm font-medium ${mobileTab === "editor" ? "tab-active" : ""}`}
          onClick={() => setMobileTab("editor")}
        >
          Editor
        </button>
        <button
          role="tab"
          id="tab-diagram"
          aria-selected={mobileTab === "diagram"}
          aria-controls="panel-diagram"
          tabIndex={mobileTab === "diagram" ? 0 : -1}
          className={`tab flex-1 min-h-11 text-sm font-medium ${mobileTab === "diagram" ? "tab-active" : ""}`}
          onClick={() => setMobileTab("diagram")}
        >
          Diagrama
        </button>
      </div>

      <section className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[440px_1fr]">
        {/* Painel do editor */}
        <div
          id="panel-editor"
          role="tabpanel"
          aria-labelledby="tab-editor"
          className={`flex-col gap-4 ${mobileTab === "editor" ? "flex" : "hidden"} lg:flex`}
        >
          <div className="rounded-2xl border border-white/10 bg-base-300/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-base-content/80">
                Editor markdown
              </h2>
              <div className="flex gap-2">
                <button onClick={handleLoadExample} className="btn btn-ghost btn-sm min-h-9">
                  Exemplo
                </button>
                <button onClick={handleClear} className="btn btn-ghost btn-sm min-h-9">
                  Limpar
                </button>
              </div>
            </div>

            <label htmlFor={editorId} className="sr-only">
              Editor de markdown do diagrama de Ishikawa
            </label>
            <textarea
              id={editorId}
              aria-describedby={helpId}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="editor-textarea textarea h-[45vh] w-full resize-none rounded-xl border-white/10 bg-base-100/70 font-mono text-sm leading-relaxed text-base-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:h-[420px]"
              placeholder={"# Problema principal\n## Causa\n### Sub causa\n#### Detalhe"}
            />

            <div
              className="mt-3 flex flex-wrap gap-2 text-xs"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="badge badge-outline gap-1 border-primary/50 text-primary">
                {causeCount} causa{causeCount !== 1 ? "s" : ""}
              </span>
              <span className="badge badge-outline gap-1 border-secondary/50 text-secondary">
                {subCount} sub causa{subCount !== 1 ? "s" : ""}
              </span>
              <span className="badge badge-outline gap-1 border-info/50 text-info">
                {detailCount} detalhe{detailCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div id={helpId} className="collapse collapse-arrow rounded-2xl border border-white/10 bg-base-300/60">
            <input type="checkbox" defaultChecked aria-label="Mostrar ou esconder ajuda de sintaxe" />
            <div className="collapse-title font-display text-sm font-semibold text-base-content/80">
              Como escrever a estrutura
            </div>
            <div className="collapse-content text-sm text-base-content/70">
              <ul className="space-y-2 font-mono text-xs">
                <li>
                  <span className="text-primary"># </span>Problema principal
                  <span className="ml-2 text-base-content/50">→ cabeça do peixe (apenas um)</span>
                </li>
                <li>
                  <span className="text-secondary">## </span>Causa
                  <span className="ml-2 text-base-content/50">→ espinha principal (várias)</span>
                </li>
                <li>
                  <span className="text-info">### </span>Sub causa
                  <span className="ml-2 text-base-content/50">→ ramificação da espinha (várias por causa)</span>
                </li>
                <li>
                  <span className="opacity-70">#### </span>Detalhe
                  <span className="ml-2 text-base-content/50">→ detalhe da sub causa (vários)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Painel do diagrama */}
        <div
          id="panel-diagram"
          role="tabpanel"
          aria-labelledby="tab-diagram"
          className={`flex-col gap-4 ${mobileTab === "diagram" ? "flex" : "hidden"} lg:flex`}
        >
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-base-300/60 p-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-base-content/80">
              <LegendDot color="#C9622F" label="Causa" />
              <LegendDot color="#1F7A6C" label="Sub causa" />
              <LegendDot color="#5B5FC7" label="Detalhe" />

              <label className="ml-auto flex min-h-11 cursor-pointer items-center gap-2 py-2 text-xs text-base-content/70">
                <input
                  type="checkbox"
                  checked={fitToScreen}
                  onChange={(e) => setFitToScreen(e.target.checked)}
                  className="checkbox checkbox-xs"
                />
                Ajustar à tela
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadSVG}
                className="btn btn-outline btn-sm min-h-11 flex-1 sm:flex-none"
              >
                Baixar SVG
              </button>

              <div className="flex flex-1 gap-2 sm:flex-none">
                <label className="sr-only" htmlFor="png-scale">
                  Qualidade do PNG
                </label>
                <select
                  id="png-scale"
                  value={pngScale}
                  onChange={(e) => setPngScale(Number(e.target.value) as PngScale)}
                  className="select select-bordered select-sm min-h-11 w-20"
                  aria-label="Qualidade do PNG exportado"
                >
                  <option value={2}>2x</option>
                  <option value={3}>3x</option>
                  <option value={4}>4x</option>
                </select>

                <button
                  onClick={handleDownloadPNG}
                  className="btn btn-primary btn-sm min-h-11 flex-1"
                  disabled={busy}
                  aria-busy={busy}
                >
                  {busy ? "Gerando…" : "Baixar PNG"}
                </button>
              </div>
            </div>

            {exportError && (
              <p role="alert" className="text-xs text-error">
                {exportError}
              </p>
            )}
          </div>

          <div className="diagram-scroll flex-1 overflow-auto rounded-2xl border border-white/10 bg-[#FBF9F4] p-4 shadow-inner">
            <FishboneDiagram ref={svgRef} data={data} fitToScreen={fitToScreen} />
          </div>

          <details className="rounded-2xl border border-white/10 bg-base-300/60 p-4">
            <summary className="cursor-pointer font-display text-sm font-semibold text-base-content/80">
              Ver estrutura em lista (versão acessível)
            </summary>
            <div className="mt-3 rounded-xl bg-base-100/70 p-3">
              <AccessibleOutline data={data} />
            </div>
          </details>
        </div>
      </section>

      <footer className="mx-auto max-w-[1400px] px-4 pb-8 text-center text-xs text-base-content/40 sm:px-6">
        Feito com Next.js + TypeScript + daisyUI — diagrama renderizado 100% em SVG, sem envio de dados para servidor.
      </footer>
    </main>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function slug(text: string): string {
  const base = (text || "diagrama-ishikawa")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || "diagrama-ishikawa";
}
