"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Globe,
  GraduationCap,
  PlayCircle,
  Search,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { materials, type Kind, type Topic } from "@/utils/competitions/bastidores";

const topics: ("Todos" | Topic)[] = ["Todos", "Lógica", "Programação", "Arduino", "OBR"];
const kinds: ("Todos" | Kind)[] = ["Todos", "Livro", "Vídeo", "Curso", "Site", "Ferramenta"];

const kindStyle: Record<Kind, { icon: LucideIcon; tag: string; chip: string }> = {
  Livro: { icon: BookOpen, tag: "text-primary", chip: "bg-primary/10 text-primary" },
  Vídeo: { icon: PlayCircle, tag: "text-secondary", chip: "bg-secondary/10 text-secondary" },
  Curso: { icon: GraduationCap, tag: "text-secondary", chip: "bg-secondary/10 text-secondary" },
  Site: {
    icon: Globe,
    tag: "text-[color-mix(in_oklab,var(--color-accent)_55%,var(--color-base-content))]",
    chip: "bg-accent/20 text-[color-mix(in_oklab,var(--color-accent)_55%,var(--color-base-content))]",
  },
  Ferramenta: { icon: Wrench, tag: "text-primary", chip: "bg-primary/10 text-primary" },
};

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function LibraryExplorer() {
  const [topic, setTopic] = useState<(typeof topics)[number]>("Todos");
  const [kind, setKind] = useState<(typeof kinds)[number]>("Todos");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = norm(query.trim());
    return materials.filter(
      (m) =>
        (topic === "Todos" || m.topics.includes(topic)) &&
        (kind === "Todos" || m.kind === kind) &&
        (!q || norm(`${m.title} ${m.by} ${m.description}`).includes(q)),
    );
  }, [topic, kind, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-4 sm:p-5">
        <label className="input input-bordered flex w-full items-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md">
          <Search size={16} className="text-base-content/50" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, autor ou assunto"
            className="grow"
            aria-label="Buscar materiais"
          />
        </label>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Assunto">
            <span className="font-mono text-[10px] tracking-[0.15em] text-base-content/45">ASSUNTO</span>
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={topic === t}
                onClick={() => setTopic(t)}
                className={`rounded-tl-md rounded-br-md border px-2.5 py-1 font-mono text-xs transition-colors ${
                  topic === t
                    ? "border-base-content bg-base-content text-base-100"
                    : "border-base-300 bg-base-100 text-base-content/65 hover:border-base-content/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Formato">
            <span className="font-mono text-[10px] tracking-[0.15em] text-base-content/45">FORMATO</span>
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={kind === k}
                onClick={() => setKind(k)}
                className={`rounded-tl-md rounded-br-md border px-2.5 py-1 font-mono text-xs transition-colors ${
                  kind === k
                    ? "border-primary bg-primary text-primary-content"
                    : "border-base-300 bg-base-100 text-base-content/65 hover:border-primary/40"
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          <span className="ml-auto font-mono text-xs text-base-content/45" aria-live="polite">
            {list.length} {list.length === 1 ? "material" : "materiais"}
          </span>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="mt-8 rounded-tl-2xl rounded-br-2xl border border-dashed border-base-300 p-8 text-center text-sm text-base-content/55">
          Nada por aqui com esses filtros. Tente outra combinação ou sugira um material.
        </p>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m) => {
            const k = kindStyle[m.kind];
            const Icon = k.icon;
            return (
              <li key={m.title}>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-base-content/30 hover:shadow-[6px_6px_0_0_var(--color-base-content)]"
                >
                  <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125" />
                  <div className="relative flex items-center justify-between gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-tl-md rounded-br-md px-2 py-1 text-[10px] font-bold tracking-[0.15em] ${k.chip}`}>
                      <Icon size={12} />
                      {m.kind.toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-[10px] text-base-content/50">
                      {m.free && <span className="rounded bg-success/15 px-1.5 py-0.5 text-success">GRÁTIS</span>}
                      <span className="rounded border border-base-300 px-1.5 py-0.5">{m.lang}</span>
                    </span>
                  </div>
                  <h3 className="relative mt-4 text-lg font-bold leading-snug tracking-tight">{m.title}</h3>
                  <p className="relative mt-1 text-xs text-base-content/55">{m.by}</p>
                  <p className="relative mt-3 flex-1 text-sm leading-6 text-base-content/65">{m.description}</p>
                  <div className="relative mt-5 flex flex-wrap gap-1.5">
                    {m.topics.map((t) => (
                      <span key={t} className="rounded-md bg-base-200 px-2 py-0.5 font-mono text-[11px] text-base-content/70">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-base-300 pt-4">
                    <span className="truncate font-mono text-xs text-base-content/50">
                      {m.meta ?? new URL(m.url).hostname.replace(/^www\./, "")}
                    </span>
                    <ArrowUpRight size={17} className="shrink-0 text-base-content/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-base-content" />
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
