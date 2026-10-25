"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Globe2, MapPin } from "lucide-react";
import { initiatives, type Initiative } from "@/utils/institutional/roboticar";

const regions = [
  { key: "todas", label: "Todas" },
  { key: "brasil", label: "Brasil" },
  { key: "mundo", label: "Mundo" },
] as const;

const categories = ["Todas", "Competição", "Aprender", "Ferramenta", "Dados", "Comunidade"] as const;

const categoryTone: Record<Initiative["category"], string> = {
  Competição: "text-primary",
  Aprender: "text-secondary",
  Ferramenta: "text-[color-mix(in_oklab,var(--color-accent)_55%,var(--color-base-content))]",
  Dados: "text-secondary",
  Comunidade: "text-primary",
};

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function InitiativesExplorer() {
  const [region, setRegion] = useState<(typeof regions)[number]["key"]>("todas");
  const [category, setCategory] = useState<(typeof categories)[number]>("Todas");

  const list = useMemo(
    () =>
      initiatives.filter(
        (i) =>
          (region === "todas" || i.region === region) &&
          (category === "Todas" || i.category === category),
      ),
    [region, category],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="tabs tabs-box rounded-tl-xl rounded-br-xl bg-base-200/70 p-1" role="tablist" aria-label="Região">
          {regions.map((r) => (
            <button
              key={r.key}
              type="button"
              role="tab"
              aria-selected={region === r.key}
              onClick={() => setRegion(r.key)}
              className={`tab tab-sm gap-1.5 font-semibold ${region === r.key ? "tab-active" : ""}`}
            >
              {r.key === "brasil" && <MapPin size={13} />}
              {r.key === "mundo" && <Globe2 size={13} />}
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Categoria">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={`rounded-tl-md rounded-br-md border px-2.5 py-1 font-mono text-xs transition-colors ${
                category === c
                  ? "border-base-content bg-base-content text-base-100"
                  : "border-base-300 bg-base-100 text-base-content/65 hover:border-base-content/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <span className="ml-auto font-mono text-xs text-base-content/45" aria-live="polite">
          {list.length} {list.length === 1 ? "iniciativa" : "iniciativas"}
        </span>
      </div>

      {list.length === 0 ? (
        <p className="mt-10 rounded-tl-2xl rounded-br-2xl border border-dashed border-base-300 p-8 text-center text-sm text-base-content/55">
          Nenhuma iniciativa nesta combinação ainda. Que tal sugerir uma?
        </p>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((i) => (
            <li key={i.name}>
              <a
                href={i.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-base-content/30 hover:shadow-[6px_6px_0_0_var(--color-base-content)]"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125"
                />
                <div className="relative flex items-center justify-between gap-3">
                  <span className={`text-[10px] font-bold tracking-[0.18em] ${categoryTone[i.category]}`}>
                    {i.category.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-base-content/45">
                    {i.region === "brasil" ? <MapPin size={11} /> : <Globe2 size={11} />}
                    {i.region === "brasil" ? "BRASIL" : "MUNDO"}
                  </span>
                </div>
                <h3 className="relative mt-3 text-xl font-bold tracking-tight">{i.name}</h3>
                <p className="relative mt-1 text-xs text-base-content/50">{i.by}</p>
                <p className="relative mt-3 flex-1 text-sm leading-6 text-base-content/65">
                  {i.description}
                </p>
                <div className="relative mt-5 flex flex-wrap gap-1.5">
                  {i.competitions.map((c) => (
                    <span key={c} className="rounded-md bg-base-200 px-2 py-0.5 font-mono text-[11px] text-base-content/70">
                      {c}
                    </span>
                  ))}
                </div>
                <div className="relative mt-5 flex items-center justify-between border-t border-base-300 pt-4">
                  <span className="truncate font-mono text-xs text-base-content/55">{hostOf(i.url)}</span>
                  <ArrowUpRight
                    size={17}
                    className="shrink-0 text-base-content/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-base-content"
                  />
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
