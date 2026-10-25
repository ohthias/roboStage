"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Trash2, X } from "lucide-react";
import { DocIcon, EMOJI_GROUPS, ICON_CATALOG } from "./doc-icon";
import { SWATCHES, bgVar, solidVar, textVar } from "./editor-colors";
import {
  GRADIENTS,
  defaultDocIcon,
  parseDocIcon,
  serializeDocIcon,
  type DocIconShape,
  type DocIconValue,
} from "@/utils/stagebook/doc-icon";

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const GRAD_CSS: Record<string, string> = {
  sunset: "var(--ed-grad-sunset)",
  ocean: "var(--ed-grad-ocean)",
  forest: "var(--ed-grad-forest)",
  aurora: "var(--ed-grad-aurora)",
  candy: "var(--ed-grad-candy)",
  night: "var(--ed-grad-night)",
};

const dot = "h-6 w-6 rounded-full border border-base-300 transition-transform hover:scale-110";
const ringOn = "ring-2 ring-primary ring-offset-1 ring-offset-base-100";

/**
 * Seletor de ícone da página: emoji ou ícone vetorial, mais personalização de
 * fundo (cor suave/sólida, gradiente), forma e cor do ícone.
 * Cada alteração chama onChange com a string pronta para salvar.
 */
export function DocIconPicker({
  value,
  onChange,
  onClose,
}: {
  value: string | null;
  onChange: (next: string | null) => void;
  onClose: () => void;
}) {
  const current = parseDocIcon(value) ?? defaultDocIcon("emoji", "📝");
  const [tab, setTab] = useState<"emoji" | "icon">(current.kind);
  const [query, setQuery] = useState("");
  const [custom, setCustom] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora ou com Esc.
  useEffect(() => {
    const down = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!rootRef.current?.contains(t) && !t.closest("[data-icon-trigger]")) onClose();
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
    };
  }, [onClose]);

  const commit = (patch: Partial<DocIconValue>) => {
    const next: DocIconValue = { ...current, ...patch };
    // Ao escolher um fundo pela primeira vez, já aplica uma forma visível.
    if (patch.bg && current.shape === "none" && !patch.shape) next.shape = "round";
    if (patch.bg === null) next.shape = "none";
    onChange(serializeDocIcon(next));
  };

  const icons = useMemo(() => {
    const q = norm(query.trim());
    return Object.entries(ICON_CATALOG).filter(
      ([id, d]) => !q || norm(`${id} ${d.label} ${d.tags}`).includes(q),
    );
  }, [query]);

  const pickCustomEmoji = () => {
    const text = custom.trim();
    if (!text) return;
    const seg = typeof Intl !== "undefined" && "Segmenter" in Intl
      ? [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)][0]?.segment
      : [...text][0];
    if (seg) commit({ kind: "emoji", value: seg });
    setCustom("");
  };

  const hasBg = !!current.bg;
  const isPaletteBg = hasBg && !current.bg!.startsWith("g:");
  const canTint = current.kind === "icon" && (!hasBg || (isPaletteBg && current.mode === "soft"));

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-label="Escolher ícone da página"
      className="absolute left-0 top-full z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-base-300 bg-base-100 p-3 shadow-2xl"
    >
      {/* Pré-visualização */}
      <div className="mb-3 flex items-center gap-3">
        <DocIcon value={current} size={48} className="shrink-0" />
        <div className="min-w-0 flex-1 text-sm">
          <div className="font-medium">Ícone da página</div>
          <div className="truncate text-xs text-base-content/50">
            Escolha um emoji ou ícone e personalize o fundo
          </div>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-xs gap-1 text-error"
          onClick={() => {
            onChange(null);
            onClose();
          }}
        >
          <Trash2 size={12} /> Remover
        </button>
        <button type="button" className="btn btn-ghost btn-xs btn-square" aria-label="Fechar" onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      {/* Abas */}
      <div role="tablist" className="mb-2 grid grid-cols-2 gap-1 rounded-lg bg-base-200 p-1">
        {(["emoji", "icon"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-md px-2 py-1 text-sm transition-colors ${
              tab === t ? "bg-base-100 font-medium shadow-sm" : "text-base-content/60 hover:text-base-content"
            }`}
          >
            {t === "emoji" ? "Emojis" : "Ícones"}
          </button>
        ))}
      </div>

      {tab === "emoji" ? (
        <div className="max-h-52 overflow-y-auto pr-1">
          <div className="mb-2 flex gap-1">
            <input
              className="input input-xs input-bordered min-w-0 flex-1"
              placeholder="Colar outro emoji…"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && pickCustomEmoji()}
            />
            <button type="button" className="btn btn-xs" onClick={pickCustomEmoji}>
              Usar
            </button>
          </div>
          {EMOJI_GROUPS.map((g) => (
            <div key={g.label} className="mb-2">
              <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-base-content/40">
                {g.label}
              </div>
              <div className="grid grid-cols-8 gap-0.5">
                {g.items.map((e) => (
                  <button
                    key={e}
                    type="button"
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-lg hover:bg-base-200 ${
                      current.kind === "emoji" && current.value === e ? "bg-base-200" : ""
                    }`}
                    onClick={() => commit({ kind: "emoji", value: e })}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <label className="input input-sm input-bordered mb-2 flex items-center gap-2">
            <Search size={14} className="text-base-content/40" />
            <input
              className="grow"
              placeholder="Buscar ícone (ex.: equipe, código, meta)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </label>
          <div className="grid max-h-44 grid-cols-8 gap-0.5 overflow-y-auto pr-1">
            {icons.map(([id, d]) => (
              <button
                key={id}
                type="button"
                title={d.label}
                aria-label={d.label}
                className={`flex h-8 w-8 items-center justify-center rounded-md hover:bg-base-200 ${
                  current.kind === "icon" && current.value === id ? "bg-base-200 text-primary" : ""
                }`}
                onClick={() => commit({ kind: "icon", value: id })}
              >
                <d.Icon size={18} />
              </button>
            ))}
            {icons.length === 0 && (
              <div className="col-span-8 py-4 text-center text-xs text-base-content/50">
                Nenhum ícone encontrado
              </div>
            )}
          </div>
        </div>
      )}

      {/* Personalização */}
      <div className="mt-3 border-t border-base-300 pt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wide text-base-content/40">Fundo</span>
          {hasBg && (
            <div className="flex gap-1">
              {(["round", "circle"] as DocIconShape[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={current.shape === s}
                  onClick={() => commit({ shape: s })}
                  className={`btn btn-xs h-6 min-h-6 px-2 font-normal ${current.shape === s ? "btn-primary" : "btn-ghost"}`}
                >
                  {s === "round" ? "Quadrado" : "Círculo"}
                </button>
              ))}
              {isPaletteBg &&
                (["soft", "solid"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={current.mode === m}
                    onClick={() => commit({ mode: m })}
                    className={`btn btn-xs h-6 min-h-6 px-2 font-normal ${current.mode === m ? "btn-primary" : "btn-ghost"}`}
                  >
                    {m === "soft" ? "Suave" : "Sólido"}
                  </button>
                ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            title="Sem fundo"
            aria-label="Sem fundo"
            className={`${dot} flex items-center justify-center ${!hasBg ? ringOn : ""}`}
            onClick={() => commit({ bg: null })}
          >
            <X size={11} className="text-base-content/50" />
          </button>
          {SWATCHES.map((s) => (
            <button
              key={s.id}
              type="button"
              title={s.label}
              aria-label={`Fundo ${s.label}`}
              className={`${dot} ${current.bg === s.id ? ringOn : ""}`}
              style={{ background: current.mode === "solid" ? solidVar(s.id) : bgVar(s.id) }}
              onClick={() => commit({ bg: s.id })}
            />
          ))}
          {GRADIENTS.map((g) => (
            <button
              key={g.id}
              type="button"
              title={g.label}
              aria-label={`Gradiente ${g.label}`}
              className={`${dot} ${current.bg === `g:${g.id}` ? ringOn : ""}`}
              style={{ backgroundImage: GRAD_CSS[g.id] }}
              onClick={() => commit({ bg: `g:${g.id}` })}
            />
          ))}
        </div>

        {canTint && (
          <>
            <div className="mb-1.5 mt-3 text-[11px] font-medium uppercase tracking-wide text-base-content/40">
              Cor do ícone
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                aria-label="Cor automática"
                title="Automática"
                className={`${dot} flex items-center justify-center text-[10px] font-semibold ${!current.color ? ringOn : ""}`}
                onClick={() => commit({ color: null })}
              >
                A
              </button>
              {SWATCHES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  title={s.label}
                  aria-label={`Ícone ${s.label}`}
                  className={`${dot} ${current.color === s.id ? ringOn : ""}`}
                  style={{ background: textVar(s.id) }}
                  onClick={() => commit({ color: s.id })}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
